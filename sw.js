const CACHE_NAME = 'absensi-karyawan-unai-v3';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './config.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k =>
            (k.startsWith('absensi-karyawan-unai-') ||
             k === 'admin-absensi-unai-v1') &&
            k !== CACHE_NAME
          )
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();

        if (new URL(event.request.url).origin === self.location.origin) {
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, copy))
            .catch(() => {});
        }

        return response;
      })
      .catch(() =>
        caches.match(event.request)
          .then(r => r || caches.match('./index.html'))
      )
  );
});
