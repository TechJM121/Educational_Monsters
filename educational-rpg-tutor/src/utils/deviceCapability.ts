/**
 * Device Capability Detection and Adaptation
 * Advanced device capability detection with adaptive configuration management
 */

import type { DeviceCapability } from '../types/animation';

export interface DeviceInfo {
  capability: DeviceCapability;
  cores: number;
  memory: number;
  gpu: string;
  connection: string;
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  features: {
    webgl: boolean;
    webgl2: boolean;
    webWorkers: boolean;
    intersectionObserver: boolean;
    resizeObserver: boolean;
  };
}

export interface AdaptiveConfig {
  animations: {
    enabled: boolean;
    complexity: 'minimal' | 'reduced' | 'full';
    duration: number;
    easing: string;
  };
  particles: {
    maxCount: number;
    interactionRadius: number;
    physicsEnabled: boolean;
  };
  effects: {
    blur: boolean;
    shadows: boolean;
    gradients: boolean;
    glow: boolean;
  };
  rendering: {
    targetFPS: number;
    useGPU: boolean;
    enableWebGL: boolean;
  };
}

export class AdvancedDeviceDetector {
  private static instance: AdvancedDeviceDetector;
  private deviceInfo: DeviceInfo | null = null;
  private adaptiveConfig: AdaptiveConfig | null = null;

  private constructor() {}

  static getInstance(): AdvancedDeviceDetector {
    if (!AdvancedDeviceDetector.instance) {
      AdvancedDeviceDetector.instance = new AdvancedDeviceDetector();
    }
    return AdvancedDeviceDetector.instance;
  }

  async detectDevice(): Promise<DeviceInfo> {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    const deviceInfo: DeviceInfo = {
      capability: 'medium',
      cores: navigator.hardwareConcurrency || 2,
      memory: (navigator as any).deviceMemory || 4,
      gpu: await this.detectGPU(),
      connection: this.detectConnection(),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1,
      },
      features: {
        webgl: this.hasWebGL(),
        webgl2: this.hasWebGL2(),
        webWorkers: typeof Worker !== 'undefined',
        intersectionObserver: 'IntersectionObserver' in window,
        resizeObserver: 'ResizeObserver' in window,
      },
    };

    deviceInfo.capability = this.calculateCapability(deviceInfo);
    this.deviceInfo = deviceInfo;
    return deviceInfo;
  }

  private async detectGPU(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
                 canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      
      if (!gl) return 'Unknown';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return renderer || 'Unknown';
      }

      return gl.getParameter(gl.RENDERER) || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private detectConnection(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) return 'Unknown';
    
    return connection.effectiveType || connection.type || 'Unknown';
  }

  private hasWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') as WebGLRenderingContext | null || 
                canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    } catch {
      return false;
    }
  }

  private hasWebGL2(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') as WebGL2RenderingContext | null);
    } catch {
      return false;
    }
  }

  private calculateCapability(info: DeviceInfo): DeviceCapability {
    let score = 0;

    // CPU cores scoring
    if (info.cores >= 8) score += 4;
    else if (info.cores >= 6) score += 3;
    else if (info.cores >= 4) score += 2;
    else if (info.cores >= 2) score += 1;

    // Memory scoring
    if (info.memory >= 16) score += 4;
    else if (info.memory >= 8) score += 3;
    else if (info.memory >= 4) score += 2;
    else if (info.memory >= 2) score += 1;

    // GPU scoring
    const gpu = info.gpu.toLowerCase();
    if (gpu.includes('nvidia') && (gpu.includes('rtx') || gpu.includes('gtx'))) score += 4;
    else if (gpu.includes('amd') && gpu.includes('radeon')) score += 3;
    else if (gpu.includes('intel iris') || gpu.includes('intel uhd')) score += 2;
    else if (gpu.includes('intel')) score += 1;

    // Screen resolution scoring
    const totalPixels = info.screen.width * info.screen.height * info.screen.pixelRatio;
    if (totalPixels > 8294400) score += 2; // 4K+
    else if (totalPixels > 2073600) score += 1; // 1080p+

    // Connection scoring
    if (info.connection === '4g' || info.connection.includes('wifi')) score += 1;

    // Feature support scoring
    if (info.features.webgl2) score += 2;
    else if (info.features.webgl) score += 1;
    
    if (info.features.webWorkers) score += 1;
    if (info.features.intersectionObserver) score += 1;

    // Determine capability tier
    if (score >= 12) return 'high';
    if (score >= 7) return 'medium';
    return 'low';
  }

  getAdaptiveConfig(capability?: DeviceCapability): AdaptiveConfig {
    const deviceCapability = capability || this.deviceInfo?.capability || 'medium';

    if (this.adaptiveConfig && !capability) {
      return this.adaptiveConfig;
    }

    const configs: Record<DeviceCapability, AdaptiveConfig> = {
      high: {
        animations: {
          enabled: true,
          complexity: 'full',
          duration: 1,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        particles: {
          maxCount: 150,
          interactionRadius: 100,
          physicsEnabled: true,
        },
        effects: {
          blur: true,
          shadows: true,
          gradients: true,
          glow: true,
        },
        rendering: {
          targetFPS: 60,
          useGPU: true,
          enableWebGL: true,
        },
      },
      medium: {
        animations: {
          enabled: true,
          complexity: 'reduced',
          duration: 0.8,
          easing: 'ease-out',
        },
        particles: {
          maxCount: 75,
          interactionRadius: 75,
          physicsEnabled: true,
        },
        effects: {
          blur: true,
          shadows: true,
          gradients: true,
          glow: false,
        },
        rendering: {
          targetFPS: 30,
          useGPU: true,
          enableWebGL: true,
        },
      },
      low: {
        animations: {
          enabled: true,
          complexity: 'minimal',
          duration: 0.6,
          easing: 'ease',
        },
        particles: {
          maxCount: 25,
          interactionRadius: 50,
          physicsEnabled: false,
        },
        effects: {
          blur: false,
          shadows: false,
          gradients: true,
          glow: false,
        },
        rendering: {
          targetFPS: 30,
          useGPU: false,
          enableWebGL: false,
        },
      },
    };

    const config = configs[deviceCapability];
    
    // Apply reduced motion preferences
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      config.animations.enabled = false;
      config.particles.maxCount = Math.min(config.particles.maxCount, 10);
      config.effects.blur = false;
      config.effects.glow = false;
    }

    if (!capability) {
      this.adaptiveConfig = config;
    }

    return config;
  }

  async getBenchmarkScore(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameCount = 0;
      const targetFrames = 60;

      const benchmark = () => {
        frameCount++;
        
        // Perform some computational work
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `hsl(${i * 3.6}, 50%, 50%)`;
            ctx.fillRect(i % 10 * 10, Math.floor(i / 10) * 10, 10, 10);
          }
        }

        if (frameCount < targetFrames) {
          requestAnimationFrame(benchmark);
        } else {
          const endTime = performance.now();
          const totalTime = endTime - startTime;
          const score = Math.round((targetFrames / totalTime) * 1000);
          resolve(score);
        }
      };

      requestAnimationFrame(benchmark);
    });
  }

  reset(): void {
    this.deviceInfo = null;
    this.adaptiveConfig = null;
  }
}

