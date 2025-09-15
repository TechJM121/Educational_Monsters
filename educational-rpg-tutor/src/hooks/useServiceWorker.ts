import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface ServiceWorkerActions {
  register: () => Promise<void>;
  update: () => Promise<void>;
  unregister: () => Promise<void>;
}

export function useServiceWorker(): ServiceWorkerState & ServiceWorkerActions {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    // Register service worker on mount
    if (state.isSupported) {
      register();
    }

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const register = async (): Promise<void> => {
    if (!state.isSupported) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, updateAvailable: true }));
            }
          });
        }
      });

      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
        
        if (event.data.type === 'SYNC_COMPLETE') {
          // Handle sync completion
          console.log('Background sync completed');
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const update = async (): Promise<void> => {
    if (!state.registration) {
      console.warn('No service worker registration found');
      return;
    }

    try {
      await state.registration.update();
      
      // Skip waiting and activate new service worker
      const waitingWorker = state.registration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for controlling change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }

      setState(prev => ({ ...prev, updateAvailable: false }));
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  };

  const unregister = async (): Promise<void> => {
    if (!state.registration) {
      console.warn('No service worker registration found');
      return;
    }

    try {
      const result = await state.registration.unregister();
      console.log('Service Worker unregistered:', result);
      
      setState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
      }));
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  };

  return {
    ...state,
    register,
    update,
    unregister,
  };
}

// Hook for managing offline functionality
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger sync when coming back online
        console.log('Back online - triggering sync');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
  };
}