const CACHE_NAME = "alkohol-tracker-v5";

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
        Promise.all([
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
            }),
            self.clients.claim()
        ])
    );
});

self.addEventListener("fetch", function (event) {
    if (event.request.mode === "navigate") {
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
                    return caches.match("./index.html");
                })
        );

        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (cachedResponse) {
            return (
                cachedResponse ||
                fetch(event.request).then(function (response) {
                    const responseCopy = response.clone();

                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, responseCopy);
                    });

                    return response;
                })
            );
        })
    );
});