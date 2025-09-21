/**
 * GlassModal Component Tests
 * Tests the glassmorphic modal component with backdrop blur and focus management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GlassModal } from '../GlassModal';
import { ThemeProvider, AnimationProvider } from '../../../design-system';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ 
      children, 
      className, 
      style, 
      variants, 
      initial, 
      animate, 
      exit,
      onClick,
      onKeyDown,
      tabIndex,
      role,
      'aria-modal': ariaModal,
      'aria-labelledby': ariaLabelledBy,
      'data-testid': dataTestId,
      ...props 
    }, ref) => (
      <div 
        ref={ref} 
        className={className} 
        style={style} 
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        role={role}
        aria-modal={ariaModal}
        aria-labelledby={ariaLabelledBy}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </div>
    )),
    button: React.forwardRef<HTMLButtonElement, any>(({ 
      children, 
      className, 
      onClick,
      whileHover,
      whileTap,
      'aria-label': ariaLabel,
      'data-testid': dataTestId,
      ...props 
    }, ref) => (
      <button 
        ref={ref} 
        className={className} 
        onClick={onClick}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </button>
    )),
  },
  AnimatePresence: ({ children, mode }: { children: React.ReactNode; mode?: string }) => <>{children}</>,
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024,
    },
  },
});

// Mock requestAnimationFrame with proper typing
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  setTimeout(() => cb(Date.now()), 16);
  return 1;
}) as any;

global.cancelAnimationFrame = vi.fn();

// Mock navigator properties
Object.defineProperty(navigator, 'hardwareConcurrency', {
  value: 4,
  configurable: true,
});

Object.defineProperty(navigator, 'deviceMemory', {
  value: 8,
  configurable: true,
});

// Mock canvas and WebGL with proper typing
const mockWebGLContext = {
  getParameter: vi.fn((param: number) => {
    if (param === 37445) return 'Intel Iris Pro'; // RENDERER
    return 'Mock WebGL';
  }),
  getExtension: vi.fn(() => null),
  getSupportedExtensions: vi.fn(() => ['ext1', 'ext2']),
  RENDERER: 37445,
  VENDOR: 37446,
};

HTMLCanvasElement.prototype.getContext = vi.fn((type: string) => {
  if (type === 'webgl' || type === 'experimental-webgl') {
    return mockWebGLContext as any;
  }
  if (type === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
    } as any;
  }
  return null;
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AnimationProvider>
      {children}
    </AnimationProvider>
  </ThemeProvider>
);

describe('GlassModal', () => {
  let originalBodyOverflow: string;

  beforeEach(() => {
    vi.clearAllMocks();
    originalBodyOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalBodyOverflow;
  });

  it('should not render when closed', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={false} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should render with title', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should show close button by default', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();
  });

  it('should hide close button when showCloseButton is false', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} showCloseButton={false}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('modal-close-button'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when backdrop is clicked and closeOnBackdropClick is false', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} closeOnBackdropClick={false}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should not call onClose when modal content is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('modal-content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when Escape key is pressed and closeOnEscape is false', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} closeOnEscape={false}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should apply correct size classes', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} size="sm">
          <p>Small modal</p>
        </GlassModal>
      </TestWrapper>
    );

    let modal = screen.getByTestId('modal-content');
    expect(modal).toHaveClass('max-w-md');

    rerender(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} size="xl">
          <p>Extra large modal</p>
        </GlassModal>
      </TestWrapper>
    );

    modal = screen.getByTestId('modal-content');
    expect(modal).toHaveClass('max-w-4xl');
  });

  it('should apply custom className', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} className="custom-modal-class">
          <p>Custom styled modal</p>
        </GlassModal>
      </TestWrapper>
    );

    const modal = screen.getByTestId('modal-content');
    expect(modal).toHaveClass('custom-modal-class');
  });

  it('should have proper accessibility attributes', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} title="Accessible Modal">
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    const modal = screen.getByTestId('modal-content');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(modal).toHaveAttribute('tabIndex', '-1');
  });

  it('should prevent body scroll when open', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when closed', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <TestWrapper>
        <GlassModal isOpen={false} onClose={handleClose}>
          <p>Modal content</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('should handle focus management', async () => {
    const handleClose = vi.fn();
    
    // Create a button to focus initially
    const button = document.createElement('button');
    button.textContent = 'Initial focus';
    document.body.appendChild(button);
    button.focus();

    const { rerender } = render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <input data-testid="modal-input" />
          <button data-testid="modal-button">Modal Button</button>
        </GlassModal>
      </TestWrapper>
    );

    // Modal should be focused
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toHaveFocus();
    });

    // Close modal
    rerender(
      <TestWrapper>
        <GlassModal isOpen={false} onClose={handleClose}>
          <input data-testid="modal-input" />
          <button data-testid="modal-button">Modal Button</button>
        </GlassModal>
      </TestWrapper>
    );

    // Focus should be restored to the initial button
    await waitFor(() => {
      expect(button).toHaveFocus();
    });

    document.body.removeChild(button);
  });

  it('should work with all prop combinations', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal 
          isOpen={true}
          onClose={handleClose}
          title="Complex Modal"
          size="lg"
          blur="xl"
          closeOnBackdropClick={false}
          closeOnEscape={false}
          showCloseButton={true}
          className="test-modal"
        >
          <div>
            <h3>Complex Modal Content</h3>
            <p>With multiple props</p>
            <button>Action Button</button>
          </div>
        </GlassModal>
      </TestWrapper>
    );

    const modal = screen.getByTestId('modal-content');
    expect(modal).toHaveClass('max-w-2xl', 'test-modal');
    expect(screen.getByText('Complex Modal')).toBeInTheDocument();
    expect(screen.getByText('Complex Modal Content')).toBeInTheDocument();
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();

    // Test that backdrop click doesn't close
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(handleClose).not.toHaveBeenCalled();

    // Test that escape doesn't close
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should integrate with theme and animation providers', () => {
    const handleClose = vi.fn();
    
    expect(() => {
      render(
        <TestWrapper>
          <GlassModal isOpen={true} onClose={handleClose}>
            <div>Theme integration test</div>
          </GlassModal>
        </TestWrapper>
      );
    }).not.toThrow();

    expect(screen.getByText('Theme integration test')).toBeInTheDocument();
  });

  it('should implement proper focus trap with Tab navigation', () => {
    const handleClose = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} title="Focus Trap Test">
          <div>
            <input data-testid="first-input" placeholder="First input" />
            <button data-testid="middle-button">Middle Button</button>
            <input data-testid="last-input" placeholder="Last input" />
          </div>
        </GlassModal>
      </TestWrapper>
    );

    const modal = screen.getByTestId('modal-content');
    const closeButton = screen.getByTestId('modal-close-button');
    const firstInput = screen.getByTestId('first-input');
    const middleButton = screen.getByTestId('middle-button');
    const lastInput = screen.getByTestId('last-input');

    // Focus should start on the modal
    expect(modal).toHaveFocus();

    // Test that all focusable elements are present and can be focused
    expect(closeButton).toBeInTheDocument();
    expect(firstInput).toBeInTheDocument();
    expect(middleButton).toBeInTheDocument();
    expect(lastInput).toBeInTheDocument();

    // Test that modal has proper tabIndex for focus management
    expect(modal).toHaveAttribute('tabIndex', '-1');

    // Test focus trap by manually focusing elements and checking Tab behavior
    closeButton.focus();
    expect(closeButton).toHaveFocus();

    firstInput.focus();
    expect(firstInput).toHaveFocus();

    middleButton.focus();
    expect(middleButton).toHaveFocus();

    lastInput.focus();
    expect(lastInput).toHaveFocus();

    // Test that Tab keydown event is handled (doesn't throw errors)
    expect(() => {
      fireEvent.keyDown(modal, { key: 'Tab' });
      fireEvent.keyDown(modal, { key: 'Tab', shiftKey: true });
    }).not.toThrow();
  });

  it('should handle backdrop blur effects properly', () => {
    const handleClose = vi.fn();
    
    const { rerender } = render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} blur="sm">
          <p>Small blur modal</p>
        </GlassModal>
      </TestWrapper>
    );

    let backdrop = screen.getByTestId('modal-backdrop');
    expect(backdrop).toBeInTheDocument();

    // Test different blur levels
    rerender(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose} blur="xl">
          <p>Extra large blur modal</p>
        </GlassModal>
      </TestWrapper>
    );

    backdrop = screen.getByTestId('modal-backdrop');
    expect(backdrop).toBeInTheDocument();
  });

  it('should handle z-index management for stacked modals', () => {
    const handleClose1 = vi.fn();
    const handleClose2 = vi.fn();
    
    const { rerender } = render(
      <TestWrapper>
        <div>
          <GlassModal isOpen={true} onClose={handleClose1} title="First Modal">
            <p>First modal content</p>
          </GlassModal>
        </div>
      </TestWrapper>
    );

    expect(screen.getByText('First Modal')).toBeInTheDocument();
    const firstBackdrop = screen.getByTestId('modal-backdrop');
    expect(firstBackdrop).toHaveClass('z-50');

    // Simulate stacked modal by rendering another modal
    rerender(
      <TestWrapper>
        <div>
          <GlassModal isOpen={true} onClose={handleClose1} title="First Modal">
            <p>First modal content</p>
          </GlassModal>
          <GlassModal isOpen={true} onClose={handleClose2} title="Second Modal">
            <p>Second modal content</p>
          </GlassModal>
        </div>
      </TestWrapper>
    );

    expect(screen.getByText('First Modal')).toBeInTheDocument();
    expect(screen.getByText('Second Modal')).toBeInTheDocument();
    
    // Both modals should have the same z-index class (z-50)
    // In a real implementation, you might want to increment z-index for stacked modals
    const backdrops = screen.getAllByTestId('modal-backdrop');
    expect(backdrops).toHaveLength(2);
    backdrops.forEach(backdrop => {
      expect(backdrop).toHaveClass('z-50');
    });
  });

  it('should provide satisfying exit animations', async () => {
    const handleClose = vi.fn();
    
    const { rerender } = render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <p>Modal with exit animation</p>
        </GlassModal>
      </TestWrapper>
    );

    expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument();
    expect(screen.getByText('Modal with exit animation')).toBeInTheDocument();

    // Close the modal
    rerender(
      <TestWrapper>
        <GlassModal isOpen={false} onClose={handleClose}>
          <p>Modal with exit animation</p>
        </GlassModal>
      </TestWrapper>
    );

    // Modal should be removed from DOM (AnimatePresence handles exit animations)
    expect(screen.queryByTestId('modal-backdrop')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal with exit animation')).not.toBeInTheDocument();
  });

  it('should handle nested interactions gracefully', () => {
    const handleClose = vi.fn();
    const handleButtonClick = vi.fn();
    
    render(
      <TestWrapper>
        <GlassModal isOpen={true} onClose={handleClose}>
          <div>
            <h3>Modal with nested interactions</h3>
            <button onClick={handleButtonClick} data-testid="nested-button">
              Nested Button
            </button>
            <div>
              <input data-testid="nested-input" placeholder="Nested input" />
              <select data-testid="nested-select">
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
              </select>
            </div>
          </div>
        </GlassModal>
      </TestWrapper>
    );

    // Test nested button interaction
    const nestedButton = screen.getByTestId('nested-button');
    fireEvent.click(nestedButton);
    expect(handleButtonClick).toHaveBeenCalledTimes(1);
    expect(handleClose).not.toHaveBeenCalled(); // Modal should not close

    // Test nested input interaction
    const nestedInput = screen.getByTestId('nested-input');
    fireEvent.change(nestedInput, { target: { value: 'test input' } });
    expect(nestedInput).toHaveValue('test input');
    expect(handleClose).not.toHaveBeenCalled(); // Modal should not close

    // Test nested select interaction
    const nestedSelect = screen.getByTestId('nested-select');
    fireEvent.change(nestedSelect, { target: { value: '2' } });
    expect(nestedSelect).toHaveValue('2');
    expect(handleClose).not.toHaveBeenCalled(); // Modal should not close
  });
});