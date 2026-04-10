interface ChecklistTemplateModel {
  id: number;
  name: string;
  description: string;
  remarks?: string;
  ChecklistItems: ChecklistItemModel[];
  new?: boolean;
}
