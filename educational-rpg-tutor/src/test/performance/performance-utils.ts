// Performance testing utilities for Educational RPG Tutor
import { vi } from 'vitest';

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize?: number;
  networkRequests?: number;
  cacheHitRate?: number;
}

export interface AnimationPerformanceMetrics {
  frameRate: number;
  droppedFrames: number;
  averageFrameTime: number;
  jankScore: number; // Higher is worse
}

export class PerformanceTester {
  private performanceObserver?: PerformanceObserver;
  private metrics: PerformanceMetrics[] = [];
  private animationMetrics: AnimationPerformanceMetrics[] = [];

  startMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          this.processPerformanceEntry(entry);
        }
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  }

  stopMonitoring(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = undefined;
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    if (entry.entryType === 'measure') {
      // Process custom measurements
      this.metrics.push({
        renderTime: entry.duration,
        memoryUsage: this.getCurrentMemoryUsage()
      });
    }
  }

  measureRenderPerformance<T>(
    renderFunction: () => T,
    label: string = 'render'
  ): { result: T; metrics: PerformanceMetrics } {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    const result = renderFunction();

    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();

    const metrics: PerformanceMetrics = {
      renderTime: endTime - startTime,
      memoryUsage: endMemory - startMemory
    };

    // Mark the measurement for PerformanceObserver
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${label}-start`);
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
    }

    return { result, metrics };
  }

  async measureAsyncPerformance<T>(
    asyncFunction: () => Promise<T>,
    label: string = 'async-operation'
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    const result = await asyncFunction();

    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();

    const metrics: PerformanceMetrics = {
      renderTime: endTime - startTime,
      memoryUsage: endMemory - startMemory
    };

    return { result, metrics };
  }

  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  getAverageMetrics(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;

    const totals = this.metrics.reduce(
      (acc, metric) => ({
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        networkRequests: (acc.networkRequests || 0) + (metric.networkRequests || 0),
        bundleSize: Math.max(acc.bundleSize || 0, metric.bundleSize || 0)
      }),
      { renderTime: 0, memoryUsage: 0, networkRequests: 0, bundleSize: 0 }
    );

    return {
      renderTime: totals.renderTime / this.metrics.length,
      memoryUsage: totals.memoryUsage / this.metrics.length,
      networkRequests: totals.networkRequests / this.metrics.length,
      bundleSize: totals.bundleSize
    };
  }

  reset(): void {
    this.metrics = [];
    this.animationMetrics = [];
  }
}

// Animation performance testing
export class AnimationTester {
  private frameCount = 0;
  private droppedFrames = 0;
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private isMonitoring = false;
  private animationId?: number;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
    
    this.monitorFrame();
  }

  stopMonitoring(): AnimationPerformanceMetrics {
    this.isMonitoring = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const averageFrameTime = this.frameTimes.length > 0 
      ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length 
      : 0;

    const frameRate = this.frameCount > 0 ? 1000 / averageFrameTime : 0;
    const jankScore = this.calculateJankScore();

    return {
      frameRate,
      droppedFrames: this.droppedFrames,
      averageFrameTime,
      jankScore
    };
  }

  private monitorFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    
    this.frameTimes.push(frameTime);
    this.frameCount++;

    // Consider frame dropped if it took longer than 16.67ms (60fps threshold)
    if (frameTime > 16.67) {
      this.droppedFrames++;
    }

    this.lastFrameTime = currentTime;
    this.animationId = requestAnimationFrame(this.monitorFrame);
  };

  private calculateJankScore(): number {
    if (this.frameTimes.length === 0) return 0;

    // Jank score based on frame time variance and dropped frames
    const variance = this.calculateVariance(this.frameTimes);
    const droppedFrameRatio = this.droppedFrames / this.frameCount;
    
    return variance * 0.7 + droppedFrameRatio * 100 * 0.3;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }
}

// Bundle size analysis
export class BundleAnalyzer {
  static async analyzeBundleSize(): Promise<{ totalSize: number; gzippedSize: number; chunks: any[] }> {
    // This would typically analyze the actual bundle
    // For testing purposes, we'll simulate the analysis
    return {
      totalSize: 1024 * 1024, // 1MB
      gzippedSize: 300 * 1024, // 300KB
      chunks: [
        { name: 'main', size: 500 * 1024 },
        { name: 'vendor', size: 400 * 1024 },
        { name: 'runtime', size: 124 * 1024 }
      ]
    };
  }

  static checkBundleSizeThresholds(analysis: { totalSize: number; gzippedSize: number }): {
    withinLimits: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Check total bundle size (should be under 2MB)
    if (analysis.totalSize > 2 * 1024 * 1024) {
      warnings.push(`Total bundle size (${Math.round(analysis.totalSize / 1024 / 1024)}MB) exceeds 2MB limit`);
    }

    // Check gzipped size (should be under 500KB)
    if (analysis.gzippedSize > 500 * 1024) {
      warnings.push(`Gzipped bundle size (${Math.round(analysis.gzippedSize / 1024)}KB) exceeds 500KB limit`);
    }

    return {
      withinLimits: warnings.length === 0,
      warnings
    };
  }
}

// Network performance testing
export class NetworkTester {
  private requestTimes: Map<string, number> = new Map();
  private responses: Array<{ url: string; duration: number; size: number; cached: boolean }> = [];

  mockNetworkRequest(url: string, responseSize: number, cached: boolean = false): Promise<any> {
    const startTime = performance.now();
    
    // Simulate network latency
    const latency = cached ? 10 : Math.random() * 200 + 50; // 10ms for cached, 50-250ms for uncached
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.responses.push({
          url,
          duration,
          size: responseSize,
          cached
        });

        resolve({ data: `Mock response for ${url}`, size: responseSize });
      }, latency);
    });
  }

  getNetworkMetrics(): {
    totalRequests: number;
    averageResponseTime: number;
    cacheHitRate: number;
    totalDataTransferred: number;
  } {
    if (this.responses.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        totalDataTransferred: 0
      };
    }

    const totalRequests = this.responses.length;
    const averageResponseTime = this.responses.reduce((sum, r) => sum + r.duration, 0) / totalRequests;
    const cachedRequests = this.responses.filter(r => r.cached).length;
    const cacheHitRate = cachedRequests / totalRequests;
    const totalDataTransferred = this.responses.reduce((sum, r) => sum + r.size, 0);

    return {
      totalRequests,
      averageResponseTime,
      cacheHitRate,
      totalDataTransferred
    };
  }

  reset(): void {
    this.requestTimes.clear();
    this.responses = [];
  }
}

// Component rendering performance utilities
export const measureComponentRender = (componentName: string) => {
  return {
    start: () => {
      performance.mark(`${componentName}-render-start`);
    },
    end: () => {
      performance.mark(`${componentName}-render-end`);
      performance.measure(`${componentName}-render`, `${componentName}-render-start`, `${componentName}-render-end`);
      
      const measure = performance.getEntriesByName(`${componentName}-render`)[0];
      return measure ? measure.duration : 0;
    }
  };
};

// Memory leak detection
export class MemoryLeakDetector {
  private initialMemory: number;
  private samples: Array<{ timestamp: number; memory: number }> = [];
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.initialMemory = this.getCurrentMemoryUsage();
  }

  startMonitoring(intervalMs: number = 1000): void {
    this.intervalId = setInterval(() => {
      this.samples.push({
        timestamp: Date.now(),
        memory: this.getCurrentMemoryUsage()
      });
    }, intervalMs);
  }

  stopMonitoring(): {
    hasLeak: boolean;
    memoryGrowth: number;
    growthRate: number; // bytes per second
    samples: Array<{ timestamp: number; memory: number }>;
  } {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    if (this.samples.length < 2) {
      return {
        hasLeak: false,
        memoryGrowth: 0,
        growthRate: 0,
        samples: this.samples
      };
    }

    const finalMemory = this.samples[this.samples.length - 1].memory;
    const memoryGrowth = finalMemory - this.initialMemory;
    const timeSpan = this.samples[this.samples.length - 1].timestamp - this.samples[0].timestamp;
    const growthRate = memoryGrowth / (timeSpan / 1000); // bytes per second

    // Consider it a leak if memory grew by more than 10MB or growth rate > 1MB/s
    const hasLeak = memoryGrowth > 10 * 1024 * 1024 || growthRate > 1024 * 1024;

    return {
      hasLeak,
      memoryGrowth,
      growthRate,
      samples: this.samples
    };
  }

  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}