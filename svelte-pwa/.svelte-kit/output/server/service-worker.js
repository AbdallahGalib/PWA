const CACHE_NAME = "svelte-pwa-v1";
const LOCATION_SYNC_TAG = "location-sync";
const PERIODIC_SYNC_TAG = "periodic-geofence-check";
const DB_NAME = "GeofenceDB";
const STORE_NAME = "locationUpdates";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/vite.svg",
  "/assets/main-4xXvW1dQ.css",
  "/assets/main-CJFkDncB.js",
  "/assets/spritesheet-DpIxuf5L.svg"
];
function openDB() {
  return new Promise((resolve, reject) => {
    if (!indexedDB) {
      reject(new Error("IndexedDB is not supported in this context"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "timestamp" });
      }
    };
  });
}
async function storeLocationUpdate(location2) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.add({
      timestamp: (/* @__PURE__ */ new Date()).getTime(),
      location: location2
    });
  } catch (error) {
    console.warn("Failed to store location update:", error);
  }
}
async function processStoredLocations() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const locations = await store.getAll();
  for (const location2 of locations) {
    try {
      const clients2 = await self.clients.matchAll();
      clients2.forEach((client) => {
        client.postMessage({
          type: "location-update",
          location: location2
        });
      });
      if (location2.isInsideGeofence) {
        await showNotification("Geofence Alert", {
          body: `You are inside the geofence: ${location2.geofenceName}`,
          icon: "/vite.svg",
          badge: "/vite.svg",
          data: { location: location2 }
        });
      }
      await store.delete(location2.timestamp);
    } catch (error) {
      console.error("Error processing location:", error);
    }
  }
}
async function showNotification(title, options) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await self.registration.showNotification(title, options);
    }
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      if (event.request.method !== "GET") {
        return fetch(event.request);
      }
      const url = new URL(event.request.url);
      if (url.origin !== location.origin && !url.href.includes("tile.openstreetmap.org")) {
        return fetch(event.request);
      }
      return fetch(event.request.clone()).then((response2) => {
        if (!response2 || response2.status !== 200) {
          return response2;
        }
        if (url.origin === location.origin || url.href.includes("tile.openstreetmap.org")) {
          const responseToCache = response2.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          }).catch((err) => console.error("Cache put error:", err));
        }
        return response2;
      }).catch((error) => {
        console.error("Fetch error:", error);
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        throw error;
      });
    })
  );
});
self.addEventListener("sync", (event) => {
  if (event.tag === LOCATION_SYNC_TAG) {
    event.waitUntil(processStoredLocations());
  }
});
self.addEventListener("periodicsync", (event) => {
  if (event.tag === PERIODIC_SYNC_TAG) {
    event.waitUntil(processStoredLocations());
  }
});
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    showNotification(data.title, {
      body: data.body,
      icon: "/vite.svg",
      badge: "/vite.svg",
      data
    })
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
self.addEventListener("message", (event) => {
  if (event.data.type === "store-location") {
    event.waitUntil(storeLocationUpdate(event.data.location));
  }
});
