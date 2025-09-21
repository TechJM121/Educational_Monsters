import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AnimatedProgressRing } from '../AnimatedProgressRing';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

// Mock the useReducedMotion hook
vi.mock('../../../hooks/useReducedMotion');
const mockUseReducedMotion = vi.mocked(useReducedMotion);

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useSpring: (initialValue: number) => ({
    set: vi.fn(),
    on: vi.fn(() => vi.fn()),
  }),
  useTransform: vi.fn((spring, transform) => ({
    on: vi.fn(() => vi.fn()),
  })),
}));

describe('AnimatedProgressRing', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with basic props', () => {
    render(<AnimatedProgressRing value={50} max={100} />);
    
    // Should render SVG with circles
    expect(document.querySelector('svg')).toBeInTheDocument();
    expect(document.querySelectorAll('circle')).toHaveLength(2); // Background + progress
  });

  it('displays value and label when provided', () => {
    render(
      <AnimatedProgressRing
        value={75}
        max={100}
        label="Test Ring"
        showValue={true}
      />
    );
    
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('Test Ring')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies correct size', () => {
    render(<AnimatedProgressRing value={50} max={100} size={150} />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '150');
    expect(svg).toHaveAttribute('height', '150');
  });

  it('applies correct stroke width', () => {
    render(<AnimatedProgressRing value={50} max={100} strokeWidth={10} />);
    
    const circles = document.querySelectorAll('circle');
    circles.forEach(circle => {
      expect(circle).toHaveAttribute('stroke-width', '10');
    });
  });

  it('uses correct color', () => {
    render(<AnimatedProgressRing value={50} max={100} color="success" />);
    
    const progressCircle = document.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveAttribute('stroke', '#10B981');
  });

  it('shows tooltip on hover', async () => {
    render(
      <AnimatedProgressRing
        value={50}
        max={100}
        tooltip="Ring tooltip"
      />
    );
    
    const container = document.querySelector('.relative');
    expect(container).toBeInTheDocument();
    
    fireEvent.mouseEnter(container!);
    
    await waitFor(() => {
      expect(screen.getByText('Ring tooltip')).toBeInTheDocument();
    });
  });

  it('calculates percentage correctly', () => {
    render(<AnimatedProgressRing value={25} max={100} showValue={true} />);
    
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('handles maximum value correctly', () => {
    render(<AnimatedProgressRing value={150} max={100} showValue={true} />);
    
    // Should display the actual value but cap percentage at 100%
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('hides value when showValue is false', () => {
    render(
      <AnimatedProgressRing
        value={75}
        max={100}
        label="Test Ring"
        showValue={false}
      />
    );
    
    expect(screen.getByText('Test Ring')).toBeInTheDocument();
    expect(screen.queryByText('75')).not.toBeInTheDocument();
  });

  it('respects reduced motion preferences', () => {
    mockUseReducedMotion.mockReturnValue(true);
    
    render(<AnimatedProgressRing value={50} max={100} animated={true} />);
    
    // Should not create gradient definitions when reduced motion is preferred
    expect(document.querySelector('defs')).not.toBeInTheDocument();
  });

  it('calculates circumference correctly', () => {
    const size = 120;
    const strokeWidth = 8;
    const expectedRadius = (size / 2) - (strokeWidth / 2);
    const expectedCircumference = 2 * Math.PI * expectedRadius;
    
    render(
      <AnimatedProgressRing 
        value={50} 
        max={100} 
        size={size} 
        strokeWidth={strokeWidth} 
      />
    );
    
    const progressCircle = document.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveAttribute('stroke-dasharray', expectedCircumference.toString());
  });

  it('handles zero value', () => {
    render(<AnimatedProgressRing value={0} max={100} showValue={true} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AnimatedProgressRing
        value={50}
        max={100}
        className="custom-ring-class"
      />
    );
    
    expect(document.querySelector('.custom-ring-class')).toBeInTheDocument();
  });
});