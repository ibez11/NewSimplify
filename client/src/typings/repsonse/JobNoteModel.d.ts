interface JobNoteModel {
  id: number;
  notes: string;
  imageUrl: string;
  isHide: boolean;
  jobId: number;
  jobNoteType: JobNoteType;
  fileType?: string;
  imageBucket?: string;
  createdAt?: Date;
  displayName?: string;
  UserProfile?: UserDetailsModel;
  Equipments?: EquipmentModel[];
  JobNoteMedia?: JobNoteMediaModel[];
}
