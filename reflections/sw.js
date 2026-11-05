// Reflections: cache only this app, never another app's files or streaming audio.
const STATIC_CACHE = "reflections-static-v2.0.1";
const RUNTIME_CACHE = "reflections-runtime-v2.0.1";
const OWNED_PREFIXES = ["reflections-static-", "reflections-runtime-"];
const APP_PATH = "/reflections/";
const OFFLINE_URL = "/reflections/offline.html";
const CORE_ASSETS = [
  "/reflections/",
  "/reflections/index.html",
  "/reflections/manifest.json?v=5",
  "/reflections/assets/icons/apple-touch-icon-180x180.png",
  "/reflections/assets/icons/icon-192x192.png",
  "/reflections/assets/icons/icon-512x512.png",
  "/reflections/assets/icons/favicon.ico",
  "/reflections/assets/reflections.css?v=12",
  "/reflections/assets/audio-system.js?v=12",
  "/reflections/offline.html"
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(CORE_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([STATIC_CACHE, RUNTIME_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => OWNED_PREFIXES.some(prefix => key.startsWith(prefix)) && !keep.has(key))
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function cachedResponse(request) {
  for (const name of [RUNTIME_CACHE, STATIC_CACHE]) {
    const cache = await caches.open(name);
    const response = await cache.match(request);
    if (response) return response;
  }
}

async function remember(request, response) {
  // Cache.put rejects partial media responses. Never store errors or opaque responses.
  if (!response.ok || response.status === 206 || response.type === 'opaque') return;
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  } catch (_) {
    // Quota or storage restrictions must not prevent a successful network response.
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.pathname.startsWith(APP_PATH) || request.cache === 'no-store') return;

  // Let the browser handle Range requests and media streaming directly. This also
  // avoids caching whole MP3 files merely because somebody starts listening.
  if (request.headers.has('range') || ['audio', 'video'].includes(request.destination) ||
      /\.(mp3|m4a|mp4|ogg|webm|pdf)$/i.test(url.pathname)) return;

  const navigation = request.mode === 'navigate' || request.destination === 'document';
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      event.waitUntil(remember(request, response));
      return response;
    } catch (_) {
      const cached = await cachedResponse(request);
      if (cached) return cached;
      if (navigation) {
        const shell = await cachedResponse(OFFLINE_URL);
        if (shell) return shell;
        return new Response('You are offline. Reconnect and reopen this page.', {
          status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
      // Do not send HTML in place of missing images, scripts, or stylesheets.
      return Response.error();
    }
  })());
});
