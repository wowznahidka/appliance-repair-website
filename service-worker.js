/**
 * Minimal service worker — enables PWA installability and basic offline
 * access to the static shell of this demo site. Cache-first for same-origin
 * static assets, network passthrough for everything else (e.g. form
 * submissions, analytics, external scripts).
 */
var CACHE_NAME = "appliance-repair-demo-v4";
var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./careers.html",
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

/* ---------------------------------------------------------------------------
 * WEB PUSH (ready for Stage 2)
 * These handlers make the PWA display push notifications as soon as a push
 * backend (VAPID keys + subscription storage) is connected. Until then they
 * simply never fire — zero cost, zero risk.
 * ------------------------------------------------------------------------- */
self.addEventListener("push", function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data && event.data.text() }; }
  var title = data.title || "Appliance Repair";
  var options = {
    body: data.body || "You have an update on your service request.",
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png",
    data: { url: data.url || "./" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ("focus" in list[i]) { list[i].navigate(url); return list[i].focus(); }
      }
      return clients.openWindow(url);
    })
  );
});
