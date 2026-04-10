import JobNoteMedia from '../../database/models/JobNoteMedia';
import Equipment from '../../database/models/Equipment';

export interface JobNoteBody {
  notes: string;
  jobNoteType?: string;
  jobId: number;
  equipmentId?: number;
  createdBy?: number;
  JobNoteMedia?: JobNoteMedia[];
  equipmentIds?: number[];
  isHide?: boolean;
  location?: string;
}
