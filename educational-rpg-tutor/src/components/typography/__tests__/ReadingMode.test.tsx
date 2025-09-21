import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReadingModeProvider, useReadingMode, ReadableText, ReadingModeControls } from '../ReadingMode';

// Mock the readability optimization utils
jest.mock('../../utils/readabilityOptimization', () => ({
  generateReadabilityMetrics: jest.fn(() => ({
    fontSize: 18,
    lineHeight: 1.6,
    letterSpacing: 0.02,
    wordSpacing: 0.04,
    paragraphSpacing: 24,
    maxLineLength: 70,
    contrast: 7,
  })),
  generateReadabilityCSSProperties: jest.fn(() => ({
    '--readable-font-size': '18px',
    '--readable-line-height': '1.6',
    '--readable-letter-spacing': '0.02em',
    '--readable-word-spacing': '0.04em',
    '--readable-paragraph-spacing': '24px',
    '--readable-max-line-length': '70ch',
    '--readable-contrast-ratio': '7',
  })),
  getDyslexiaFriendlyFontStack: jest.fn(() => 'OpenDyslexic, sans-serif'),
  analyzeTextComplexity: jest.fn(() => ({
    averageWordsPerSentence: 15,
    averageSyllablesPerWord: 2,
    complexityScore: 'moderate',
    recommendedAdjustments: {
      fontSizeMultiplier: 1.1,
      lineHeightMultiplier: 1.2,
    },
  })),
}));

// Test component that uses the reading mode context
const TestComponent: React.FC = () => {
  const { isReadingMode, settings, toggleReadingMode, updateSettings } = useReadingMode();
  
  return (
    <div>
      <div data-testid="reading-mode-status">
        {isReadingMode ? 'Reading Mode On' : 'Reading Mode Off'}
      </div>
      <div data-testid="font-size-multiplier">
        {settings.fontSizeMultiplier}
      </div>
      <button onClick={toggleReadingMode} data-testid="toggle-button">
        Toggle
      </button>
      <button 
        onClick={() => updateSettings({ fontSizeMultiplier: 1.5 })}
        data-testid="update-settings-button"
      >
        Update Settings
      </button>
    </div>
  );
};

describe('ReadingModeProvider', () => {
  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock document.documentElement.style
    Object.defineProperty(document.documentElement, 'style', {
      value: {
        setProperty: jest.fn(),
        removeProperty: jest.fn(),
      },
      writable: true,
    });

    // Mock document.body.classList
    Object.defineProperty(document.body, 'classList', {
      value: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      writable: true,
    });
  });

  it('should provide reading mode context', () => {
    render(
      <ReadingModeProvider>
        <TestComponent />
      </ReadingModeProvider>
    );

    expect(screen.getByTestId('reading-mode-status')).toHaveTextContent('Reading Mode Off');
    expect(screen.getByTestId('font-size-multiplier')).toHaveTextContent('1');
  });

  it('should toggle reading mode', () => {
    render(
      <ReadingModeProvider>
        <TestComponent />
      </ReadingModeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('reading-mode-status')).toHaveTextContent('Reading Mode On');
  });

  it('should update settings', () => {
    render(
      <ReadingModeProvider>
        <TestComponent />
      </ReadingModeProvider>
    );

    const updateButton = screen.getByTestId('update-settings-button');
    fireEvent.click(updateButton);

    expect(screen.getByTestId('font-size-multiplier')).toHaveTextContent('1.5');
  });

  it('should apply CSS properties when reading mode is enabled', () => {
    render(
      <ReadingModeProvider>
        <TestComponent />
      </ReadingModeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    fireEvent.click(toggleButton);

    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--readable-font-size',
      '18px'
    );
    expect(document.body.classList.add).toHaveBeenCalledWith('reading-mode');
  });

  it('should remove CSS properties when reading mode is disabled', () => {
    render(
      <ReadingModeProvider>
        <TestComponent />
      </ReadingModeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    
    // Enable reading mode
    fireEvent.click(toggleButton);
    
    // Disable reading mode
    fireEvent.click(toggleButton);

    expect(document.body.classList.remove).toHaveBeenCalledWith('reading-mode');
    expect(document.documentElement.style.removeProperty).toHaveBeenCalledWith(
      '--readable-font-size'
    );
  });

  it('should handle default settings', () => {
    const defaultSettings = {
      fontSizeMultiplier: 1.2,
      contrastLevel: 'high' as const,
    };

    render(
      <ReadingModeProvider defaultSettings={defaultSettings}>
        <TestComponent />
      </ReadingModeProvider>
    );

    expect(screen.getByTestId('font-size-multiplier')).toHaveTextContent('1.2');
  });

  it('should detect reduced motion preference', async () => {
    const mockMatchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    render(
      <ReadingModeProvider>
        <TestComponent />
      </ReadingModeProvider>
    );

    await waitFor(() => {
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
  });
});

describe('ReadableText', () => {
  it('should render children with readable text classes', () => {
    render(
      <ReadingModeProvider>
        <ReadableText contentType="body">
          Test content
        </ReadableText>
      </ReadingModeProvider>
    );

    const element = screen.getByText('Test content');
    expect(element).toHaveClass('readable-text', 'readable-text--body');
  });

  it('should apply reading mode classes when active', () => {
    const TestWrapper = () => {
      const { toggleReadingMode } = useReadingMode();
      
      return (
        <div>
          <button onClick={toggleReadingMode} data-testid="toggle">
            Toggle
          </button>
          <ReadableText>Test content</ReadableText>
        </div>
      );
    };

    render(
      <ReadingModeProvider>
        <TestWrapper />
      </ReadingModeProvider>
    );

    const toggleButton = screen.getByTestId('toggle');
    fireEvent.click(toggleButton);

    const element = screen.getByText('Test content');
    expect(element).toHaveClass('reading-mode-active');
  });

  it('should auto-optimize based on text content', () => {
    render(
      <ReadingModeProvider>
        <ReadableText autoOptimize>
          This is a complex sentence with sophisticated vocabulary.
        </ReadableText>
      </ReadingModeProvider>
    );

    const element = screen.getByText(/This is a complex sentence/);
    expect(element).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ReadingModeProvider>
        <ReadableText className="custom-class">
          Test content
        </ReadableText>
      </ReadingModeProvider>
    );

    const element = screen.getByText('Test content');
    expect(element).toHaveClass('custom-class');
  });
});

