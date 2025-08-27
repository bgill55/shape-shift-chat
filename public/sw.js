const CACHE_NAME = 'shape-shift-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/shapeshift_pwa.jpg',
  '/assets/X_large_image.png',
  '/assets/android/android-launchericon-48-48.png',
  '/assets/android/android-launchericon-72-72.png',
  '/assets/android/android-launchericon-96-96.png',
  '/assets/android/android-launchericon-144-144.png',
  '/assets/android/android-launchericon-192-192.png',
  '/assets/android/android-launchericon-512-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
