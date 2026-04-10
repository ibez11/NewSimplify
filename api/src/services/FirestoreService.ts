import { UserProfileResponseModel } from '../typings/ResponseFormats';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
const firestore = getFirestore('db-sync');

export const fetchUser = async (data: UserProfileResponseModel): Promise<void> => {
  const docRef = firestore
    .collection(process.env.DOMAIN.includes('local') ? 'employees_local' : process.env.DOMAIN.includes('dev') ? 'employees_dev' : 'employees')
    .doc(String(data.id));
  try {
    await docRef.set({ timestamp: Timestamp.now() });
  } catch (error) {
    throw error;
  }
};
