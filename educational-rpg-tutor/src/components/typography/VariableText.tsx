import React, { forwardRef, HTMLAttributes } from 'react';
import { useVariableFont, VariableFontConfig, FontVariationSettings } from '../../hooks/useVariableFont';

export interface VariableTextProps extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  fontConfig: VariableFontConfig;
  hoverVariations?: Partial<FontVariationSettings>;
  activeVariations?: Partial<FontVariationSettings>;
  focusVariations?: Partial<FontVariationSettings>;
  interactive?: boolean;
  children: React.ReactNode;
}

/**
 * Variable text component with dynamic font effects
 */
export const VariableText = forwardRef<HTMLElement, VariableTextProps>(({
  as: Component = 'span',
  fontConfig,
  hoverVariations,
  activeVariations,
  focusVariations,
  interactive = false,
  className = '',
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onFocus,
  onBlur,
  children,
  ...props
}, ref) => {
  const {
    isLoaded,
    isSupported,
    currentVariations,
    error,
    updateVariations,
    getFontStyles,
    animateToVariations
  } = useVariableFont(fontConfig);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (hoverVariations && interactive) {
      animateToVariations(hoverVariations, 200);
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (hoverVariations && interactive) {
      animateToVariations(fontConfig.variations, 200);
    }
    onMouseLeave?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (activeVariations && interactive) {
      updateVariations(activeVariations);
    }
    onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    if (activeVariations && interactive) {
      animateToVariations(hoverVariations || fontConfig.variations, 150);
    }
    onMouseUp?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (focusVariations && interactive) {
      animateToVariations(focusVariations, 200);
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (focusVariations && interactive) {
      animateToVariations(fontConfig.variations, 200);
    }
    onBlur?.(e);
  };

  if (error) {
    console.warn(`VariableText font loading error: ${error}`);
  }

  const styles = getFontStyles();
  const combinedClassName = `${className} ${interactive ? 'cursor-pointer select-none' : ''}`.trim();

  return (
    <Component
      ref={ref}
      className={combinedClassName}
      style={styles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {!isLoaded && (
        <span className="inline-block w-full h-4 bg-gray-200 animate-pulse rounded" />
      )}
      {isLoaded && children}
    </Component>
  );
});

VariableText.displayName = 'VariableText';