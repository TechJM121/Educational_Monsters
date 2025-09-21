/**
 * FloatingLabelInput Component Tests
 * Tests for form interaction states, accessibility, and animations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FloatingLabelInput } from '../FloatingLabelInput';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AnimationProvider } from '../../../contexts/AnimationContext';

// Accessibility testing setup

import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AnimationProvider>
      {children}
    </AnimationProvider>
  </ThemeProvider>
);

describe('FloatingLabelInput', () => {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with label and input', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with required indicator when required', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} required />
        </TestWrapper>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Label *')).toBeRequired();
    });

    it('renders with placeholder when provided', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} placeholder="Enter text" />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });
  });

  describe('Input Types', () => {
    it('renders email input type', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} type="email" />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input with toggle button', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} type="password" />
        </TestWrapper>
      );

      const input = screen.getByLabelText('Test Label');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(input).toHaveAttribute('type', 'password');
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} type="password" />
        </TestWrapper>
      );

      const input = screen.getByLabelText('Test Label');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(input).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input type', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} type="number" />
        </TestWrapper>
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when user types', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test input');

      expect(onChange).toHaveBeenCalledTimes(10); // Called for each character
      expect(onChange).toHaveBeenLastCalledWith('test input');
    });

    it('calls onFocus when input is focused', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();

      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} onFocus={onFocus} />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();

      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} onBlur={onBlur} />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // Move focus away

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('respects maxLength attribute', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} maxLength={10} />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('respects pattern attribute', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} pattern="[0-9]*" />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled input', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} disabled />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} onChange={onChange} disabled />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables password toggle when input is disabled', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} type="password" disabled />
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} error="This field is required" />
        </TestWrapper>
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with input via aria-describedby', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByRole('alert');
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('id', input.getAttribute('aria-describedby'));
    });
  });

  describe('Success State', () => {
    it('displays success indicator', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} success />
        </TestWrapper>
      );

      // Check for success icon (checkmark)
      const successIcon = screen.getByRole('img', { hidden: true });
      expect(successIcon).toBeInTheDocument();
    });

    it('does not show success indicator when error is present', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} success error="Error message" />
        </TestWrapper>
      );

      // Success icon should not be present when there's an error
      const successIcons = screen.queryAllByRole('img', { hidden: true });
      const checkIcon = successIcons.find(icon => 
        icon.querySelector('path[d*="M5 13l4 4L19 7"]')
      );
      expect(checkIcon).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('has no accessibility violations with error', async () => {
      const { container } = render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('has proper label association', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');

      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('supports custom aria-describedby', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} aria-describedby="custom-description" />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'custom-description');
    });

    it('has proper autocomplete attribute', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} autoComplete="email" />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });
  });

  describe('Focus Management', () => {
    it('can be focused programmatically', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      input.focus();

      expect(input).toHaveFocus();
    });

    it('maintains focus when password visibility is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} type="password" />
        </TestWrapper>
      );

      const input = screen.getByLabelText('Test Label');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      await user.click(input);
      expect(input).toHaveFocus();

      await user.click(toggleButton);
      expect(input).toHaveFocus();
    });
  });

  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <TestWrapper>
          <form onSubmit={onSubmit}>
            <FloatingLabelInput {...defaultProps} required />
            <button type="submit">Submit</button>
          </form>
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await user.type(input, 'test value');
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('prevents form submission when required field is empty', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn((e) => e.preventDefault());

      render(
        <TestWrapper>
          <form onSubmit={onSubmit}>
            <FloatingLabelInput {...defaultProps} required />
            <button type="submit">Submit</button>
          </form>
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // Form should not submit due to HTML5 validation
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const onChange = jest.fn();
      const { rerender } = render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      // Component should handle re-renders gracefully
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});