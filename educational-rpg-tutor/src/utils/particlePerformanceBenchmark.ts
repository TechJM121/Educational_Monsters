/**
 * Advanced Particle Performance Benchmarking System
 * Provides comprehensive performance testing and optimization for particle systems
 */

import type { DeviceCapability, ParticleConfig } from '../types/animation';
import { AdvancedDeviceDetector } from './deviceCapability';
import { PerformanceMonitor } from './performance';

export interface BenchmarkResult {
  deviceCapability: DeviceCapability;
  averageFPS: number;
  frameDrops: number;
  memoryUsage: number;
  renderTime: number;
  physicsTime: number;
  totalTime: number;
  recommendedParticleCount: number;
  score: number;
}

export interface BenchmarkConfig {
  duration: number; // Test duration in milliseconds
  particleCounts: number[]; // Different particle counts to test
  themes: Array<'magical' | 'tech' | 'nature' | 'cosmic'>;
  includeWebWorker: boolean;
  includeInteraction: boolean;
}

export class ParticlePerformanceBenchmark {
  private static instance: ParticlePerformanceBenchmark;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private performanceMonitor: PerformanceMonitor;
  private deviceDetector: AdvancedDeviceDetector;

  private constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.ctx = this.canvas.getContext('2d')!;
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.deviceDetector = AdvancedDeviceDetector.getInstance();
  }

  static getInstance(): ParticlePerformanceBenchmark {
    if (!ParticlePerformanceBenchmark.instance) {
      ParticlePerformanceBenchmark.instance = new ParticlePerformanceBenchmark();
    }
    return ParticlePerformanceBenchmark.instance;
  }

  /**
   * Run comprehensive particle performance benchmark
   */
  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    const deviceInfo = await this.deviceDetector.detectDevice();

    for (const particleCount of config.particleCounts) {
      for (const theme of config.themes) {
        const result = await this.benchmarkConfiguration({
          particleCount,
          theme,
          duration: config.duration,
          includeWebWorker: config.includeWebWorker,
          includeInteraction: config.includeInteraction,
          deviceCapability: deviceInfo.capability
        });

        results.push(result);
      }
    }

    return results;
  }

  /**
   * Benchmark a specific particle configuration
   */
  private async benchmarkConfiguration(params: {
    particleCount: number;
    theme: 'magical' | 'tech' | 'nature' | 'cosmic';
    duration: number;
    includeWebWorker: boolean;
    includeInteraction: boolean;
    deviceCapability: DeviceCapability;
  }): Promise<BenchmarkResult> {
    const { particleCount, theme, duration, includeWebWorker, includeInteraction, deviceCapability } = params;

    // Create test particles
    const particles = this.createTestParticles(particleCount, theme);
    
    // Initialize performance tracking
    const startTime = performance.now();
    let frameCount = 0;
    let totalRenderTime = 0;
    let totalPhysicsTime = 0;
    let frameDrops = 0;
    let lastFrameTime = startTime;

    // Benchmark loop
    return new Promise((resolve) => {
      const benchmarkFrame = (currentTime: number) => {
        const frameTime = currentTime - lastFrameTime;
        frameCount++;

        // Track frame drops (frames taking longer than 16.67ms for 60fps)
        if (frameTime > 16.67) {
          frameDrops++;
        }

        // Physics benchmark
        const physicsStart = performance.now();
        this.updateTestParticles(particles, includeInteraction);
        const physicsEnd = performance.now();
        totalPhysicsTime += physicsEnd - physicsStart;

        // Rendering benchmark
        const renderStart = performance.now();
        this.renderTestParticles(particles, theme);
        const renderEnd = performance.now();
        totalRenderTime += renderEnd - renderStart;

        lastFrameTime = currentTime;

        // Continue benchmark or finish
        if (currentTime - startTime < duration) {
          requestAnimationFrame(benchmarkFrame);
        } else {
          const totalTime = currentTime - startTime;
          const averageFPS = Math.round((frameCount / totalTime) * 1000);
          
          // Calculate performance score
          const score = this.calculatePerformanceScore({
            averageFPS,
            frameDrops,
            particleCount,
            renderTime: totalRenderTime / frameCount,
            physicsTime: totalPhysicsTime / frameCount
          });

          resolve({
            deviceCapability,
            averageFPS,
            frameDrops,
            memoryUsage: this.getMemoryUsage(),
            renderTime: totalRenderTime / frameCount,
            physicsTime: totalPhysicsTime / frameCount,
            totalTime,
            recommendedParticleCount: this.getRecommendedParticleCount(averageFPS, particleCount),
            score
          });
        }
      };

      requestAnimationFrame(benchmarkFrame);
    });
  }

  /**
   * Create test particles for benchmarking
   */
  private createTestParticles(count: number, theme: 'magical' | 'tech' | 'nature' | 'cosmic') {
    const particles = [];
    const colors = this.getThemeColors(theme);

    for (let i = 0; i < count; i++) {
      particles.push({
        id: `test-particle-${i}`,
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        life: 1,
        maxLife: 1
      });
    }

    return particles;
  }

  /**
   * Update test particles with physics
   */
  private updateTestParticles(particles: any[], includeInteraction: boolean) {
    const mouseX = this.canvas.width / 2;
    const mouseY = this.canvas.height / 2;

    particles.forEach(particle => {
      // Apply magnetic force if interaction is enabled
      if (includeInteraction) {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = 0.02 * (1 - distance / 100);
          const angle = Math.atan2(dy, dx);
          particle.vx += Math.cos(angle) * force;
          particle.vy += Math.sin(angle) * force;
        }
      }

      // Apply friction
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary collision
      if (particle.x <= 0 || particle.x >= this.canvas.width) {
        particle.vx *= -0.8;
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      }
      if (particle.y <= 0 || particle.y >= this.canvas.height) {
        particle.vy *= -0.8;
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
      }
    });
  }

  /**
   * Render test particles
   */
  private renderTestParticles(particles: any[], theme: 'magical' | 'tech' | 'nature' | 'cosmic') {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity;

      // Create gradient
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  /**
   * Get theme colors for testing
   */
  private getThemeColors(theme: 'magical' | 'tech' | 'nature' | 'cosmic'): string[] {
    const themeColors = {
      magical: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'],
      tech: ['#06B6D4', '#0891B2', '#0E7490', '#22D3EE'],
      nature: ['#10B981', '#059669', '#047857', '#34D399'],
      cosmic: ['#7C3AED', '#6D28D9', '#5B21B6', '#A78BFA']
    };
    return themeColors[theme];
  }

  /**
   * Calculate performance score based on metrics
   */
  private calculatePerformanceScore(metrics: {
    averageFPS: number;
    frameDrops: number;
    particleCount: number;
    renderTime: number;
    physicsTime: number;
  }): number {
    let score = 0;

    // FPS scoring (0-40 points)
    if (metrics.averageFPS >= 60) score += 40;
    else if (metrics.averageFPS >= 45) score += 30;
    else if (metrics.averageFPS >= 30) score += 20;
    else if (metrics.averageFPS >= 15) score += 10;

    // Frame drops penalty (0-20 points)
    const frameDropRatio = metrics.frameDrops / (metrics.averageFPS * 2); // Approximate total frames
    if (frameDropRatio < 0.05) score += 20;
    else if (frameDropRatio < 0.1) score += 15;
    else if (frameDropRatio < 0.2) score += 10;
    else if (frameDropRatio < 0.3) score += 5;

    // Particle efficiency (0-20 points)
    const particleEfficiency = metrics.averageFPS / metrics.particleCount;
    if (particleEfficiency > 1) score += 20;
    else if (particleEfficiency > 0.5) score += 15;
    else if (particleEfficiency > 0.3) score += 10;
    else if (particleEfficiency > 0.1) score += 5;

    // Render time efficiency (0-10 points)
    if (metrics.renderTime < 2) score += 10;
    else if (metrics.renderTime < 5) score += 7;
    else if (metrics.renderTime < 10) score += 5;
    else if (metrics.renderTime < 15) score += 2;

    // Physics time efficiency (0-10 points)
    if (metrics.physicsTime < 1) score += 10;
    else if (metrics.physicsTime < 3) score += 7;
    else if (metrics.physicsTime < 5) score += 5;
    else if (metrics.physicsTime < 8) score += 2;

    return Math.min(score, 100);
  }

  /**
   * Get recommended particle count based on performance
   */
  private getRecommendedParticleCount(averageFPS: number, currentCount: number): number {
    if (averageFPS >= 55) {
      // Performance is good, can handle more particles
      return Math.min(currentCount * 1.5, 200);
    } else if (averageFPS >= 30) {
      // Performance is acceptable
      return currentCount;
    } else if (averageFPS >= 15) {
      // Performance is poor, reduce particles
      return Math.max(currentCount * 0.7, 10);
    } else {
      // Performance is very poor, minimal particles
      return Math.max(currentCount * 0.3, 5);
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1048576; // MB
    }
    return 0;
  }

  /**
   * Run quick performance test to determine optimal settings
   */
  async quickPerformanceTest(): Promise<{
    recommendedParticleCount: number;
    recommendedDeviceCapability: DeviceCapability;
    shouldUseWebWorker: boolean;
  }> {
    const testConfig: BenchmarkConfig = {
      duration: 2000, // 2 seconds
      particleCounts: [25, 50, 100],
      themes: ['magical'],
      includeWebWorker: false,
      includeInteraction: true
    };

    const results = await this.runBenchmark(testConfig);
    const bestResult = results.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      recommendedParticleCount: bestResult.recommendedParticleCount,
      recommendedDeviceCapability: bestResult.deviceCapability,
      shouldUseWebWorker: bestResult.averageFPS > 45 && bestResult.recommendedParticleCount > 50
    };
  }

  /**
   * Stress test to find performance limits
   */
  async stressTest(): Promise<{
    maxParticleCount: number;
    breakingPoint: number;
    memoryLimit: number;
  }> {
    let maxParticleCount = 0;
    let breakingPoint = 0;
    let memoryLimit = 0;

    const particleCounts = [50, 100, 200, 300, 500, 750, 1000];

    for (const count of particleCounts) {
      const result = await this.benchmarkConfiguration({
        particleCount: count,
        theme: 'tech',
        duration: 1000,
        includeWebWorker: false,
        includeInteraction: true,
        deviceCapability: 'high'
      });

      if (result.averageFPS >= 30) {
        maxParticleCount = count;
      } else if (breakingPoint === 0) {
        breakingPoint = count;
      }

      memoryLimit = Math.max(memoryLimit, result.memoryUsage);

      // Stop if performance is too poor
      if (result.averageFPS < 10) {
        break;
      }
    }

    return {
      maxParticleCount,
      breakingPoint: breakingPoint || maxParticleCount,
      memoryLimit
    };
  }
}

