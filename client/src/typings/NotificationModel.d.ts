interface NotificationModel {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  jobId: number;
  createdAt: string;
  updatedAt: string;
  resolvedBy?: string;
}
