/**
 * Manual Accessibility Testing Procedures
 * Comprehensive manual testing guidelines and automated verification
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../visual-regression/setup';

// Import components for manual testing
import { GlassCard } from '../../components/modern-ui/GlassCard';
import { GlassButton } from '../../components/modern-ui/GlassButton';
import { GlassModal } from '../../components/modern-ui/GlassModal';
import { FloatingLabelInput } from '../../components/modern-ui/FloatingLabelInput';
import { FloatingLabelSelect } from '../../components/modern-ui/FloatingLabelSelect';
import { ResponsiveGrid } from '../../components/modern-ui/ResponsiveGrid';

describe('Manual Accessibility Testing - Keyboard Navigation', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Tab Order and Focus Management', () => {
    it('should maintain logical tab order in complex layouts', async () => {
      const { container } = renderWithProviders(
        <div>
          <h1>Page Title</h1>
          <nav>
            <a href="#main">Skip to main content</a>
            <a href="#section1">Section 1</a>
            <a href="#section2">Section 2</a>
          </nav>
          <main id="main">
            <section id="section1">
              <h2>Section 1</h2>
              <GlassButton>Button 1</GlassButton>
              <FloatingLabelInput label="Input 1" />
            </section>
            <section id="section2">
              <h2>Section 2</h2>
              <GlassButton>Button 2</GlassButton>
              <FloatingLabelInput label="Input 2" />
            </section>
          </main>
        </div>
      );

      // Test tab order
      const skipLink = screen.getByText('Skip to main content');
      const section1Link = screen.getByText('Section 1');
      const section2Link = screen.getByText('Section 2');
      const button1 = screen.getByText('Button 1');
      const input1 = screen.getByLabelText('Input 1');
      const button2 = screen.getByText('Button 2');
      const input2 = screen.getByLabelText('Input 2');

      // Verify initial focus
      skipLink.focus();
      expect(document.activeElement).toBe(skipLink);

      // Tab through elements in order
      await user.tab();
      expect(document.activeElement).toBe(section1Link);

      await user.tab();
      expect(document.activeElement).toBe(section2Link);

      await user.tab();
      expect(document.activeElement).toBe(button1);

      await user.tab();
      expect(document.activeElement).toBe(input1);

      await user.tab();
      expect(document.activeElement).toBe(button2);

      await user.tab();
      expect(document.activeElement).toBe(input2);

      // Test reverse tab order
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(button2);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(input1);
    });

    it('should handle focus trapping in modals', async () => {
      let isOpen = true;
      const handleClose = () => { isOpen = false; };

      const { rerender } = renderWithProviders(
        <div>
          <GlassButton>Open Modal</GlassButton>
          <GlassModal isOpen={isOpen} onClose={handleClose}>
            <div>
              <h2>Modal Title</h2>
              <FloatingLabelInput label="Modal Input" />
              <GlassButton>Modal Button 1</GlassButton>
              <GlassButton onClick={handleClose}>Close</GlassButton>
            </div>
          </GlassModal>
        </div>
      );

      // Modal should be open
      const modalInput = screen.getByLabelText('Modal Input');
      const modalButton1 = screen.getByText('Modal Button 1');
      const closeButton = screen.getByText('Close');

      // Focus should be trapped within modal
      modalInput.focus();
      expect(document.activeElement).toBe(modalInput);

      await user.tab();
      expect(document.activeElement).toBe(modalButton1);

      await user.tab();
      expect(document.activeElement).toBe(closeButton);

      // Tab should cycle back to first focusable element
      await user.tab();
      expect(document.activeElement).toBe(modalInput);

      // Shift+Tab should go to last element
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(closeButton);
    });

    it('should handle skip links properly', async () => {
      const { container } = renderWithProviders(
        <div>
          <a href="#main" className="skip-link">
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

      // Focus skip link and activate it
      skipLink.focus();
      expect(document.activeElement).toBe(skipLink);

      // Simulate clicking skip link
      fireEvent.click(skipLink);
      
      // Main content should receive focus
      await waitFor(() => {
        expect(document.activeElement).toBe(mainContent);
      });

      // Next tab should go to first interactive element in main
      await user.tab();
      expect(document.activeElement).toBe(firstButton);
    });
  });

  describe('Keyboard Interaction Patterns', () => {
    it('should support Enter and Space for button activation', async () => {
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
    });

    it('should support arrow keys for select navigation', async () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ];

      renderWithProviders(
        <FloatingLabelSelect
          label="Test Select"
          options={options}
        />
      );

      const select = screen.getByLabelText('Test Select');
      select.focus();

      // Test arrow key navigation
      await user.keyboard('{ArrowDown}');
      expect(select.value).toBe('option1');

      await user.keyboard('{ArrowDown}');
      expect(select.value).toBe('option2');

      await user.keyboard('{ArrowUp}');
      expect(select.value).toBe('option1');
    });

    it('should support Escape key for modal dismissal', async () => {
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
  });

  describe('Focus Indicators', () => {
    it('should provide visible focus indicators', async () => {
      renderWithProviders(
        <div>
          <GlassButton>Button 1</GlassButton>
          <GlassButton>Button 2</GlassButton>
          <FloatingLabelInput label="Test Input" />
        </div>
      );

      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2');
      const input = screen.getByLabelText('Test Input');

      // Test focus indicators
      button1.focus();
      expect(button1).toHaveFocus();
      
      // Check if focus styles are applied (this would be visual in real testing)
      const computedStyle = window.getComputedStyle(button1);
      expect(computedStyle.outline).not.toBe('none');

      button2.focus();
      expect(button2).toHaveFocus();

      input.focus();
      expect(input).toHaveFocus();
    });

    it('should maintain focus visibility in high contrast mode', async () => {
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

      input.focus();
      expect(input).toHaveFocus();

      document.documentElement.classList.remove('high-contrast');
    });
  });
});

describe('Manual Accessibility Testing - Screen Reader Compatibility', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('ARIA Labels and Descriptions', () => {
    it('should provide comprehensive ARIA labels', async () => {
      renderWithProviders(
        <div>
          <GlassCard
            role="article"
            aria-labelledby="card-title"
            aria-describedby="card-description"
          >
            <h2 id="card-title">Article Title</h2>
            <p id="card-description">This is the article description</p>
            <GlassButton aria-describedby="button-help">
              Read More
            </GlassButton>
            <div id="button-help" className="sr-only">
              Opens the full article in a new page
            </div>
          </GlassCard>
        </div>
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      expect(card).toHaveAttribute('aria-describedby', 'card-description');

      const button = screen.getByText('Read More');
      expect(button).toHaveAttribute('aria-describedby', 'button-help');

      const helpText = document.getElementById('button-help');
      expect(helpText).toHaveTextContent('Opens the full article in a new page');
    });

    it('should provide status updates for dynamic content', async () => {
      const TestComponent = () => {
        const [loading, setLoading] = React.useState(false);
        const [message, setMessage] = React.useState('');

        const handleSubmit = async () => {
          setLoading(true);
          setMessage('Processing...');
          
          setTimeout(() => {
            setLoading(false);
            setMessage('Form submitted successfully!');
          }, 1000);
        };

        return (
          <div>
            <GlassButton onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Form'}
            </GlassButton>
            <div aria-live="polite" aria-atomic="true">
              {message}
            </div>
          </div>
        );
      };

      renderWithProviders(<TestComponent />);

      const button = screen.getByText('Submit Form');
      const statusRegion = screen.getByText('', { selector: '[aria-live="polite"]' });

      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true');

      // Simulate form submission
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Submitting...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Form submitted successfully!')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Semantic Structure', () => {
    it('should use proper heading hierarchy', async () => {
      renderWithProviders(
        <div>
          <h1>Main Page Title</h1>
          <section>
            <h2>Section Title</h2>
            <article>
              <h3>Article Title</h3>
              <div>
                <h4>Subsection Title</h4>
                <p>Content</p>
              </div>
            </article>
          </section>
        </div>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });
      const h4 = screen.getByRole('heading', { level: 4 });

      expect(h1).toHaveTextContent('Main Page Title');
      expect(h2).toHaveTextContent('Section Title');
      expect(h3).toHaveTextContent('Article Title');
      expect(h4).toHaveTextContent('Subsection Title');
    });

    it('should use proper landmark roles', async () => {
      renderWithProviders(
        <div>
          <header>
            <h1>Site Header</h1>
            <nav aria-label="Main navigation">
              <a href="#home">Home</a>
              <a href="#about">About</a>
            </nav>
          </header>
          <main>
            <h2>Main Content</h2>
            <section aria-labelledby="section-title">
              <h3 id="section-title">Content Section</h3>
            </section>
            <aside aria-label="Related links">
              <h3>Related</h3>
            </aside>
          </main>
          <footer>
            <p>Footer content</p>
          </footer>
        </div>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // aside
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });
  });

  describe('Form Accessibility', () => {
    it('should associate labels with form controls', async () => {
      renderWithProviders(
        <form>
          <fieldset>
            <legend>Personal Information</legend>
            
            <FloatingLabelInput
              label="First Name"
              required
              aria-describedby="firstname-help"
            />
            <div id="firstname-help">Enter your first name</div>
            
            <FloatingLabelInput
              label="Email"
              type="email"
              required
              aria-describedby="email-help"
              aria-invalid="false"
            />
            <div id="email-help">Enter a valid email address</div>
          </fieldset>
        </form>
      );

      const fieldset = screen.getByRole('group');
      expect(fieldset).toBeInTheDocument();

      const legend = screen.getByText('Personal Information');
      expect(legend).toBeInTheDocument();

      const firstNameInput = screen.getByLabelText('First Name');
      expect(firstNameInput).toHaveAttribute('required');
      expect(firstNameInput).toHaveAttribute('aria-describedby', 'firstname-help');

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should handle form validation errors accessibly', async () => {
      const TestForm = () => {
        const [errors, setErrors] = React.useState<Record<string, string>>({});

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          setErrors({
            email: 'Please enter a valid email address',
            password: 'Password must be at least 8 characters'
          });
        };

        return (
          <form onSubmit={handleSubmit} noValidate>
            <FloatingLabelInput
              label="Email"
              type="email"
              error={errors.email}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <div id="email-error" role="alert">
                {errors.email}
              </div>
            )}

            <FloatingLabelInput
              label="Password"
              type="password"
              error={errors.password}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <div id="password-error" role="alert">
                {errors.password}
              </div>
            )}

            <GlassButton type="submit">Submit</GlassButton>
          </form>
        );
      };

      renderWithProviders(<TestForm />);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const emailError = screen.getByRole('alert', { name: /email/i });
        const passwordError = screen.getByRole('alert', { name: /password/i });

        expect(emailError).toBeInTheDocument();
        expect(passwordError).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

// Manual Testing Checklist (for human testers)
export const MANUAL_TESTING_CHECKLIST = {
  keyboardNavigation: [
    'Tab through all interactive elements in logical order',
    'Verify all interactive elements are reachable via keyboard',
    'Test Shift+Tab for reverse navigation',
    'Verify focus indicators are clearly visible',
    'Test skip links functionality',
    'Verify modal focus trapping works correctly',
    'Test Escape key for modal dismissal',
    'Verify arrow keys work for select/dropdown navigation'
  ],
  
  screenReader: [
    'Test with NVDA (Windows)',
    'Test with JAWS (Windows)',
    'Test with VoiceOver (macOS)',
    'Verify all content is announced correctly',
    'Test heading navigation (H key)',
    'Test landmark navigation (D key for landmarks)',
    'Verify form labels are announced',
    'Test error message announcements',
    'Verify dynamic content updates are announced',
    'Test table navigation if applicable'
  ],
  
  visualAccessibility: [
    'Test with Windows High Contrast mode',
    'Verify 4.5:1 contrast ratio for normal text',
    'Verify 3:1 contrast ratio for large text',
    'Test with 200% zoom level',
    'Verify no information is conveyed by color alone',
    'Test focus indicators visibility',
    'Verify text remains readable when CSS is disabled'
  ],
  
  motorAccessibility: [
    'Test with reduced motion preferences',
    'Verify large click targets (44x44px minimum)',
    'Test drag and drop alternatives',
    'Verify timeout extensions are available',
    'Test voice control compatibility',
    'Verify no seizure-inducing content'
  ],
  
  cognitiveAccessibility: [
    'Verify clear and simple language',
    'Test error prevention and correction',
    'Verify consistent navigation patterns',
    'Test help and documentation availability',
    'Verify form auto-completion works',
    'Test session timeout warnings'
  ]
};