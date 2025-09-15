// Load testing utilities for Educational RPG Tutor
import { vi } from 'vitest';

export interface LoadTestConfig {
  concurrentUsers: number;
  testDuration: number; // in milliseconds
  requestsPerSecond: number;
  endpoint?: string;
}

export interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
}

export class LoadTester {
  private results: LoadTestResult = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    requestsPerSecond: 0,
    errors: []
  };

  async runLoadTest(config: LoadTestConfig, testFunction: () => Promise<void>): Promise<LoadTestResult> {
    const startTime = Date.now();
    const promises: Promise<void>[] = [];
    const responseTimes: number[] = [];

    // Create concurrent users
    for (let user = 0; user < config.concurrentUsers; user++) {
      promises.push(this.simulateUser(config, testFunction, responseTimes));
    }

    // Wait for all users to complete
    await Promise.allSettled(promises);

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Calculate results
    this.results.averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    this.results.maxResponseTime = Math.max(...responseTimes, 0);
    this.results.minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    this.results.requestsPerSecond = this.results.totalRequests / (totalDuration / 1000);

    return { ...this.results };
  }

  private async simulateUser(
    config: LoadTestConfig, 
    testFunction: () => Promise<void>,
    responseTimes: number[]
  ): Promise<void> {
    const endTime = Date.now() + config.testDuration;
    const requestInterval = 1000 / config.requestsPerSecond;

    while (Date.now() < endTime) {
      const requestStart = Date.now();
      
      try {
        await testFunction();
        const responseTime = Date.now() - requestStart;
        responseTimes.push(responseTime);
        this.results.successfulRequests++;
      } catch (error) {
        this.results.failedRequests++;
        this.results.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
      
      this.results.totalRequests++;
      
      // Wait for next request
      await new Promise(resolve => setTimeout(resolve, requestInterval));
    }
  }
}

// Mock database operations for load testing
export const mockDatabaseOperations = {
  getCharacter: vi.fn().mockImplementation(async (id: string) => {
    // Simulate database latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    return {
      id,
      name: `Character-${id}`,
      level: Math.floor(Math.random() * 50) + 1,
      totalXP: Math.floor(Math.random() * 10000)
    };
  }),

  updateCharacterXP: vi.fn().mockImplementation(async (id: string, xp: number) => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150));
    return { success: true, newXP: xp };
  }),

  getLeaderboard: vi.fn().mockImplementation(async () => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
    return Array.from({ length: 10 }, (_, i) => ({
      id: `user-${i}`,
      name: `Player${i}`,
      weeklyXP: Math.floor(Math.random() * 1000)
    }));
  }),

  saveQuestionResponse: vi.fn().mockImplementation(async (response: any) => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    return { id: `response-${Date.now()}`, ...response };
  })
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
    };
  }

  getMetrics(label: string) {
    const times = this.metrics.get(label) || [];
    if (times.length === 0) return null;

    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      p95: this.percentile(times, 0.95),
      p99: this.percentile(times, 0.99)
    };
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }

  reset(): void {
    this.metrics.clear();
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  private initialMemory: number;
  private samples: number[] = [];

  constructor() {
    this.initialMemory = this.getCurrentMemoryUsage();
  }

  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  takeSample(): void {
    const current = this.getCurrentMemoryUsage();
    this.samples.push(current);
  }

  getMemoryReport() {
    if (this.samples.length === 0) return null;

    const current = this.getCurrentMemoryUsage();
    const peak = Math.max(...this.samples);
    const average = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;

    return {
      initial: this.initialMemory,
      current,
      peak,
      average,
      growth: current - this.initialMemory,
      samples: this.samples.length
    };
  }
}