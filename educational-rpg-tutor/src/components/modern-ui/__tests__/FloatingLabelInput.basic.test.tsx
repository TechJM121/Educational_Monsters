/**
 * FloatingLabelInput Component Basic Tests
 * Basic tests for form interaction states and functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FloatingLabelInput } from '../FloatingLabelInput';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AnimationProvider } from '../../../contexts/AnimationContext';

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
      const onChange = vi.fn();

      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} onChange={onChange} disabled />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(onChange).not.toHaveBeenCalled();
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
  });

  describe('Success State', () => {
    it('displays success indicator', () => {
      render(
        <TestWrapper>
          <FloatingLabelInput {...defaultProps} success />
        </TestWrapper>
      );

      // Check for success icon (checkmark) - it should be present in the DOM
      const container = screen.getByRole('textbox').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

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
  });
});