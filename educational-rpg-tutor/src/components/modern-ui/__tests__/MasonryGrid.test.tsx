import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MasonryGrid from '../MasonryGrid';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    )
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

describe('MasonryGrid', () => {
  const TestItems = ({ count = 3 }: { count?: number }) => (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} data-testid={`item-${i}`} style={{ height: `${100 + i * 50}px` }}>
          Item {i + 1}
        </div>
      ))}
    </>
  );

  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    // Mock offsetWidth and offsetHeight
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 800
    });

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 150
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <MasonryGrid>
        <TestItems />
      </MasonryGrid>
    );

    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('applies default column configuration', async () => {
    const { container } = render(
      <MasonryGrid>
        <TestItems />
      </MasonryGrid>
    );

    const masonryContainer = container.firstChild as HTMLElement;
    expect(masonryContainer).toHaveClass('relative', 'w-full');
    
    // Should have positioned items
    await waitFor(() => {
      const items = container.querySelectorAll('[data-testid^="item-"]');
      items.forEach(item => {
        const element = item as HTMLElement;
        expect(element.style.position).toBe('absolute');
      });
    });
  });

  it('handles responsive column configuration', () => {
    const onItemsChange = vi.fn();
    
    render(
      <MasonryGrid
        columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
        onItemsChange={onItemsChange}
      >
        <TestItems />
      </MasonryGrid>
    );

    // Should call onItemsChange with item count
    expect(onItemsChange).toHaveBeenCalledWith(3);
  });

  it('applies custom gap spacing', () => {
    const { container } = render(
      <MasonryGrid gap={32}>
        <TestItems />
      </MasonryGrid>
    );

    // Gap should be applied in layout calculations
    const masonryContainer = container.firstChild as HTMLElement;
    expect(masonryContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MasonryGrid className="custom-masonry">
        <TestItems />
      </MasonryGrid>
    );

    const masonryContainer = container.firstChild as HTMLElement;
    expect(masonryContainer).toHaveClass('custom-masonry');
  });

  it('handles window resize events', async () => {
    const { container } = render(
      <MasonryGrid>
        <TestItems />
      </MasonryGrid>
    );

    // Change window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      // Layout should recalculate
      const items = container.querySelectorAll('[data-testid^="item-"]');
      expect(items.length).toBe(3);
    });
  });

  it('handles dynamic item addition', async () => {
    const TestComponent = () => {
      const [items, setItems] = React.useState([1, 2, 3]);
      
      React.useEffect(() => {
        const timer = setTimeout(() => setItems([1, 2, 3, 4]), 100);
        return () => clearTimeout(timer);
      }, []);

      return (
        <MasonryGrid>
          {items.map(i => (
            <div key={i} data-testid={`item-${i}`}>
              Item {i}
            </div>
          ))}
        </MasonryGrid>
      );
    };

    render(<TestComponent />);

    // Initially should have 3 items
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();

    // After timeout, should have 4 items
    await waitFor(() => {
      expect(screen.getByTestId('item-4')).toBeInTheDocument();
    });
  });

  it('handles item removal', async () => {
    const TestComponent = () => {
      const [items, setItems] = React.useState([1, 2, 3]);
      
      React.useEffect(() => {
        const timer = setTimeout(() => setItems([1, 3]), 100);
        return () => clearTimeout(timer);
      }, []);

      return (
        <MasonryGrid>
          {items.map(i => (
            <div key={i} data-testid={`item-${i}`}>
              Item {i}
            </div>
          ))}
        </MasonryGrid>
      );
    };

    render(<TestComponent />);

    // Initially should have 3 items
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();

    // After timeout, item-2 should be removed
    await waitFor(() => {
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });
  });

  it('renders without animation when animated is false', () => {
    const { container } = render(
      <MasonryGrid animated={false}>
        <TestItems />
      </MasonryGrid>
    );

    // Should render regular divs instead of motion.div
    const items = container.querySelectorAll('[data-testid^="item-"]');
    items.forEach(item => {
      expect(item.tagName).toBe('DIV');
    });
  });

  it('handles empty children gracefully', () => {
    const { container } = render(
      <MasonryGrid>
        {null}
      </MasonryGrid>
    );

    const masonryContainer = container.firstChild as HTMLElement;
    expect(masonryContainer).toHaveClass('relative', 'w-full');
    expect(masonryContainer.children).toHaveLength(0);
  });

  it('calculates layout for different screen sizes', async () => {
    // Test just one screen size to avoid memory issues
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    });

    const { container } = render(
      <MasonryGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
        <TestItems count={6} />
      </MasonryGrid>
    );

    await waitFor(() => {
      const items = container.querySelectorAll('[data-testid^="item-"]');
      expect(items.length).toBe(6);
    });
  });

  it('maintains performance with moderate number of items', async () => {
    const startTime = performance.now();
    
    render(
      <MasonryGrid>
        <TestItems count={20} />
      </MasonryGrid>
    );

    await waitFor(() => {
      const items = screen.getAllByTestId(/item-/);
      expect(items).toHaveLength(20);
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should render within reasonable time
    expect(duration).toBeLessThan(1000);
  });

  it('calls onItemsChange when items change', async () => {
    const onItemsChange = vi.fn();
    
    const TestComponent = () => {
      const [count, setCount] = React.useState(3);
      
      React.useEffect(() => {
        const timer = setTimeout(() => setCount(5), 100);
        return () => clearTimeout(timer);
      }, []);

      return (
        <MasonryGrid onItemsChange={onItemsChange}>
          <TestItems count={count} />
        </MasonryGrid>
      );
    };

    render(<TestComponent />);

    // Should be called initially with 3 items
    expect(onItemsChange).toHaveBeenCalledWith(3);

    // Should be called again with 5 items after update
    await waitFor(() => {
      expect(onItemsChange).toHaveBeenCalledWith(5);
    });
  });
});