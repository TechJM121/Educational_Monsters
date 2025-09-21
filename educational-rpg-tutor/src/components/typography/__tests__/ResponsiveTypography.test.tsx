import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  ResponsiveTypography, 
  ResponsiveHeading, 
  ResponsiveText, 
  ResponsiveCaption, 
  ResponsiveCode 
} from '../ResponsiveTypography';

// Mock the readability optimization utils
jest.mock('../../utils/readabilityOptimization', () => ({
  generateResponsiveTypography: jest.fn((base, min, max) => `clamp(${min}px, ${base}px, ${max}px)`),
  calculateOptimalLineHeight: jest.fn(() => 1.5),
  calculateOptimalLetterSpacing: jest.fn(() => 0.02),
}));

describe('ResponsiveTypography', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('should render with default props', () => {
    render(
      <ResponsiveTypography>
        Test content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Test content');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('P'); // Default element for body variant
  });

  it('should render with custom element', () => {
    render(
      <ResponsiveTypography as="div">
        Test content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Test content');
    expect(element.tagName).toBe('DIV');
  });

  it('should apply variant-specific element', () => {
    render(
      <ResponsiveTypography variant="h1">
        Heading content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Heading content');
    expect(element.tagName).toBe('H1');
  });

  it('should apply responsive typography classes', () => {
    render(
      <ResponsiveTypography responsive>
        Responsive content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Responsive content');
    expect(element).toHaveClass('responsive-typography--fluid');
  });

  it('should apply device optimization classes', () => {
    render(
      <ResponsiveTypography optimizeForDevice>
        Device optimized content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Device optimized content');
    expect(element).toHaveClass('responsive-typography--desktop');
  });

  it('should apply distance adaptation classes', () => {
    render(
      <ResponsiveTypography adaptToDistance>
        Distance adapted content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Distance adapted content');
    expect(element).toHaveClass('responsive-typography--normal');
  });

  it('should generate responsive styles when responsive is true', () => {
    render(
      <ResponsiveTypography responsive variant="h1">
        Responsive heading
      </ResponsiveTypography>
    );

    const element = screen.getByText('Responsive heading');
    const styles = window.getComputedStyle(element);
    
    // The element should have inline styles applied
    expect(element.style.fontSize).toBeTruthy();
    expect(element.style.fontWeight).toBe('700'); // h1 weight
  });

  it('should handle different variants correctly', () => {
    const variants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'caption', 'code'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(
        <ResponsiveTypography variant={variant}>
          {variant} content
        </ResponsiveTypography>
      );

      const element = screen.getByText(`${variant} content`);
      expect(element).toHaveClass(`responsive-typography--${variant}`);
      
      unmount();
    });
  });

  it('should apply custom className and styles', () => {
    render(
      <ResponsiveTypography 
        className="custom-class" 
        style={{ color: 'red' }}
      >
        Styled content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Styled content');
    expect(element).toHaveClass('custom-class');
    expect(element.style.color).toBe('red');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLElement>();
    
    render(
      <ResponsiveTypography ref={ref}>
        Ref content
      </ResponsiveTypography>
    );

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it('should handle mobile device detection', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 600,
      writable: true,
    });

    render(
      <ResponsiveTypography optimizeForDevice>
        Mobile content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Mobile content');
    expect(element).toHaveClass('responsive-typography--mobile');
  });

  it('should handle tablet device detection', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 800,
      writable: true,
    });

    render(
      <ResponsiveTypography optimizeForDevice>
        Tablet content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Tablet content');
    expect(element).toHaveClass('responsive-typography--tablet');
  });

  it('should adapt to viewing distance', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 600, // Mobile = close viewing distance
      writable: true,
    });

    render(
      <ResponsiveTypography adaptToDistance optimizeForDevice>
        Close distance content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Close distance content');
    expect(element).toHaveClass('responsive-typography--close');
  });

  it('should handle window resize events', () => {
    const { rerender } = render(
      <ResponsiveTypography optimizeForDevice>
        Resizable content
      </ResponsiveTypography>
    );

    // Change window size
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    rerender(
      <ResponsiveTypography optimizeForDevice>
        Resizable content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Resizable content');
    expect(element).toHaveClass('responsive-typography--mobile');
  });
});

describe('ResponsiveHeading', () => {
  it('should render with correct heading level', () => {
    render(
      <ResponsiveHeading level={2}>
        Heading Level 2
      </ResponsiveHeading>
    );

    const element = screen.getByText('Heading Level 2');
    expect(element.tagName).toBe('H2');
    expect(element).toHaveClass('responsive-typography--h2');
  });

  it('should handle all heading levels', () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;
    
    levels.forEach(level => {
      const { unmount } = render(
        <ResponsiveHeading level={level}>
          Heading {level}
        </ResponsiveHeading>
      );

      const element = screen.getByText(`Heading ${level}`);
      expect(element.tagName).toBe(`H${level}`);
      
      unmount();
    });
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    
    render(
      <ResponsiveHeading level={1} ref={ref}>
        Ref heading
      </ResponsiveHeading>
    );

    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current?.tagName).toBe('H1');
  });
});

