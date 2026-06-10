// sw.js — The Standing Table service worker (v4)
// Own files: network-first. Static CDNs only: cache-first.
// API calls (Supabase or anything else): NEVER touched — straight to the network.
const CACHE = 'standing-table-v5';

// only these hosts are safe to cache-first (version-pinned static assets)
const STATIC_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (url.origin === location.origin) {
    // own files: network-first (fresh updates), cache fallback (offline)
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((m) => m || caches.match('./index.html'))
        )
    );
  } else if (STATIC_HOSTS.includes(url.hostname)) {
    // pinned static assets: cache-first
    e.respondWith(
      caches.match(e.request).then(
        (m) =>
          m ||
          fetch(e.request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy));
            }
            return res;
          })
      )
    );
  }
  // anything else (Supabase, future APIs): untouched — browser goes straight to the network
});
