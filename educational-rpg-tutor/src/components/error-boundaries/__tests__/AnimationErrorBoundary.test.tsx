import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AnimationErrorBoundary } from '../AnimationErrorBoundary';

// Mock the performance optimizer
vi.mock('../../../utils/performanceOptimizer', () => ({
  performanceOptimizer: {
    getCurrentSettings: vi.fn(() => ({
      particleCount: 150,
      blurEffects: 'full',
      shadowEffects: 'full'
    })),
    resetOptimizations: vi.fn()
  }
}));

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({ 
  shouldThrow = false, 
  errorMessage = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

// Component that works normally
const WorkingComponent: React.FC = () => {
  return <div>Working component</div>;
};

describe('AnimationErrorBoundary', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    // Suppress console output during tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should render children when there is no error', () => {
    render(
      <AnimationErrorBoundary>
        <WorkingComponent />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('should catch and display error when child component throws', () => {
    render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Animation failed" />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Animation Error Detected')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred while rendering animations/)).toBeInTheDocument();
  });

  it('should show custom fallback when provided', () => {
    const customFallback = <div>Custom error fallback</div>;
    
    render(
      <AnimationErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    expect(screen.queryByText('Animation Error Detected')).not.toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <AnimationErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </AnimationErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('should show retry button and allow manual retry', async () => {
    const { rerender } = render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Animation Error Detected')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    // Click retry and render working component
    fireEvent.click(retryButton);
    
    rerender(
      <AnimationErrorBoundary>
        <WorkingComponent />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('should show safe mode button and enable fallback mode', () => {
    render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    const safeModeButton = screen.getByText('Enable Safe Mode');
    fireEvent.click(safeModeButton);

    // Safe mode button should disappear after clicking
    expect(screen.queryByText('Enable Safe Mode')).not.toBeInTheDocument();
  });

  it('should show reset button and reset error boundary', () => {
    const { rerender } = render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Animation Error Detected')).toBeInTheDocument();
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    rerender(
      <AnimationErrorBoundary>
        <WorkingComponent />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('should attempt auto-recovery when enabled', async () => {
    const { rerender } = render(
      <AnimationErrorBoundary enableAutoRecovery={true} retryDelay={1000}>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Animation Error Detected')).toBeInTheDocument();

    // Fast-forward time to trigger auto-recovery
    vi.advanceTimersByTime(1000);

    // Should show recovery indicator
    await waitFor(() => {
      expect(screen.getByText('Recovering from animation error...')).toBeInTheDocument();
    });

    // Fast-forward recovery time
    vi.advanceTimersByTime(1000);

    // Rerender with working component to simulate successful recovery
    rerender(
      <AnimationErrorBoundary enableAutoRecovery={true} retryDelay={1000}>
        <WorkingComponent />
      </AnimationErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Working component')).toBeInTheDocument();
    });
  });

  it('should show retry count when retries are attempted', () => {
    render(
      <AnimationErrorBoundary maxRetries={3}>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    const retryButton = screen.getByText('Retry');
    
    // First retry
    fireEvent.click(retryButton);
    expect(screen.getByText('Retry attempts: 1/3')).toBeInTheDocument();
    
    // Second retry
    fireEvent.click(retryButton);
    expect(screen.getByText('Retry attempts: 2/3')).toBeInTheDocument();
  });

  it('should disable auto-recovery when enableAutoRecovery is false', () => {
    render(
      <AnimationErrorBoundary enableAutoRecovery={false}>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Animation Error Detected')).toBeInTheDocument();
    
    // Fast-forward time - should not trigger auto-recovery
    vi.advanceTimersByTime(5000);
    
    expect(screen.queryByText('Recovering from animation error...')).not.toBeInTheDocument();
    expect(screen.getByText('Animation Error Detected')).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Detailed error message" />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    
    // Click to expand details
    fireEvent.click(screen.getByText('Error Details (Development)'));
    expect(screen.getByText('Detailed error message')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should apply emergency optimizations for animation errors', () => {
    const { performanceOptimizer } = require('../../../utils/performanceOptimizer');
    
    render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="framer-motion animation failed" />
      </AnimationErrorBoundary>
    );

    // Should have applied emergency optimizations
    expect(consoleWarnSpy).toHaveBeenCalledWith('🚨 Emergency animation optimizations applied');
  });

  it('should handle component unmount gracefully', () => {
    const { unmount } = render(
      <AnimationErrorBoundary enableAutoRecovery={true}>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
  });

  it('should provide error info through public methods', () => {
    let errorBoundaryRef: AnimationErrorBoundary | null = null;
    
    render(
      <AnimationErrorBoundary 
        ref={(ref) => { errorBoundaryRef = ref; }}
      >
        <ThrowError shouldThrow={true} errorMessage="Test error" />
      </AnimationErrorBoundary>
    );

    expect(errorBoundaryRef).not.toBeNull();
    
    if (errorBoundaryRef) {
      const errorInfo = errorBoundaryRef.getErrorInfo();
      expect(errorInfo.hasError).toBe(true);
      expect(errorInfo.error?.message).toBe('Test error');
    }
  });

  it('should force recovery through public method', () => {
    let errorBoundaryRef: AnimationErrorBoundary | null = null;
    
    const { rerender } = render(
      <AnimationErrorBoundary 
        ref={(ref) => { errorBoundaryRef = ref; }}
      >
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Animation Error Detected')).toBeInTheDocument();

    if (errorBoundaryRef) {
      errorBoundaryRef.forceRecovery();
    }

    rerender(
      <AnimationErrorBoundary 
        ref={(ref) => { errorBoundaryRef = ref; }}
      >
        <WorkingComponent />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('should enable fallback mode through public method', () => {
    let errorBoundaryRef: AnimationErrorBoundary | null = null;
    
    const { rerender } = render(
      <AnimationErrorBoundary 
        ref={(ref) => { errorBoundaryRef = ref; }}
      >
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    if (errorBoundaryRef) {
      errorBoundaryRef.enableFallbackMode();
    }

    rerender(
      <AnimationErrorBoundary 
        ref={(ref) => { errorBoundaryRef = ref; }}
      >
        <WorkingComponent />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });
});