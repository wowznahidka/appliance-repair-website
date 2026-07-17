/**
 * Minimal service worker — enables PWA installability and basic offline
 * access to the static shell of this demo site. Cache-first for same-origin
 * static assets, network passthrough for everything else (e.g. form
 * submissions, analytics, external scripts).
 */
var CACHE_NAME = "appliance-repair-demo-v1";
var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./config.js",
  "./privacy.html",
  "./terms.html",
  "./manifest.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  // Only handle same-origin GET requests; let everything else (POST form
  // submissions, third-party analytics/pixel scripts, cross-origin calls)
  // pass straight through to the network.
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      var networkFetch = fetch(request)
        .then(function (response) {
          if (response && response.status === 200) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(function () {
          return cached;
        });
      return cached || networkFetch;
    })
  );
});