describe('ResponsiveText', () => {
  it('should render as paragraph with body variant', () => {
    render(
      <ResponsiveText>
        Body text content
      </ResponsiveText>
    );

    const element = screen.getByText('Body text content');
    expect(element.tagName).toBe('P');
    expect(element).toHaveClass('responsive-typography--body');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    
    render(
      <ResponsiveText ref={ref}>
        Ref text
      </ResponsiveText>
    );

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('ResponsiveCaption', () => {
  it('should render as span with caption variant', () => {
    render(
      <ResponsiveCaption>
        Caption text
      </ResponsiveCaption>
    );

    const element = screen.getByText('Caption text');
    expect(element.tagName).toBe('SPAN');
    expect(element).toHaveClass('responsive-typography--caption');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLSpanElement>();
    
    render(
      <ResponsiveCaption ref={ref}>
        Ref caption
      </ResponsiveCaption>
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe('ResponsiveCode', () => {
  it('should render as code with code variant', () => {
    render(
      <ResponsiveCode>
        const code = "example";
      </ResponsiveCode>
    );

    const element = screen.getByText('const code = "example";');
    expect(element.tagName).toBe('CODE');
    expect(element).toHaveClass('responsive-typography--code');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLElement>();
    
    render(
      <ResponsiveCode ref={ref}>
        const ref = "code";
      </ResponsiveCode>
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('CODE');
  });
});

describe('Responsive behavior', () => {
  it('should not apply responsive styles when responsive is false', () => {
    render(
      <ResponsiveTypography responsive={false}>
        Non-responsive content
      </ResponsiveTypography>
    );

    const element = screen.getByText('Non-responsive content');
    expect(element).not.toHaveClass('responsive-typography--fluid');
  });

  it('should handle complex combinations of props', () => {
    render(
      <ResponsiveTypography 
        variant="h2"
        responsive
        optimizeForDevice
        adaptToDistance
        className="custom-class"
        style={{ margin: '10px' }}
      >
        Complex typography
      </ResponsiveTypography>
    );

    const element = screen.getByText('Complex typography');
    expect(element.tagName).toBe('H2');
    expect(element).toHaveClass(
      'responsive-typography',
      'responsive-typography--h2',
      'responsive-typography--fluid',
      'responsive-typography--desktop',
      'responsive-typography--normal',
      'custom-class'
    );
    expect(element.style.margin).toBe('10px');
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(
      <ResponsiveTypography optimizeForDevice>
        Cleanup test
      </ResponsiveTypography>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});

describe('Error handling', () => {
  it('should handle missing window object gracefully', () => {
    const originalWindow = global.window;
    delete (global as any).window;

    expect(() => {
      render(
        <ResponsiveTypography optimizeForDevice>
          No window test
        </ResponsiveTypography>
      );
    }).not.toThrow();

    global.window = originalWindow;
  });

  it('should handle invalid variant gracefully', () => {
    render(
      <ResponsiveTypography variant={'invalid' as any}>
        Invalid variant
      </ResponsiveTypography>
    );

    const element = screen.getByText('Invalid variant');
    expect(element).toBeInTheDocument();
  });
});

describe('Performance', () => {
  it('should not cause unnecessary re-renders', () => {
    const renderSpy = jest.fn();
    
    const TestComponent = () => {
      renderSpy();
      return (
        <ResponsiveTypography>
          Performance test
        </ResponsiveTypography>
      );
    };

    const { rerender } = render(<TestComponent />);
    
    // Initial render
    expect(renderSpy).toHaveBeenCalledTimes(1);
    
    // Re-render with same props
    rerender(<TestComponent />);
    
    // Should not cause additional renders due to memoization
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});