self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('Service Worker instalado');
});

self.addEventListener('activate', event => {
  console.log('Service Worker activo');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});