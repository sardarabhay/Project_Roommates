// Firebase Cloud Messaging Service Worker
// This handles push notifications when the app is in the background

/* eslint-env serviceworker */
/* global importScripts, firebase */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: These are PUBLIC keys, safe to include in client-side code
firebase.initializeApp({
  apiKey: 'AIzaSyAgmOssqgZPT6g2ClKMKW2z3Z6CDfAj2_0',
  authDomain: 'roommates-aa65d.firebaseapp.com',
  projectId: 'roommates-aa65d',
  storageBucket: 'roommates-aa65d.firebasestorage.app',
  messagingSenderId: '259561209333',
  appId: '1:259561209333:web:36da23ba90dbaa5c0d34bc',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'HarmonyHomes';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    tag: payload.data?.type || 'default',
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click');
  event.notification.close();

  const link = event.notification.data?.link || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already an open window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      // If no open window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});
