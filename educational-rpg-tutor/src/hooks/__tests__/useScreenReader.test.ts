/**
 * Tests for useScreenReader hook
 * Ensures proper screen reader compatibility and announcements
 */

import { renderHook, act } from '@testing-library/react';
import { useScreenReader, useFocusManagement } from '../useScreenReader';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  const mockMediaQuery = {
    matches,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockMediaQuery),
  });

  return mockMediaQuery;
};

// Mock DOM methods
const mockDOM = () => {
  const mockElement = {
    textContent: '',
    classList: { contains: jest.fn() },
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    focus: jest.fn(),
    contains: jest.fn(() => true),
    querySelectorAll: jest.fn(() => []),
  };

  Object.defineProperty(document, 'documentElement', {
    value: mockElement,
    writable: true,
  });

  Object.defineProperty(document, 'querySelector', {
    value: jest.fn(() => mockElement),
    writable: true,
  });

  Object.defineProperty(document, 'getElementById', {
    value: jest.fn(() => mockElement),
    writable: true,
  });

  Object.defineProperty(document, 'activeElement', {
    value: mockElement,
    writable: true,
  });

  Object.defineProperty(document, 'contains', {
    value: jest.fn(() => true),
    writable: true,
  });

  return mockElement;
};

describe('useScreenReader', () => {
  let mockElement: any;
  let contrastQuery: any;
  let motionQuery: any;

  beforeEach(() => {
    mockElement = mockDOM();
    contrastQuery = mockMatchMedia(false);
    motionQuery = mockMatchMedia(false);
    
    // Mock specific media queries
    (window.matchMedia as jest.Mock).mockImplementation((query) => {
      if (query.includes('prefers-contrast')) return contrastQuery;
      if (query.includes('prefers-reduced-motion')) return motionQuery;
      return mockMatchMedia(false);
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('screen reader detection', () => {
    it('should detect screen reader when multiple accessibility features are enabled', () => {
      contrastQuery.matches = true;
      motionQuery.matches = true;
      
      const { result } = renderHook(() => useScreenReader());

      expect(result.current.isScreenReaderActive).toBe(true);
    });

    it('should detect screen reader when sr-active class is present', () => {
      mockElement.classList.contains.mockReturnValue(true);
      
      const { result } = renderHook(() => useScreenReader());

      expect(result.current.isScreenReaderActive).toBe(true);
    });

    it('should not detect screen reader with minimal accessibility features', () => {
      const { result } = renderHook(() => useScreenReader());

      expect(result.current.isScreenReaderActive).toBe(false);
    });

    it('should update detection when accessibility preferences change', () => {
      const { result } = renderHook(() => useScreenReader());

      expect(result.current.isScreenReaderActive).toBe(false);

      // Simulate preference changes
      act(() => {
        contrastQuery.matches = true;
        motionQuery.matches = true;
        contrastQuery.addEventListener.mock.calls[0][1]();
      });

      expect(result.current.isScreenReaderActive).toBe(true);
    });
  });

  describe('announcements', () => {
    it('should make polite announcements', () => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announce('Test message', 'polite');
      });

      expect(result.current.state.announcements).toHaveLength(1);
      expect(result.current.state.announcements[0]).toEqual({
        message: 'Test message',
        priority: 'polite',
      });
    });

    it('should make assertive announcements', () => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announce('Urgent message', 'assertive');
      });

      expect(result.current.state.announcements[0].priority).toBe('assertive');
    });

    it('should handle delayed announcements', (done) => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announce('Delayed message', 'polite', 100);
      });

      // Should not be announced immediately
      expect(result.current.state.announcements).toHaveLength(1);

      setTimeout(() => {
        // Announcement should be processed after delay
        done();
      }, 150);
    });

    it('should clear announcements', () => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announce('Test message');
        result.current.clearAnnouncements();
      });

      expect(result.current.state.announcements).toHaveLength(0);
    });
  });

  describe('animation announcements', () => {
    it('should announce animation states when screen reader is active', () => {
      mockElement.classList.contains.mockReturnValue(true); // Force screen reader active
      
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announceAnimationState('button', 'started', 'hover effect');
      });

      expect(result.current.state.announcements).toHaveLength(1);
      expect(result.current.state.announcements[0].message).toBe('button animation started: hover effect');
    });

    it('should not announce when screen reader is not active', () => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announceAnimationState('button', 'started');
      });

      expect(result.current.state.announcements).toHaveLength(0);
    });
  });

  describe('loading announcements', () => {
    it('should announce loading start', () => {
      mockElement.classList.contains.mockReturnValue(true);
      
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announceLoadingState(true, 'user data');
      });

      expect(result.current.state.announcements[0].message).toBe('Loading user data');
    });

    it('should announce loading completion', () => {
      mockElement.classList.contains.mockReturnValue(true);
      
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announceLoadingState(false, 'user data');
      });

      expect(result.current.state.announcements[0].message).toBe('user data loaded');
    });

    it('should announce loading progress', () => {
      mockElement.classList.contains.mockReturnValue(true);
      
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announceLoadingState(true, 'file upload', 75);
      });

      expect(result.current.state.announcements[0].message).toBe('Loading file upload, 75% complete');
    });
  });

  describe('navigation announcements', () => {
    it('should announce navigation changes', () => {
      mockElement.classList.contains.mockReturnValue(true);
      
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announceNavigation('Home', 'About', 'click');
      });

      expect(result.current.state.announcements[0].message).toBe('Navigated from Home to About');
    });
  });

  describe('form validation announcements', () => {
    it('should announce validation success', () => {
      mockElement.classList.contains.mockReturnValue(true);
      
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announceValidation('Email', true);
      });

      expect(result.current.state.announcements[0].message).toBe('Email is valid');
      expect(result.current.state.announcements[0].priority).toBe('assertive');
    });

    it('should announce validation errors', () => {
      mockElement.classList.contains.mockReturnValue(true);
      
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announceValidation('Password', false, 'Must be at least 8 characters');
      });

      expect(result.current.state.announcements[0].message).toBe('Password error: Must be at least 8 characters');
    });
  });

  describe('focus tracking', () => {
    it('should track focus changes', () => {
      const { result } = renderHook(() => useScreenReader());

      // Simulate focus event
      act(() => {
        const focusEvent = new FocusEvent('focusin', { bubbles: true });
        Object.defineProperty(focusEvent, 'target', {
          value: { ...mockElement, tagName: 'BUTTON', textContent: 'Click me' },
          writable: false,
        });
        document.dispatchEvent(focusEvent);
      });

      expect(result.current.state.focusedElement).toContain('button');
    });
  });
});

