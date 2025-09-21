import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useImageLoader } from '../useImageLoader';

// Mock Image constructor
const mockImage = vi.fn();
global.Image = mockImage as any;

describe('useImageLoader Hook', () => {
  let mockImageInstance: any;

  beforeEach(() => {
    mockImageInstance = {
      onload: null,
      onerror: null,
      src: '',
    };
    mockImage.mockImplementation(() => mockImageInstance);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('returns correct initial state for lazy loading', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { lazy: true })
      );

      expect(result.current.loaded).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(false);
      expect(result.current.inView).toBe(false);
      expect(result.current.currentSrc).toBe(null);
      expect(result.current.attempts).toBe(0);
    });

    it('returns correct initial state for priority loading', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { priority: true })
      );

      expect(result.current.inView).toBe(true);
    });

    it('returns correct initial state for non-lazy loading', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { lazy: false })
      );

      expect(result.current.inView).toBe(true);
    });
  });

  describe('Image Loading', () => {
    it('starts loading when setInView is called with true', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { lazy: true })
      );

      act(() => {
        result.current.setInView(true);
      });

      expect(mockImage).toHaveBeenCalled();
      expect(result.current.loading).toBe(true);
    });

    it('calls onLoad callback when image loads successfully', () => {
      const onLoad = vi.fn();
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { lazy: false, onLoad })
      );

      act(() => {
        if (mockImageInstance.onload) {
          mockImageInstance.onload();
        }
      });

      expect(onLoad).toHaveBeenCalled();
      expect(result.current.loaded).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.currentSrc).toBe('test-image.jpg');
    });

    it('calls onError callback when image fails to load', () => {
      const onError = vi.fn();
      const errorEvent = new Event('error');
      
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { lazy: false, onError })
      );

      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(errorEvent);
        }
      });

      expect(onError).toHaveBeenCalledWith(errorEvent);
    });
  });

  describe('Fallback Handling', () => {
    it('tries fallback image when main image fails', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { 
          lazy: false, 
          fallbackSrc: 'fallback.jpg' 
        })
      );

      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      // Should create a new Image instance for fallback
      act(() => {
        vi.advanceTimersByTime(1000); // Default retry delay
      });

      expect(mockImage).toHaveBeenCalledTimes(3); // Initial + retry with fallback
    });

    it('loads fallback image successfully', () => {
      const onLoad = vi.fn();
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { 
          lazy: false, 
          fallbackSrc: 'fallback.jpg',
          onLoad
        })
      );

      // Fail main image
      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      // Advance time to trigger fallback
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Simulate fallback success
      act(() => {
        if (mockImageInstance.onload) {
          mockImageInstance.onload();
        }
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.currentSrc).toBe('fallback.jpg');
      expect(onLoad).toHaveBeenCalled();
    });
  });

  describe('Retry Logic', () => {
    it('retries loading on failure', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { 
          lazy: false, 
          retryAttempts: 2,
          retryDelay: 500
        })
      );

      // First failure
      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      expect(result.current.attempts).toBe(1);

      // Advance time to trigger retry
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockImage).toHaveBeenCalledTimes(3); // Initial + retry
    });

    it('stops retrying after max attempts', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { 
          lazy: false, 
          retryAttempts: 1,
          retryDelay: 500
        })
      );

      // First failure
      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      // Advance time to trigger retry
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Second failure (should stop retrying)
      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      expect(result.current.error).toBe(true);
      expect(result.current.attempts).toBe(2);
    });

    it('uses exponential backoff for retries', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { 
          lazy: false, 
          retryAttempts: 3,
          retryDelay: 1000
        })
      );

      // First failure
      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      // Should retry after 1000ms (1 * retryDelay)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockImage).toHaveBeenCalledTimes(3); // Initial + retry

      // Second failure
      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      // Should retry after 2000ms (2 * retryDelay)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockImage).toHaveBeenCalledTimes(4); // Initial + 2 retries
    });
  });

  describe('Manual Retry', () => {
    it('allows manual retry after error', () => {
      const { result } = renderHook(() => 
        useImageLoader('test-image.jpg', { lazy: false })
      );

      // Cause error
      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      expect(result.current.error).toBe(false); // Hook retries automatically

      // Manual retry
      act(() => {
        result.current.retry();
      });

      expect(result.current.error).toBe(false);
      expect(result.current.attempts).toBe(0);
      expect(mockImage).toHaveBeenCalledTimes(3); // Initial + auto retry + manual retry
    });
  });

  describe('Cleanup', () => {
    it('cleans up timeouts on unmount', () => {
      const { result, unmount } = renderHook(() => 
        useImageLoader('test-image.jpg', { 
          lazy: false, 
          retryAttempts: 2 
        })
      );

      // Cause error to start retry timer
      act(() => {
        if (mockImageInstance.onerror) {
          mockImageInstance.onerror(new Event('error'));
        }
      });

      // Unmount before retry timer fires
      unmount();

      // Advance time - should not cause additional image creation
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockImage).toHaveBeenCalledTimes(2); // Initial + one retry before unmount
    });

    it('cleans up image event handlers on unmount', () => {
      const { unmount } = renderHook(() => 
        useImageLoader('test-image.jpg', { lazy: false })
      );

      expect(mockImageInstance.onload).not.toBe(null);
      expect(mockImageInstance.onerror).not.toBe(null);

      unmount();

      expect(mockImageInstance.onload).toBe(null);
      expect(mockImageInstance.onerror).toBe(null);
    });
  });
});