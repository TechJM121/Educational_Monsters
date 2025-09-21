import { useCallback, useEffect, useRef } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import type { LoadingType } from '../contexts/LoadingContext';

export interface UseContextualLoadingOptions {
  type: LoadingType;
  autoStop?: boolean;
  timeout?: number;
  onTimeout?: () => void;
}

export const useContextualLoading = (
  id: string,
  options: UseContextualLoadingOptions
) => {
  const { 
    startLoading, 
    stopLoading, 
    updateLoading, 
    isLoading, 
    getLoadingState 
  } = useLoading();
  
  const { type, autoStop = false, timeout, onTimeout } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();

  const start = useCallback((message?: string, metadata?: Record<string, any>) => {
    startLoading(id, type, message, metadata);
    
    if (timeout) {
      timeoutRef.current = setTimeout(() => {
        if (autoStop) {
          stopLoading(id);
        }
        onTimeout?.();
      }, timeout);
    }
  }, [id, type, startLoading, timeout, autoStop, stopLoading, onTimeout]);

  const stop = useCallback(() => {
    stopLoading(id);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, [id, stopLoading]);

  const update = useCallback((progress?: number, message?: string) => {
    updateLoading(id, progress, message);
  }, [id, updateLoading]);

  const loading = isLoading(id);
  const state = getLoadingState(id);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (loading) {
        stopLoading(id);
      }
    };
  }, [id, loading, stopLoading]);

  return {
    loading,
    state,
    start,
    stop,
    update
  };
};

// Specialized hooks for different loading types
export const useDataLoading = (id: string, options?: Omit<UseContextualLoadingOptions, 'type'>) => {
  return useContextualLoading(id, { ...options, type: 'data' });
};

export const useImageLoading = (id: string, options?: Omit<UseContextualLoadingOptions, 'type'>) => {
  return useContextualLoading(id, { ...options, type: 'images' });
};

export const useFormLoading = (id: string, options?: Omit<UseContextualLoadingOptions, 'type'>) => {
  return useContextualLoading(id, { ...options, type: 'forms' });
};

export const useNavigationLoading = (id: string, options?: Omit<UseContextualLoadingOptions, 'type'>) => {
  return useContextualLoading(id, { ...options, type: 'navigation' });
};

export const useContentLoading = (id: string, options?: Omit<UseContextualLoadingOptions, 'type'>) => {
  return useContextualLoading(id, { ...options, type: 'content' });
};