<!-- GeofenceList.svelte -->
<script lang="ts">
  import type { Geofence } from '../types';

  export let geofences: Record<string, Geofence>;
  export let selectedGeofence: string | null;
  export let insideGeofences: string[] = [];
  export let outsideGeofences: string[] = [];
  export let onSelect: (name: string) => void;
  export let onDelete: (name: string) => void;
</script>

<div class="bg-white p-4 rounded-lg shadow-lg space-y-4">
  <div>
    <h3 class="text-lg font-semibold mb-2">Inside Geofences</h3>
    {#if insideGeofences.length === 0}
      <p class="text-gray-500 italic">No geofences currently inside</p>
    {:else}
      <ul class="space-y-1">
        {#each insideGeofences as name}
          <li>
            <button
              class="px-3 py-2 bg-green-100 text-green-800 rounded cursor-pointer hover:bg-green-200 transition-colors w-full flex justify-between items-center"
              class:selected={selectedGeofence === name}
              on:click={() => onSelect(name)}
              on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelect(name);
                }
              }}
              aria-label="Select geofence {name}"
            >
              <span>{name}</span>
              <button
                class="text-red-600 hover:text-red-800 ml-2"
                on:click|stopPropagation={() => onDelete(name)}
                on:keydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onDelete(name);
                  }
                }}
                aria-label="Delete geofence {name}"
              >
                Delete
              </button>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div>
    <h3 class="text-lg font-semibold mb-2">Outside Geofences</h3>
    {#if outsideGeofences.length === 0}
      <p class="text-gray-500 italic">No geofences currently outside</p>
    {:else}
      <ul class="space-y-1">
        {#each outsideGeofences as name}
          <li>
            <button
              class="px-3 py-2 bg-gray-100 text-gray-800 rounded cursor-pointer hover:bg-gray-200 transition-colors w-full flex justify-between items-center"
              class:selected={selectedGeofence === name}
              on:click={() => onSelect(name)}
              on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelect(name);
                }
              }}
              aria-label="Select geofence {name}"
            >
              <span>{name}</span>
              <button
                class="text-red-600 hover:text-red-800 ml-2"
                on:click|stopPropagation={() => onDelete(name)}
                on:keydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onDelete(name);
                  }
                }}
                aria-label="Delete geofence {name}"
              >
                Delete
              </button>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .selected {
    @apply ring-2 ring-green-500;
  }
</style>
