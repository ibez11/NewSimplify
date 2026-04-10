interface ServiceItemModel {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmt?: number;
  idQboWithGST?: number;
  IdQboWithoutGST?: number;
  new?: boolean;
  serviceId?: number;
  scheduleId?: number;
  scheduleIndex?: number;
  isDeleted?: boolean;
  isNew?: boolean;
  Equipments?: EquipmentModel[];
}
