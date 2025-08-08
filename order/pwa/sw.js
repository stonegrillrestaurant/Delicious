const CACHE_NAME = "sg-order-v1";
const OFFLINE_URL = "offline.html";
const ASSETS = [
  "../index.html","../style.css","../main.js","../config.js",
  "../assets/icons/icon-192.png","../assets/icons/icon-512.png",
  "../assets/qr/gcash.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([OFFLINE_URL, ...ASSETS]);
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (e) => {
  e.respondWith((async () => {
    try { return await fetch(e.request); }
    catch { const cache = await caches.open(CACHE_NAME); return cache.match(e.request) || cache.match(OFFLINE_URL); }
  })());
});
