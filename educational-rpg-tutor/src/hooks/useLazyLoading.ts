import { useEffect, useRef, useState, useCallback } from 'react';

export interface LazyLoadingOptions {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  disabled?: boolean;
}

export const useLazyLoading = (options: LazyLoadingOptions = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true,
    disabled = false
  } = options;

  const [inView, setInView] = useState(disabled);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(() => {
    if (!elementRef.current || disabled || (triggerOnce && hasTriggered)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          
          if (isIntersecting) {
            setInView(true);
            setHasTriggered(true);
            
            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            setInView(false);
          }
        });
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(elementRef.current);
    observerRef.current = observer;
  }, [rootMargin, threshold, triggerOnce, disabled, hasTriggered]);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setInView(disabled);
    setHasTriggered(false);
    disconnect();
    observe();
  }, [disabled, disconnect, observe]);

  useEffect(() => {
    observe();
    return disconnect;
  }, [observe, disconnect]);

  // Handle disabled state changes
  useEffect(() => {
    if (disabled) {
      setInView(true);
      disconnect();
    } else if (!hasTriggered) {
      setInView(false);
      observe();
    }
  }, [disabled, hasTriggered, observe, disconnect]);

  return {
    elementRef,
    inView,
    hasTriggered,
    reset
  };
};