self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('pwa-cache').then(function(cache) {
      return cache.addAll([
        '/',
        'index.html',
        'icon/apple-touch-icon.png',
        'icon/favicon.ico',
        'icon/icon-192-maskable.png',
        'icon/icon-192.png',
        'icon/icon-512-maskable.png',
        'icon/icon-512.png',
        'icon/logo_512.png',
        'icon/logo_circle_512.png',
        'icon/logo.svg',
      ]).catch(function(error) {
        console.error('Failed to cache resources:', error);
      });
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
