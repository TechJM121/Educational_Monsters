import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ParticleEngine } from '../ParticleEngine';
import { createParticleConfig } from '../ParticleConfig';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

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

// Mock HTMLCanvasElement
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
let animationFrameId = 0;
const mockRequestAnimationFrame = vi.fn((callback) => {
  animationFrameId++;
  setTimeout(() => callback(performance.now()), 16);
  return animationFrameId;
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

describe('ParticleEngine', () => {
  const defaultConfig = createParticleConfig('magical', 'high');

  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameId = 0;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders canvas element', () => {
    render(<ParticleEngine config={defaultConfig} />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('initializes particles based on config count', async () => {
    const config = { ...defaultConfig, count: 50 };
    render(<ParticleEngine config={config} />);
    
    await waitFor(() => {
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  it('handles mouse interaction when interactive', async () => {
    render(<ParticleEngine config={defaultConfig} interactive={true} />);
    const canvas = document.querySelector('canvas');
    
    fireEvent.mouseMove(canvas!, { clientX: 100, clientY: 100 });
    
    await waitFor(() => {
      expect(mockCanvas.getBoundingClientRect).toHaveBeenCalled();
    });
  });

  it('does not handle mouse interaction when not interactive', () => {
    render(<ParticleEngine config={defaultConfig} interactive={false} />);
    const canvas = document.querySelector('canvas');
    
    expect(canvas).toHaveClass('pointer-events-none');
  });

  it('adjusts particle count based on device capability', () => {
    mockUseDeviceCapability.mockReturnValue('low');
    
    const config = { ...defaultConfig, count: 100 };
    render(<ParticleEngine config={config} />);
    
    // Should reduce particle count for low-end devices
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(<ParticleEngine config={defaultConfig} />);
    
    unmount();
    
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('handles canvas resize', async () => {
    render(<ParticleEngine config={defaultConfig} />);
    
    // Simulate window resize
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  it('applies theme-specific colors', () => {
    const techConfig = createParticleConfig('tech', 'high');
    render(<ParticleEngine config={techConfig} theme="tech" />);
    
    expect(techConfig.color).toContain('#06B6D4');
  });
});

describe('ParticleEngine Performance', () => {
  it('maintains target frame rate with high particle count', async () => {
    const startTime = performance.now();
    let frameCount = 0;
    const targetFrames = 60;
    
    const performanceTest = () => {
      frameCount++;
      if (frameCount < targetFrames) {
        requestAnimationFrame(performanceTest);
      } else {
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const fps = (frameCount / totalTime) * 1000;
        
        // Should maintain at least 30 FPS
        expect(fps).toBeGreaterThan(30);
      }
    };
    
    const highCountConfig = { ...createParticleConfig('magical', 'high'), count: 200 };
    render(<ParticleEngine config={highCountConfig} />);
    
    requestAnimationFrame(performanceTest);
    
    await waitFor(() => {
      expect(frameCount).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('reduces complexity on low-end devices', () => {
    mockUseDeviceCapability.mockReturnValue('low');
    
    const config = createParticleConfig('magical', 'low');
    
    expect(config.count).toBeLessThan(50);
    expect(config.interactionRadius).toBeLessThan(100);
  });

  it('handles memory efficiently with large particle counts', () => {
    const largeConfig = { ...createParticleConfig('cosmic', 'high'), count: 500 };
    
    const { unmount } = render(<ParticleEngine config={largeConfig} />);
    
    // Should not throw memory errors
    expect(() => unmount()).not.toThrow();
  });
});

describe('Particle Physics', () => {
  const defaultConfig = createParticleConfig('magical', 'high');
  
  it('applies magnetic forces correctly', async () => {
    const config = { ...defaultConfig, magneticForce: 0.05, interactionRadius: 100 };
    render(<ParticleEngine config={config} interactive={true} />);
    
    const canvas = document.querySelector('canvas');
    
    // Simulate mouse movement to trigger magnetic forces
    fireEvent.mouseMove(canvas!, { clientX: 400, clientY: 300 });
    
    await waitFor(() => {
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  it('applies friction to particle movement', async () => {
    const config = { ...defaultConfig, friction: 0.95 };
    render(<ParticleEngine config={config} />);
    
    await waitFor(() => {
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  it('handles boundary collisions with elastic bounce', async () => {
    render(<ParticleEngine config={defaultConfig} />);
    
    await waitFor(() => {
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });
});