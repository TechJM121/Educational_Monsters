import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MorphingNumber } from '../MorphingNumber';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

// Mock the useReducedMotion hook
vi.mock('../../../hooks/useReducedMotion');
const mockUseReducedMotion = vi.mocked(useReducedMotion);

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  useSpring: (initialValue: number) => ({
    set: vi.fn(),
    on: vi.fn(() => vi.fn()),
  }),
  useTransform: vi.fn((spring, transform) => {
    if (typeof transform === 'function') {
      return {
        on: vi.fn((event, callback) => {
          if (event === 'change') {
            // Simulate the transform function
            callback(transform(initialValue));
          }
          return vi.fn();
        }),
      };
    }
    return { on: vi.fn(() => vi.fn()) };
  }),
}));

describe('MorphingNumber', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with basic value', () => {
    render(<MorphingNumber value={42} />);
    
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays formatted value when format function provided', () => {
    const formatFn = (val: number) => `$${val.toFixed(2)}`;
    
    render(<MorphingNumber value={123.456} format={formatFn} />);
    
    expect(screen.getByText('$123.46')).toBeInTheDocument();
  });

  it('displays prefix and suffix', () => {
    render(
      <MorphingNumber
        value={50}
        prefix="Level "
        suffix="%"
      />
    );
    
    expect(screen.getByText(/Level/)).toBeInTheDocument();
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it('handles decimal places', () => {
    render(<MorphingNumber value={3.14159} decimals={2} />);
    
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('respects reduced motion preferences', () => {
    mockUseReducedMotion.mockReturnValue(true);
    
    const { rerender } = render(<MorphingNumber value={10} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // When value changes with reduced motion, should show new value immediately
    rerender(<MorphingNumber value={20} />);
    
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<MorphingNumber value={42} className="custom-number-class" />);
    
    expect(document.querySelector('.custom-number-class')).toBeInTheDocument();
  });

  it('handles zero value', () => {
    render(<MorphingNumber value={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles negative values', () => {
    render(<MorphingNumber value={-25} />);
    
    expect(screen.getByText('-25')).toBeInTheDocument();
  });

  it('handles large numbers', () => {
    render(<MorphingNumber value={1000000} />);
    
    expect(screen.getByText('1000000')).toBeInTheDocument();
  });

  it('formats large numbers with custom formatter', () => {
    const formatFn = (val: number) => val.toLocaleString();
    
    render(<MorphingNumber value={1234567} format={formatFn} />);
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('handles decimal formatting correctly', () => {
    render(<MorphingNumber value={123.456789} decimals={3} />);
    
    expect(screen.getByText('123.457')).toBeInTheDocument();
  });

  it('handles animateOnChange prop', () => {
    const { rerender } = render(
      <MorphingNumber value={10} animateOnChange={true} />
    );
    
    expect(screen.getByText('10')).toBeInTheDocument();
    
    rerender(<MorphingNumber value={20} animateOnChange={true} />);
    
    // Should trigger animation when value changes
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('handles animateOnChange disabled', () => {
    const { rerender } = render(
      <MorphingNumber value={10} animateOnChange={false} />
    );
    
    expect(screen.getByText('10')).toBeInTheDocument();
    
    rerender(<MorphingNumber value={20} animateOnChange={false} />);
    
    // Should still update value but without animation
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('combines prefix, value, and suffix correctly', () => {
    render(
      <MorphingNumber
        value={75}
        prefix="Score: "
        suffix=" points"
        decimals={1}
      />
    );
    
    const container = screen.getByText(/Score:/).parentElement;
    expect(container).toHaveTextContent('Score: 75.0 points');
  });
});