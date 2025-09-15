const CACHE_NAME = 'manipal-uninav-cache-v2';
const TILES_CACHE_NAME = 'manipal-uninav-tiles-v2';

// Pre-cache essential files on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/icon-1024.png',
        'https://unpkg.com/leaflet/dist/leaflet.css',
        'https://unpkg.com/leaflet/dist/leaflet.js',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event, clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, TILES_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Handle tile requests
  if (requestUrl.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILES_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) return response;

          return fetch(event.request).then(networkResponse => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Optional: return a fallback tile image if you want
            return new Response("Tile unavailable offline");
          });
        });
      })
    );
  } else {
    // Default: cache-first with network fallback
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => {
          // Offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
    );
  }
});

// Listen for tile prefetch messages
self.addEventListener('message', (event) => {
  if (event.data.type === 'PREFETCH_TILES') {
    const { bbox, zooms } = event.data;
    const urls = buildTileURLList(bbox, zooms);
    const total = urls.length;
    let done = 0;

    event.source.postMessage({ type: 'PREFETCH_PROGRESS', done, total });

    Promise.all(
      urls.map(url => {
        return caches.open(TILES_CACHE_NAME).then(cache => {
          return fetch(url).then(response => {
            if (response.status === 200) {
              cache.put(url, response.clone());
            }
            done++;
            event.source.postMessage({ type: 'PREFETCH_PROGRESS', done, total });
          });
        });
      })
    ).then(() => {
      event.source.postMessage({ type: 'PREFETCH_DONE' });
    }).catch(err => {
      console.error('Prefetching failed:', err);
    });
  }
});

// Helpers for tile URLs
function lon2tile(lon, zoom) {
  return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
  );
}
function buildTileURLList(bbox, zooms) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const TILE_URL_TMPL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const SUBDOMAINS = ['a', 'b', 'c'];
  const urls = [];

  for (let z = zooms[0]; z <= zooms[zooms.length - 1]; z++) {
    const xMin = lon2tile(minLon, z);
    const xMax = lon2tile(maxLon, z);
    const yMin = lat2tile(maxLat, z);
    const yMax = lat2tile(minLat, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const s = SUBDOMAINS[(x + y) % SUBDOMAINS.length];
        const url = TILE_URL_TMPL
          .replace('{s}', s)
          .replace('{z}', z)
          .replace('{x}', x)
          .replace('{y}', y);
        urls.push(url);
      }
    }
  }
  return urls;
}
