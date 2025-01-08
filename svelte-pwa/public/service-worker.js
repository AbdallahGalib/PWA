const CACHE_NAME = 'svelte-pwa-v1';
const LOCATION_SYNC_TAG = 'location-sync';
const PERIODIC_SYNC_TAG = 'periodic-geofence-check';
const DB_NAME = 'GeofenceDB';
const STORE_NAME = 'locationUpdates';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/assets/main-4xXvW1dQ.css',
  '/assets/main-CJFkDncB.js',
  '/assets/spritesheet-DpIxuf5L.svg'
];

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    // Check if we're in a context that supports IndexedDB
    if (!indexedDB) {
      reject(new Error('IndexedDB is not supported in this context'));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
      }
    };
  });
}

// Store location update with error handling
async function storeLocationUpdate(location) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add({
      timestamp: new Date().getTime(),
      location: location
    });
  } catch (error) {
    console.warn('Failed to store location update:', error);
  }
}

// Process stored locations and check geofences
async function processStoredLocations() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const locations = await store.getAll();

  // Process each location
  for (const location of locations) {
    try {
      // Check if we're inside any geofences
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'location-update',
          location: location
        });
      });

      // If we're inside a geofence, send a notification
      if (location.isInsideGeofence) {
        await showNotification('Geofence Alert', {
          body: `You are inside the geofence: ${location.geofenceName}`,
          icon: '/vite.svg',
          badge: '/vite.svg',
          data: { location }
        });
      }

      // Clear processed location
      await store.delete(location.timestamp);
    } catch (error) {
      console.error('Error processing location:', error);
    }
  }
}

// Show notification helper
async function showNotification(title, options) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await self.registration.showNotification(title, options);
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
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

// Fetch event handler with better error handling and cross-origin request handling
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        // Skip non-GET requests
        if (event.request.method !== 'GET') {
          return fetch(event.request);
        }

        // Handle cross-origin requests separately
        const url = new URL(event.request.url);
        if (url.origin !== location.origin && !url.href.includes('tile.openstreetmap.org')) {
          return fetch(event.request);
        }

        return fetch(event.request.clone())
          .then(response => {
            // Don't cache non-successful responses or non-GET requests
            if (!response || response.status !== 200) {
              return response;
            }

            // Only cache same-origin requests or OSM tiles
            if (url.origin === location.origin || url.href.includes('tile.openstreetmap.org')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                })
                .catch(err => console.error('Cache put error:', err));
            }

            return response;
          })
          .catch(error => {
            console.error('Fetch error:', error);
            // Return cached index.html for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            throw error;
          });
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === LOCATION_SYNC_TAG) {
    event.waitUntil(processStoredLocations());
  }
});

// Handle periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === PERIODIC_SYNC_TAG) {
    event.waitUntil(processStoredLocations());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    showNotification(data.title, {
      body: data.body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: data
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'store-location') {
    event.waitUntil(storeLocationUpdate(event.data.location));
  }
});
