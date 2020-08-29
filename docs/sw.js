//sw.js: this file contains the service worker and needs to be located in the main folder because of namespace regulations

//kindly copied from https://github.com/BernoulliMath/BernoulliMath.github.io/blob/master/sw.js

var CACHE_NAME = 'TTTS_CACHE'

// urlsToCache: all crucial files absolutely needed to run the game without the server
var urlsToCache = [
  '/',
  'index.html',
  'game.html',
  'game.html?ai=true',
  'privacy.html',
  'settings.html',
  'scripts/againstai.js',
  'scripts/ai.js',
  'scripts/colortheme.js',
  'scripts/cookie.js',
  'scripts/cookienotice.js',
  'scripts/game.js',
  'scripts/localgame.js',
  'scripts/menu.js',
  'scripts/online.js',
  'scripts/settings.js',
  'css/style.css',
  'css/game.css',
  'css/menu.css',
  'css/settings.css',
  'logos/tttslogo.svg',
  'logos/tttslogo-transparent.svg',
  'manifest.json',
  'fontawesome/css/all.css',
  'fontawesome/webfonts/fa-solid-900.woff',
  'fontawesome/webfonts/fa-solid-900.woff2',
  'fontawesome/webfonts/fa-brands-400.woff',
  'fontawesome/webfonts/fa-brands-400.woff2',
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache)
      })
  )
})

self.addEventListener('fetch', function (event) {
  if (event.request.url.endsWith("/index.html")) event.request.url.replace("/index.html", "/")
  event.respondWith((async function () {
    return caches.open(CACHE_NAME).then(async function (cache) {
      return cache.match(event.request).then(function (response) {
        var fetchPromise = fetch(event.request).then(function (networkResponse) {
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        }).catch((error) => {
          //Network propably down, no need to complain
          //console.error('Error:', error)
        })
        return response || fetchPromise
      })
    })
  }()))
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key)
        }
      }))
    })
  )
  return self.clients.claim()
})
