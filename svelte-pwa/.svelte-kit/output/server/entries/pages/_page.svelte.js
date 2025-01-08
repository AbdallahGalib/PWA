import { c as create_ssr_component, o as onDestroy, e as escape, a as add_attribute, b as each } from "../../chunks/ssr.js";
import L from "leaflet";
/* empty css                        */
import "leaflet-draw";
const css = {
  code: "body{margin:0;padding:0;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif}.app-container.svelte-ov1eb9.svelte-ov1eb9{display:flex;flex-direction:column;height:100vh;width:100vw}.content-container.svelte-ov1eb9.svelte-ov1eb9{flex:1;display:flex;flex-direction:column;padding:1rem;gap:1rem}.status-bar.svelte-ov1eb9.svelte-ov1eb9{display:flex;justify-content:space-between;align-items:center;background-color:#f5f5f5;padding:0.5rem 1rem;border-radius:4px;box-shadow:0 2px 4px rgba(0, 0, 0, 0.1)}.status-text.svelte-ov1eb9.svelte-ov1eb9{margin:0;color:#333}.control-button.svelte-ov1eb9.svelte-ov1eb9{padding:0.5rem 1rem;border:none;border-radius:4px;font-weight:500;cursor:pointer;transition:background-color 0.2s}.start.svelte-ov1eb9.svelte-ov1eb9{background-color:#4CAF50;color:white}.start.svelte-ov1eb9.svelte-ov1eb9:hover{background-color:#45a049}.stop.svelte-ov1eb9.svelte-ov1eb9{background-color:#f44336;color:white}.stop.svelte-ov1eb9.svelte-ov1eb9:hover{background-color:#da190b}.map-container.svelte-ov1eb9.svelte-ov1eb9{flex:1;min-height:0;border-radius:4px;overflow:hidden;box-shadow:0 2px 4px rgba(0, 0, 0, 0.1)}.geofence-list.svelte-ov1eb9.svelte-ov1eb9{background-color:#f5f5f5;padding:1rem;border-radius:4px;box-shadow:0 2px 4px rgba(0, 0, 0, 0.1)}.geofence-list.svelte-ov1eb9 h3.svelte-ov1eb9{margin-top:0;margin-bottom:1rem;color:#333}.no-geofences.svelte-ov1eb9.svelte-ov1eb9{color:#666;font-style:italic}.geofence-list.svelte-ov1eb9 ul.svelte-ov1eb9{list-style:none;padding:0;margin:0}.geofence-item.svelte-ov1eb9.svelte-ov1eb9{display:flex;align-items:center;padding:0.5rem;background-color:white;margin-bottom:0.5rem;border-radius:4px;box-shadow:0 1px 2px rgba(0, 0, 0, 0.1)}.geofence-name-button.svelte-ov1eb9.svelte-ov1eb9{flex:1;cursor:pointer;padding:0.25rem 0}.geofence-name-button.svelte-ov1eb9.svelte-ov1eb9:hover{color:#4CAF50}.geofence-type.svelte-ov1eb9.svelte-ov1eb9{color:#666;font-size:0.9em;margin-left:0.5rem}.leaflet-container{height:100%;width:100%;background-color:#f5f5f5}.leaflet-control-attribution{background-color:rgba(255, 255, 255, 0.8) !important}.leaflet-control-attribution a{color:#4CAF50 !important}.leaflet-draw-toolbar a{background-color:white !important;border:2px solid rgba(0, 0, 0, 0.2) !important}.leaflet-draw-toolbar a:hover{background-color:#f4f4f4 !important}.rename-input.svelte-ov1eb9.svelte-ov1eb9{flex:1;padding:0.25rem 0.5rem;border:1px solid #ccc;border-radius:4px;margin-right:0.5rem}.rename-input.svelte-ov1eb9.svelte-ov1eb9:focus{outline:none;border-color:#4CAF50;box-shadow:0 0 0 2px rgba(76, 175, 80, 0.2)}",
  map: '{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<!-- Move content from App.svelte here -->\\n<script lang=\\"ts\\">import { onMount, onDestroy } from \\"svelte\\";\\nimport L from \\"leaflet\\";\\nimport \\"leaflet/dist/leaflet.css\\";\\nimport \\"leaflet-draw\\";\\nimport \\"leaflet-draw/dist/leaflet.draw.css\\";\\ndelete L.Icon.Default.prototype._getIconUrl;\\nL.Icon.Default.mergeOptions({\\n  iconRetinaUrl: \\"/leaflet/marker-icon-2x.png\\",\\n  iconUrl: \\"/leaflet/marker-icon.png\\",\\n  shadowUrl: \\"/leaflet/marker-shadow.png\\"\\n});\\nlet map = null;\\nlet mapElement;\\nlet drawnItems;\\nlet position = null;\\nlet geofences = /* @__PURE__ */ new Map();\\nlet selectedGeofence = null;\\nlet geofenceName = \\"\\";\\nlet status = \\"\\";\\nlet insideGeofences = [];\\nlet outsideGeofences = [];\\nlet watching = false;\\nlet mapInitialized = false;\\nlet watchId;\\nlet currentLocationMarker;\\nlet locationCircle;\\nlet checkInterval = null;\\nlet notificationPermission = \\"default\\";\\nconst CHECK_INTERVAL_MS = 2 * 60 * 1e3;\\nconst customIcon = L.icon({\\n  iconUrl: \\"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png\\",\\n  shadowUrl: \\"https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png\\",\\n  iconSize: [25, 41],\\n  iconAnchor: [12, 41],\\n  popupAnchor: [1, -34],\\n  shadowSize: [41, 41]\\n});\\nfunction isPointInPolygon(point, polygon) {\\n  let inside = false;\\n  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {\\n    const xi = polygon[i].lat;\\n    const yi = polygon[i].lng;\\n    const xj = polygon[j].lat;\\n    const yj = polygon[j].lng;\\n    const intersect = yi > point.lng !== yj > point.lng && point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi;\\n    if (intersect) inside = !inside;\\n  }\\n  return inside;\\n}\\nfunction isPointInCircle(point, center, radius) {\\n  const R = 6371e3;\\n  const \\\\u03C61 = point.lat * Math.PI / 180;\\n  const \\\\u03C62 = center.lat * Math.PI / 180;\\n  const \\\\u0394\\\\u03C6 = (center.lat - point.lat) * Math.PI / 180;\\n  const \\\\u0394\\\\u03BB = (center.lng - point.lng) * Math.PI / 180;\\n  const a = Math.sin(\\\\u0394\\\\u03C6 / 2) * Math.sin(\\\\u0394\\\\u03C6 / 2) + Math.cos(\\\\u03C61) * Math.cos(\\\\u03C62) * Math.sin(\\\\u0394\\\\u03BB / 2) * Math.sin(\\\\u0394\\\\u03BB / 2);\\n  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));\\n  const distance = R * c;\\n  return distance <= radius;\\n}\\nfunction checkGeofences(currentPosition) {\\n  if (!currentPosition) return;\\n  const newInsideGeofences = [];\\n  const newOutsideGeofences = [];\\n  geofences.forEach((fence, name) => {\\n    let isInside = false;\\n    if (fence.type === \\"circle\\") {\\n      isInside = isPointInCircle(currentPosition, fence.center, fence.radius);\\n    } else if (fence.type === \\"polygon\\" || fence.type === \\"rectangle\\") {\\n      isInside = isPointInPolygon(currentPosition, fence.coordinates);\\n    }\\n    if (isInside) {\\n      newInsideGeofences.push(name);\\n      if (!insideGeofences.includes(name)) {\\n        if (\\"Notification\\" in window && notificationPermission === \\"granted\\") {\\n          new Notification(\\"Geofence Alert\\", {\\n            body: `You have entered ${name}`,\\n            icon: \\"/vite.svg\\"\\n          });\\n        }\\n      }\\n    } else {\\n      newOutsideGeofences.push(name);\\n      if (insideGeofences.includes(name)) {\\n        if (\\"Notification\\" in window && notificationPermission === \\"granted\\") {\\n          new Notification(\\"Geofence Alert\\", {\\n            body: `You have left ${name}`,\\n            icon: \\"/vite.svg\\"\\n          });\\n        }\\n      }\\n    }\\n  });\\n  insideGeofences = newInsideGeofences;\\n  outsideGeofences = newOutsideGeofences;\\n  if (insideGeofences.length > 0) {\\n    status = `Inside geofence(s): ${insideGeofences.join(\\", \\")}`;\\n  } else {\\n    status = \\"Outside all geofences\\";\\n  }\\n}\\nfunction startPeriodicCheck() {\\n  if (checkInterval) return;\\n  checkInterval = window.setInterval(() => {\\n    if (position) {\\n      checkGeofences(position);\\n    }\\n  }, CHECK_INTERVAL_MS);\\n}\\nfunction stopPeriodicCheck() {\\n  if (checkInterval) {\\n    window.clearInterval(checkInterval);\\n    checkInterval = null;\\n  }\\n}\\nasync function updatePosition(pos) {\\n  try {\\n    if (!map || !pos || !pos.coords) return;\\n    const { latitude: lat, longitude: lng, accuracy } = pos.coords;\\n    const newPosition = { lat, lng };\\n    position = newPosition;\\n    if (!currentLocationMarker) {\\n      currentLocationMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);\\n    } else {\\n      currentLocationMarker.setLatLng([lat, lng]);\\n    }\\n    if (!locationCircle) {\\n      locationCircle = L.circle([lat, lng], { radius: accuracy }).addTo(map);\\n    } else {\\n      locationCircle.setLatLng([lat, lng]);\\n      locationCircle.setRadius(accuracy);\\n    }\\n    checkGeofences(newPosition);\\n  } catch (error) {\\n    console.error(\\"Error updating position:\\", error);\\n    status = \\"Error updating position\\";\\n  }\\n}\\nasync function initializeMap() {\\n  try {\\n    if (!mapElement) {\\n      console.error(\\"Map element not found\\");\\n      return;\\n    }\\n    map = L.map(mapElement, {\\n      zoomControl: true,\\n      keyboard: true,\\n      minZoom: 1,\\n      maxZoom: 22,\\n      zoomDelta: 0.5,\\n      zoomSnap: 0.5\\n    }).setView([0, 0], 2);\\n    L.tileLayer(\\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\\", {\\n      attribution: \\" OpenStreetMap contributors\\",\\n      maxNativeZoom: 19,\\n      maxZoom: 22\\n    }).addTo(map);\\n    drawnItems = new L.FeatureGroup();\\n    map.addLayer(drawnItems);\\n    const drawControl = new L.Control.Draw({\\n      draw: {\\n        polyline: false,\\n        circlemarker: false,\\n        marker: false,\\n        circle: true,\\n        polygon: true,\\n        rectangle: true\\n      },\\n      edit: {\\n        featureGroup: drawnItems,\\n        remove: true\\n      }\\n    });\\n    map.addControl(drawControl);\\n    map.on(\\"draw:created\\", (e) => {\\n      const layer = e.layer;\\n      drawnItems.addLayer(layer);\\n      const type = e.layerType;\\n      const id = Math.random().toString(36).substr(2, 9);\\n      const defaultName = `Geofence ${geofences.size + 1}`;\\n      let geofence;\\n      if (type === \\"circle\\") {\\n        const center = layer.getLatLng();\\n        const radius = layer.getRadius();\\n        geofence = {\\n          id,\\n          name: defaultName,\\n          type: \\"circle\\",\\n          center: { lat: center.lat, lng: center.lng },\\n          radius,\\n          coordinates: [],\\n          layer\\n        };\\n      } else {\\n        const coordinates = layer.getLatLngs()[0].map((latlng) => ({\\n          lat: latlng.lat,\\n          lng: latlng.lng\\n        }));\\n        geofence = {\\n          id,\\n          name: defaultName,\\n          type,\\n          coordinates,\\n          center: { lat: 0, lng: 0 },\\n          radius: 0,\\n          layer\\n        };\\n      }\\n      geofences.set(defaultName, geofence);\\n      geofences = geofences;\\n    });\\n    map.on(\\"draw:deleted\\", (e) => {\\n      const layers = e.layers;\\n      layers.eachLayer((layer) => {\\n        geofences.forEach((fence, name) => {\\n          if (fence.layer === layer) {\\n            geofences.delete(name);\\n          }\\n        });\\n      });\\n      geofences = geofences;\\n    });\\n    if (\\"geolocation\\" in navigator) {\\n      navigator.geolocation.getCurrentPosition(\\n        (pos) => {\\n          const { latitude: lat, longitude: lng } = pos.coords;\\n          if (map) {\\n            map.setView([lat, lng], 13);\\n            updatePosition(pos);\\n          }\\n        },\\n        (error) => {\\n          console.error(\\"Error getting location:\\", error);\\n          status = \\"Error getting location. Please enable location services.\\";\\n        }\\n      );\\n    } else {\\n      status = \\"Geolocation is not supported by your browser\\";\\n    }\\n    mapInitialized = true;\\n  } catch (error) {\\n    console.error(\\"Error initializing map:\\", error);\\n    status = \\"Error initializing map. Please refresh the page.\\";\\n  }\\n}\\nasync function startMonitoring() {\\n  if (!watching) {\\n    watching = true;\\n    if (\\"geolocation\\" in navigator) {\\n      watchId = navigator.geolocation.watchPosition(\\n        updatePosition,\\n        (error) => {\\n          console.error(\\"Error watching position:\\", error);\\n          status = \\"Error watching position\\";\\n          watching = false;\\n        },\\n        {\\n          enableHighAccuracy: true,\\n          timeout: 5e3,\\n          maximumAge: 0\\n        }\\n      );\\n      startPeriodicCheck();\\n      status = \\"Monitoring location...\\";\\n    } else {\\n      status = \\"Geolocation is not supported by your browser\\";\\n    }\\n  }\\n}\\nasync function stopMonitoring() {\\n  if (watching && watchId !== null) {\\n    navigator.geolocation.clearWatch(watchId);\\n    stopPeriodicCheck();\\n    watching = false;\\n    status = \\"Monitoring stopped\\";\\n  }\\n}\\nfunction renameGeofence(oldName, newName) {\\n  if (geofences.has(oldName) && !geofences.has(newName)) {\\n    const fence = geofences.get(oldName);\\n    geofences.delete(oldName);\\n    geofences.set(newName, { ...fence, name: newName });\\n    geofences = geofences;\\n    selectedGeofence = null;\\n  }\\n}\\nonMount(async () => {\\n  if (\\"Notification\\" in window) {\\n    notificationPermission = await Notification.requestPermission();\\n  }\\n  await initializeMap();\\n});\\nonDestroy(() => {\\n  stopPeriodicCheck();\\n  if (watchId) {\\n    navigator.geolocation.clearWatch(watchId);\\n    watching = false;\\n  }\\n});\\n<\/script>\\n\\n<svelte:head>\\n  <title>Geofencing PWA</title>\\n  <meta name=\\"description\\" content=\\"A Progressive Web App for geofencing\\" />\\n</svelte:head>\\n\\n<main>\\n  <div class=\\"app-container\\">\\n    <div class=\\"content-container\\">\\n      <div class=\\"status-bar\\">\\n        <p class=\\"status-text\\">{status}</p>\\n        {#if watching}\\n          <button class=\\"control-button stop\\" on:click={stopMonitoring}>Stop Monitoring</button>\\n        {:else}\\n          <button class=\\"control-button start\\" on:click={startMonitoring}>Start Monitoring</button>\\n        {/if}\\n      </div>\\n\\n      <div class=\\"map-container\\" bind:this={mapElement}></div>\\n\\n      <div class=\\"geofence-list\\">\\n        <h3>Geofences</h3>\\n        {#if geofences.size === 0}\\n          <p class=\\"no-geofences\\">No geofences created yet. Use the drawing tools to create one.</p>\\n        {:else}\\n          <ul>\\n            {#each Array.from(geofences) as [name, fence] (fence.id)}\\n              <li class=\\"geofence-item\\">\\n                {#if selectedGeofence === fence.id}\\n                  <input\\n                    type=\\"text\\"\\n                    class=\\"rename-input\\"\\n                    value={geofenceName}\\n                    on:input={(e) => {\\n                      const target = e.currentTarget;\\n                      geofenceName = target.value;\\n                    }}\\n                    on:keydown={(e) => {\\n                      if (e.key === \'Enter\') {\\n                        renameGeofence(name, geofenceName);\\n                      } else if (e.key === \'Escape\') {\\n                        selectedGeofence = null;\\n                      }\\n                    }}\\n                  />\\n                {:else}\\n                  <button\\n                    class=\\"geofence-name-button\\"\\n                    on:click={() => {\\n                      selectedGeofence = fence.id;\\n                      geofenceName = name;\\n                    }}\\n                  >\\n                    {name}\\n                  </button>\\n                {/if}\\n                <span class=\\"geofence-type\\">({fence.type})</span>\\n              </li>\\n            {/each}\\n          </ul>\\n        {/if}\\n      </div>\\n    </div>\\n  </div>\\n</main>\\n\\n<style>\\n  :global(body) {\\n    margin: 0;\\n    padding: 0;\\n    font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;\\n  }\\n\\n  .app-container {\\n    display: flex;\\n    flex-direction: column;\\n    height: 100vh;\\n    width: 100vw;\\n  }\\n\\n  .content-container {\\n    flex: 1;\\n    display: flex;\\n    flex-direction: column;\\n    padding: 1rem;\\n    gap: 1rem;\\n  }\\n\\n  .status-bar {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: center;\\n    background-color: #f5f5f5;\\n    padding: 0.5rem 1rem;\\n    border-radius: 4px;\\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .status-text {\\n    margin: 0;\\n    color: #333;\\n  }\\n\\n  .control-button {\\n    padding: 0.5rem 1rem;\\n    border: none;\\n    border-radius: 4px;\\n    font-weight: 500;\\n    cursor: pointer;\\n    transition: background-color 0.2s;\\n  }\\n\\n  .start {\\n    background-color: #4CAF50;\\n    color: white;\\n  }\\n\\n  .start:hover {\\n    background-color: #45a049;\\n  }\\n\\n  .stop {\\n    background-color: #f44336;\\n    color: white;\\n  }\\n\\n  .stop:hover {\\n    background-color: #da190b;\\n  }\\n\\n  .map-container {\\n    flex: 1;\\n    min-height: 0;\\n    border-radius: 4px;\\n    overflow: hidden;\\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .geofence-list {\\n    background-color: #f5f5f5;\\n    padding: 1rem;\\n    border-radius: 4px;\\n    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .geofence-list h3 {\\n    margin-top: 0;\\n    margin-bottom: 1rem;\\n    color: #333;\\n  }\\n\\n  .no-geofences {\\n    color: #666;\\n    font-style: italic;\\n  }\\n\\n  .geofence-list ul {\\n    list-style: none;\\n    padding: 0;\\n    margin: 0;\\n  }\\n\\n  .geofence-item {\\n    display: flex;\\n    align-items: center;\\n    padding: 0.5rem;\\n    background-color: white;\\n    margin-bottom: 0.5rem;\\n    border-radius: 4px;\\n    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .geofence-name-button {\\n    flex: 1;\\n    cursor: pointer;\\n    padding: 0.25rem 0;\\n  }\\n\\n  .geofence-name-button:hover {\\n    color: #4CAF50;\\n  }\\n\\n  .geofence-type {\\n    color: #666;\\n    font-size: 0.9em;\\n    margin-left: 0.5rem;\\n  }\\n\\n  :global(.leaflet-container) {\\n    height: 100%;\\n    width: 100%;\\n    background-color: #f5f5f5;\\n  }\\n\\n  :global(.leaflet-control-attribution) {\\n    background-color: rgba(255, 255, 255, 0.8) !important;\\n  }\\n\\n  :global(.leaflet-control-attribution a) {\\n    color: #4CAF50 !important;\\n  }\\n\\n  :global(.leaflet-draw-toolbar a) {\\n    background-color: white !important;\\n    border: 2px solid rgba(0, 0, 0, 0.2) !important;\\n  }\\n\\n  :global(.leaflet-draw-toolbar a:hover) {\\n    background-color: #f4f4f4 !important;\\n  }\\n\\n  .rename-input {\\n    flex: 1;\\n    padding: 0.25rem 0.5rem;\\n    border: 1px solid #ccc;\\n    border-radius: 4px;\\n    margin-right: 0.5rem;\\n  }\\n\\n  .rename-input:focus {\\n    outline: none;\\n    border-color: #4CAF50;\\n    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);\\n  }\\n</style>\\n"],"names":[],"mappings":"AAgXU,IAAM,CACZ,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,aAAa,CAAC,CAAC,kBAAkB,CAAC,CAAC,UAAU,CAAC,CAAC,MAAM,CAAC,CAAC,gBAAgB,CAAC,CAAC,KAAK,CAAC,CAAC,UAC/F,CAEA,0CAAe,CACb,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,KAAK,CACb,KAAK,CAAE,KACT,CAEA,8CAAmB,CACjB,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IACP,CAEA,uCAAY,CACV,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,CACnB,gBAAgB,CAAE,OAAO,CACzB,OAAO,CAAE,MAAM,CAAC,IAAI,CACpB,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CAEA,wCAAa,CACX,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IACT,CAEA,2CAAgB,CACd,OAAO,CAAE,MAAM,CAAC,IAAI,CACpB,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,gBAAgB,CAAC,IAC/B,CAEA,kCAAO,CACL,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KACT,CAEA,kCAAM,MAAO,CACX,gBAAgB,CAAE,OACpB,CAEA,iCAAM,CACJ,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KACT,CAEA,iCAAK,MAAO,CACV,gBAAgB,CAAE,OACpB,CAEA,0CAAe,CACb,IAAI,CAAE,CAAC,CACP,UAAU,CAAE,CAAC,CACb,aAAa,CAAE,GAAG,CAClB,QAAQ,CAAE,MAAM,CAChB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CAEA,0CAAe,CACb,gBAAgB,CAAE,OAAO,CACzB,OAAO,CAAE,IAAI,CACb,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CAEA,4BAAc,CAAC,gBAAG,CAChB,UAAU,CAAE,CAAC,CACb,aAAa,CAAE,IAAI,CACnB,KAAK,CAAE,IACT,CAEA,yCAAc,CACZ,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,MACd,CAEA,4BAAc,CAAC,gBAAG,CAChB,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CACV,CAEA,0CAAe,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,MAAM,CACf,gBAAgB,CAAE,KAAK,CACvB,aAAa,CAAE,MAAM,CACrB,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CAEA,iDAAsB,CACpB,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,OAAO,CAAC,CACnB,CAEA,iDAAqB,MAAO,CAC1B,KAAK,CAAE,OACT,CAEA,0CAAe,CACb,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,MACf,CAEQ,kBAAoB,CAC1B,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,gBAAgB,CAAE,OACpB,CAEQ,4BAA8B,CACpC,gBAAgB,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,UAC7C,CAEQ,8BAAgC,CACtC,KAAK,CAAE,OAAO,CAAC,UACjB,CAEQ,uBAAyB,CAC/B,gBAAgB,CAAE,KAAK,CAAC,UAAU,CAClC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,UACvC,CAEQ,6BAA+B,CACrC,gBAAgB,CAAE,OAAO,CAAC,UAC5B,CAEA,yCAAc,CACZ,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,OAAO,CAAC,MAAM,CACvB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,aAAa,CAAE,GAAG,CAClB,YAAY,CAAE,MAChB,CAEA,yCAAa,MAAO,CAClB,OAAO,CAAE,IAAI,CACb,YAAY,CAAE,OAAO,CACrB,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAC7C"}'
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png"
  });
  let mapElement;
  let geofences = /* @__PURE__ */ new Map();
  let selectedGeofence = null;
  let geofenceName = "";
  let status = "";
  L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  onDestroy(() => {
  });
  $$result.css.add(css);
  return `  ${$$result.head += `<!-- HEAD_svelte-1ps6v8r_START -->${$$result.title = `<title>Geofencing PWA</title>`, ""}<meta name="description" content="A Progressive Web App for geofencing"><!-- HEAD_svelte-1ps6v8r_END -->`, ""} <main><div class="app-container svelte-ov1eb9"><div class="content-container svelte-ov1eb9"><div class="status-bar svelte-ov1eb9"><p class="status-text svelte-ov1eb9">${escape(status)}</p> ${`<button class="control-button start svelte-ov1eb9" data-svelte-h="svelte-8rrxot">Start Monitoring</button>`}</div> <div class="map-container svelte-ov1eb9"${add_attribute("this", mapElement, 0)}></div> <div class="geofence-list svelte-ov1eb9"><h3 class="svelte-ov1eb9" data-svelte-h="svelte-pnijaz">Geofences</h3> ${geofences.size === 0 ? `<p class="no-geofences svelte-ov1eb9" data-svelte-h="svelte-cq9e1g">No geofences created yet. Use the drawing tools to create one.</p>` : `<ul class="svelte-ov1eb9">${each(Array.from(geofences), ([name, fence]) => {
    return `<li class="geofence-item svelte-ov1eb9">${selectedGeofence === fence.id ? `<input type="text" class="rename-input svelte-ov1eb9"${add_attribute("value", geofenceName, 0)}>` : `<button class="geofence-name-button svelte-ov1eb9">${escape(name)} </button>`} <span class="geofence-type svelte-ov1eb9">(${escape(fence.type)})</span> </li>`;
  })}</ul>`}</div></div></div> </main>`;
});
export {
  Page as default
};
