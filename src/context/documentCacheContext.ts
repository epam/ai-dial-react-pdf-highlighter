import { createContext } from 'react';

import type { DocumentCacheContextValue } from '@/models/document-cache.models';

export const DocumentPreviewCacheContext =
  createContext<DocumentCacheContextValue | null>(null);
