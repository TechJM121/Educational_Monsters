/**
 * Asset Optimization and Caching Strategies
 * Comprehensive asset loading, optimization, and caching utilities
 */

// Image optimization and lazy loading
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  lazy?: boolean;
  placeholder?: 'blur' | 'empty' | string;
}

export class ImageOptimizer {
  private cache = new Map<string, HTMLImageElement>();
  private observer?: IntersectionObserver;

  constructor() {
    this.initializeIntersectionObserver();
  }

  private initializeIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  optimizeImageUrl(src: string, options: ImageOptimizationOptions = {}): string {
    const { width, height, quality = 80, format = 'auto' } = options;
    
    // Create optimized URL (this would integrate with your image service)
    const url = new URL(src, window.location.origin);
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 80) params.set('q', quality.toString());
    if (format !== 'auto') params.set('f', format);
    
    // Add responsive image parameters
    if (window.devicePixelRatio > 1) {
      params.set('dpr', Math.min(window.devicePixelRatio, 3).toString());
    }
    
    const queryString = params.toString();
    return queryString ? `${url.pathname}?${queryString}` : src;
  }

  createResponsiveImageSet(src: string, breakpoints: number[]): string {
    return breakpoints
      .map(width => {
        const optimizedSrc = this.optimizeImageUrl(src, { width });
        return `${optimizedSrc} ${width}w`;
      })
      .join(', ');
  }

  lazyLoadImage(img: HTMLImageElement, src: string, options: ImageOptimizationOptions = {}): void {
    if (options.lazy && this.observer) {
      img.dataset.src = this.optimizeImageUrl(src, options);
      this.observer.observe(img);
    } else {
      this.loadImage(img, src, options);
    }
  }

  private loadImage(img: HTMLImageElement, src?: string, options: ImageOptimizationOptions = {}): void {
    const imageSrc = src || img.dataset.src;
    if (!imageSrc) return;

    const optimizedSrc = this.optimizeImageUrl(imageSrc, options);
    
    // Check cache first
    if (this.cache.has(optimizedSrc)) {
      img.src = optimizedSrc;
      img.classList.add('loaded');
      return;
    }

    // Create new image for preloading
    const preloadImg = new Image();
    
    preloadImg.onload = () => {
      this.cache.set(optimizedSrc, preloadImg);
      img.src = optimizedSrc;
      img.classList.add('loaded');
      
      // Trigger fade-in animation
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease-out';
      requestAnimationFrame(() => {
        img.style.opacity = '1';
      });
    };
    
    preloadImg.onerror = () => {
      img.classList.add('error');
      console.error('Failed to load image:', optimizedSrc);
    };
    
    preloadImg.src = optimizedSrc;
  }

  preloadImages(urls: string[], options: ImageOptimizationOptions = {}): Promise<void[]> {
    return Promise.all(
      urls.map(url => {
        return new Promise<void>((resolve, reject) => {
          const optimizedUrl = this.optimizeImageUrl(url, options);
          
          if (this.cache.has(optimizedUrl)) {
            resolve();
            return;
          }
          
          const img = new Image();
          img.onload = () => {
            this.cache.set(optimizedUrl, img);
            resolve();
          };
          img.onerror = reject;
          img.src = optimizedUrl;
        });
      })
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Font optimization and loading
export class FontOptimizer {
  private loadedFonts = new Set<string>();
  private fontDisplay: FontDisplay = 'swap';

  constructor(fontDisplay: FontDisplay = 'swap') {
    this.fontDisplay = fontDisplay;
  }

  preloadFont(fontFamily: string, fontWeight: string = '400', fontStyle: string = 'normal'): void {
    const fontKey = `${fontFamily}-${fontWeight}-${fontStyle}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = this.getFontUrl(fontFamily, fontWeight, fontStyle);
    
    document.head.appendChild(link);
    this.loadedFonts.add(fontKey);
  }

  loadFontFace(fontFamily: string, fontWeight: string = '400', fontStyle: string = 'normal'): Promise<FontFace> {
    const fontUrl = this.getFontUrl(fontFamily, fontWeight, fontStyle);
    
    const fontFace = new FontFace(fontFamily, `url(${fontUrl})`, {
      weight: fontWeight,
      style: fontStyle,
      display: this.fontDisplay
    });

    return fontFace.load().then(loadedFace => {
      document.fonts.add(loadedFace);
      return loadedFace;
    });
  }

  private getFontUrl(fontFamily: string, fontWeight: string, fontStyle: string): string {
    // This would be your actual font URL structure
    const familySlug = fontFamily.toLowerCase().replace(/\s+/g, '-');
    const styleSlug = fontStyle === 'italic' ? 'italic' : 'normal';
    return `/fonts/${familySlug}-${fontWeight}-${styleSlug}.woff2`;
  }

  async loadCriticalFonts(): Promise<void> {
    const criticalFonts = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '500' },
      { family: 'Inter', weight: '600' },
      { family: 'Poppins', weight: '600' }
    ];

    await Promise.all(
      criticalFonts.map(font => 
        this.loadFontFace(font.family, font.weight).catch(error => {
          console.warn(`Failed to load font ${font.family} ${font.weight}:`, error);
        })
      )
    );
  }

  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }
}

// CSS optimization and critical CSS extraction
export class CSSOptimizer {
  private criticalCSS = new Set<string>();
  private nonCriticalCSS = new Set<string>();

  inlineCriticalCSS(css: string): void {
    if (this.criticalCSS.has(css)) return;

    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    
    // Insert at the beginning of head for highest priority
    const firstChild = document.head.firstChild;
    if (firstChild) {
      document.head.insertBefore(style, firstChild);
    } else {
      document.head.appendChild(style);
    }
    
    this.criticalCSS.add(css);
  }

  loadNonCriticalCSS(href: string): Promise<void> {
    if (this.nonCriticalCSS.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print'; // Load with low priority
      
      link.onload = () => {
        link.media = 'all'; // Apply styles after load
        this.nonCriticalCSS.add(href);
        resolve();
      };
      
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  preloadCSS(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    
    // Convert to stylesheet after load
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    
    document.head.appendChild(link);
  }

  removeCriticalCSS(): void {
    const criticalStyles = document.querySelectorAll('style[data-critical="true"]');
    criticalStyles.forEach(style => style.remove());
    this.criticalCSS.clear();
  }
}

// Service Worker for advanced caching
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  async register(scriptURL: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(scriptURL, {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdate();
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event);
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  private handleUpdate(): void {
    if (!this.registration?.installing) return;

    const newWorker = this.registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      }
    });
  }

  private handleMessage(event: MessageEvent): void {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', payload);
        break;
      case 'OFFLINE_READY':
        console.log('App ready for offline use');
        break;
      default:
        console.log('SW message:', event.data);
    }
  }

  private notifyUpdateAvailable(): void {
    const event = new CustomEvent('sw-update-available', {
      detail: { registration: this.registration }
    });
    window.dispatchEvent(event);
  }

  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) return;

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload page after activation
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  async update(): Promise<void> {
    if (!this.registration) return;
    
    await this.registration.update();
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;
    
    return await this.registration.unregister();
  }
}

// Resource loading prioritization
export class ResourcePrioritizer {
  private criticalResources = new Set<string>();
  private preloadedResources = new Set<string>();

  prioritizeResource(url: string, priority: 'critical' | 'high' | 'low' = 'high'): void {
    const link = document.createElement('link');
    
    switch (priority) {
      case 'critical':
        link.rel = 'preload';
        link.fetchPriority = 'high';
        this.criticalResources.add(url);
        break;
      case 'high':
        link.rel = 'preload';
        link.fetchPriority = 'high';
        break;
      case 'low':
        link.rel = 'prefetch';
        link.fetchPriority = 'low';
        break;
    }
    
    // Set appropriate 'as' attribute based on file type
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
    
    link.href = url;
    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  preloadCriticalResources(resources: string[]): void {
    resources.forEach(resource => {
      this.prioritizeResource(resource, 'critical');
    });
  }

  prefetchNextPageResources(resources: string[]): void {
    // Use requestIdleCallback for low-priority prefetching
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        resources.forEach(resource => {
          this.prioritizeResource(resource, 'low');
        });
      });
    } else {
      setTimeout(() => {
        resources.forEach(resource => {
          this.prioritizeResource(resource, 'low');
        });
      }, 1000);
    }
  }

  getCriticalResources(): string[] {
    return Array.from(this.criticalResources);
  }

  getPreloadedResources(): string[] {
    return Array.from(this.preloadedResources);
  }
}

// Global instances
export const imageOptimizer = new ImageOptimizer();
export const fontOptimizer = new FontOptimizer();
export const cssOptimizer = new CSSOptimizer();
export const serviceWorkerManager = new ServiceWorkerManager();
export const resourcePrioritizer = new ResourcePrioritizer();

// Initialization function
export const initializeAssetOptimization = async (): Promise<void> => {
  try {
    // Register service worker
    await serviceWorkerManager.register();
    
    // Load critical fonts
    await fontOptimizer.loadCriticalFonts();
    
    // Preload critical resources
    const criticalResources = [
      '/js/critical.js',
      '/css/critical.css',
      '/fonts/inter-400.woff2',
      '/fonts/inter-500.woff2'
    ];
    
    resourcePrioritizer.preloadCriticalResources(criticalResources);
    
    console.log('Asset optimization initialized');
  } catch (error) {
    console.error('Failed to initialize asset optimization:', error);
  }
};

// Performance monitoring for assets
export const trackAssetPerformance = (assetType: string, url: string, loadTime: number): void => {
  // Track asset loading performance
  if ('performance' in window && 'mark' in performance) {
    performance.mark(`${assetType}-${url}-loaded`);
  }
  
  // Send to analytics if available
  if ('gtag' in window) {
    (window as any).gtag('event', 'asset_load', {
      asset_type: assetType,
      asset_url: url,
      load_time: loadTime
    });
  }
};