/**
 * Utility functions for performance optimization
 */
export const performanceUtils = {
  /**
   * Get optimal particle configuration for device
   */
  async getOptimalConfig(theme: 'magical' | 'tech' | 'nature' | 'cosmic'): Promise<ParticleConfig> {
    const benchmark = ParticlePerformanceBenchmark.getInstance();
    const testResult = await benchmark.quickPerformanceTest();
    
    const baseConfig = {
      magical: {
        size: { min: 2, max: 8 },
        speed: { min: 0.2, max: 1.5 },
        color: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'],
        opacity: { min: 0.3, max: 0.8 },
        interactionRadius: 80,
        magneticForce: 0.02,
        friction: 0.98
      },
      tech: {
        size: { min: 1, max: 6 },
        speed: { min: 0.5, max: 2.0 },
        color: ['#06B6D4', '#0891B2', '#0E7490', '#22D3EE'],
        opacity: { min: 0.4, max: 0.9 },
        interactionRadius: 100,
        magneticForce: 0.03,
        friction: 0.95
      },
      nature: {
        size: { min: 3, max: 10 },
        speed: { min: 0.1, max: 1.0 },
        color: ['#10B981', '#059669', '#047857', '#34D399'],
        opacity: { min: 0.2, max: 0.7 },
        interactionRadius: 60,
        magneticForce: 0.015,
        friction: 0.99
      },
      cosmic: {
        size: { min: 1, max: 12 },
        speed: { min: 0.3, max: 1.8 },
        color: ['#7C3AED', '#6D28D9', '#5B21B6', '#A78BFA'],
        opacity: { min: 0.3, max: 0.9 },
        interactionRadius: 120,
        magneticForce: 0.025,
        friction: 0.97
      }
    };

    return {
      ...baseConfig[theme],
      count: testResult.recommendedParticleCount
    };
  },

  /**
   * Monitor real-time performance and suggest adjustments
   */
  createPerformanceWatcher(callback: (suggestions: {
    reduceParticles?: boolean;
    disableInteraction?: boolean;
    simplifyRendering?: boolean;
    useWebWorker?: boolean;
  }) => void) {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startMonitoring();

    return monitor.subscribe((metrics) => {
      const suggestions: any = {};

      if (metrics.fps < 20) {
        suggestions.reduceParticles = true;
        suggestions.simplifyRendering = true;
      } else if (metrics.fps < 30) {
        suggestions.disableInteraction = true;
      }

      if (metrics.memoryUsage > 100) {
        suggestions.reduceParticles = true;
      }

      if (metrics.fps > 50 && metrics.memoryUsage < 50) {
        suggestions.useWebWorker = true;
      }

      if (Object.keys(suggestions).length > 0) {
        callback(suggestions);
      }
    });
  }
};