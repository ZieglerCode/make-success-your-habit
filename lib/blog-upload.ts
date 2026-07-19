export type UploadedMedia = {
  alt: string;
  mimeType: string;
  url: string;
};

type CoverDraft = {
  coverAlt: string;
  coverImage: string;
};

export function applyUploadedCover<T extends CoverDraft>(draft: T, upload: UploadedMedia): T {
  return {
    ...draft,
    coverAlt: upload.alt.trim() || draft.coverAlt,
    coverImage: upload.url,
  };
}
