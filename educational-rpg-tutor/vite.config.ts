import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Service Worker plugin
    {
      name: 'service-worker',
      configureServer(server) {
        server.middlewares.use('/sw.js', (req, res, next) => {
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'dist/',
        'cypress/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
})
