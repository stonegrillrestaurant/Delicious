/* =========================================================================
   Stone Grill — Service Worker (sg-order-v9)
   - Cache-first for our local assets
   - BYPASS ad/analytics/pixel hosts (no SW cache)
   ========================================================================= */

const CACHE_NAME = "sg-order-v9"; // UPDATED: bump when you update files

// Files to cache (relative to /Delicious/order/)
const ASSETS = [
  "./",                 // root of order pages
  "./index.html",
  "./style.css",
  "./main.js",
  "./config.js",
  "./assets/qr/gcash.png", // GCash QR image
];

/* --- NEW: Ad/Analytics bypass list (no caching through SW) --- */
const BYPASS_HOSTS = [
  "pagead2.googlesyndication.com",
  "googleads.g.doubleclick.net",
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "connect.facebook.net",
  "www.facebook.com"
];

/* Install: Pre-cache core assets */
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => {
        // ignore install errors (e.g., offline during install)
      })
  );
});

/* Activate: Clean old caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
      )
      .then(() => self.clients.claim())
  );
});

/* Fetch: Cache-first for our files, network for others
   + Bypass ad/analytics/pixel hosts
*/
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== "GET") return;

  // --- BYPASS: never intercept ad/analytics/pixel hosts (works for any page) ---
  if (BYPASS_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(fetch(req)); // always go to network
    return;
  }

  // Only cache same-origin requests (our own files under stonegrillresto.net)
  if (url.origin !== self.location.origin) return;

  // Cache-first strategy for local assets
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit; // return cached if found

      // Not cached: fetch from network and store a copy (best-effort)
      return fetch(req)
        .then((res) => {
          // Skip opaque/error responses
          if (!res || res.status !== 200 || res.type !== "basic") return res;

          const resClone = res.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(req, resClone))
            .catch(() => { /* ignore put errors */ });

          return res;
        })
        .catch(() => hit); // fallback to cache if offline (if we had a hit)
    })
  );
});
