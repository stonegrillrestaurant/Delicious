const CACHE_NAME = "sg-order-v8"; // bump number when you update files

// Files to cache (relative to /Delicious/order/)
const ASSETS = [
  "./", // root of order pages
  "./index.html",
  "./style.css",
  "./main.js",
  "./config.js",
  "./assets/qr/gcash.png", // GCash QR image
];

// Install: Pre-cache core assets
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate new SW immediately
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => {
        // ignore errors (e.g., offline during install)
      })
  );
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache-first for our files, network for others
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET and same-origin requests
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Cache-first strategy
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit; // return cached if found

      // If not cached, fetch from network and store a copy
      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(req, resClone))
            .catch(() => {});
          return res;
        })
        .catch(() => hit); // fallback to cache if offline
    })
  );
});