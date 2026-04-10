interface ServiceJobModel {
  id: number;
  startDateTime: Date;
  endDateTime: Date;
  jobStatus: string;
  jobAmount: number;
  serviceItemsJob: ServiceItemModel[];
  ChecklistJob: JobChecklistModel[];
}
