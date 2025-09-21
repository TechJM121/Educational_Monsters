import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeviceCapabilityDetector } from '../deviceCapabilityDetector';

// Mock navigator and other browser APIs
const mockNavigator = {
  deviceMemory: 8,
  hardwareConcurrency: 8,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  maxTouchPoints: 0,
  vibrate: vi.fn(),
  mediaDevices: {
    getDisplayMedia: vi.fn()
  },
  getBattery: vi.fn()
};

const mockScreen = {
  width: 1920,
  height: 1080,
  colorDepth: 24
};

const mockCanvas = {
  getContext: vi.fn()
};

const mockWebGLContext = {
  getParameter: vi.fn(),
  getExtension: vi.fn(),
  getSupportedExtensions: vi.fn(() => ['WEBGL_debug_renderer_info'])
};

describe('DeviceCapabilityDetector', () => {
  let detector: DeviceCapabilityDetector;

  beforeEach(() => {
    detector = new DeviceCapabilityDetector();
    
    // Setup mocks
    global.navigator = mockNavigator as any;
    global.screen = mockScreen as any;
    global.window = {
      devicePixelRatio: 1,
      screen: mockScreen,
      Worker: function() {} as any,
      IntersectionObserver: function() {} as any,
      PerformanceObserver: function() {} as any,
      DeviceMotionEvent: function() {} as any,
      AudioContext: function() {} as any
    } as any;
    
    // Ensure Worker is available
    global.Worker = function() {} as any;
    
    global.document = {
      createElement: vi.fn(() => mockCanvas)
    } as any;
    
    // Setup WebGL context mock
    mockCanvas.getContext.mockImplementation((type: string) => {
      if (type === 'webgl' || type === 'experimental-webgl' || type === 'webgl2') {
        return mockWebGLContext;
      }
      return null;
    });
    
    mockWebGLContext.getExtension.mockImplementation((name: string) => {
      if (name === 'WEBGL_debug_renderer_info') {
        return {
          UNMASKED_VENDOR_WEBGL: 37445,
          UNMASKED_RENDERER_WEBGL: 37446
        };
      }
      return null;
    });
    
    mockWebGLContext.getParameter.mockImplementation((param: number) => {
      switch (param) {
        case 37445: return 'NVIDIA Corporation';
        case 37446: return 'NVIDIA GeForce RTX 3080';
        case mockWebGLContext.MAX_TEXTURE_SIZE: return 16384;
        default: return null;
      }
    });
    
    vi.clearAllMocks();
  });

  describe('detectCapabilities', () => {
    it('should detect high-end device capabilities', async () => {
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.tier).toBe('high');
      expect(capabilities.memory).toBe(8);
      expect(capabilities.cores).toBe(8);
      expect(capabilities.gpu.vendor).toBe('NVIDIA Corporation');
      expect(capabilities.gpu.isDedicated).toBe(true);
      expect(capabilities.score).toBeGreaterThan(70);
    });

    it('should detect medium-end device capabilities', async () => {
      // Mock medium-end device
      mockNavigator.deviceMemory = 4;
      mockNavigator.hardwareConcurrency = 4;
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 37445: return 'Intel';
          case 37446: return 'Intel UHD Graphics';
          case mockWebGLContext.MAX_TEXTURE_SIZE: return 8192;
          default: return null;
        }
      });
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.tier).toBe('medium');
      expect(capabilities.memory).toBe(4);
      expect(capabilities.cores).toBe(4);
      expect(capabilities.gpu.isDedicated).toBe(false);
    });

    it('should detect low-end device capabilities', async () => {
      // Mock low-end device
      mockNavigator.deviceMemory = 2;
      mockNavigator.hardwareConcurrency = 2;
      mockCanvas.getContext.mockReturnValue(null); // No WebGL
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.tier).toBe('low');
      expect(capabilities.memory).toBe(2);
      expect(capabilities.cores).toBe(2);
      expect(capabilities.gpu.webglVersion).toBe(0);
    });

    it('should cache capabilities after first detection', async () => {
      const capabilities1 = await detector.detectCapabilities();
      const capabilities2 = await detector.detectCapabilities();
      
      expect(capabilities1).toBe(capabilities2); // Same object reference
    });

    it('should detect mobile device', async () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      mockNavigator.maxTouchPoints = 5;
      delete mockNavigator.deviceMemory; // Mobile devices often don't expose this
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.memory).toBe(4); // Fallback for mobile
      expect(capabilities.features.touchSupport).toBe(true);
    });
  });

  describe('GPU detection', () => {
    it('should identify dedicated GPU', async () => {
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 37445: return 'NVIDIA Corporation';
          case 37446: return 'NVIDIA GeForce RTX 3080';
          default: return null;
        }
      });
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.gpu.isDedicated).toBe(true);
      expect(capabilities.gpu.vendor).toBe('NVIDIA Corporation');
      expect(capabilities.gpu.renderer).toBe('NVIDIA GeForce RTX 3080');
    });

    it('should identify integrated GPU', async () => {
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 37445: return 'Intel';
          case 37446: return 'Intel UHD Graphics 620';
          default: return null;
        }
      });
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.gpu.isDedicated).toBe(false);
    });

    it('should handle no WebGL support', async () => {
      mockCanvas.getContext.mockReturnValue(null);
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.gpu.webglVersion).toBe(0);
      expect(capabilities.gpu.vendor).toBe('unknown');
      expect(capabilities.gpu.renderer).toBe('software');
    });
  });

  describe('getAnimationPreset', () => {
    it('should return high performance preset for high-end device', async () => {
      const capabilities = await detector.detectCapabilities();
      const preset = detector.getAnimationPreset(capabilities);
      
      expect(preset.name).toBe('High Performance');
      expect(preset.particleCount).toBe(200);
      expect(preset.blurEffects).toBe('full');
      expect(preset.enableGPUAcceleration).toBe(true);
      expect(preset.enable3DTransforms).toBe(true);
    });

    it('should apply battery optimization', async () => {
      const capabilities = await detector.detectCapabilities();
      capabilities.battery.level = 0.1; // Low battery
      capabilities.battery.charging = false;
      
      const preset = detector.getAnimationPreset(capabilities);
      
      expect(preset.particleCount).toBeLessThan(200);
      expect(preset.enableComplexAnimations).toBe(false);
    });

    it('should apply data saver optimization', async () => {
      const capabilities = await detector.detectCapabilities();
      capabilities.network.saveData = true;
      
      const preset = detector.getAnimationPreset(capabilities);
      
      expect(preset.particleCount).toBeLessThan(200);
      expect(preset.blurEffects).toBe('disabled');
      expect(preset.enableComplexAnimations).toBe(false);
    });

    it('should optimize for high DPI on low-end device', async () => {
      mockNavigator.deviceMemory = 2;
      mockNavigator.hardwareConcurrency = 2;
      mockCanvas.getContext.mockReturnValue(null);
      global.window.devicePixelRatio = 3; // High DPI
      
      const capabilities = await detector.detectCapabilities();
      const preset = detector.getAnimationPreset(capabilities);
      
      expect(capabilities.tier).toBe('low');
      expect(capabilities.screen.isHighDPI).toBe(true);
      expect(preset.particleCount).toBeLessThan(30); // Further reduced
    });
  });

  describe('applyUserPreferences', () => {
    it('should override preset with user preferences', async () => {
      const capabilities = await detector.detectCapabilities();
      const preset = detector.getAnimationPreset(capabilities);
      
      const userPreferences = {
        particleCount: 50,
        blurEffects: 'disabled' as const,
        enableParallax: false
      };
      
      const customPreset = detector.applyUserPreferences(preset, userPreferences);
      
      expect(customPreset.particleCount).toBe(50);
      expect(customPreset.blurEffects).toBe('disabled');
      expect(customPreset.enableParallax).toBe(false);
      // Other properties should remain unchanged
      expect(customPreset.shadowEffects).toBe(preset.shadowEffects);
    });
  });

  describe('performance scoring', () => {
    it('should calculate high performance score', async () => {
      // High-end setup
      mockNavigator.deviceMemory = 16;
      mockNavigator.hardwareConcurrency = 12;
      mockWebGLContext.getParameter.mockImplementation((param: number) => {
        switch (param) {
          case 37445: return 'NVIDIA Corporation';
          case 37446: return 'NVIDIA GeForce RTX 4090';
          default: return null;
        }
      });
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.score).toBeGreaterThan(80);
    });

    it('should calculate low performance score', async () => {
      // Low-end setup
      mockNavigator.deviceMemory = 2;
      mockNavigator.hardwareConcurrency = 2;
      mockCanvas.getContext.mockReturnValue(null); // No WebGL
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.score).toBeLessThan(40);
    });
  });

  describe('feature detection', () => {
    it('should detect available features', async () => {
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.features.webgl).toBe(true);
      expect(capabilities.features.webWorkers).toBe(true);
      expect(capabilities.features.intersectionObserver).toBe(true);
      expect(capabilities.features.performanceObserver).toBe(true);
      expect(capabilities.features.webAudio).toBe(true);
    });

    it('should detect touch support', async () => {
      mockNavigator.maxTouchPoints = 10;
      global.window.ontouchstart = {} as any;
      
      const capabilities = await detector.detectCapabilities();
      
      expect(capabilities.features.touchSupport).toBe(true);
    });
  });

  describe('redetectCapabilities', () => {
    it('should force new detection', async () => {
      const capabilities1 = await detector.detectCapabilities();
      
      // Change mock values
      mockNavigator.deviceMemory = 4;
      
      const capabilities2 = await detector.redetectCapabilities();
      
      expect(capabilities2.memory).toBe(4);
      expect(capabilities1).not.toBe(capabilities2); // Different objects
    });
  });
});