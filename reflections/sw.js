/* Reflections SW — cache+offline, Ninox 2025 */
const VERSION = 'v2.0.0-2025-11-01';
const STATIC_CACHE = `reflections-static-${VERSION}`;
const RUNTIME_CACHE = `reflections-runtime-${VERSION}`;

const APP_SHELL_URL = '/reflections/index.html';
const OFFLINE_URL = '/reflections/offline.html';
const PLACEHOLDER_IMAGE_URL = '/reflections/assets/placeholder.jpg';

const CORE_ASSETS = [
  // App shell
  '/reflections/',
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
  PLACEHOLDER_IMAGE_URL,

  // Offline fallback
  OFFLINE_URL
];

// INSTALL: pre-cache core assets (app shell, offline page, icons, etc.)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting(); // take control ASAP after install
});

// ACTIVATE: clean up old caches
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

// MAIN FETCH HANDLER
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1) Pages / navigations: app shell + offline handling
  if (isHTMLNavigation(request)) {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2) CSS/JS/Fonts: stale-while-revalidate
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // 3) Images/Audio/PDFs: cache-first with placeholder for images
  if (isMedia(request)) {
    event.respondWith(handleMedia(request));
    return;
  }

  // 4) Default: network-first, fallback to cache, then offline shell (as last resort)
  event.respondWith(handleDefault(request));
});

// ---- HANDLERS ----

// HTML pages / navigations
async function handleNavigation(request) {
  try {
    // Try real network first for fresh data
    const networkResponse = await fetch(request);
    const runtimeCache = await caches.open(RUNTIME_CACHE);
    runtimeCache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    // 1) Try an exact cached match (maybe previously cached)
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;

    // 2) Fallback to app shell (SPA: this is what lets your reflection page work offline)
    const shell = await caches.match(APP_SHELL_URL);
    if (shell) return shell;

    // 3) Fallback to offline page
    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;

    // 4) Absolute last fallback
    return new Response('Offline and no shell/offline page available.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// CSS/JS/fonts: stale-while-revalidate
async function handleStaticAsset(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((res) => {
      cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  // If we have cache, return it immediately; otherwise wait for network
  return cached || networkPromise || fetch(request);
}

// Images / audio / PDFs: cache-first, with placeholder image if offline
async function handleMedia(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    // If image missing offline, show placeholder
    if (request.destination === 'image') {
      const ph = await caches.match(PLACEHOLDER_IMAGE_URL);
      if (ph) return ph;
    }
    throw err;
  }
}

// Default fallback: network-first with cache + offline shell backup
async function handleDefault(request) {
  try {
    return await fetch(request);
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // As last resort for navigations, return app shell or offline page
    if (request.mode === 'navigate') {
      const shell = await caches.match(APP_SHELL_URL);
      if (shell) return shell;

      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
    }

    return new Response('Offline and no cached response.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}