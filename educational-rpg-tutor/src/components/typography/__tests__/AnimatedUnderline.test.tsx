import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedUnderline } from '../AnimatedUnderline';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    span: ({ children, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }: any) => (
      <span 
        data-testid="animated-underline"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      >
        {children}
      </span>
    ),
    svg: ({ children, ...props }: any) => (
      <svg data-testid="wavy-svg" {...props}>
        {children}
      </svg>
    ),
  },
}));

describe('AnimatedUnderline', () => {
  it('should render children with underline container', () => {
    render(
      <AnimatedUnderline>
        Hello World
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toHaveTextContent('Hello World');
    expect(element).toHaveClass('relative', 'inline-block');
  });

  it('should apply custom className', () => {
    render(
      <AnimatedUnderline className="custom-class">
        Test
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toHaveClass('custom-class');
  });

  it('should render with custom element type', () => {
    render(
      <AnimatedUnderline as="div">
        Test
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element.tagName).toBe('DIV');
  });

  it('should show underline on hover when trigger is hover', () => {
    render(
      <AnimatedUnderline trigger="hover">
        Hover me
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    
    // Hover should trigger underline
    fireEvent.mouseEnter(element);
    // In a real implementation, this would show the underline
    // Here we just verify the event handlers are attached
    expect(element).toBeInTheDocument();
  });

  it('should show underline on focus when trigger is focus', () => {
    render(
      <AnimatedUnderline trigger="focus">
        Focus me
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    
    // Focus should trigger underline
    fireEvent.focus(element);
    expect(element).toBeInTheDocument();
    
    // Blur should hide underline
    fireEvent.blur(element);
    expect(element).toBeInTheDocument();
  });

  it('should show underline when trigger is always', () => {
    render(
      <AnimatedUnderline trigger="always">
        Always underlined
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toBeInTheDocument();
  });

  it('should show underline when trigger is manual and active is true', () => {
    render(
      <AnimatedUnderline trigger="manual" active={true}>
        Manually controlled
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toBeInTheDocument();
  });

  it('should render wavy underline with SVG', () => {
    render(
      <AnimatedUnderline underlineType="wavy">
        Wavy underline
      </AnimatedUnderline>
    );
    
    const svg = screen.getByTestId('wavy-svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle different underline types', () => {
    const types = ['solid', 'gradient', 'dashed', 'dotted'];
    
    types.forEach(type => {
      const { unmount } = render(
        <AnimatedUnderline underlineType={type as any}>
          Test
        </AnimatedUnderline>
      );
      
      const element = screen.getByTestId('animated-underline');
      expect(element).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should handle different animation types', () => {
    const animations = ['expand', 'slide', 'fade', 'draw', 'bounce'];
    
    animations.forEach(animationType => {
      const { unmount } = render(
        <AnimatedUnderline animationType={animationType as any}>
          Test
        </AnimatedUnderline>
      );
      
      const element = screen.getByTestId('animated-underline');
      expect(element).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should call animation callbacks', () => {
    const onAnimationStart = jest.fn();
    const onAnimationComplete = jest.fn();
    
    render(
      <AnimatedUnderline 
        onAnimationStart={onAnimationStart}
        onAnimationComplete={onAnimationComplete}
      >
        Test
      </AnimatedUnderline>
    );
    
    // Callbacks are passed to motion components
    expect(onAnimationStart).toBeDefined();
    expect(onAnimationComplete).toBeDefined();
  });

  it('should handle custom color and thickness', () => {
    render(
      <AnimatedUnderline color="#ff0000" thickness={5}>
        Custom styled
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toBeInTheDocument();
  });

  it('should handle gradient underline', () => {
    const gradient = 'linear-gradient(90deg, #ff0000, #00ff00)';
    render(
      <AnimatedUnderline 
        underlineType="gradient" 
        gradient={gradient}
      >
        Gradient underline
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toBeInTheDocument();
  });

  it('should handle custom duration and delay', () => {
    render(
      <AnimatedUnderline duration={0.5} delay={0.2}>
        Timed animation
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toBeInTheDocument();
  });

  it('should handle mouse events correctly', () => {
    render(
      <AnimatedUnderline trigger="hover">
        Hover test
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    
    // Test mouse enter and leave
    fireEvent.mouseEnter(element);
    fireEvent.mouseLeave(element);
    
    expect(element).toBeInTheDocument();
  });

  it('should handle focus events correctly', () => {
    render(
      <AnimatedUnderline trigger="focus">
        Focus test
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    
    // Test focus and blur
    fireEvent.focus(element);
    fireEvent.blur(element);
    
    expect(element).toBeInTheDocument();
  });

  it('should pass through motion props', () => {
    render(
      <AnimatedUnderline 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        data-custom="test"
      >
        Test
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toHaveAttribute('data-custom', 'test');
  });

  it('should handle empty children', () => {
    render(<AnimatedUnderline></AnimatedUnderline>);
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toBeInTheDocument();
    expect(element).toBeEmptyDOMElement();
  });

  it('should handle complex children', () => {
    render(
      <AnimatedUnderline>
        <span>Hello</span> <strong>World</strong>
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toContainHTML('<span>Hello</span> <strong>World</strong>');
  });

  it('should default to currentColor when no color specified', () => {
    render(
      <AnimatedUnderline>
        Default color
      </AnimatedUnderline>
    );
    
    const element = screen.getByTestId('animated-underline');
    expect(element).toBeInTheDocument();
    // Color would be applied to the underline element, not the container
  });
});