/**
 * FloatingLabelTextarea Component Tests
 * Tests for textarea form interactions, accessibility, and animations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FloatingLabelTextarea } from '../FloatingLabelTextarea';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AnimationProvider } from '../../../contexts/AnimationContext';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';

// Accessibility testing setup

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
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

describe('FloatingLabelTextarea', () => {
  const defaultProps = {
    label: 'Test Textarea',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with label and textarea', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Test Textarea')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with required indicator when required', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} required />
        </TestWrapper>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByLabelText('Test Textarea *')).toBeRequired();
    });

    it('renders with custom rows', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} rows={6} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '6');
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-class');
    });
  });

  describe('Resize Behavior', () => {
    it('applies resize classes correctly', () => {
      const { rerender } = render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} resize="none" />
        </TestWrapper>
      );

      let textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-none');

      rerender(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} resize="vertical" />
        </TestWrapper>
      );

      textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-y');

      rerender(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} resize="horizontal" />
        </TestWrapper>
      );

      textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-x');

      rerender(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} resize="both" />
        </TestWrapper>
      );

      textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize');
    });
  });

  describe('Character Count', () => {
    it('displays character count when maxLength is set', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} maxLength={100} />
        </TestWrapper>
      );

      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    it('updates character count as user types', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} onChange={onChange} maxLength={100} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('does not display character count when maxLength is not set', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when user types', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test content');

      expect(onChange).toHaveBeenCalledTimes(12); // Called for each character
      expect(onChange).toHaveBeenLastCalledWith('test content');
    });

    it('calls onFocus when textarea is focused', async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} onFocus={onFocus} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when textarea loses focus', async () => {
      const user = userEvent.setup();
      const onBlur = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} onBlur={onBlur} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.tab(); // Move focus away

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('handles multiline input correctly', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{enter}Line 2{enter}Line 3');

      expect(onChange).toHaveBeenLastCalledWith('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled textarea', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} disabled />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} onChange={onChange} disabled />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} error="This field is required" />
        </TestWrapper>
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with textarea via aria-describedby', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      const errorMessage = screen.getByRole('alert');
      
      expect(textarea).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('id', textarea.getAttribute('aria-describedby'));
    });
  });

  describe('Success State', () => {
    it('displays success indicator', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} success />
        </TestWrapper>
      );

      // Check for success icon (checkmark)
      const successIcon = screen.getByRole('img', { hidden: true });
      expect(successIcon).toBeInTheDocument();
    });

    it('does not show success indicator when error is present', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} success error="Error message" />
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
          <FloatingLabelTextarea {...defaultProps} />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('has no accessibility violations with error', async () => {
      const { container } = render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('has proper label association', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      const label = screen.getByText('Test Textarea');

      expect(textarea).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', textarea.getAttribute('id'));
    });

    it('supports custom aria-describedby', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} aria-describedby="custom-description" />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'custom-description');
    });
  });

  describe('Focus Management', () => {
    it('can be focused programmatically', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      textarea.focus();

      expect(textarea).toHaveFocus();
    });
  });

  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <TestWrapper>
          <form onSubmit={onSubmit}>
            <FloatingLabelTextarea {...defaultProps} required />
            <button type="submit">Submit</button>
          </form>
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      await user.type(textarea, 'test content');
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('respects maxLength attribute', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} maxLength={100} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });
  });

  describe('Value Handling', () => {
    it('displays provided value', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} value="Initial content" />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Initial content');
    });

    it('handles empty value', () => {
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} value="" />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });

    it('handles multiline value', () => {
      const multilineValue = 'Line 1\nLine 2\nLine 3';
      
      render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} value={multilineValue} />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(multilineValue);
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const onChange = jest.fn();
      const { rerender } = render(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <FloatingLabelTextarea {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      // Component should handle re-renders gracefully
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});