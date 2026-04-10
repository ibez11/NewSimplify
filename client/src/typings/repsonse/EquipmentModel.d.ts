interface EquipmentModel {
  id: number;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  notes: string;
  dateWorkDone: Date;
  remarks: string | null;
  serviceAddressId: number;
  updatedBy: string;
  address: string;
  displayName: string;
  isActive: boolean;
  isMain: boolean;
  mainId?: number;
  isNew?: booelan;
  SubEquipments?: EquipmentModel[];
  index?: number;
  description?: string; // Optional field for additional information
  clientId?: number;
  clientName?: string; // Optional field for client name
  createdAt?: Date; // Optional field for creation date
  warrantyStartDate?: Date | null; // Optional field for warranty start date
  warrantyEndDate?: Date | null; // Optional field for warranty end date
}
