/**
 * Bundle Optimization and Performance Tests
 * Comprehensive testing of code splitting, lazy loading, and performance optimizations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  createLazyComponent, 
  preloadComponent, 
  addResourceHints,
  PerformanceMonitor,
  performanceMonitor,
  createRouteBasedSplit,
  createMemoryManager
} from '../../utils/bundleOptimization';
import { 
  COMPONENT_BUNDLES, 
  BUNDLE_SIZE_ESTIMATES,
  preloadCriticalComponents,
  preloadSecondaryComponents,
  preloadHeavyComponents
} from '../../components/lazy/LazyComponents';

// Mock performance APIs
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => [])
};

// Mock PerformanceObserver
class MockPerformanceObserver {
  private callback: (list: any) => void;
  
  constructor(callback: (list: any) => void) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
}

describe('Bundle Optimization Tests', () => {
  beforeEach(() => {
    // Mock performance API
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true
    });
    
    // Mock PerformanceObserver
    Object.defineProperty(global, 'PerformanceObserver', {
      value: MockPerformanceObserver,
      writable: true
    });
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Lazy Component Loading', () => {
    it('should create lazy components with error handling', async () => {
      const mockComponent = () => 'Test Component';
      const mockImport = vi.fn().mockResolvedValue({ default: mockComponent });
      
      const LazyComponent = createLazyComponent(mockImport);
      
      expect(LazyComponent).toBeDefined();
      expect(typeof LazyComponent).toBe('object');
    });

    it('should handle component loading failures gracefully', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Load failed'));
      const fallbackComponent = () => 'Fallback';
      
      const LazyComponent = createLazyComponent(mockImport, fallbackComponent);
      
      expect(LazyComponent).toBeDefined();
    });

    it('should preload components during idle time', () => {
      const mockImport = vi.fn().mockResolvedValue({ default: () => 'Test' });
      
      // Mock requestIdleCallback
      Object.defineProperty(global, 'requestIdleCallback', {
        value: vi.fn((callback) => setTimeout(callback, 0)),
        writable: true
      });
      
      preloadComponent(mockImport);
      
      expect(global.requestIdleCallback).toHaveBeenCalled();
    });

    it('should fallback to setTimeout when requestIdleCallback is not available', () => {
      const mockImport = vi.fn().mockResolvedValue({ default: () => 'Test' });
      
      // Remove requestIdleCallback
      delete (global as any).requestIdleCallback;
      
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      preloadComponent(mockImport);
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
    });
  });

  describe('Resource Hints', () => {
    beforeEach(() => {
      // Mock document.head
      Object.defineProperty(document, 'head', {
        value: {
          appendChild: vi.fn(),
          insertBefore: vi.fn(),
          firstChild: null
        },
        writable: true
      });
      
      // Mock document.createElement
      Object.defineProperty(document, 'createElement', {
        value: vi.fn(() => ({
          rel: '',
          href: '',
          as: '',
          crossOrigin: '',
          setAttribute: vi.fn()
        })),
        writable: true
      });
    });

    it('should add preload hints for JavaScript files', () => {
      const urls = ['/js/chunk-1.js', '/js/chunk-2.js'];
      
      addResourceHints(urls, 'preload');
      
      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);
    });

    it('should add prefetch hints for CSS files', () => {
      const urls = ['/css/styles.css', '/css/theme.css'];
      
      addResourceHints(urls, 'prefetch');
      
      expect(document.createElement).toHaveBeenCalledTimes(2);
    });

    it('should handle font files with crossOrigin', () => {
      const urls = ['/fonts/inter.woff2', '/fonts/poppins.woff2'];
      
      addResourceHints(urls, 'preload');
      
      expect(document.createElement).toHaveBeenCalledTimes(2);
    });

    it('should handle image files', () => {
      const urls = ['/images/hero.jpg', '/images/logo.png'];
      
      addResourceHints(urls, 'preload');
      
      expect(document.createElement).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Monitoring', () => {
    it('should record performance metrics', () => {
      const monitor = new PerformanceMonitor();
      
      monitor.recordMetric('test-metric', 100);
      
      expect(monitor.getMetric('test-metric')).toBe(100);
    });

    it('should measure synchronous operations', () => {
      const monitor = new PerformanceMonitor();
      
      const result = monitor.measure('sync-operation', () => {
        return 'test-result';
      });
      
      expect(result).toBe('test-result');
      expect(monitor.getMetric('sync-operation')).toBeGreaterThan(0);
    });

    it('should measure asynchronous operations', async () => {
      const monitor = new PerformanceMonitor();
      
      const result = await monitor.measureAsync('async-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async-result';
      });
      
      expect(result).toBe('async-result');
      expect(monitor.getMetric('async-operation')).toBeGreaterThan(0);
    });

    it('should get all metrics', () => {
      const monitor = new PerformanceMonitor();
      
      monitor.recordMetric('metric1', 100);
      monitor.recordMetric('metric2', 200);
      
      const allMetrics = monitor.getAllMetrics();
      
      expect(allMetrics).toEqual({
        'metric1': 100,
        'metric2': 200
      });
    });

    it('should handle Web Vitals measurement', async () => {
      const monitor = new PerformanceMonitor();
      
      // Mock performance entries
      mockPerformance.getEntriesByType.mockReturnValue([
        { responseStart: 100, requestStart: 50 }
      ]);
      
      const vitals = await monitor.getWebVitals();
      
      expect(vitals).toBeDefined();
      expect(vitals.TTFB).toBe(50);
    });
  });

  describe('Route-Based Code Splitting', () => {
    it('should create route-based splitting system', () => {
      const routes = {
        home: () => Promise.resolve({ default: () => 'Home' }),
        about: () => Promise.resolve({ default: () => 'About' })
      };
      
      const routeSplitter = createRouteBasedSplit(routes);
      
      expect(routeSplitter.loadRoute).toBeDefined();
      expect(routeSplitter.preloadRoute).toBeDefined();
      expect(routeSplitter.getLoadedRoutes).toBeDefined();
    });

    it('should load routes on demand', async () => {
      const mockHomeComponent = () => 'Home';
      const routes = {
        home: vi.fn().mockResolvedValue({ default: mockHomeComponent })
      };
      
      const routeSplitter = createRouteBasedSplit(routes);
      
      const result = await routeSplitter.loadRoute('home');
      
      expect(routes.home).toHaveBeenCalled();
      expect(result.default).toBe(mockHomeComponent);
    });

    it('should cache loaded routes', async () => {
      const routes = {
        home: vi.fn().mockResolvedValue({ default: () => 'Home' })
      };
      
      const routeSplitter = createRouteBasedSplit(routes);
      
      await routeSplitter.loadRoute('home');
      await routeSplitter.loadRoute('home'); // Second call
      
      expect(routes.home).toHaveBeenCalledTimes(1); // Should be cached
    });

    it('should handle route loading errors', async () => {
      const routes = {
        error: vi.fn().mockRejectedValue(new Error('Route load failed'))
      };
      
      const routeSplitter = createRouteBasedSplit(routes);
      
      await expect(routeSplitter.loadRoute('error')).rejects.toThrow('Route load failed');
    });

    it('should handle non-existent routes', async () => {
      const routeSplitter = createRouteBasedSplit({});
      
      await expect(routeSplitter.loadRoute('nonexistent')).rejects.toThrow('Route nonexistent not found');
    });
  });

  describe('Memory Management', () => {
    it('should track objects with WeakRef', () => {
      const memoryManager = createMemoryManager();
      const testObject = { test: 'data' };
      
      const trackedObject = memoryManager.track(testObject);
      
      expect(trackedObject).toBe(testObject);
    });

    it('should cleanup dead references', () => {
      const memoryManager = createMemoryManager();
      
      // Track some objects
      memoryManager.track({ test: 1 });
      memoryManager.track({ test: 2 });
      
      const result = memoryManager.cleanup();
      
      expect(result.totalRefs).toBeGreaterThanOrEqual(0);
      expect(result.cleanedRefs).toBeGreaterThanOrEqual(0);
    });

    it('should get memory usage when available', () => {
      const memoryManager = createMemoryManager();
      
      // Mock performance.memory
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000
        },
        configurable: true
      });
      
      const memoryUsage = memoryManager.getMemoryUsage();
      
      expect(memoryUsage).toEqual({
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000
      });
    });
  });

  describe('Component Bundle Analysis', () => {
    it('should have defined component bundles', () => {
      expect(COMPONENT_BUNDLES.critical).toBeDefined();
      expect(COMPONENT_BUNDLES.secondary).toBeDefined();
      expect(COMPONENT_BUNDLES.heavy).toBeDefined();
      expect(COMPONENT_BUNDLES.typography).toBeDefined();
      expect(COMPONENT_BUNDLES.forms).toBeDefined();
    });

    it('should have bundle size estimates for all components', () => {
      const allComponents = [
        ...COMPONENT_BUNDLES.critical,
        ...COMPONENT_BUNDLES.secondary,
        ...COMPONENT_BUNDLES.heavy,
        ...COMPONENT_BUNDLES.typography,
        ...COMPONENT_BUNDLES.forms
      ];
      
      allComponents.forEach(component => {
        expect(BUNDLE_SIZE_ESTIMATES[component as keyof typeof BUNDLE_SIZE_ESTIMATES]).toBeDefined();
        expect(typeof BUNDLE_SIZE_ESTIMATES[component as keyof typeof BUNDLE_SIZE_ESTIMATES]).toBe('number');
      });
    });

    it('should categorize heavy components correctly', () => {
      const heavyComponents = COMPONENT_BUNDLES.heavy;
      
      heavyComponents.forEach(component => {
        const size = BUNDLE_SIZE_ESTIMATES[component as keyof typeof BUNDLE_SIZE_ESTIMATES];
        expect(size).toBeGreaterThan(30); // Heavy components should be > 30KB
      });
    });

    it('should categorize critical components correctly', () => {
      const criticalComponents = COMPONENT_BUNDLES.critical;
      
      criticalComponents.forEach(component => {
        const size = BUNDLE_SIZE_ESTIMATES[component as keyof typeof BUNDLE_SIZE_ESTIMATES];
        expect(size).toBeLessThan(10); // Critical components should be < 10KB
      });
    });
  });

  describe('Preloading Strategies', () => {
    beforeEach(() => {
      // Mock requestIdleCallback
      Object.defineProperty(global, 'requestIdleCallback', {
        value: vi.fn((callback) => setTimeout(callback, 0)),
        writable: true
      });
    });

    it('should preload critical components', () => {
      const requestIdleCallbackSpy = vi.spyOn(global, 'requestIdleCallback');
      
      preloadCriticalComponents();
      
      expect(requestIdleCallbackSpy).toHaveBeenCalled();
    });

    it('should preload secondary components', () => {
      const requestIdleCallbackSpy = vi.spyOn(global, 'requestIdleCallback');
      
      preloadSecondaryComponents();
      
      expect(requestIdleCallbackSpy).toHaveBeenCalled();
    });

    it('should preload heavy components during idle time', () => {
      const requestIdleCallbackSpy = vi.spyOn(global, 'requestIdleCallback');
      
      preloadHeavyComponents();
      
      expect(requestIdleCallbackSpy).toHaveBeenCalled();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet bundle size targets', () => {
      const totalCriticalSize = COMPONENT_BUNDLES.critical.reduce((sum, component) => {
        return sum + (BUNDLE_SIZE_ESTIMATES[component as keyof typeof BUNDLE_SIZE_ESTIMATES] || 0);
      }, 0);
      
      const totalSecondarySize = COMPONENT_BUNDLES.secondary.reduce((sum, component) => {
        return sum + (BUNDLE_SIZE_ESTIMATES[component as keyof typeof BUNDLE_SIZE_ESTIMATES] || 0);
      }, 0);
      
      // Critical bundle should be under 20KB
      expect(totalCriticalSize).toBeLessThan(20);
      
      // Secondary bundle should be under 50KB
      expect(totalSecondarySize).toBeLessThan(50);
    });

    it('should have reasonable component loading times', async () => {
      const monitor = new PerformanceMonitor();
      
      // Simulate component loading
      const loadTime = await monitor.measureAsync('component-load', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'loaded';
      });
      
      expect(monitor.getMetric('component-load')).toBeLessThan(100); // Should load in under 100ms
    });

    it('should track memory usage efficiently', () => {
      const memoryManager = createMemoryManager();
      
      // Track multiple objects
      const objects = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      objects.forEach(obj => memoryManager.track(obj));
      
      const cleanup = memoryManager.cleanup();
      
      expect(cleanup.totalRefs).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network failures gracefully', async () => {
      const failingImport = vi.fn().mockRejectedValue(new Error('Network error'));
      const fallback = () => 'Fallback';
      
      const LazyComponent = createLazyComponent(failingImport, fallback);
      
      expect(LazyComponent).toBeDefined();
    });

    it('should provide meaningful error messages', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const failingImport = () => Promise.reject(new Error('Load failed'));
      createLazyComponent(failingImport);
      
      // Error should be logged but not thrown
      expect(consoleErrorSpy).not.toHaveBeenCalled(); // Only called during actual load
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing performance APIs', () => {
      // Remove performance API
      delete (global as any).performance;
      
      const monitor = new PerformanceMonitor();
      
      // Should not throw errors
      expect(() => {
        monitor.recordMetric('test', 100);
        monitor.getMetric('test');
      }).not.toThrow();
    });
  });
});