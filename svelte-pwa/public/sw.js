const CACHE_NAME = 'geofence-pwa-v1';
const BACKGROUND_SYNC_TAG = 'geofence-sync';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/icon.png'
];

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(checkGeofenceInBackground());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(checkGeofenceInBackground());
  }
});

// Function to check geofence in background
async function checkGeofenceInBackground() {
  try {
    // Get stored geofence data
    const geofences = await getGeofenceData();
    if (!geofences || geofences.length === 0) return;

    // Get current position
    const position = await getCurrentPosition();
    if (!position) return;

    const point = [position.coords.latitude, position.coords.longitude];
    let insideGeofences = [];

    geofences.forEach(({ name, polygon }) => {
      if (isPointInPolygon(point, polygon)) {
        insideGeofences.push(name);
      }
    });

    const notificationTitle = insideGeofences.length > 0
      ? `Inside geofences: ${insideGeofences.join(', ')}`
      : 'Outside all geofences';

    // Show notification
    self.registration.showNotification(notificationTitle, {
      body: `Current position: ${point.join(', ')}`,
      icon: '/icon.png'
    });

  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper function to get current position
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}

// Helper function to get stored geofence data
async function getGeofenceData() {
  try {
    const response = await fetch('/api/geofence');
    if (response.ok) {
      const data = await response.json();
      return data.geofences;
    }
  } catch (error) {
    console.error('Failed to fetch geofence data:', error);
  }
  return null;
}

// Point in polygon check
function isPointInPolygon(point, polygon) {
  let inside = false;
  const [lat, lng] = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat1, lng1] = polygon[i];
    const [lat2, lng2] = polygon[j];

    const intersect = ((lng1 > lng) !== (lng2 > lng)) &&
      (lat < (lat2 - lat1) * (lng - lng1) / (lng2 - lng1) + lat1);

    if (intersect) inside = !inside;
  }

  return inside;
}
