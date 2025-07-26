const cacheName = 'stonegrill-cache-v1';
const assets = [
  '/',
  '/delicious/index.html',
  '/assets/img/menuF.jpg',
  '/assets/img/menu-2.png',
  '/assets/img/apple-touch-icon180x180.png',
  '/assets/img/favicon-32x32.png',
  '/assets/img/favicon-16x16.png',
  '/site.webmanifest'
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Fetch
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
