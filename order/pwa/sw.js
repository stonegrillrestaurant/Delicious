// Stone Grill Order PWA SW — cache bump
const CACHE_NAME = "sg-order-v3"; // <-- bump this number next time to force refresh

// Files to cache (relative to /Delicious/order/)
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./main.js",
  "./config.js",
  "./assets/qr/gcash.png",
];

// Install: pre-cache core assets
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin static, network for others
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET and same-origin
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Cache-first for our order assets
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // Optionally cache new GETs
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
        return res;
      }).catch(() => hit); // fallback to cache if offline
    })
  );
});