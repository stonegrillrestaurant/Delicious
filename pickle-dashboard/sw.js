const CACHE_NAME = 'pickle-dashboard-v1';
const urlsToCache = [
  './',
  './index.html',
  './pickle-admin.html',
  './pwa-icon.PNG',
  './manifest.json'
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
