<!-- Map.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import type { Map as LeafletMap, FeatureGroup } from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-draw/dist/leaflet.draw.css';

  export let map: LeafletMap | null = null;
  export let mapElement: HTMLElement;
  export let drawnItems: FeatureGroup;

  onMount(() => {
    // Initialize the map
    map = L.map(mapElement).setView([0, 0], 2);
    
    // Fix Leaflet's default icon paths
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
      iconUrl: '/images/leaflet/marker-icon.png',
      shadowUrl: '/images/leaflet/marker-shadow.png'
    });

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' OpenStreetMap contributors'
    }).addTo(map);

    // Initialize the FeatureGroup for drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Add draw control
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        circle: true,
        rectangle: true,
        polyline: false,
        circlemarker: false,
        marker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });
    map.addControl(drawControl);
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div bind:this={mapElement} class="w-full h-[500px] rounded-lg shadow-lg"></div>

<style>
  :global(.leaflet-container) {
    background-color: #f5f5f5;
  }

  :global(.leaflet-control-attribution) {
    background-color: rgba(255, 255, 255, 0.8) !important;
  }

  :global(.leaflet-draw-toolbar a) {
    background-color: white !important;
    border: 2px solid rgba(0, 0, 0, 0.2) !important;
  }

  :global(.leaflet-draw-toolbar a:hover) {
    background-color: #f4f4f4 !important;
  }
</style>
