interface FeedbackModel {
  id: number;
  feedback: string;
  rate: number;
  createdAt: string;
  jobId: number;
  Job: { Service: { Client: { name: string } } };
}
