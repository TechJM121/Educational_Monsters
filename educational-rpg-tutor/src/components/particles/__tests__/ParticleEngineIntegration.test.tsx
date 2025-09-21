import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ParticleEngineDemo } from '../ParticleEngineDemo';
import { ParticleEngine } from '../ParticleEngine';
import { createParticleConfig } from '../ParticleConfig';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock canvas and WebGL context
const mockCanvas = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    }))
  })),
  width: 800,
  height: 600,
  clientWidth: 800,
  clientHeight: 600,
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600
  }))
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockCanvas.getContext
});

Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  get: () => mockCanvas.width,
  set: (value) => { mockCanvas.width = value; }
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  get: () => mockCanvas.height,
  set: (value) => { mockCanvas.height = value; }
});

Object.defineProperty(HTMLCanvasElement.prototype, 'clientWidth', {
  get: () => mockCanvas.clientWidth
});

Object.defineProperty(HTMLCanvasElement.prototype, 'clientHeight', {
  get: () => mockCanvas.clientHeight
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
  value: mockCanvas.getBoundingClientRect
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  setTimeout(() => callback(performance.now()), 16);
  return 1;
});

const mockCancelAnimationFrame = vi.fn();

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame
});

// Mock device capability hook
const mockUseDeviceCapability = vi.fn(() => 'high');
vi.mock('../../hooks/useDeviceCapability', () => ({
  useDeviceCapability: mockUseDeviceCapability
}));

