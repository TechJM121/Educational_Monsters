/**
 * Asset Optimization Performance Tests
 * Tests for image optimization, font loading, CSS optimization, and caching strategies
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ImageOptimizer,
  FontOptimizer,
  CSSOptimizer,
  ServiceWorkerManager,
  ResourcePrioritizer,
  imageOptimizer,
  fontOptimizer,
  cssOptimizer,
  serviceWorkerManager,
  resourcePrioritizer
} from '../../utils/assetOptimization';

// Mock DOM APIs
const mockDocument = {
  createElement: vi.fn(() => ({
    rel: '',
    href: '',
    as: '',
    crossOrigin: '',
    type: '',
    media: '',
    textContent: '',
    onload: null,
    onerror: null,
    setAttribute: vi.fn(),
    addEventListener: vi.fn()
  })),
  head: {
    appendChild: vi.fn(),
    insertBefore: vi.fn(),
    firstChild: null
  },
  fonts: {
    add: vi.fn()
  },
  querySelectorAll: vi.fn(() => [])
};

// Mock Image constructor
class MockImage {
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  constructor() {
    // Simulate async loading
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 10);
  }
}

// Mock FontFace constructor
class MockFontFace {
  family: string;
  source: string;
  descriptors: any;
  
  constructor(family: string, source: string, descriptors: any = {}) {
    this.family = family;
    this.source = source;
    this.descriptors = descriptors;
  }
  
  load(): Promise<MockFontFace> {
    return Promise.resolve(this);
  }
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  private callback: (entries: any[]) => void;
  
  constructor(callback: (entries: any[]) => void) {
    this.callback = callback;
  }
  
  observe(element: Element) {
    // Simulate intersection
    setTimeout(() => {
      this.callback([{ target: element, isIntersecting: true }]);
    }, 10);
  }
  
  unobserve() {}
  disconnect() {}
}

describe('Asset Optimization Tests', () => {
  beforeEach(() => {
    // Mock global objects
    Object.defineProperty(global, 'document', { value: mockDocument, writable: true });
    Object.defineProperty(global, 'Image', { value: MockImage, writable: true });
    Object.defineProperty(global, 'FontFace', { value: MockFontFace, writable: true });
    Object.defineProperty(global, 'IntersectionObserver', { value: MockIntersectionObserver, writable: true });
    
    // Mock window properties
    Object.defineProperty(global, 'window', {
      value: {
        location: { origin: 'https://example.com' },
        devicePixelRatio: 2,
        requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 16))
      },
      writable: true
    });
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Image Optimization', () => {
    let optimizer: ImageOptimizer;

    beforeEach(() => {
      optimizer = new ImageOptimizer();
    });

    it('should optimize image URLs with parameters', () => {
      const src = '/images/test.jpg';
      const options = {
        width: 800,
        height: 600,
        quality: 90,
        format: 'webp' as const
      };

      const optimizedUrl = optimizer.optimizeImageUrl(src, options);

      expect(optimizedUrl).toContain('w=800');
      expect(optimizedUrl).toContain('h=600');
      expect(optimizedUrl).toContain('q=90');
      expect(optimizedUrl).toContain('f=webp');
    });

    it('should add device pixel ratio for high-DPI displays', () => {
      const src = '/images/test.jpg';
      const optimizedUrl = optimizer.optimizeImageUrl(src, { width: 400 });

      expect(optimizedUrl).toContain('dpr=2');
    });

    it('should create responsive image sets', () => {
      const src = '/images/test.jpg';
      const breakpoints = [400, 800, 1200];

      const srcSet = optimizer.createResponsiveImageSet(src, breakpoints);

      expect(srcSet).toContain('400w');
      expect(srcSet).toContain('800w');
      expect(srcSet).toContain('1200w');
    });

    it('should lazy load images with intersection observer', () => {
      const img = document.createElement('img') as HTMLImageElement;
      const src = '/images/test.jpg';

      optimizer.lazyLoadImage(img, src, { lazy: true });

      expect(img.dataset.src).toBe(src);
    });

    it('should preload multiple images', async () => {
      const urls = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg'];

      const promises = optimizer.preloadImages(urls);

      await expect(promises).resolves.toBeDefined();
    });

    it('should cache loaded images', async () => {
      const urls = ['/images/test.jpg'];
      
      await optimizer.preloadImages(urls);
      
      expect(optimizer.getCacheSize()).toBe(1);
    });

    it('should clear image cache', async () => {
      const urls = ['/images/test.jpg'];
      
      await optimizer.preloadImages(urls);
      optimizer.clearCache();
      
      expect(optimizer.getCacheSize()).toBe(0);
    });
  });

  describe('Font Optimization', () => {
    let optimizer: FontOptimizer;

    beforeEach(() => {
      optimizer = new FontOptimizer();
    });

    it('should preload fonts with correct attributes', () => {
      optimizer.preloadFont('Inter', '400', 'normal');

      expect(mockDocument.createElement).toHaveBeenCalledWith('link');
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it('should not preload the same font twice', () => {
      optimizer.preloadFont('Inter', '400', 'normal');
      optimizer.preloadFont('Inter', '400', 'normal');

      expect(mockDocument.head.appendChild).toHaveBeenCalledTimes(1);
    });

    it('should load font faces', async () => {
      const fontFace = await optimizer.loadFontFace('Inter', '400', 'normal');

      expect(fontFace).toBeInstanceOf(MockFontFace);
      expect(mockDocument.fonts.add).toHaveBeenCalledWith(fontFace);
    });

    it('should load critical fonts', async () => {
      await optimizer.loadCriticalFonts();

      // Should load multiple font faces
      expect(mockDocument.fonts.add).toHaveBeenCalledTimes(4);
    });

    it('should track loaded fonts', () => {
      optimizer.preloadFont('Inter', '400');
      optimizer.preloadFont('Poppins', '600');

      const loadedFonts = optimizer.getLoadedFonts();
      expect(loadedFonts).toHaveLength(2);
    });
  });

  describe('CSS Optimization', () => {
    let optimizer: CSSOptimizer;

    beforeEach(() => {
      optimizer = new CSSOptimizer();
    });

    it('should inline critical CSS', () => {
      const css = 'body { margin: 0; }';
      
      optimizer.inlineCriticalCSS(css);

      expect(mockDocument.createElement).toHaveBeenCalledWith('style');
      expect(mockDocument.head.insertBefore).toHaveBeenCalled();
    });

    it('should not inline the same CSS twice', () => {
      const css = 'body { margin: 0; }';
      
      optimizer.inlineCriticalCSS(css);
      optimizer.inlineCriticalCSS(css);

      expect(mockDocument.createElement).toHaveBeenCalledTimes(1);
    });

    it('should load non-critical CSS with low priority', async () => {
      const href = '/css/non-critical.css';
      const mockLink = {
        rel: '',
        href: '',
        media: '',
        onload: null,
        onerror: null
      };
      
      mockDocument.createElement.mockReturnValue(mockLink);

      const promise = optimizer.loadNonCriticalCSS(href);
      
      // Simulate load event
      if (mockLink.onload) {
        mockLink.onload();
      }

      await expect(promise).resolves.toBeUndefined();
      expect(mockLink.media).toBe('all');
    });

    it('should preload CSS files', () => {
      const href = '/css/styles.css';
      
      optimizer.preloadCSS(href);

      expect(mockDocument.createElement).toHaveBeenCalledWith('link');
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it('should remove critical CSS', () => {
      const mockElements = [
        { remove: vi.fn() },
        { remove: vi.fn() }
      ];
      
      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      optimizer.removeCriticalCSS();

      mockElements.forEach(element => {
        expect(element.remove).toHaveBeenCalled();
      });
    });
  });

  describe('Service Worker Management', () => {
    let manager: ServiceWorkerManager;

    beforeEach(() => {
      manager = new ServiceWorkerManager();
      
      // Mock navigator.serviceWorker
      Object.defineProperty(global, 'navigator', {
        value: {
          serviceWorker: {
            register: vi.fn().mockResolvedValue({
              installing: null,
              waiting: null,
              active: null,
              addEventListener: vi.fn(),
              postMessage: vi.fn(),
              update: vi.fn().mockResolvedValue(undefined),
              unregister: vi.fn().mockResolvedValue(true)
            }),
            addEventListener: vi.fn()
          }
        },
        writable: true
      });
    });

    it('should register service worker', async () => {
      const registration = await manager.register('/sw.js');

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
      expect(registration).toBeDefined();
    });

    it('should handle service worker registration failure', async () => {
      navigator.serviceWorker.register = vi.fn().mockRejectedValue(new Error('Registration failed'));

      const registration = await manager.register('/sw.js');

      expect(registration).toBeNull();
    });

    it('should update service worker', async () => {
      await manager.register('/sw.js');
      await manager.update();

      // Should call update on registration
      expect(navigator.serviceWorker.register).toHaveBeenCalled();
    });

    it('should unregister service worker', async () => {
      await manager.register('/sw.js');
      const result = await manager.unregister();

      expect(result).toBe(true);
    });

    it('should handle missing service worker support', async () => {
      delete (global.navigator as any).serviceWorker;

      const registration = await manager.register('/sw.js');

      expect(registration).toBeNull();
    });
  });

  describe('Resource Prioritization', () => {
    let prioritizer: ResourcePrioritizer;

    beforeEach(() => {
      prioritizer = new ResourcePrioritizer();
    });

    it('should prioritize critical resources', () => {
      const url = '/js/critical.js';
      
      prioritizer.prioritizeResource(url, 'critical');

      expect(mockDocument.createElement).toHaveBeenCalledWith('link');
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it('should set correct attributes for different resource types', () => {
      const mockLink = {
        rel: '',
        as: '',
        href: '',
        fetchPriority: '',
        crossOrigin: ''
      };
      
      mockDocument.createElement.mockReturnValue(mockLink);

      // Test JavaScript file
      prioritizer.prioritizeResource('/js/app.js', 'high');
      expect(mockLink.as).toBe('script');

      // Test CSS file
      prioritizer.prioritizeResource('/css/styles.css', 'high');
      expect(mockLink.as).toBe('style');

      // Test font file
      prioritizer.prioritizeResource('/fonts/inter.woff2', 'high');
      expect(mockLink.as).toBe('font');
      expect(mockLink.crossOrigin).toBe('anonymous');

      // Test image file
      prioritizer.prioritizeResource('/images/hero.jpg', 'high');
      expect(mockLink.as).toBe('image');
    });

    it('should preload critical resources', () => {
      const resources = ['/js/critical.js', '/css/critical.css'];
      
      prioritizer.preloadCriticalResources(resources);

      expect(mockDocument.head.appendChild).toHaveBeenCalledTimes(2);
    });

    it('should prefetch next page resources during idle time', () => {
      const resources = ['/js/page2.js', '/css/page2.css'];
      
      // Mock requestIdleCallback
      Object.defineProperty(global, 'requestIdleCallback', {
        value: vi.fn((callback) => setTimeout(callback, 0)),
        writable: true
      });
      
      prioritizer.prefetchNextPageResources(resources);

      expect(global.requestIdleCallback).toHaveBeenCalled();
    });

    it('should fallback to setTimeout when requestIdleCallback is not available', () => {
      const resources = ['/js/page2.js'];
      
      // Remove requestIdleCallback
      delete (global as any).requestIdleCallback;
      
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      prioritizer.prefetchNextPageResources(resources);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('should track critical and preloaded resources', () => {
      prioritizer.prioritizeResource('/js/critical.js', 'critical');
      prioritizer.prioritizeResource('/js/normal.js', 'high');

      const criticalResources = prioritizer.getCriticalResources();
      const preloadedResources = prioritizer.getPreloadedResources();

      expect(criticalResources).toContain('/js/critical.js');
      expect(preloadedResources).toHaveLength(2);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet image optimization performance targets', async () => {
      const startTime = performance.now();
      
      const optimizer = new ImageOptimizer();
      const urls = Array.from({ length: 10 }, (_, i) => `/images/test-${i}.jpg`);
      
      await optimizer.preloadImages(urls);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
    });

    it('should efficiently manage font loading', async () => {
      const optimizer = new FontOptimizer();
      
      const startTime = performance.now();
      await optimizer.loadCriticalFonts();
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // Font loading should be fast
      expect(duration).toBeLessThan(500); // 500ms
    });

    it('should handle large numbers of resources efficiently', () => {
      const prioritizer = new ResourcePrioritizer();
      
      const startTime = performance.now();
      
      // Preload many resources
      const resources = Array.from({ length: 100 }, (_, i) => `/js/chunk-${i}.js`);
      prioritizer.preloadCriticalResources(resources);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle large numbers efficiently
      expect(duration).toBeLessThan(100); // 100ms
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle image loading failures gracefully', async () => {
      // Mock Image to fail
      class FailingImage {
        onerror: (() => void) | null = null;
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 10);
        }
      }
      
      Object.defineProperty(global, 'Image', { value: FailingImage, writable: true });
      
      const optimizer = new ImageOptimizer();
      const urls = ['/images/failing.jpg'];
      
      await expect(optimizer.preloadImages(urls)).rejects.toBeDefined();
    });

    it('should handle font loading failures gracefully', async () => {
      // Mock FontFace to fail
      class FailingFontFace {
        load(): Promise<never> {
          return Promise.reject(new Error('Font load failed'));
        }
      }
      
      Object.defineProperty(global, 'FontFace', { value: FailingFontFace, writable: true });
      
      const optimizer = new FontOptimizer();
      
      // Should not throw, but handle gracefully
      await expect(optimizer.loadCriticalFonts()).resolves.toBeUndefined();
    });

    it('should handle missing DOM APIs gracefully', () => {
      // Remove document
      delete (global as any).document;
      
      const optimizer = new CSSOptimizer();
      
      // Should not throw errors
      expect(() => {
        optimizer.inlineCriticalCSS('body { margin: 0; }');
      }).not.toThrow();
    });
  });
});