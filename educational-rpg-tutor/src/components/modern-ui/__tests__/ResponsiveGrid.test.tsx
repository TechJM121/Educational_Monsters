import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import ResponsiveGrid from '../ResponsiveGrid';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }
}));

describe('ResponsiveGrid', () => {
  const TestItems = () => (
    <>
      <div data-testid="item-1">Item 1</div>
      <div data-testid="item-2">Item 2</div>
      <div data-testid="item-3">Item 3</div>
    </>
  );

  beforeEach(() => {
    // Reset viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <ResponsiveGrid>
        <TestItems />
      </ResponsiveGrid>
    );

    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();
  });

  it('applies default grid classes', () => {
    const { container } = render(
      <ResponsiveGrid>
        <TestItems />
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid');
    expect(gridElement).toHaveClass('gap-6'); // default md gap
  });

  it('applies custom column configuration', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}>
        <TestItems />
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-2');
    expect(gridElement).toHaveClass('sm:grid-cols-3');
    expect(gridElement).toHaveClass('md:grid-cols-4');
    expect(gridElement).toHaveClass('lg:grid-cols-5');
    expect(gridElement).toHaveClass('xl:grid-cols-6');
  });

  it('applies different gap sizes', () => {
    const gaps = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const expectedClasses = ['gap-2', 'gap-4', 'gap-6', 'gap-8', 'gap-12'];

    gaps.forEach((gap, index) => {
      const { container } = render(
        <ResponsiveGrid gap={gap}>
          <TestItems />
        </ResponsiveGrid>
      );

      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass(expectedClasses[index]);
    });
  });

  it('applies auto-fit layout', () => {
    const { container } = render(
      <ResponsiveGrid autoFit minItemWidth="200px">
        <TestItems />
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-[repeat(auto-fit,minmax(200px,1fr))]');
  });

  it('applies auto-fill layout', () => {
    const { container } = render(
      <ResponsiveGrid autoFill minItemWidth="300px">
        <TestItems />
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-[repeat(auto-fill,minmax(300px,1fr))]');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveGrid className="custom-class">
        <TestItems />
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('custom-class');
  });

  it('renders without animation when animated is false', () => {
    const { container } = render(
      <ResponsiveGrid animated={false}>
        <TestItems />
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement.tagName).toBe('DIV');
    // Should not have motion wrapper
    expect(gridElement.children).toHaveLength(3);
  });

  it('handles empty children gracefully', () => {
    const { container } = render(
      <ResponsiveGrid>
        {null}
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid');
    expect(gridElement.children).toHaveLength(0);
  });

  it('handles single child correctly', () => {
    render(
      <ResponsiveGrid>
        <div data-testid="single-item">Single Item</div>
      </ResponsiveGrid>
    );

    expect(screen.getByTestId('single-item')).toBeInTheDocument();
  });

  it('maintains responsive behavior with partial column config', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ sm: 2, lg: 4 }}>
        <TestItems />
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('sm:grid-cols-2');
    expect(gridElement).toHaveClass('lg:grid-cols-4');
    // Should not have classes for undefined breakpoints
    expect(gridElement.className).not.toContain('grid-cols-undefined');
  });
});