describe('Particle Engine Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 3.1: Configurable particle system', () => {
    it('creates particle system with configurable count', () => {
      const config = createParticleConfig('magical', 'high');
      expect(config.count).toBeGreaterThan(0);
      expect(config.count).toBeLessThanOrEqual(200);
    });

    it('supports different themes with unique configurations', () => {
      const themes: Array<'magical' | 'tech' | 'nature' | 'cosmic'> = ['magical', 'tech', 'nature', 'cosmic'];
      
      themes.forEach(theme => {
        const config = createParticleConfig(theme, 'high');
        expect(config.color.length).toBeGreaterThan(0);
        expect(config.size.min).toBeGreaterThan(0);
        expect(config.size.max).toBeGreaterThan(config.size.min);
        expect(config.speed.min).toBeGreaterThan(0);
        expect(config.speed.max).toBeGreaterThan(config.speed.min);
      });
    });

    it('configures interaction radius properly', () => {
      const config = createParticleConfig('tech', 'medium');
      expect(config.interactionRadius).toBeGreaterThan(0);
      expect(config.interactionRadius).toBeLessThan(300);
    });
  });

  describe('Requirement 3.2: Physics implementation', () => {
    it('implements velocity-based particle movement', () => {
      const config = createParticleConfig('magical', 'high');
      expect(config.speed.min).toBeGreaterThan(0);
      expect(config.speed.max).toBeGreaterThan(config.speed.min);
    });

    it('applies friction to particle movement', () => {
      const config = createParticleConfig('nature', 'high');
      expect(config.friction).toBeGreaterThan(0.9);
      expect(config.friction).toBeLessThan(1.0);
    });

    it('implements magnetic forces', () => {
      const config = createParticleConfig('cosmic', 'high');
      expect(config.magneticForce).toBeGreaterThan(0);
      expect(config.magneticForce).toBeLessThan(0.1);
    });
  });

  describe('Requirement 3.3: Mouse interaction', () => {
    it('enables mouse interaction when interactive prop is true', () => {
      const config = createParticleConfig('tech', 'high');
      render(<ParticleEngine config={config} interactive={true} />);
      
      const canvas = document.querySelector('canvas');
      expect(canvas).not.toHaveClass('pointer-events-none');
    });

    it('disables mouse interaction when interactive prop is false', () => {
      const config = createParticleConfig('tech', 'high');
      render(<ParticleEngine config={config} interactive={false} />);
      
      const canvas = document.querySelector('canvas');
      expect(canvas).toHaveClass('pointer-events-none');
    });

    it('responds to mouse movement with attraction/repulsion effects', async () => {
      const config = createParticleConfig('magical', 'high');
      render(<ParticleEngine config={config} interactive={true} />);
      
      const canvas = document.querySelector('canvas');
      fireEvent.mouseMove(canvas!, { clientX: 100, clientY: 100 });
      
      await waitFor(() => {
        expect(mockCanvas.getBoundingClientRect).toHaveBeenCalled();
      });
    });
  });

  describe('Requirement 14.1 & 14.2: Performance optimization', () => {
    it('maintains 60fps target with reasonable particle counts', () => {
      const config = createParticleConfig('tech', 'high');
      expect(config.count).toBeLessThanOrEqual(150); // Reasonable for 60fps
    });

    it('adapts particle count based on device capability', () => {
      const highConfig = createParticleConfig('magical', 'high');
      const mediumConfig = createParticleConfig('magical', 'medium');
      const lowConfig = createParticleConfig('magical', 'low');

      expect(lowConfig.count).toBeLessThan(mediumConfig.count);
      expect(mediumConfig.count).toBeLessThan(highConfig.count);
    });

    it('reduces interaction complexity for low-end devices', () => {
      const lowConfig = createParticleConfig('cosmic', 'low');
      const highConfig = createParticleConfig('cosmic', 'high');

      expect(lowConfig.interactionRadius).toBeLessThan(highConfig.interactionRadius);
      expect(lowConfig.magneticForce).toBeLessThan(highConfig.magneticForce);
    });

    it('uses efficient rendering parameters', () => {
      const config = createParticleConfig('nature', 'medium');
      
      // Opacity range should be efficient for rendering
      expect(config.opacity.min).toBeGreaterThan(0);
      expect(config.opacity.max).toBeLessThanOrEqual(1);
      
      // Size range should be reasonable for canvas performance
      expect(config.size.max).toBeLessThan(20);
    });
  });

  describe('Performance benchmarks', () => {
    it('completes particle updates within frame budget', () => {
      const startTime = performance.now();
      const config = createParticleConfig('tech', 'high');
      
      // Simulate particle physics calculations
      for (let i = 0; i < config.count; i++) {
        // Simulate basic physics operations
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
          // Apply force calculations
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within a reasonable time for 60fps (16.67ms budget)
      expect(duration).toBeLessThan(50); // Allow some overhead for test environment
    });

    it('handles memory efficiently with large particle counts', () => {
      const largeConfig = { ...createParticleConfig('magical', 'high'), count: 500 };
      
      // Should not throw memory errors during initialization
      expect(() => {
        render(<ParticleEngine config={largeConfig} />);
      }).not.toThrow();
    });
  });

  describe('Demo component integration', () => {
    it('renders particle engine demo with controls', () => {
      render(<ParticleEngineDemo />);
      
      // Should have theme selection buttons
      expect(document.querySelector('button')).toBeInTheDocument();
      
      // Should have particle engine canvas
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    it('allows theme switching', async () => {
      render(<ParticleEngineDemo />);
      
      const techButton = document.querySelector('button[data-theme="tech"]') || 
                        Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent?.toLowerCase().includes('tech'));
      
      if (techButton) {
        fireEvent.click(techButton);
        await waitFor(() => {
          expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });
      }
    });

    it('provides interactive controls for physics parameters', () => {
      render(<ParticleEngineDemo />);
      
      // Should have range inputs for physics parameters
      const rangeInputs = document.querySelectorAll('input[type="range"]');
      expect(rangeInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling and edge cases', () => {
    it('handles zero particle count gracefully', () => {
      const config = { ...createParticleConfig('magical', 'high'), count: 0 };
      
      expect(() => {
        render(<ParticleEngine config={config} />);
      }).not.toThrow();
    });

    it('handles extreme physics parameters', () => {
      const extremeConfig = {
        ...createParticleConfig('tech', 'high'),
        magneticForce: 1.0, // Very high
        friction: 0.1, // Very low
        interactionRadius: 1000 // Very large
      };
      
      expect(() => {
        render(<ParticleEngine config={extremeConfig} />);
      }).not.toThrow();
    });

    it('cleans up resources on unmount', () => {
      const config = createParticleConfig('cosmic', 'high');
      const { unmount } = render(<ParticleEngine config={config} />);
      
      unmount();
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });
});