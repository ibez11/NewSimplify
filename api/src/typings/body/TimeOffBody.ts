export interface TimeOffBody {
  id: number;
  status: string;
  remarks?: string;
  startDateTime: string;
  endDateTime: string;
  Employees?: UserProfile[];
}
export interface UserProfile {
  id?: number;
  displayName?: string;
}
export interface TimeOffEmployeeBody {
  timeOffId: number;
  userId: number;
}
