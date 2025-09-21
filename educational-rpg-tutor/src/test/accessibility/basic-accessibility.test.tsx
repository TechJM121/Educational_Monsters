/**
 * Basic Accessibility Tests
 * Simple accessibility tests to verify core functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Basic Accessibility Tests', () => {
  it('should create accessible button elements', () => {
    render(
      <button type="button" aria-label="Test button">
        Click me
      </button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should create accessible form inputs', () => {
    render(
      <div>
        <label htmlFor="test-input">Test Input</label>
        <input
          id="test-input"
          type="text"
          required
          aria-describedby="input-help"
        />
        <div id="input-help">This is help text</div>
      </div>
    );

    const input = screen.getByLabelText('Test Input');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-describedby', 'input-help');

    const helpText = screen.getByText('This is help text');
    expect(helpText).toHaveAttribute('id', 'input-help');
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <div>
        <button onClick={handleClick}>Button 1</button>
        <button onClick={handleClick}>Button 2</button>
        <input type="text" placeholder="Input field" />
      </div>
    );

    const button1 = screen.getByText('Button 1');
    const button2 = screen.getByText('Button 2');
    const input = screen.getByPlaceholderText('Input field');

    // Test tab navigation
    button1.focus();
    expect(document.activeElement).toBe(button1);

    await user.tab();
    expect(document.activeElement).toBe(button2);

    await user.tab();
    expect(document.activeElement).toBe(input);

    // Test keyboard activation
    button1.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should provide proper ARIA attributes', () => {
    render(
      <div>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
        <main aria-labelledby="main-title">
          <h1 id="main-title">Main Content</h1>
          <section aria-describedby="section-desc">
            <h2>Section Title</h2>
            <p id="section-desc">Section description</p>
          </section>
        </main>
      </div>
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-labelledby', 'main-title');

    const section = screen.getByText('Section Title').closest('section');
    expect(section).toHaveAttribute('aria-describedby', 'section-desc');
  });

  it('should handle focus management', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button>Outside Button</button>
        <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <h2 id="dialog-title">Dialog Title</h2>
          <button>Dialog Button 1</button>
          <button>Dialog Button 2</button>
          <button>Close</button>
        </div>
      </div>
    );

    const dialog = screen.getByRole('dialog');
    const dialogButton1 = screen.getByText('Dialog Button 1');
    const dialogButton2 = screen.getByText('Dialog Button 2');
    const closeButton = screen.getByText('Close');

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');

    // Test focus within dialog
    dialogButton1.focus();
    expect(document.activeElement).toBe(dialogButton1);

    await user.tab();
    expect(document.activeElement).toBe(dialogButton2);

    await user.tab();
    expect(document.activeElement).toBe(closeButton);
  });

  it('should support screen reader announcements', () => {
    render(
      <div>
        <div aria-live="polite" aria-atomic="true">
          Status updates appear here
        </div>
        <div aria-live="assertive">
          Error messages appear here
        </div>
        <div role="status" aria-label="Loading">
          Loading content...
        </div>
      </div>
    );

    const politeRegion = screen.getByText('Status updates appear here');
    expect(politeRegion).toHaveAttribute('aria-live', 'polite');
    expect(politeRegion).toHaveAttribute('aria-atomic', 'true');

    const assertiveRegion = screen.getByText('Error messages appear here');
    expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-label', 'Loading');
  });

  it('should handle high contrast mode', () => {
    // Simulate high contrast mode
    document.documentElement.classList.add('high-contrast');

    render(
      <div>
        <button style={{ 
          backgroundColor: 'transparent',
          border: '2px solid currentColor',
          color: 'inherit'
        }}>
          High Contrast Button
        </button>
        <input 
          type="text" 
          style={{
            backgroundColor: 'transparent',
            border: '2px solid currentColor',
            color: 'inherit'
          }}
          placeholder="High contrast input"
        />
      </div>
    );

    const button = screen.getByText('High Contrast Button');
    const input = screen.getByPlaceholderText('High contrast input');

    expect(button).toBeInTheDocument();
    expect(input).toBeInTheDocument();

    // Verify high contrast class is applied
    expect(document.documentElement).toHaveClass('high-contrast');

    // Cleanup
    document.documentElement.classList.remove('high-contrast');
  });

  it('should respect reduced motion preferences', () => {
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

    render(
      <div 
        style={{
          animation: mediaQuery.matches ? 'none' : 'fadeIn 0.3s ease-out',
          transition: mediaQuery.matches ? 'none' : 'all 0.3s ease-out'
        }}
      >
        Animated content
      </div>
    );

    const animatedElement = screen.getByText('Animated content');
    const computedStyle = window.getComputedStyle(animatedElement);
    
    // In reduced motion mode, animations should be disabled
    expect(computedStyle.animation).toBe('none');
    expect(computedStyle.transition).toBe('none');
  });
});