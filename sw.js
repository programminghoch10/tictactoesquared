//sw.js: this file contains the service worker and needs to be located in the main folder because of namespace regulations

//kindly copied from https://github.com/BernoulliMath/BernoulliMath.github.io/blob/master/sw.js

var CACHE_NAME = 'TTTS_CACHE_1';
// urlsToCache: all crucial files absolutely needed to run the game
var urlsToCache = [
    '/index.html',
    '/scripts/ai.js',
    '/scripts/colortheme.js',
    '/scripts/cookie.js',
    '/scripts/game.js',
    '/scripts/localgame.js',
    '/css/game.css',
    '/css/style.css',
    '/favicons/favicon-32x32.png',
    '/favicons/favicon-16x16.png',
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    console.log("add to cache: " + event.request.url);
    caches.open(CACHE_NAME).then(function(cache) {
            return cache.add(event.request.url);
    });
    event.respondWith((function() {
        return caches.open(CACHE_NAME).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                var fetchPromise = fetch(event.request).then(function(networkResponse) {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                return response || fetchPromise;
            })
        })
    }()));
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});