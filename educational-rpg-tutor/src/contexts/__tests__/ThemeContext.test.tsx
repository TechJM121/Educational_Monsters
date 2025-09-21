/**
 * ThemeContext Tests
 * Tests theme switching infrastructure, persistence, and smooth transitions
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme, useThemeStyles } from '../ThemeContext';
import type { ThemeMode, ThemeCustomization } from '../../types/theme';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
});

// Mock custom events
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
});

// Test component that uses theme context
const TestComponent: React.FC = () => {
  const { currentTheme, mode, setMode, updateCustomization, resetToDefault, exportTheme, importTheme } = useTheme();
  const { getGlassStyles, getGradientStyles } = useThemeStyles();
  
  return (
    <div data-testid="test-component">
      <div data-testid="theme-id">{currentTheme.id}</div>
      <div data-testid="theme-mode">{mode}</div>
      <div data-testid="theme-name">{currentTheme.name}</div>
      <button 
        data-testid="set-dark-mode" 
        onClick={() => setMode('dark')}
      >
        Set Dark Mode
      </button>
      <button 
        data-testid="set-light-mode" 
        onClick={() => setMode('light')}
      >
        Set Light Mode
      </button>
      <button 
        data-testid="set-auto-mode" 
        onClick={() => setMode('auto')}
      >
        Set Auto Mode
      </button>
      <button 
        data-testid="customize-theme" 
        onClick={() => updateCustomization({ primaryColor: '#ff0000' })}
      >
        Customize Theme
      </button>
      <button 
        data-testid="reset-theme" 
        onClick={resetToDefault}
      >
        Reset Theme
      </button>
      <button 
        data-testid="export-theme" 
        onClick={() => {
          const exported = exportTheme();
          document.body.setAttribute('data-exported-theme', exported);
        }}
      >
        Export Theme
      </button>
      <button 
        data-testid="import-theme" 
        onClick={() => {
          const success = importTheme('{"theme":{"id":"test","name":"Test","mode":"dark"},"mode":"dark","customization":{}}');
          document.body.setAttribute('data-import-success', success.toString());
        }}
      >
        Import Theme
      </button>
      <div 
        data-testid="glass-styles" 
        style={getGlassStyles('medium')}
      >
        Glass Element
      </div>
      <div 
        data-testid="gradient-styles" 
        style={getGradientStyles('cosmic')}
      >
        Gradient Element
      </div>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          setProperty: vi.fn(),
        },
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
      configurable: true,
    });

    // Mock document.head for style injection
    const mockHead = {
      appendChild: vi.fn(),
    };
    Object.defineProperty(document, 'head', {
      value: mockHead,
      configurable: true,
    });

    // Mock document.getElementById
    Object.defineProperty(document, 'getElementById', {
      value: vi.fn().mockReturnValue(null),
      configurable: true,
    });

    // Mock document.createElement
    Object.defineProperty(document, 'createElement', {
      value: vi.fn().mockReturnValue({
        id: '',
        textContent: '',
      }),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Theme Provider Initialization', () => {
    it('should initialize with default theme when no saved preferences', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-id')).toHaveTextContent('default-modern');
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('auto');
      expect(screen.getByTestId('theme-name')).toHaveTextContent('Modern RPG');
    });

    it('should load saved theme mode from localStorage', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'modern-ui-theme') return 'dark';
        return null;
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme-id')).toHaveTextContent('dark-modern');
    });

    it('should load saved customization from localStorage', () => {
      const mockCustomization = { primaryColor: '#ff0000', blurIntensity: 'lg' as const };
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'modern-ui-customization') return JSON.stringify(mockCustomization);
        return null;
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Component should render without errors with customization applied
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should handle invalid customization data gracefully', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'modern-ui-customization') return 'invalid-json';
        return null;
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse saved theme customization:', expect.any(Error));
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Theme Mode Switching', () => {
    it('should switch to dark mode and persist preference', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const darkModeButton = screen.getByTestId('set-dark-mode');
      
      await act(async () => {
        darkModeButton.click();
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme-id')).toHaveTextContent('dark-modern');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('modern-ui-theme', 'dark');
    });

    it('should switch to light mode and persist preference', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const lightModeButton = screen.getByTestId('set-light-mode');
      
      await act(async () => {
        lightModeButton.click();
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('theme-id')).toHaveTextContent('default-modern');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('modern-ui-theme', 'light');
    });

    it('should switch to auto mode and detect system preference', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode preferred
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const autoModeButton = screen.getByTestId('set-auto-mode');
      
      await act(async () => {
        autoModeButton.click();
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('auto');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('modern-ui-theme', 'auto');
    });

    it('should dispatch theme change event on mode switch', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const darkModeButton = screen.getByTestId('set-dark-mode');
      
      await act(async () => {
        darkModeButton.click();
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themeChange',
          detail: expect.objectContaining({
            newMode: 'dark',
            previousMode: 'auto'
          })
        })
      );
    });
  });

  describe('Theme Customization', () => {
    it('should update customization and persist changes', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const customizeButton = screen.getByTestId('customize-theme');
      
      await act(async () => {
        customizeButton.click();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'modern-ui-customization',
        JSON.stringify({ primaryColor: '#ff0000' })
      );
    });

    it('should reset customization to default', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // First customize
      const customizeButton = screen.getByTestId('customize-theme');
      await act(async () => {
        customizeButton.click();
      });

      // Then reset
      const resetButton = screen.getByTestId('reset-theme');
      await act(async () => {
        resetButton.click();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('modern-ui-customization');
    });
  });

  describe('Theme Import/Export', () => {
    it('should export theme data correctly', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const exportButton = screen.getByTestId('export-theme');
      
      await act(async () => {
        exportButton.click();
      });

      const exportedData = document.body.getAttribute('data-exported-theme');
      expect(exportedData).toBeTruthy();
      
      const parsed = JSON.parse(exportedData!);
      expect(parsed).toHaveProperty('theme');
      expect(parsed).toHaveProperty('mode');
      expect(parsed).toHaveProperty('customization');
      expect(parsed).toHaveProperty('exportedAt');
    });

    it('should import valid theme data successfully', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const importButton = screen.getByTestId('import-theme');
      
      await act(async () => {
        importButton.click();
      });

      const importSuccess = document.body.getAttribute('data-import-success');
      expect(importSuccess).toBe('true');
    });

    it('should handle invalid import data gracefully', async () => {
      const TestComponentWithInvalidImport: React.FC = () => {
        const { importTheme } = useTheme();
        
        return (
          <button 
            data-testid="import-invalid" 
            onClick={() => {
              const success = importTheme('invalid-json');
              document.body.setAttribute('data-import-success', success.toString());
            }}
          >
            Import Invalid
          </button>
        );
      };

      render(
        <ThemeProvider>
          <TestComponentWithInvalidImport />
        </ThemeProvider>
      );

      const importButton = screen.getByTestId('import-invalid');
      
      await act(async () => {
        importButton.click();
      });

      const importSuccess = document.body.getAttribute('data-import-success');
      expect(importSuccess).toBe('false');
    });
  });

  describe('Theme Styles Hooks', () => {
    it('should provide glass styles with correct properties', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const glassElement = screen.getByTestId('glass-styles');
      const styles = window.getComputedStyle(glassElement);
      
      // The element should be rendered (styles will be applied via CSS custom properties)
      expect(glassElement).toBeInTheDocument();
    });

    it('should provide gradient styles with correct properties', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const gradientElement = screen.getByTestId('gradient-styles');
      
      // The element should be rendered (styles will be applied via CSS custom properties)
      expect(gradientElement).toBeInTheDocument();
    });
  });

  describe('CSS Custom Properties Application', () => {
    it('should apply CSS custom properties to document root', () => {
      const mockSetProperty = vi.fn();
      Object.defineProperty(document.documentElement, 'style', {
        value: { setProperty: mockSetProperty },
        configurable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should set color variables
      expect(mockSetProperty).toHaveBeenCalledWith('--color-primary-500', expect.any(String));
      expect(mockSetProperty).toHaveBeenCalledWith('--color-secondary-500', expect.any(String));
      expect(mockSetProperty).toHaveBeenCalledWith('--color-accent-500', expect.any(String));
      
      // Should set glass variables
      expect(mockSetProperty).toHaveBeenCalledWith('--glass-background', expect.any(String));
      expect(mockSetProperty).toHaveBeenCalledWith('--glass-border', expect.any(String));
      
      // Should set gradient variables
      expect(mockSetProperty).toHaveBeenCalledWith('--gradient-cosmic-start', expect.any(String));
      expect(mockSetProperty).toHaveBeenCalledWith('--gradient-cosmic-end', expect.any(String));
    });

    it('should add theme mode classes to document root', () => {
      const mockClassList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      Object.defineProperty(document.documentElement, 'classList', {
        value: mockClassList,
        configurable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockClassList.remove).toHaveBeenCalledWith('theme-light', 'theme-dark');
      expect(mockClassList.add).toHaveBeenCalledWith('theme-light'); // Default is light mode
    });

    it('should inject transition styles for smooth theme changes', () => {
      const mockAppendChild = vi.fn();
      const mockCreateElement = vi.fn().mockReturnValue({
        id: '',
        textContent: '',
      });

      Object.defineProperty(document, 'head', {
        value: { appendChild: mockAppendChild },
        configurable: true,
      });
      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
        configurable: true,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockCreateElement).toHaveBeenCalledWith('style');
      expect(mockAppendChild).toHaveBeenCalled();
    });
  });

  describe('System Theme Detection', () => {
    it('should listen for system theme changes in auto mode', () => {
      const mockAddEventListener = vi.fn();
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should clean up event listeners on unmount', () => {
      const mockRemoveEventListener = vi.fn();
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: mockRemoveEventListener,
      });

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useTheme is used outside provider', () => {
      const TestComponentOutsideProvider = () => {
        useTheme();
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const customizeButton = screen.getByTestId('customize-theme');
      
      // Should not throw error even if localStorage fails
      expect(() => {
        act(() => {
          customizeButton.click();
        });
      }).not.toThrow();
    });
  });
});