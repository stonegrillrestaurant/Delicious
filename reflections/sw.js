/* Reflections SW — cache+offline, Ninox 2025 */
const VERSION = 'v2.0.0-2025-11-01';
const STATIC_CACHE = `reflections-static-${VERSION}`;
const RUNTIME_CACHE = `reflections-runtime-${VERSION}`;

const CORE_ASSETS = [
  // App shell
  '/reflections/index.html',
  '/reflections/manifest.json?v=2',

  // Icons / favicons
  '/reflections/icon-180.png',
  '/reflections/assets/reflections-icon-192.png',
  '/reflections/assets/reflections-icon-512.png',
  '/reflections/assets/favicon.ico',

  // UI assets
  '/reflections/assets/reflections.css?v=12',
  '/reflections/assets/audio-system.js?v=12',
  '/reflections/assets/placeholder.jpg',

  // Offline fallback
  '/reflections/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting(); // take control ASAP after install
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // start controlling open pages immediately
});

// Utility: request classifier
const isHTMLNavigation = (req) =>
  req.mode === 'navigate' ||
  (req.destination === 'document' && req.method === 'GET');

const isStaticAsset = (req) =>
  ['style', 'script', 'font'].includes(req.destination);

const isMedia = (req) =>
  ['image', 'audio', 'video'].includes(req.destination) ||
  req.url.endsWith('.png') || req.url.endsWith('.jpg') || req.url.endsWith('.jpeg') ||
  req.url.endsWith('.svg') || req.url.endsWith('.webp') ||
  req.url.endsWith('.mp3') || req.url.endsWith('.pdf');

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1) Pages: Network-first (fresh content), fallback to cache, then offline page
  if (isHTMLNavigation(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          const cacheMatch = await caches.match(request, { ignoreSearch: true });
          if (cacheMatch) return cacheMatch;
          return caches.match('/reflections/offline.html');
        }
      })()
    );
    return;
  }

  // 2) CSS/JS/Fonts: Stale-while-revalidate
  if (isStaticAsset(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((res) => {
            cache.put(request, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || networkPromise || fetch(request);
      })()
    );
    return;
  }

  // 3) Images/Audio/PDFs: Cache-first (fast + offline)
  if (isMedia(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          // If image missing offline, show placeholder; otherwise rethrow
          if (request.destination === 'image') {
            const ph = await caches.match('/reflections/assets/placeholder.jpg');
            if (ph) return ph;
          }
          throw err;
        }
      })()
    );
    return;
  }

  // Default: try network, fall back to cache
  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        // As last resort for navigations, return offline page
        if (request.mode === 'navigate') {
          return caches.match('/reflections/offline.html');
        }
        throw new Error('No cache match and network failed');
      }
    })()
  );
});
