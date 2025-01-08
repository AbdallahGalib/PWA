const CACHE_NAME = 'geofencing-pwa-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/service-worker.js'
];

const LOCATION_SYNC_TAG = 'location-sync';
const PERIODIC_SYNC_TAG = 'periodic-geofence-check';
const DB_NAME = 'GeofenceDB';
const STORE_NAME = 'locationUpdates';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/service-worker.js',
  '/leaflet/marker-icon.png',
  '/leaflet/marker-icon-2x.png',
  '/leaflet/marker-shadow.png'
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
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
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

// Background Periodic Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-geofence') {
    event.waitUntil(checkGeofenceStatus());
  }
});

async function checkGeofenceStatus() {
  try {
    // Get stored geofence data
    const geofenceData = await getStoredGeofenceData();
    
    // Check if we have permission for geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Check if user is within any geofence
        if (geofenceData && geofenceData.length > 0) {
          geofenceData.forEach(fence => {
            const distance = calculateDistance(
              latitude,
              longitude,
              fence.lat,
              fence.lng
            );
            
            if (distance <= fence.radius) {
              // User is inside geofence
              self.registration.showNotification('Geofence Alert', {
                body: `You are inside the geofence: ${fence.name}`,
                icon: '/favicon.png'
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('Error in background check:', error);
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Helper function to get stored geofence data
async function getStoredGeofenceData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('geofence-data');
    if (response) {
      return response.json();
    }
    return [];
  } catch (error) {
    console.error('Error getting stored geofence data:', error);
    return [];
  }
}
