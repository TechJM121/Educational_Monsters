import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AnimatedProgressBar } from '../AnimatedProgressBar';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

// Mock the useReducedMotion hook
vi.mock('../../../hooks/useReducedMotion');
const mockUseReducedMotion = vi.mocked(useReducedMotion);

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  useSpring: (initialValue: number) => ({
    set: vi.fn(),
    on: vi.fn(() => vi.fn()),
  }),
  useTransform: vi.fn((spring, transform) => ({
    on: vi.fn(() => vi.fn()),
  })),
}));

describe('AnimatedProgressBar', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with basic props', () => {
    render(<AnimatedProgressBar value={50} max={100} />);
    
    // Should render the progress bar structure
    expect(document.querySelector('.bg-gray-200')).toBeInTheDocument();
    expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
  });

  it('displays label and value when provided', () => {
    render(
      <AnimatedProgressBar
        value={75}
        max={100}
        label="Test Progress"
        showValue={true}
      />
    );
    
    expect(screen.getByText('Test Progress')).toBeInTheDocument();
    expect(screen.getByText('75 / 100')).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { rerender } = render(
      <AnimatedProgressBar value={50} max={100} color="success" />
    );
    
    expect(document.querySelector('.from-green-500')).toBeInTheDocument();
    
    rerender(<AnimatedProgressBar value={50} max={100} color="error" />);
    expect(document.querySelector('.from-red-500')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <AnimatedProgressBar value={50} max={100} size="sm" />
    );
    
    expect(document.querySelector('.h-2')).toBeInTheDocument();
    
    rerender(<AnimatedProgressBar value={50} max={100} size="lg" />);
    expect(document.querySelector('.h-4')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(
      <AnimatedProgressBar
        value={50}
        max={100}
        tooltip="This is a tooltip"
      />
    );
    
    const progressContainer = document.querySelector('.relative');
    expect(progressContainer).toBeInTheDocument();
    
    fireEvent.mouseEnter(progressContainer!);
    
    await waitFor(() => {
      expect(screen.getByText('This is a tooltip')).toBeInTheDocument();
    });
    
    fireEvent.mouseLeave(progressContainer!);
  });

  it('handles maximum value correctly', () => {
    render(<AnimatedProgressBar value={150} max={100} showValue={true} />);
    
    // Should cap at maximum value
    expect(screen.getByText('150 / 100')).toBeInTheDocument();
  });

  it('respects reduced motion preferences', () => {
    mockUseReducedMotion.mockReturnValue(true);
    
    render(<AnimatedProgressBar value={50} max={100} animated={true} />);
    
    // Should not render animated shimmer when reduced motion is preferred
    expect(document.querySelector('.from-transparent')).not.toBeInTheDocument();
  });

  it('hides value when showValue is false', () => {
    render(
      <AnimatedProgressBar
        value={75}
        max={100}
        label="Test Progress"
        showValue={false}
      />
    );
    
    expect(screen.getByText('Test Progress')).toBeInTheDocument();
    expect(screen.queryByText('75 / 100')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AnimatedProgressBar
        value={50}
        max={100}
        className="custom-class"
      />
    );
    
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('handles zero value', () => {
    render(<AnimatedProgressBar value={0} max={100} showValue={true} />);
    
    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('handles animation disabled', () => {
    render(<AnimatedProgressBar value={50} max={100} animated={false} />);
    
    // Should not render animated shimmer when animation is disabled
    expect(document.querySelector('.from-transparent')).not.toBeInTheDocument();
  });
});