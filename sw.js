const CACHE_NAME = 'manipal-uninav-cache-v1';
const TILES_CACHE_NAME = 'manipal-uninav-tiles-v1';

// Pre-cache essential files on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        'https://unpkg.com/leaflet/dist/leaflet.css',
        'https://unpkg.com/leaflet/dist/leaflet.js',
      ]);
    })
  );
});

// Activate event, used for cleaning up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, TILES_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event listener for handling network requests
self.addEventListener('fetch', (event) => {
  // Check if it's a tile request
  if (event.request.url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILES_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          // Return from cache if found
          if (response) {
            return response;
          }

          // Otherwise, fetch from network and cache
          return fetch(event.request).then(networkResponse => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Handle offline case (no network and not in cache)
            // You might return a fallback image here
            return new Response("Offline");
          });
        });
      })
    );
  } else {
    // For other requests, use a standard cache-first strategy
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Listen for messages from the main page to trigger tile prefetching
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

// Helper function to convert coordinates to tile URLs
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
        const url = TILE_URL_TMPL.replace('{s}', s).replace('{z}', z).replace('{x}', x).replace('{y}', y);
        urls.push(url);
      }
    }
  }
  return urls;
}
