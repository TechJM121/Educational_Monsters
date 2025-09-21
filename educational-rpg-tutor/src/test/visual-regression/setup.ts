/**
 * Visual Regression Testing Setup
 * Provides utilities for comprehensive visual testing of modern UI components
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AnimationProvider } from '../../contexts/AnimationContext';
import { LoadingProvider } from '../../contexts/LoadingContext';

// Test viewport configurations
export const VIEWPORTS = {
  mobile: { width: 320, height: 568 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  wide: { width: 1440, height: 900 },
  ultrawide: { width: 1920, height: 1080 }
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

// Component states for testing
export const COMPONENT_STATES = {
  default: {},
  hover: { 'data-testid': 'hovered' },
  focus: { 'data-testid': 'focused' },
  active: { 'data-testid': 'active' },
  disabled: { disabled: true },
  loading: { 'data-testid': 'loading' },
  error: { 'data-testid': 'error' }
} as const;

export type ComponentState = keyof typeof COMPONENT_STATES;

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  viewport?: ViewportName;
  reducedMotion?: boolean;
  highContrast?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    viewport = 'desktop',
    reducedMotion = false,
    highContrast = false,
    ...renderOptions
  } = options;

  // Set viewport
  if (viewport) {
    const { width, height } = VIEWPORTS[viewport];
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
    window.dispatchEvent(new Event('resize'));
  }

  // Set motion preferences
  if (reducedMotion) {
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
  }

  // Set high contrast preferences
  if (highContrast) {
    document.documentElement.classList.add('high-contrast');
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider>
        <AnimationProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </AnimationProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Visual regression test utilities
export class VisualRegressionTester {
  private snapshots: Map<string, string> = new Map();

  async captureSnapshot(
    element: HTMLElement,
    testName: string,
    options: {
      viewport?: ViewportName;
      state?: ComponentState;
    } = {}
  ): Promise<string> {
    const { viewport = 'desktop', state = 'default' } = options;
    
    // Generate unique key for this test configuration
    const key = `${testName}-${viewport}-${state}`;
    
    // In a real implementation, this would capture actual visual snapshots
    // For now, we'll simulate by capturing element properties
    const snapshot = this.generateElementSnapshot(element);
    this.snapshots.set(key, snapshot);
    
    return snapshot;
  }

  private generateElementSnapshot(element: HTMLElement): string {
    const computedStyle = window.getComputedStyle(element);
    const snapshot = {
      tagName: element.tagName,
      className: element.className,
      textContent: element.textContent?.trim(),
      styles: {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        borderRadius: computedStyle.borderRadius,
        boxShadow: computedStyle.boxShadow,
        transform: computedStyle.transform,
        opacity: computedStyle.opacity,
        backdropFilter: computedStyle.backdropFilter
      },
      dimensions: {
        width: element.offsetWidth,
        height: element.offsetHeight
      },
      position: {
        top: element.offsetTop,
        left: element.offsetLeft
      }
    };
    
    return JSON.stringify(snapshot, null, 2);
  }

  compareSnapshots(current: string, baseline: string): boolean {
    return current === baseline;
  }

  getSnapshot(key: string): string | undefined {
    return this.snapshots.get(key);
  }

  getAllSnapshots(): Map<string, string> {
    return new Map(this.snapshots);
  }
}

// Cross-browser testing utilities
export const BROWSER_CONFIGS = {
  chrome: {
    name: 'Chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  firefox: {
    name: 'Firefox',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
  },
  safari: {
    name: 'Safari',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  },
  edge: {
    name: 'Edge',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  }
} as const;

export type BrowserName = keyof typeof BROWSER_CONFIGS;

export function setBrowserEnvironment(browser: BrowserName) {
  const config = BROWSER_CONFIGS[browser];
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: config.userAgent
  });
}

// Animation testing utilities
export function waitForAnimations(element: HTMLElement, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkAnimations() {
      const animations = element.getAnimations();
      
      if (animations.length === 0) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('Animation timeout'));
        return;
      }
      
      requestAnimationFrame(checkAnimations);
    }
    
    checkAnimations();
  });
}

export function mockAnimationFrame() {
  let callbacks: FrameRequestCallback[] = [];
  let id = 0;
  
  const mockRAF = vi.fn((callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return ++id;
  });
  
  const mockCAF = vi.fn((id: number) => {
    // Remove callback by id if needed
  });
  
  const flush = () => {
    const currentCallbacks = [...callbacks];
    callbacks = [];
    currentCallbacks.forEach(callback => callback(performance.now()));
  };
  
  Object.defineProperty(window, 'requestAnimationFrame', { value: mockRAF });
  Object.defineProperty(window, 'cancelAnimationFrame', { value: mockCAF });
  
  return { flush, mockRAF, mockCAF };
}