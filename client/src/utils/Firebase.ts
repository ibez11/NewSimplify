import * as firebase from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics, logEvent } from 'firebase/analytics';

const config = {
  apiKey: 'AIzaSyAQQ9fM4SLcRhd648pLUVeKfKiYu7n8-8s',
  authDomain: 'simplify-driver-app.firebaseapp.com',
  databaseURL: 'https://simplify-driver-app.firebaseio.com',
  projectId: 'simplify-driver-app',
  storageBucket: 'simplify-driver-app.appspot.com',
  messagingSenderId: '294344896773',
  appId: '1:294344896773:web:30f1cb5542e63412a2476c',
  measurementId: 'G-9S7QEJ7WMQ'
};

firebase.initializeApp(config);

const messaging = getMessaging();

export const requestForToken = async () => {
  const vapidKey = 'BEksUQ7fy7p6Nk7O4OPAspGBJ9ChhrUgaM0ag9AZovtPrn26lj9qtkfaBqMJr4g31AYMUTjL0dBz_tRZ0yo8_Lk';
  try {
    const currentToken = await getToken(messaging, { vapidKey });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('no registration token available. Please request token.');
    }
  } catch (err) {
    console.log('error occured while retrieving token.', err);
  }
};

export const onMessageListener = () =>
  new Promise(resolve => {
    onMessage(messaging, payload => {
      resolve(payload);
    });
  });

const analytics = getAnalytics();

export const CreateLogEvent = (eventName: string, currentUser: CurrentUser) => {
  const { id, displayName, tenant } = currentUser!;

  logEvent(analytics, `web_${eventName}_${process.env.NODE_ENV}`, {
    sim_employeeId: id,
    sim_employeeName: displayName,
    sim_employeeTenant: tenant
  });
};

export default firebase;
