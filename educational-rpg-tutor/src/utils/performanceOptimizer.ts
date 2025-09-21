import { PerformanceMetrics } from '../hooks/usePerformanceMonitor';

export interface AnimationComplexitySettings {
  particleCount: number;
  blurEffects: 'full' | 'reduced' | 'disabled';
  shadowEffects: 'full' | 'reduced' | 'disabled';
  transitionDuration: number;
  enableGPUAcceleration: boolean;
  enable3DTransforms: boolean;
  enableParallax: boolean;
}

export interface OptimizationStrategy {
  name: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  apply: (current: AnimationComplexitySettings) => AnimationComplexitySettings;
  priority: number;
}

const HIGH_PERFORMANCE_SETTINGS: AnimationComplexitySettings = {
  particleCount: 150,
  blurEffects: 'full',
  shadowEffects: 'full',
  transitionDuration: 300,
  enableGPUAcceleration: true,
  enable3DTransforms: true,
  enableParallax: true
};

const MEDIUM_PERFORMANCE_SETTINGS: AnimationComplexitySettings = {
  particleCount: 75,
  blurEffects: 'reduced',
  shadowEffects: 'reduced',
  transitionDuration: 200,
  enableGPUAcceleration: true,
  enable3DTransforms: true,
  enableParallax: false
};

const LOW_PERFORMANCE_SETTINGS: AnimationComplexitySettings = {
  particleCount: 25,
  blurEffects: 'disabled',
  shadowEffects: 'disabled',
  transitionDuration: 150,
  enableGPUAcceleration: false,
  enable3DTransforms: false,
  enableParallax: false
};

const OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  {
    name: 'reduce-particles',
    condition: (metrics) => metrics.fps < 45 || metrics.frameDrops > 10,
    apply: (settings) => ({
      ...settings,
      particleCount: Math.max(10, Math.floor(settings.particleCount * 0.5))
    }),
    priority: 1
  },
  {
    name: 'disable-blur',
    condition: (metrics) => metrics.fps < 40 || metrics.frameDrops > 15,
    apply: (settings) => ({
      ...settings,
      blurEffects: 'disabled'
    }),
    priority: 2
  },
  {
    name: 'reduce-shadows',
    condition: (metrics) => metrics.fps < 35 || metrics.frameDrops > 20,
    apply: (settings) => ({
      ...settings,
      shadowEffects: 'reduced'
    }),
    priority: 3
  },
  {
    name: 'disable-3d',
    condition: (metrics) => metrics.fps < 30 || metrics.frameDrops > 25,
    apply: (settings) => ({
      ...settings,
      enable3DTransforms: false,
      enableParallax: false
    }),
    priority: 4
  },
  {
    name: 'minimal-animations',
    condition: (metrics) => metrics.fps < 25 || metrics.frameDrops > 30,
    apply: (settings) => ({
      ...settings,
      transitionDuration: 100,
      enableGPUAcceleration: false
    }),
    priority: 5
  }
];

export class PerformanceOptimizer {
  private currentSettings: AnimationComplexitySettings;
  private appliedOptimizations: Set<string> = new Set();
  private optimizationHistory: Array<{
    timestamp: number;
    strategy: string;
    metrics: PerformanceMetrics;
  }> = [];

  constructor(initialSettings?: Partial<AnimationComplexitySettings>) {
    this.currentSettings = {
      ...HIGH_PERFORMANCE_SETTINGS,
      ...initialSettings
    };
  }

  getSettingsForDevice(deviceCapability: 'high' | 'medium' | 'low'): AnimationComplexitySettings {
    switch (deviceCapability) {
      case 'high':
        return { ...HIGH_PERFORMANCE_SETTINGS };
      case 'medium':
        return { ...MEDIUM_PERFORMANCE_SETTINGS };
      case 'low':
        return { ...LOW_PERFORMANCE_SETTINGS };
      default:
        return { ...MEDIUM_PERFORMANCE_SETTINGS };
    }
  }

  optimizeBasedOnMetrics(metrics: PerformanceMetrics): AnimationComplexitySettings {
    // Reset to device-appropriate baseline if performance is good
    if (metrics.isPerformanceGood && this.appliedOptimizations.size > 0) {
      this.currentSettings = this.getSettingsForDevice(metrics.deviceCapability);
      this.appliedOptimizations.clear();
      return this.currentSettings;
    }

    // Apply optimizations based on performance issues
    const applicableStrategies = OPTIMIZATION_STRATEGIES
      .filter(strategy => 
        strategy.condition(metrics) && 
        !this.appliedOptimizations.has(strategy.name)
      )
      .sort((a, b) => a.priority - b.priority);

    if (applicableStrategies.length > 0) {
      const strategy = applicableStrategies[0];
      this.currentSettings = strategy.apply(this.currentSettings);
      this.appliedOptimizations.add(strategy.name);
      
      // Record optimization history
      this.optimizationHistory.push({
        timestamp: Date.now(),
        strategy: strategy.name,
        metrics: { ...metrics }
      });

      // Keep only recent history
      if (this.optimizationHistory.length > 20) {
        this.optimizationHistory.shift();
      }
    }

    return this.currentSettings;
  }

  getCurrentSettings(): AnimationComplexitySettings {
    return { ...this.currentSettings };
  }

  getAppliedOptimizations(): string[] {
    return Array.from(this.appliedOptimizations);
  }

  getOptimizationHistory(): Array<{
    timestamp: number;
    strategy: string;
    metrics: PerformanceMetrics;
  }> {
    return [...this.optimizationHistory];
  }

  resetOptimizations(): void {
    this.appliedOptimizations.clear();
    this.optimizationHistory = [];
  }

  // Utility methods for specific optimizations
  static createOptimizedAnimationProps(settings: AnimationComplexitySettings) {
    return {
      transition: {
        duration: settings.transitionDuration / 1000,
        ease: settings.enableGPUAcceleration ? 'easeOut' : 'linear'
      },
      style: {
        willChange: settings.enableGPUAcceleration ? 'transform, opacity' : 'auto',
        transform: settings.enable3DTransforms ? 'translateZ(0)' : undefined
      }
    };
  }

  static getParticleConfig(settings: AnimationComplexitySettings) {
    return {
      count: settings.particleCount,
      enablePhysics: settings.enableGPUAcceleration,
      enableInteraction: settings.enable3DTransforms,
      animationDuration: settings.transitionDuration
    };
  }

  static getBlurClasses(settings: AnimationComplexitySettings): string {
    switch (settings.blurEffects) {
      case 'full':
        return 'backdrop-blur-md';
      case 'reduced':
        return 'backdrop-blur-sm';
      case 'disabled':
        return '';
      default:
        return 'backdrop-blur-sm';
    }
  }

  static getShadowClasses(settings: AnimationComplexitySettings): string {
    switch (settings.shadowEffects) {
      case 'full':
        return 'shadow-2xl';
      case 'reduced':
        return 'shadow-lg';
      case 'disabled':
        return 'shadow-none';
      default:
        return 'shadow-lg';
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer();