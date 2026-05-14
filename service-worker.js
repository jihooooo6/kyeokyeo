/* 켜켜 서비스 워커 - 정적 자원 캐싱 */
const CACHE_VERSION = 'kyeokyeo-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/screens.css',
  './js/vendor/lottie.min.js',
  './assets/lottie/kyeokyeo-logo.json',
  './js/app.js',
  './js/router.js',
  './js/storage.js',
  './js/media-storage.js',
  './js/url-storage.js',
  './js/date-utils.js',
  './js/components/bottom-sheet.js',
  './js/components/date-picker.js',
  './js/components/link-edit-sheet.js',
  './js/screens/launch.js',
  './js/screens/home.js',
  './js/screens/memo-list.js',
  './js/screens/memo-detail.js',
  './js/screens/memo-new.js',
  './js/screens/scene-list.js',
  './js/screens/scene-detail.js',
  './js/screens/scene-new.js',
  './js/screens/link-list.js',
  './js/screens/link-detail.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
        return res;
      }).catch(() => cached);
    })
  );
});
