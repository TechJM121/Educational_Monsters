import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TouchOptimized from '../TouchOptimized';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    )
  }
}));

// Mock useTouchGestures hook
vi.mock('../../../hooks/useTouchGestures', () => ({
  useTouchGestures: vi.fn(() => ({
    attachListeners: vi.fn(() => vi.fn())
  }))
}));

describe('TouchOptimized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <TouchOptimized>
        <div data-testid="child">Test Content</div>
      </TouchOptimized>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TouchOptimized className="custom-touch-class">
        <div>Content</div>
      </TouchOptimized>
    );

    const touchElement = container.firstChild as HTMLElement;
    expect(touchElement).toHaveClass('touch-optimized');
    expect(touchElement).toHaveClass('custom-touch-class');
  });

  it('applies touch-optimized styles', () => {
    const { container } = render(
      <TouchOptimized>
        <div>Content</div>
      </TouchOptimized>
    );

    const touchElement = container.firstChild as HTMLElement;
    expect(touchElement.style.userSelect).toBe('none');
    expect(touchElement.style.WebkitUserSelect).toBe('none');
    expect(touchElement.style.WebkitTouchCallout).toBe('none');
  });

  it('sets touchAction to none when preventScroll is true', () => {
    const { container } = render(
      <TouchOptimized preventScroll>
        <div>Content</div>
      </TouchOptimized>
    );

    const touchElement = container.firstChild as HTMLElement;
    expect(touchElement.style.touchAction).toBe('none');
  });

  it('sets touchAction to auto when preventScroll is false', () => {
    const { container } = render(
      <TouchOptimized preventScroll={false}>
        <div>Content</div>
      </TouchOptimized>
    );

    const touchElement = container.firstChild as HTMLElement;
    expect(touchElement.style.touchAction).toBe('auto');
  });

  it('passes gesture configuration to useTouchGestures', async () => {
    const { useTouchGestures } = await import('../../../hooks/useTouchGestures');
    const mockUseTouchGestures = vi.mocked(useTouchGestures);

    const gestureConfig = {
      onSwipeLeft: vi.fn(),
      onSwipeRight: vi.fn(),
      onTap: vi.fn(),
      swipeThreshold: 100
    };

    render(
      <TouchOptimized {...gestureConfig}>
        <div>Content</div>
      </TouchOptimized>
    );

    expect(mockUseTouchGestures).toHaveBeenCalledWith(
      expect.objectContaining(gestureConfig)
    );
  });

  it('does not attach listeners when disabled', async () => {
    const mockAttachListeners = vi.fn(() => vi.fn());
    const { useTouchGestures } = await import('../../../hooks/useTouchGestures');
    const mockUseTouchGestures = vi.mocked(useTouchGestures);
    mockUseTouchGestures.mockReturnValue({ attachListeners: mockAttachListeners });

    render(
      <TouchOptimized disabled>
        <div>Content</div>
      </TouchOptimized>
    );

    expect(mockAttachListeners).not.toHaveBeenCalled();
  });

  it('attaches listeners when not disabled', async () => {
    const mockAttachListeners = vi.fn(() => vi.fn());
    const { useTouchGestures } = await import('../../../hooks/useTouchGestures');
    const mockUseTouchGestures = vi.mocked(useTouchGestures);
    mockUseTouchGestures.mockReturnValue({ attachListeners: mockAttachListeners });

    render(
      <TouchOptimized>
        <div>Content</div>
      </TouchOptimized>
    );

    // Should be called after component mounts
    expect(mockAttachListeners).toHaveBeenCalled();
  });

  it('handles multiple children correctly', () => {
    render(
      <TouchOptimized>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
        <span data-testid="child3">Child 3</span>
      </TouchOptimized>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByTestId('child3')).toBeInTheDocument();
  });

  it('applies default feedback scale and duration', () => {
    const { container } = render(
      <TouchOptimized>
        <div>Content</div>
      </TouchOptimized>
    );

    // Component should render without errors with default props
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom feedback scale and duration', () => {
    const { container } = render(
      <TouchOptimized feedbackScale={0.8} feedbackDuration={0.2}>
        <div>Content</div>
      </TouchOptimized>
    );

    // Component should render without errors with custom props
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    const { container } = render(
      <TouchOptimized>
        {null}
      </TouchOptimized>
    );

    const touchElement = container.firstChild as HTMLElement;
    expect(touchElement).toHaveClass('touch-optimized');
    expect(touchElement.children).toHaveLength(0);
  });

  it('handles string children', () => {
    render(
      <TouchOptimized>
        Simple text content
      </TouchOptimized>
    );

    expect(screen.getByText('Simple text content')).toBeInTheDocument();
  });

  it('handles complex nested children', () => {
    render(
      <TouchOptimized>
        <div>
          <h1 data-testid="title">Title</h1>
          <p data-testid="paragraph">Paragraph</p>
          <button data-testid="button">Button</button>
        </div>
      </TouchOptimized>
    );

    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });
});