describe('ReadingModeControls', () => {
  it('should render toggle button', () => {
    render(
      <ReadingModeProvider>
        <ReadingModeControls />
      </ReadingModeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /reading mode/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should show settings when reading mode is active', () => {
    const TestWrapper = () => {
      const { toggleReadingMode } = useReadingMode();
      
      return (
        <div>
          <button onClick={toggleReadingMode} data-testid="external-toggle">
            Toggle
          </button>
          <ReadingModeControls />
        </div>
      );
    };

    render(
      <ReadingModeProvider>
        <TestWrapper />
      </ReadingModeProvider>
    );

    const externalToggle = screen.getByTestId('external-toggle');
    fireEvent.click(externalToggle);

    expect(screen.getByLabelText(/font size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/line height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/letter spacing/i)).toBeInTheDocument();
  });

  it('should update font size setting', () => {
    const TestWrapper = () => {
      const { toggleReadingMode } = useReadingMode();
      
      return (
        <div>
          <button onClick={toggleReadingMode} data-testid="external-toggle">
            Toggle
          </button>
          <ReadingModeControls />
        </div>
      );
    };

    render(
      <ReadingModeProvider>
        <TestWrapper />
      </ReadingModeProvider>
    );

    const externalToggle = screen.getByTestId('external-toggle');
    fireEvent.click(externalToggle);

    const fontSizeSlider = screen.getByLabelText(/font size/i);
    fireEvent.change(fontSizeSlider, { target: { value: '1.5' } });

    expect(fontSizeSlider).toHaveValue('1.5');
  });

  it('should toggle dyslexia-friendly font', () => {
    const TestWrapper = () => {
      const { toggleReadingMode } = useReadingMode();
      
      return (
        <div>
          <button onClick={toggleReadingMode} data-testid="external-toggle">
            Toggle
          </button>
          <ReadingModeControls />
        </div>
      );
    };

    render(
      <ReadingModeProvider>
        <TestWrapper />
      </ReadingModeProvider>
    );

    const externalToggle = screen.getByTestId('external-toggle');
    fireEvent.click(externalToggle);

    const dyslexiaCheckbox = screen.getByLabelText(/dyslexia-friendly font/i);
    fireEvent.click(dyslexiaCheckbox);

    expect(dyslexiaCheckbox).toBeChecked();
  });

  it('should update contrast level', () => {
    const TestWrapper = () => {
      const { toggleReadingMode } = useReadingMode();
      
      return (
        <div>
          <button onClick={toggleReadingMode} data-testid="external-toggle">
            Toggle
          </button>
          <ReadingModeControls />
        </div>
      );
    };

    render(
      <ReadingModeProvider>
        <TestWrapper />
      </ReadingModeProvider>
    );

    const externalToggle = screen.getByTestId('external-toggle');
    fireEvent.click(externalToggle);

    const contrastSelect = screen.getByLabelText(/contrast/i);
    fireEvent.change(contrastSelect, { target: { value: 'high' } });

    expect(contrastSelect).toHaveValue('high');
  });

  it('should apply custom className', () => {
    render(
      <ReadingModeProvider>
        <ReadingModeControls className="custom-controls" />
      </ReadingModeProvider>
    );

    const controls = screen.getByRole('button', { name: /reading mode/i }).closest('.reading-mode-controls');
    expect(controls).toHaveClass('custom-controls');
  });
});

describe('Error handling', () => {
  it('should throw error when useReadingMode is used outside provider', () => {
    const TestComponent = () => {
      useReadingMode();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => render(<TestComponent />)).toThrow(
      'useReadingMode must be used within a ReadingModeProvider'
    );

    consoleSpy.mockRestore();
  });

  it('should handle missing window.matchMedia gracefully', () => {
    const originalMatchMedia = window.matchMedia;
    delete (window as any).matchMedia;

    expect(() => {
      render(
        <ReadingModeProvider>
          <TestComponent />
        </ReadingModeProvider>
      );
    }).not.toThrow();

    (window as any).matchMedia = originalMatchMedia;
  });
});

describe('Accessibility', () => {
  it('should have proper ARIA labels on controls', () => {
    const TestWrapper = () => {
      const { toggleReadingMode } = useReadingMode();
      
      return (
        <div>
          <button onClick={toggleReadingMode} data-testid="external-toggle">
            Toggle
          </button>
          <ReadingModeControls />
        </div>
      );
    };

    render(
      <ReadingModeProvider>
        <TestWrapper />
      </ReadingModeProvider>
    );

    const externalToggle = screen.getByTestId('external-toggle');
    fireEvent.click(externalToggle);

    expect(screen.getByLabelText(/font size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/line height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/letter spacing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrast/i)).toBeInTheDocument();
  });

  it('should update toggle button aria-label based on state', () => {
    render(
      <ReadingModeProvider>
        <ReadingModeControls />
      </ReadingModeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /enter reading mode/i });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(screen.getByRole('button', { name: /exit reading mode/i })).toBeInTheDocument();
  });
});