var CACHE_NAME = 'gsb-002';
var urlsToCache = [
  "/",
	"/index.html",
	"/js/scripts.js",
	"/css/styles.css",
	"/img/img.jpeg",
	"/404.html",
	"/__/firebase/6.0.2/firebase-app.js",
	"/__/firebase/6.0.2/firebase-auth.js",
	"/__/firebase/6.0.2/firebase-firestore.js",
	"/__/firebase/init.js",
	"/js/jquery-3.4.1.min.js",
	"/css/materialize.min.css",
	"/css/icons/material/icon.css",
	"/css/icons/material/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
	"/js/materialize.min.js"
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