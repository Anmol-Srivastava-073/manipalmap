/* sw.js: Service Worker for MUJ Uninav offline tiles */

const APP_SHELL_CACHE = 'uninav-app-v1';
const TILE_CACHE       = 'uninav-tiles-v1';

// Adjust these to include your app shell assets you want available offline.
const APP_SHELL = [
  '/',                // if served from root; otherwise remove or set to your index path
  '/index.html',      // update if your filename/path differs
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js',
];

// Basic install: cache the app shell (optional but nice)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(cache => cache.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean old caches if names changed
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => ![APP_SHELL_CACHE, TILE_CACHE].includes(k))
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Helper: is this request a tile?
function isTileRequest(req) {
  const url = new URL(req.url);
  return /tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(url.pathname) ||
         /\/tiles\/\d+\/\d+\/\d+\.png$/.test(url.pathname);
}

// Runtime caching strategy:
// 1) For tiles -> Cache-first, then network fallback.
// 2) For everything else -> Network-first, then cache fallback (optional).
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (isTileRequest(req)) {
    event.respondWith(cacheFirstTiles(req));
  } else {
    event.respondWith(networkFirst(req));
  }
});

async function cacheFirstTiles(req) {
  const cache = await caches.open(TILE_CACHE);

  // Try cache
  const cached = await cache.match(req, { ignoreSearch: true });
  if (cached) return cached;

  // Else fetch from network and cache
  try {
    const resp = await fetch(req, { mode: 'cors' });
    // clone and store (opaque responses can still be cached)
    cache.put(req, resp.clone());
    return resp;
  } catch (err) {
    // Optional: return a tiny transparent PNG as fallback
    return new Response(new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,12,73,68,65,84,120,156,99,96,0,0,0,2,0,1,226,33,189,167,0,0,0,0,73,69,78,68,174,66,96,130]), {
      headers: { 'Content-Type': 'image/png' },
      status: 200
    });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(APP_SHELL_CACHE);
  try {
    const resp = await fetch(req);
    // Cache a copy for next time (optional)
    cache.put(req, resp.clone());
    return resp;
  } catch (err) {
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    // Last resort: a generic response or an offline page could go here
    return new Response('Offline and not cached.', { status: 503 });
  }
}

// Message channel: prefetch or clear tiles on demand
self.addEventListener('message', async (event) => {
  const data = event.data || {};
  
  if (data.type === 'PREFETCH_TILES' && Array.isArray(data.urls)) {
  const cache = await caches.open(TILE_CACHE);
  const total = data.urls.length;
  let done = 0;

  for (const url of data.urls) {
    try {
      const req = new Request(url, { mode: 'cors' });
      const already = await cache.match(req, { ignoreSearch: true });
      if (!already) {
        const resp = await fetch(req);
        await cache.put(req, resp.clone());
        await new Promise(r => setTimeout(r, 50));
      }
    } catch (e) {}
    done++;
    notifyAllClients({ type: 'PREFETCH_PROGRESS', done, total });
  }

  notifyAllClients({ type: 'PREFETCH_DONE' });
}

  if (data.type === 'CLEAR_TILE_CACHE') {
    await caches.delete(TILE_CACHE);
    await caches.open(TILE_CACHE); // recreate empty cache
    notifyAllClients({ type: 'TILES_CLEARED' });
  }
});

async function notifyAllClients(message) {
  const clientsArr = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of clientsArr) {
    client.postMessage(message);
  }
}
