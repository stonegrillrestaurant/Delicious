// Audio Player: cache only this app, never another app's files or streaming audio.
const STATIC_CACHE = "ninox-audio-player-static-v4";
const RUNTIME_CACHE = "ninox-audio-player-runtime-v4";
const OWNED_PREFIXES = ["ninox-audio-player-"];
const APP_PATH = "/audio-player/";
const OFFLINE_URL = "/audio-player/";
const CORE_ASSETS = [
  "/audio-player/",
  "/audio-player/manifest.webmanifest",
  "/audio-player/icon-192.png",
  "/audio-player/icon-512.png",
  "/audio-player/icon-152x152.png"
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
