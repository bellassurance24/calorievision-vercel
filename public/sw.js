// Calorie Vision Service Worker
// Handles offline caching and fallback

const CACHE_NAME = 'calorievision-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/offline.html',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache offline page
self.addEventListener('install', (event) => {
  console.log('[sw.js] Service worker installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[sw.js] Caching offline page and assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[sw.js] Service worker activating');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[sw.js] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  event.waitUntil(clients.claim());
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[sw.js] Network failed, serving offline page');
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }
  
  // For other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.ok && event.request.url.match(/\.(png|jpg|jpeg|svg|ico|css|js)$/)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
