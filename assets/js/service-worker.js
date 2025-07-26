const cacheName = 'stonegrill-v2';
const assets = [
  'index.html',
  'offline.html',
  'assets/css/main.css',
  'assets/img/apple-touch-icon180x180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(res => {
      return res || caches.match('offline.html');
    }))
  );
});
