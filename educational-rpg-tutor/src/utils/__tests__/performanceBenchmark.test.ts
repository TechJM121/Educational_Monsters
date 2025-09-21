import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceBenchmark, BenchmarkConfig } from '../performanceBenchmark';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn()
};

// Mock requestAnimationFrame
let animationFrameCallback: FrameRequestCallback | null = null;
const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  animationFrameCallback = callback;
  return 1;
});

describe('PerformanceBenchmark', () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
    global.performance = mockPerformance as any;
    global.requestAnimationFrame = mockRequestAnimationFrame;
    vi.clearAllMocks();
  });

  it('should create a new benchmark instance', () => {
    expect(benchmark).toBeInstanceOf(PerformanceBenchmark);
    expect(benchmark.getResults()).toEqual([]);
  });

  it('should run a simple benchmark', async () => {
    let testExecutions = 0;
    const config: BenchmarkConfig = {
      name: 'test-benchmark',
      duration: 100, // 100ms
      targetFPS: 30,
      maxMemoryIncrease: 10,
      test: () => {
        testExecutions++;
      }
    };

    // Mock time progression
    let currentTime = 1000;
    mockPerformance.now.mockImplementation(() => {
      currentTime += 16.67; // Simulate 60fps
      return currentTime;
    });

    const resultPromise = benchmark.runBenchmark(config);
    
    // Simulate animation frames
    setTimeout(() => {
      if (animationFrameCallback) {
        for (let i = 0; i < 6; i++) { // Simulate ~100ms worth of frames
          animationFrameCallback(currentTime);
        }
      }
    }, 10);

    const result = await resultPromise;

    expect(result.name).toBe('test-benchmark');
    expect(result.success).toBe(true);
    expect(result.fps).toBeGreaterThan(0);
    expect(testExecutions).toBeGreaterThan(0);
  });

  it('should handle benchmark failures', async () => {
    const config: BenchmarkConfig = {
      name: 'failing-benchmark',
      duration: 50,
      targetFPS: 60,
      maxMemoryIncrease: 5,
      test: () => {
        throw new Error('Test error');
      }
    };

    try {
      await benchmark.runBenchmark(config);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should track multiple benchmark results', async () => {
    const config1: BenchmarkConfig = {
      name: 'benchmark-1',
      duration: 50,
      targetFPS: 30,
      maxMemoryIncrease: 10,
      test: () => {}
    };

    const config2: BenchmarkConfig = {
      name: 'benchmark-2',
      duration: 50,
      targetFPS: 30,
      maxMemoryIncrease: 10,
      test: () => {}
    };

    // Mock time progression
    let currentTime = 1000;
    mockPerformance.now.mockImplementation(() => {
      currentTime += 16.67;
      return currentTime;
    });

    // Run benchmarks with proper frame simulation
    const result1Promise = benchmark.runBenchmark(config1);
    setTimeout(() => {
      if (animationFrameCallback) {
        for (let i = 0; i < 3; i++) {
          animationFrameCallback(currentTime);
        }
      }
    }, 10);
    await result1Promise;

    const result2Promise = benchmark.runBenchmark(config2);
    setTimeout(() => {
      if (animationFrameCallback) {
        for (let i = 0; i < 3; i++) {
          animationFrameCallback(currentTime);
        }
      }
    }, 10);
    await result2Promise;

    const results = benchmark.getResults();
    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('benchmark-1');
    expect(results[1].name).toBe('benchmark-2');
  });

  it('should generate a performance report', async () => {
    const config: BenchmarkConfig = {
      name: 'report-test',
      duration: 50,
      targetFPS: 30,
      maxMemoryIncrease: 10,
      test: () => {}
    };

    // Mock successful benchmark
    let currentTime = 1000;
    mockPerformance.now.mockImplementation(() => {
      currentTime += 16.67;
      return currentTime;
    });

    const resultPromise = benchmark.runBenchmark(config);
    setTimeout(() => {
      if (animationFrameCallback) {
        for (let i = 0; i < 3; i++) {
          animationFrameCallback(currentTime);
        }
      }
    }, 10);
    await resultPromise;

    const report = benchmark.generateReport();
    expect(report).toContain('Performance Benchmark Report');
    expect(report).toContain('report-test');
    expect(report).toContain('Success Rate');
    expect(report).toContain('Average FPS');
  });

  it('should clear results', async () => {
    const config: BenchmarkConfig = {
      name: 'clear-test',
      duration: 50,
      targetFPS: 30,
      maxMemoryIncrease: 10,
      test: () => {}
    };

    // Run a benchmark first
    let currentTime = 1000;
    mockPerformance.now.mockImplementation(() => {
      currentTime += 16.67;
      return currentTime;
    });

    const resultPromise = benchmark.runBenchmark(config);
    setTimeout(() => {
      if (animationFrameCallback) {
        for (let i = 0; i < 3; i++) {
          animationFrameCallback(currentTime);
        }
      }
    }, 10);
    await resultPromise;

    expect(benchmark.getResults()).toHaveLength(1);
    
    benchmark.clearResults();
    expect(benchmark.getResults()).toHaveLength(0);
  });

  it('should handle setup and cleanup functions', async () => {
    let setupCalled = false;
    let cleanupCalled = false;

    const config: BenchmarkConfig = {
      name: 'setup-cleanup-test',
      duration: 50,
      targetFPS: 30,
      maxMemoryIncrease: 10,
      setup: () => {
        setupCalled = true;
      },
      cleanup: () => {
        cleanupCalled = true;
      },
      test: () => {}
    };

    let currentTime = 1000;
    mockPerformance.now.mockImplementation(() => {
      currentTime += 16.67;
      return currentTime;
    });

    const resultPromise = benchmark.runBenchmark(config);
    setTimeout(() => {
      if (animationFrameCallback) {
        for (let i = 0; i < 3; i++) {
          animationFrameCallback(currentTime);
        }
      }
    }, 10);
    await resultPromise;

    expect(setupCalled).toBe(true);
    expect(cleanupCalled).toBe(true);
  });

  it('should prevent concurrent benchmarks', async () => {
    const config: BenchmarkConfig = {
      name: 'concurrent-test',
      duration: 100,
      targetFPS: 30,
      maxMemoryIncrease: 10,
      test: () => {}
    };

    // Start first benchmark
    const promise1 = benchmark.runBenchmark(config);
    
    // Try to start second benchmark immediately
    await expect(benchmark.runBenchmark(config)).rejects.toThrow('Benchmark already running');
    
    // Complete first benchmark
    setTimeout(() => {
      if (animationFrameCallback) {
        for (let i = 0; i < 6; i++) {
          animationFrameCallback(performance.now());
        }
      }
    }, 10);
    
    await promise1;
  });
});