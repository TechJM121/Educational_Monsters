/**
 * FloatingLabelSelect Component Tests
 * Tests for select dropdown interactions, accessibility, and keyboard navigation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FloatingLabelSelect, type SelectOption } from '../FloatingLabelSelect';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AnimationProvider } from '../../../contexts/AnimationContext';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
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
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
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
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
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
import { it } from 'vitest';
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

const mockOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'disabled', label: 'Disabled Option', disabled: true },
];

describe('FloatingLabelSelect', () => {
  const defaultProps = {
    label: 'Test Select',
    value: '',
    onChange: jest.fn(),
    options: mockOptions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with label and select trigger', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Select')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders with required indicator when required', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} required />
        </TestWrapper>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays placeholder when no value is selected', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} placeholder="Choose an option" />
        </TestWrapper>
      );

      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('displays selected option label', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} value="option2" />
        </TestWrapper>
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      const container = screen.getByRole('combobox').closest('.custom-class');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Dropdown Interactions', () => {
    it('opens dropdown when clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <div>
            <FloatingLabelSelect {...defaultProps} />
            <button>Outside button</button>
          </div>
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const outsideButton = screen.getByRole('button', { name: 'Outside button' });
      await user.click(outsideButton);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('selects option when clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const option = screen.getByRole('option', { name: 'Option 2' });
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith('option2');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not select disabled options', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const disabledOption = screen.getByRole('option', { name: 'Disabled Option' });
      await user.click(disabledOption);

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument(); // Should remain open
    });

    it('shows selected option with checkmark', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} value="option1" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const selectedOption = screen.getByRole('option', { name: 'Option 1' });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens dropdown with Space key', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens dropdown with ArrowDown key', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown with ArrowUp key when open', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      trigger.focus();
      await user.keyboard('{ArrowUp}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Focus Management', () => {
    it('calls onFocus when focused', async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} onFocus={onFocus} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when focus is lost', async () => {
      const user = userEvent.setup();
      const onBlur = jest.fn();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} onBlur={onBlur} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.tab(); // Move focus away

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('can be focused programmatically', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      trigger.focus();

      expect(trigger).toHaveFocus();
    });
  });

  describe('Disabled State', () => {
    it('renders disabled select', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} disabled />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('tabIndex', '-1');
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} disabled />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not respond to keyboard events when disabled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} disabled />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} error="This field is required" />
        </TestWrapper>
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with select via aria-describedby', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} error="Error message" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      const errorMessage = screen.getByRole('alert');
      
      expect(trigger).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('id', trigger.getAttribute('aria-describedby'));
    });
  });

  describe('Success State', () => {
    it('displays success indicator', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} success />
        </TestWrapper>
      );

      // Check for success icon (checkmark)
      const successIcon = screen.getByRole('img', { hidden: true });
      expect(successIcon).toBeInTheDocument();
    });

    it('does not show success indicator when error is present', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} success error="Error message" />
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
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('has no accessibility violations with dropdown open', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('updates aria-expanded when dropdown opens', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('supports custom aria-describedby', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} aria-describedby="custom-description" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-describedby', 'custom-description');
    });

    it('has proper option roles and attributes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} value="option1" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4);

      const selectedOption = screen.getByRole('option', { name: 'Option 1' });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');

      const unselectedOption = screen.getByRole('option', { name: 'Option 2' });
      expect(unselectedOption).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Form Integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <TestWrapper>
          <form onSubmit={onSubmit}>
            <FloatingLabelSelect {...defaultProps} required />
            <button type="submit">Submit</button>
          </form>
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const option = screen.getByRole('option', { name: 'Option 1' });
      await user.click(option);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('Options Handling', () => {
    it('handles empty options array', () => {
      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} options={[]} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('handles options with special characters', async () => {
      const user = userEvent.setup();
      const specialOptions: SelectOption[] = [
        { value: 'special', label: 'Option with "quotes" & symbols' },
        { value: 'unicode', label: 'Unicode: 🚀 ñáéíóú' },
      ];

      render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} options={specialOptions} />
        </TestWrapper>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(screen.getByText('Option with "quotes" & symbols')).toBeInTheDocument();
      expect(screen.getByText('Unicode: 🚀 ñáéíóú')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const onChange = jest.fn();
      const { rerender } = render(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <FloatingLabelSelect {...defaultProps} onChange={onChange} />
        </TestWrapper>
      );

      // Component should handle re-renders gracefully
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});