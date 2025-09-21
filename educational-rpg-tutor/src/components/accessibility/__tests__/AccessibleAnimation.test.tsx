/**
 * Tests for AccessibleAnimation components
 * Ensures proper screen reader compatibility and ARIA attributes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessibleAnimation, AccessibleAnimatedButton, AccessibleAnimatedModal } from '../AccessibleAnimation';
import { useScreenReader } from '../../../hooks/useScreenReader';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

// Mock the hooks
jest.mock('../../../hooks/useScreenReader');
jest.mock('../../../hooks/useReducedMotion');

const mockUseScreenReader = useScreenReader as jest.MockedFunction<typeof useScreenReader>;
const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));

describe('AccessibleAnimation', () => {
  const mockAnnounceAnimationState = jest.fn();
  const mockCreateAnnouncers = jest.fn(() => <div data-testid="announcers" />);

  beforeEach(() => {
    mockUseScreenReader.mockReturnValue({
      state: {
        isScreenReaderActive: true,
        announcements: [],
        focusedElement: null,
      },
      announce: jest.fn(),
      announceAnimationState: mockAnnounceAnimationState,
      announceLoadingState: jest.fn(),
      announceNavigation: jest.fn(),
      announceValidation: jest.fn(),
      clearAnnouncements: jest.fn(),
      createAnnouncers: mockCreateAnnouncers,
      isScreenReaderActive: true,
    });

    mockUseReducedMotion.mockReturnValue({
      preferences: {
        prefersReducedMotion: false,
        animationDuration: 1,
        animationIntensity: 1,
        enableMicroAnimations: true,
        enableTransitions: true,
        enableParticles: true,
      },
      controls: {
        setAnimationDuration: jest.fn(),
        setAnimationIntensity: jest.fn(),
        toggleMicroAnimations: jest.fn(),
        toggleTransitions: jest.fn(),
        toggleParticles: jest.fn(),
        resetToDefaults: jest.fn(),
      },
      shouldReduceMotion: false,
      animationDuration: 1,
      animationIntensity: 1,
      enableMicroAnimations: true,
      enableTransitions: true,
      enableParticles: true,
    });

    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should render children correctly', () => {
      render(
        <AccessibleAnimation animationType="micro">
          <div>Test content</div>
        </AccessibleAnimation>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should apply correct ARIA attributes when not animating', () => {
      render(
        <AccessibleAnimation 
          animationType="micro"
          ariaLabel="Test animation"
          data-testid="animation-container"
        >
          <div>Content</div>
        </AccessibleAnimation>
      );

      const container = screen.getByTestId('animation-container');
      expect(container).toHaveAttribute('aria-label', 'Test animation');
      expect(container).toHaveAttribute('aria-busy', 'false');
    });

    it('should create announcers when screen reader is active', () => {
      render(
        <AccessibleAnimation animationType="micro">
          <div>Content</div>
        </AccessibleAnimation>
      );

      expect(mockCreateAnnouncers).toHaveBeenCalled();
      expect(screen.getByTestId('announcers')).toBeInTheDocument();
    });

    it('should not create announcers when screen reader is not active', () => {
      mockUseScreenReader.mockReturnValue({
        ...mockUseScreenReader(),
        isScreenReaderActive: false,
      });

      render(
        <AccessibleAnimation animationType="micro">
          <div>Content</div>
        </AccessibleAnimation>
      );

      expect(screen.queryByTestId('announcers')).not.toBeInTheDocument();
    });
  });

  describe('animation lifecycle', () => {
    it('should handle animation start events', async () => {
      const onAnimationStart = jest.fn();
      
      render(
        <AccessibleAnimation 
          animationType="micro"
          announceStart={true}
          onAnimationStart={onAnimationStart}
          data-testid="animation-container"
        >
          <div>Content</div>
        </AccessibleAnimation>
      );

      const container = screen.getByTestId('animation-container');
      
      // Simulate animation start
      fireEvent.animationStart(container);

      await waitFor(() => {
        expect(onAnimationStart).toHaveBeenCalled();
        expect(mockAnnounceAnimationState).toHaveBeenCalledWith('micro', 'started', undefined);
      });
    });

    it('should handle animation complete events', async () => {
      const onAnimationComplete = jest.fn();
      
      render(
        <AccessibleAnimation 
          animationType="micro"
          announceComplete={true}
          onAnimationComplete={onAnimationComplete}
          data-testid="animation-container"
        >
          <div>Content</div>
        </AccessibleAnimation>
      );

      const container = screen.getByTestId('animation-container');
      
      // Simulate animation end
      fireEvent.animationEnd(container);

      await waitFor(() => {
        expect(onAnimationComplete).toHaveBeenCalled();
        expect(mockAnnounceAnimationState).toHaveBeenCalledWith('micro', 'completed', undefined);
      });
    });

    it('should announce with description when provided', async () => {
      render(
        <AccessibleAnimation 
          animationType="transition"
          description="page slide"
          announceStart={true}
          data-testid="animation-container"
        >
          <div>Content</div>
        </AccessibleAnimation>
      );

      const container = screen.getByTestId('animation-container');
      fireEvent.animationStart(container);

      await waitFor(() => {
        expect(mockAnnounceAnimationState).toHaveBeenCalledWith('transition', 'started', 'page slide');
      });
    });
  });

  describe('focus management', () => {
    it('should save and restore focus when maintainFocus is true', async () => {
      const mockSaveFocus = jest.fn();
      const mockRestoreFocus = jest.fn();

      // Mock the focus management hook
      jest.doMock('../../../hooks/useScreenReader', () => ({
        ...jest.requireActual('../../../hooks/useScreenReader'),
        useFocusManagement: () => ({
          saveFocus: mockSaveFocus,
          restoreFocus: mockRestoreFocus,
          trapFocus: jest.fn(),
          releaseFocusTrap: jest.fn(),
        }),
      }));

      render(
        <AccessibleAnimation 
          animationType="transition"
          maintainFocus={true}
          data-testid="animation-container"
        >
          <div>Content</div>
        </AccessibleAnimation>
      );

      const container = screen.getByTestId('animation-container');
      
      fireEvent.animationStart(container);
      await waitFor(() => {
        expect(mockSaveFocus).toHaveBeenCalled();
      });

      fireEvent.animationEnd(container);
      await waitFor(() => {
        expect(mockRestoreFocus).toHaveBeenCalled();
      });
    });
  });
});

describe('AccessibleAnimatedButton', () => {
  beforeEach(() => {
    mockUseScreenReader.mockReturnValue({
      state: {
        isScreenReaderActive: true,
        announcements: [],
        focusedElement: null,
      },
      announce: jest.fn(),
      announceAnimationState: jest.fn(),
      announceLoadingState: jest.fn(),
      announceNavigation: jest.fn(),
      announceValidation: jest.fn(),
      clearAnnouncements: jest.fn(),
      createAnnouncers: jest.fn(),
      isScreenReaderActive: true,
    });

    mockUseReducedMotion.mockReturnValue({
      preferences: {
        prefersReducedMotion: false,
        animationDuration: 1,
        animationIntensity: 1,
        enableMicroAnimations: true,
        enableTransitions: true,
        enableParticles: true,
      },
      controls: {
        setAnimationDuration: jest.fn(),
        setAnimationIntensity: jest.fn(),
        toggleMicroAnimations: jest.fn(),
        toggleTransitions: jest.fn(),
        toggleParticles: jest.fn(),
        resetToDefaults: jest.fn(),
      },
      shouldReduceMotion: false,
      animationDuration: 1,
      animationIntensity: 1,
      enableMicroAnimations: true,
      enableTransitions: true,
      enableParticles: true,
    });

    jest.clearAllMocks();
  });

  it('should render button with correct attributes', () => {
    render(
      <AccessibleAnimatedButton ariaLabel="Test button">
        Click me
      </AccessibleAnimatedButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
    expect(button).toHaveTextContent('Click me');
  });

  it('should apply correct variant styles', () => {
    render(
      <AccessibleAnimatedButton variant="danger">
        Delete
      </AccessibleAnimatedButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-500');
  });

  it('should handle disabled state', () => {
    const onClick = jest.fn();
    
    render(
      <AccessibleAnimatedButton disabled onClick={onClick}>
        Disabled button
      </AccessibleAnimatedButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should announce button activation', () => {
    const mockAnnounce = jest.fn();
    mockUseScreenReader.mockReturnValue({
      ...mockUseScreenReader(),
      announce: mockAnnounce,
    });

    const onClick = jest.fn();
    
    render(
      <AccessibleAnimatedButton onClick={onClick}>
        Click me
      </AccessibleAnimatedButton>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockAnnounce).toHaveBeenCalledWith('Button activated', 'polite');
    expect(onClick).toHaveBeenCalled();
  });
});

describe('AccessibleAnimatedModal', () => {
  const mockAnnounce = jest.fn();

  beforeEach(() => {
    mockUseScreenReader.mockReturnValue({
      state: {
        isScreenReaderActive: true,
        announcements: [],
        focusedElement: null,
      },
      announce: mockAnnounce,
      announceAnimationState: jest.fn(),
      announceLoadingState: jest.fn(),
      announceNavigation: jest.fn(),
      announceValidation: jest.fn(),
      clearAnnouncements: jest.fn(),
      createAnnouncers: jest.fn(),
      isScreenReaderActive: true,
    });

    mockUseReducedMotion.mockReturnValue({
      preferences: {
        prefersReducedMotion: false,
        animationDuration: 1,
        animationIntensity: 1,
        enableMicroAnimations: true,
        enableTransitions: true,
        enableParticles: true,
      },
      controls: {
        setAnimationDuration: jest.fn(),
        setAnimationIntensity: jest.fn(),
        toggleMicroAnimations: jest.fn(),
        toggleTransitions: jest.fn(),
        toggleParticles: jest.fn(),
        resetToDefaults: jest.fn(),
      },
      shouldReduceMotion: false,
      animationDuration: 1,
      animationIntensity: 1,
      enableMicroAnimations: true,
      enableTransitions: true,
      enableParticles: true,
    });

    jest.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(
      <AccessibleAnimatedModal 
        isOpen={false} 
        onClose={jest.fn()} 
        title="Test Modal"
      >
        Modal content
      </AccessibleAnimatedModal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render with correct ARIA attributes when open', () => {
    render(
      <AccessibleAnimatedModal 
        isOpen={true} 
        onClose={jest.fn()} 
        title="Test Modal"
      >
        Modal content
      </AccessibleAnimatedModal>
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    
    const title = screen.getByText('Test Modal');
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  it('should announce modal opening', () => {
    render(
      <AccessibleAnimatedModal 
        isOpen={true} 
        onClose={jest.fn()} 
        title="Test Modal"
      >
        Modal content
      </AccessibleAnimatedModal>
    );

    expect(mockAnnounce).toHaveBeenCalledWith('Modal opened: Test Modal', 'polite');
  });

  it('should handle close button click', () => {
    const onClose = jest.fn();
    
    render(
      <AccessibleAnimatedModal 
        isOpen={true} 
        onClose={onClose} 
        title="Test Modal"
      >
        Modal content
      </AccessibleAnimatedModal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockAnnounce).toHaveBeenCalledWith('Modal closed', 'polite');
    expect(onClose).toHaveBeenCalled();
  });

  it('should display modal content', () => {
    render(
      <AccessibleAnimatedModal 
        isOpen={true} 
        onClose={jest.fn()} 
        title="Test Modal"
      >
        <p>This is modal content</p>
      </AccessibleAnimatedModal>
    );

    expect(screen.getByText('This is modal content')).toBeInTheDocument();
  });
});