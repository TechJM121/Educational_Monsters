import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: resolve(__dirname, '..'),
  plugins: [
    react(),
    // Service Worker plugin
    {
      name: 'service-worker',
      configureServer(server) {
        server.middlewares.use('/sw.js', (_req, res, next) => {
          res.setHeader('Service-Worker-Allowed', '/');
          next();
        });
      },
    },
  ],
  build: {
    // Production optimizations
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          animations: ['framer-motion'],
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Asset optimization
  assetsInclude: ['**/*.woff2', '**/*.woff'],
  // CDN configuration
  base: process.env.NODE_ENV === 'production' ? 'https://cdn.educational-rpg-tutor.com/' : '/',
})
