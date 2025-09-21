/**
 * Keyboard Navigation and Focus Management Tests
 * Comprehensive testing of keyboard accessibility patterns
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../visual-regression/setup';

// Import components for keyboard testing
import { GlassCard } from '../../components/modern-ui/GlassCard';
import { GlassButton } from '../../components/modern-ui/GlassButton';
import { GlassModal } from '../../components/modern-ui/GlassModal';
import { FloatingLabelInput } from '../../components/modern-ui/FloatingLabelInput';
import { FloatingLabelSelect } from '../../components/modern-ui/FloatingLabelSelect';
import { FloatingLabelTextarea } from '../../components/modern-ui/FloatingLabelTextarea';
import { ResponsiveGrid } from '../../components/modern-ui/ResponsiveGrid';

describe('Keyboard Navigation Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    document.body.innerHTML = '';
    document.documentElement.className = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Tab Order Management', () => {
    it('should maintain proper tab order in complex layouts', async () => {
      renderWithProviders(
        <div>
          <header>
            <a href="#main" className="skip-link">Skip to main</a>
            <nav>
              <a href="#nav1" tabIndex={0}>Nav 1</a>
              <a href="#nav2" tabIndex={0}>Nav 2</a>
            </nav>
          </header>
          <main id="main" tabIndex={-1}>
            <section>
              <h2>Form Section</h2>
              <FloatingLabelInput label="First Input" />
              <FloatingLabelSelect
                label="Select Input"
                options={[
                  { value: '1', label: 'Option 1' },
                  { value: '2', label: 'Option 2' }
                ]}
              />
              <FloatingLabelTextarea label="Textarea Input" />
              <div>
                <GlassButton>Submit</GlassButton>
                <GlassButton>Cancel</GlassButton>
              </div>
            </section>
          </main>
        </div>
      );

      // Get all focusable elements in expected order
      const skipLink = screen.getByText('Skip to main');
      const nav1 = screen.getByText('Nav 1');
      const nav2 = screen.getByText('Nav 2');
      const firstInput = screen.getByLabelText('First Input');
      const selectInput = screen.getByLabelText('Select Input');
      const textareaInput = screen.getByLabelText('Textarea Input');
      const submitButton = screen.getByText('Submit');
      const cancelButton = screen.getByText('Cancel');

      // Start from skip link
      skipLink.focus();
      expect(document.activeElement).toBe(skipLink);

      // Tab through navigation
      await user.tab();
      expect(document.activeElement).toBe(nav1);

      await user.tab();
      expect(document.activeElement).toBe(nav2);

      // Tab to form elements
      await user.tab();
      expect(document.activeElement).toBe(firstInput);

      await user.tab();
      expect(document.activeElement).toBe(selectInput);

      await user.tab();
      expect(document.activeElement).toBe(textareaInput);

      await user.tab();
      expect(document.activeElement).toBe(submitButton);

      await user.tab();
      expect(document.activeElement).toBe(cancelButton);

      // Test reverse tab order
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(submitButton);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(textareaInput);
    });

    it('should handle dynamic content insertion', async () => {
      const DynamicContent = () => {
        const [showExtra, setShowExtra] = React.useState(false);

        return (
          <div>
            <GlassButton onClick={() => setShowExtra(!showExtra)}>
              Toggle Content
            </GlassButton>
            <FloatingLabelInput label="Always Visible" />
            {showExtra && (
              <div>
                <FloatingLabelInput label="Dynamic Input" />
                <GlassButton>Dynamic Button</GlassButton>
              </div>
            )}
            <GlassButton>Last Button</GlassButton>
          </div>
        );
      };

      renderWithProviders(<DynamicContent />);

      const toggleButton = screen.getByText('Toggle Content');
      const alwaysVisible = screen.getByLabelText('Always Visible');
      const lastButton = screen.getByText('Last Button');

      // Initial tab order
      toggleButton.focus();
      await user.tab();
      expect(document.activeElement).toBe(alwaysVisible);

      await user.tab();
      expect(document.activeElement).toBe(lastButton);

      // Add dynamic content
      toggleButton.focus();
      await user.click(toggleButton);

      // Verify new elements are in tab order
      const dynamicInput = screen.getByLabelText('Dynamic Input');
      const dynamicButton = screen.getByText('Dynamic Button');

      toggleButton.focus();
      await user.tab();
      expect(document.activeElement).toBe(alwaysVisible);

      await user.tab();
      expect(document.activeElement).toBe(dynamicInput);

      await user.tab();
      expect(document.activeElement).toBe(dynamicButton);

      await user.tab();
      expect(document.activeElement).toBe(lastButton);
    });

    it('should skip disabled elements in tab order', async () => {
      renderWithProviders(
        <div>
          <GlassButton>Enabled 1</GlassButton>
          <GlassButton disabled>Disabled</GlassButton>
          <FloatingLabelInput label="Enabled Input" />
          <FloatingLabelInput label="Disabled Input" disabled />
          <GlassButton>Enabled 2</GlassButton>
        </div>
      );

      const enabled1 = screen.getByText('Enabled 1');
      const enabledInput = screen.getByLabelText('Enabled Input');
      const enabled2 = screen.getByText('Enabled 2');

      enabled1.focus();
      expect(document.activeElement).toBe(enabled1);

      // Should skip disabled button
      await user.tab();
      expect(document.activeElement).toBe(enabledInput);

      // Should skip disabled input
      await user.tab();
      expect(document.activeElement).toBe(enabled2);

      // Reverse should also skip disabled elements
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(enabledInput);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(enabled1);
    });
  });

  describe('Focus Trapping', () => {
    it('should trap focus within modal dialogs', async () => {
      const ModalTest = () => {
        const [isOpen, setIsOpen] = React.useState(true);

        return (
          <div>
            <GlassButton>Outside Button</GlassButton>
            <GlassModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
              <div>
                <h2>Modal Title</h2>
                <FloatingLabelInput label="Modal Input" />
                <GlassButton>Modal Button 1</GlassButton>
                <GlassButton onClick={() => setIsOpen(false)}>
                  Close Modal
                </GlassButton>
              </div>
            </GlassModal>
          </div>
        );
      };

      renderWithProviders(<ModalTest />);

      // Modal elements should be in DOM
      const modalInput = screen.getByLabelText('Modal Input');
      const modalButton1 = screen.getByText('Modal Button 1');
      const closeButton = screen.getByText('Close Modal');

      // Focus should start within modal
      expect(document.activeElement).toBe(modalInput);

      // Tab should cycle within modal
      await user.tab();
      expect(document.activeElement).toBe(modalButton1);

      await user.tab();
      expect(document.activeElement).toBe(closeButton);

      // Tab should cycle back to first element
      await user.tab();
      expect(document.activeElement).toBe(modalInput);

      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(closeButton);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(modalButton1);
    });

    it('should restore focus when modal closes', async () => {
      const ModalTest = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <GlassButton onClick={() => setIsOpen(true)}>
              Open Modal
            </GlassButton>
            <GlassModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
              <div>
                <h2>Modal Content</h2>
                <GlassButton onClick={() => setIsOpen(false)}>
                  Close
                </GlassButton>
              </div>
            </GlassModal>
          </div>
        );
      };

      renderWithProviders(<ModalTest />);

      const openButton = screen.getByText('Open Modal');
      
      // Focus and open modal
      openButton.focus();
      expect(document.activeElement).toBe(openButton);

      await user.click(openButton);

      // Modal should be open and focused
      await waitFor(() => {
        const closeButton = screen.getByText('Close');
        expect(closeButton).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      // Focus should return to open button
      await waitFor(() => {
        expect(document.activeElement).toBe(openButton);
      });
    });
  });

  describe('Keyboard Event Handling', () => {
    it('should handle Enter and Space keys for buttons', async () => {
      const handleClick = vi.fn();

      renderWithProviders(
        <GlassButton onClick={handleClick}>
          Test Button
        </GlassButton>
      );

      const button = screen.getByText('Test Button');
      button.focus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Test Space key
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);

      // Test that other keys don't trigger click
      await user.keyboard('{ArrowDown}');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should handle Escape key for modal dismissal', async () => {
      const handleClose = vi.fn();

      renderWithProviders(
        <GlassModal isOpen={true} onClose={handleClose}>
          <div>
            <h2>Modal Content</h2>
            <GlassButton>Modal Button</GlassButton>
          </div>
        </GlassModal>
      );

      const modalButton = screen.getByText('Modal Button');
      modalButton.focus();

      // Test Escape key
      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should handle arrow keys for select navigation', async () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ];

      const handleChange = vi.fn();

      renderWithProviders(
        <FloatingLabelSelect
          label="Test Select"
          options={options}
          onChange={handleChange}
        />
      );

      const select = screen.getByLabelText('Test Select') as HTMLSelectElement;
      select.focus();

      // Test arrow key navigation
      await user.keyboard('{ArrowDown}');
      expect(select.value).toBe('option1');

      await user.keyboard('{ArrowDown}');
      expect(select.value).toBe('option2');

      await user.keyboard('{ArrowUp}');
      expect(select.value).toBe('option1');

      // Test Home and End keys
      await user.keyboard('{End}');
      expect(select.value).toBe('option3');

      await user.keyboard('{Home}');
      expect(select.value).toBe('option1');
    });

    it('should handle custom keyboard shortcuts', async () => {
      const handleSave = vi.fn();
      const handleCancel = vi.fn();

      const KeyboardShortcutTest = () => {
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
              e.preventDefault();
              handleSave();
            }
            if (e.key === 'Escape') {
              handleCancel();
            }
          };

          document.addEventListener('keydown', handleKeyDown);
          return () => document.removeEventListener('keydown', handleKeyDown);
        }, []);

        return (
          <div>
            <h2>Keyboard Shortcuts Test</h2>
            <p>Press Ctrl+S to save, Escape to cancel</p>
            <FloatingLabelInput label="Test Input" />
          </div>
        );
      };

      renderWithProviders(<KeyboardShortcutTest />);

      const input = screen.getByLabelText('Test Input');
      input.focus();

      // Test Ctrl+S shortcut
      await user.keyboard('{Control>}s{/Control}');
      expect(handleSave).toHaveBeenCalledTimes(1);

      // Test Escape shortcut
      await user.keyboard('{Escape}');
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Indicators', () => {
    it('should provide visible focus indicators', async () => {
      renderWithProviders(
        <div>
          <GlassButton>Button 1</GlassButton>
          <GlassButton>Button 2</GlassButton>
          <FloatingLabelInput label="Input Field" />
        </div>
      );

      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2');
      const input = screen.getByLabelText('Input Field');

      // Test focus indicators are present
      button1.focus();
      expect(button1).toHaveFocus();
      
      const button1Style = window.getComputedStyle(button1);
      expect(button1Style.outline).not.toBe('none');

      button2.focus();
      expect(button2).toHaveFocus();

      input.focus();
      expect(input).toHaveFocus();
      
      const inputStyle = window.getComputedStyle(input);
      expect(inputStyle.outline).not.toBe('none');
    });

    it('should maintain focus indicators in high contrast mode', async () => {
      document.documentElement.classList.add('high-contrast');

      renderWithProviders(
        <div>
          <GlassButton>High Contrast Button</GlassButton>
          <FloatingLabelInput label="High Contrast Input" />
        </div>
      );

      const button = screen.getByText('High Contrast Button');
      const input = screen.getByLabelText('High Contrast Input');

      button.focus();
      expect(button).toHaveFocus();
      
      // In high contrast mode, focus indicators should be more prominent
      const buttonStyle = window.getComputedStyle(button);
      expect(buttonStyle.outline).not.toBe('none');

      input.focus();
      expect(input).toHaveFocus();

      document.documentElement.classList.remove('high-contrast');
    });

    it('should handle programmatic focus changes', async () => {
      const FocusTest = () => {
        const button1Ref = React.useRef<HTMLButtonElement>(null);
        const button2Ref = React.useRef<HTMLButtonElement>(null);

        const focusButton2 = () => {
          button2Ref.current?.focus();
        };

        return (
          <div>
            <GlassButton ref={button1Ref} onClick={focusButton2}>
              Focus Button 2
            </GlassButton>
            <GlassButton ref={button2Ref}>
              Button 2
            </GlassButton>
          </div>
        );
      };

      renderWithProviders(<FocusTest />);

      const button1 = screen.getByText('Focus Button 2');
      const button2 = screen.getByText('Button 2');

      button1.focus();
      expect(document.activeElement).toBe(button1);

      // Click should programmatically focus button 2
      await user.click(button1);
      expect(document.activeElement).toBe(button2);
    });
  });

  describe('Skip Links', () => {
    it('should implement functional skip links', async () => {
      renderWithProviders(
        <div>
          <a href="#main" className="skip-link" onClick={(e) => {
            e.preventDefault();
            const main = document.getElementById('main');
            main?.focus();
          }}>
            Skip to main content
          </a>
          <nav>
            <a href="#nav1">Nav Link 1</a>
            <a href="#nav2">Nav Link 2</a>
            <a href="#nav3">Nav Link 3</a>
          </nav>
          <main id="main" tabIndex={-1}>
            <h1>Main Content</h1>
            <GlassButton>First Main Button</GlassButton>
          </main>
        </div>
      );

      const skipLink = screen.getByText('Skip to main content');
      const mainContent = screen.getByRole('main');
      const firstButton = screen.getByText('First Main Button');

      // Focus skip link
      skipLink.focus();
      expect(document.activeElement).toBe(skipLink);

      // Activate skip link
      await user.click(skipLink);

      // Main content should receive focus
      expect(document.activeElement).toBe(mainContent);

      // Next tab should go to first interactive element
      await user.tab();
      expect(document.activeElement).toBe(firstButton);
    });

    it('should handle multiple skip links', async () => {
      renderWithProviders(
        <div>
          <div className="skip-links">
            <a href="#nav" onClick={(e) => {
              e.preventDefault();
              document.getElementById('nav')?.focus();
            }}>
              Skip to navigation
            </a>
            <a href="#main" onClick={(e) => {
              e.preventDefault();
              document.getElementById('main')?.focus();
            }}>
              Skip to main content
            </a>
            <a href="#footer" onClick={(e) => {
              e.preventDefault();
              document.getElementById('footer')?.focus();
            }}>
              Skip to footer
            </a>
          </div>
          <nav id="nav" tabIndex={-1}>
            <a href="#nav1">Nav 1</a>
          </nav>
          <main id="main" tabIndex={-1}>
            <h1>Main</h1>
          </main>
          <footer id="footer" tabIndex={-1}>
            <p>Footer</p>
          </footer>
        </div>
      );

      const skipToNav = screen.getByText('Skip to navigation');
      const skipToMain = screen.getByText('Skip to main content');
      const skipToFooter = screen.getByText('Skip to footer');

      const nav = screen.getByRole('navigation');
      const main = screen.getByRole('main');
      const footer = screen.getByRole('contentinfo');

      // Test each skip link
      skipToNav.focus();
      await user.click(skipToNav);
      expect(document.activeElement).toBe(nav);

      skipToMain.focus();
      await user.click(skipToMain);
      expect(document.activeElement).toBe(main);

      skipToFooter.focus();
      await user.click(skipToFooter);
      expect(document.activeElement).toBe(footer);
    });
  });
});