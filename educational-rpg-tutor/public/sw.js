/**
 * Service Worker for Asset Caching and Performance Optimization
 * Implements advanced caching strategies for optimal loading performance
 */

const CACHE_NAME = 'educational-rpg-tutor-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';
const FONT_CACHE = 'fonts-v1';

// Cache duration in milliseconds
const CACHE_DURATION = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000,    // 1 day
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  FONTS: 365 * 24 * 60 * 60 * 1000  // 1 year
};

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/critical.js',
  '/css/critical.css',
  '/fonts/inter-400.woff2',
  '/fonts/inter-500.woff2',
  '/fonts/inter-600.woff2',
  '/fonts/poppins-600.woff2'
];

// Resources to cache on first request
const CACHE_ON_REQUEST = [
  '/js/',
  '/css/',
  '/fonts/',
  '/images/',
  '/api/'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== FONT_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Handle different types of requests with appropriate caching strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Static assets (JS, CSS) - Cache First
    if (pathname.startsWith('/js/') || pathname.startsWith('/css/')) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Fonts - Cache First with long expiration
    if (pathname.startsWith('/fonts/') || pathname.includes('.woff')) {
      return await cacheFirst(request, FONT_CACHE);
    }
    
    // Images - Cache First with fallback
    if (pathname.startsWith('/images/') || isImageRequest(request)) {
      return await cacheFirstWithFallback(request, IMAGE_CACHE);
    }
    
    // API requests - Network First with cache fallback
    if (pathname.startsWith('/api/')) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // HTML pages - Stale While Revalidate
    if (pathname === '/' || pathname.endsWith('.html') || !pathname.includes('.')) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Default - Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Request handling error:', error);
    return await handleOfflineFallback(request);
  }
}

// Cache First strategy - for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATION.STATIC)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response before caching
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version even if expired
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache First with fallback for images
async function cacheFirstWithFallback(request, cacheName) {
  try {
    return await cacheFirst(request, cacheName);
  } catch (error) {
    // Return offline fallback image
    const cache = await caches.open(cacheName);
    const fallback = await cache.match('/images/offline-fallback.svg');
    return fallback || new Response('Image not available', { status: 404 });
  }
}

// Network First strategy - for dynamic content
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate strategy - for HTML pages
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cache
  });
  
  // Return cached version immediately if available
  if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATION.DYNAMIC)) {
    // Update cache in background
    networkPromise;
    return cachedResponse;
  }
  
  // Wait for network if no cache or cache is expired
  try {
    return await networkPromise;
  } catch (error) {
    // Return expired cache as last resort
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseDate = new Date(dateHeader);
  const now = new Date();
  
  return (now.getTime() - responseDate.getTime()) > maxAge;
}

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  
  return pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/);
}

// Handle offline fallbacks
async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // HTML fallback
  if (pathname === '/' || pathname.endsWith('.html') || !pathname.includes('.')) {
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match('/offline.html');
    return fallback || new Response('Offline', { status: 503 });
  }
  
  // Image fallback
  if (isImageRequest(request)) {
    const cache = await caches.open(IMAGE_CACHE);
    const fallback = await cache.match('/images/offline-fallback.svg');
    return fallback || new Response('Image not available', { status: 404 });
  }
  
  // Generic fallback
  return new Response('Resource not available offline', { status: 503 });
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle any queued requests when back online
  console.log('Background sync triggered');
  
  // This would typically replay failed API requests
  // Implementation depends on your specific needs
}

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', payload: size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Utility functions
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Periodic cache cleanup
setInterval(async () => {
  try {
    await cleanupExpiredCache();
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}, 60 * 60 * 1000); // Run every hour

async function cleanupExpiredCache() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      
      if (response && isExpired(response, CACHE_DURATION.DYNAMIC)) {
        await cache.delete(request);
      }
    }
  }
}

console.log('Service Worker loaded and ready');