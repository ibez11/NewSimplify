/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// eslint-disable-next-line no-restricted-globals
self.addEventListener('notificationclick', function(event, payload) {
  event.notification.close();
  console.debug('SW notification click event', event);
  const url = event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: 'AIzaSyAQQ9fM4SLcRhd648pLUVeKfKiYu7n8-8s',
  authDomain: 'simplify-driver-app.firebaseapp.com',
  databaseURL: 'https://simplify-driver-app.firebaseio.com',
  projectId: 'simplify-driver-app',
  storageBucket: 'simplify-driver-app.appspot.com',
  messagingSenderId: '294344896773',
  appId: '1:294344896773:web:30f1cb5542e63412a2476c',
  measurementId: 'G-9S7QEJ7WMQ'
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/favicon.png',
    data: { url: payload.data.url }
  };

  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(notificationTitle, notificationOptions);
});