/**
 * Utility functions for device adaptation
 */
export const deviceUtils = {
  /**
   * Check if device supports hardware acceleration
   */
  supportsHardwareAcceleration(): boolean {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    return !!gl;
  },

  /**
   * Detect if device is mobile
   */
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * Detect if device is tablet
   */
  isTablet(): boolean {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  },

  /**
   * Get optimal particle count based on screen size
   */
  getOptimalParticleCount(baseCount: number): number {
    const screenArea = window.screen.width * window.screen.height;
    const baseArea = 1920 * 1080; // 1080p baseline
    const ratio = Math.sqrt(screenArea / baseArea);
    return Math.round(baseCount * Math.min(ratio, 2)); // Cap at 2x
  },

  /**
   * Check battery status for power-aware adaptations
   */
  async getBatteryInfo(): Promise<{ level: number; charging: boolean } | null> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level,
          charging: battery.charging,
        };
      }
    } catch {
      // Battery API not supported
    }
    return null;
  },

  /**
   * Adapt configuration based on battery level
   */
  adaptForBattery(config: AdaptiveConfig, batteryLevel: number): AdaptiveConfig {
    if (batteryLevel < 0.2) {
      // Low battery - reduce everything
      return {
        ...config,
        animations: {
          ...config.animations,
          complexity: 'minimal',
          duration: config.animations.duration * 0.5,
        },
        particles: {
          ...config.particles,
          maxCount: Math.round(config.particles.maxCount * 0.3),
        },
        effects: {
          ...config.effects,
          blur: false,
          glow: false,
        },
        rendering: {
          ...config.rendering,
          targetFPS: 15,
        },
      };
    }
    return config;
  },
};

/**
 * Simple device capability detection for immediate use
 */
export const detectDeviceCapability = (): DeviceCapability => {
  const detector = AdvancedDeviceDetector.getInstance();
  
  // Quick synchronous detection for immediate use
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4;
  const isMobile = deviceUtils.isMobile();
  
  let score = 0;
  
  // CPU scoring
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else if (cores >= 2) score += 1;
  
  // Memory scoring
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else if (memory >= 2) score += 1;
  
  // Mobile penalty
  if (isMobile) score -= 1;
  
  // WebGL support
  if (deviceUtils.supportsHardwareAcceleration()) score += 1;
  
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
};