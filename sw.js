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
                // Add your other static assets here if any
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

// Fetch handler: Cache-first strategy for tiles and fallback for others
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Only handle HTTP/HTTPS requests and not extensions etc.
    if (event.request.url.startsWith('http')) {

        // Handle tile requests using a cache-first strategy
        if (requestUrl.hostname.includes('tile.openstreetmap.org') || requestUrl.hostname.includes('basemaps.cartocdn.com')) {
            event.respondWith(
                caches.open(TILES_CACHE_NAME).then(cache => {
                    return cache.match(event.request).then(response => {
                        // Return cached tile if available
                        if (response) {
                            return response;
                        }

                        // Otherwise, fetch from network and cache for future use
                        return fetch(event.request).then(networkResponse => {
                            if (networkResponse.status === 200) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        }).catch(() => {
                            // Offline fallback: if no network and no cache, return a simple error response.
                            return new Response("Tile unavailable offline", { status: 503, statusText: "Service Unavailable" });
                        });
                    });
                })
            );
        } else {
            // Default: cache-first with network fallback for all other requests
            event.respondWith(
                caches.match(event.request).then((response) => {
                    return response || fetch(event.request).catch(() => {
                        // Offline fallback for navigation requests to the main page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
                })
            );
        }
    }
});

// Listen for tile prefetch messages from the main application
self.addEventListener('message', (event) => {
    if (event.data.type === 'PREFETCH_TILES') {
        const { bbox, zooms } = event.data;
        const tileUrls = buildTileURLList(bbox, zooms);
        const total = tileUrls.length;
        let done = 0;

        // Message to the main thread to indicate the start of prefetching
        event.source.postMessage({ type: 'PREFETCH_PROGRESS', done, total });

        Promise.all(
            tileUrls.map(url => {
                // Ensure tiles are fetched and added to the tiles cache
                return caches.open(TILES_CACHE_NAME).then(cache => {
                    return fetch(url).then(response => {
                        if (response.status === 200) {
                            cache.put(url, response.clone());
                        }
                        done++;
                        event.source.postMessage({ type: 'PREFETCH_PROGRESS', done, total });
                    }).catch(e => {
                        // Silently handle failed fetches (e.g., if a tile doesn't exist)
                        console.warn(`Failed to prefetch tile: ${url}`, e);
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
    const latRad = lat * Math.PI / 180;
    const n = Math.pow(2, zoom);
    return Math.floor(n * (1 - (Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI)) / 2);
}

function buildTileURLList(bbox, zooms) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    const TILE_URL_TMPL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const SUBDOMAINS = ['a', 'b', 'c'];
    const urls = [];

    for (const z of zooms) {
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
