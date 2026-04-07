import {
  createContext,
  type FC,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

/** Internal cache record for a loaded or in-flight document blob. */
interface CacheEntry {
  /** In-flight loader promise used for request coalescing. */
  promise?: Promise<Blob>;
  /** Resolved blob value when loading succeeded. */
  file?: Blob;
  /** Last touch timestamp used for TTL checks and LRU ordering. */
  timestamp: number;
}

const DEFAULT_TTL_MS = 20 * 60 * 1000; // 20 minutes
const DEFAULT_MAX_ENTRIES = 20;

interface DocumentPreviewCacheContextValue {
  /**
   * Returns a cached file when available, or invokes `loader` and caches the result.
   */
  getFile: (url: string, loader: () => Promise<Blob>) => Promise<Blob>;
  /** Clears all cached entries immediately. */
  clearCache: () => void;
}

const DocumentPreviewCacheContext =
  createContext<DocumentPreviewCacheContextValue | null>(null);

interface DocumentPreviewCacheProviderProps extends PropsWithChildren {
  /** TTL in milliseconds. Default: 1 200 000 ms (20 min) */
  ttlMs?: number;
  /** Maximum number of cached entries (LRU). Default: 20 */
  maxEntries?: number;
}

/**
 * Provides blob caching for document fetches with TTL expiration and LRU eviction.
 *
 * Wrap the subtree that renders `DocumentPreview` to avoid repeated network requests
 * for frequently opened files.
 */
export const DocumentPreviewCacheProvider: FC<
  DocumentPreviewCacheProviderProps
> = ({
  children,
  ttlMs = DEFAULT_TTL_MS,
  maxEntries = DEFAULT_MAX_ENTRIES,
}) => {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const touch = useCallback((url: string, entry: CacheEntry) => {
    cacheRef.current.delete(url);
    cacheRef.current.set(url, entry);
  }, []);

  const purgeExpired = useCallback(() => {
    const now = Date.now();
    for (const [url, entry] of cacheRef.current.entries()) {
      if (entry.file && now - entry.timestamp > ttlMs) {
        cacheRef.current.delete(url);
      }
    }
  }, [ttlMs]);

  const evictLRU = useCallback(() => {
    while (cacheRef.current.size > maxEntries) {
      const oldestKey = cacheRef.current.keys().next().value;
      if (oldestKey) cacheRef.current.delete(oldestKey);
    }
  }, [maxEntries]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getFile = useCallback(
    async (url: string, loader: () => Promise<Blob>) => {
      purgeExpired();

      const cached = cacheRef.current.get(url);
      if (cached) {
        touch(url, { ...cached, timestamp: Date.now() });
        if (cached.file) {
          return cached.file;
        }
        if (cached.promise) {
          return cached.promise;
        }
      }

      const timestamp = Date.now();
      const promise = loader()
        .then((file) => {
          const entry: CacheEntry = { file, timestamp: Date.now() };
          touch(url, entry);
          evictLRU();
          return file;
        })
        .catch((err: unknown) => {
          cacheRef.current.delete(url);
          throw err;
        });

      const entry: CacheEntry = { promise, timestamp };
      touch(url, entry);
      evictLRU();
      return promise;
    },
    [evictLRU, purgeExpired, touch],
  );

  useEffect(() => () => clearCache(), [clearCache]);

  return (
    <DocumentPreviewCacheContext.Provider value={{ getFile, clearCache }}>
      {children}
    </DocumentPreviewCacheContext.Provider>
  );
};

/**
 * Returns the current document preview cache context.
 *
 * When used outside `DocumentPreviewCacheProvider`, returns `null`.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useDocumentPreviewCache = () => {
  return useContext(DocumentPreviewCacheContext);
};
