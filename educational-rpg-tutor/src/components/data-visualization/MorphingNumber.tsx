import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MorphingNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  animateOnChange?: boolean;
}

export const MorphingNumber: React.FC<MorphingNumberProps> = ({
  value,
  duration = 1000,
  format,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
  animateOnChange = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);

  // Spring animation for smooth number transitions
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const animatedValue = useTransform(spring, (latest) => {
    const formatted = decimals > 0 
      ? latest.toFixed(decimals)
      : Math.round(latest).toString();
    
    return format ? format(parseFloat(formatted)) : formatted;
  });

  useEffect(() => {
    if (value !== previousValue) {
      setPreviousValue(value);
      
      if (prefersReducedMotion) {
        setDisplayValue(value);
      } else {
        spring.set(value);
        
        const unsubscribe = animatedValue.on('change', (latest) => {
          setDisplayValue(latest);
        });

        return unsubscribe;
      }
    }
  }, [value, previousValue, spring, animatedValue, prefersReducedMotion]);

  const shouldAnimate = animateOnChange && value !== previousValue;

  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={shouldAnimate && !prefersReducedMotion ? {
        scale: [1, 1.1, 1],
        color: ['currentColor', '#10B981', 'currentColor'],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      <motion.span
        key={`${value}-${previousValue}`}
        initial={shouldAnimate && !prefersReducedMotion ? { y: 20, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {prefersReducedMotion ? (
          format ? format(value) : value.toFixed(decimals)
        ) : (
          displayValue
        )}
      </motion.span>
      {suffix}
    </motion.span>
  );
};