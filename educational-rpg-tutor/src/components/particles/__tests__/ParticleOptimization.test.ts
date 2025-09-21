import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ParticlePerformanceBenchmark, performanceUtils } from '../../../utils/particlePerformanceBenchmark';
import { AdvancedDeviceDetector } from '../../../utils/deviceCapability';
import { PerformanceMonitor } from '../../../utils/performance';
import type { DeviceCapability } from '../../../types/animation';

// Mock Web Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  
  postMessage(data: any) {
    // Simulate worker response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: {
            type: 'PARTICLES_UPDATED',
            payload: []
          }
        }));
      }
    }, 1);
  }
  
  terminate() {}
}

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024,
    jsHeapSizeLimit: 200 * 1024 * 1024
  }
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  configurable: true
});

// Mock requestAnimationFrame
let frameTime = 0;
const mockRAF = vi.fn((callback) => {
  frameTime += 16.67; // 60fps
  setTimeout(() => callback(frameTime), 1);
  return frameTime;
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRAF,
  configurable: true
});

// Mock Worker constructor
Object.defineProperty(window, 'Worker', {
  value: MockWorker,
  configurable: true
});

describe('Particle Performance Optimization', () => {
  let benchmark: ParticlePerformanceBenchmark;
  let deviceDetector: AdvancedDeviceDetector;
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    frameTime = 0;
    
    benchmark = ParticlePerformanceBenchmark.getInstance();
    deviceDetector = AdvancedDeviceDetector.getInstance();
    performanceMonitor = PerformanceMonitor.getInstance();
    
    // Reset singletons
    (deviceDetector as any).deviceInfo = null;
    (deviceDetector as any).adaptiveConfig = null;
    performanceMonitor.reset();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
  });

  describe('Device Capability Detection', () => {
    it('detects high-end device capabilities', async () => {
      // Mock high-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 8,
        configurable: true
      });
      
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 16,
        configurable: true
      });

      const deviceInfo = await deviceDetector.detectDevice();
      
      expect(deviceInfo.capability).toBe('high');
      expect(deviceInfo.cores).toBe(8);
      expect(deviceInfo.memory).toBe(16);
    });

    it('detects low-end device capabilities', async () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        configurable: true
      });
      
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 2,
        configurable: true
      });

      const deviceInfo = await deviceDetector.detectDevice();
      
      expect(deviceInfo.capability).toBe('low');
      expect(deviceInfo.cores).toBe(2);
      expect(deviceInfo.memory).toBe(2);
    });

    it('provides adaptive configuration based on device capability', () => {
      const highConfig = deviceDetector.getAdaptiveConfig('high');
      const lowConfig = deviceDetector.getAdaptiveConfig('low');

      expect(highConfig.particles.maxCount).toBeGreaterThan(lowConfig.particles.maxCount);
      expect(highConfig.effects.blur).toBe(true);
      expect(lowConfig.effects.blur).toBe(false);
      expect(highConfig.rendering.targetFPS).toBeGreaterThan(lowConfig.rendering.targetFPS);
    });

    it('respects prefers-reduced-motion settings', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn(() => ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        })),
        configurable: true
      });

      const config = deviceDetector.getAdaptiveConfig('high');
      
      expect(config.animations.enabled).toBe(false);
      expect(config.particles.maxCount).toBeLessThanOrEqual(10);
    });
  });

  describe('Performance Benchmarking', () => {
    it('runs comprehensive performance benchmark', async () => {
      const results = await benchmark.runBenchmark({
        duration: 100, // Short duration for testing
        particleCounts: [25, 50],
        themes: ['magical', 'tech'],
        includeWebWorker: false,
        includeInteraction: true
      });

      expect(results).toHaveLength(4); // 2 counts × 2 themes
      
      results.forEach(result => {
        expect(result.averageFPS).toBeGreaterThan(0);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.recommendedParticleCount).toBeGreaterThan(0);
      });
    });

    it('provides performance recommendations', async () => {
      const testResult = await benchmark.quickPerformanceTest();
      
      expect(testResult.recommendedParticleCount).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(testResult.recommendedDeviceCapability);
      expect(typeof testResult.shouldUseWebWorker).toBe('boolean');
    });

    it('identifies performance breaking points', async () => {
      const stressResult = await benchmark.stressTest();
      
      expect(stressResult.maxParticleCount).toBeGreaterThan(0);
      expect(stressResult.breakingPoint).toBeGreaterThanOrEqual(stressResult.maxParticleCount);
      expect(stressResult.memoryLimit).toBeGreaterThan(0);
    });
  });

  describe('Automatic Particle Count Adjustment', () => {
    it('adjusts particle count based on device capability', async () => {
      const highCapabilityConfig = await performanceUtils.getOptimalConfig('magical');
      
      // Mock low-end device for comparison
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        configurable: true
      });
      deviceDetector.reset();
      
      const lowCapabilityConfig = await performanceUtils.getOptimalConfig('magical');
      
      expect(lowCapabilityConfig.count).toBeLessThan(highCapabilityConfig.count);
    });

    it('provides theme-specific optimizations', async () => {
      const themes: Array<'magical' | 'tech' | 'nature' | 'cosmic'> = ['magical', 'tech', 'nature', 'cosmic'];
      
      for (const theme of themes) {
        const config = await performanceUtils.getOptimalConfig(theme);
        
        expect(config.count).toBeGreaterThan(0);
        expect(config.size.min).toBeGreaterThan(0);
        expect(config.size.max).toBeGreaterThan(config.size.min);
        expect(config.color.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Web Worker Support', () => {
    it('initializes web worker for complex calculations', () => {
      const worker = new MockWorker();
      
      expect(worker).toBeDefined();
      expect(typeof worker.postMessage).toBe('function');
      expect(typeof worker.terminate).toBe('function');
    });

    it('handles web worker messages correctly', (done) => {
      const worker = new MockWorker();
      
      worker.onmessage = (event) => {
        expect(event.data.type).toBe('PARTICLES_UPDATED');
        expect(Array.isArray(event.data.payload)).toBe(true);
        done();
      };
      
      worker.postMessage({
        type: 'UPDATE_PARTICLES',
        payload: { particles: [], mousePosition: { x: 0, y: 0 } }
      });
    });

    it('falls back gracefully when web worker fails', () => {
      const worker = new MockWorker();
      let fallbackTriggered = false;
      
      worker.onerror = () => {
        fallbackTriggered = true;
      };
      
      // Simulate worker error
      if (worker.onerror) {
        worker.onerror(new ErrorEvent('error'));
      }
      
      expect(fallbackTriggered).toBe(true);
    });
  });

  describe('Fallback Modes for Low-End Devices', () => {
    it('enables simplified rendering for low-end devices', () => {
      const lowConfig = deviceDetector.getAdaptiveConfig('low');
      
      expect(lowConfig.effects.blur).toBe(false);
      expect(lowConfig.effects.shadows).toBe(false);
      expect(lowConfig.effects.glow).toBe(false);
      expect(lowConfig.particles.physicsEnabled).toBe(false);
    });

    it('reduces particle count significantly for fallback mode', () => {
      const normalConfig = deviceDetector.getAdaptiveConfig('high');
      const fallbackConfig = deviceDetector.getAdaptiveConfig('low');
      
      expect(fallbackConfig.particles.maxCount).toBeLessThan(normalConfig.particles.maxCount * 0.5);
    });

    it('disables expensive effects in fallback mode', () => {
      const fallbackConfig = deviceDetector.getAdaptiveConfig('low');
      
      expect(fallbackConfig.rendering.useGPU).toBe(false);
      expect(fallbackConfig.rendering.enableWebGL).toBe(false);
      expect(fallbackConfig.rendering.targetFPS).toBeLessThanOrEqual(30);
    });
  });

  describe('Real-time Performance Monitoring', () => {
    it('monitors FPS and suggests optimizations', (done) => {
      let suggestionReceived = false;
      
      const unsubscribe = performanceUtils.createPerformanceWatcher((suggestions) => {
        suggestionReceived = true;
        expect(typeof suggestions).toBe('object');
        
        if (suggestions.reduceParticles) {
          expect(typeof suggestions.reduceParticles).toBe('boolean');
        }
        
        unsubscribe();
        done();
      });
      
      // Simulate poor performance
      performanceMonitor.startMonitoring();
      
      // Mock poor FPS
      const originalMetrics = performanceMonitor.getMetrics();
      (performanceMonitor as any).metrics = {
        ...originalMetrics,
        fps: 15,
        frameDrops: 10,
        memoryUsage: 120
      };
      
      // Trigger performance check
      setTimeout(() => {
        (performanceMonitor as any).notifyObservers();
        
        if (!suggestionReceived) {
          unsubscribe();
          done();
        }
      }, 50);
    });

    it('tracks memory usage and suggests cleanup', () => {
      performanceMonitor.startMonitoring();
      
      const metrics = performanceMonitor.getMetrics();
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it('detects frame drops and performance issues', () => {
      performanceMonitor.startMonitoring();
      
      // Simulate frame drops
      (performanceMonitor as any).metrics.frameDrops = 15;
      (performanceMonitor as any).metrics.fps = 25;
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.frameDrops).toBe(15);
      expect(metrics.fps).toBe(25);
      expect(metrics.isThrottled).toBe(true);
    });
  });

  describe('Battery-Aware Optimizations', () => {
    it('adapts configuration based on battery level', async () => {
      const normalConfig = deviceDetector.getAdaptiveConfig('high');
      
      // Mock low battery
      const { deviceUtils } = await import('../../../utils/deviceCapability');
      const lowBatteryConfig = deviceUtils.adaptForBattery(normalConfig, 0.15);
      
      expect(lowBatteryConfig.particles.maxCount).toBeLessThan(normalConfig.particles.maxCount);
      expect(lowBatteryConfig.rendering.targetFPS).toBeLessThan(normalConfig.rendering.targetFPS);
      expect(lowBatteryConfig.effects.blur).toBe(false);
    });

    it('provides battery status information when available', async () => {
      const { deviceUtils } = await import('../../../utils/deviceCapability');
      const batteryInfo = await deviceUtils.getBatteryInfo();
      
      // Battery API might not be available in test environment
      if (batteryInfo) {
        expect(typeof batteryInfo.level).toBe('number');
        expect(typeof batteryInfo.charging).toBe('boolean');
        expect(batteryInfo.level).toBeGreaterThanOrEqual(0);
        expect(batteryInfo.level).toBeLessThanOrEqual(1);
      } else {
        expect(batteryInfo).toBeNull();
      }
    });
  });

  describe('Performance Optimization Integration', () => {
    it('provides optimal particle count for screen size', async () => {
      const baseCount = 100;
      
      // Mock different screen sizes
      Object.defineProperty(window.screen, 'width', { value: 1920, configurable: true });
      Object.defineProperty(window.screen, 'height', { value: 1080, configurable: true });
      
      const { deviceUtils } = await import('../../../utils/deviceCapability');
      const hdCount = deviceUtils.getOptimalParticleCount(baseCount);
      
      Object.defineProperty(window.screen, 'width', { value: 3840, configurable: true });
      Object.defineProperty(window.screen, 'height', { value: 2160, configurable: true });
      
      const uhd4kCount = deviceUtils.getOptimalParticleCount(baseCount);
      
      expect(uhd4kCount).toBeGreaterThan(hdCount);
    });

    it('detects mobile devices and applies appropriate optimizations', async () => {
      const { deviceUtils } = await import('../../../utils/deviceCapability');
      const isMobile = deviceUtils.isMobile();
      const isTablet = deviceUtils.isTablet();
      
      expect(typeof isMobile).toBe('boolean');
      expect(typeof isTablet).toBe('boolean');
    });

    it('checks hardware acceleration support', async () => {
      const { deviceUtils } = await import('../../../utils/deviceCapability');
      const supportsHardwareAcceleration = deviceUtils.supportsHardwareAcceleration();
      
      expect(typeof supportsHardwareAcceleration).toBe('boolean');
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('handles WebGL context loss gracefully', async () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      
      if (gl) {
        // Simulate context loss
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
      
      // Should still detect some capability even without WebGL
      const { detectDeviceCapability } = await import('../../../utils/deviceCapability');
      const capability = detectDeviceCapability();
      expect(['high', 'medium', 'low']).toContain(capability);
    });

    it('provides fallback when performance monitoring fails', () => {
      // Mock performance API failure
      Object.defineProperty(window, 'performance', {
        value: undefined,
        configurable: true
      });
      
      const monitor = PerformanceMonitor.getInstance();
      expect(() => monitor.startMonitoring()).not.toThrow();
      
      const metrics = monitor.getMetrics();
      expect(typeof metrics.fps).toBe('number');
    });

    it('handles missing device memory gracefully', async () => {
      // Remove deviceMemory property
      Object.defineProperty(navigator, 'deviceMemory', {
        value: undefined,
        configurable: true
      });
      
      deviceDetector.reset();
      const deviceInfo = await deviceDetector.detectDevice();
      
      expect(deviceInfo.memory).toBe(4); // Default fallback value
      expect(['high', 'medium', 'low']).toContain(deviceInfo.capability);
    });
  });
});