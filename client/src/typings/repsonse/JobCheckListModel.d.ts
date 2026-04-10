interface JobChecklistModel {
  id: number;
  name: string;
  description: string;
  remarks?: string;
  ChecklistItems: ChecklistItemModel[];
}
