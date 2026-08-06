const CACHE_NAME = "alkohol-tracker-v7";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./alcohols.js",
    "./storage.js",
    "./statistics.js",
    "./ui.js",
    "./records.js",
    "./form.js",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener("install", function (event) {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_FILES);
        })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function (cacheName) {
                        return cacheName !== CACHE_NAME;
                    })
                    .map(function (cacheName) {
                        return caches.delete(cacheName);
                    })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    if (
        event.request.method !== "GET" ||
        new URL(event.request.url).origin !== self.location.origin
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function (response) {
                const responseCopy = response.clone();

                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseCopy);
                });

                return response;
            })
            .catch(function () {
                return caches.match(event.request).then(function (cachedResponse) {
                    return cachedResponse || caches.match("./index.html");
                });
            })
    );
});