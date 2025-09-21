/**
 * useScreenReader Hook
 * Provides screen reader compatibility utilities and announcements
 */

import { useEffect, useRef, useCallback, useState } from 'react';

export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  delay?: number;
}

export interface ScreenReaderState {
  isScreenReaderActive: boolean;
  announcements: ScreenReaderAnnouncement[];
  focusedElement: string | null;
}

export const useScreenReader = () => {
  const [state, setState] = useState<ScreenReaderState>({
    isScreenReaderActive: false,
    announcements: [],
    focusedElement: null,
  });

  const politeAnnouncerRef = useRef<HTMLDivElement>(null);
  const assertiveAnnouncerRef = useRef<HTMLDivElement>(null);
  const announcementTimeoutRef = useRef<NodeJS.Timeout>();

  // Detect if screen reader is likely active
  useEffect(() => {
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReaderClass = document.documentElement.classList.contains('sr-active');
      const hasAriaLive = document.querySelector('[aria-live]') !== null;
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Heuristic: if multiple accessibility features are enabled, likely using screen reader
      const accessibilityScore = [hasScreenReaderClass, hasAriaLive, hasHighContrast, hasReducedMotion].filter(Boolean).length;
      
      setState(prev => ({
        ...prev,
        isScreenReaderActive: accessibilityScore >= 2 || hasScreenReaderClass
      }));
    };

    detectScreenReader();

    // Listen for accessibility preference changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => detectScreenReader();
    
    contrastQuery.addEventListener('change', handleChange);
    motionQuery.addEventListener('change', handleChange);

    return () => {
      contrastQuery.removeEventListener('change', handleChange);
      motionQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Track focus changes for screen reader navigation
  useEffect(() => {
    const handleFocusChange = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const elementDescription = getElementDescription(target);
      
      setState(prev => ({
        ...prev,
        focusedElement: elementDescription
      }));
    };

    document.addEventListener('focusin', handleFocusChange);
    return () => document.removeEventListener('focusin', handleFocusChange);
  }, []);

  // Announce message to screen readers
  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite',
    delay: number = 0
  ) => {
    const announcement: ScreenReaderAnnouncement = { message, priority, delay };
    
    setState(prev => ({
      ...prev,
      announcements: [...prev.announcements, announcement]
    }));

    const executeAnnouncement = () => {
      const announcer = priority === 'assertive' ? assertiveAnnouncerRef.current : politeAnnouncerRef.current;
      
      if (announcer) {
        // Clear previous announcement
        announcer.textContent = '';
        
        // Add new announcement after a brief delay to ensure screen reader picks it up
        setTimeout(() => {
          announcer.textContent = message;
        }, 10);

        // Clear announcement after it's been read
        setTimeout(() => {
          announcer.textContent = '';
        }, 5000);
      }
    };

    if (delay > 0) {
      announcementTimeoutRef.current = setTimeout(executeAnnouncement, delay);
    } else {
      executeAnnouncement();
    }
  }, []);

  // Announce animation state changes
  const announceAnimationState = useCallback((
    elementType: string,
    state: 'started' | 'completed' | 'interrupted',
    description?: string
  ) => {
    if (!state.isScreenReaderActive) return;

    const messages = {
      started: `${elementType} animation started${description ? `: ${description}` : ''}`,
      completed: `${elementType} animation completed`,
      interrupted: `${elementType} animation stopped`
    };

    announce(messages[state], 'polite', 100);
  }, [announce, state.isScreenReaderActive]);

  // Announce loading states
  const announceLoadingState = useCallback((
    isLoading: boolean,
    context?: string,
    progress?: number
  ) => {
    if (!state.isScreenReaderActive) return;

    if (isLoading) {
      const message = context 
        ? `Loading ${context}${progress ? `, ${Math.round(progress)}% complete` : ''}` 
        : 'Loading content';
      announce(message, 'polite');
    } else {
      const message = context ? `${context} loaded` : 'Content loaded';
      announce(message, 'polite');
    }
  }, [announce, state.isScreenReaderActive]);

  // Announce navigation changes
  const announceNavigation = useCallback((
    from: string,
    to: string,
    method: 'click' | 'keyboard' | 'programmatic' = 'programmatic'
  ) => {
    if (!state.isScreenReaderActive) return;

    const message = `Navigated from ${from} to ${to}`;
    announce(message, 'polite', 200);
  }, [announce, state.isScreenReaderActive]);

  // Announce form validation
  const announceValidation = useCallback((
    fieldName: string,
    isValid: boolean,
    errorMessage?: string
  ) => {
    if (!state.isScreenReaderActive) return;

    const message = isValid 
      ? `${fieldName} is valid`
      : `${fieldName} error: ${errorMessage || 'Invalid input'}`;
    
    announce(message, 'assertive');
  }, [announce, state.isScreenReaderActive]);

  // Clear all pending announcements
  const clearAnnouncements = useCallback(() => {
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }
    
    setState(prev => ({
      ...prev,
      announcements: []
    }));

    // Clear announcer elements
    if (politeAnnouncerRef.current) {
      politeAnnouncerRef.current.textContent = '';
    }
    if (assertiveAnnouncerRef.current) {
      assertiveAnnouncerRef.current.textContent = '';
    }
  }, []);

  // Create screen reader announcer elements
  const createAnnouncers = useCallback(() => {
    return (
      <>
        <div
          ref={politeAnnouncerRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          role="status"
        />
        <div
          ref={assertiveAnnouncerRef}
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
          role="alert"
        />
      </>
    );
  }, []);

  return {
    state,
    announce,
    announceAnimationState,
    announceLoadingState,
    announceNavigation,
    announceValidation,
    clearAnnouncements,
    createAnnouncers,
    isScreenReaderActive: state.isScreenReaderActive,
  };
};

// Utility function to describe an element for screen readers
const getElementDescription = (element: HTMLElement): string => {
  if (!element) return 'unknown element';

  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const id = element.id;
  const className = element.className;

  let description = role || tagName;

  if (ariaLabel) {
    description += ` "${ariaLabel}"`;
  } else if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) {
      description += ` "${labelElement.textContent?.trim()}"`;
    }
  } else if (element.textContent?.trim()) {
    const text = element.textContent.trim().substring(0, 50);
    description += ` "${text}${element.textContent.length > 50 ? '...' : ''}"`;
  }

  if (id) {
    description += ` (id: ${id})`;
  }

  return description;
};

// Hook for managing focus during animations
export const useFocusManagement = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus();
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    focusTrapRef.current = container;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      focusTrapRef.current = null;
    };
  }, []);

  const releaseFocusTrap = useCallback(() => {
    if (focusTrapRef.current) {
      focusTrapRef.current = null;
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
    releaseFocusTrap,
  };
};