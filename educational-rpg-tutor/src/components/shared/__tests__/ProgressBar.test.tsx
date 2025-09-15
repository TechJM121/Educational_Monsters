import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with basic props', () => {
    render(<ProgressBar current={50} max={100} />);
    
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<ProgressBar current={25} max={100} label="Health" />);
    
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('25 / 100')).toBeInTheDocument();
  });

  it('handles different color variants', () => {
    const { container } = render(
      <ProgressBar current={75} max={100} color="success" />
    );
    
    const progressElement = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-400');
    expect(progressElement).toBeInTheDocument();
  });

  it('handles different sizes', () => {
    const { container } = render(
      <ProgressBar current={30} max={100} size="lg" />
    );
    
    const progressContainer = container.querySelector('.h-4');
    expect(progressContainer).toBeInTheDocument();
  });

  it('caps percentage at 100%', () => {
    render(<ProgressBar current={150} max={100} />);
    
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('hides text when showText is false', () => {
    render(<ProgressBar current={50} max={100} showText={false} />);
    
    expect(screen.queryByText('50 / 100')).not.toBeInTheDocument();
    expect(screen.queryByText('50.0%')).not.toBeInTheDocument();
  });

  it('formats large numbers with commas', () => {
    render(<ProgressBar current={1250} max={5000} />);
    
    expect(screen.getByText('1,250 / 5,000')).toBeInTheDocument();
  });
});