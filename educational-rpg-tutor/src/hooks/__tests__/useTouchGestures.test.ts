import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTouchGestures } from '../useTouchGestures';

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true
});

describe('useTouchGestures', () => {
  let mockElement: HTMLElement;
  let mockConfig: any;

  beforeEach(() => {
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
    
    mockConfig = {
      onSwipeLeft: vi.fn(),
      onSwipeRight: vi.fn(),
      onSwipeUp: vi.fn(),
      onSwipeDown: vi.fn(),
      onPinch: vi.fn(),
      onTap: vi.fn(),
      onDoubleTap: vi.fn(),
      onLongPress: vi.fn()
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    vi.clearAllTimers();
  });

  const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
    const touchList = touches.map(touch => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
      identifier: Math.random()
    }));

    return new TouchEvent(type, {
      touches: type === 'touchend' ? [] : touchList as any,
      changedTouches: touchList as any,
      bubbles: true
    });
  };

  it('should detect swipe left gesture', async () => {
    const { result } = renderHook(() => useTouchGestures(mockConfig));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    // Simulate swipe left
    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchend', [{ clientX: 30, clientY: 100 }]));
    });

    expect(mockConfig.onSwipeLeft).toHaveBeenCalled();
    expect(navigator.vibrate).toHaveBeenCalledWith([10]);
  });

  it('should detect swipe right gesture', async () => {
    const { result } = renderHook(() => useTouchGestures(mockConfig));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchend', [{ clientX: 170, clientY: 100 }]));
    });

    expect(mockConfig.onSwipeRight).toHaveBeenCalled();
  });

  it('should detect swipe up gesture', async () => {
    const { result } = renderHook(() => useTouchGestures(mockConfig));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchend', [{ clientX: 100, clientY: 30 }]));
    });

    expect(mockConfig.onSwipeUp).toHaveBeenCalled();
  });

  it('should detect swipe down gesture', async () => {
    const { result } = renderHook(() => useTouchGestures(mockConfig));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchend', [{ clientX: 100, clientY: 170 }]));
    });

    expect(mockConfig.onSwipeDown).toHaveBeenCalled();
  });

  it('should detect single tap', async () => {
    const { result } = renderHook(() => useTouchGestures(mockConfig));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchend', [{ clientX: 102, clientY: 102 }]));
    });

    // Wait for single tap delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    expect(mockConfig.onTap).toHaveBeenCalled();
  });

  it('should detect double tap', async () => {
    const { result } = renderHook(() => useTouchGestures({
      ...mockConfig,
      doubleTapDelay: 200
    }));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    // First tap
    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]));
    });

    // Second tap within delay
    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]));
    });

    expect(mockConfig.onDoubleTap).toHaveBeenCalled();
    expect(navigator.vibrate).toHaveBeenCalledWith([20]);
  });

  it('should detect long press', async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useTouchGestures({
      ...mockConfig,
      longPressDelay: 500
    }));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockConfig.onLongPress).toHaveBeenCalled();
    expect(navigator.vibrate).toHaveBeenCalledWith([20]);

    vi.useRealTimers();
  });

  it('should detect pinch gesture', () => {
    const { result } = renderHook(() => useTouchGestures(mockConfig));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    // Start with two fingers
    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 100 }
      ]));
    });

    // Move fingers closer (pinch in)
    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchmove', [
        { clientX: 120, clientY: 100 },
        { clientX: 180, clientY: 100 }
      ]));
    });

    expect(mockConfig.onPinch).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should cancel long press on touch move', () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useTouchGestures({
      ...mockConfig,
      longPressDelay: 500
    }));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    // Move before long press completes
    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchmove', [{ clientX: 120, clientY: 100 }]));
    });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockConfig.onLongPress).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should respect custom thresholds', () => {
    const { result } = renderHook(() => useTouchGestures({
      ...mockConfig,
      swipeThreshold: 100
    }));
    
    act(() => {
      result.current.attachListeners(mockElement);
    });

    // Swipe that's below custom threshold
    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]));
    });

    act(() => {
      mockElement.dispatchEvent(createTouchEvent('touchend', [{ clientX: 170, clientY: 100 }]));
    });

    // Should not trigger swipe (70px < 100px threshold)
    expect(mockConfig.onSwipeRight).not.toHaveBeenCalled();
  });

  it('should trigger haptic feedback with different patterns', () => {
    const { result } = renderHook(() => useTouchGestures(mockConfig));

    act(() => {
      result.current.triggerHaptic('light');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([10]);

    act(() => {
      result.current.triggerHaptic('medium');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([20]);

    act(() => {
      result.current.triggerHaptic('heavy');
    });
    expect(navigator.vibrate).toHaveBeenCalledWith([30]);
  });

  it('should cleanup event listeners', () => {
    const { result } = renderHook(() => useTouchGestures(mockConfig));
    
    const removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener');
    
    const cleanup = result.current.attachListeners(mockElement);
    cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it('should handle missing vibrate API gracefully', () => {
    // Remove vibrate API
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true
    });

    const { result } = renderHook(() => useTouchGestures(mockConfig));

    // Should not throw error
    expect(() => {
      result.current.triggerHaptic('light');
    }).not.toThrow();
  });
});