// La Chiqui League como app: guarda la página para abrirla sin conexión.
// La página va primero por la red (así siempre llega la versión del día) y, si no hay conexión, sale lo guardado.
const CACHE = 'chiqui-v1';
const BASE = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const pedido = e.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(pedido)
        .then((r) => { if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(pedido, copia)); } return r; })
        .catch(() => caches.match(pedido).then((r) => r || caches.match('./')))
    );
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(pedido).then((r) => r || fetch(pedido).then((res) => { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(pedido, copia)); return res; }))
    );
  }
});
