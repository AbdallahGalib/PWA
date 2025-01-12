<script lang="ts">
  import { onMount } from 'svelte';

  export let status: string = '';
  export let notificationPermission: NotificationPermission = 'default';

  async function requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      notificationPermission = permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  onMount(() => {
    notificationPermission = Notification.permission;
  });
</script>

<div class="fixed bottom-4 right-4 space-y-2">
  {#if status}
    <div class="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
      {status}
    </div>
  {/if}

  {#if notificationPermission === 'default'}
    <button
      on:click={requestNotificationPermission}
      class="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg shadow-lg transition-colors"
    >
      Enable Notifications
    </button>
  {:else if notificationPermission === 'denied'}
    <div class="bg-red-500 text-white p-4 rounded-lg shadow-lg">
      Notifications are blocked. Please enable them in your browser settings.
    </div>
  {/if}
</div>
