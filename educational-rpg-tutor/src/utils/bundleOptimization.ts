/**
 * Bundle Optimization Utilities
 * Code splitting, lazy loading, and performance optimization utilities
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Dynamic import wrapper with error handling
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
): LazyExoticComponent<T> => {
  return lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error('Failed to load component:', error);
      
      // Return fallback component if available
      if (fallback) {
        return { default: fallback };
      }
      
      // Return minimal error component
      return {
        default: (() => {
          const div = document.createElement('div');
          div.className = 'p-4 text-center text-red-600';
          div.innerHTML = `
            <p>Failed to load component</p>
            <button class="mt-2 px-4 py-2 bg-red-100 rounded hover:bg-red-200" onclick="window.location.reload()">
              Retry
            </button>
          `;
          return div;
        }) as T
      };
    }
  });
};

// Preload component for better UX
export const preloadComponent = (importFn: () => Promise<any>): void => {
  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(error => {
        console.warn('Failed to preload component:', error);
      });
    });
  } else {
    setTimeout(() => {
      importFn().catch(error => {
        console.warn('Failed to preload component:', error);
      });
    }, 100);
  }
};

// Resource hints for better loading performance
export const addResourceHints = (urls: string[], type: 'preload' | 'prefetch' = 'prefetch'): void => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = type;
    link.href = url;
    
    // Add appropriate attributes based on file type
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.match(/\.(woff2?|ttf|otf)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (url.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (css: string): void => {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
};

// Service Worker registration for caching
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, notify user
              const event = new CustomEvent('sw-update-available');
              window.dispatchEvent(event);
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  return null;
};

// Bundle analyzer data collection
export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  duplicates: string[];
  unusedExports: string[];
}

export const analyzeBundleSize = (): BundleAnalysis => {
  // This would integrate with webpack-bundle-analyzer or similar
  // For now, return mock data structure
  return {
    totalSize: 0,
    gzippedSize: 0,
    chunks: [],
    duplicates: [],
    unusedExports: []
  };
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observer?: PerformanceObserver;

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric(entry.name, entry.duration || entry.startTime);
        });
      });

      this.observer.observe({ 
        entryTypes: ['navigation', 'resource', 'measure', 'paint'] 
      });
    }
  }

  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      
      // Also create a performance mark
      if ('performance' in window && 'mark' in performance) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
    });
  }

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    
    try {
      const result = fn();
      return result;
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }

  getWebVitals(): Promise<{
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};
      
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          vitals.FCP = fcp.startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.CLS = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        vitals.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      // Return results after a delay to collect metrics
      setTimeout(() => {
        resolve(vitals);
      }, 3000);
    });
  }

  dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Image optimization utilities
export const optimizeImage = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string => {
  const { width, height, quality = 80, format = 'auto' } = options;
  
  // This would integrate with an image optimization service
  // For now, return the original src with query parameters
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality !== 80) params.set('q', quality.toString());
  if (format !== 'auto') params.set('f', format);
  
  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
};

// Font loading optimization
export const optimizeFontLoading = (fonts: Array<{
  family: string;
  weight?: string;
  style?: string;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}>): void => {
  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    
    // Construct font URL (this would be your actual font URL)
    const fontUrl = `/fonts/${font.family.toLowerCase().replace(/\s+/g, '-')}-${font.weight || 'regular'}.woff2`;
    link.href = fontUrl;
    
    document.head.appendChild(link);
  });
};

// Tree shaking utilities
export const createTreeShakableExport = <T extends Record<string, any>>(
  modules: T
): T => {
  // This helps with tree shaking by creating individual exports
  return new Proxy(modules, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof T];
      }
      
      console.warn(`Module ${String(prop)} not found in tree-shakable export`);
      return undefined;
    }
  });
};

// Code splitting by route
export const createRouteBasedSplit = (routes: Record<string, () => Promise<any>>) => {
  const loadedRoutes = new Map<string, any>();
  
  return {
    loadRoute: async (routeName: string) => {
      if (loadedRoutes.has(routeName)) {
        return loadedRoutes.get(routeName);
      }
      
      const loader = routes[routeName];
      if (!loader) {
        throw new Error(`Route ${routeName} not found`);
      }
      
      try {
        const module = await loader();
        loadedRoutes.set(routeName, module);
        return module;
      } catch (error) {
        console.error(`Failed to load route ${routeName}:`, error);
        throw error;
      }
    },
    
    preloadRoute: (routeName: string) => {
      if (!loadedRoutes.has(routeName) && routes[routeName]) {
        preloadComponent(routes[routeName]);
      }
    },
    
    getLoadedRoutes: () => Array.from(loadedRoutes.keys())
  };
};

// Memory management utilities
export const createMemoryManager = () => {
  const refs = new Set<WeakRef<any>>();
  
  return {
    track: <T extends object>(obj: T): T => {
      refs.add(new WeakRef(obj));
      return obj;
    },
    
    cleanup: () => {
      // Force garbage collection if available (dev only)
      if (process.env.NODE_ENV === 'development' && 'gc' in window) {
        (window as any).gc();
      }
      
      // Clean up dead references
      const deadRefs = Array.from(refs).filter(ref => !ref.deref());
      deadRefs.forEach(ref => refs.delete(ref));
      
      return {
        totalRefs: refs.size,
        cleanedRefs: deadRefs.length
      };
    },
    
    getMemoryUsage: () => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    }
  };
};

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();