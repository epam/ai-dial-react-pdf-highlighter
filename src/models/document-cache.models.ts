export interface DocumentCacheContextValue {
  /**
   * Returns a cached file when available, or invokes `loader` and caches the result.
   */
  getFile: (url: string, loader: () => Promise<Blob>) => Promise<Blob>;
  /** Clears all cached entries immediately. */
  clearCache: () => void;
}

/** Internal cache record for a loaded or in-flight document blob. */
export interface CacheEntry {
  /** In-flight loader promise used for request coalescing. */
  promise?: Promise<Blob>;
  /** Resolved blob value when loading succeeded. */
  file?: Blob;
  /** Last touch timestamp used for TTL checks and LRU ordering. */
  timestamp: number;
}
