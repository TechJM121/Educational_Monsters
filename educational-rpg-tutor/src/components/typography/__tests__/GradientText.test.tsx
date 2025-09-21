import React from 'react';
import { render, screen } from '@testing-library/react';
import { GradientText } from '../GradientText';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    span: ({ children, style, ...props }: any) => (
      <span data-testid="gradient-text" style={style} {...props}>
        {children}
      </span>
    ),
  },
}));

describe('GradientText', () => {
  it('should render children with gradient styles', () => {
    render(<GradientText>Hello World</GradientText>);
    
    const element = screen.getByTestId('gradient-text');
    expect(element).toHaveTextContent('Hello World');
    expect(element).toHaveStyle({
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
    });
  });

  it('should apply rainbow gradient by default', () => {
    render(<GradientText>Test</GradientText>);
    
    const element = screen.getByTestId('gradient-text');
    expect(element.style.background).toContain('linear-gradient');
    expect(element.style.background).toContain('#ff0000'); // Red from rainbow
  });

  it('should apply different gradient presets', () => {
    const gradients = ['sunset', 'ocean', 'forest', 'fire', 'cosmic'];
    
    gradients.forEach(gradient => {
      const { unmount } = render(
        <GradientText gradient={gradient as any}>Test</GradientText>
      );
      
      const element = screen.getByTestId('gradient-text');
      expect(element.style.background).toContain('linear-gradient');
      
      unmount();
    });
  });

  it('should use custom gradient when provided', () => {
    const customGradient = 'linear-gradient(45deg, #ff0000, #00ff00)';
    render(
      <GradientText gradient="custom" customGradient={customGradient}>
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element.style.background).toBe(customGradient);
  });

  it('should apply animation styles when animated is true', () => {
    render(
      <GradientText animated animationType="shimmer" animationDuration={2}>
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element.style.backgroundSize).toBe('200% 100%');
    expect(element.style.animation).toContain('shimmer');
    expect(element.style.animation).toContain('2s');
  });

  it('should not apply animation styles when animated is false', () => {
    render(
      <GradientText animated={false}>
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element.style.animation).toBeFalsy();
  });

  it('should apply different animation types', () => {
    const animations = ['shimmer', 'wave', 'pulse', 'flow'];
    
    animations.forEach(animationType => {
      const { unmount } = render(
        <GradientText animated animationType={animationType as any}>
          Test
        </GradientText>
      );
      
      const element = screen.getByTestId('gradient-text');
      expect(element.style.animation).toContain(animationType);
      
      unmount();
    });
  });

  it('should apply custom className', () => {
    render(
      <GradientText className="custom-class">
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element).toHaveClass('custom-class');
  });

  it('should render with custom element type', () => {
    render(
      <GradientText as="h1">
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element.tagName).toBe('H1');
  });

  it('should pass through motion props', () => {
    render(
      <GradientText 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        data-custom="test"
      >
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element).toHaveAttribute('data-custom', 'test');
  });

  it('should handle empty children', () => {
    render(<GradientText></GradientText>);
    
    const element = screen.getByTestId('gradient-text');
    expect(element).toBeInTheDocument();
    expect(element).toBeEmptyDOMElement();
  });

  it('should handle complex children', () => {
    render(
      <GradientText>
        <span>Hello</span> <strong>World</strong>
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element).toContainHTML('<span>Hello</span> <strong>World</strong>');
  });

  it('should apply correct background size for different animations', () => {
    const animationSizes = {
      shimmer: '200% 100%',
      wave: '400% 100%',
      flow: '300% 100%',
      pulse: undefined, // No background size for pulse
    };

    Object.entries(animationSizes).forEach(([animationType, expectedSize]) => {
      const { unmount } = render(
        <GradientText animated animationType={animationType as any}>
          Test
        </GradientText>
      );
      
      const element = screen.getByTestId('gradient-text');
      if (expectedSize) {
        expect(element.style.backgroundSize).toBe(expectedSize);
      } else {
        expect(element.style.backgroundSize).toBeFalsy();
      }
      
      unmount();
    });
  });

  it('should use default animation duration when not specified', () => {
    render(
      <GradientText animated animationType="shimmer">
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element.style.animation).toContain('3s'); // Default duration
  });

  it('should handle custom animation duration', () => {
    render(
      <GradientText animated animationType="shimmer" animationDuration={5}>
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element.style.animation).toContain('5s');
  });

  it('should fallback to default gradient for custom when no customGradient provided', () => {
    render(
      <GradientText gradient="custom">
        Test
      </GradientText>
    );
    
    const element = screen.getByTestId('gradient-text');
    expect(element.style.background).toContain('linear-gradient');
    expect(element.style.background).toContain('#667eea'); // Default custom gradient colors
  });
});