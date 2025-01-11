<!-- Move content from App.svelte here -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-draw';
  import 'leaflet-draw/dist/leaflet.draw.css';
  import type { Map as LeafletMap, FeatureGroup, Marker, Circle, LatLng } from 'leaflet';

  // Fix Leaflet's default icon paths
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });

  let map: LeafletMap | null = null;
  let mapElement: HTMLElement;
  let drawnItems: FeatureGroup;
  let position: { lat: number; lng: number } | null = null;
  let geofences: Map<string, Geofence> = new Map();
  let selectedGeofence: any = null;
  let geofenceName = '';
  let status: string = '';
  let insideGeofences: string[] = [];
  let outsideGeofences: string[] = [];
  let watching = false;
  let mapInitialized = false;
  let watchId: number | null;
  let currentLocationMarker: L.Marker;
  let locationCircle: L.Circle;
  let checkInterval: number | null = null;
  let notificationPermission: NotificationPermission = 'default';
  const CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

  // Initialize custom icon
  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  interface Position {
    lat: number;
    lng: number;
  }

  interface Geofence {
    id: string;
    name: string;
    coordinates: Position[];
    type: string;
    center: Position;
    radius: number;
    layer?: any;
  }

  interface DrawOptions {
    draw?: {
      polygon?: boolean;
      polyline?: boolean;
      rectangle?: boolean;
      circle?: boolean;
      circlemarker?: boolean;
      marker?: boolean;
    };
    edit?: {
      featureGroup: FeatureGroup;
      remove?: boolean;
    };
  }

  function isPointInPolygon(point: Position, polygon: Position[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;
      const intersect = ((yi > point.lng) !== (yj > point.lng)) &&
        (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function isPointInCircle(point: Position, center: Position, radius: number): boolean {
    const R = 6371e3;
    const φ1 = point.lat * Math.PI / 180;
    const φ2 = center.lat * Math.PI / 180;
    const Δφ = (center.lat - point.lat) * Math.PI / 180;
    const Δλ = (center.lng - point.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= radius;
  }

  function checkGeofences(currentPosition: Position | null) {
    if (!currentPosition) return;

    const newInsideGeofences: string[] = [];
    const newOutsideGeofences: string[] = [];

    geofences.forEach((fence, name) => {
      let isInside = false;

      if (fence.type === 'circle') {
        isInside = isPointInCircle(currentPosition, fence.center, fence.radius);
      } else if (fence.type === 'polygon' || fence.type === 'rectangle') {
        isInside = isPointInPolygon(currentPosition, fence.coordinates);
      }

      if (isInside) {
        newInsideGeofences.push(name);
        if (!insideGeofences.includes(name)) {
          if ('Notification' in window && notificationPermission === 'granted') {
            new Notification('Geofence Alert', {
              body: `You have entered ${name}`,
              icon: '/vite.svg'
            });
          }
        }
      } else {
        newOutsideGeofences.push(name);
        if (insideGeofences.includes(name)) {
          if ('Notification' in window && notificationPermission === 'granted') {
            new Notification('Geofence Alert', {
              body: `You have left ${name}`,
              icon: '/vite.svg'
            });
          }
        }
      }
    });

    insideGeofences = newInsideGeofences;
    outsideGeofences = newOutsideGeofences;

    if (insideGeofences.length > 0) {
      status = `Inside geofence(s): ${insideGeofences.join(', ')}`;
    } else {
      status = 'Outside all geofences';
    }
  }

  function startPeriodicCheck() {
    if (checkInterval) return;

    checkInterval = window.setInterval(() => {
      if (position) {
        checkGeofences(position);
      }
    }, CHECK_INTERVAL_MS);
  }

  function stopPeriodicCheck() {
    if (checkInterval) {
      window.clearInterval(checkInterval);
      checkInterval = null;
    }
  }

  async function updatePosition(pos: GeolocationPosition): Promise<void> {
    try {
      if (!map || !pos || !pos.coords) return;

      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      const newPosition = { lat, lng };
      position = newPosition;

      if (!currentLocationMarker) {
        currentLocationMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      } else {
        currentLocationMarker.setLatLng([lat, lng]);
      }

      if (!locationCircle) {
        locationCircle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
      } else {
        locationCircle.setLatLng([lat, lng]);
        locationCircle.setRadius(accuracy);
      }

      checkGeofences(newPosition);

    } catch (error) {
      console.error('Error updating position:', error);
      status = 'Error updating position';
    }
  }

  async function initializeMap(): Promise<void> {
    try {
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      map = L.map(mapElement, {
        zoomControl: true,
        keyboard: true,
        minZoom: 1,
        maxZoom: 22,
        zoomDelta: 0.5,
        zoomSnap: 0.5
      }).setView([0, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors',
        maxNativeZoom: 19,
        maxZoom: 22
      }).addTo(map);

      drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        draw: {
          polyline: false,
          circlemarker: false,
          marker: false,
          circle: true,
          polygon: true,
          rectangle: true
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      });

      map.addControl(drawControl);

      map.on('draw:created', (e: any) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);

        const type = e.layerType;
        const id = Math.random().toString(36).substr(2, 9);
        const defaultName = `Geofence ${geofences.size + 1}`;

        let geofence: Geofence;

        if (type === 'circle') {
          const center = layer.getLatLng();
          const radius = layer.getRadius();
          geofence = {
            id,
            name: defaultName,
            type: 'circle',
            center: { lat: center.lat, lng: center.lng },
            radius,
            coordinates: [],
            layer
          };
        } else {
          const coordinates = layer.getLatLngs()[0].map((latlng: LatLng) => ({
            lat: latlng.lat,
            lng: latlng.lng
          }));
          geofence = {
            id,
            name: defaultName,
            type,
            coordinates,
            center: { lat: 0, lng: 0 },
            radius: 0,
            layer
          };
        }

        geofences.set(defaultName, geofence);
        geofences = geofences;
      });

      map.on('draw:deleted', (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
          geofences.forEach((fence, name) => {
            if (fence.layer === layer) {
              geofences.delete(name);
            }
          });
        });
        geofences = geofences;
      });

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            if (map) {
              map.setView([lat, lng], 13);
              updatePosition(pos);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            status = 'Error getting location. Please enable location services.';
          }
        );
      } else {
        status = 'Geolocation is not supported by your browser';
      }

      mapInitialized = true;
    } catch (error) {
      console.error('Error initializing map:', error);
      status = 'Error initializing map. Please refresh the page.';
    }
  }

  async function startMonitoring(): Promise<void> {
    if (!watching) {
      watching = true;
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          updatePosition,
          (error) => {
            console.error('Error watching position:', error);
            status = 'Error watching position';
            watching = false;
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
        startPeriodicCheck();
        status = 'Monitoring location...';
      } else {
        status = 'Geolocation is not supported by your browser';
      }
    }
  }

  async function stopMonitoring(): Promise<void> {
    if (watching && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      stopPeriodicCheck();
      watching = false;
      status = 'Monitoring stopped';
    }
  }

  function renameGeofence(oldName: string, newName: string) {
    if (geofences.has(oldName) && !geofences.has(newName)) {
      const fence = geofences.get(oldName)!;
      geofences.delete(oldName);
      geofences.set(newName, { ...fence, name: newName });
      geofences = geofences;
      selectedGeofence = null;
    }
  }

  onMount(async () => {
    if ('serviceWorker' in navigator && 'permissions' in navigator) {
      try {
        // Request permission for notifications
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register periodic background sync
          const registration = await navigator.serviceWorker.ready;
          if ('periodicSync' in registration) {
            try {
              // Check if permission is already granted
              const status = await navigator.permissions.query({
                name: 'periodic-background-sync' as PermissionName
              });

              if (status.state === 'granted') {
                await (registration as any).periodicSync.register('check-geofence', {
                  minInterval: 15 * 60 * 1000 // Minimum 15 minutes
                });
                console.log('Periodic background sync registered');
              } else {
                console.log('Periodic background sync permission not granted. Make sure the app is installed and has high site engagement.');
              }
            } catch (error) {
              console.error('Error registering periodic sync:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    if ('Notification' in window) {
      notificationPermission = await Notification.requestPermission();
    }
    await initializeMap();
  });

  onDestroy(() => {
    stopPeriodicCheck();
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      watching = false;
    }
  });
</script>

<svelte:head>
  <title>Geofencing PWA</title>
  <meta name="description" content="A Progressive Web App for geofencing" />
</svelte:head>

<main>
  <div class="app-container">
    <div class="content-container">
      <div class="status-bar">
        <p class="status-text">{status}</p>
        {#if watching}
          <button class="control-button stop" on:click={stopMonitoring}>Stop Monitoring</button>
        {:else}
          <button class="control-button start" on:click={startMonitoring}>Start Monitoring</button>
        {/if}
      </div>

      <div class="map-container" bind:this={mapElement}></div>

      <div class="geofence-list">
        <h3>Geofences</h3>
        {#if geofences.size === 0}
          <p class="no-geofences">No geofences created yet. Use the drawing tools to create one.</p>
        {:else}
          <ul>
            {#each Array.from(geofences) as [name, fence] (fence.id)}
              <li class="geofence-item">
                {#if selectedGeofence === fence.id}
                  <input
                    type="text"
                    class="rename-input"
                    value={geofenceName}
                    on:input={(e) => {
                      const target = e.currentTarget;
                      geofenceName = target.value;
                    }}
                    on:keydown={(e) => {
                      if (e.key === 'Enter') {
                        renameGeofence(name, geofenceName);
                      } else if (e.key === 'Escape') {
                        selectedGeofence = null;
                      }
                    }}
                  />
                {:else}
                  <button
                    class="geofence-name-button"
                    on:click={() => {
                      selectedGeofence = fence.id;
                      geofenceName = name;
                    }}
                  >
                    {name}
                  </button>
                {/if}
                <span class="geofence-type">({fence.type})</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  .content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f5f5f5;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .status-text {
    margin: 0;
    color: #333;
  }

  .control-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .start {
    background-color: #4CAF50;
    color: white;
  }

  .start:hover {
    background-color: #45a049;
  }

  .stop {
    background-color: #f44336;
    color: white;
  }

  .stop:hover {
    background-color: #da190b;
  }

  .map-container {
    flex: 1;
    min-height: 0;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .geofence-list {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .geofence-list h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
  }

  .no-geofences {
    color: #666;
    font-style: italic;
  }

  .geofence-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .geofence-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    background-color: white;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .geofence-name-button {
    flex: 1;
    cursor: pointer;
    padding: 0.25rem 0;
  }

  .geofence-name-button:hover {
    color: #4CAF50;
  }

  .geofence-type {
    color: #666;
    font-size: 0.9em;
    margin-left: 0.5rem;
  }

  :global(.leaflet-container) {
    height: 100%;
    width: 100%;
    background-color: #f5f5f5;
  }

  :global(.leaflet-control-attribution) {
    background-color: rgba(255, 255, 255, 0.8) !important;
  }

  :global(.leaflet-control-attribution a) {
    color: #4CAF50 !important;
  }

  :global(.leaflet-draw-toolbar a) {
    background-color: white !important;
    border: 2px solid rgba(0, 0, 0, 0.2) !important;
  }

  :global(.leaflet-draw-toolbar a:hover) {
    background-color: #f4f4f4 !important;
  }

  .rename-input {
    flex: 1;
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-right: 0.5rem;
  }

  .rename-input:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
</style>
