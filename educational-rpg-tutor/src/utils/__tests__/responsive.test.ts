import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useScreenSize,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsTouchDevice,
  useOrientation,
  getResponsiveGridCols,
  getResponsiveSpacing,
  getResponsiveTextSize
} from '../responsive';

// Mock window properties
const mockWindow = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('useScreenSize', () => {
  beforeEach(() => {
    // Reset window size
    mockWindow(1024, 768);
  });

  it('returns correct initial screen size', () => {
    const { result } = renderHook(() => useScreenSize());
    
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    expect(result.current.breakpoint).toBe('lg');
  });

  it('updates on window resize', () => {
    const { result } = renderHook(() => useScreenSize());
    
    act(() => {
      mockWindow(640, 480);
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.width).toBe(640);
    expect(result.current.height).toBe(480);
    expect(result.current.breakpoint).toBe('sm');
  });

  it('correctly identifies breakpoints', () => {
    const testCases = [
      { width: 320, expected: 'xs' },
      { width: 640, expected: 'sm' },
      { width: 768, expected: 'md' },
      { width: 1024, expected: 'lg' },
      { width: 1280, expected: 'xl' },
      { width: 1536, expected: '2xl' }
    ];

    testCases.forEach(({ width, expected }) => {
      const { result } = renderHook(() => useScreenSize());
      
      act(() => {
        mockWindow(width, 768);
        window.dispatchEvent(new Event('resize'));
      });
      
      expect(result.current.breakpoint).toBe(expected);
    });
  });
});

describe('useBreakpoint', () => {
  it('returns true when screen is at or above breakpoint', () => {
    mockWindow(1024, 768);
    const { result } = renderHook(() => useBreakpoint('md'));
    
    expect(result.current).toBe(true);
  });

  it('returns false when screen is below breakpoint', () => {
    mockWindow(640, 480);
    const { result } = renderHook(() => useBreakpoint('lg'));
    
    expect(result.current).toBe(false);
  });
});

describe('Device type hooks', () => {
  it('useIsMobile returns true for mobile screens', () => {
    mockWindow(320, 568);
    const { result } = renderHook(() => useIsMobile());
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current).toBe(true);
  });

  it('useIsTablet returns true for tablet screens', () => {
    mockWindow(768, 1024);
    const { result } = renderHook(() => useIsTablet());
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current).toBe(true);
  });

  it('useIsDesktop returns true for desktop screens', () => {
    mockWindow(1280, 800);
    const { result } = renderHook(() => useIsDesktop());
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current).toBe(true);
  });
});

describe('useIsTouchDevice', () => {
  it('detects touch device correctly', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: null,
    });

    const { result } = renderHook(() => useIsTouchDevice());
    
    act(() => {
      window.dispatchEvent(new TouchEvent('touchstart'));
    });
    
    expect(result.current).toBe(true);
  });

  it('detects non-touch device correctly', () => {
    // Remove touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: undefined,
    });
    
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0,
    });

    const { result } = renderHook(() => useIsTouchDevice());
    
    expect(result.current).toBe(false);
  });
});

describe('useOrientation', () => {
  it('returns portrait for taller screens', () => {
    mockWindow(768, 1024);
    const { result } = renderHook(() => useOrientation());
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current).toBe('portrait');
  });

  it('returns landscape for wider screens', () => {
    mockWindow(1024, 768);
    const { result } = renderHook(() => useOrientation());
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current).toBe('landscape');
  });

  it('updates on orientation change', () => {
    mockWindow(768, 1024);
    const { result } = renderHook(() => useOrientation());
    
    act(() => {
      mockWindow(1024, 768);
      window.dispatchEvent(new Event('orientationchange'));
    });
    
    expect(result.current).toBe('landscape');
  });
});

describe('Responsive utility functions', () => {
  it('getResponsiveGridCols returns correct classes', () => {
    const result = getResponsiveGridCols(1, 2, 3);
    expect(result).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
  });

  it('getResponsiveGridCols uses defaults', () => {
    const result = getResponsiveGridCols();
    expect(result).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
  });

  it('getResponsiveSpacing returns correct classes', () => {
    const result = getResponsiveSpacing('p-2', 'md:p-4', 'lg:p-6');
    expect(result).toBe('p-2 md:p-4 lg:p-6');
  });

  it('getResponsiveSpacing uses defaults', () => {
    const result = getResponsiveSpacing();
    expect(result).toBe('p-4 md:p-6 lg:p-8');
  });

  it('getResponsiveTextSize returns correct classes', () => {
    const result = getResponsiveTextSize('text-xs', 'md:text-sm', 'lg:text-base');
    expect(result).toBe('text-xs md:text-sm lg:text-base');
  });

  it('getResponsiveTextSize uses defaults', () => {
    const result = getResponsiveTextSize();
    expect(result).toBe('text-sm md:text-base lg:text-lg');
  });
});

describe('Performance considerations', () => {
  it('debounces resize events appropriately', () => {
    const { result } = renderHook(() => useScreenSize());
    const initialWidth = result.current.width;
    
    // Rapid resize events
    act(() => {
      mockWindow(800, 600);
      window.dispatchEvent(new Event('resize'));
      mockWindow(900, 600);
      window.dispatchEvent(new Event('resize'));
      mockWindow(1000, 600);
      window.dispatchEvent(new Event('resize'));
    });
    
    // Should update to the final value
    expect(result.current.width).toBe(1000);
  });

  it('cleans up event listeners', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useScreenSize());
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});