// Firebase Messaging Service Worker
// This service worker handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

let firebaseConfig = null;
let isInitialized = false;

// Listen for config from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    console.log('[firebase-messaging-sw.js] Received Firebase config');
    firebaseConfig = event.data.config;
    initializeFirebase();
  }
});

function initializeFirebase() {
  if (isInitialized || !firebaseConfig || !firebaseConfig.projectId) {
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message:', payload);

      const notificationTitle = payload.notification?.title || 'CalorieVision';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: payload.data?.tag || 'default',
        data: payload.data,
        requireInteraction: false,
        silent: false,
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
    });

    isInitialized = true;
    console.log('[firebase-messaging-sw.js] Firebase initialized successfully');
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Failed to initialize Firebase:', error);
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  // Handle click action
  const clickAction = event.notification.data?.click_action || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});

// Handle push event (fallback for when messaging doesn't handle it)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    console.log('[firebase-messaging-sw.js] Push event received:', payload);

    // Show notification directly if Firebase hasn't handled it
    const title = payload.notification?.title || payload.data?.title || 'CalorieVision';
    const options = {
      body: payload.notification?.body || payload.data?.body || 'You have a new notification',
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: payload.data || {},
      tag: payload.data?.tag || 'default',
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling push event:', error);
  }
});

// Activate immediately
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  event.waitUntil(clients.claim());
});

// Install immediately  
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting();
});
