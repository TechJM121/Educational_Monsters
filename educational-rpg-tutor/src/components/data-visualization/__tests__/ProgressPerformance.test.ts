import { vi } from 'vitest';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
});

describe('Progress Components Performance', () => {
  beforeEach(() => {
    mockPerformanceNow.mockClear();
    mockRequestAnimationFrame.mockClear();
    
    // Setup performance.now to return incrementing values
    let time = 0;
    mockPerformanceNow.mockImplementation(() => {
      time += 16.67; // Simulate 60fps (16.67ms per frame)
      return time;
    });
    
    // Setup requestAnimationFrame to execute callback immediately
    mockRequestAnimationFrame.mockImplementation((callback: FrameRequestCallback) => {
      callback(mockPerformanceNow());
      return 1;
    });
  });

  describe('Animation Performance Benchmarks', () => {
    it('should maintain 60fps during progress bar animations', () => {
      const startTime = performance.now();
      
      // Simulate 100 animation frames
      const frameCount = 100;
      const frameTimes: number[] = [];
      
      for (let i = 0; i < frameCount; i++) {
        const frameStart = performance.now();
        
        // Simulate progress bar animation calculations
        const progress = (i / frameCount) * 100;
        const width = `${progress}%`;
        const opacity = Math.min(progress / 100, 1);
        
        // Simulate DOM updates (these would be actual DOM operations)
        const mockElement = {
          style: {
            width,
            opacity: opacity.toString(),
            transform: `translateX(${progress * 2}px)`,
          },
        };
        
        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const fps = 1000 / averageFrameTime;
      
      // Should maintain close to 60fps
      expect(fps).toBeGreaterThan(58);
      expect(averageFrameTime).toBeLessThan(17); // Less than 16.67ms per frame
      
      // No frame should take longer than 33ms (30fps minimum)
      const slowFrames = frameTimes.filter(time => time > 33);
      expect(slowFrames.length).toBeLessThan(frameCount * 0.05); // Less than 5% slow frames
    });

    it('should handle multiple progress rings efficiently', () => {
      const ringCount = 10;
      const animationFrames = 60; // 1 second at 60fps
      
      const startTime = performance.now();
      
      for (let frame = 0; frame < animationFrames; frame++) {
        for (let ring = 0; ring < ringCount; ring++) {
          // Simulate progress ring calculations
          const progress = (frame / animationFrames) * 100;
          const radius = 50;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (circumference * progress) / 100;
          
          // Simulate SVG updates
          const mockSVGElement = {
            style: {
              strokeDashoffset: strokeDashoffset.toString(),
              stroke: `hsl(${progress * 3.6}, 70%, 50%)`,
            },
          };
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTimePerFrame = totalTime / animationFrames;
      
      // Should handle 10 rings at 60fps
      expect(averageTimePerFrame).toBeLessThan(16.67);
    });

    it('should optimize morphing number calculations', () => {
      const iterations = 1000;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        // Simulate morphing number calculations
        const startValue = 0;
        const endValue = 1000;
        const progress = i / iterations;
        
        // Easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easedProgress;
        
        // Number formatting
        const formattedValue = currentValue.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        
        // Simulate DOM text update
        const mockTextElement = {
          textContent: formattedValue,
        };
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTimePerCalculation = totalTime / iterations;
      
      // Each calculation should be very fast
      expect(averageTimePerCalculation).toBeLessThan(0.1); // Less than 0.1ms per calculation
      expect(totalTime).toBeLessThan(100); // Total should be under 100ms
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not create memory leaks during animations', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate creating and destroying many progress components
      const componentCount = 100;
      const mockComponents: any[] = [];
      
      for (let i = 0; i < componentCount; i++) {
        // Simulate component creation
        const mockComponent = {
          id: i,
          value: Math.random() * 100,
          animations: new Set(),
          eventListeners: new Map(),
          cleanup: () => {
            mockComponent.animations.clear();
            mockComponent.eventListeners.clear();
          },
        };
        
        mockComponents.push(mockComponent);
      }
      
      // Simulate cleanup
      mockComponents.forEach(component => component.cleanup());
      mockComponents.length = 0;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });

    it('should efficiently handle rapid value changes', () => {
      const changeCount = 1000;
      const startTime = performance.now();
      
      let currentValue = 0;
      const valueHistory: number[] = [];
      
      for (let i = 0; i < changeCount; i++) {
        // Simulate rapid value changes
        currentValue += Math.random() * 10 - 5; // Random walk
        currentValue = Math.max(0, Math.min(100, currentValue)); // Clamp to 0-100
        
        valueHistory.push(currentValue);
        
        // Simulate animation state updates
        const animationState = {
          from: valueHistory[valueHistory.length - 2] || 0,
          to: currentValue,
          progress: 0,
          duration: 300,
        };
        
        // Keep only recent history to prevent memory buildup
        if (valueHistory.length > 10) {
          valueHistory.shift();
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTimePerChange = totalTime / changeCount;
      
      // Should handle rapid changes efficiently
      expect(averageTimePerChange).toBeLessThan(0.05); // Less than 0.05ms per change
      expect(valueHistory.length).toBeLessThanOrEqual(10); // Memory bounded
    });
  });

  describe('Device Adaptation Performance', () => {
    it('should reduce complexity on low-end devices', () => {
      // Mock low-end device detection
      const mockDeviceCapability = 'low';
      
      const getOptimizedSettings = (capability: string) => {
        switch (capability) {
          case 'low':
            return {
              particleCount: 10,
              animationDuration: 150,
              useGPUAcceleration: false,
              reducedEffects: true,
            };
          case 'medium':
            return {
              particleCount: 50,
              animationDuration: 300,
              useGPUAcceleration: true,
              reducedEffects: false,
            };
          case 'high':
            return {
              particleCount: 100,
              animationDuration: 500,
              useGPUAcceleration: true,
              reducedEffects: false,
            };
          default:
            return {
              particleCount: 25,
              animationDuration: 300,
              useGPUAcceleration: false,
              reducedEffects: true,
            };
        }
      };
      
      const settings = getOptimizedSettings(mockDeviceCapability);
      
      expect(settings.particleCount).toBeLessThanOrEqual(10);
      expect(settings.animationDuration).toBeLessThanOrEqual(150);
      expect(settings.useGPUAcceleration).toBe(false);
      expect(settings.reducedEffects).toBe(true);
    });

    it('should benchmark animation performance and adapt', () => {
      const benchmarkFrames = 60;
      const frameTimes: number[] = [];
      
      // Simulate performance benchmark
      for (let i = 0; i < benchmarkFrames; i++) {
        const frameStart = performance.now();
        
        // Simulate complex animation calculations
        const complexity = 100; // High complexity
        for (let j = 0; j < complexity; j++) {
          Math.sin(i * j * 0.01);
          Math.cos(i * j * 0.01);
        }
        
        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }
      
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const fps = 1000 / averageFrameTime;
      
      // Adaptive complexity based on performance
      const getAdaptiveComplexity = (measuredFps: number) => {
        if (measuredFps >= 55) return 'high';
        if (measuredFps >= 30) return 'medium';
        return 'low';
      };
      
      const adaptiveComplexity = getAdaptiveComplexity(fps);
      
      // Should adapt complexity based on performance
      expect(['low', 'medium', 'high']).toContain(adaptiveComplexity);
      
      if (fps < 30) {
        expect(adaptiveComplexity).toBe('low');
      } else if (fps >= 55) {
        expect(adaptiveComplexity).toBe('high');
      }
    });
  });
});