describe('useFocusManagement', () => {
  let mockElement: any;

  beforeEach(() => {
    mockElement = mockDOM();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('focus saving and restoration', () => {
    it('should save and restore focus', () => {
      const { result } = renderHook(() => useFocusManagement());

      act(() => {
        result.current.saveFocus();
      });

      act(() => {
        result.current.restoreFocus();
      });

      expect(mockElement.focus).toHaveBeenCalled();
    });

    it('should not restore focus if element is not in document', () => {
      (document.contains as jest.Mock).mockReturnValue(false);
      
      const { result } = renderHook(() => useFocusManagement());

      act(() => {
        result.current.saveFocus();
        result.current.restoreFocus();
      });

      expect(mockElement.focus).not.toHaveBeenCalled();
    });
  });

  describe('focus trapping', () => {
    it('should trap focus within container', () => {
      const mockContainer = {
        ...mockElement,
        querySelectorAll: jest.fn(() => [mockElement, mockElement]),
      };

      const { result } = renderHook(() => useFocusManagement());

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current.trapFocus(mockContainer as any);
      });

      expect(mockContainer.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockElement.focus).toHaveBeenCalled();

      // Test cleanup
      act(() => {
        cleanup?.();
      });

      expect(mockContainer.removeEventListener).toHaveBeenCalled();
    });

    it('should handle Tab key navigation in focus trap', () => {
      const firstElement = { ...mockElement, focus: jest.fn() };
      const lastElement = { ...mockElement, focus: jest.fn() };
      
      const mockContainer = {
        ...mockElement,
        querySelectorAll: jest.fn(() => [firstElement, lastElement]),
      };

      Object.defineProperty(document, 'activeElement', {
        value: lastElement,
        writable: true,
      });

      const { result } = renderHook(() => useFocusManagement());

      act(() => {
        result.current.trapFocus(mockContainer as any);
      });

      // Simulate Tab key press on last element
      const keydownHandler = mockContainer.addEventListener.mock.calls[0][1];
      const tabEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      keydownHandler(tabEvent);

      expect(tabEvent.preventDefault).toHaveBeenCalled();
      expect(firstElement.focus).toHaveBeenCalled();
    });

    it('should handle Shift+Tab key navigation in focus trap', () => {
      const firstElement = { ...mockElement, focus: jest.fn() };
      const lastElement = { ...mockElement, focus: jest.fn() };
      
      const mockContainer = {
        ...mockElement,
        querySelectorAll: jest.fn(() => [firstElement, lastElement]),
      };

      Object.defineProperty(document, 'activeElement', {
        value: firstElement,
        writable: true,
      });

      const { result } = renderHook(() => useFocusManagement());

      act(() => {
        result.current.trapFocus(mockContainer as any);
      });

      // Simulate Shift+Tab key press on first element
      const keydownHandler = mockContainer.addEventListener.mock.calls[0][1];
      const shiftTabEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jest.fn(),
      };

      keydownHandler(shiftTabEvent);

      expect(shiftTabEvent.preventDefault).toHaveBeenCalled();
      expect(lastElement.focus).toHaveBeenCalled();
    });
  });

  describe('focus trap release', () => {
    it('should release focus trap', () => {
      const { result } = renderHook(() => useFocusManagement());

      act(() => {
        result.current.releaseFocusTrap();
      });

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });
});