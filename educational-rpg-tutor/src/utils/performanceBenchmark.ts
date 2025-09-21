export interface BenchmarkResult {
  name: string;
  duration: number;
  fps: number;
  memoryUsage: number;
  frameDrops: number;
  success: boolean;
  timestamp: number;
}

export interface BenchmarkConfig {
  name: string;
  duration: number; // in milliseconds
  targetFPS: number;
  maxMemoryIncrease: number; // in MB
  setup?: () => void;
  cleanup?: () => void;
  test: () => void;
}

export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private isRunning = false;

  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
    if (this.isRunning) {
      throw new Error('Benchmark already running');
    }

    this.isRunning = true;
    
    try {
      // Setup
      if (config.setup) {
        config.setup();
      }

      const startTime = performance.now();
      const startMemory = this.getMemoryUsage();
      
      let frameCount = 0;
      let frameDrops = 0;
      let lastFrameTime = startTime;
      
      // Run benchmark
      const benchmarkPromise = new Promise<void>((resolve) => {
        const runFrame = () => {
          const currentTime = performance.now();
          const frameDuration = currentTime - lastFrameTime;
          
          // Count frame drops (frames taking longer than 16.67ms for 60fps)
          if (frameDuration > 16.67) {
            frameDrops++;
          }
          
          frameCount++;
          lastFrameTime = currentTime;
          
          // Run the test function
          config.test();
          
          if (currentTime - startTime < config.duration) {
            requestAnimationFrame(runFrame);
          } else {
            resolve();
          }
        };
        
        requestAnimationFrame(runFrame);
      });

      await benchmarkPromise;
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const duration = endTime - startTime;
      const fps = Math.round((frameCount * 1000) / duration);
      const memoryIncrease = endMemory - startMemory;
      
      const result: BenchmarkResult = {
        name: config.name,
        duration,
        fps,
        memoryUsage: memoryIncrease,
        frameDrops,
        success: fps >= config.targetFPS && 
                memoryIncrease <= config.maxMemoryIncrease &&
                frameDrops <= Math.floor(frameCount * 0.1), // Allow 10% frame drops
        timestamp: Date.now()
      };
      
      this.results.push(result);
      
      // Cleanup
      if (config.cleanup) {
        config.cleanup();
      }
      
      return result;
      
    } finally {
      this.isRunning = false;
    }
  }

  async runMultipleBenchmarks(configs: BenchmarkConfig[]): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    
    for (const config of configs) {
      try {
        const result = await this.runBenchmark(config);
        results.push(result);
        
        // Wait a bit between benchmarks to let the system stabilize
        await this.wait(1000);
      } catch (error) {
        console.error(`Benchmark ${config.name} failed:`, error);
        results.push({
          name: config.name,
          duration: 0,
          fps: 0,
          memoryUsage: 0,
          frameDrops: 0,
          success: false,
          timestamp: Date.now()
        });
      }
    }
    
    return results;
  }

  getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  getResultsByName(name: string): BenchmarkResult[] {
    return this.results.filter(result => result.name === name);
  }

  clearResults(): void {
    this.results = [];
  }

  generateReport(): string {
    if (this.results.length === 0) {
      return 'No benchmark results available.';
    }

    let report = 'Performance Benchmark Report\n';
    report += '================================\n\n';
    
    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.name]) {
        acc[result.name] = [];
      }
      acc[result.name].push(result);
      return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    for (const [name, results] of Object.entries(groupedResults)) {
      report += `${name}:\n`;
      report += `  Runs: ${results.length}\n`;
      
      const successfulRuns = results.filter(r => r.success);
      const avgFPS = results.reduce((sum, r) => sum + r.fps, 0) / results.length;
      const avgMemory = results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length;
      const avgFrameDrops = results.reduce((sum, r) => sum + r.frameDrops, 0) / results.length;
      
      report += `  Success Rate: ${(successfulRuns.length / results.length * 100).toFixed(1)}%\n`;
      report += `  Average FPS: ${avgFPS.toFixed(1)}\n`;
      report += `  Average Memory Usage: ${avgMemory.toFixed(1)} MB\n`;
      report += `  Average Frame Drops: ${avgFrameDrops.toFixed(1)}\n`;
      report += `  Best FPS: ${Math.max(...results.map(r => r.fps))}\n`;
      report += `  Worst FPS: ${Math.min(...results.map(r => r.fps))}\n\n`;
    }
    
    return report;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
    }
    return 0;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Predefined benchmark configurations
export const ANIMATION_BENCHMARKS: BenchmarkConfig[] = [
  {
    name: 'Basic Animation Performance',
    duration: 3000,
    targetFPS: 55,
    maxMemoryIncrease: 10,
    test: () => {
      // Simulate basic CSS animations
      const element = document.createElement('div');
      element.style.transform = `translateX(${Math.random() * 100}px)`;
      element.style.opacity = `${Math.random()}`;
    }
  },
  {
    name: 'Particle System Performance',
    duration: 5000,
    targetFPS: 45,
    maxMemoryIncrease: 20,
    test: () => {
      // Simulate particle calculations
      const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      }));
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
      });
    }
  },
  {
    name: '3D Transform Performance',
    duration: 4000,
    targetFPS: 50,
    maxMemoryIncrease: 15,
    test: () => {
      // Simulate 3D transforms
      const element = document.createElement('div');
      const rotation = Math.random() * 360;
      const scale = 0.8 + Math.random() * 0.4;
      element.style.transform = `rotateX(${rotation}deg) rotateY(${rotation}deg) scale(${scale})`;
    }
  },
  {
    name: 'Blur Effect Performance',
    duration: 3000,
    targetFPS: 40,
    maxMemoryIncrease: 25,
    test: () => {
      // Simulate backdrop blur effects
      const element = document.createElement('div');
      element.style.backdropFilter = `blur(${Math.random() * 20}px)`;
      element.style.filter = `blur(${Math.random() * 5}px)`;
    }
  },
  {
    name: 'Complex Animation Sequence',
    duration: 6000,
    targetFPS: 35,
    maxMemoryIncrease: 30,
    test: () => {
      // Simulate complex animation with multiple effects
      const elements = Array.from({ length: 10 }, () => document.createElement('div'));
      
      elements.forEach((element, index) => {
        const time = Date.now() / 1000;
        const offset = index * 0.1;
        
        element.style.transform = `
          translateX(${Math.sin(time + offset) * 100}px)
          translateY(${Math.cos(time + offset) * 50}px)
          rotateZ(${time * 45 + offset * 90}deg)
          scale(${0.8 + Math.sin(time + offset) * 0.2})
        `;
        element.style.opacity = `${0.5 + Math.sin(time + offset) * 0.5}`;
        element.style.filter = `blur(${Math.sin(time + offset) * 2 + 2}px)`;
      });
    }
  }
];

// Global benchmark instance
export const performanceBenchmark = new PerformanceBenchmark();