export interface TimeOffBody {
  id: number;
  status: string;
  remarks?: string | null;
  startDateTime: Date;
  endDateTime: Date;
  Employees: Select[];
}
