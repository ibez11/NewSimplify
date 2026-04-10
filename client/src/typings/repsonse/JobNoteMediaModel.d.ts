interface JobNoteMediaModel {
  id: number;
  jobNoteId: number;
  fileName: string;
  fileType: string;
  imageUrl?: string;
  imageData?: any;
  fileExtension?: string;
  preSignedUrl?: string;
}
