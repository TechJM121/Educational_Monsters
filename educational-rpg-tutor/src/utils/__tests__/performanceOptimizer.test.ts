import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceOptimizer } from '../performanceOptimizer';
import { PerformanceMetrics } from '../../hooks/usePerformanceMonitor';

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;

  beforeEach(() => {
    optimizer = new PerformanceOptimizer();
  });

  describe('getSettingsForDevice', () => {
    it('should return high performance settings for high-end devices', () => {
      const settings = optimizer.getSettingsForDevice('high');
      
      expect(settings.particleCount).toBe(150);
      expect(settings.blurEffects).toBe('full');
      expect(settings.shadowEffects).toBe('full');
      expect(settings.enableGPUAcceleration).toBe(true);
      expect(settings.enable3DTransforms).toBe(true);
      expect(settings.enableParallax).toBe(true);
    });

    it('should return medium performance settings for medium devices', () => {
      const settings = optimizer.getSettingsForDevice('medium');
      
      expect(settings.particleCount).toBe(75);
      expect(settings.blurEffects).toBe('reduced');
      expect(settings.shadowEffects).toBe('reduced');
      expect(settings.enableGPUAcceleration).toBe(true);
      expect(settings.enable3DTransforms).toBe(true);
      expect(settings.enableParallax).toBe(false);
    });

    it('should return low performance settings for low-end devices', () => {
      const settings = optimizer.getSettingsForDevice('low');
      
      expect(settings.particleCount).toBe(25);
      expect(settings.blurEffects).toBe('disabled');
      expect(settings.shadowEffects).toBe('disabled');
      expect(settings.enableGPUAcceleration).toBe(false);
      expect(settings.enable3DTransforms).toBe(false);
      expect(settings.enableParallax).toBe(false);
    });
  });

  describe('optimizeBasedOnMetrics', () => {
    it('should not optimize when performance is good', () => {
      const goodMetrics: PerformanceMetrics = {
        fps: 60,
        averageFPS: 60,
        frameDrops: 0,
        memoryUsage: 50,
        animationDuration: 16,
        isPerformanceGood: true,
        deviceCapability: 'high'
      };

      const initialSettings = optimizer.getCurrentSettings();
      const optimizedSettings = optimizer.optimizeBasedOnMetrics(goodMetrics);
      
      expect(optimizedSettings).toEqual(initialSettings);
      expect(optimizer.getAppliedOptimizations()).toHaveLength(0);
    });

    it('should reduce particles when FPS is low', () => {
      const poorMetrics: PerformanceMetrics = {
        fps: 40,
        averageFPS: 42,
        frameDrops: 15,
        memoryUsage: 80,
        animationDuration: 20,
        isPerformanceGood: false,
        deviceCapability: 'high'
      };

      const initialParticleCount = optimizer.getCurrentSettings().particleCount;
      const optimizedSettings = optimizer.optimizeBasedOnMetrics(poorMetrics);
      
      expect(optimizedSettings.particleCount).toBeLessThan(initialParticleCount);
      expect(optimizer.getAppliedOptimizations()).toContain('reduce-particles');
    });

    it('should disable blur effects when performance is very poor', () => {
      // First trigger particle reduction
      const poorMetrics1: PerformanceMetrics = {
        fps: 40,
        averageFPS: 42,
        frameDrops: 15,
        memoryUsage: 80,
        animationDuration: 20,
        isPerformanceGood: false,
        deviceCapability: 'medium'
      };

      optimizer.optimizeBasedOnMetrics(poorMetrics1);
      
      // Then trigger blur disable with worse performance
      const veryPoorMetrics: PerformanceMetrics = {
        fps: 35,
        averageFPS: 38,
        frameDrops: 20,
        memoryUsage: 120,
        animationDuration: 30,
        isPerformanceGood: false,
        deviceCapability: 'medium'
      };

      const optimizedSettings = optimizer.optimizeBasedOnMetrics(veryPoorMetrics);
      
      expect(optimizedSettings.blurEffects).toBe('disabled');
      expect(optimizer.getAppliedOptimizations()).toContain('disable-blur');
    });

    it('should apply multiple optimizations in sequence', () => {
      // First optimization
      const poorMetrics1: PerformanceMetrics = {
        fps: 40,
        averageFPS: 42,
        frameDrops: 15,
        memoryUsage: 80,
        animationDuration: 20,
        isPerformanceGood: false,
        deviceCapability: 'high'
      };

      optimizer.optimizeBasedOnMetrics(poorMetrics1);
      expect(optimizer.getAppliedOptimizations()).toContain('reduce-particles');

      // Second optimization
      const poorMetrics2: PerformanceMetrics = {
        fps: 35,
        averageFPS: 37,
        frameDrops: 20,
        memoryUsage: 90,
        animationDuration: 25,
        isPerformanceGood: false,
        deviceCapability: 'high'
      };

      optimizer.optimizeBasedOnMetrics(poorMetrics2);
      const optimizations = optimizer.getAppliedOptimizations();
      
      expect(optimizations).toContain('reduce-particles');
      expect(optimizations).toContain('disable-blur');
    });

    it('should reset optimizations when performance improves', () => {
      // Apply some optimizations first
      const poorMetrics: PerformanceMetrics = {
        fps: 30,
        averageFPS: 32,
        frameDrops: 25,
        memoryUsage: 100,
        animationDuration: 35,
        isPerformanceGood: false,
        deviceCapability: 'high'
      };

      optimizer.optimizeBasedOnMetrics(poorMetrics);
      expect(optimizer.getAppliedOptimizations().length).toBeGreaterThan(0);

      // Performance improves
      const goodMetrics: PerformanceMetrics = {
        fps: 60,
        averageFPS: 58,
        frameDrops: 2,
        memoryUsage: 60,
        animationDuration: 16,
        isPerformanceGood: true,
        deviceCapability: 'high'
      };

      const resetSettings = optimizer.optimizeBasedOnMetrics(goodMetrics);
      
      expect(optimizer.getAppliedOptimizations()).toHaveLength(0);
      expect(resetSettings.particleCount).toBe(150); // Back to high performance
    });

    it('should track optimization history', () => {
      const poorMetrics: PerformanceMetrics = {
        fps: 40,
        averageFPS: 42,
        frameDrops: 15,
        memoryUsage: 80,
        animationDuration: 20,
        isPerformanceGood: false,
        deviceCapability: 'high'
      };

      optimizer.optimizeBasedOnMetrics(poorMetrics);
      
      const history = optimizer.getOptimizationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].strategy).toBe('reduce-particles');
      expect(history[0].metrics).toEqual(poorMetrics);
      expect(history[0].timestamp).toBeGreaterThan(0);
    });
  });

  describe('static utility methods', () => {
    it('should create optimized animation props', () => {
      const settings = optimizer.getSettingsForDevice('high');
      const props = PerformanceOptimizer.createOptimizedAnimationProps(settings);
      
      expect(props.transition.duration).toBe(0.3); // 300ms converted to seconds
      expect(props.transition.ease).toBe('easeOut');
      expect(props.style.willChange).toBe('transform, opacity');
      expect(props.style.transform).toBe('translateZ(0)');
    });

    it('should create particle config', () => {
      const settings = optimizer.getSettingsForDevice('medium');
      const config = PerformanceOptimizer.getParticleConfig(settings);
      
      expect(config.count).toBe(75);
      expect(config.enablePhysics).toBe(true);
      expect(config.enableInteraction).toBe(true);
      expect(config.animationDuration).toBe(200);
    });

    it('should return correct blur classes', () => {
      expect(PerformanceOptimizer.getBlurClasses({ blurEffects: 'full' } as any))
        .toBe('backdrop-blur-md');
      expect(PerformanceOptimizer.getBlurClasses({ blurEffects: 'reduced' } as any))
        .toBe('backdrop-blur-sm');
      expect(PerformanceOptimizer.getBlurClasses({ blurEffects: 'disabled' } as any))
        .toBe('');
    });

    it('should return correct shadow classes', () => {
      expect(PerformanceOptimizer.getShadowClasses({ shadowEffects: 'full' } as any))
        .toBe('shadow-2xl');
      expect(PerformanceOptimizer.getShadowClasses({ shadowEffects: 'reduced' } as any))
        .toBe('shadow-lg');
      expect(PerformanceOptimizer.getShadowClasses({ shadowEffects: 'disabled' } as any))
        .toBe('shadow-none');
    });
  });

  describe('resetOptimizations', () => {
    it('should clear all optimizations and history', () => {
      const poorMetrics: PerformanceMetrics = {
        fps: 30,
        averageFPS: 32,
        frameDrops: 25,
        memoryUsage: 100,
        animationDuration: 35,
        isPerformanceGood: false,
        deviceCapability: 'high'
      };

      // Apply optimizations
      optimizer.optimizeBasedOnMetrics(poorMetrics);
      expect(optimizer.getAppliedOptimizations().length).toBeGreaterThan(0);
      expect(optimizer.getOptimizationHistory().length).toBeGreaterThan(0);

      // Reset
      optimizer.resetOptimizations();
      
      expect(optimizer.getAppliedOptimizations()).toHaveLength(0);
      expect(optimizer.getOptimizationHistory()).toHaveLength(0);
    });
  });

  describe('optimization priority', () => {
    it('should apply optimizations in priority order', () => {
      const extremelyPoorMetrics: PerformanceMetrics = {
        fps: 20,
        averageFPS: 22,
        frameDrops: 35,
        memoryUsage: 150,
        animationDuration: 50,
        isPerformanceGood: false,
        deviceCapability: 'low'
      };

      // Apply one optimization at a time
      optimizer.optimizeBasedOnMetrics(extremelyPoorMetrics);
      const firstOptimization = optimizer.getAppliedOptimizations();
      expect(firstOptimization).toContain('reduce-particles');

      // Apply next optimization
      optimizer.optimizeBasedOnMetrics(extremelyPoorMetrics);
      const secondOptimization = optimizer.getAppliedOptimizations();
      expect(secondOptimization).toContain('disable-blur');
    });
  });
});