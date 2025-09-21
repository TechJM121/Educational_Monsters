/**
 * Basic Visual Regression Test
 * Simple test to verify the testing infrastructure works
 */

import { describe, it, expect, vi } from 'vitest';

describe('Basic Visual Regression Setup', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should have access to DOM', () => {
    const element = document.createElement('div');
    element.textContent = 'Test';
    expect(element.textContent).toBe('Test');
  });

  it('should handle CSS styles', () => {
    const element = document.createElement('div');
    element.style.backgroundColor = 'red';
    element.style.padding = '10px';
    
    document.body.appendChild(element);
    
    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(computedStyle.padding).toBe('10px');
    
    document.body.removeChild(element);
  });

  it('should support viewport changes', () => {
    const originalWidth = window.innerWidth;
    
    Object.defineProperty(window, 'innerWidth', { 
      writable: true, 
      configurable: true, 
      value: 768 
    });
    
    expect(window.innerWidth).toBe(768);
    
    // Restore original
    Object.defineProperty(window, 'innerWidth', { 
      writable: true, 
      configurable: true, 
      value: originalWidth 
    });
  });

  it('should support media query mocking', () => {
    const mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    expect(mediaQuery.matches).toBe(true);

    const normalQuery = window.matchMedia('(min-width: 768px)');
    expect(normalQuery.matches).toBe(false);
  });
});