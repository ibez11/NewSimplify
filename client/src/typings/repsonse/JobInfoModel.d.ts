interface JobInfoModel {
  jobsToday: { value: number; count: number };
  jobsThisWeek: { value: number; count: number };
  jobsUnAssignedToday: { count: number };
  jobsUnAssignedThisWeek: { count: number };
}
