/**
 * Tests for useHighContrast hook
 * Ensures proper high contrast mode functionality and accessibility compliance
 */

import { renderHook, act } from '@testing-library/react';
import { useHighContrast, calculateContrastRatio, meetsContrastRequirement } from '../useHighContrast';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  const mockMediaQuery = {
    matches,
    media: '(prefers-contrast: high)',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockMediaQuery),
  });

  return mockMediaQuery;
};

// Mock localStorage
const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
    },
    writable: true,
  });

  return store;
};

// Mock document.documentElement
const mockDocumentElement = () => {
  const mockElement = {
    style: {
      setProperty: jest.fn(),
      removeProperty: jest.fn(),
    },
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
    },
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
  };

  Object.defineProperty(document, 'documentElement', {
    value: mockElement,
    writable: true,
  });

  // Mock getComputedStyle
  Object.defineProperty(window, 'getComputedStyle', {
    value: jest.fn(() => ({
      [Symbol.iterator]: function* () {
        yield '--hc-background';
        yield '--hc-text';
        yield '--hc-primary';
      },
    })),
    writable: true,
  });

  return mockElement;
};

describe('useHighContrast', () => {
  let mockMediaQuery: any;
  let localStorageStore: any;
  let mockElement: any;

  beforeEach(() => {
    mockMediaQuery = mockMatchMedia(false);
    localStorageStore = mockLocalStorage();
    mockElement = mockDocumentElement();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with system preference when no user override', () => {
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrastMode).toBe(false);
      expect(result.current.systemPreference).toBe(false);
      expect(result.current.userOverride).toBeNull();
      expect(result.current.currentTheme.id).toBe('blackOnWhite');
    });

    it('should initialize with high contrast when system prefers it', () => {
      mockMatchMedia(true);
      
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrastMode).toBe(true);
      expect(result.current.systemPreference).toBe(true);
      expect(result.current.userOverride).toBeNull();
    });

    it('should load saved preferences from localStorage', () => {
      const savedPreferences = {
        userOverride: true,
        themeId: 'whiteOnBlack',
      };

      localStorageStore['high-contrast-preferences'] = JSON.stringify(savedPreferences);
      
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrastMode).toBe(true);
      expect(result.current.userOverride).toBe(true);
      expect(result.current.currentTheme.id).toBe('whiteOnBlack');
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorageStore['high-contrast-preferences'] = 'invalid-json';
      
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrastMode).toBe(false);
      expect(result.current.currentTheme.id).toBe('blackOnWhite');
    });
  });

  describe('system preference changes', () => {
    it('should update when system preference changes and no user override', () => {
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrastMode).toBe(false);

      // Simulate system preference change
      act(() => {
        const changeEvent = new Event('change') as any;
        changeEvent.matches = true;
        mockMediaQuery.addEventListener.mock.calls[0][1](changeEvent);
      });

      expect(result.current.isHighContrastMode).toBe(true);
      expect(result.current.systemPreference).toBe(true);
    });

    it('should not update mode when user has override', () => {
      const { result } = renderHook(() => useHighContrast());

      // Set user override
      act(() => {
        result.current.setHighContrastMode(false);
      });

      expect(result.current.userOverride).toBe(false);

      // Simulate system preference change
      act(() => {
        const changeEvent = new Event('change') as any;
        changeEvent.matches = true;
        mockMediaQuery.addEventListener.mock.calls[0][1](changeEvent);
      });

      // Mode should not change due to user override
      expect(result.current.isHighContrastMode).toBe(false);
      expect(result.current.systemPreference).toBe(true);
    });
  });

  describe('controls', () => {
    it('should toggle high contrast mode', () => {
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrastMode).toBe(false);

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(result.current.isHighContrastMode).toBe(true);
      expect(result.current.userOverride).toBe(true);

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(result.current.isHighContrastMode).toBe(false);
      expect(result.current.userOverride).toBe(false);
    });

    it('should set high contrast mode explicitly', () => {
      const { result } = renderHook(() => useHighContrast());

      act(() => {
        result.current.setHighContrastMode(true);
      });

      expect(result.current.isHighContrastMode).toBe(true);
      expect(result.current.userOverride).toBe(true);

      act(() => {
        result.current.setHighContrastMode(false);
      });

      expect(result.current.isHighContrastMode).toBe(false);
      expect(result.current.userOverride).toBe(false);
    });

    it('should change theme', () => {
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.currentTheme.id).toBe('blackOnWhite');

      act(() => {
        result.current.setTheme('whiteOnBlack');
      });

      expect(result.current.currentTheme.id).toBe('whiteOnBlack');
      expect(result.current.currentTheme.name).toBe('White on Black');
    });

    it('should ignore invalid theme IDs', () => {
      const { result } = renderHook(() => useHighContrast());

      const originalTheme = result.current.currentTheme;

      act(() => {
        result.current.setTheme('nonexistent-theme');
      });

      expect(result.current.currentTheme).toBe(originalTheme);
    });

    it('should reset to system preference', () => {
      mockMatchMedia(true);
      
      const { result } = renderHook(() => useHighContrast());

      // Set user override
      act(() => {
        result.current.setHighContrastMode(false);
      });

      expect(result.current.isHighContrastMode).toBe(false);
      expect(result.current.userOverride).toBe(false);

      // Reset to system preference
      act(() => {
        result.current.resetToSystemPreference();
      });

      expect(result.current.isHighContrastMode).toBe(true);
      expect(result.current.userOverride).toBeNull();
    });
  });

  describe('CSS application', () => {
    it('should apply CSS variables when high contrast is enabled', () => {
      const { result } = renderHook(() => useHighContrast());

      act(() => {
        result.current.setHighContrastMode(true);
      });

      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--hc-background', '#ffffff');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--hc-text', '#000000');
      expect(mockElement.classList.add).toHaveBeenCalledWith('high-contrast-mode');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-high-contrast-theme', 'blackOnWhite');
    });

    it('should remove CSS variables when high contrast is disabled', () => {
      const { result } = renderHook(() => useHighContrast());

      // Enable first
      act(() => {
        result.current.setHighContrastMode(true);
      });

      // Then disable
      act(() => {
        result.current.setHighContrastMode(false);
      });

      expect(mockElement.classList.remove).toHaveBeenCalledWith('high-contrast-mode');
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('data-high-contrast-theme');
      expect(mockElement.style.removeProperty).toHaveBeenCalledWith('--hc-background');
    });

    it('should update CSS variables when theme changes', () => {
      const { result } = renderHook(() => useHighContrast());

      act(() => {
        result.current.setHighContrastMode(true);
        result.current.setTheme('whiteOnBlack');
      });

      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--hc-background', '#000000');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--hc-text', '#ffffff');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-high-contrast-theme', 'whiteOnBlack');
    });
  });

  describe('localStorage persistence', () => {
    it('should save preferences to localStorage', () => {
      const { result } = renderHook(() => useHighContrast());

      act(() => {
        result.current.setHighContrastMode(true);
        result.current.setTheme('yellowOnBlack');
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'high-contrast-preferences',
        expect.stringContaining('"userOverride":true')
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'high-contrast-preferences',
        expect.stringContaining('"themeId":"yellowOnBlack"')
      );
    });
  });

  describe('available themes', () => {
    it('should provide all available themes', () => {
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.availableThemes).toHaveLength(3);
      expect(result.current.availableThemes.map(t => t.id)).toEqual([
        'blackOnWhite',
        'whiteOnBlack',
        'yellowOnBlack'
      ]);
    });
  });
});

