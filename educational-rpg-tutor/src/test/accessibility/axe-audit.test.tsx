/**
 * Automated Accessibility Audit Tests using axe-core
 * Comprehensive WCAG compliance testing for all modern UI components
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'vitest-axe';
import { renderWithProviders } from '../visual-regression/setup';

// Import all modern UI components for testing
import { GlassCard } from '../../components/modern-ui/GlassCard';
import { GlassButton } from '../../components/modern-ui/GlassButton';
import { GlassModal } from '../../components/modern-ui/GlassModal';
import { FloatingLabelInput } from '../../components/modern-ui/FloatingLabelInput';
import { FloatingLabelSelect } from '../../components/modern-ui/FloatingLabelSelect';
import { FloatingLabelTextarea } from '../../components/modern-ui/FloatingLabelTextarea';
import { ResponsiveGrid } from '../../components/modern-ui/ResponsiveGrid';
import { MasonryGrid } from '../../components/modern-ui/MasonryGrid';
import { Skeleton } from '../../components/modern-ui/Skeleton';
import { ProgressiveImage } from '../../components/modern-ui/ProgressiveImage';
import { TypewriterText } from '../../components/typography/TypewriterText';
import { GradientText } from '../../components/typography/GradientText';
import { TextReveal } from '../../components/typography/TextReveal';
import { AnimatedProgressBar } from '../../components/data-visualization/AnimatedProgressBar';
import { AnimatedProgressRing } from '../../components/data-visualization/AnimatedProgressRing';
import { StatCard } from '../../components/data-visualization/StatCard';
import { Avatar3D } from '../../components/3d/Avatar3D';
import { ParticleEngine } from '../../components/particles/ParticleEngine';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Audit - Core Components', () => {
  beforeEach(() => {
    // Reset DOM and accessibility state
    document.body.innerHTML = '';
    document.documentElement.className = '';
  });

  afterEach(() => {
    cleanup();
  });

  describe('GlassCard Accessibility', () => {
    it('should have no accessibility violations in default state', async () => {
      const { container } = renderWithProviders(
        <GlassCard>
          <h2>Card Title</h2>
          <p>Card content with proper semantic structure.</p>
        </GlassCard>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when interactive', async () => {
      const { container } = renderWithProviders(
        <GlassCard interactive role="button" tabIndex={0} aria-label="Interactive card">
          <h2>Interactive Card</h2>
          <p>This card can be clicked or activated with keyboard.</p>
        </GlassCard>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility with complex content', async () => {
      const { container } = renderWithProviders(
        <GlassCard>
          <header>
            <h2 id="card-title">Complex Card</h2>
            <p aria-describedby="card-title">Card with multiple elements</p>
          </header>
          <main>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
              <li>List item 3</li>
            </ul>
          </main>
          <footer>
            <button type="button">Action Button</button>
          </footer>
        </GlassCard>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('GlassButton Accessibility', () => {
    it('should have no violations for all button variants', async () => {
      const variants = ['primary', 'secondary', 'accent', 'ghost'] as const;
      
      for (const variant of variants) {
        const { container } = renderWithProviders(
          <GlassButton variant={variant}>
            {variant} Button
          </GlassButton>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
        cleanup();
      }
    });

    it('should have proper ARIA attributes when disabled', async () => {
      const { container } = renderWithProviders(
        <GlassButton disabled aria-describedby="button-help">
          Disabled Button
        </GlassButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-describedby', 'button-help');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support loading state accessibility', async () => {
      const { container } = renderWithProviders(
        <GlassButton loading aria-label="Loading, please wait">
          Loading Button
        </GlassButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Loading, please wait');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Components Accessibility', () => {
    it('should have no violations for FloatingLabelInput', async () => {
      const { container } = renderWithProviders(
        <FloatingLabelInput
          label="Email Address"
          type="email"
          required
          aria-describedby="email-help"
        />
      );

      const input = screen.getByLabelText('Email Address');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle error states accessibly', async () => {
      const { container } = renderWithProviders(
        <FloatingLabelInput
          label="Username"
          error="Username is required"
          aria-invalid="true"
          aria-describedby="username-error"
        />
      );

      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'username-error');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for FloatingLabelSelect', async () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ];

      const { container } = renderWithProviders(
        <FloatingLabelSelect
          label="Choose an option"
          options={options}
          required
          aria-describedby="select-help"
        />
      );

      const select = screen.getByLabelText('Choose an option');
      expect(select).toHaveAttribute('required');
      expect(select).toHaveAttribute('aria-describedby', 'select-help');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for FloatingLabelTextarea', async () => {
      const { container } = renderWithProviders(
        <FloatingLabelTextarea
          label="Message"
          rows={4}
          maxLength={500}
          aria-describedby="message-help"
        />
      );

      const textarea = screen.getByLabelText('Message');
      expect(textarea).toHaveAttribute('rows', '4');
      expect(textarea).toHaveAttribute('maxlength', '500');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-help');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Modal and Dialog Accessibility', () => {
    it('should have no violations for GlassModal', async () => {
      const { container } = renderWithProviders(
        <GlassModal isOpen={true} onClose={() => {}} aria-labelledby="modal-title">
          <div>
            <h2 id="modal-title">Modal Title</h2>
            <p>Modal content with proper semantic structure.</p>
            <div>
              <button type="button">Confirm</button>
              <button type="button">Cancel</button>
            </div>
          </div>
        </GlassModal>
      );

      // Modal should be in document body
      const modal = document.body.querySelector('[role="dialog"]');
      expect(modal).toBeTruthy();
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it('should trap focus properly in modal', async () => {
      const { container } = renderWithProviders(
        <GlassModal isOpen={true} onClose={() => {}} aria-label="Test Modal">
          <div>
            <h2>Focus Trap Test</h2>
            <input type="text" placeholder="First input" />
            <button type="button">Middle button</button>
            <input type="text" placeholder="Last input" />
          </div>
        </GlassModal>
      );

      const modal = document.body.querySelector('[role="dialog"]');
      const focusableElements = modal?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements?.length).toBeGreaterThan(0);

      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Typography Accessibility', () => {
    it('should have no violations for TypewriterText', async () => {
      const { container } = renderWithProviders(
        <TypewriterText
          text="This is accessible typewriter text"
          speed={100}
          aria-live="polite"
          role="status"
        />
      );

      const textElement = container.querySelector('[role="status"]');
      expect(textElement).toHaveAttribute('aria-live', 'polite');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for GradientText', async () => {
      const { container } = renderWithProviders(
        <GradientText gradient="primary">
          Accessible Gradient Text
        </GradientText>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain readability with TextReveal', async () => {
      const { container } = renderWithProviders(
        <TextReveal delay={0} aria-label="Revealed text content">
          This text reveals with proper accessibility
        </TextReveal>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Data Visualization Accessibility', () => {
    it('should have no violations for AnimatedProgressBar', async () => {
      const { container } = renderWithProviders(
        <AnimatedProgressBar
          progress={75}
          label="Loading progress"
          aria-label="75% complete"
          role="progressbar"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for AnimatedProgressRing', async () => {
      const { container } = renderWithProviders(
        <AnimatedProgressRing
          progress={60}
          size="md"
          color="primary"
          aria-label="60% complete"
          role="progressbar"
          aria-valuenow={60}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      );

      const progressRing = screen.getByRole('progressbar');
      expect(progressRing).toHaveAttribute('aria-valuenow', '60');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for StatCard', async () => {
      const { container } = renderWithProviders(
        <StatCard
          title="User Statistics"
          value={1234}
          change={12.5}
          trend="up"
          aria-label="User statistics: 1234 users, up 12.5%"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Layout Components Accessibility', () => {
    it('should have no violations for ResponsiveGrid', async () => {
      const { container } = renderWithProviders(
        <ResponsiveGrid
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap="md"
          role="grid"
          aria-label="Responsive content grid"
        >
          <div role="gridcell">Grid item 1</div>
          <div role="gridcell">Grid item 2</div>
          <div role="gridcell">Grid item 3</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Responsive content grid');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for MasonryGrid', async () => {
      const { container } = renderWithProviders(
        <MasonryGrid
          columns={3}
          gap="md"
          role="grid"
          aria-label="Masonry layout grid"
        >
          <div role="gridcell">Masonry item 1</div>
          <div role="gridcell">Masonry item 2</div>
          <div role="gridcell">Masonry item 3</div>
        </MasonryGrid>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Loading States Accessibility', () => {
    it('should have no violations for Skeleton components', async () => {
      const variants = ['text', 'card', 'avatar', 'chart'] as const;
      
      for (const variant of variants) {
        const { container } = renderWithProviders(
          <Skeleton
            variant={variant}
            animation="pulse"
            aria-label={`Loading ${variant} content`}
            role="status"
          />
        );

        const skeleton = screen.getByRole('status');
        expect(skeleton).toHaveAttribute('aria-label', `Loading ${variant} content`);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
        cleanup();
      }
    });

    it('should have no violations for ProgressiveImage', async () => {
      const { container } = renderWithProviders(
        <ProgressiveImage
          src="/test-image.jpg"
          alt="Test image with progressive loading"
          width={400}
          height={300}
          loading="lazy"
        />
      );

      const image = screen.getByAltText('Test image with progressive loading');
      expect(image).toHaveAttribute('loading', 'lazy');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('3D and Interactive Components Accessibility', () => {
    it('should have no violations for Avatar3D', async () => {
      const { container } = renderWithProviders(
        <Avatar3D
          character={{ primaryColor: '#3b82f6' }}
          interactive={true}
          lighting="ambient"
          aria-label="3D character avatar"
          role="img"
          tabIndex={0}
        />
      );

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('aria-label', '3D character avatar');
      expect(avatar).toHaveAttribute('tabindex', '0');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations for ParticleEngine', async () => {
      const { container } = renderWithProviders(
        <div>
          <ParticleEngine
            particleCount={10}
            interactionRadius={50}
            theme="magical"
            responsive={true}
            aria-hidden="true"
            role="presentation"
          />
          <div aria-live="polite" className="sr-only">
            Decorative particle animation is running
          </div>
        </div>
      );

      // Particle engine should be hidden from screen readers
      const particleContainer = container.querySelector('[role="presentation"]');
      expect(particleContainer).toHaveAttribute('aria-hidden', 'true');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Accessibility Audit - Complex Scenarios', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.className = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('should have no violations for complete form', async () => {
    const { container } = renderWithProviders(
      <form aria-labelledby="form-title" noValidate>
        <h2 id="form-title">User Registration Form</h2>
        
        <fieldset>
          <legend>Personal Information</legend>
          
          <FloatingLabelInput
            label="First Name"
            required
            aria-describedby="firstname-help"
          />
          <div id="firstname-help" className="sr-only">
            Enter your first name
          </div>
          
          <FloatingLabelInput
            label="Last Name"
            required
            aria-describedby="lastname-help"
          />
          <div id="lastname-help" className="sr-only">
            Enter your last name
          </div>
          
          <FloatingLabelInput
            label="Email"
            type="email"
            required
            aria-describedby="email-help"
          />
          <div id="email-help" className="sr-only">
            Enter a valid email address
          </div>
        </fieldset>
        
        <fieldset>
          <legend>Preferences</legend>
          
          <FloatingLabelSelect
            label="Country"
            options={[
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' }
            ]}
            required
          />
          
          <FloatingLabelTextarea
            label="Bio"
            rows={4}
            maxLength={500}
            aria-describedby="bio-help"
          />
          <div id="bio-help" className="sr-only">
            Tell us about yourself (optional, max 500 characters)
          </div>
        </fieldset>
        
        <div role="group" aria-labelledby="form-actions">
          <h3 id="form-actions" className="sr-only">Form Actions</h3>
          <GlassButton type="submit" variant="primary">
            Register
          </GlassButton>
          <GlassButton type="button" variant="secondary">
            Cancel
          </GlassButton>
        </div>
      </form>
    );

    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('aria-labelledby', 'form-title');

    const fieldsets = screen.getAllByRole('group');
    expect(fieldsets).toHaveLength(3); // 2 fieldsets + form actions group

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations for dashboard layout', async () => {
    const { container } = renderWithProviders(
      <main aria-labelledby="dashboard-title">
        <h1 id="dashboard-title">User Dashboard</h1>
        
        <nav aria-label="Dashboard navigation">
          <ul>
            <li><a href="#stats">Statistics</a></li>
            <li><a href="#progress">Progress</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        </nav>
        
        <section id="stats" aria-labelledby="stats-title">
          <h2 id="stats-title">Statistics</h2>
          <ResponsiveGrid
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="md"
            role="grid"
            aria-label="Statistics grid"
          >
            <StatCard
              title="Total Users"
              value={1234}
              change={12.5}
              trend="up"
              role="gridcell"
              aria-label="Total users: 1234, up 12.5%"
            />
            <StatCard
              title="Active Sessions"
              value={567}
              change={-5.2}
              trend="down"
              role="gridcell"
              aria-label="Active sessions: 567, down 5.2%"
            />
            <StatCard
              title="Revenue"
              value={89012}
              change={8.7}
              trend="up"
              role="gridcell"
              aria-label="Revenue: $89,012, up 8.7%"
            />
          </ResponsiveGrid>
        </section>
        
        <section id="progress" aria-labelledby="progress-title">
          <h2 id="progress-title">Progress Tracking</h2>
          <div>
            <AnimatedProgressBar
              progress={75}
              label="Overall Progress"
              aria-label="Overall progress: 75% complete"
              role="progressbar"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
            />
            <AnimatedProgressRing
              progress={60}
              size="md"
              color="primary"
              aria-label="Goal completion: 60%"
              role="progressbar"
              aria-valuenow={60}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </section>
      </main>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-labelledby', 'dashboard-title');

    const navigation = screen.getByRole('navigation');
    expect(navigation).toHaveAttribute('aria-label', 'Dashboard navigation');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle reduced motion preferences', async () => {
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

    const { container } = renderWithProviders(
      <div>
        <TypewriterText
          text="This respects reduced motion"
          speed={0} // Should be instant with reduced motion
          aria-live="polite"
        />
        <AnimatedProgressBar
          progress={50}
          label="Progress"
          aria-label="50% complete"
          role="progressbar"
          aria-valuenow={50}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>,
      { reducedMotion: true }
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle high contrast mode', async () => {
    const { container } = renderWithProviders(
      <div>
        <GlassCard>
          <h2>High Contrast Card</h2>
          <p>Content should be visible in high contrast mode</p>
          <GlassButton variant="primary">
            High Contrast Button
          </GlassButton>
        </GlassCard>
      </div>,
      { highContrast: true }
    );

    // Verify high contrast class is applied
    expect(document.documentElement).toHaveClass('high-contrast');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});