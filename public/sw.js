const VERSION = 'flipbook-trace-v1.0.14-__BUILD_HASH__';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = [
  '/', '/demo', '/privacy', '/terms', '/offline.html', '/manifest.webmanifest',
  '/favicon.svg', '__APP_JS__', '__APP_CSS__', __APP_MODULES__,
  '/assets/hero-worktable-640.webp', '/assets/hero-worktable.webp',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => Promise.all(PRECACHE.map(async (url) => {
    const response = await fetch(url, { cache: 'reload' });
    if (!response.ok) throw new Error(`Could not cache ${url}`);
    await cache.put(url, response);
  }))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const cacheKey = url.pathname;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(RUNTIME).then((cache) => cache.put(cacheKey, copy));
      return response;
    }).catch(async () => (await caches.match(cacheKey)) || (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(cacheKey).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(RUNTIME).then((cache) => cache.put(cacheKey, response.clone()));
    return response;
  })));
});
