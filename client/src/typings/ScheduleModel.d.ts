interface ScheduleModel {
  id?: number;
  startDateTime?: Date | null;
  endDateTime?: Date | null;
  repeatType: string;
  repeatEvery: number;
  repeatOnDate: number;
  repeatOnDay: string;
  repeatOnWeek: number;
  repeatOnMonth: number;
  repeatEndType: string;
  repeatEndAfter: number;
  repeatEndOnDate: Date;
  ServiceItems: ServiceItemModel[];
  hour?: number;
  minute?: number;
  scheduleLabel?: string;
}
