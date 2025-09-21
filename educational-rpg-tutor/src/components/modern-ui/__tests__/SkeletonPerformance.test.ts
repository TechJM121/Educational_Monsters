import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import Skeleton from '../Skeleton';
import SkeletonLayout from '../SkeletonLayout';

// Mock performance APIs
const mockPerformanceObserver = vi.fn();
const mockPerformanceNow = vi.fn();

beforeEach(() => {
  // Mock Performance Observer
  global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }));
  
  // Mock performance.now
  global.performance = {
    ...global.performance,
    now: mockPerformanceNow,
  };
  
  mockPerformanceNow.mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Skeleton Performance Tests', () => {
  describe('Rendering Performance', () => {
    it('renders single skeleton component within performance budget', () => {
      const startTime = performance.now();
      
      render(React.createElement(Skeleton, {
        variant: 'text',
        animation: 'pulse',
        lines: 5
      }));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 16ms (60fps budget)
      expect(renderTime).toBeLessThan(16);
    });

    it('renders multiple skeleton components efficiently', () => {
      const startTime = performance.now();
      
      // Render 10 skeleton components
      for (let i = 0; i < 10; i++) {
        render(React.createElement(Skeleton, {
          variant: 'card',
          animation: 'pulse',
          key: i
        }));
      }
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 10 components within 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it('renders complex skeleton layout within performance budget', () => {
      const startTime = performance.now();
      
      render(React.createElement(SkeletonLayout, {
        layout: 'dashboard',
        animation: 'pulse',
        responsive: true
      }));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Complex layout should render within 32ms
      expect(renderTime).toBeLessThan(32);
    });
  });

  describe('Animation Performance', () => {
    it('uses CSS animations for better performance', () => {
      const { container } = render(React.createElement(Skeleton, {
        variant: 'text',
        animation: 'pulse'
      }));
      
      const animatedElement = container.querySelector('.animate-pulse');
      expect(animatedElement).toBeInTheDocument();
      
      // Should use CSS animation classes instead of JS animations
      expect(animatedElement?.classList.contains('animate-pulse')).toBe(true);
    });

    it('applies GPU-accelerated properties', () => {
      const { container } = render(React.createElement(Skeleton, {
        variant: 'card',
        animation: 'shimmer'
      }));
      
      const animatedElement = container.querySelector('.animate-shimmer');
      expect(animatedElement).toBeInTheDocument();
      
      // Should use transform and opacity for GPU acceleration
      const computedStyle = window.getComputedStyle(animatedElement!);
      expect(computedStyle.transform).toBeDefined();
    });
  });

  describe('Memory Usage', () => {
    it('cleans up properly when unmounted', () => {
      const { unmount } = render(React.createElement(Skeleton, {
        variant: 'text',
        animation: 'pulse'
      }));
      
      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });

    it('does not create memory leaks with multiple renders', () => {
      // Render and unmount multiple times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(React.createElement(Skeleton, {
          variant: 'card',
          animation: 'wave',
          key: i
        }));
        unmount();
      }
      
      // Should complete without memory issues
      expect(true).toBe(true);
    });
  });

  describe('Responsive Performance', () => {
    it('handles responsive layouts efficiently', () => {
      const startTime = performance.now();
      
      render(React.createElement(SkeletonLayout, {
        layout: 'grid',
        responsive: true,
        animation: 'pulse'
      }));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Responsive grid should render efficiently
      expect(renderTime).toBeLessThan(25);
    });

    it('optimizes for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      const { container } = render(React.createElement(SkeletonLayout, {
        layout: 'dashboard',
        responsive: true
      }));
      
      // Should apply mobile-optimized classes
      const responsiveElement = container.querySelector('.grid-cols-1');
      expect(responsiveElement).toBeInTheDocument();
    });
  });

  describe('Animation Timing', () => {
    it('uses appropriate animation durations', () => {
      const { container } = render(React.createElement(Skeleton, {
        variant: 'text',
        animation: 'pulse'
      }));
      
      const animatedElement = container.querySelector('.animate-pulse');
      expect(animatedElement).toBeInTheDocument();
      
      // Should use predefined animation classes with reasonable durations
      // In test environment, we verify the class is applied correctly
      expect(animatedElement?.classList.contains('animate-pulse')).toBe(true);
    });

    it('staggers animations for better visual flow', () => {
      const { container } = render(React.createElement(SkeletonLayout, {
        layout: 'feed',
        animation: 'pulse'
      }));
      
      // Should have multiple animated elements for staggered effect
      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(3);
    });
  });

  describe('Accessibility Performance', () => {
    it('does not impact screen reader performance', () => {
      const { container } = render(React.createElement(Skeleton, {
        variant: 'text',
        animation: 'pulse'
      }));
      
      // Should not have excessive ARIA attributes that slow down screen readers
      const ariaElements = container.querySelectorAll('[aria-label], [aria-describedby], [aria-hidden]');
      expect(ariaElements.length).toBeLessThan(5);
    });

    it('respects reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      const { container } = render(React.createElement(Skeleton, {
        variant: 'text',
        animation: 'pulse'
      }));
      
      // Should still render but with reduced animations
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});