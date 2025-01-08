const CACHE_NAME = "pwa-cache-v1";
const LOCATION_SYNC_TAG = "location-sync";
const PERIODIC_SYNC_TAG = "periodic-geofence-check";
const DB_NAME = "GeofenceDB";
const STORE_NAME = "locationUpdates";
const urlsToCache = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/manifest.json",
  "/leaflet/marker-icon.png",
  "/leaflet/marker-icon-2x.png",
  "/leaflet/marker-shadow.png"
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
async function storeLocationUpdate(location) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.add({
      timestamp: (/* @__PURE__ */ new Date()).getTime(),
      location
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
  for (const location of locations) {
    try {
      const clients2 = await self.clients.matchAll();
      clients2.forEach((client) => {
        client.postMessage({
          type: "location-update",
          location
        });
      });
      if (location.isInsideGeofence) {
        await showNotification("Geofence Alert", {
          body: `You are inside the geofence: ${location.geofenceName}`,
          icon: "/vite.svg",
          badge: "/vite.svg",
          data: { location }
        });
      }
      await store.delete(location.timestamp);
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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
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
      return fetch(event.request);
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
