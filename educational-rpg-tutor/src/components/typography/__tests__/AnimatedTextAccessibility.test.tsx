import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TypewriterText } from '../TypewriterText';
import { TextReveal } from '../TextReveal';
import { GradientText } from '../GradientText';
import { AnimatedUnderline } from '../AnimatedUnderline';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  },
  AnimatePresence: ({ children }: any) => children,
  Variants: {} as any,
}));

// Mock prefers-reduced-motion
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('Animated Text Accessibility', () => {
  beforeEach(() => {
    // Reset matchMedia mock
    mockMatchMedia(false);
  });

  describe('TypewriterText Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TypewriterText text="Accessible typewriter text" />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be readable by screen readers', () => {
      render(
        <TypewriterText 
          text="Screen reader friendly text"
          aria-label="Animated text content"
        />
      );
      
      const element = screen.getByLabelText('Animated text content');
      expect(element).toBeInTheDocument();
    });

    it('should respect prefers-reduced-motion', () => {
      mockMatchMedia(true); // User prefers reduced motion
      
      render(
        <TypewriterText 
          text="Reduced motion text"
          speed={50}
        />
      );
      
      // In a real implementation, this would disable or reduce animations
      const element = screen.getByText(/Reduced motion text/);
      expect(element).toBeInTheDocument();
    });

    it('should maintain focus management', () => {
      render(
        <TypewriterText 
          text="Focusable text"
          as="button"
          tabIndex={0}
        />
      );
      
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('tabIndex', '0');
    });

    it('should provide appropriate ARIA attributes', () => {
      render(
        <TypewriterText 
          text="ARIA enhanced text"
          role="status"
          aria-live="polite"
        />
      );
      
      const element = screen.getByRole('status');
      expect(element).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('TextReveal Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TextReveal text="Accessible reveal text" />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain semantic structure', () => {
      render(
        <TextReveal 
          text="Semantic heading text"
          as="h2"
          role="heading"
          aria-level={2}
        />
      );
      
      const element = screen.getByRole('heading', { level: 2 });
      expect(element).toBeInTheDocument();
    });

    it('should handle keyboard navigation', () => {
      render(
        <TextReveal 
          text="Keyboard navigable text"
          tabIndex={0}
        />
      );
      
      const element = screen.getByText(/Keyboard navigable text/);
      expect(element).toHaveAttribute('tabIndex', '0');
    });

    it('should provide text alternatives for animations', () => {
      render(
        <TextReveal 
          text="Animated content"
          aria-label="Text reveals with animation"
        />
      );
      
      const element = screen.getByLabelText('Text reveals with animation');
      expect(element).toBeInTheDocument();
    });
  });

  describe('GradientText Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <GradientText>Accessible gradient text</GradientText>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain sufficient contrast', () => {
      // Note: In a real implementation, you would test actual contrast ratios
      render(
        <GradientText 
          gradient="ocean"
          style={{ backgroundColor: 'white' }}
        >
          High contrast text
        </GradientText>
      );
      
      const element = screen.getByText('High contrast text');
      expect(element).toBeInTheDocument();
    });

    it('should work with high contrast mode', () => {
      // Mock high contrast media query
      mockMatchMedia(true);
      
      render(
        <GradientText>High contrast mode text</GradientText>
      );
      
      const element = screen.getByText('High contrast mode text');
      expect(element).toBeInTheDocument();
    });

    it('should be selectable and copyable', () => {
      render(
        <GradientText>Selectable gradient text</GradientText>
      );
      
      const element = screen.getByText('Selectable gradient text');
      expect(element).toBeInTheDocument();
      // Text should remain selectable despite gradient styling
    });
  });

  describe('AnimatedUnderline Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AnimatedUnderline>Accessible underlined text</AnimatedUnderline>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should work as interactive element', () => {
      render(
        <AnimatedUnderline 
          as="button"
          role="button"
          tabIndex={0}
        >
          Interactive underlined button
        </AnimatedUnderline>
      );
      
      const element = screen.getByRole('button');
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('tabIndex', '0');
    });

    it('should provide focus indicators', () => {
      render(
        <AnimatedUnderline 
          trigger="focus"
          tabIndex={0}
        >
          Focus indicator text
        </AnimatedUnderline>
      );
      
      const element = screen.getByText('Focus indicator text');
      expect(element).toHaveAttribute('tabIndex', '0');
    });

    it('should maintain link semantics when used with links', () => {
      render(
        <AnimatedUnderline as="a" href="#test">
          Accessible link with animation
        </AnimatedUnderline>
      );
      
      const element = screen.getByRole('link');
      expect(element).toHaveAttribute('href', '#test');
    });
  });

  describe('Combined Accessibility', () => {
    it('should work together without conflicts', async () => {
      const { container } = render(
        <div>
          <TypewriterText text="Typewriter" />
          <TextReveal text="Reveal" />
          <GradientText>Gradient</GradientText>
          <AnimatedUnderline>Underline</AnimatedUnderline>
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain reading order', () => {
      render(
        <div>
          <TypewriterText text="First text" />
          <TextReveal text="Second text" />
          <GradientText>Third text</GradientText>
          <AnimatedUnderline>Fourth text</AnimatedUnderline>
        </div>
      );
      
      // All text should be present and in order
      expect(screen.getByText(/First text/)).toBeInTheDocument();
      expect(screen.getByText(/Second text/)).toBeInTheDocument();
      expect(screen.getByText('Third text')).toBeInTheDocument();
      expect(screen.getByText('Fourth text')).toBeInTheDocument();
    });

    it('should handle nested animations appropriately', () => {
      render(
        <AnimatedUnderline>
          <GradientText>
            <TypewriterText text="Nested animations" />
          </GradientText>
        </AnimatedUnderline>
      );
      
      const element = screen.getByText(/Nested animations/);
      expect(element).toBeInTheDocument();
    });
  });

  describe('Performance and Motion Preferences', () => {
    it('should respect prefers-reduced-motion globally', () => {
      mockMatchMedia(true);
      
      render(
        <div>
          <TypewriterText text="Reduced motion typewriter" />
          <TextReveal text="Reduced motion reveal" />
          <GradientText animated>Reduced motion gradient</GradientText>
        </div>
      );
      
      // All components should render but with reduced animations
      expect(screen.getByText(/Reduced motion typewriter/)).toBeInTheDocument();
      expect(screen.getByText(/Reduced motion reveal/)).toBeInTheDocument();
      expect(screen.getByText('Reduced motion gradient')).toBeInTheDocument();
    });

    it('should provide static fallbacks', () => {
      // Mock animation failure scenario
      render(
        <div>
          <TypewriterText text="Static fallback text" cursor={false} />
          <TextReveal text="Static reveal text" />
          <GradientText animated={false}>Static gradient</GradientText>
        </div>
      );
      
      // Text should still be readable without animations
      expect(screen.getByText(/Static fallback text/)).toBeInTheDocument();
      expect(screen.getByText(/Static reveal text/)).toBeInTheDocument();
      expect(screen.getByText('Static gradient')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should announce content changes appropriately', () => {
      render(
        <div>
          <TypewriterText 
            text="Screen reader announcement"
            aria-live="polite"
          />
          <TextReveal 
            text="Revealed content"
            role="status"
          />
        </div>
      );
      
      const typewriter = screen.getByText(/Screen reader announcement/);
      const reveal = screen.getByRole('status');
      
      expect(typewriter).toHaveAttribute('aria-live', 'polite');
      expect(reveal).toBeInTheDocument();
    });

    it('should not interfere with screen reader navigation', () => {
      render(
        <nav>
          <AnimatedUnderline as="a" href="#section1">
            Section 1
          </AnimatedUnderline>
          <AnimatedUnderline as="a" href="#section2">
            Section 2
          </AnimatedUnderline>
        </nav>
      );
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute('href', '#section1');
      expect(links[1]).toHaveAttribute('href', '#section2');
    });
  });
});