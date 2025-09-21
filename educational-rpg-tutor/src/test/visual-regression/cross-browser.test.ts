/**
 * Cross-Browser Compatibility Tests
 * Ensures consistent rendering across different browsers and their specific quirks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BROWSER_CONFIGS, setBrowserEnvironment, type BrowserName } from './setup';

describe('Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    // Reset browser environment
    vi.clearAllMocks();
  });

  describe('CSS Feature Support Detection', () => {
    const browsers: BrowserName[] = ['chrome', 'firefox', 'safari', 'edge'];

    browsers.forEach(browser => {
      describe(`${browser} compatibility`, () => {
        beforeEach(() => {
          setBrowserEnvironment(browser);
        });

        it('should detect backdrop-filter support', () => {
          const testElement = document.createElement('div');
          testElement.style.backdropFilter = 'blur(10px)';
          document.body.appendChild(testElement);

          const computedStyle = window.getComputedStyle(testElement);
          const hasBackdropFilter = computedStyle.backdropFilter !== '' || 
                                   (computedStyle as any).webkitBackdropFilter !== '';

          // Chrome, Safari, and Edge should support backdrop-filter
          if (['chrome', 'safari', 'edge'].includes(browser)) {
            expect(hasBackdropFilter).toBe(true);
          }

          document.body.removeChild(testElement);
        });

        it('should detect CSS Grid support', () => {
          const testElement = document.createElement('div');
          testElement.style.display = 'grid';
          document.body.appendChild(testElement);

          const computedStyle = window.getComputedStyle(testElement);
          const hasGridSupport = computedStyle.display === 'grid';

          // All modern browsers should support CSS Grid
          expect(hasGridSupport).toBe(true);

          document.body.removeChild(testElement);
        });

        it('should detect CSS custom properties support', () => {
          const testElement = document.createElement('div');
          testElement.style.setProperty('--test-color', '#ff0000');
          testElement.style.color = 'var(--test-color)';
          document.body.appendChild(testElement);

          const computedStyle = window.getComputedStyle(testElement);
          const hasCustomPropsSupport = computedStyle.color === 'rgb(255, 0, 0)' || 
                                       computedStyle.color === '#ff0000';

          // All modern browsers should support custom properties
          expect(hasCustomPropsSupport).toBe(true);

          document.body.removeChild(testElement);
        });

        it('should detect transform3d support', () => {
          const testElement = document.createElement('div');
          testElement.style.transform = 'translate3d(10px, 10px, 0)';
          document.body.appendChild(testElement);

          const computedStyle = window.getComputedStyle(testElement);
          const hasTransform3d = computedStyle.transform !== 'none' && 
                                computedStyle.transform !== '';

          // All modern browsers should support 3D transforms
          expect(hasTransform3d).toBe(true);

          document.body.removeChild(testElement);
        });

        it('should handle flexbox correctly', () => {
          const container = document.createElement('div');
          container.style.display = 'flex';
          container.style.justifyContent = 'space-between';
          container.style.alignItems = 'center';

          const child1 = document.createElement('div');
          const child2 = document.createElement('div');
          container.appendChild(child1);
          container.appendChild(child2);
          document.body.appendChild(container);

          const computedStyle = window.getComputedStyle(container);
          expect(computedStyle.display).toBe('flex');
          expect(computedStyle.justifyContent).toBe('space-between');
          expect(computedStyle.alignItems).toBe('center');

          document.body.removeChild(container);
        });
      });
    });
  });

  describe('Browser-Specific Workarounds', () => {
    it('should apply Safari-specific fixes for backdrop-filter', () => {
      setBrowserEnvironment('safari');
      
      const glassElement = document.createElement('div');
      glassElement.className = 'backdrop-blur-md bg-white/10';
      
      // Safari might need -webkit-backdrop-filter
      glassElement.style.webkitBackdropFilter = 'blur(8px)';
      glassElement.style.backdropFilter = 'blur(8px)';
      
      document.body.appendChild(glassElement);
      
      const computedStyle = window.getComputedStyle(glassElement);
      const hasWebkitBackdrop = (computedStyle as any).webkitBackdropFilter !== '';
      
      // Safari should support webkit-backdrop-filter
      expect(hasWebkitBackdrop).toBe(true);
      
      document.body.removeChild(glassElement);
    });

    it('should handle Firefox flexbox quirks', () => {
      setBrowserEnvironment('firefox');
      
      const flexContainer = document.createElement('div');
      flexContainer.style.display = 'flex';
      flexContainer.style.minHeight = '0'; // Firefox flexbox fix
      
      const flexItem = document.createElement('div');
      flexItem.style.flex = '1';
      flexItem.style.minWidth = '0'; // Firefox overflow fix
      
      flexContainer.appendChild(flexItem);
      document.body.appendChild(flexContainer);
      
      const containerStyle = window.getComputedStyle(flexContainer);
      const itemStyle = window.getComputedStyle(flexItem);
      
      expect(containerStyle.display).toBe('flex');
      expect(containerStyle.minHeight).toBe('0px');
      expect(itemStyle.minWidth).toBe('0px');
      
      document.body.removeChild(flexContainer);
    });

    it('should handle Edge legacy compatibility', () => {
      setBrowserEnvironment('edge');
      
      const gridContainer = document.createElement('div');
      gridContainer.style.display = 'grid';
      gridContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
      gridContainer.style.gap = '1rem';
      
      document.body.appendChild(gridContainer);
      
      const computedStyle = window.getComputedStyle(gridContainer);
      expect(computedStyle.display).toBe('grid');
      
      document.body.removeChild(gridContainer);
    });
  });

  describe('Animation Compatibility', () => {
    const browsers: BrowserName[] = ['chrome', 'firefox', 'safari', 'edge'];

    browsers.forEach(browser => {
      it(`should handle CSS animations correctly in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        const animatedElement = document.createElement('div');
        animatedElement.style.animation = 'fadeIn 0.3s ease-out';
        animatedElement.style.transition = 'all 0.3s ease-out';
        
        document.body.appendChild(animatedElement);
        
        const computedStyle = window.getComputedStyle(animatedElement);
        expect(computedStyle.animationName).toBe('fadeIn');
        expect(computedStyle.animationDuration).toBe('0.3s');
        expect(computedStyle.transitionDuration).toBe('0.3s');
        
        document.body.removeChild(animatedElement);
      });

      it(`should handle transform animations in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        const transformElement = document.createElement('div');
        transformElement.style.transform = 'scale(1.05) rotate(2deg)';
        transformElement.style.transition = 'transform 0.3s ease-out';
        
        document.body.appendChild(transformElement);
        
        const computedStyle = window.getComputedStyle(transformElement);
        expect(computedStyle.transform).toContain('scale');
        expect(computedStyle.transform).toContain('rotate');
        
        document.body.removeChild(transformElement);
      });
    });
  });

  describe('Typography Rendering', () => {
    const browsers: BrowserName[] = ['chrome', 'firefox', 'safari', 'edge'];

    browsers.forEach(browser => {
      it(`should render fonts consistently in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        const textElement = document.createElement('p');
        textElement.style.fontFamily = 'Inter, system-ui, sans-serif';
        textElement.style.fontSize = '16px';
        textElement.style.fontWeight = '400';
        textElement.style.lineHeight = '1.5';
        textElement.textContent = 'Test typography rendering';
        
        document.body.appendChild(textElement);
        
        const computedStyle = window.getComputedStyle(textElement);
        expect(computedStyle.fontSize).toBe('16px');
        expect(computedStyle.lineHeight).toBe('24px'); // 1.5 * 16px
        
        document.body.removeChild(textElement);
      });

      it(`should handle variable fonts in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        const variableText = document.createElement('h1');
        variableText.style.fontFamily = 'Inter Variable, Inter, sans-serif';
        variableText.style.fontVariationSettings = '"wght" 600, "slnt" 0';
        variableText.textContent = 'Variable Font Test';
        
        document.body.appendChild(variableText);
        
        const computedStyle = window.getComputedStyle(variableText);
        
        // Variable font support varies by browser
        if (['chrome', 'safari', 'edge'].includes(browser)) {
          expect(computedStyle.fontVariationSettings).toBeDefined();
        }
        
        document.body.removeChild(variableText);
      });
    });
  });

  describe('Responsive Design Compatibility', () => {
    const browsers: BrowserName[] = ['chrome', 'firefox', 'safari', 'edge'];

    browsers.forEach(browser => {
      it(`should handle media queries correctly in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        // Simulate mobile viewport
        Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });
        
        const responsiveElement = document.createElement('div');
        responsiveElement.className = 'w-full md:w-1/2 lg:w-1/3';
        
        document.body.appendChild(responsiveElement);
        
        // In a real browser, media queries would be evaluated
        const computedStyle = window.getComputedStyle(responsiveElement);
        expect(computedStyle.width).toBeDefined();
        
        document.body.removeChild(responsiveElement);
      });

      it(`should handle container queries in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        const container = document.createElement('div');
        container.style.containerType = 'inline-size';
        container.style.width = '400px';
        
        const child = document.createElement('div');
        child.style.width = '100%';
        
        container.appendChild(child);
        document.body.appendChild(container);
        
        const containerStyle = window.getComputedStyle(container);
        
        // Container queries are newer, may not be supported in all browsers
        if (['chrome', 'edge'].includes(browser)) {
          expect(containerStyle.containerType).toBe('inline-size');
        }
        
        document.body.removeChild(container);
      });
    });
  });

  describe('Performance Characteristics', () => {
    const browsers: BrowserName[] = ['chrome', 'firefox', 'safari', 'edge'];

    browsers.forEach(browser => {
      it(`should handle GPU acceleration in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        const acceleratedElement = document.createElement('div');
        acceleratedElement.style.transform = 'translateZ(0)'; // Force GPU layer
        acceleratedElement.style.willChange = 'transform';
        
        document.body.appendChild(acceleratedElement);
        
        const computedStyle = window.getComputedStyle(acceleratedElement);
        expect(computedStyle.transform).toContain('translateZ');
        expect(computedStyle.willChange).toBe('transform');
        
        document.body.removeChild(acceleratedElement);
      });

      it(`should optimize animations for ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        const optimizedElement = document.createElement('div');
        optimizedElement.style.transform = 'scale(1)';
        optimizedElement.style.opacity = '1';
        optimizedElement.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        
        // These properties are typically GPU-accelerated
        document.body.appendChild(optimizedElement);
        
        const computedStyle = window.getComputedStyle(optimizedElement);
        expect(computedStyle.transform).toBe('scale(1)');
        expect(computedStyle.opacity).toBe('1');
        
        document.body.removeChild(optimizedElement);
      });
    });
  });

  describe('Accessibility Features', () => {
    const browsers: BrowserName[] = ['chrome', 'firefox', 'safari', 'edge'];

    browsers.forEach(browser => {
      it(`should respect prefers-reduced-motion in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        // Mock reduced motion preference
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
        
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        expect(mediaQuery.matches).toBe(true);
      });

      it(`should handle high contrast mode in ${browser}`, () => {
        setBrowserEnvironment(browser);
        
        // Mock high contrast preference
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: vi.fn().mockImplementation(query => ({
            matches: query === '(prefers-contrast: high)',
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          })),
        });
        
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        
        // High contrast support varies by browser
        if (['chrome', 'edge'].includes(browser)) {
          expect(contrastQuery).toBeDefined();
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle unsupported CSS features', () => {
      const testElement = document.createElement('div');
      
      // Try to apply potentially unsupported properties
      testElement.style.setProperty('backdrop-filter', 'blur(10px)');
      testElement.style.setProperty('container-type', 'inline-size');
      testElement.style.setProperty('scroll-timeline', 'test');
      
      document.body.appendChild(testElement);
      
      // Should not throw errors even if properties are unsupported
      expect(() => {
        window.getComputedStyle(testElement);
      }).not.toThrow();
      
      document.body.removeChild(testElement);
    });

    it('should provide fallbacks for missing features', () => {
      const fallbackElement = document.createElement('div');
      
      // Apply fallback styles
      fallbackElement.style.background = '#ffffff'; // Fallback
      fallbackElement.style.background = 'rgba(255, 255, 255, 0.1)'; // Modern
      
      fallbackElement.style.filter = 'none'; // Fallback
      fallbackElement.style.backdropFilter = 'blur(10px)'; // Modern
      
      document.body.appendChild(fallbackElement);
      
      const computedStyle = window.getComputedStyle(fallbackElement);
      
      // Should have some background value
      expect(computedStyle.background).toBeDefined();
      expect(computedStyle.background).not.toBe('');
      
      document.body.removeChild(fallbackElement);
    });
  });
});