import { useContext } from 'react';

import { DocumentPreviewCacheContext } from '@/context/documentCacheContext';

/**
 * Returns the current document preview cache context.
 *
 * When used outside `DocumentPreviewCacheProvider`, returns `null`.
 */
export const useDocumentPreviewCache = () => {
  return useContext(DocumentPreviewCacheContext);
};
