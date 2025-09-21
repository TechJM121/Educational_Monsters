import { useRef, useEffect, useCallback } from 'react';

export const useAnimationFrame = (callback: (deltaTime: number) => void, enabled: boolean = true) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    
    if (enabled) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [callback, enabled]);
  
  useEffect(() => {
    if (enabled) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, enabled]);
  
  const start = useCallback(() => {
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);
  
  const stop = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
  }, []);
  
  return { start, stop };
};