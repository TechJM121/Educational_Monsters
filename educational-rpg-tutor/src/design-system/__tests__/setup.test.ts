/**
 * Design System Setup Tests
 * Verifies that the modern design system foundation is properly configured
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMonitor, DeviceCapabilityDetector } from '../../utils/performance';
import { AdvancedDeviceDetector } from '../../utils/deviceCapability';
import { designSystemConfig, initializeDesignSystem } from '../index';

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    },
  },
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Mock navigator properties
Object.defineProperty(navigator, 'hardwareConcurrency', {
  value: 4,
  configurable: true,
});

Object.defineProperty(navigator, 'deviceMemory', {
  value: 8,
  configurable: true,
});

// Mock canvas and WebGL
HTMLCanvasElement.prototype.getContext = vi.fn((type) => {
  if (type === 'webgl' || type === 'experimental-webgl') {
    return {
      getParameter: vi.fn((param) => {
        if (param === 'RENDERER') return 'Intel Iris Pro';
        if (param === 'VENDOR') return 'Intel Inc.';
        return 'Mock WebGL';
      }),
      getExtension: vi.fn(() => null),
      getSupportedExtensions: vi.fn(() => ['ext1', 'ext2', 'ext3']),
    };
  }
  return null;
});

describe('Design System Foundation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should have valid design system configuration', () => {
      expect(designSystemConfig).toBeDefined();
      expect(designSystemConfig.version).toBe('1.0.0');
      expect(designSystemConfig.name).toBe('Modern RPG UI');
      expect(designSystemConfig.animations.defaultDuration).toBe(300);
      expect(designSystemConfig.performance.targetFPS).toBe(60);
    });

    it('should have proper device tier thresholds', () => {
      expect(designSystemConfig.deviceTiers.high.minScore).toBe(12);
      expect(designSystemConfig.deviceTiers.medium.minScore).toBe(7);
      expect(designSystemConfig.deviceTiers.low.minScore).toBe(0);
    });

    it('should have accessibility settings', () => {
      expect(designSystemConfig.accessibility.respectReducedMotion).toBe(true);
      expect(designSystemConfig.accessibility.minContrastRatio).toBe(4.5);
    });
  });

  describe('Performance Monitor', () => {
    it('should create singleton instance', () => {
      const monitor1 = PerformanceMonitor.getInstance();
      const monitor2 = PerformanceMonitor.getInstance();
      expect(monitor1).toBe(monitor2);
    });

    it('should initialize with default metrics', () => {
      const monitor = PerformanceMonitor.getInstance();
      const metrics = monitor.getMetrics();
      
      expect(metrics.fps).toBe(60);
      expect(metrics.frameDrops).toBe(0);
      expect(metrics.isThrottled).toBe(false);
    });

    it('should start and stop monitoring', () => {
      const monitor = PerformanceMonitor.getInstance();
      
      monitor.startMonitoring();
      expect(requestAnimationFrame).toHaveBeenCalled();
      
      monitor.stopMonitoring();
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Device Capability Detection', () => {
    it('should detect device capability', () => {
      const capability = DeviceCapabilityDetector.detect();
      expect(['low', 'medium', 'high']).toContain(capability);
    });

    it('should provide capability-specific configuration', () => {
      const config = DeviceCapabilityDetector.getCapabilityConfig('high');
      expect(config.maxParticles).toBe(150);
      expect(config.enableBlur).toBe(true);
      expect(config.enable3D).toBe(true);
    });

    it('should adapt configuration for medium devices', () => {
      const config = DeviceCapabilityDetector.getCapabilityConfig('medium');
      expect(config.maxParticles).toBe(75);
      expect(config.enableBlur).toBe(true);
      expect(config.enable3D).toBe(false);
    });

    it('should adapt configuration for low-end devices', () => {
      const config = DeviceCapabilityDetector.getCapabilityConfig('low');
      expect(config.maxParticles).toBe(25);
      expect(config.enableBlur).toBe(false);
      expect(config.enable3D).toBe(false);
    });
  });

  describe('Advanced Device Detector', () => {
    it('should create singleton instance', () => {
      const detector1 = AdvancedDeviceDetector.getInstance();
      const detector2 = AdvancedDeviceDetector.getInstance();
      expect(detector1).toBe(detector2);
    });

    it('should detect device information', async () => {
      const detector = AdvancedDeviceDetector.getInstance();
      const deviceInfo = await detector.detectDevice();
      
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.capability).toMatch(/^(low|medium|high)$/);
      expect(deviceInfo.cores).toBeGreaterThan(0);
      expect(deviceInfo.memory).toBeGreaterThan(0);
      expect(deviceInfo.features).toBeDefined();
    });

    it('should provide adaptive configuration', () => {
      const detector = AdvancedDeviceDetector.getInstance();
      const config = detector.getAdaptiveConfig('high');
      
      expect(config.animations.enabled).toBe(true);
      expect(config.particles.maxCount).toBe(150);
      expect(config.effects.blur).toBe(true);
      expect(config.rendering.targetFPS).toBe(60);
    });
  });

  describe('Design System Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await initializeDesignSystem();
      
      expect(result).toBeDefined();
      expect(result.deviceInfo).toBeDefined();
      expect(result.performanceMonitor).toBeDefined();
      expect(result.deviceDetector).toBeDefined();
    });
  });

  describe('Animation Utilities', () => {
    it('should detect reduced motion preference', async () => {
      const { animationUtils } = await import('../../utils/performance');
      const prefersReduced = animationUtils.prefersReducedMotion();
      expect(typeof prefersReduced).toBe('boolean');
    });

    it('should optimize duration based on device capability', async () => {
      const { animationUtils } = await import('../../utils/performance');
      
      const baseDuration = 1000;
      const highDuration = animationUtils.getOptimizedDuration(baseDuration, 'high');
      const mediumDuration = animationUtils.getOptimizedDuration(baseDuration, 'medium');
      const lowDuration = animationUtils.getOptimizedDuration(baseDuration, 'low');
      
      expect(highDuration).toBe(1000);
      expect(mediumDuration).toBe(800);
      expect(lowDuration).toBe(600);
    });
  });

  describe('Memory Management', () => {
    it('should monitor memory usage', async () => {
      const { memoryUtils } = await import('../../utils/performance');
      const isOverThreshold = memoryUtils.monitorMemory(100);
      expect(typeof isOverThreshold).toBe('boolean');
    });

    it('should cleanup objects with dispose method', async () => {
      const { memoryUtils } = await import('../../utils/performance');
      const mockObject = { dispose: vi.fn() };
      
      memoryUtils.cleanup([mockObject]);
      expect(mockObject.dispose).toHaveBeenCalled();
    });
  });
});