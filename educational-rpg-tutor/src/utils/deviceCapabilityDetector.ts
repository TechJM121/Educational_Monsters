export interface DeviceCapabilities {
  tier: 'high' | 'medium' | 'low';
  memory: number; // GB
  cores: number;
  gpu: GPUInfo;
  screen: ScreenInfo;
  network: NetworkInfo;
  battery: BatteryInfo;
  features: DeviceFeatures;
  score: number; // 0-100 performance score
}

export interface GPUInfo {
  vendor: string;
  renderer: string;
  isDedicated: boolean;
  webglVersion: number;
  maxTextureSize: number;
  supportedExtensions: string[];
}

export interface ScreenInfo {
  width: number;
  height: number;
  pixelRatio: number;
  colorDepth: number;
  refreshRate: number;
  isHighDPI: boolean;
}

export interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
}

export interface BatteryInfo {
  level: number; // 0-1
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export interface DeviceFeatures {
  touchSupport: boolean;
  webgl: boolean;
  webgl2: boolean;
  webWorkers: boolean;
  serviceWorkers: boolean;
  intersectionObserver: boolean;
  performanceObserver: boolean;
  vibration: boolean;
  deviceMotion: boolean;
  webAudio: boolean;
}

export interface AnimationPreset {
  name: string;
  particleCount: number;
  blurEffects: 'full' | 'reduced' | 'disabled';
  shadowEffects: 'full' | 'reduced' | 'disabled';
  transitionDuration: number;
  enableGPUAcceleration: boolean;
  enable3DTransforms: boolean;
  enableParallax: boolean;
  enableComplexAnimations: boolean;
  maxConcurrentAnimations: number;
}

export class DeviceCapabilityDetector {
  private capabilities: DeviceCapabilities | null = null;
  private detectionPromise: Promise<DeviceCapabilities> | null = null;

  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this.performDetection();
    this.capabilities = await this.detectionPromise;
    return this.capabilities;
  }

  private async performDetection(): Promise<DeviceCapabilities> {
    const [gpu, screen, network, battery, features] = await Promise.all([
      this.detectGPU(),
      this.detectScreen(),
      this.detectNetwork(),
      this.detectBattery(),
      this.detectFeatures()
    ]);

    const memory = this.detectMemory();
    const cores = this.detectCores();
    const score = this.calculatePerformanceScore(memory, cores, gpu, screen);
    const tier = this.determineTier(score, memory, cores, gpu);

    return {
      tier,
      memory,
      cores,
      gpu,
      screen,
      network,
      battery,
      features,
      score
    };
  }

  private detectMemory(): number {
    // Device memory in GB
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory;
    }
    
    // Fallback estimation based on other factors
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Mobile devices typically have less memory
    if (/mobile|android|iphone|ipad/.test(userAgent)) {
      return 4; // Assume 4GB for modern mobile devices
    }
    
