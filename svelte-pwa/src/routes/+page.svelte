<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-draw';
  import 'leaflet-draw/dist/leaflet.draw.css';
  import type { Map as LeafletMap, FeatureGroup, Marker, Circle, LatLng, LeafletEventHandlerFn, Layer, LayerGroup } from 'leaflet';
  import type { Geofence } from '$lib/types';
  import Map from '$lib/components/Map.svelte';
  import GeofenceControls from '$lib/components/GeofenceControls.svelte';
  import GeofenceList from '$lib/components/GeofenceList.svelte';
  import Notifications from '$lib/components/Notifications.svelte';
  import GeofenceRename from '$lib/components/GeofenceRename.svelte';

  interface Position {
    lat: number;
    lng: number;
  }

  interface CircleCoordinate extends Position {
    radius: number;
  }

  interface Geofence {
    id: string;
    name: string;
    type: string;
    coordinates: Position[] | [Position, CircleCoordinate];
    layer: Layer;
  }

  interface DrawCreatedEvent {
    layer: Layer;
    layerType: 'circle' | 'polygon' | 'rectangle';
  }

  type GeofenceStore = Record<string, Geofence>;

  // Fix Leaflet's default icon paths
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });

  let map: LeafletMap | null = null;
  let mapElement: HTMLElement;
  let drawnItems: FeatureGroup = new L.FeatureGroup();
  let position: Position | null = null;
  let geofences: GeofenceStore = {};
  let selectedGeofence: string | null = null;
  let geofenceName = '';
  let status: string = '';
  let insideGeofences: string[] = [];
  let outsideGeofences: string[] = [];
  let watching = false;
  let mapInitialized = false;
  let watchId: number | null = null;
  let currentLocationMarker: Marker;
  let locationCircle: Circle;
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

  function checkGeofences(currentPosition: Position) {
    insideGeofences = [];
    outsideGeofences = [];

    for (const [name, fence] of Object.entries(geofences)) {
      let isInside = false;

      if (fence.type === 'circle') {
        const [center, circleCoord] = fence.coordinates as [Position, CircleCoordinate];
        isInside = isPointInCircle(currentPosition, center, circleCoord.radius);
      } else if (fence.type === 'polygon' || fence.type === 'rectangle') {
        isInside = isPointInPolygon(currentPosition, fence.coordinates as Position[]);
      }

      if (isInside) {
        insideGeofences.push(name);
      } else {
        outsideGeofences.push(name);
      }
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

      map.on('draw:created', handleDrawCreated);

      map.on('draw:deleted', handleDrawDeleted);

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

  function handleDrawCreated(event: L.LeafletEvent) {
    const e = event as unknown as {
      layer: L.Layer;
      layerType: 'circle' | 'polygon' | 'rectangle';
    };

    const layer = e.layer;
    const type = e.layerType;
    const id = crypto.randomUUID();
    const defaultName = `${type}_${id.slice(0, 8)}`;

    if (type === 'circle') {
      const circle = layer as Circle;
      const center = circle.getLatLng();
      const radius = circle.getRadius();
      const geofence: Geofence = {
        id,
        name: defaultName,
        type: 'circle',
        coordinates: [
          { lat: center.lat, lng: center.lng },
          { lat: center.lat, lng: center.lng, radius }
        ],
        layer
      };
      geofences[defaultName] = geofence;
    } else {
      const polygon = layer as L.Polygon;
      const latLngs = polygon.getLatLngs();
      const coordinates = (Array.isArray(latLngs[0]) ? latLngs[0] : latLngs) as LatLng[];
      
      const geofence: Geofence = {
        id,
        name: defaultName,
        type,
        coordinates: coordinates.map(latLng => ({
          lat: latLng.lat,
          lng: latLng.lng
        })),
        layer
      };
      geofences[defaultName] = geofence;
    }

    drawnItems.addLayer(layer);
  }

  function handleDrawDeleted(event: L.LeafletEvent) {
    const e = event as unknown as {
      layers: L.LayerGroup;
    };

    e.layers.eachLayer((layer: Layer) => {
      for (const [name, fence] of Object.entries(geofences)) {
        if (fence.layer === layer) {
          delete geofences[name];
          break;
        }
      }
    });
  }

  function handleRename(newName: string) {
    if (selectedGeofence && newName !== selectedGeofence) {
      const geofence = geofences[selectedGeofence];
      if (geofence) {
        geofences[newName] = { ...geofence, name: newName };
        delete geofences[selectedGeofence];
        selectedGeofence = newName;
        geofenceName = newName;
      }
    }
  }

  function handleSaveGeofence() {
    if (selectedGeofence) {
      const fence = geofences[selectedGeofence];
      if (fence) {
        const newFence = { ...fence, name: geofenceName };
        delete geofences[selectedGeofence];
        geofences[geofenceName] = newFence;
        selectedGeofence = null;
        geofenceName = '';
      }
    }
  }

  function handleDeleteGeofence() {
    if (selectedGeofence) {
      const fence = geofences[selectedGeofence];
      if (fence && fence.layer) {
        drawnItems.removeLayer(fence.layer);
      }
      delete geofences[selectedGeofence];
      selectedGeofence = null;
    }
  }

  function handleSelectGeofence(event: CustomEvent<{ name: string }>) {
    selectedGeofence = event.detail.name;
    geofenceName = event.detail.name;
  }

  function handleGeofenceSelect(name: string) {
    selectedGeofence = name;
  }

  function handleGeofenceDelete(name: string) {
    if (geofences[name]) {
      delete geofences[name];
      geofences = { ...geofences }; // Trigger reactivity
      
      // Remove from inside/outside arrays
      insideGeofences = insideGeofences.filter(g => g !== name);
      outsideGeofences = outsideGeofences.filter(g => g !== name);
      
      // Clear selection if deleted geofence was selected
      if (selectedGeofence === name) {
        selectedGeofence = null;
      }
    }
  }

  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);

        // Request periodic background sync
        // @ts-ignore - periodicSync is not in the type definitions yet
        if ('periodicSync' in registration && registration.periodicSync?.register) {
          try {
            // @ts-ignore - periodicSync is not in the type definitions yet
            await registration.periodicSync.register('geofence-sync', {
              minInterval: 60 * 1000 // Minimum interval of one minute
            });
            console.log('Periodic background sync registered');
          } catch (error) {
            console.error('Error registering periodic sync:', error);
          }
        }

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Request permissions only on user interaction
  async function requestPermissions() {
    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }

      // Request geolocation permission
      if ('geolocation' in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        console.log('Geolocation permission granted');
        return position;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  // Initialize app after permissions
  async function initializeApp() {
    await registerServiceWorker();
    // Don't request permissions here, wait for user interaction
  }

  onMount(async () => {
    await initializeApp();
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

<div class="h-screen flex flex-col">
  <div class="flex-1 relative">
    <Map bind:map bind:mapElement bind:drawnItems />
    
    <div class="absolute top-4 left-4 z-[1000] space-y-4">
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        on:click={requestPermissions}
      >
        Enable Notifications & Location
      </button>
      <GeofenceControls
        {watching}
        {selectedGeofence}
        {geofenceName}
        {status}
        on:startMonitoring={startMonitoring}
        on:stopMonitoring={stopMonitoring}
        on:saveGeofence={handleSaveGeofence}
        on:deleteGeofence={handleDeleteGeofence}
      />
      
      {#if selectedGeofence}
        <div class="bg-white p-4 rounded-lg shadow-lg">
          <GeofenceRename
            {selectedGeofence}
            {geofenceName}
            onRename={handleRename}
          />
        </div>
      {/if}
      
      <GeofenceList
        {geofences}
        {selectedGeofence}
        {insideGeofences}
        {outsideGeofences}
        onSelect={handleGeofenceSelect}
        onDelete={handleGeofenceDelete}
      />
    </div>
  </div>

  <Notifications {status} {notificationPermission} />
</div>
