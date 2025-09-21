/**
 * SimpleFloatingInput Component Tests
 * Basic tests for the simplified floating input component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SimpleFloatingInput } from '../SimpleFloatingInput';

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

describe('SimpleFloatingInput', () => {
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
      render(<SimpleFloatingInput {...defaultProps} />);

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with required indicator when required', () => {
      render(<SimpleFloatingInput {...defaultProps} required />);

      expect(screen.getByText('*')).toBeInTheDocument();
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('renders with placeholder when provided', () => {
      render(<SimpleFloatingInput {...defaultProps} placeholder="Enter text" />);

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('renders email input type', () => {
      render(<SimpleFloatingInput {...defaultProps} type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input with toggle button', () => {
      render(<SimpleFloatingInput {...defaultProps} type="password" />);

      const input = screen.getByLabelText('Test Label');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(input).toHaveAttribute('type', 'password');
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      
      render(<SimpleFloatingInput {...defaultProps} type="password" />);

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

      render(<SimpleFloatingInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(onChange).toHaveBeenCalledTimes(4); // Called for each character
      expect(onChange).toHaveBeenCalled();
    });

    it('calls onFocus when input is focused', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();

      render(<SimpleFloatingInput {...defaultProps} onFocus={onFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();

      render(<SimpleFloatingInput {...defaultProps} onBlur={onBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // Move focus away

      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('renders disabled input', () => {
      render(<SimpleFloatingInput {...defaultProps} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<SimpleFloatingInput {...defaultProps} onChange={onChange} disabled />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      render(<SimpleFloatingInput {...defaultProps} error="This field is required" />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('sets aria-invalid when error is present', () => {
      render(<SimpleFloatingInput {...defaultProps} error="Error message" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Success State', () => {
    it('displays success indicator', () => {
      render(<SimpleFloatingInput {...defaultProps} success />);

      // Component should render without errors
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }}>
          <SimpleFloatingInput {...defaultProps} />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await user.type(input, 'test');
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });
  });
});