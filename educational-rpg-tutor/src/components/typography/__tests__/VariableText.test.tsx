import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VariableText } from '../VariableText';

// Mock the useVariableFont hook
jest.mock('../../hooks/useVariableFont', () => ({
  useVariableFont: jest.fn(() => ({
    isLoaded: true,
    isSupported: true,
    currentVariations: { weight: 400 },
    error: null,
    updateVariations: jest.fn(),
    getFontStyles: jest.fn(() => ({
      fontFamily: 'Inter',
      fontVariationSettings: "'wght' 400",
      transition: 'font-variation-settings 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    })),
    animateToVariations: jest.fn(),
  })),
}));

const mockFontConfig = {
  fontFamily: 'Inter',
  variations: { weight: 400 },
  transitionDuration: 300,
};

describe('VariableText', () => {
  it('should render with default props', () => {
    render(
      <VariableText fontConfig={mockFontConfig}>
        Test text
      </VariableText>
    );

    expect(screen.getByText('Test text')).toBeInTheDocument();
  });

  it('should render with custom element type', () => {
    render(
      <VariableText as="h1" fontConfig={mockFontConfig}>
        Heading text
      </VariableText>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Heading text');
  });

  it('should apply interactive styles when interactive prop is true', () => {
    render(
      <VariableText fontConfig={mockFontConfig} interactive>
        Interactive text
      </VariableText>
    );

    const element = screen.getByText('Interactive text');
    expect(element).toHaveClass('cursor-pointer', 'select-none');
  });

  it('should handle hover interactions', async () => {
    const mockAnimateToVariations = jest.fn();
    const { useVariableFont } = require('../../hooks/useVariableFont');
    
    useVariableFont.mockReturnValue({
      isLoaded: true,
      isSupported: true,
      currentVariations: { weight: 400 },
      error: null,
      updateVariations: jest.fn(),
      getFontStyles: jest.fn(() => ({})),
      animateToVariations: mockAnimateToVariations,
    });

    render(
      <VariableText 
        fontConfig={mockFontConfig} 
        hoverVariations={{ weight: 700 }}
        interactive
      >
        Hover text
      </VariableText>
    );

    const element = screen.getByText('Hover text');
    
    fireEvent.mouseEnter(element);
    expect(mockAnimateToVariations).toHaveBeenCalledWith({ weight: 700 }, 200);

    fireEvent.mouseLeave(element);
    expect(mockAnimateToVariations).toHaveBeenCalledWith({ weight: 400 }, 200);
  });

  it('should handle active interactions', () => {
    const mockUpdateVariations = jest.fn();
    const mockAnimateToVariations = jest.fn();
    const { useVariableFont } = require('../../hooks/useVariableFont');
    
    useVariableFont.mockReturnValue({
      isLoaded: true,
      isSupported: true,
      currentVariations: { weight: 400 },
      error: null,
      updateVariations: mockUpdateVariations,
      getFontStyles: jest.fn(() => ({})),
      animateToVariations: mockAnimateToVariations,
    });

    render(
      <VariableText 
        fontConfig={mockFontConfig} 
        activeVariations={{ weight: 800 }}
        interactive
      >
        Active text
      </VariableText>
    );

    const element = screen.getByText('Active text');
    
    fireEvent.mouseDown(element);
    expect(mockUpdateVariations).toHaveBeenCalledWith({ weight: 800 });

    fireEvent.mouseUp(element);
    expect(mockAnimateToVariations).toHaveBeenCalledWith({ weight: 400 }, 150);
  });

  it('should handle focus interactions', () => {
    const mockAnimateToVariations = jest.fn();
    const { useVariableFont } = require('../../hooks/useVariableFont');
    
    useVariableFont.mockReturnValue({
      isLoaded: true,
      isSupported: true,
      currentVariations: { weight: 400 },
      error: null,
      updateVariations: jest.fn(),
      getFontStyles: jest.fn(() => ({})),
      animateToVariations: mockAnimateToVariations,
    });

    render(
      <VariableText 
        fontConfig={mockFontConfig} 
        focusVariations={{ weight: 600 }}
        interactive
        tabIndex={0}
      >
        Focusable text
      </VariableText>
    );

    const element = screen.getByText('Focusable text');
    
    fireEvent.focus(element);
    expect(mockAnimateToVariations).toHaveBeenCalledWith({ weight: 600 }, 200);

    fireEvent.blur(element);
    expect(mockAnimateToVariations).toHaveBeenCalledWith({ weight: 400 }, 200);
  });

  it('should show loading state when font is not loaded', () => {
    const { useVariableFont } = require('../../hooks/useVariableFont');
    
    useVariableFont.mockReturnValue({
      isLoaded: false,
      isSupported: true,
      currentVariations: { weight: 400 },
      error: null,
      updateVariations: jest.fn(),
      getFontStyles: jest.fn(() => ({})),
      animateToVariations: jest.fn(),
    });

    render(
      <VariableText fontConfig={mockFontConfig}>
        Loading text
      </VariableText>
    );

    const loadingElement = screen.getByRole('generic');
    expect(loadingElement).toHaveClass('animate-pulse');
    expect(screen.queryByText('Loading text')).not.toBeInTheDocument();
  });

  it('should handle font loading errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { useVariableFont } = require('../../hooks/useVariableFont');
    
    useVariableFont.mockReturnValue({
      isLoaded: true,
      isSupported: true,
      currentVariations: { weight: 400 },
      error: 'Font loading failed',
      updateVariations: jest.fn(),
      getFontStyles: jest.fn(() => ({})),
      animateToVariations: jest.fn(),
    });

    render(
      <VariableText fontConfig={mockFontConfig}>
        Error text
      </VariableText>
    );

    expect(consoleSpy).toHaveBeenCalledWith('VariableText font loading error: Font loading failed');
    expect(screen.getByText('Error text')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLSpanElement>();
    
    render(
      <VariableText ref={ref} fontConfig={mockFontConfig}>
        Ref text
      </VariableText>
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toBe('Ref text');
  });

  it('should pass through additional props', () => {
    render(
      <VariableText 
        fontConfig={mockFontConfig}
        data-testid="custom-test-id"
        aria-label="Custom label"
      >
        Props text
      </VariableText>
    );

    const element = screen.getByTestId('custom-test-id');
    expect(element).toHaveAttribute('aria-label', 'Custom label');
  });
});