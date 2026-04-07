const CONTENT_TYPE_PDF = 'application/pdf';
const FILE_EXTENSION_PDF = '.pdf';

interface IsPdfFileParams {
  name?: string | null;
  contentType?: string | null;
}

export function isPdfFile({ name, contentType }: IsPdfFileParams): boolean {
  const normalizedName = (name ?? '').toLowerCase();
  const normalizedContentType = (contentType ?? '').toLowerCase();

  return (
    normalizedContentType === CONTENT_TYPE_PDF ||
    normalizedName.endsWith(FILE_EXTENSION_PDF)
  );
}
