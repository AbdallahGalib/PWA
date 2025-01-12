<!-- GeofenceControls.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let watching: boolean = false;
  export let selectedGeofence: string | null = null;
  export let geofenceName: string;
  export let status: string;

  const dispatch = createEventDispatcher<{
    startMonitoring: void;
    stopMonitoring: void;
    saveGeofence: void;
    deleteGeofence: void;
  }>();
</script>

<div class="bg-white p-4 rounded-lg shadow-lg space-y-4">
  <div class="flex items-center gap-4">
    {#if !watching}
      <button
        on:click={() => dispatch('startMonitoring')}
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Start Monitoring
      </button>
    {:else}
      <button
        on:click={() => dispatch('stopMonitoring')}
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Stop Monitoring
      </button>
    {/if}
  </div>

  {#if selectedGeofence}
    <div class="flex items-center gap-4">
      <button
        on:click={() => dispatch('saveGeofence')}
        disabled={!geofenceName}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save Geofence
      </button>
      <button
        on:click={() => dispatch('deleteGeofence')}
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Delete Geofence
      </button>
    </div>
  {/if}

  {#if status}
    <div class="flex justify-between items-center">
      <span class="text-gray-600">{status}</span>
    </div>
  {/if}
</div>
