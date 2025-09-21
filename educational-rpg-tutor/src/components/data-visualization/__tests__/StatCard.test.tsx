import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { StatCard } from '../StatCard';

// Mock the child components
vi.mock('../MorphingNumber', () => ({
  MorphingNumber: ({ value, format, className, prefix, suffix }: any) => (
    <span className={className}>
      {prefix}{format ? format(value) : value}{suffix}
    </span>
  ),
}));

vi.mock('../AnimatedProgressBar', () => ({
  AnimatedProgressBar: ({ value, max, color, tooltip }: any) => (
    <div data-testid="progress-bar" data-value={value} data-max={max} data-color={color}>
      {tooltip && <span>{tooltip}</span>}
    </div>
  ),
}));

vi.mock('../AnimatedProgressRing', () => ({
  AnimatedProgressRing: ({ value, max, color, tooltip }: any) => (
    <div data-testid="progress-ring" data-value={value} data-max={max} data-color={color}>
      {tooltip && <span>{tooltip}</span>}
    </div>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onHoverStart, onHoverEnd, ...props }: any) => (
      <div 
        {...props}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {children}
      </div>
    ),
  },
}));

describe('StatCard', () => {
  const defaultProps = {
    title: 'Test Stat',
    value: 75,
  };

  it('renders with basic props', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Stat')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('displays icon when provided', () => {
    render(<StatCard {...defaultProps} icon="🎯" />);
    
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('shows trend information when provided', () => {
    render(
      <StatCard
        {...defaultProps}
        trend="up"
        trendValue={12.5}
      />
    );
    
    expect(screen.getByText('↗')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('shows different trend directions', () => {
    const { rerender } = render(
      <StatCard
        {...defaultProps}
        trend="down"
        trendValue={-8.3}
      />
    );
    
    expect(screen.getByText('↘')).toBeInTheDocument();
    expect(screen.getByText('-8.3%')).toBeInTheDocument();
    
    rerender(
      <StatCard
        {...defaultProps}
        trend="neutral"
        trendValue={0}
      />
    );
    
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('+0.0%')).toBeInTheDocument();
  });

  it('formats value with custom formatter', () => {
    const formatFn = (val: number) => `$${val.toLocaleString()}`;
    
    render(
      <StatCard
        {...defaultProps}
        value={1234}
        format={formatFn}
      />
    );
    
    expect(screen.getByText('$1,234')).toBeInTheDocument();
  });

  it('shows progress bar when enabled', () => {
    render(
      <StatCard
        {...defaultProps}
        maxValue={100}
        showProgress={true}
        progressType="bar"
        color="success"
        tooltip="Progress tooltip"
      />
    );
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('data-value', '75');
    expect(progressBar).toHaveAttribute('data-max', '100');
    expect(progressBar).toHaveAttribute('data-color', 'success');
    expect(screen.getByText('Progress tooltip')).toBeInTheDocument();
  });

  it('shows progress ring when enabled', () => {
    render(
      <StatCard
        {...defaultProps}
        maxValue={100}
        showProgress={true}
        progressType="ring"
        color="primary"
      />
    );
    
    const progressRing = screen.getByTestId('progress-ring');
    expect(progressRing).toBeInTheDocument();
    expect(progressRing).toHaveAttribute('data-value', '75');
    expect(progressRing).toHaveAttribute('data-max', '100');
    expect(progressRing).toHaveAttribute('data-color', 'primary');
  });

  it('does not show progress when maxValue is not provided', () => {
    render(
      <StatCard
        {...defaultProps}
        showProgress={true}
      />
    );
    
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('progress-ring')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover when no progress component', async () => {
    render(
      <StatCard
        {...defaultProps}
        tooltip="Card tooltip"
      />
    );
    
    const card = document.querySelector('.relative');
    expect(card).toBeInTheDocument();
    
    fireEvent.mouseEnter(card!);
    
    await waitFor(() => {
      expect(screen.getByText('Card tooltip')).toBeInTheDocument();
    });
  });

  it('does not show card tooltip when progress component is present', () => {
    render(
      <StatCard
        {...defaultProps}
        maxValue={100}
        showProgress={true}
        tooltip="Should not show"
      />
    );
    
    const card = document.querySelector('.relative');
    fireEvent.mouseEnter(card!);
    
    // Tooltip should not appear because progress component handles it
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <StatCard
        {...defaultProps}
        className="custom-stat-class"
      />
    );
    
    expect(document.querySelector('.custom-stat-class')).toBeInTheDocument();
  });

  it('handles missing trend value gracefully', () => {
    render(
      <StatCard
        {...defaultProps}
        trend="up"
        // trendValue not provided
      />
    );
    
    // Should not show trend section
    expect(screen.queryByText('↗')).not.toBeInTheDocument();
  });

  it('handles all color variants', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error'] as const;
    
    colors.forEach(color => {
      const { unmount } = render(
        <StatCard
          {...defaultProps}
          maxValue={100}
          showProgress={true}
          color={color}
        />
      );
      
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-color', color);
      
      unmount();
    });
  });

  it('handles zero values', () => {
    render(<StatCard title="Zero Stat" value={0} />);
    
    expect(screen.getByText('Zero Stat')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles negative trend values', () => {
    render(
      <StatCard
        {...defaultProps}
        trend="down"
        trendValue={-15.7}
      />
    );
    
    expect(screen.getByText('-15.7%')).toBeInTheDocument();
  });
});