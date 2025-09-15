importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

// The correct offline fallback page name.
const offlineFallbackPage = "offline.html";

// This listener handles a message from the main page to skip the waiting phase,
// which is useful for updating the service worker immediately.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// During the install phase, the service worker caches the offline fallback page.
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

// Enables navigation preload if it's supported by the browser. This allows the browser
// to start fetching a navigation request in parallel with the service worker starting up.
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// The fetch event listener intercepts network requests.
self.addEventListener('fetch', (event) => {
  // Check if the request is a navigation request (i.e., a new page load).
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Try to use the preloaded response if available.
        const preloadResp = await event.preloadResponse;
        if (preloadResp) {
          return preloadResp;
        }

        // Otherwise, try to get the response from the network.
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        // If the network request fails (e.g., user is offline),
        // serve the cached offline fallback page.
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});