describe('calculateContrastRatio', () => {
  it('should calculate correct contrast ratios', () => {
    // Black on white should have high contrast
    const blackWhiteRatio = calculateContrastRatio('#000000', '#ffffff');
    expect(blackWhiteRatio).toBeCloseTo(21, 0);

    // Same colors should have ratio of 1
    const sameColorRatio = calculateContrastRatio('#ff0000', '#ff0000');
    expect(sameColorRatio).toBe(1);

    // Gray on white should have lower contrast
    const grayWhiteRatio = calculateContrastRatio('#808080', '#ffffff');
    expect(grayWhiteRatio).toBeGreaterThan(1);
    expect(grayWhiteRatio).toBeLessThan(21);
  });

  it('should handle different color formats', () => {
    // Test with different hex formats
    const ratio1 = calculateContrastRatio('#000', '#fff');
    const ratio2 = calculateContrastRatio('#000000', '#ffffff');
    
    // Should be approximately equal (allowing for rounding differences)
    expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.1);
  });
});

describe('meetsContrastRequirement', () => {
  it('should correctly identify AA compliance', () => {
    // Black on white meets AA for both normal and large text
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AA', 'normal')).toBe(true);
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AA', 'large')).toBe(true);

    // Light gray on white should not meet AA for normal text
    expect(meetsContrastRequirement('#cccccc', '#ffffff', 'AA', 'normal')).toBe(false);
    
    // But might meet AA for large text
    expect(meetsContrastRequirement('#999999', '#ffffff', 'AA', 'large')).toBe(true);
  });

  it('should correctly identify AAA compliance', () => {
    // Black on white meets AAA
    expect(meetsContrastRequirement('#000000', '#ffffff', 'AAA', 'normal')).toBe(true);
    
    // Medium gray might meet AA but not AAA
    expect(meetsContrastRequirement('#666666', '#ffffff', 'AA', 'normal')).toBe(true);
    expect(meetsContrastRequirement('#666666', '#ffffff', 'AAA', 'normal')).toBe(false);
  });

  it('should handle edge cases', () => {
    // Same colors should never meet requirements
    expect(meetsContrastRequirement('#ffffff', '#ffffff', 'AA', 'normal')).toBe(false);
    expect(meetsContrastRequirement('#000000', '#000000', 'AA', 'normal')).toBe(false);
  });
});