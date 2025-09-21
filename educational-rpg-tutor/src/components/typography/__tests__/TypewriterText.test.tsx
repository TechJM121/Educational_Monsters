import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { TypewriterText } from '../TypewriterText';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock timers
jest.useFakeTimers();

describe('TypewriterText', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should render initial empty state', () => {
    render(<TypewriterText text="Hello World" speed={50} />);
    
    const element = screen.getByText('|');
    expect(element).toBeInTheDocument();
  });

  it('should type text character by character', async () => {
    const onComplete = jest.fn();
    render(
      <TypewriterText 
        text="Hello" 
        speed={50} 
        delay={0}
        onComplete={onComplete}
      />
    );

    // Fast-forward through typing animation
    act(() => {
      jest.advanceTimersByTime(250); // 5 characters * 50ms
    });

    await waitFor(() => {
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('should handle array of texts with looping', async () => {
    const texts = ['First', 'Second', 'Third'];
    render(
      <TypewriterText 
        text={texts}
        speed={50}
        loop
        pauseDuration={100}
      />
    );

    // Type first text
    act(() => {
      jest.advanceTimersByTime(250); // 5 characters * 50ms
    });

    await waitFor(() => {
      expect(screen.getByText(/First/)).toBeInTheDocument();
    });

    // Wait for pause and next text
    act(() => {
      jest.advanceTimersByTime(100); // pause duration
    });

    act(() => {
      jest.advanceTimersByTime(300); // 6 characters * 50ms
    });

    await waitFor(() => {
      expect(screen.getByText(/Second/)).toBeInTheDocument();
    });
  });

  it('should show custom cursor character', () => {
    render(
      <TypewriterText 
        text="Test" 
        cursor={true}
        cursorChar="▋"
      />
    );

    expect(screen.getByText('▋')).toBeInTheDocument();
  });

  it('should hide cursor when cursor prop is false', () => {
    render(
      <TypewriterText 
        text="Test" 
        cursor={false}
      />
    );

    expect(screen.queryByText('|')).not.toBeInTheDocument();
  });

  it('should call onStart callback when typing begins', async () => {
    const onStart = jest.fn();
    render(
      <TypewriterText 
        text="Test" 
        speed={50}
        onStart={onStart}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(onStart).toHaveBeenCalled();
  });

  it('should handle delay before starting', async () => {
    const onStart = jest.fn();
    render(
      <TypewriterText 
        text="Test" 
        speed={50}
        delay={200}
        onStart={onStart}
      />
    );

    // Should not start immediately
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onStart).not.toHaveBeenCalled();

    // Should start after delay
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(onStart).toHaveBeenCalled();
  });

  it('should render with custom className and element', () => {
    render(
      <TypewriterText 
        text="Test" 
        className="custom-class"
        as="div"
      />
    );

    const element = screen.getByText('|').closest('div');
    expect(element).toHaveClass('custom-class');
  });

  it('should cleanup timers on unmount', () => {
    const { unmount } = render(<TypewriterText text="Test" speed={50} />);
    
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should handle empty text gracefully', () => {
    render(<TypewriterText text="" speed={50} />);
    
    // Should render cursor but no text
    expect(screen.getByText('|')).toBeInTheDocument();
  });

  it('should handle single character text', async () => {
    const onComplete = jest.fn();
    render(
      <TypewriterText 
        text="A" 
        speed={50}
        onComplete={onComplete}
      />
    );

    act(() => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => {
      expect(screen.getByText(/A/)).toBeInTheDocument();
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('should handle very fast typing speed', async () => {
    render(<TypewriterText text="Fast" speed={1} />);

    act(() => {
      jest.advanceTimersByTime(4);
    });

    await waitFor(() => {
      expect(screen.getByText(/Fast/)).toBeInTheDocument();
    });
  });

  it('should maintain cursor blinking during typing', () => {
    render(<TypewriterText text="Test" speed={100} />);

    // Initial cursor should be visible
    expect(screen.getByText('|')).toBeInTheDocument();

    // Advance cursor blink cycle
    act(() => {
      jest.advanceTimersByTime(530);
    });

    // Cursor should still be present (blinking is handled by CSS/animation)
    expect(screen.getByText('|')).toBeInTheDocument();
  });
});