// PWA registration and lifecycle management
export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            if (registration.installing) {
                console.log('Service worker installing');
            } else if (registration.waiting) {
                console.log('Service worker installed');
            } else if (registration.active) {
                console.log('Service worker active');
            }

            // Handle updates
            registration.addEventListener('updatefound', () => {
                // We know newWorker won't be null here because updatefound only fires when there's a new worker
                const newWorker = registration.installing!;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available, show update prompt if needed
                        console.log('New content is available; please refresh.');
                    }
                });
            });
        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    }
}

// Check for service worker updates
export async function checkForUpdates() {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.update();
    }
}

// Request background sync permission and register sync
export async function registerBackgroundSync(tag = 'geofence-sync') {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Check if background sync is supported
            if ('sync' in registration) {
                await (registration as any).sync.register(tag);
                console.log('Background sync registered');
            } else {
                console.log('Background sync not supported');
            }
        } catch (error) {
            console.error('Background sync registration failed:', error);
        }
    }
}
