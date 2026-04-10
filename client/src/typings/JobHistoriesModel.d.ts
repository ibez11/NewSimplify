interface JobHistoriesModel {
  id: number;
  jobId: number;
  userProfileId: number;
  jobStatus: string;
  location: string;
  dateTime: Date;
  UserProfile: UserDetailsModel[];
}
