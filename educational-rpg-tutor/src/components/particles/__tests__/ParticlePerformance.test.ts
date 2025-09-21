import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createParticleConfig } from '../ParticleConfig';
import { DeviceCapability } from '../../../types/animation';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance
});

// Mock requestAnimationFrame for performance testing
let frameTime = 0;
const mockRAF = vi.fn((callback) => {
  frameTime += 16.67; // 60fps
  setTimeout(() => callback(frameTime), 16);
  return frameTime;
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRAF
});

describe('Particle System Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    frameTime = 0;
  });

  describe('Configuration Optimization', () => {
    it('reduces particle count for low-end devices', () => {
      const highConfig = createParticleConfig('magical', 'high');
      const mediumConfig = createParticleConfig('magical', 'medium');
      const lowConfig = createParticleConfig('magical', 'low');

      expect(lowConfig.count).toBeLessThan(mediumConfig.count);
      expect(mediumConfig.count).toBeLessThan(highConfig.count);
    });

    it('adjusts interaction radius based on device capability', () => {
      const capabilities: DeviceCapability[] = ['low', 'medium', 'high'];
      const configs = capabilities.map(cap => createParticleConfig('tech', cap));

      expect(configs[0].interactionRadius).toBeLessThan(configs[1].interactionRadius);
      expect(configs[1].interactionRadius).toBeLessThan(configs[2].interactionRadius);
    });

    it('scales magnetic force appropriately', () => {
      const lowConfig = createParticleConfig('cosmic', 'low');
      const highConfig = createParticleConfig('cosmic', 'high');

      expect(lowConfig.magneticForce).toBeLessThan(highConfig.magneticForce);
    });
  });

  describe('Frame Rate Performance', () => {
    it('simulates 60fps performance with optimal particle count', async () => {
      const config = createParticleConfig('magical', 'high');
      const targetFPS = 60;
      const frameTime = 1000 / targetFPS;

      let frames = 0;
      const maxFrames = 60;

      const simulateFrame = () => {
        frames++;
        mockPerformance.now.mockReturnValue(frames * frameTime);
        
        if (frames < maxFrames) {
          requestAnimationFrame(simulateFrame);
        }
      };

      simulateFrame();

      // Wait for simulation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(frames).toBeGreaterThan(0);
      expect(config.count).toBeLessThanOrEqual(150); // Reasonable limit for 60fps
    });

    it('maintains performance with different themes', () => {
      const themes: Array<'magical' | 'tech' | 'nature' | 'cosmic'> = ['magical', 'tech', 'nature', 'cosmic'];
      
      themes.forEach(theme => {
        const config = createParticleConfig(theme, 'medium');
        
        // All themes should have similar performance characteristics
        expect(config.count).toBeGreaterThan(30);
        expect(config.count).toBeLessThan(100);
        expect(config.interactionRadius).toBeGreaterThan(30);
        expect(config.interactionRadius).toBeLessThan(150);
      });
    });
  });

  describe('Memory Usage Optimization', () => {
    it('limits particle count to prevent memory issues', () => {
      const maxParticles = 500; // Reasonable upper limit
      
      const configs = [
        createParticleConfig('magical', 'high'),
        createParticleConfig('tech', 'high'),
        createParticleConfig('nature', 'high'),
        createParticleConfig('cosmic', 'high')
      ];

      configs.forEach(config => {
        expect(config.count).toBeLessThanOrEqual(maxParticles);
      });
    });

    it('uses appropriate particle sizes for memory efficiency', () => {
      const config = createParticleConfig('tech', 'medium');
      
      // Particle sizes should be reasonable for canvas rendering
      expect(config.size.min).toBeGreaterThan(0);
      expect(config.size.max).toBeLessThan(20);
      expect(config.size.max).toBeGreaterThan(config.size.min);
    });
  });

  describe('Physics Performance', () => {
    it('uses efficient friction values', () => {
      const themes: Array<'magical' | 'tech' | 'nature' | 'cosmic'> = ['magical', 'tech', 'nature', 'cosmic'];
      
      themes.forEach(theme => {
        const config = createParticleConfig(theme, 'high');
        
        // Friction should be between 0.9 and 1.0 for realistic physics
        expect(config.friction).toBeGreaterThan(0.9);
        expect(config.friction).toBeLessThan(1.0);
      });
    });

    it('balances magnetic force for smooth interactions', () => {
      const config = createParticleConfig('magical', 'high');
      
      // Magnetic force should be small enough to prevent jittery movement
      expect(config.magneticForce).toBeGreaterThan(0);
      expect(config.magneticForce).toBeLessThan(0.1);
    });

    it('optimizes interaction radius for performance', () => {
      const lowConfig = createParticleConfig('nature', 'low');
      const highConfig = createParticleConfig('nature', 'high');
      
      // Interaction radius affects collision detection performance
      expect(lowConfig.interactionRadius).toBeLessThan(100);
      expect(highConfig.interactionRadius).toBeLessThan(200);
    });
  });

  describe('Rendering Performance', () => {
    it('uses appropriate opacity ranges for visual quality', () => {
      const config = createParticleConfig('cosmic', 'medium');
      
      expect(config.opacity.min).toBeGreaterThan(0);
      expect(config.opacity.max).toBeLessThanOrEqual(1);
      expect(config.opacity.max).toBeGreaterThan(config.opacity.min);
    });

    it('provides efficient color palettes', () => {
      const themes: Array<'magical' | 'tech' | 'nature' | 'cosmic'> = ['magical', 'tech', 'nature', 'cosmic'];
      
      themes.forEach(theme => {
        const config = createParticleConfig(theme, 'high');
        
        // Should have multiple colors but not too many for performance
        expect(config.color.length).toBeGreaterThan(2);
        expect(config.color.length).toBeLessThan(10);
        
        // All colors should be valid hex codes
        config.color.forEach(color => {
          expect(color).toMatch(/^#[0-9A-F]{6}$/i);
        });
      });
    });
  });

  describe('Benchmark Simulation', () => {
    it('simulates particle update performance', () => {
      const config = createParticleConfig('tech', 'high');
      const particleCount = config.count;
      
      const startTime = performance.now();
      
      // Simulate particle updates
      for (let frame = 0; frame < 60; frame++) {
        for (let i = 0; i < particleCount; i++) {
          // Simulate basic physics calculations
          const x = Math.random() * 800;
          const y = Math.random() * 600;
          const vx = (Math.random() - 0.5) * 2;
          const vy = (Math.random() - 0.5) * 2;
          
          // Simulate magnetic force calculation
          const dx = 400 - x;
          const dy = 300 - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.interactionRadius) {
            const force = config.magneticForce * (1 - distance / config.interactionRadius);
            // Apply force (simplified)
          }
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 60 frames of updates in reasonable time
      expect(totalTime).toBeLessThan(1000); // Less than 1 second
    });

    it('measures rendering performance simulation', () => {
      const config = createParticleConfig('magical', 'medium');
      
      const startTime = performance.now();
      
      // Simulate canvas rendering operations
      for (let frame = 0; frame < 30; frame++) {
        for (let i = 0; i < config.count; i++) {
          // Simulate canvas operations
          const operations = [
            'clearRect',
            'save',
            'globalAlpha',
            'fillStyle',
            'createRadialGradient',
            'beginPath',
            'arc',
            'fill',
            'restore'
          ];
          
          // Each particle requires these operations
          operations.forEach(() => {
            // Simulate operation time
          });
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Rendering simulation should complete quickly
      expect(totalTime).toBeLessThan(500);
    });
  });
});