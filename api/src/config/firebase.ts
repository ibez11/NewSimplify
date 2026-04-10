import * as admin from 'firebase-admin';

import firebaseAccountCredentials from '../constants/FirebaseAccount';

const serviceAccount = firebaseAccountCredentials as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.projectId,
    clientEmail: serviceAccount.clientEmail,
    privateKey: serviceAccount.privateKey
  }),
  databaseURL: 'https://simplify-driver-app.firebaseio.com'
});

export default admin;
