import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTouchGestures, TouchGestureConfig } from '../../hooks/useTouchGestures';

export interface TouchOptimizedProps extends TouchGestureConfig {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  feedbackScale?: number;
  feedbackDuration?: number;
  preventScroll?: boolean;
}

const TouchOptimized: React.FC<TouchOptimizedProps> = ({
  children,
  className = '',
  disabled = false,
  feedbackScale = 0.95,
  feedbackDuration = 0.1,
  preventScroll = false,
  ...gestureConfig
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { attachListeners } = useTouchGestures(gestureConfig);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    const cleanup = attachListeners(element);

    // Prevent scroll if requested
    if (preventScroll) {
      const preventScrollHandler = (e: TouchEvent) => {
        e.preventDefault();
      };
      
      element.addEventListener('touchmove', preventScrollHandler, { passive: false });
      
      return () => {
        cleanup();
        element.removeEventListener('touchmove', preventScrollHandler);
      };
    }

    return cleanup;
  }, [attachListeners, disabled, preventScroll]);

  return (
    <motion.div
      ref={elementRef}
      className={`touch-optimized ${className}`}
      whileTap={disabled ? undefined : { scale: feedbackScale }}
      transition={{ duration: feedbackDuration }}
      style={{
        touchAction: preventScroll ? 'none' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </motion.div>
  );
};

export default TouchOptimized;