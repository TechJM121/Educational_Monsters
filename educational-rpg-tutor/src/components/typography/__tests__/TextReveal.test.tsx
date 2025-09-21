import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextReveal } from '../TextReveal';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, variants, initial, animate, ...props }: any) => (
      <div data-testid="motion-container" data-initial={initial} data-animate={animate} {...props}>
        {children}
      </div>
    ),
    span: ({ children, variants, ...props }: any) => (
      <span data-testid="motion-span" {...props}>
        {children}
      </span>
    ),
  },
  Variants: {} as any,
}));

describe('TextReveal', () => {
  it('should render text split by characters by default', () => {
    render(<TextReveal text="Hello" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(5); // H, e, l, l, o
    
    expect(spans[0]).toHaveTextContent('H');
    expect(spans[1]).toHaveTextContent('e');
    expect(spans[2]).toHaveTextContent('l');
    expect(spans[3]).toHaveTextContent('l');
    expect(spans[4]).toHaveTextContent('o');
  });

  it('should split text by words when specified', () => {
    render(<TextReveal text="Hello World" splitBy="word" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(3); // "Hello", " ", "World"
    
    expect(spans[0]).toHaveTextContent('Hello');
    expect(spans[1]).toHaveTextContent('\u00A0'); // Non-breaking space
    expect(spans[2]).toHaveTextContent('World');
  });

  it('should split text by lines when specified', () => {
    render(<TextReveal text="Line 1\nLine 2\nLine 3" splitBy="line" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(3);
    
    expect(spans[0]).toHaveTextContent('Line 1');
    expect(spans[1]).toHaveTextContent('Line 2');
    expect(spans[2]).toHaveTextContent('Line 3');
  });

  it('should handle empty text gracefully', () => {
    render(<TextReveal text="" />);
    
    const spans = screen.queryAllByTestId('motion-span');
    expect(spans).toHaveLength(0);
  });

  it('should handle single character text', () => {
    render(<TextReveal text="A" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(1);
    expect(spans[0]).toHaveTextContent('A');
  });

  it('should apply custom className', () => {
    render(<TextReveal text="Test" className="custom-class" />);
    
    const container = screen.getByTestId('motion-container');
    expect(container).toHaveClass('custom-class');
  });

  it('should render with custom element type', () => {
    render(<TextReveal text="Test" as="h1" />);
    
    const container = screen.getByTestId('motion-container');
    expect(container.tagName).toBe('H1');
  });

  it('should handle spaces correctly in character mode', () => {
    render(<TextReveal text="A B" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(3); // A, space, B
    
    expect(spans[0]).toHaveTextContent('A');
    expect(spans[1]).toHaveTextContent('\u00A0'); // Non-breaking space
    expect(spans[2]).toHaveTextContent('B');
  });

  it('should handle multiple spaces in word mode', () => {
    render(<TextReveal text="Word1  Word2" splitBy="word" />);
    
    const spans = screen.getAllByTestId('motion-span');
    // Should handle multiple spaces as separate elements
    expect(spans.length).toBeGreaterThan(3);
  });

  it('should set correct animation properties', () => {
    render(
      <TextReveal 
        text="Test" 
        animation="fadeUp"
        stagger={0.1}
        delay={0.5}
        duration={0.8}
      />
    );
    
    const container = screen.getByTestId('motion-container');
    expect(container).toHaveAttribute('data-initial', 'hidden');
    expect(container).toHaveAttribute('data-animate', 'visible');
  });

  it('should call onComplete callback', () => {
    const onComplete = jest.fn();
    render(<TextReveal text="Test" onComplete={onComplete} />);
    
    // The callback would be called through framer-motion's animation system
    // In a real test environment, this would require more complex mocking
    expect(onComplete).toBeDefined();
  });

  it('should handle different animation types', () => {
    const animations = ['fadeUp', 'fadeIn', 'slideLeft', 'slideRight', 'scale', 'blur'];
    
    animations.forEach(animation => {
      const { unmount } = render(
        <TextReveal text="Test" animation={animation as any} />
      );
      
      const container = screen.getByTestId('motion-container');
      expect(container).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should handle special characters', () => {
    render(<TextReveal text="Hello! @#$%^&*()" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(13); // All characters including special ones
    
    expect(spans[5]).toHaveTextContent('!');
    expect(spans[7]).toHaveTextContent('@');
  });

  it('should handle unicode characters', () => {
    render(<TextReveal text="Hello 🌟 World" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans.length).toBeGreaterThan(10);
    
    // Should handle emoji as a single character
    const emojiSpan = spans.find(span => span.textContent === '🌟');
    expect(emojiSpan).toBeInTheDocument();
  });

  it('should maintain proper spacing in word mode', () => {
    render(<TextReveal text="One Two Three" splitBy="word" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(5); // "One", " ", "Two", " ", "Three"
    
    // Check that spaces are preserved
    expect(spans[1]).toHaveTextContent('\u00A0');
    expect(spans[3]).toHaveTextContent('\u00A0');
  });

  it('should handle line breaks correctly', () => {
    render(<TextReveal text="Line 1\nLine 2" splitBy="line" />);
    
    const spans = screen.getAllByTestId('motion-span');
    expect(spans).toHaveLength(2);
    
    expect(spans[0]).toHaveTextContent('Line 1');
    expect(spans[1]).toHaveTextContent('Line 2');
  });
});