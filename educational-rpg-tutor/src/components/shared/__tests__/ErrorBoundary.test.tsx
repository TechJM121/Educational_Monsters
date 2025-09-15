import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ErrorBoundary, CharacterErrorBoundary, LearningErrorBoundary } from '../ErrorBoundary';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Don't worry, brave adventurer!/)).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('allows retry functionality', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // After retry, render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('has restart adventure button', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const restartButton = screen.getByText('Restart Adventure');
    fireEvent.click(restartButton);

    expect(mockReload).toHaveBeenCalled();
  });
});

describe('CharacterErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders character-specific error message', () => {
    render(
      <CharacterErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CharacterErrorBoundary>
    );

    expect(screen.getByText('Character Loading Failed')).toBeInTheDocument();
    expect(screen.getByText(/Unable to load your character data/)).toBeInTheDocument();
  });

  it('calls onError callback', () => {
    const onError = vi.fn();
    
    render(
      <CharacterErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </CharacterErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('LearningErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders learning-specific error message', () => {
    render(
      <LearningErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LearningErrorBoundary>
    );

    expect(screen.getByText('Learning Activity Error')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong with this learning activity/)).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    
    render(
      <LearningErrorBoundary onRetry={onRetry}>
        <ThrowError shouldThrow={true} />
      </LearningErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it('has go back button', () => {
    // Mock window.history.back
    const mockBack = vi.fn();
    Object.defineProperty(window, 'history', {
      value: { back: mockBack },
      writable: true
    });

    render(
      <LearningErrorBoundary>
        <ThrowError shouldThrow={true} />
      </LearningErrorBoundary>
    );

    const backButton = screen.getByText('Go Back');
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });
});