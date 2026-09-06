self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('absensi-karyawan-unai-')).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/absensi-klinik-unai/karyawan')) {
      event.respondWith(Response.redirect('/absensi-klinik-unai/', 302));
    }
  }
});
