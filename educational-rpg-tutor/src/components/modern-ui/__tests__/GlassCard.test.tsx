/**
 * GlassCard Component Tests
 * Tests the glassmorphic card component with configurable blur, opacity, and border effects
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlassCard } from '../GlassCard';
import { ThemeProvider, AnimationProvider } from '../../../design-system';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, className, style, variants, initial, animate, whileHover, whileTap, ...props }, ref) => (
      <div 
        ref={ref} 
        className={className} 
        style={style} 
        data-testid="glass-card"
        data-interactive={whileHover ? 'true' : 'false'}
        {...props}
      >
        {children}
      </div>
    )),
  },
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024,
    },
  },
});

// Mock requestAnimationFrame with proper typing
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  setTimeout(() => cb(Date.now()), 16);
  return 1;
}) as any;

global.cancelAnimationFrame = vi.fn();

// Mock navigator properties
Object.defineProperty(navigator, 'hardwareConcurrency', {
  value: 4,
  configurable: true,
});

Object.defineProperty(navigator, 'deviceMemory', {
  value: 8,
  configurable: true,
});

// Mock canvas and WebGL with proper typing
const mockWebGLContext = {
  getParameter: vi.fn((param: number) => {
    if (param === 37445) return 'Intel Iris Pro'; // RENDERER
    return 'Mock WebGL';
  }),
  getExtension: vi.fn(() => null),
  getSupportedExtensions: vi.fn(() => ['ext1', 'ext2']),
  RENDERER: 37445,
  VENDOR: 37446,
};

HTMLCanvasElement.prototype.getContext = vi.fn((type: string) => {
  if (type === 'webgl' || type === 'experimental-webgl') {
    return mockWebGLContext as any;
  }
  if (type === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
    } as any;
  }
  return null;
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AnimationProvider>
      {children}
    </AnimationProvider>
  </ThemeProvider>
);

describe('GlassCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children correctly', () => {
    render(
      <TestWrapper>
        <GlassCard>
          <p>Test content</p>
        </GlassCard>
      </TestWrapper>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply correct blur classes', () => {
    const { rerender } = render(
      <TestWrapper>
        <GlassCard blur="sm">
          <p>Small blur</p>
        </GlassCard>
      </TestWrapper>
    );

    let glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('backdrop-blur-sm');

    rerender(
      <TestWrapper>
        <GlassCard blur="lg">
          <p>Large blur</p>
        </GlassCard>
      </TestWrapper>
    );

    glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('backdrop-blur-lg');
  });

  it('should apply correct border styles', () => {
    const { rerender } = render(
      <TestWrapper>
        <GlassCard border="subtle">
          <p>Subtle border</p>
        </GlassCard>
      </TestWrapper>
    );

    let glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('border', 'border-white/20');

    rerender(
      <TestWrapper>
        <GlassCard border="prominent">
          <p>Prominent border</p>
        </GlassCard>
      </TestWrapper>
    );

    glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('border-2', 'border-white/30');

    rerender(
      <TestWrapper>
        <GlassCard border="glow">
          <p>Glow border</p>
        </GlassCard>
      </TestWrapper>
    );

    glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('border', 'border-white/20', 'shadow-glow-sm');
  });

  it('should apply correct shadow styles', () => {
    const { rerender } = render(
      <TestWrapper>
        <GlassCard shadow="soft">
          <p>Soft shadow</p>
        </GlassCard>
      </TestWrapper>
    );

    let glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('shadow-glass-sm');

    rerender(
      <TestWrapper>
        <GlassCard shadow="dramatic">
          <p>Dramatic shadow</p>
        </GlassCard>
      </TestWrapper>
    );

    glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('shadow-glass-lg');
  });

  it('should handle interactive state correctly', () => {
    render(
      <TestWrapper>
        <GlassCard interactive>
          <p>Interactive content</p>
        </GlassCard>
      </TestWrapper>
    );

    const glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('cursor-pointer', 'select-none');
    expect(glassCard).toHaveAttribute('data-interactive', 'true');
  });

  it('should handle non-interactive state correctly', () => {
    render(
      <TestWrapper>
        <GlassCard interactive={false}>
          <p>Non-interactive content</p>
        </GlassCard>
      </TestWrapper>
    );

    const glassCard = screen.getByTestId('glass-card');
    expect(glassCard).not.toHaveClass('cursor-pointer');
    expect(glassCard).toHaveAttribute('data-interactive', 'false');
  });

  it('should apply custom className', () => {
    render(
      <TestWrapper>
        <GlassCard className="custom-class">
          <p>Custom styled content</p>
        </GlassCard>
      </TestWrapper>
    );

    const glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass('custom-class');
  });

  it('should handle different opacity levels', () => {
    const { rerender } = render(
      <TestWrapper>
        <GlassCard opacity={0.05}>
          <p>Light opacity</p>
        </GlassCard>
      </TestWrapper>
    );

    // Test that component renders with different opacity values
    expect(screen.getByText('Light opacity')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <GlassCard opacity={0.25}>
          <p>Strong opacity</p>
        </GlassCard>
      </TestWrapper>
    );

    expect(screen.getByText('Strong opacity')).toBeInTheDocument();
  });

  it('should work with all prop combinations', () => {
    render(
      <TestWrapper>
        <GlassCard 
          blur="xl" 
          opacity={0.2}
          border="glow" 
          shadow="dramatic" 
          interactive 
          className="test-class"
        >
          <div>
            <h3>Complex Card</h3>
            <p>With multiple props</p>
          </div>
        </GlassCard>
      </TestWrapper>
    );

    const glassCard = screen.getByTestId('glass-card');
    expect(glassCard).toHaveClass(
      'backdrop-blur-xl',
      'border',
      'border-white/20',
      'shadow-glow-sm',
      'shadow-glass-lg',
      'rounded-2xl',
      'p-6',
      'cursor-pointer',
      'select-none',
      'test-class'
    );

    expect(screen.getByText('Complex Card')).toBeInTheDocument();
    expect(screen.getByText('With multiple props')).toBeInTheDocument();
  });

  it('should integrate with theme and animation providers', () => {
    // This test verifies that our design system foundation is working
    expect(() => {
      render(
        <TestWrapper>
          <GlassCard>
            <div>Theme and animation integration test</div>
          </GlassCard>
        </TestWrapper>
      );
    }).not.toThrow();

    expect(screen.getByText('Theme and animation integration test')).toBeInTheDocument();
  });
});