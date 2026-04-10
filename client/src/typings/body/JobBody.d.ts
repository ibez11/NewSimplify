export interface JobBody {
  jobId: number;
  jobStatus: string;
  clientName: string;
  serviceAddress: string;
  postalCode: string;
  selectedEmployees: Select[];
  selectedVehicles: Select[];
  startDateTime: Date | string;
  endDateTime: Date | string;
  JobLabels: JobLabelModel[];
  remarks?: string;
  Skills?: any[];
}
