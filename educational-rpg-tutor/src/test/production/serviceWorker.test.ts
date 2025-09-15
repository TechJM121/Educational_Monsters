import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock service worker environment
const mockServiceWorkerGlobalScope = {
  addEventListener: vi.fn(),
  skipWaiting: vi.fn(),
  clients: {
    claim: vi.fn(),
    openWindow: vi.fn(),
  },
  caches: {
    open: vi.fn(),
    keys: vi.fn(),
    delete: vi.fn(),
    match: vi.fn(),
  },
  fetch: vi.fn(),
  registration: {
    showNotification: vi.fn(),
  },
};

// Mock global self for service worker
Object.defineProperty(global, 'self', {
  value: mockServiceWorkerGlobalScope,
  writable: true,
});

describe('Service Worker Production Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cache Management', () => {
    it('should cache static assets on install', async () => {
      const mockCache = {
        addAll: vi.fn().mockResolvedValue(undefined),
      };
      
      mockServiceWorkerGlobalScope.caches.open.mockResolvedValue(mockCache);

      // Simulate install event
      const installEvent = new Event('install');
      const waitUntil = vi.fn();
      (installEvent as any).waitUntil = waitUntil;

      // This would be the actual service worker install handler
      const installHandler = async (event: any) => {
        event.waitUntil(
          mockServiceWorkerGlobalScope.caches.open('static-v1')
            .then((cache: any) => cache.addAll([
              '/',
              '/index.html',
              '/manifest.json',
              '/offline.html',
            ]))
        );
      };

      await installHandler(installEvent);

      expect(mockServiceWorkerGlobalScope.caches.open).toHaveBeenCalledWith('static-v1');
      expect(mockCache.addAll).toHaveBeenCalledWith([
        '/',
        '/index.html',
        '/manifest.json',
        '/offline.html',
      ]);
    });

    it('should clean up old caches on activate', async () => {
      const oldCacheNames = ['static-v0', 'dynamic-v0', 'static-v1', 'dynamic-v1'];
      mockServiceWorkerGlobalScope.caches.keys.mockResolvedValue(oldCacheNames);
      mockServiceWorkerGlobalScope.caches.delete.mockResolvedValue(true);

      const activateEvent = new Event('activate');
      const waitUntil = vi.fn();
      (activateEvent as any).waitUntil = waitUntil;

      const activateHandler = async (event: any) => {
        event.waitUntil(
          mockServiceWorkerGlobalScope.caches.keys()
            .then((cacheNames: string[]) => {
              return Promise.all(
                cacheNames.map((cacheName) => {
                  if (cacheName !== 'static-v1' && cacheName !== 'dynamic-v1') {
                    return mockServiceWorkerGlobalScope.caches.delete(cacheName);
                  }
                })
              );
            })
        );
      };

      await activateHandler(activateEvent);

      expect(mockServiceWorkerGlobalScope.caches.delete).toHaveBeenCalledWith('static-v0');
      expect(mockServiceWorkerGlobalScope.caches.delete).toHaveBeenCalledWith('dynamic-v0');
      expect(mockServiceWorkerGlobalScope.caches.delete).not.toHaveBeenCalledWith('static-v1');
      expect(mockServiceWorkerGlobalScope.caches.delete).not.toHaveBeenCalledWith('dynamic-v1');
    });
  });

  describe('Offline Functionality', () => {
    it('should serve cached content when offline', async () => {
      const mockRequest = new Request('/api/questions');
      const mockCachedResponse = new Response('cached data');
      
      mockServiceWorkerGlobalScope.caches.match.mockResolvedValue(mockCachedResponse);
      mockServiceWorkerGlobalScope.fetch.mockRejectedValue(new Error('Network error'));

      // Simulate network-first strategy
      const networkFirst = async (request: Request) => {
        try {
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          const cachedResponse = await mockServiceWorkerGlobalScope.caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      };

      const response = await networkFirst(mockRequest);
      expect(response).toBe(mockCachedResponse);
    });

    it('should return offline fallback for navigation requests', async () => {
      const mockRequest = new Request('/', { mode: 'navigate' });
      const mockOfflinePage = new Response('<html>Offline</html>');
      
      mockServiceWorkerGlobalScope.fetch.mockRejectedValue(new Error('Network error'));
      mockServiceWorkerGlobalScope.caches.match.mockResolvedValue(mockOfflinePage);

      const navigationHandler = async (request: Request) => {
        try {
          return await fetch(request);
        } catch (error) {
          const cache = await mockServiceWorkerGlobalScope.caches.open('static-v1');
          return mockServiceWorkerGlobalScope.caches.match('/offline.html');
        }
      };

      const response = await navigationHandler(mockRequest);
      expect(response).toBe(mockOfflinePage);
    });
  });

  describe('Background Sync', () => {
    it('should handle character progress sync', async () => {
      const syncEvent = new Event('sync');
      (syncEvent as any).tag = 'character-progress-sync';
      (syncEvent as any).waitUntil = vi.fn();

      const mockOfflineProgress = [
        { characterId: '1', xpGained: 100, timestamp: Date.now() }
      ];

      // Mock IndexedDB operations
      const getOfflineProgress = vi.fn().mockResolvedValue(mockOfflineProgress);
      const clearOfflineProgress = vi.fn().mockResolvedValue(undefined);
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const syncHandler = async (event: any) => {
        if (event.tag === 'character-progress-sync') {
          event.waitUntil(
            (async () => {
              const offlineProgress = await getOfflineProgress();
              if (offlineProgress.length > 0) {
                const response = await fetch('/api/sync/character-progress', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(offlineProgress)
                });
                
                if (response.ok) {
                  await clearOfflineProgress();
                }
              }
            })()
          );
        }
      };

      await syncHandler(syncEvent);

      expect(getOfflineProgress).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('/api/sync/character-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockOfflineProgress)
      });
      expect(clearOfflineProgress).toHaveBeenCalled();
    });
  });

  describe('Push Notifications', () => {
    it('should show notification on push event', async () => {
      const pushEvent = new Event('push');
      (pushEvent as any).data = { text: () => 'Test notification' };
      (pushEvent as any).waitUntil = vi.fn();

      const pushHandler = async (event: any) => {
        const options = {
          body: event.data ? event.data.text() : 'Default message',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        };

        event.waitUntil(
          mockServiceWorkerGlobalScope.registration.showNotification('Educational RPG Tutor', options)
        );
      };

      await pushHandler(pushEvent);

      expect(mockServiceWorkerGlobalScope.registration.showNotification).toHaveBeenCalledWith(
        'Educational RPG Tutor',
        expect.objectContaining({
          body: 'Test notification',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle cache failures gracefully', async () => {
      const mockRequest = new Request('/test');
      mockServiceWorkerGlobalScope.caches.match.mockRejectedValue(new Error('Cache error'));
      mockServiceWorkerGlobalScope.fetch.mockRejectedValue(new Error('Network error'));

      const cacheFirst = async (request: Request) => {
        try {
          const cachedResponse = await mockServiceWorkerGlobalScope.caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
        } catch (error) {
          console.error('Cache error:', error);
        }

        try {
          return await fetch(request);
        } catch (error) {
          return new Response('Service unavailable', { status: 503 });
        }
      };

      const response = await cacheFirst(mockRequest);
      expect(response.status).toBe(503);
    });

    it('should handle sync failures without crashing', async () => {
      const syncEvent = new Event('sync');
      (syncEvent as any).tag = 'character-progress-sync';
      (syncEvent as any).waitUntil = vi.fn();

      global.fetch = vi.fn().mockRejectedValue(new Error('Sync failed'));

      const syncHandler = async (event: any) => {
        if (event.tag === 'character-progress-sync') {
          event.waitUntil(
            (async () => {
              try {
                await fetch('/api/sync/character-progress', {
                  method: 'POST',
                  body: JSON.stringify([])
                });
              } catch (error) {
                console.error('Sync failed:', error);
                // Should not throw - just log the error
              }
            })()
          );
        }
      };

      // Should not throw
      await expect(syncHandler(syncEvent)).resolves.toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should not cache large responses', async () => {
      const mockRequest = new Request('/large-file');
      const mockResponse = new Response('x'.repeat(10 * 1024 * 1024)); // 10MB
      
      mockServiceWorkerGlobalScope.fetch.mockResolvedValue(mockResponse);

      const shouldCache = (response: Response) => {
        const contentLength = response.headers.get('content-length');
        return !contentLength || parseInt(contentLength) < 5 * 1024 * 1024; // 5MB limit
      };

      const response = await fetch(mockRequest);
      expect(shouldCache(response)).toBe(false);
    });

    it('should limit cache size', async () => {
      const mockCache = {
        keys: vi.fn().mockResolvedValue(Array(1000).fill(null).map((_, i) => ({ url: `/item-${i}` }))),
        delete: vi.fn().mockResolvedValue(true),
      };

      const MAX_CACHE_ENTRIES = 500;

      const cleanupCache = async (cache: any) => {
        const keys = await cache.keys();
        if (keys.length > MAX_CACHE_ENTRIES) {
          const keysToDelete = keys.slice(0, keys.length - MAX_CACHE_ENTRIES);
          await Promise.all(keysToDelete.map((key: any) => cache.delete(key)));
        }
      };

      await cleanupCache(mockCache);

      expect(mockCache.delete).toHaveBeenCalledTimes(500); // Should delete 500 entries
    });
  });
});