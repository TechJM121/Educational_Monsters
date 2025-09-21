/**
 * Performance Monitoring Utilities
 * Provides tools for monitoring animation performance, FPS tracking, and device capability detection
 */

import type { PerformanceMetrics, DeviceCapability } from '../types/animation';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private frameCount = 0;
  private lastTime = 0;
  private rafId: number | null = null;
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];

  private constructor() {
    this.metrics = {
      fps: 60,
      frameDrops: 0,
      memoryUsage: 0,
      averageFrameTime: 16.67,
      lastMeasurement: performance.now(),
      isThrottled: false,
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.rafId) return;

    const measureFrame = (currentTime: number) => {
      if (this.lastTime) {
        const frameTime = currentTime - this.lastTime;
        this.frameCount++;

        // Calculate FPS
        if (this.frameCount % 60 === 0) {
          const fps = Math.round(1000 / (frameTime || 16.67));
          const frameDrops = fps < 55 ? this.metrics.frameDrops + 1 : this.metrics.frameDrops;
          
          this.metrics = {
            ...this.metrics,
            fps,
            frameDrops,
            averageFrameTime: frameTime,
            lastMeasurement: currentTime,
            isThrottled: fps < 45,
          };

          // Update memory usage if available
          if ('memory' in performance) {
            this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576; // MB
          }

          this.notifyObservers();
        }
      }

      this.lastTime = currentTime;
      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  stopMonitoring(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.metrics));
  }

  reset(): void {
    this.metrics = {
      fps: 60,
      frameDrops: 0,
      memoryUsage: 0,
      averageFrameTime: 16.67,
      lastMeasurement: performance.now(),
      isThrottled: false,
    };
    this.frameCount = 0;
  }
}

/**
 * Device Capability Detection
 * Determines device performance tier for adaptive animation complexity
 */
export class DeviceCapabilityDetector {
  private static cachedCapability: DeviceCapability | null = null;

  static detect(): DeviceCapability {
    if (this.cachedCapability) {
      return this.cachedCapability;
    }

    const capability = this.performDetection();
    this.cachedCapability = capability;
    return capability;
  }

  private static performDetection(): DeviceCapability {
    let score = 0;

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;
    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else if (cores >= 2) score += 1;

    // Check device memory (if available)
    const memory = (navigator as any).deviceMemory || 4;
    if (memory >= 8) score += 3;
    else if (memory >= 4) score += 2;
    else if (memory >= 2) score += 1;

    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (gl) {
      const renderer = gl.getParameter(gl.RENDERER) || '';
      
      // Check for dedicated GPU indicators
      if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Intel Iris')) {
        score += 2;
      } else if (renderer.includes('Intel')) {
        score += 1;
      }

      // Check WebGL extensions
      const extensions = gl.getSupportedExtensions() || [];
      if (extensions.length > 20) score += 1;
    }

    // Check connection type (if available)
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '4g' || connection.downlink > 10) {
        score += 1;
      }
    }

    // Determine capability tier
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  static getCapabilityConfig(capability: DeviceCapability) {
    const configs = {
      high: {
        maxParticles: 150,
        enableBlur: true,
        enable3D: true,
        animationComplexity: 'full',
        frameRate: 60,
      },
      medium: {
        maxParticles: 75,
        enableBlur: true,
        enable3D: false,
        animationComplexity: 'reduced',
        frameRate: 30,
      },
      low: {
        maxParticles: 25,
        enableBlur: false,
        enable3D: false,
        animationComplexity: 'minimal',
        frameRate: 30,
      },
    };

    return configs[capability];
  }

  static reset(): void {
    this.cachedCapability = null;
  }
}

/**
 * Animation Performance Utilities
 */
export const animationUtils = {
  /**
   * Debounce function for performance-sensitive operations
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for high-frequency events
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Check if element is in viewport for intersection-based animations
   */
  isInViewport(element: Element, threshold = 0.1): boolean {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0;
    const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0;

    return vertInView && horInView;
  },

  /**
   * Optimize animation timing based on device capability
   */
  getOptimizedDuration(baseDuration: number, capability: DeviceCapability): number {
    const multipliers = {
      high: 1,
      medium: 0.8,
      low: 0.6,
    };
    return baseDuration * multipliers[capability];
  },

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};

/**
 * Memory management utilities for animations
 */
export const memoryUtils = {
  /**
   * Clean up animation-related objects
   */
  cleanup(objects: any[]): void {
    objects.forEach(obj => {
      if (obj && typeof obj.dispose === 'function') {
        obj.dispose();
      }
    });
  },

  /**
   * Monitor memory usage and trigger cleanup if needed
   */
  monitorMemory(threshold = 100): boolean {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      return usedMB > threshold;
    }
    return false;
  },
};