interface CSVEquipmentModel {
  id: number;
  brand: string;
  model: string;
  serialNumber: string;
  serviceAddress: string;
  location: string;
  dateWorkDone: string;
  displayName?: string;
  type?: string;
  clientName?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  description?: string; // Optional field for additional information
}
