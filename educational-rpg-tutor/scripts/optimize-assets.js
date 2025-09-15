#!/usr/bin/env node

/**
 * Asset optimization script for production builds
 * Compresses images, optimizes fonts, and generates service worker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

async function optimizeAssets() {
  console.log('🚀 Starting asset optimization...');

  // 1. Compress images
  await compressImages();
  
  // 2. Optimize fonts
  await optimizeFonts();
  
  // 3. Generate service worker
  await generateServiceWorker();
  
  // 4. Create asset manifest
  await createAssetManifest();
  
  // 5. Generate integrity hashes
  await generateIntegrityHashes();

  console.log('✅ Asset optimization complete!');
}

async function compressImages() {
  console.log('📸 Compressing images...');
  
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log('No assets directory found, skipping image compression');
    return;
  }

  try {
    // Install imagemin if not available
    execSync('npm list imagemin || npm install --no-save imagemin imagemin-mozjpeg imagemin-pngquant imagemin-svgo', { stdio: 'inherit' });
    
    // Compress images
    const imagemin = require('imagemin');
    const imageminMozjpeg = require('imagemin-mozjpeg');
    const imageminPngquant = require('imagemin-pngquant');
    const imageminSvgo = require('imagemin-svgo');

    await imagemin([`${ASSETS_DIR}/*.{jpg,jpeg,png,svg}`], {
      destination: ASSETS_DIR,
      plugins: [
        imageminMozjpeg({ quality: 85 }),
        imageminPngquant({ quality: [0.6, 0.8] }),
        imageminSvgo({
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'addAttributesToSVGElement', params: { attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }] } }
          ]
        })
      ]
    });

    console.log('✅ Images compressed successfully');
  } catch (error) {
    console.warn('⚠️ Image compression failed:', error.message);
  }
}

async function optimizeFonts() {
  console.log('🔤 Optimizing fonts...');
  
  // Create font-display: swap CSS for better loading performance
  const fontOptimizationCSS = `
/* Font optimization for better loading performance */
@font-face {
  font-family: 'RPG-Font';
  src: url('./fonts/rpg-font.woff2') format('woff2'),
       url('./fonts/rpg-font.woff') format('woff');
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}

/* Preload critical fonts */
.font-preload {
  font-family: 'RPG-Font', system-ui, -apple-system, sans-serif;
}
`;

  const fontCSSPath = path.join(ASSETS_DIR, 'fonts.css');
  fs.writeFileSync(fontCSSPath, fontOptimizationCSS);
  
  console.log('✅ Font optimization complete');
}

async function generateServiceWorker() {
  console.log('⚙️ Generating service worker...');
  
  const serviceWorkerContent = `
// Educational RPG Tutor Service Worker
const CACHE_NAME = 'educational-rpg-tutor-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/health.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Supabase requests (always fetch fresh)
  if (event.request.url.includes('supabase.co')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return fetchResponse;
          });
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Sync any offline learning progress when connection is restored
  const offlineData = await getOfflineData();
  if (offlineData.length > 0) {
    await syncToSupabase(offlineData);
    await clearOfflineData();
  }
}
`;

  const swPath = path.join(DIST_DIR, 'sw.js');
  fs.writeFileSync(swPath, serviceWorkerContent);
  
  console.log('✅ Service worker generated');
}

async function createAssetManifest() {
  console.log('📋 Creating asset manifest...');
  
  const manifest = {
    name: 'Educational RPG Tutor',
    short_name: 'RPG Tutor',
    description: 'Gamified learning platform for ages 3-18',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a2e',
    theme_color: '#16213e',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    categories: ['education', 'games'],
    lang: 'en-US'
  };

  const manifestPath = path.join(DIST_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('✅ Asset manifest created');
}

async function generateIntegrityHashes() {
  console.log('🔐 Generating integrity hashes...');
  
  const crypto = require('crypto');
  const integrityMap = {};

  function generateHash(filePath) {
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha384').update(content).digest('base64');
    return `sha384-${hash}`;
  }

  // Generate hashes for all JS and CSS files
  const files = fs.readdirSync(ASSETS_DIR);
  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.css')) {
      const filePath = path.join(ASSETS_DIR, file);
      integrityMap[file] = generateHash(filePath);
    }
  });

  const integrityPath = path.join(DIST_DIR, 'integrity.json');
  fs.writeFileSync(integrityPath, JSON.stringify(integrityMap, null, 2));
  
  console.log('✅ Integrity hashes generated');
}

// Run optimization
if (require.main === module) {
  optimizeAssets().catch(console.error);
}

module.exports = { optimizeAssets };