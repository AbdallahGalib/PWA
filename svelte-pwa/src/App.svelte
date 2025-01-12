<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #1a1f2c 0%, #2d3436 100%);
    color: #ffffff;
    min-height: 100vh;
  }

  main {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .app-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  h1 {
    color: #ffffff;
    font-size: 2.5rem;
    text-align: center;
    font-weight: 600;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  h3 {
    color: #ffffff;
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .map-section {
    width: 100%;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
  }

  .map-container {
    width: 100%;
    height: 500px;
    margin: 20px 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .control-panel {
    display: flex;
    gap: 1rem;
    justify-content: center;
    width: 100%;
  }

  .info-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .geofence-status, .geofence-list, .position-info {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .status-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .status-section {
    padding: 1rem;
    border-radius: 8px;
  }

  .status-section.inside {
    background: rgba(76, 175, 80, 0.2);
    border-left: 4px solid #4CAF50;
  }

  .status-section.outside {
    background: rgba(244, 67, 54, 0.2);
    border-left: 4px solid #f44336;
  }

  .status-section h4 {
    margin: 0 0 0.5rem 0;
    color: #ffffff;
  }

  .status-section ul {
    margin: 0;
    padding-left: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .position-grid {
    display: grid;
    gap: 0.5rem;
  }

  .position-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .label {
    color: rgba(255, 255, 255, 0.7);
  }

  .value {
    font-family: monospace;
    font-size: 1.1rem;
    color: #4CAF50;
  }

  .no-data {
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    font-style: italic;
  }

  .status-bar {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }

  button {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .primary-btn {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
  }

  .secondary-btn {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
  }

  .danger-btn {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    color: white;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .success-btn {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
  }

  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  button:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  input {
    font-size: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    width: 100%;
    max-width: 300px;
    transition: all 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }

    .content-container {
      padding: 1rem;
    }

    .info-panel {
      grid-template-columns: 1fr;
    }

    .control-panel {
      flex-direction: column;
    }

    .map-container {
      height: 50vh;
    }

    button {
      width: 100%;
    }
  }

  :global(.leaflet-container) {
    width: 100%;
    height: 100%;
  }

  :global(.leaflet-control-attribution) {
    font-size: 0.8rem !important;
    background-color: rgba(0, 0, 0, 0.7) !important;
    color: #fff !important;
  }

  :global(.leaflet-control-attribution a) {
    color: #4CAF50 !important;
  }

  :global(.leaflet-draw-toolbar a),
  :global(.leaflet-control-zoom a) {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    backdrop-filter: blur(4px);
  }

  :global(.leaflet-draw-toolbar a:hover),
  :global(.leaflet-control-zoom a:hover) {
    background: rgba(255, 255, 255, 0.2) !important;
  }

  :global(.leaflet-draw-toolbar) {
    background: none !important;
  }

  :global(.leaflet-draw-toolbar a) {
    background-color: white !important;
    border: 2px solid rgba(0,0,0,0.2);
    width: 34px !important;
    height: 34px !important;
    line-height: 34px !important;
    margin-bottom: 5px !important;
    border-radius: 4px !important;
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  :global(.leaflet-draw-toolbar a:hover) {
    background: #f4f4f4;
  }

  :global(.leaflet-draw-draw-polygon::before) {
    content: "" !important;
    display: block !important;
    width: 20px !important;
    height: 20px !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' stroke='%23333' stroke-width='2' d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E") !important;
    background-size: 20px !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
  }

  :global(.leaflet-draw-draw-rectangle::before) {
    content: "" !important;
    display: block !important;
    width: 20px !important;
    height: 20px !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Crect fill='none' stroke='%23333' stroke-width='2' x='3' y='3' width='18' height='18' rx='2'/%3E%3C/svg%3E") !important;
    background-size: 20px !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
  }

  :global(.leaflet-draw-edit-edit::before) {
    content: "" !important;
    display: block !important;
    width: 20px !important;
    height: 20px !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' stroke='%23333' stroke-width='2' d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/%3E%3Cpath fill='none' stroke='%23333' stroke-width='2' d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/%3E%3C/svg%3E") !important;
    background-size: 20px !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
  }

  :global(.leaflet-draw-edit-remove::before) {
    content: "" !important;
    display: block !important;
    width: 20px !important;
    height: 20px !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' stroke='%23333' stroke-width='2' d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6'/%3E%3C/svg%3E") !important;
    background-size: 20px !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
  }

  :global(.current-location-marker) {
    background: none;
    border: none;
  }

  :global(.marker-dot) {
    width: 12px;
    height: 12px;
    background-color: #4CAF50;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.4);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  :global(.marker-pulse) {
    width: 24px;
    height: 24px;
    background-color: rgba(76, 175, 80, 0.2);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  :global(.custom-draw-button) {
    margin: 5px;
    padding: 5px 10px;
    background: white;
    border: 2px solid rgba(0,0,0,0.2);
    border-radius: 4px;
    cursor: pointer;
  }

  :global(.custom-draw-button:hover) {
    background: #f4f4f4;
  }

  .geofence-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    margin: 0.5rem 0;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
  }

  .rename-input {
    flex: 1;
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-right: 0.5rem;
  }

  .edit-btn {
    background-color: #2196F3;
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .edit-btn:hover {
    background-color: #1976D2;
  }
</style>

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
    layer?: any; // Store reference to the layer
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

  // Helper function to calculate if a point is inside a polygon
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

  // Helper function to calculate if a point is inside a circle
  function isPointInCircle(point: Position, center: Position, radius: number): boolean {
    const R = 6371e3; // Earth's radius in meters
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
        // If we weren't inside before, trigger notification
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
        // If we were inside before, trigger notification
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

    // Update status message
    if (insideGeofences.length > 0) {
      status = `Inside geofence(s): ${insideGeofences.join(', ')}`;
    } else {
      status = 'Outside all geofences';
    }
  }

  // Helper functions for periodic checking
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

      // Update marker position
      if (!currentLocationMarker) {
        currentLocationMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      } else {
        currentLocationMarker.setLatLng([lat, lng]);
      }

      // Update accuracy circle
      if (!locationCircle) {
        locationCircle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
      } else {
        locationCircle.setLatLng([lat, lng]);
        locationCircle.setRadius(accuracy);
      }

      // Check geofences with the new position
      checkGeofences(newPosition);

      // Store location update with geofence status
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const locationUpdate = {
          timestamp: new Date().getTime(),
          coords: { lat, lng, accuracy },
          isInsideGeofence: insideGeofences.length > 0,
          geofenceName: insideGeofences.join(', ')
        };

        // Send to service worker for background processing
        registration.active?.postMessage({
          type: 'store-location',
          location: locationUpdate
        });

        // Request background sync
        try {
          if ('sync' in registration) {
            await (registration as any).sync.register('location-sync');
          }
        } catch (error) {
          console.warn('Background sync failed:', error);
        }
      }

      status = insideGeofences.length > 0
        ? `Inside geofence(s): ${insideGeofences.join(', ')}`
        : 'Outside all geofences';

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

      // Initialize the map
      map = L.map(mapElement, {
        zoomControl: true, // Show zoom controls
        keyboard: true, // Enable keyboard navigation
        minZoom: 1, // Minimum zoom level (world view)
        maxZoom: 22, // Maximum zoom level (very detailed street level)
        zoomDelta: 0.5, // Allow finer zoom control
        zoomSnap: 0.5, // Snap to 0.5 zoom levels
        wheelDebounceTime: 40 // Smoother wheel zooming
      }).setView([0, 0], 2);
      
      // Add zoom level indicator
      L.control.scale().addTo(map);
      
      // Create custom zoom control
      const ZoomInfo = L.Control.extend({
        onAdd: function(map: L.Map) {
          const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-zoom-info');
          container.style.backgroundColor = 'white';
          container.style.padding = '5px';
          container.style.margin = '10px';
          container.style.border = '2px solid rgba(0,0,0,0.2)';
          container.style.borderRadius = '4px';
          container.innerHTML = `Zoom: ${map.getZoom()}`;
          map.on('zoomend', () => {
            container.innerHTML = `Zoom: ${map.getZoom()}`;
          });
          return container;
        }
      });
      new ZoomInfo({ position: 'bottomleft' }).addTo(map);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors',
        maxNativeZoom: 19,    // Maximum zoom level of the tile server
        maxZoom: 22,         // Maximum zoom level for the map
      }).addTo(map);

      // Initialize feature group for drawn items
      drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      // Set up draw options
      const drawControl = new L.Control.Draw({
        draw: {
          polyline: false,
          rectangle: false,  // Disable rectangle
          polygon: {
            allowIntersection: false,
            shapeOptions: {
              color: '#4CAF50',
              fillColor: '#4CAF50',
              fillOpacity: 0.2
            }
          },
          circle: {
            shapeOptions: {
              color: '#4CAF50',
              fillColor: '#4CAF50',
              fillOpacity: 0.2
            }
          },
          marker: false
        },
        edit: {
          featureGroup: drawnItems
        }
      });

      map.addControl(drawControl);

      // Custom measurement display
      map.on('draw:created', (e: any) => {
        const layer = e.layer;
        const type = e.layerType;
        
        if (type === 'circle') {
          const radius = layer.getRadius();
          layer.bindTooltip(`Radius: ${(radius).toFixed(2)}m`);
        } else if (type === 'polygon' || type === 'rectangle') {
          const latlngs = layer.getLatLngs()[0];
          const area = L.GeometryUtil.geodesicArea(latlngs);
          layer.bindTooltip(`Area: ${(area).toFixed(2)}m²`);
        }

        // Calculate center and radius for geofence
        let center: Position;
        let radius: number;
        let coordinates: Position[] = [];
        
        if (type === 'circle') {
          const latlng = layer.getLatLng();
          center = { lat: latlng.lat, lng: latlng.lng };
          radius = layer.getRadius();
        } else {
          const latLngs = layer.getLatLngs()[0];
          coordinates = latLngs.map((ll: any) => ({ lat: ll.lat, lng: ll.lng }));
          const bounds = layer.getBounds();
          const boundsCenter = bounds.getCenter();
          center = { lat: boundsCenter.lat, lng: boundsCenter.lng };
          radius = bounds.getNorthEast().distanceTo(bounds.getCenter());
        }

        const id = crypto.randomUUID();
        const geofence: Geofence = {
          id,
          name: geofenceName || `Geofence ${geofences.size + 1}`,
          coordinates,
          type,
          center,
          radius,
          layer
        };

        layer.geofenceName = geofence.name;
        geofences.set(geofence.name, geofence);
        geofences = geofences; // trigger reactivity
        drawnItems.addLayer(layer);
        status = `Created geofence: ${geofence.name}`;
        geofenceName = '';
      });

      // Get user's location and center map
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            if (map) {
              map.setView([lat, lng], 13);
              // Add initial position marker
              if (currentLocationMarker) {
                currentLocationMarker.setLatLng([lat, lng]);
              } else {
                currentLocationMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
              }
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            status = 'Error getting location. Using default view.';
          }
        );
      }

      startMonitoring();
    } catch (error) {
      console.error('Error initializing map:', error);
      status = 'Error initializing map. Please refresh the page.';
    }
  }

  async function startMonitoring(): Promise<void> {
    if (!watching) {
      watching = true;

      // Request notification permission if not granted
      if ('Notification' in window && notificationPermission === 'default') {
        notificationPermission = await Notification.requestPermission()
          .then(permission => permission as NotificationPermission);
      }

      // Start periodic checking
      startPeriodicCheck();

      // Start watching position
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          updatePosition,
          (error) => {
            console.error('Error watching position:', error);
            status = 'Error watching position';
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      }
    }
  }

  function handleLocationError(error: GeolocationPositionError): void {
    console.error('Location error:', error);
    switch(error.code) {
      case error.PERMISSION_DENIED:
        status = 'Please enable location access in your browser settings';
        watching = false;
        break;
      case error.POSITION_UNAVAILABLE:
        status = 'Location information is unavailable';
        break;
      case error.TIMEOUT:
        status = 'Location request timed out';
        // Retry with less strict parameters
        if (watching) {
          navigator.geolocation.getCurrentPosition(
            updatePosition,
            () => {},
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 30000
            }
          );
        }
        break;
      default:
        status = `Location error: ${error.message}`;
    }
  }

  function stopMonitoring(): void {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      watching = false;
      status = 'Monitoring stopped';
    }
  }

  function saveGeofence(): void {
    if (!selectedGeofence || !geofenceName) return;
    
    try {
      console.log('Saving geofence:', selectedGeofence);
      geofences.set(geofenceName, selectedGeofence);
      geofences = geofences; // trigger reactivity
      selectedGeofence = null;
      geofenceName = '';
      status = `Saved geofence: ${geofenceName}`;
    } catch (error) {
      console.error('Error saving geofence:', error);
      status = 'Error saving geofence';
    }
  }

  let editingGeofence: string | null = null;
  let newGeofenceName: string = '';

  function deleteGeofence(name: string) {
    const geofence = geofences.get(name);
    if (geofence && geofence.layer) {
      drawnItems.removeLayer(geofence.layer);
    }
    geofences.delete(name);
    geofences = geofences; // Trigger Svelte reactivity
    checkGeofences(position);
  }

  function startEditingGeofence(name: string) {
    editingGeofence = name;
    const geofence = geofences.get(name);
    if (geofence) {
      newGeofenceName = geofence.name;
    }
  }

  function saveGeofenceEdit() {
    if (editingGeofence && newGeofenceName && newGeofenceName !== editingGeofence) {
      const geofence = geofences.get(editingGeofence);
      if (geofence) {
        geofences.delete(editingGeofence);
        geofence.name = newGeofenceName;
        geofences.set(newGeofenceName, geofence);
        geofences = geofences; // Trigger Svelte reactivity
        checkGeofences(position);
      }
    }
    editingGeofence = null;
    newGeofenceName = '';
  }

  onMount(async () => {
    try {
      // Request notification permission
      notificationPermission = await Notification.requestPermission()
        .then(permission => permission as NotificationPermission);
      
      // Register for periodic background sync if supported
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Try to register periodic sync
        if ('periodicSync' in registration) {
          try {
            await (registration as any).periodicSync.register('periodic-geofence-check', {
              minInterval: 15 * 60 * 1000, // Minimum 15 minutes
            });
          } catch (error) {
            console.warn('Periodic background sync could not be registered:', error);
          }
        }

        // Try to register regular sync
        if ('sync' in registration) {
          try {
            await (registration as any).sync.register('location-sync');
          } catch (error) {
            console.warn('Background sync could not be registered:', error);
          }
        }
      }

      await initializeMap();
    } catch (error) {
      console.error('Error in onMount:', error);
      status = 'Error initializing the application. Please refresh the page.';
    }
  });

  onDestroy(() => {
    stopPeriodicCheck();
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      watching = false;
    }
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<main>
  <div class="app-container">
    <div class="content-container">
      <h1>Geofence PWA</h1>
      
      <div class="status-bar">
        <p>{status}</p>
      </div>

      <div class="control-panel">
        <button class="primary-btn" on:click={startMonitoring} disabled={watching}>
          Start Monitoring
        </button>
        <button class="secondary-btn" on:click={stopMonitoring} disabled={!watching}>
          Stop Monitoring
        </button>
      </div>

      <div class="map-section">
        <div bind:this={mapElement} class="map-container"></div>
      </div>

      {#if selectedGeofence}
        <div class="geofence-controls">
          <input
            type="text"
            bind:value={geofenceName}
            placeholder="Enter geofence name"
          />
          <button class="success-btn" on:click={saveGeofence} disabled={!geofenceName}>
            Save Geofence
          </button>
        </div>
      {/if}

      <div class="info-panel">
        <div class="geofence-status">
          <h3>Geofence Status</h3>
          {#if geofences.size === 0}
            <p class="no-data">No geofences defined yet</p>
          {:else if !position}
            <p class="no-data">Waiting for location...</p>
          {:else}
            <div class="status-grid">
              {#if insideGeofences.length > 0}
                <div class="status-section inside">
                  <h4>Inside Geofences:</h4>
                  <ul>
                    {#each insideGeofences as fence}
                      <li>{fence}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
              {#if outsideGeofences.length > 0}
                <div class="status-section outside">
                  <h4>Outside Geofences:</h4>
                  <ul>
                    {#each outsideGeofences as fence}
                      <li>{fence}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <div class="geofence-list">
          <h3>Saved Geofences ({geofences.size})</h3>
          {#if geofences.size === 0}
            <p class="no-data">No geofences saved</p>
          {:else}
            {#each Array.from(geofences) as [name, _]}
              <div class="geofence-item">
                {#if editingGeofence === name}
                  <input
                    type="text"
                    bind:value={newGeofenceName}
                    placeholder="Enter new name"
                    class="rename-input"
                  />
                  <div class="button-group">
                    <button class="success-btn" on:click={saveGeofenceEdit}>Save</button>
                    <button class="secondary-btn" on:click={() => {
                      editingGeofence = null;
                      newGeofenceName = '';
                    }}>Cancel</button>
                  </div>
                {:else}
                  <span>{name}</span>
                  <div class="button-group">
                    <button class="edit-btn" on:click={() => startEditingGeofence(name)}>Rename</button>
                    <button class="danger-btn" on:click={() => deleteGeofence(name)}>Delete</button>
                  </div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>

        {#if position}
          <div class="position-info">
            <h3>Current Position</h3>
            <div class="position-grid">
              <div class="position-item">
                <span class="label">Latitude:</span>
                <span class="value">{position.lat.toFixed(6)}°</span>
              </div>
              <div class="position-item">
                <span class="label">Longitude:</span>
                <span class="value">{position.lng.toFixed(6)}°</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>
