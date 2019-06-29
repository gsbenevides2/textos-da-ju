var CACHE_NAME = 'gsb-85';
var CACHE_FILES = [
	"/",
	"/index.html",
	"/scripts.js",
	"/styles.css",
	"/js/firebase-app.js",
	"/js/firebase-messaging.js"
];
console.log(CACHE_NAME)

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
});
 
self.addEventListener('activate', function activator(event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) {
          return key.indexOf(CACHE_NAME) !== 0;
        })
        .map(function (key) {
          return caches.delete(key);
        })
      );
    })
  );
});
 
self.addEventListener('fetch', function (evt) {
  /*if (evt.request.mode !== 'navigate') {
    return;
  }*/
  evt.respondWith(
    fetch(evt.request)
      .catch(() => {
        return caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.match('/');
          });
      })
  );
});




importScripts('/js/firebase-app.js');
importScripts('/js/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  "apiKey": "AIzaSyCoRj25llKfW8RDuNHe5kRCN-ogwCgYOJI",
  "databaseURL": "https://textos-da-ju.firebaseio.com",
  "storageBucket": "textos-da-ju.appspot.com",
  "authDomain": "textos-da-ju.firebaseapp.com",
  "messagingSenderId": "886437033630",
  "projectId": "textos-da-ju",
  "appId": "1:886437033630:web:1ae8bddbce232d02"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

 workbox.routing.registerRoute(
  /\.(?:js|css)$/,
  new workbox.strategies.StaleWhileRevalidate(),
); 

 workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  }),
); 