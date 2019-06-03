var CACHE_NAME = 'gsb-001';
var urlsToCache = [
	"/",
	"/index.html",
	"/result.js",
	"/result.css",
	"/__/firebase/6.0.2/firebase-app.js",
	"/__/firebase/6.0.2/firebase-auth.js",
	"/__/firebase/6.0.2/firebase-firestore.js",
	"/__/firebase/init.js"
];

var arquivosParaCache = urlsToCache
self.addEventListener("install", function(a) {
    a.waitUntil(caches.open(CACHE_NAME).then(function(a) {
        return a.addAll(arquivosParaCache)
    }))
}), self.addEventListener("activate", function(a) {
    a.waitUntil(caches.keys().then(function(a) {
        return Promise.all(a.filter(function(a) {
            return 0 !== a.indexOf(CACHE_NAME)
        }).map(function(a) {
            return caches.delete(a)
        }))
    }))
}), self.addEventListener("fetch", function(a) {
    "navigate" !== a.request.mode || a.respondWith(fetch(a.request).catch(() => caches.open(CACHE_NAME).then(a => a.match("/index.html"))))
});