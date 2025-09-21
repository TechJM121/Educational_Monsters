/**
 * GlassButton Component Tests
 * Tests the glassmorphic button component with micro-interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlassButton } from '../GlassButton';
import { ThemeProvider, AnimationProvider } from '../../../design-system';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef<HTMLButtonElement, any>(({ 
      children, 
      className, 
      style, 
      variants, 
      initial, 
      animate, 
      whileHover, 
      whileTap,
      onClick,
      disabled,
      type,
      ...props 
    }, ref) => (
      <button 
        ref={ref} 
        className={className} 
        style={style} 
        onClick={onClick}
        disabled={disabled}
        type={type}
        data-testid="glass-button"
        data-interactive={whileHover ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        {...props}
      >
        {children}
      </button>
    )),
    div: React.forwardRef<HTMLDivElement, any>(({ children, className, style, variants, initial, animate, whileHover, whileTap, transition, ...props }, ref) => (
      <div 
        ref={ref} 
        className={className} 
        style={style} 
        data-testid="motion-div"
        {...props}
      >
        {children}
      </div>
    )),
    span: React.forwardRef<HTMLSpanElement, any>(({ children, className, style, initial, animate, transition, ...props }, ref) => (
      <span 
        ref={ref} 
        className={className} 
        style={style} 
        {...props}
      >
        {children}
      </span>
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

describe('GlassButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children correctly', () => {
    render(
      <TestWrapper>
        <GlassButton>
          Click me
        </GlassButton>
      </TestWrapper>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    
    render(
      <TestWrapper>
        <GlassButton onClick={handleClick}>
          Click me
        </GlassButton>
      </TestWrapper>
    );

    const button = screen.getByTestId('glass-button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(
      <TestWrapper>
        <GlassButton size="sm">
          Small button
        </GlassButton>
      </TestWrapper>
    );

    let button = screen.getByTestId('glass-button');
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm');

    rerender(
      <TestWrapper>
        <GlassButton size="lg">
          Large button
        </GlassButton>
      </TestWrapper>
    );

    button = screen.getByTestId('glass-button');
    expect(button).toHaveClass('px-8', 'py-4', 'text-lg');
  });

  it('should apply correct blur classes', () => {
    const { rerender } = render(
      <TestWrapper>
        <GlassButton blur="sm">
          Small blur
        </GlassButton>
      </TestWrapper>
    );

    let button = screen.getByTestId('glass-button');
    expect(button).toHaveClass('backdrop-blur-sm');

    rerender(
      <TestWrapper>
        <GlassButton blur="xl">
          Extra large blur
        </GlassButton>
      </TestWrapper>
    );

    button = screen.getByTestId('glass-button');
    expect(button).toHaveClass('backdrop-blur-xl');
  });

  it('should handle disabled state correctly', () => {
    const handleClick = vi.fn();
    
    render(
      <TestWrapper>
        <GlassButton disabled onClick={handleClick}>
          Disabled button
        </GlassButton>
      </TestWrapper>
    );

    const button = screen.getByTestId('glass-button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed', 'opacity-50');
    expect(button).toHaveAttribute('data-disabled', 'true');
    expect(button).toHaveAttribute('data-interactive', 'false');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should handle loading state correctly', () => {
    const handleClick = vi.fn();
    
    render(
      <TestWrapper>
        <GlassButton loading onClick={handleClick}>
          Loading button
        </GlassButton>
      </TestWrapper>
    );

    const button = screen.getByTestId('glass-button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-interactive', 'false');
    expect(screen.getByText('Loading button')).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply different variants correctly', () => {
    const { rerender } = render(
      <TestWrapper>
        <GlassButton variant="primary">
          Primary button
        </GlassButton>
      </TestWrapper>
    );

    expect(screen.getByText('Primary button')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <GlassButton variant="secondary">
          Secondary button
        </GlassButton>
      </TestWrapper>
    );

    expect(screen.getByText('Secondary button')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <GlassButton variant="accent">
          Accent button
        </GlassButton>
      </TestWrapper>
    );

    expect(screen.getByText('Accent button')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <TestWrapper>
        <GlassButton className="custom-button-class">
          Custom styled button
        </GlassButton>
      </TestWrapper>
    );

    const button = screen.getByTestId('glass-button');
    expect(button).toHaveClass('custom-button-class');
  });

  it('should handle different button types', () => {
    const { rerender } = render(
      <TestWrapper>
        <GlassButton type="submit">
          Submit button
        </GlassButton>
      </TestWrapper>
    );

    let button = screen.getByTestId('glass-button');
    expect(button).toHaveAttribute('type', 'submit');

    rerender(
      <TestWrapper>
        <GlassButton type="reset">
          Reset button
        </GlassButton>
      </TestWrapper>
    );

    button = screen.getByTestId('glass-button');
    expect(button).toHaveAttribute('type', 'reset');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <GlassButton>
          Accessible button
        </GlassButton>
      </TestWrapper>
    );

    const button = screen.getByTestId('glass-button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-white/50');
  });

  it('should work with all prop combinations', () => {
    const handleClick = vi.fn();
    
    render(
      <TestWrapper>
        <GlassButton 
          onClick={handleClick}
          variant="accent"
          size="lg"
          blur="lg"
          className="test-button"
          type="submit"
        >
          Complex button
        </GlassButton>
      </TestWrapper>
    );

    const button = screen.getByTestId('glass-button');
    expect(button).toHaveClass(
      'backdrop-blur-lg',
      'px-8',
      'py-4',
      'text-lg',
      'rounded-xl',
      'font-medium',
      'border',
      'border-white/30',
      'cursor-pointer',
      'test-button'
    );
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('data-interactive', 'true');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should integrate with theme and animation providers', () => {
    expect(() => {
      render(
        <TestWrapper>
          <GlassButton>
            Theme integration test
          </GlassButton>
        </TestWrapper>
      );
    }).not.toThrow();

    expect(screen.getByText('Theme integration test')).toBeInTheDocument();
  });
});