    // Desktop fallback
    return 8;
  }

  private detectCores(): number {
    return navigator.hardwareConcurrency || 4;
  }

  private async detectGPU(): Promise<GPUInfo> {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return {
        vendor: 'unknown',
        renderer: 'software',
        isDedicated: false,
        webglVersion: 0,
        maxTextureSize: 0,
        supportedExtensions: []
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
    
    // Check for WebGL 2
    const gl2 = canvas.getContext('webgl2');
    const webglVersion = gl2 ? 2 : 1;
    
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const supportedExtensions = gl.getSupportedExtensions() || [];
    
    // Determine if GPU is dedicated (heuristic)
    const isDedicated = this.isGPUDedicated(vendor, renderer);

    return {
      vendor,
      renderer,
      isDedicated,
      webglVersion,
      maxTextureSize,
      supportedExtensions
    };
  }

  private isGPUDedicated(vendor: string, renderer: string): boolean {
    const dedicatedKeywords = [
      'nvidia', 'geforce', 'quadro', 'tesla',
      'amd', 'radeon', 'rx ', 'vega',
      'intel arc', 'xe graphics'
    ];
    
    const integratedKeywords = [
      'intel hd', 'intel uhd', 'intel iris',
      'mali', 'adreno', 'powervr'
    ];
    
    const combined = `${vendor} ${renderer}`.toLowerCase();
    
    if (integratedKeywords.some(keyword => combined.includes(keyword))) {
      return false;
    }
    
    return dedicatedKeywords.some(keyword => combined.includes(keyword));
  }

  private async detectScreen(): Promise<ScreenInfo> {
    const screen = window.screen;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Try to get refresh rate
    let refreshRate = 60; // Default assumption
    if ('getDisplayMedia' in navigator.mediaDevices) {
      try {
        // This is a hack to detect refresh rate, may not work in all browsers
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        refreshRate = settings.frameRate || 60;
        stream.getTracks().forEach(track => track.stop());
      } catch {
        // Fallback to default
      }
    }

    return {
      width: screen.width,
      height: screen.height,
      pixelRatio,
      colorDepth: screen.colorDepth,
      refreshRate,
      isHighDPI: pixelRatio > 1.5
    };
  }

  private async detectNetwork(): Promise<NetworkInfo> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };
    }

    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false
    };
  }

  private async detectBattery(): Promise<BatteryInfo> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      } catch {
        // Battery API not available
      }
    }

    return {
      level: 1,
      charging: true,
      chargingTime: Infinity,
      dischargingTime: Infinity
    };
  }

  private async detectFeatures(): Promise<DeviceFeatures> {
    return {
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      webgl: !!document.createElement('canvas').getContext('webgl'),
      webgl2: !!document.createElement('canvas').getContext('webgl2'),
      webWorkers: typeof Worker !== 'undefined',
      serviceWorkers: 'serviceWorker' in navigator,
      intersectionObserver: 'IntersectionObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,
      vibration: 'vibrate' in navigator,
      deviceMotion: 'DeviceMotionEvent' in window,
      webAudio: 'AudioContext' in window || 'webkitAudioContext' in window
    };
  }

  private calculatePerformanceScore(
    memory: number,
    cores: number,
    gpu: GPUInfo,
    screen: ScreenInfo
  ): number {
    let score = 0;

    // Memory score (0-30 points)
    score += Math.min(memory * 3, 30);

    // CPU score (0-25 points)
    score += Math.min(cores * 3, 25);

    // GPU score (0-30 points)
    if (gpu.webglVersion === 0) {
      score += 0;
    } else if (gpu.isDedicated) {
      score += 30;
    } else if (gpu.webglVersion === 2) {
      score += 20;
    } else {
      score += 10;
    }

    // Screen score (0-15 points)
    const pixelCount = screen.width * screen.height * screen.pixelRatio;
    if (pixelCount > 8000000) { // 4K+
      score += 5;
    } else if (pixelCount > 2000000) { // 1080p+
      score += 10;
    } else {
      score += 15;
    }

    if (screen.refreshRate > 60) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  private determineTier(
    score: number,
    memory: number,
    cores: number,
    gpu: GPUInfo
  ): 'high' | 'medium' | 'low' {
    // High-end: Score 70+, 8GB+ RAM, 8+ cores, dedicated GPU
    if (score >= 70 && memory >= 8 && cores >= 8 && gpu.isDedicated) {
      return 'high';
    }

    // Medium: Score 40+, 4GB+ RAM, 4+ cores
    if (score >= 40 && memory >= 4 && cores >= 4) {
      return 'medium';
    }

    return 'low';
  }

  getAnimationPreset(capabilities: DeviceCapabilities): AnimationPreset {
    const presets: Record<string, AnimationPreset> = {
      high: {
        name: 'High Performance',
        particleCount: 200,
        blurEffects: 'full',
        shadowEffects: 'full',
        transitionDuration: 300,
        enableGPUAcceleration: true,
        enable3DTransforms: true,
        enableParallax: true,
        enableComplexAnimations: true,
        maxConcurrentAnimations: 10
      },
      medium: {
        name: 'Balanced Performance',
        particleCount: 100,
        blurEffects: 'reduced',
        shadowEffects: 'reduced',
        transitionDuration: 250,
        enableGPUAcceleration: true,
        enable3DTransforms: true,
        enableParallax: false,
        enableComplexAnimations: true,
        maxConcurrentAnimations: 6
      },
      low: {
        name: 'Performance Optimized',
        particleCount: 30,
        blurEffects: 'disabled',
        shadowEffects: 'disabled',
        transitionDuration: 200,
        enableGPUAcceleration: false,
        enable3DTransforms: false,
        enableParallax: false,
        enableComplexAnimations: false,
        maxConcurrentAnimations: 3
      }
    };

    let preset = presets[capabilities.tier];

    // Apply additional optimizations based on specific conditions
    if (capabilities.battery.level < 0.2 && !capabilities.battery.charging) {
      // Low battery - reduce animations
      preset = {
        ...preset,
        particleCount: Math.floor(preset.particleCount * 0.5),
        transitionDuration: Math.floor(preset.transitionDuration * 0.8),
        enableComplexAnimations: false,
        maxConcurrentAnimations: Math.floor(preset.maxConcurrentAnimations * 0.5)
      };
    }

    if (capabilities.network.saveData) {
      // Data saver mode - minimal animations
      preset = {
        ...preset,
        particleCount: Math.floor(preset.particleCount * 0.3),
        blurEffects: 'disabled',
        enableComplexAnimations: false
      };
    }

    if (capabilities.screen.isHighDPI && capabilities.tier === 'low') {
      // High DPI on low-end device - further reduce complexity
      preset = {
        ...preset,
        particleCount: Math.floor(preset.particleCount * 0.7),
        transitionDuration: Math.floor(preset.transitionDuration * 0.9)
      };
    }

    return preset;
  }

  // User preference overrides
  applyUserPreferences(
    preset: AnimationPreset,
    preferences: Partial<AnimationPreset>
  ): AnimationPreset {
    return {
      ...preset,
      ...preferences
    };
  }

  // Get capabilities synchronously if already detected
  getCachedCapabilities(): DeviceCapabilities | null {
    return this.capabilities;
  }

  // Force re-detection (useful for testing or when conditions change)
  async redetectCapabilities(): Promise<DeviceCapabilities> {
    this.capabilities = null;
    this.detectionPromise = null;
    return this.detectCapabilities();
  }
}

// Global instance
export const deviceCapabilityDetector = new DeviceCapabilityDetector();