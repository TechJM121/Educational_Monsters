import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  SkeletonLoader, 
  CharacterCardSkeleton, 
  StatsCardSkeleton,
  HomePageSkeleton 
} from '../SkeletonLoader';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    render(<SkeletonLoader />);
    
    const skeleton = document.querySelector('.bg-slate-700');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-slate-700', 'rounded');
  });

  it('applies custom width and height', () => {
    render(<SkeletonLoader width="200px" height="50px" />);
    
    const skeleton = document.querySelector('.bg-slate-700');
    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
  });

  it('applies rounded class when rounded prop is true', () => {
    render(<SkeletonLoader rounded />);
    
    const skeleton = document.querySelector('.bg-slate-700');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('applies custom className', () => {
    render(<SkeletonLoader className="custom-class" />);
    
    const skeleton = document.querySelector('.custom-class');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('custom-class');
  });

  it('does not animate when animated is false', () => {
    render(<SkeletonLoader animated={false} />);
    
    // Should render a regular div instead of motion.div when not animated
    const skeleton = document.querySelector('.bg-slate-700');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('CharacterCardSkeleton', () => {
  it('renders character card skeleton structure', () => {
    render(<CharacterCardSkeleton />);
    
    // Should have rpg-card class
    const container = document.querySelector('.rpg-card');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('rpg-card');
  });

  it('applies custom className', () => {
    render(<CharacterCardSkeleton className="custom-character" />);
    
    const container = document.querySelector('.custom-character');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('custom-character');
  });
});

describe('StatsCardSkeleton', () => {
  it('renders stats card skeleton with 6 stat rows', () => {
    render(<StatsCardSkeleton />);
    
    const container = document.querySelector('.rpg-card');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('rpg-card');
    
    // Should have multiple skeleton elements for stats
    const skeletons = container!.querySelectorAll('.bg-slate-700');
    expect(skeletons.length).toBeGreaterThan(6); // Header + 6 stats
  });
});

describe('HomePageSkeleton', () => {
  it('renders complete home page skeleton structure', () => {
    render(<HomePageSkeleton />);
    
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('min-h-screen', 'bg-rpg-pattern');
    
    // Should have multiple rpg-card elements
    const cards = container!.querySelectorAll('.rpg-card');
    expect(cards.length).toBeGreaterThan(3);
  });

  it('applies custom className', () => {
    render(<HomePageSkeleton className="custom-home" />);
    
    const container = document.querySelector('.custom-home');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('custom-home');
  });
});