const CACHE_NAME = 'pickle-dashboard-v1';
const urlsToCache = [
  './',
  './index.html',
  './admin.html',
  '/pickle-dashboard/pwa-icon.PNG'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

