/**
 * Vitest Configuration for Visual Regression Tests
 * Specialized configuration for visual testing with snapshot support
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/visual-regression/setup.ts'],
    include: ['src/test/visual-regression/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    globals: true,
    css: true,
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results/visual-regression/test-results.json'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-results/visual-regression/coverage',
      include: ['src/components/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/test/**/*'
      ]
    },
    // Visual regression specific settings
    testTimeout: 30000, // Longer timeout for visual tests
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Snapshot settings
    resolveSnapshotPath: (testPath, snapExtension) => {
      return resolve(
        testPath.replace('/src/test/visual-regression/', '/test-results/visual-regression/snapshots/'),
        '..', 
        `${testPath.split('/').pop()?.replace('.test.', '.snap.')}${snapExtension}`
      );
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@types': resolve(__dirname, './src/types'),
      '@styles': resolve(__dirname, './src/styles')
    }
  },
  define: {
    // Environment variables for visual testing
    'process.env.VITEST_VISUAL_TESTING': 'true',
    'process.env.NODE_ENV': '"test"'
  }
});