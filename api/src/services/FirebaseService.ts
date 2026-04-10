import firebase from '../config/firebase';

export const verifyIdToken = async (token: string): Promise<string> => {
  try {
    const verif = await firebase.auth().verifyIdToken(token);
    const { uid } = verif;
    return uid;
  } catch (error) {
    throw error;
  }
};

// eslint-disable-next-line
export const retriveUserId = async (uid: string): Promise<any> => {
  try {
    return await firebase.auth().getUser(uid);
  } catch (error) {
    throw error;
  }
};

// eslint-disable-next-line
export const customeToken = async (uid: string): Promise<any> => {
  try {
    return await firebase.auth().createCustomToken(uid);
  } catch (error) {
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteUserId = async (uid: string): Promise<any> => {
  try {
    return await firebase.auth().deleteUser(uid);
  } catch (error) {
    throw error;
  }
};
