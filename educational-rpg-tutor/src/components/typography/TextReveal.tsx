import React, { forwardRef } from 'react';
import { motion, Variants } from 'framer-motion';

export interface TextRevealProps {
  text: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale' | 'blur';
  stagger?: number;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  splitBy?: 'character' | 'word' | 'line';
  onComplete?: () => void;
}

/**
 * Text reveal animation component with stagger effects
 */
export const TextReveal = forwardRef<HTMLElement, TextRevealProps>(({
  text,
  animation = 'fadeUp',
  stagger = 0.05,
  delay = 0,
  duration = 0.6,
  className = '',
  as: Component = 'div',
  splitBy = 'character',
  onComplete,
}, ref) => {
  // Split text based on splitBy option
  const splitText = () => {
    switch (splitBy) {
      case 'word':
        return text.split(' ').map((word, index) => ({ content: word, index, isSpace: false }))
          .reduce((acc, item, index) => {
            acc.push(item);
            if (index < text.split(' ').length - 1) {
              acc.push({ content: ' ', index: index + 0.5, isSpace: true });
            }
            return acc;
          }, [] as Array<{ content: string; index: number; isSpace: boolean }>);
      case 'line':
        return text.split('\n').map((line, index) => ({ content: line, index, isSpace: false }));
      case 'character':
      default:
        return text.split('').map((char, index) => ({ content: char, index, isSpace: char === ' ' }));
    }
  };

  const textParts = splitText();

  // Animation variants for different effects
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
        onComplete,
      },
    },
  };

  const getItemVariants = (): Variants => {
    const baseTransition = {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    };

    switch (animation) {
      case 'fadeUp':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: baseTransition },
        };
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: baseTransition },
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 30 },
          visible: { opacity: 1, x: 0, transition: baseTransition },
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0, transition: baseTransition },
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1, transition: baseTransition },
        };
      case 'blur':
        return {
          hidden: { opacity: 0, filter: 'blur(10px)' },
          visible: { opacity: 1, filter: 'blur(0px)', transition: baseTransition },
        };
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: baseTransition },
        };
    }
  };

  const itemVariants = getItemVariants();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      as={Component}
    >
      {textParts.map((part, index) => (
        <motion.span
          key={`${part.content}-${index}`}
          variants={itemVariants}
          className={`inline-block ${part.isSpace ? 'w-2' : ''}`}
          style={{
            whiteSpace: splitBy === 'word' ? 'nowrap' : 'normal',
          }}
        >
          {part.content === ' ' ? '\u00A0' : part.content}
          {splitBy === 'line' && index < textParts.length - 1 && <br />}
        </motion.span>
      ))}
    </motion.div>
  );
});

TextReveal.displayName = 'TextReveal';