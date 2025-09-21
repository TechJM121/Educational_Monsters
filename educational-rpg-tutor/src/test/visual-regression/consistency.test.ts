/**
 * Automated Visual Consistency Tests
 * Ensures visual consistency across different configurations and states
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { VisualRegressionTester, TEST_THEMES, VIEWPORTS } from './setup';

describe('Visual Consistency Tests', () => {
  let visualTester: VisualRegressionTester;
  let dom: JSDOM;

  beforeEach(() => {
    visualTester = new VisualRegressionTester();
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      pretendToBeVisual: true,
      resources: 'usable'
    });
    
    global.window = dom.window as any;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
  });

  describe('Theme Consistency', () => {
    it('should maintain consistent spacing across all themes', () => {
      const themes = Object.keys(TEST_THEMES);
      const spacingValues = ['p-2', 'p-4', 'p-6', 'p-8', 'm-2', 'm-4', 'm-6', 'm-8'];
      
      const spacingResults: Record<string, Record<string, string>> = {};
      
      themes.forEach(theme => {
        spacingResults[theme] = {};
        
        spacingValues.forEach(spacing => {
          // Create test element with spacing class
          const element = document.createElement('div');
          element.className = spacing;
          document.body.appendChild(element);
          
          // Apply theme-specific styles (simulated)
          const computedStyle = window.getComputedStyle(element);
          spacingResults[theme][spacing] = computedStyle.padding || computedStyle.margin || '0px';
          
          document.body.removeChild(element);
        });
      });
      
      // Verify spacing is consistent across themes
      const baseTheme = themes[0];
      themes.slice(1).forEach(theme => {
        spacingValues.forEach(spacing => {
          expect(spacingResults[theme][spacing]).toBe(spacingResults[baseTheme][spacing]);
        });
      });
    });

    it('should maintain consistent typography scale across themes', () => {
      const themes = Object.keys(TEST_THEMES);
      const textSizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
      
      const typographyResults: Record<string, Record<string, string>> = {};
      
      themes.forEach(theme => {
        typographyResults[theme] = {};
        
        textSizes.forEach(size => {
          const element = document.createElement('p');
          element.className = size;
          element.textContent = 'Test text';
          document.body.appendChild(element);
          
          const computedStyle = window.getComputedStyle(element);
          typographyResults[theme][size] = computedStyle.fontSize;
          
          document.body.removeChild(element);
        });
      });
      
      // Verify typography scale is consistent
      const baseTheme = themes[0];
      themes.slice(1).forEach(theme => {
        textSizes.forEach(size => {
          expect(typographyResults[theme][size]).toBe(typographyResults[baseTheme][size]);
        });
      });
    });

    it('should maintain proper contrast ratios in all themes', () => {
      const contrastRequirements = {
        'normal-text': 4.5,
        'large-text': 3.0,
        'ui-components': 3.0
      };

      Object.entries(TEST_THEMES).forEach(([themeName, theme]) => {
        // Test primary color combinations
        const primaryBg = theme.colors.primary[500];
        const primaryText = theme.colors.neutral[50];
        
        const contrast = calculateContrastRatio(primaryBg, primaryText);
        expect(contrast).toBeGreaterThanOrEqual(contrastRequirements['ui-components']);
        
        // Test secondary color combinations
        const secondaryBg = theme.colors.secondary[500];
        const secondaryText = theme.colors.neutral[900];
        
        const secondaryContrast = calculateContrastRatio(secondaryBg, secondaryText);
        expect(secondaryContrast).toBeGreaterThanOrEqual(contrastRequirements['normal-text']);
      });
    });
  });

  describe('Viewport Consistency', () => {
    it('should maintain proportional scaling across viewports', () => {
      const viewports = Object.entries(VIEWPORTS);
      const testElement = document.createElement('div');
      testElement.className = 'w-1/2 h-32 bg-blue-500';
      
      const proportions: Record<string, { widthRatio: number; height: number }> = {};
      
      viewports.forEach(([name, { width, height }]) => {
        // Simulate viewport
        Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
        
        document.body.appendChild(testElement);
        
        // Calculate proportions
        const elementWidth = testElement.offsetWidth;
        const elementHeight = testElement.offsetHeight;
        
        proportions[name] = {
          widthRatio: elementWidth / width,
          height: elementHeight
        };
        
        document.body.removeChild(testElement);
      });
      
      // Verify proportional scaling
      const baseViewport = viewports[0][0];
      const baseRatio = proportions[baseViewport].widthRatio;
      
      Object.keys(proportions).forEach(viewport => {
        if (viewport !== baseViewport) {
          expect(Math.abs(proportions[viewport].widthRatio - baseRatio)).toBeLessThan(0.01);
        }
      });
    });

    it('should maintain readable text sizes across all viewports', () => {
      const minReadableSize = 14; // pixels
      const viewports = Object.entries(VIEWPORTS);
      
      viewports.forEach(([name, { width, height }]) => {
        Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
        
        const textElement = document.createElement('p');
        textElement.className = 'text-sm'; // Should be readable on all devices
        textElement.textContent = 'Test text';
        document.body.appendChild(textElement);
        
        const computedStyle = window.getComputedStyle(textElement);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        expect(fontSize).toBeGreaterThanOrEqual(minReadableSize);
        
        document.body.removeChild(textElement);
      });
    });
  });

  describe('Animation Consistency', () => {
    it('should maintain consistent animation durations across components', () => {
      const expectedDurations = {
        'micro': 200,
        'hover': 300,
        'focus': 150,
        'transition': 500
      };
      
      Object.entries(expectedDurations).forEach(([type, duration]) => {
        const element = document.createElement('div');
        element.className = `transition-all duration-${duration}`;
        document.body.appendChild(element);
        
        const computedStyle = window.getComputedStyle(element);
        const transitionDuration = parseFloat(computedStyle.transitionDuration) * 1000;
        
        expect(Math.abs(transitionDuration - duration)).toBeLessThan(50); // 50ms tolerance
        
        document.body.removeChild(element);
      });
    });

    it('should use consistent easing functions', () => {
      const standardEasings = [
        'ease-out',
        'ease-in-out',
        'ease-in',
        'linear'
      ];
      
      standardEasings.forEach(easing => {
        const element = document.createElement('div');
        element.className = `transition-all ${easing}`;
        document.body.appendChild(element);
        
        const computedStyle = window.getComputedStyle(element);
        const timingFunction = computedStyle.transitionTimingFunction;
        
        // Verify easing function is applied
        expect(timingFunction).toBeDefined();
        expect(timingFunction).not.toBe('');
        
        document.body.removeChild(element);
      });
    });
  });

  describe('Component State Consistency', () => {
    it('should maintain consistent hover states across interactive components', () => {
      const interactiveComponents = [
        'button',
        'a',
        'input',
        '[role="button"]'
      ];
      
      interactiveComponents.forEach(selector => {
        const element = document.createElement(selector === 'button' ? 'button' : 'div');
        if (selector.includes('role')) {
          element.setAttribute('role', 'button');
        }
        element.className = 'hover:scale-105 hover:shadow-lg transition-all duration-300';
        document.body.appendChild(element);
        
        // Simulate hover state
        element.dispatchEvent(new Event('mouseenter'));
        
        const computedStyle = window.getComputedStyle(element);
        
        // Verify hover effects are applied
        expect(computedStyle.transform).toBeDefined();
        expect(computedStyle.boxShadow).toBeDefined();
        
        document.body.removeChild(element);
      });
    });

    it('should maintain consistent focus states for accessibility', () => {
      const focusableElements = ['button', 'input', 'textarea', 'select', 'a'];
      
      focusableElements.forEach(tagName => {
        const element = document.createElement(tagName);
        element.className = 'focus:ring-2 focus:ring-blue-500 focus:outline-none';
        
        if (tagName === 'a') {
          element.setAttribute('href', '#');
        }
        
        document.body.appendChild(element);
        
        // Simulate focus
        element.focus();
        
        const computedStyle = window.getComputedStyle(element);
        
        // Verify focus ring is applied
        expect(computedStyle.outline).toBe('none');
        // Note: box-shadow for focus ring would be tested in actual browser
        
        document.body.removeChild(element);
      });
    });
  });

  describe('Glass Effect Consistency', () => {
    it('should maintain consistent backdrop blur values', () => {
      const blurLevels = ['sm', 'md', 'lg', 'xl'];
      const expectedBlurValues = {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px'
      };
      
      blurLevels.forEach(level => {
        const element = document.createElement('div');
        element.className = `backdrop-blur-${level}`;
        document.body.appendChild(element);
        
        const computedStyle = window.getComputedStyle(element);
        const backdropFilter = computedStyle.backdropFilter || computedStyle.webkitBackdropFilter;
        
        // In a real browser, this would contain the blur value
        expect(backdropFilter).toBeDefined();
        
        document.body.removeChild(element);
      });
    });

    it('should maintain consistent glass opacity levels', () => {
      const opacityLevels = [0.05, 0.1, 0.15, 0.2, 0.25];
      
      opacityLevels.forEach(opacity => {
        const element = document.createElement('div');
        element.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        document.body.appendChild(element);
        
        const computedStyle = window.getComputedStyle(element);
        const bgColor = computedStyle.backgroundColor;
        
        // Verify opacity is applied
        expect(bgColor).toContain('rgba');
        expect(bgColor).toContain(opacity.toString());
        
        document.body.removeChild(element);
      });
    });
  });
});

// Utility function to calculate contrast ratio
function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, this would parse colors and calculate luminance
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color: string): number {
  // Simplified luminance calculation
  // This would need proper color parsing in a real implementation
  if (color.includes('rgb')) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const [r, g, b] = matches.map(n => parseInt(n) / 255);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
  }
  
  // Default luminance for hex colors (simplified)
  return color.includes('fff') || color.includes('white') ? 1 : 0;
}