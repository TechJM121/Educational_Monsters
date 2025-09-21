import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TypewriterTextProps {
  text: string | string[];
  speed?: number;
  delay?: number;
  cursor?: boolean;
  cursorChar?: string;
  loop?: boolean;
  pauseDuration?: number;
  onComplete?: () => void;
  onStart?: () => void;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Typewriter effect component with configurable speed and behavior
 */
export const TypewriterText = forwardRef<HTMLElement, TypewriterTextProps>(({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  cursorChar = '|',
  loop = false,
  pauseDuration = 1000,
  onComplete,
  onStart,
  className = '',
  as: Component = 'span',
}, ref) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cursorTimeoutRef = useRef<NodeJS.Timeout>();

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[currentTextIndex] || '';

  // Cursor blinking effect
  useEffect(() => {
    if (cursor) {
      const blinkCursor = () => {
        setShowCursor(prev => !prev);
        cursorTimeoutRef.current = setTimeout(blinkCursor, 530);
      };
      cursorTimeoutRef.current = setTimeout(blinkCursor, 530);
    }

    return () => {
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, [cursor]);

  // Main typewriter effect
  useEffect(() => {
    const startTyping = () => {
      setIsTyping(true);
      onStart?.();

      const typeCharacter = () => {
        if (currentIndex < currentText.length) {
          setDisplayText(currentText.slice(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
          timeoutRef.current = setTimeout(typeCharacter, speed);
        } else {
          // Finished typing current text
          setIsTyping(false);
          onComplete?.();

          if (loop && textArray.length > 1) {
            // Move to next text after pause
            timeoutRef.current = setTimeout(() => {
              setCurrentTextIndex(prev => (prev + 1) % textArray.length);
              setCurrentIndex(0);
              setDisplayText('');
            }, pauseDuration);
          }
        }
      };

      timeoutRef.current = setTimeout(typeCharacter, delay);
    };

    startTyping();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentText, currentIndex, currentTextIndex, speed, delay, loop, pauseDuration, onComplete, onStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Component ref={ref} className={className}>
      {displayText}
      <AnimatePresence>
        {cursor && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: showCursor ? 1 : 0 }}
            transition={{ duration: 0.1 }}
            className="inline-block"
          >
            {cursorChar}
          </motion.span>
        )}
      </AnimatePresence>
    </Component>
  );
});

TypewriterText.displayName = 'TypewriterText';