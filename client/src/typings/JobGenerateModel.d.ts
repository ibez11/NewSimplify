interface JobGenerateModel {
  id: number;
  startDateTime: Date;
  endDateTime: Date;
  jobStatus: string;
  ServiceItems: ServiceItemModel[];
  duration?: number;
  occurance?: number;
}
