import { useState, useEffect, useCallback, useRef } from 'react';

export interface ImageLoaderOptions {
  lazy?: boolean;
  priority?: boolean;
  fallbackSrc?: string;
  retryAttempts?: number;
  retryDelay?: number;
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

export interface ImageLoaderState {
  loaded: boolean;
  loading: boolean;
  error: boolean;
  inView: boolean;
  currentSrc: string | null;
  attempts: number;
}

export const useImageLoader = (
  src: string,
  options: ImageLoaderOptions = {}
) => {
  const {
    lazy = true,
    priority = false,
    fallbackSrc,
    retryAttempts = 2,
    retryDelay = 1000,
    onLoad,
    onError
  } = options;

  const [state, setState] = useState<ImageLoaderState>({
    loaded: false,
    loading: false,
    error: false,
    inView: !lazy || priority,
    currentSrc: null,
    attempts: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const imgRef = useRef<HTMLImageElement>();

  const loadImage = useCallback((imageSrc: string) => {
    setState(prev => ({ ...prev, loading: true, error: false }));

    const img = new Image();
    imgRef.current = img;

    img.onload = () => {
      setState(prev => ({
        ...prev,
        loaded: true,
        loading: false,
        currentSrc: imageSrc,
        error: false
      }));
      onLoad?.();
    };

    img.onerror = (error) => {
      setState(prev => {
        const newAttempts = prev.attempts + 1;
        
        // Try fallback if available and this is the first failure
        if (fallbackSrc && prev.attempts === 0 && imageSrc !== fallbackSrc) {
          // Retry with fallback
          setTimeout(() => loadImage(fallbackSrc), retryDelay);
          return {
            ...prev,
            loading: false,
            attempts: newAttempts
          };
        }
        
        // Retry original image if attempts remaining
        if (newAttempts < retryAttempts && imageSrc === src) {
          retryTimeoutRef.current = setTimeout(() => {
            loadImage(src);
          }, retryDelay * newAttempts); // Exponential backoff
          
          return {
            ...prev,
            loading: false,
            attempts: newAttempts
          };
        }
        
        // Give up
        return {
          ...prev,
          loading: false,
          error: true,
          attempts: newAttempts
        };
      });
      
      onError?.(error);
    };

    img.src = imageSrc;
  }, [src, fallbackSrc, retryAttempts, retryDelay, onLoad, onError]);

  // Start loading when in view
  useEffect(() => {
    if (state.inView && !state.loaded && !state.loading && !state.error) {
      loadImage(src);
    }
  }, [state.inView, state.loaded, state.loading, state.error, src, loadImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
      }
    };
  }, []);

  const setInView = useCallback((inView: boolean) => {
    setState(prev => ({ ...prev, inView }));
  }, []);

  const retry = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: false, 
      attempts: 0 
    }));
    loadImage(src);
  }, [src, loadImage]);

  return {
    ...state,
    setInView,
    retry
  };
};