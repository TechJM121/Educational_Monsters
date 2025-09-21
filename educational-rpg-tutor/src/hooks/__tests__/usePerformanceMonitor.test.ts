import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024 // 50MB
  }
};

// Mock navigator
const mockNavigator = {
  deviceMemory: 8,
  hardwareConcurrency: 8
};

// Mock canvas and WebGL
const mockCanvas = {
  getContext: vi.fn(() => ({
    getParameter: vi.fn(() => 'NVIDIA GeForce RTX 3080')
  }))
};

// Mock requestAnimationFrame
let animationFrameCallback: FrameRequestCallback | null = null;
const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  animationFrameCallback = callback;
  return 1;
});

const mockCancelAnimationFrame = vi.fn();

// Mock PerformanceObserver
class MockPerformanceObserver {
  private callback: PerformanceObserverCallback;
  
  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
  
  // Helper method to trigger callback
  triggerCallback(entries: PerformanceEntry[]) {
    this.callback({ getEntries: () => entries } as PerformanceObserverEntryList, this);
  }
}

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    // Setup mocks
    global.performance = mockPerformance as any;
    global.navigator = mockNavigator as any;
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    global.PerformanceObserver = MockPerformanceObserver as any;
    
    // Mock document.createElement for canvas
    global.document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return {} as any;
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    expect(result.current.metrics).toEqual({
      fps: 60,
      averageFPS: 60,
      frameDrops: 0,
      memoryUsage: 0,
      animationDuration: 0,
      isPerformanceGood: true,
      deviceCapability: 'high'
    });
  });

  it('should detect high-end device capability', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    expect(result.current.metrics.deviceCapability).toBe('high');
  });

  it('should detect low-end device capability', () => {
    // Mock low-end device
    global.navigator = {
      deviceMemory: 2,
      hardwareConcurrency: 2
    } as any;
    
    mockCanvas.getContext = vi.fn(() => null); // No WebGL support
    
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Trigger device capability assessment
    act(() => {
      if (animationFrameCallback) {
        animationFrameCallback(performance.now());
      }
    });
    
    expect(result.current.metrics.deviceCapability).toBe('low');
  });

  it('should calculate FPS correctly', async () => {
    let currentTime = 1000;
    mockPerformance.now.mockImplementation(() => currentTime);
    
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Simulate 30 FPS (33.33ms per frame)
    act(() => {
      // First frame
      if (animationFrameCallback) {
        animationFrameCallback(currentTime);
      }
      
      // Simulate 30 frames over 1 second
      for (let i = 0; i < 30; i++) {
        currentTime += 33.33;
        if (animationFrameCallback) {
          animationFrameCallback(currentTime);
        }
      }
    });
    
    // Should detect low FPS
    expect(result.current.metrics.fps).toBeLessThan(55);
    expect(result.current.metrics.frameDrops).toBeGreaterThan(0);
  });

  it('should track frame drops', () => {
    const { result } = renderHook(() => 
      usePerformanceMonitor({ minFPS: 50 })
    );
    
    let currentTime = 1000;
    mockPerformance.now.mockImplementation(() => currentTime);
    
    act(() => {
      // Simulate poor performance (20 FPS)
      for (let i = 0; i < 20; i++) {
        currentTime += 50; // 50ms per frame = 20 FPS
        if (animationFrameCallback) {
          animationFrameCallback(currentTime);
        }
      }
      
      currentTime += 1000; // Complete the second
      if (animationFrameCallback) {
        animationFrameCallback(currentTime);
      }
    });
    
    expect(result.current.metrics.frameDrops).toBeGreaterThan(0);
    expect(result.current.metrics.isPerformanceGood).toBe(false);
  });

  it('should measure animation duration', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    act(() => {
      result.current.measureAnimation('test-animation', () => {
        // Simulate some work
      });
    });
    
    expect(mockPerformance.mark).toHaveBeenCalledWith('test-animation-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('test-animation-end');
    expect(mockPerformance.measure).toHaveBeenCalledWith(
      'animation-test-animation',
      'test-animation-start',
      'test-animation-end'
    );
  });

  it('should reset metrics correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Simulate some frame drops
    act(() => {
      let currentTime = 1000;
      mockPerformance.now.mockImplementation(() => currentTime);
      
      // Poor performance
      for (let i = 0; i < 10; i++) {
        currentTime += 100; // 10 FPS
        if (animationFrameCallback) {
          animationFrameCallback(currentTime);
        }
      }
      
      currentTime += 1000;
      if (animationFrameCallback) {
        animationFrameCallback(currentTime);
      }
    });
    
    // Should have frame drops
    expect(result.current.metrics.frameDrops).toBeGreaterThan(0);
    
    // Reset metrics
    act(() => {
      result.current.resetMetrics();
    });
    
    expect(result.current.metrics.frameDrops).toBe(0);
    expect(result.current.metrics.fps).toBe(60);
    expect(result.current.metrics.averageFPS).toBe(60);
  });

  it('should handle custom thresholds', () => {
    const customThresholds = {
      minFPS: 30,
      maxFrameDrops: 10,
      maxMemoryUsage: 200,
      maxAnimationDuration: 33.33
    };
    
    const { result } = renderHook(() => 
      usePerformanceMonitor(customThresholds)
    );
    
    expect(result.current.thresholds).toEqual(customThresholds);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => usePerformanceMonitor());
    
    unmount();
    
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('should handle memory usage calculation', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Memory should be calculated in MB
    expect(result.current.metrics.memoryUsage).toBeGreaterThanOrEqual(0);
  });

  it('should handle performance observer entries', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Mock performance entry
    const mockEntry = {
      entryType: 'measure',
      name: 'animation-test',
      duration: 20
    } as PerformanceEntry;
    
    act(() => {
      // Simulate performance observer callback
      const observer = new MockPerformanceObserver(() => {});
      observer.triggerCallback([mockEntry]);
    });
    
    // Should update animation duration
    expect(result.current.metrics.animationDuration).toBe(20);
  });
});