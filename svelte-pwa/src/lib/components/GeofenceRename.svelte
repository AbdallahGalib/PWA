<script lang="ts">
  export let selectedGeofence: string | null = null;
  export let geofenceName: string = '';
  export let onRename: (newName: string) => void;

  let isEditing = false;
  let newName = '';
  let inputElement: HTMLInputElement;

  function startEditing() {
    if (selectedGeofence) {
      newName = geofenceName;
      isEditing = true;
      setTimeout(() => inputElement?.focus(), 0);
    }
  }

  function handleRename() {
    if (newName.trim()) {
      onRename(newName.trim());
      isEditing = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleRename();
    } else if (event.key === 'Escape') {
      isEditing = false;
    }
  }
</script>

<div class="flex items-center gap-2">
  {#if isEditing}
    <input
      type="text"
      bind:value={newName}
      bind:this={inputElement}
      on:keydown={handleKeydown}
      class="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter new name"
    />
    <button
      on:click={handleRename}
      class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
    >
      Save
    </button>
    <button
      on:click={() => (isEditing = false)}
      class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
    >
      Cancel
    </button>
  {:else}
    <span class="font-medium">{geofenceName}</span>
    <button
      on:click={startEditing}
      class="px-2 py-1 text-blue-500 hover:text-blue-600 transition-colors"
      disabled={!selectedGeofence}
    >
      Rename
    </button>
  {/if}
</div>
