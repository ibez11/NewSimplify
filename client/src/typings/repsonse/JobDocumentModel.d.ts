interface JobDocumentModel {
  id: number;
  notes: string;
  documentUrl: string;
  isHide?: boolean;
  jobId?: number;
  documentBucket?: string;
}
