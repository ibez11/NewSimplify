import * as OneMapService from '../services/OneMapService';

export interface AddressOption {
  id: number;
  name: string;
  value: string;
  tempValue: string;
}

export const getAddressFromPostalCode = async (postalCode: string): Promise<AddressOption[]> => {
  try {
    if (!postalCode || postalCode.trim() === '') {
      return [];
    }

    const results = await OneMapService.searchAddress(postalCode);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((result: any) => ({
      id: result.id,
      name: result.name,
      value: result.value,
      tempValue: result.tempValue
    }));
  } catch (error) {
    console.error('Error fetching address from postal code:', error);
    return [];
  }
};

export const formatAddress = (address: AddressOption): string => {
  return address.name;
};

export const combineAddress = (street: string, floorNo: string, unitNo: string, postalCode: string): string => {
  const parts = [street];
  if (floorNo) parts.push(`#${floorNo}-${unitNo}`);
  if (postalCode) parts.push(postalCode);
  return parts.filter(Boolean).join(', ');
};
