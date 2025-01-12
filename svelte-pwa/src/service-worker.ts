/// <reference lib="webworker" />
/// <reference lib="es2015" />

export {}; // Make this a module

declare const self: ServiceWorkerGlobalScope & { registration: ServiceWorkerRegistration };

interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  readonly request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface PeriodicSyncEvent extends ExtendableEvent {
  readonly tag: string;
}

type Position = {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
};

const CACHE_NAME = 'geofence-pwa-v1';
const BACKGROUND_SYNC_TAG = 'geofence-sync';

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/images/leaflet/marker-icon-2x.png',
  '/images/leaflet/marker-icon.png',
  '/images/leaflet/marker-shadow.png'
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // First try to cache all static assets
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('Error caching static assets:', error);
        // If some assets fail, try caching them individually
        return Promise.all(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => 
              console.error(`Failed to cache ${url}:`, err)
            )
          )
        );
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/').then(response => {
            if (response) return response;
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Cache successful responses for static assets
        if (response.ok && url.pathname.startsWith('/images/')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return a basic error response for failed requests
        return new Response('Failed to fetch resource', {
          status: 504,
          statusText: 'Gateway Timeout',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

self.addEventListener('sync', ((event: SyncEvent) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(syncGeofences());
  }
}) as EventListener);

self.addEventListener('periodicsync', ((event: PeriodicSyncEvent) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(syncGeofences());
  }
}) as EventListener);

async function syncGeofences() {
  try {
    // Get current position
    const position = await getCurrentPosition();
    
    // Get stored geofences from IndexedDB
    const geofences = await getStoredGeofences();
    
    // Check if we're inside any geofences
    const insideGeofences = checkGeofences(position, geofences);
    
    // Show notification if we entered or left any geofences
    if (insideGeofences.length > 0) {
      await self.registration.showNotification('Geofence Alert', {
        body: `You are inside: ${insideGeofences.join(', ')}`,
        icon: '/favicon.png',
        tag: 'geofence-notification'
      });
    }
  } catch (error) {
    console.error('Error during geofence sync:', error);
  }
}

function getCurrentPosition(): Promise<Position> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function getStoredGeofences() {
  // Implementation depends on how you're storing geofences
  // This is just a placeholder
  return [];
}

function checkGeofences(position: Position, geofences: any[]) {
  // Implementation depends on your geofence structure
  // This is just a placeholder
  return [];
}
