/**
 * Dark Mode Hook Tests
 * Tests for automatic theme detection, transitions, and accessibility
 */

import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode, useThemeClasses } from '../useDarkMode';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  const mockMediaQuery = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => mockMediaQuery),
  });

  return mockMediaQuery;
};

// Mock document methods
const mockDocument = () => {
  const mockElement = {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    },
    setAttribute: vi.fn(),
    style: {},
  };

  Object.defineProperty(document, 'documentElement', {
    value: mockElement,
    writable: true,
  });

  Object.defineProperty(document, 'getElementById', {
    value: vi.fn().mockReturnValue(null),
    writable: true,
  });

  Object.defineProperty(document, 'createElement', {
    value: vi.fn().mockReturnValue({
      id: '',
      textContent: '',
    }),
    writable: true,
  });

  Object.defineProperty(document, 'head', {
    value: {
      appendChild: vi.fn(),
    },
    writable: true,
  });

  return mockElement;
};

describe('useDarkMode Hook', () => {
  let mockElement: ReturnType<typeof mockDocument>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockElement = mockDocument();
  });

  describe('Initialization', () => {
    test('initializes with default auto mode', () => {
      mockMatchMedia(false);
      
      const { result } = renderHook(() => useDarkMode());
      const [state] = result.current;

      expect(state.mode).toBe('auto');
      expect(state.isDark).toBe(false);
      expect(state.isSystemDark).toBe(false);
      expect(state.isTransitioning).toBe(false);
    });

    test('initializes with system dark theme', () => {
      mockMatchMedia(true);
      
      const { result } = renderHook(() => useDarkMode());
      const [state] = result.current;

      expect(state.mode).toBe('auto');
      expect(state.isDark).toBe(true);
      expect(state.isSystemDark).toBe(true);
    });

    test('loads saved mode from localStorage', () => {
      mockLocalStorage.setItem('theme-mode', 'dark');
      mockMatchMedia(false);
      
      const { result } = renderHook(() => useDarkMode());
      const [state] = result.current;

      expect(state.mode).toBe('dark');
      expect(state.isDark).toBe(true);
    });

    test('uses custom storage key', () => {
      mockLocalStorage.setItem('custom-theme', 'light');
      mockMatchMedia(true);
      
      const { result } = renderHook(() => 
        useDarkMode({ storageKey: 'custom-theme' })
      );
      const [state] = result.current;

      expect(state.mode).toBe('light');
      expect(state.isDark).toBe(false);
    });
  });

  describe('Mode Controls', () => {
    test('setMode updates mode and saves to localStorage', async () => {
      mockMatchMedia(false);
      
      const { result } = renderHook(() => useDarkMode());
      const [, controls] = result.current;

      await act(async () => {
        controls.setMode('dark');
        // Wait for transition
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const [newState] = result.current;
      expect(newState.mode).toBe('dark');
      expect(newState.isDark).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme-mode', 'dark');
    });

    test('toggle switches between light and dark', async () => {
      mockMatchMedia(false);
      
      const { result } = renderHook(() => useDarkMode({ defaultMode: 'light' }));
      
      await act(async () => {
        const [, controls] = result.current;
        controls.toggle();
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const [state1] = result.current;
      expect(state1.isDark).toBe(true);

      await act(async () => {
        const [, controls] = result.current;
        controls.toggle();
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const [state2] = result.current;
      expect(state2.isDark).toBe(false);
    });

    test('setLight sets light mode', async () => {
      mockMatchMedia(true);
      
      const { result } = renderHook(() => useDarkMode({ defaultMode: 'dark' }));
      
      await act(async () => {
        const [, controls] = result.current;
        controls.setLight();
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const [state] = result.current;
      expect(state.mode).toBe('light');
      expect(state.isDark).toBe(false);
    });

    test('setDark sets dark mode', async () => {
      mockMatchMedia(false);
      
      const { result } = renderHook(() => useDarkMode({ defaultMode: 'light' }));
      
      await act(async () => {
        const [, controls] = result.current;
        controls.setDark();
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const [state] = result.current;
      expect(state.mode).toBe('dark');
      expect(state.isDark).toBe(true);
    });

    test('setAuto sets auto mode', async () => {
      mockMatchMedia(true);
      
      const { result } = renderHook(() => useDarkMode({ defaultMode: 'light' }));
      
      await act(async () => {
        const [, controls] = result.current;
        controls.setAuto();
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const [state] = result.current;
      expect(state.mode).toBe('auto');
      expect(state.isDark).toBe(true); // Should follow system preference
    });
  });

  describe('System Theme Detection', () => {
    test('follows system theme in auto mode', () => {
      const mediaQuery = mockMatchMedia(true);
      
      const { result } = renderHook(() => useDarkMode({ defaultMode: 'auto' }));
      let [state] = result.current;
      
      expect(state.isDark).toBe(true);

      // Simulate system theme change
      act(() => {
        mediaQuery.matches = false;
        const changeHandler = mediaQuery.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (changeHandler) {
          changeHandler({ matches: false });
        }
      });

      [state] = result.current;
      expect(state.isSystemDark).toBe(false);
    });

    test('ignores system theme changes in manual modes', () => {
      const mediaQuery = mockMatchMedia(false);
      
      const { result } = renderHook(() => useDarkMode({ defaultMode: 'dark' }));
      let [state] = result.current;
      
      expect(state.isDark).toBe(true);

      // Simulate system theme change
      act(() => {
        mediaQuery.matches = true;
        const changeHandler = mediaQuery.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (changeHandler) {
          changeHandler({ matches: true });
        }
      });

      [state] = result.current;
      expect(state.isDark).toBe(true); // Should remain dark
    });
  });

  describe('Transitions', () => {
    test('handles transitions when enabled', async () => {
      mockMatchMedia(false);
      
      const { result } = renderHook(() => 
        useDarkMode({ enableTransitions: true, transitionDuration: 100 })
      );
      
      await act(async () => {
        const [, controls] = result.current;
        controls.setDark();
        
        // Check transitioning state
        const [transitionState] = result.current;
        expect(transitionState.isTransitioning).toBe(true);
        
        // Wait for transition to complete
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      const [finalState] = result.current;
      expect(finalState.isTransitioning).toBe(false);
      expect(finalState.isDark).toBe(true);
    });

    test('skips transitions when disabled', async () => {
      mockMatchMedia(false);
      
      const { result } = renderHook(() => 
        useDarkMode({ enableTransitions: false })
      );
      
      await act(async () => {
        const [, controls] = result.current;
        controls.setDark();
      });

      const [state] = result.current;
      expect(state.isTransitioning).toBe(false);
      expect(state.isDark).toBe(true);
    });

    test('respects reduced motion preference', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => {
          if (query === '(prefers-reduced-motion: reduce)') {
            return { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
          }
          return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
        }),
      });

      const { result } = renderHook(() => 
        useDarkMode({ enableTransitions: true, respectReducedMotion: true })
      );
      
      await act(async () => {
        const [, controls] = result.current;
        controls.setDark();
      });

      const [state] = result.current;
      expect(state.isTransitioning).toBe(false); // Should skip transition
      expect(state.isDark).toBe(true);
    });
  });

  describe('DOM Updates', () => {
    test('applies theme classes to document element', () => {
      mockMatchMedia(false);
      
      renderHook(() => useDarkMode({ defaultMode: 'light' }));

      expect(mockElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
      expect(mockElement.classList.add).toHaveBeenCalledWith('light');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-theme-mode', 'light');
    });

    test('sets color scheme for native controls', () => {
      mockMatchMedia(true);
      
      renderHook(() => useDarkMode({ defaultMode: 'dark' }));

      expect(mockElement.style.colorScheme).toBe('dark');
    });
  });

  describe('Custom Events', () => {
    test('dispatches theme change events', async () => {
      const eventSpy = vi.spyOn(window, 'dispatchEvent');
      mockMatchMedia(false);
      
      const { result } = renderHook(() => useDarkMode());
      
      await act(async () => {
        const [, controls] = result.current;
        controls.setDark();
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themeChange',
          detail: expect.objectContaining({
            mode: 'dark',
            isDark: true,
          }),
        })
      );
    });
  });
});

describe('useThemeClasses Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockDocument();
  });

  test('provides theme-aware class utilities', () => {
    mockMatchMedia(false);
    
    const { result } = renderHook(() => useThemeClasses());
    const { getThemeClasses, getGlassClasses, getTextClasses, getBgClasses } = result.current;

    expect(getThemeClasses('light-class', 'dark-class')).toBe('light-class');
    expect(getGlassClasses('medium')).toContain('bg-white/20');
    expect(getTextClasses('primary')).toBe('text-slate-900');
    expect(getBgClasses('primary')).toBe('bg-white');
  });

  test('returns dark classes in dark mode', () => {
    mockMatchMedia(true);
    
    const { result } = renderHook(() => useThemeClasses());
    const { getThemeClasses, getGlassClasses, getTextClasses, getBgClasses } = result.current;

    expect(getThemeClasses('light-class', 'dark-class')).toBe('dark-class');
    expect(getGlassClasses('medium')).toContain('bg-slate-900/20');
    expect(getTextClasses('primary')).toBe('text-slate-100');
    expect(getBgClasses('primary')).toBe('bg-slate-900');
  });

  test('provides different glass variants', () => {
    mockMatchMedia(false);
    
    const { result } = renderHook(() => useThemeClasses());
    const { getGlassClasses } = result.current;

    expect(getGlassClasses('light')).toContain('bg-white/10');
    expect(getGlassClasses('medium')).toContain('bg-white/20');
    expect(getGlassClasses('strong')).toContain('bg-white/30');
  });
});