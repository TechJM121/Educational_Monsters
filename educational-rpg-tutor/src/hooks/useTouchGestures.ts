import { useRef, useCallback, useEffect } from 'react';

export interface TouchGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  pinchThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  lastTapTime: number;
  initialDistance: number;
  longPressTimer: NodeJS.Timeout | null;
}

export const useTouchGestures = (config: TouchGestureConfig) => {
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTapTime: 0,
    initialDistance: 0,
    longPressTimer: null
  });

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    longPressDelay = 500,
    doubleTapDelay = 300
  } = config;

  // Calculate distance between two touch points
  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  // Trigger haptic feedback if available
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    const currentTime = Date.now();
    
    touchState.current = {
      ...touchState.current,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: currentTime,
      initialDistance: getDistance(event.touches)
    };

    // Clear any existing long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
    }

    // Set up long press detection
    if (onLongPress) {
      touchState.current.longPressTimer = setTimeout(() => {
        triggerHaptic('medium');
        onLongPress();
      }, longPressDelay);
    }
  }, [getDistance, onLongPress, longPressDelay, triggerHaptic]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    // Clear long press timer on move
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }

    // Handle pinch gesture
    if (event.touches.length === 2 && onPinch) {
      const currentDistance = getDistance(event.touches);
      
      if (touchState.current.initialDistance > 0) {
        const scale = currentDistance / touchState.current.initialDistance;
        
        // Only trigger if scale change is significant
        if (Math.abs(scale - 1) > pinchThreshold) {
          onPinch(scale);
        }
      }
    }
  }, [getDistance, onPinch, pinchThreshold]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    // Clear long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }

    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - touchState.current.startX;
    const deltaY = endY - touchState.current.startY;
    const deltaTime = endTime - touchState.current.startTime;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Handle swipe gestures
    if (distance > swipeThreshold && deltaTime < 500) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          triggerHaptic('light');
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          triggerHaptic('light');
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          triggerHaptic('light');
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          triggerHaptic('light');
          onSwipeUp();
        }
      }
      return;
    }

    // Handle tap gestures (only if not a swipe)
    if (distance < 10 && deltaTime < 500) {
      const timeSinceLastTap = endTime - touchState.current.lastTapTime;
      
      if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
        triggerHaptic('medium');
        onDoubleTap();
        touchState.current.lastTapTime = 0; // Reset to prevent triple tap
      } else if (onTap) {
        // Delay single tap to allow for double tap detection
        setTimeout(() => {
          if (endTime === touchState.current.lastTapTime) {
            triggerHaptic('light');
            onTap();
          }
        }, doubleTapDelay);
        touchState.current.lastTapTime = endTime;
      }
    }
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    swipeThreshold,
    doubleTapDelay,
    triggerHaptic
  ]);

  const attachListeners = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (touchState.current.longPressTimer) {
        clearTimeout(touchState.current.longPressTimer);
      }
    };
  }, []);

  return {
    attachListeners,
    triggerHaptic
  };
};