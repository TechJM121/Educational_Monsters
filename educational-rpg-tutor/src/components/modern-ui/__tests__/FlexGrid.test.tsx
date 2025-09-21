import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import FlexGrid from '../FlexGrid';

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

describe('FlexGrid', () => {
  const TestItems = () => (
    <>
      <div data-testid="item-1">Item 1</div>
      <div data-testid="item-2">Item 2</div>
      <div data-testid="item-3">Item 3</div>
    </>
  );

  beforeEach(() => {
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
      <FlexGrid>
        <TestItems />
      </FlexGrid>
    );

    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();
  });

  it('applies default flex classes', () => {
    const { container } = render(
      <FlexGrid>
        <TestItems />
      </FlexGrid>
    );

    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement).toHaveClass('flex');
    expect(flexElement).toHaveClass('flex-row');
    expect(flexElement).toHaveClass('flex-wrap');
    expect(flexElement).toHaveClass('justify-start');
    expect(flexElement).toHaveClass('items-stretch');
    expect(flexElement).toHaveClass('gap-6');
  });

  it('applies custom direction', () => {
    const { container } = render(
      <FlexGrid direction="column">
        <TestItems />
      </FlexGrid>
    );

    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement).toHaveClass('flex-col');
  });

  it('applies custom wrap behavior', () => {
    const wraps = ['wrap', 'nowrap', 'wrap-reverse'] as const;
    const expectedClasses = ['flex-wrap', 'flex-nowrap', 'flex-wrap-reverse'];

    wraps.forEach((wrap, index) => {
      const { container } = render(
        <FlexGrid wrap={wrap}>
          <TestItems />
        </FlexGrid>
      );

      const flexElement = container.firstChild as HTMLElement;
      expect(flexElement).toHaveClass(expectedClasses[index]);
    });
  });

  it('applies custom justify content', () => {
    const justifies = ['start', 'end', 'center', 'between', 'around', 'evenly'] as const;
    const expectedClasses = [
      'justify-start',
      'justify-end', 
      'justify-center',
      'justify-between',
      'justify-around',
      'justify-evenly'
    ];

    justifies.forEach((justify, index) => {
      const { container } = render(
        <FlexGrid justify={justify}>
          <TestItems />
        </FlexGrid>
      );

      const flexElement = container.firstChild as HTMLElement;
      expect(flexElement).toHaveClass(expectedClasses[index]);
    });
  });

  it('applies custom align items', () => {
    const aligns = ['start', 'end', 'center', 'baseline', 'stretch'] as const;
    const expectedClasses = [
      'items-start',
      'items-end',
      'items-center', 
      'items-baseline',
      'items-stretch'
    ];

    aligns.forEach((align, index) => {
      const { container } = render(
        <FlexGrid align={align}>
          <TestItems />
        </FlexGrid>
      );

      const flexElement = container.firstChild as HTMLElement;
      expect(flexElement).toHaveClass(expectedClasses[index]);
    });
  });

  it('applies different gap sizes', () => {
    const gaps = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const expectedClasses = ['gap-2', 'gap-4', 'gap-6', 'gap-8', 'gap-12'];

    gaps.forEach((gap, index) => {
      const { container } = render(
        <FlexGrid gap={gap}>
          <TestItems />
        </FlexGrid>
      );

      const flexElement = container.firstChild as HTMLElement;
      expect(flexElement).toHaveClass(expectedClasses[index]);
    });
  });

  it('applies responsive configurations', () => {
    const { container } = render(
      <FlexGrid
        responsive={{
          sm: { direction: 'column', justify: 'center' },
          md: { wrap: 'nowrap', gap: 'lg' },
          lg: { align: 'center' }
        }}
      >
        <TestItems />
      </FlexGrid>
    );

    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement).toHaveClass('sm:flex-col');
    expect(flexElement).toHaveClass('sm:justify-center');
    expect(flexElement).toHaveClass('md:flex-nowrap');
    expect(flexElement).toHaveClass('md:gap-8');
    expect(flexElement).toHaveClass('lg:items-center');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FlexGrid className="custom-flex-class">
        <TestItems />
      </FlexGrid>
    );

    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement).toHaveClass('custom-flex-class');
  });

  it('renders without animation when animated is false', () => {
    const { container } = render(
      <FlexGrid animated={false}>
        <TestItems />
      </FlexGrid>
    );

    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement.tagName).toBe('DIV');
    expect(flexElement.children).toHaveLength(3);
  });

  it('handles empty responsive config gracefully', () => {
    const { container } = render(
      <FlexGrid responsive={{}}>
        <TestItems />
      </FlexGrid>
    );

    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement).toHaveClass('flex');
    // Should not add any responsive classes
    expect(flexElement.className).not.toContain('sm:');
  });

  it('handles partial responsive config', () => {
    const { container } = render(
      <FlexGrid
        responsive={{
          md: { direction: 'column' }
          // No sm, lg, xl configs
        }}
      >
        <TestItems />
      </FlexGrid>
    );

    const flexElement = container.firstChild as HTMLElement;
    expect(flexElement).toHaveClass('md:flex-col');
    expect(flexElement.className).not.toContain('sm:');
    expect(flexElement.className).not.toContain('lg:');
    expect(flexElement.className).not.toContain('xl:');
  });
});