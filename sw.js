// Prvo pokušava internet (da uvek dobije najnoviju verziju), a bez interneta koristi sačuvanu kopiju.
const KES = "beg-dub-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts."))) {
          const kopija = r.clone();
          caches.open(KES).then((c) => c.put(e.request, kopija));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
