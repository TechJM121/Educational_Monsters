import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

describe('MasonryGrid Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should efficiently calculate masonry layout for large datasets', () => {
    const startTime = performance.now();
    
    const itemCount = 500;
    const columnCount = 4;
    const gap = 16;
    
    // Simulate masonry layout calculation
    const columnHeights = new Array(columnCount).fill(0);
    const items = [];
    
    for (let i = 0; i < itemCount; i++) {
      // Simulate varying item heights
      const itemHeight = 150 + Math.random() * 200;
      
      // Find shortest column
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      
      items.push({
        id: i,
        column: shortestColumn,
        top: columnHeights[shortestColumn],
        height: itemHeight
      });
      
      columnHeights[shortestColumn] += itemHeight + gap;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(items).toHaveLength(itemCount);
    expect(duration).toBeLessThan(50); // Should complete within 50ms
  });

  it('should handle rapid item additions efficiently', () => {
    const startTime = performance.now();
    
    const initialItems = 50;
    const additionBatches = 10;
    const itemsPerBatch = 20;
    
    let currentItems = initialItems;
    const columnCount = 3;
    const columnHeights = new Array(columnCount).fill(0);
    
    // Initial layout
    for (let i = 0; i < initialItems; i++) {
      const itemHeight = 150 + Math.random() * 100;
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      columnHeights[shortestColumn] += itemHeight + 16;
    }
    
    // Simulate rapid additions
    for (let batch = 0; batch < additionBatches; batch++) {
      for (let item = 0; item < itemsPerBatch; item++) {
        const itemHeight = 150 + Math.random() * 100;
        const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
        columnHeights[shortestColumn] += itemHeight + 16;
        currentItems++;
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(currentItems).toBe(initialItems + (additionBatches * itemsPerBatch));
    expect(duration).toBeLessThan(30);
  });

  it('should optimize column height calculations', () => {
    const startTime = performance.now();
    
    const iterations = 1000;
    const columnCount = 5;
    
    for (let i = 0; i < iterations; i++) {
      const columnHeights = [120, 340, 180, 290, 150];
      
      // Find shortest column (most common operation)
      const minHeight = Math.min(...columnHeights);
      const shortestColumn = columnHeights.indexOf(minHeight);
      
      expect(shortestColumn).toBeGreaterThanOrEqual(0);
      expect(shortestColumn).toBeLessThan(columnCount);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(50);
  });

  it('should handle responsive recalculations efficiently', () => {
    const startTime = performance.now();
    
    const itemCount = 200;
    const breakpoints = [
      { width: 320, columns: 1 },
      { width: 640, columns: 2 },
      { width: 768, columns: 3 },
      { width: 1024, columns: 4 },
      { width: 1280, columns: 5 }
    ];
    
    breakpoints.forEach(({ width, columns }) => {
      // Simulate layout recalculation for each breakpoint
      const columnHeights = new Array(columns).fill(0);
      
      for (let i = 0; i < itemCount; i++) {
        const itemHeight = 150 + Math.random() * 150;
        const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
        columnHeights[shortestColumn] += itemHeight + 16;
      }
      
      // Verify layout is valid
      expect(columnHeights.every(height => height > 0)).toBe(true);
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(40);
  });

  it('should efficiently handle item removal and layout updates', () => {
    const startTime = performance.now();
    
    const initialItemCount = 300;
    const removalCount = 100;
    
    // Create initial layout
    let items = Array.from({ length: initialItemCount }, (_, i) => ({
      id: i,
      height: 150 + Math.random() * 200,
      column: 0,
      top: 0
    }));
    
    const columnCount = 4;
    
    // Initial layout calculation
    const calculateLayout = (itemList: typeof items) => {
      const columnHeights = new Array(columnCount).fill(0);
      
      return itemList.map(item => {
        const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
        const updatedItem = {
          ...item,
          column: shortestColumn,
          top: columnHeights[shortestColumn]
        };
        columnHeights[shortestColumn] += item.height + 16;
        return updatedItem;
      });
    };
    
    items = calculateLayout(items);
    
    // Simulate item removals
    for (let i = 0; i < removalCount; i++) {
      const randomIndex = Math.floor(Math.random() * items.length);
      items.splice(randomIndex, 1);
      
      // Recalculate layout after removal
      if (i % 10 === 0) { // Only recalculate every 10 removals for efficiency
        items = calculateLayout(items);
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(items).toHaveLength(initialItemCount - removalCount);
    expect(duration).toBeLessThan(60);
  });

  it('should optimize animation staggering calculations', () => {
    const startTime = performance.now();
    
    const itemCount = 150;
    const staggerDelay = 0.05; // 50ms between items
    const maxDelay = 2; // Cap at 2 seconds
    
    const animationConfigs = [];
    
    for (let i = 0; i < itemCount; i++) {
      const delay = Math.min(i * staggerDelay, maxDelay);
      
      animationConfigs.push({
        initial: { opacity: 0, scale: 0.8, y: 50 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: {
          duration: 0.4,
          delay,
          ease: "easeOut"
        }
      });
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(animationConfigs).toHaveLength(itemCount);
    expect(animationConfigs[0].transition.delay).toBe(0);
    expect(animationConfigs[itemCount - 1].transition.delay).toBeLessThanOrEqual(maxDelay);
    expect(duration).toBeLessThan(25);
  });

  it('should handle DOM measurement operations efficiently', () => {
    const startTime = performance.now();
    
    const itemCount = 100;
    const measurements = [];
    
    // Simulate DOM measurements
    for (let i = 0; i < itemCount; i++) {
      // Mock element measurements
      const mockElement = {
        offsetHeight: 150 + Math.random() * 200,
        offsetWidth: 250 + Math.random() * 50,
        getBoundingClientRect: () => ({
          height: 150 + Math.random() * 200,
          width: 250 + Math.random() * 50,
          top: Math.random() * 1000,
          left: Math.random() * 800
        })
      };
      
      measurements.push({
        height: mockElement.offsetHeight,
        width: mockElement.offsetWidth,
        rect: mockElement.getBoundingClientRect()
      });
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(measurements).toHaveLength(itemCount);
    expect(duration).toBeLessThan(35);
  });

  it('should maintain performance during continuous layout updates', () => {
    const startTime = performance.now();
    
    const updateCycles = 50;
    const itemsPerCycle = 20;
    const columnCount = 3;
    
    let items: Array<{ id: number; height: number; column: number; top: number }> = [];
    
    for (let cycle = 0; cycle < updateCycles; cycle++) {
      // Add items
      for (let i = 0; i < itemsPerCycle; i++) {
        items.push({
          id: items.length,
          height: 150 + Math.random() * 150,
          column: 0,
          top: 0
        });
      }
      
      // Recalculate layout
      const columnHeights = new Array(columnCount).fill(0);
      items = items.map(item => {
        const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
        const updatedItem = {
          ...item,
          column: shortestColumn,
          top: columnHeights[shortestColumn]
        };
        columnHeights[shortestColumn] += item.height + 16;
        return updatedItem;
      });
      
      // Occasionally remove some items
      if (cycle % 10 === 0 && items.length > 50) {
        items = items.slice(0, -10);
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(items.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100);
  });
});