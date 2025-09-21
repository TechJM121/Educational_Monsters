import React, { forwardRef, HTMLAttributes } from 'react';
import { useResponsiveFont } from '../../hooks/useVariableFont';

export type TypographyVariant = 
  | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

export type TypographyWeight = 
  | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export interface FluidTypographyProps extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  interactive?: boolean;
  responsive?: boolean;
  children: React.ReactNode;
}

/**
 * Fluid typography component with responsive scaling
 */
export const FluidTypography = forwardRef<HTMLElement, FluidTypographyProps>(({
  as: Component = 'p',
  variant = 'base',
  weight = 'normal',
  interactive = false,
  responsive = true,
  className = '',
  children,
  ...props
}, ref) => {
  const { fontSize: responsiveFontSize, lineHeight: responsiveLineHeight } = useResponsiveFont();

  const getVariantClasses = () => {
    const baseClasses = 'font-variable';
    const variantClass = `text-fluid-${variant}`;
    const weightClass = `font-${weight}`;
    const interactiveClass = interactive ? 'text-interactive' : '';
    
    return `${baseClasses} ${variantClass} ${weightClass} ${interactiveClass}`.trim();
  };

  const getResponsiveStyles = () => {
    if (!responsive) return {};
    
    return {
      fontSize: `${responsiveFontSize}px`,
      lineHeight: responsiveLineHeight,
    };
  };

  const combinedClassName = `${getVariantClasses()} ${className}`.trim();
  const styles = getResponsiveStyles();

  return (
    <Component
      ref={ref}
      className={combinedClassName}
      style={styles}
      {...props}
    >
      {children}
    </Component>
  );
});

FluidTypography.displayName = 'FluidTypography';

/**
 * Predefined typography components for common use cases
 */
export const Heading1 = forwardRef<HTMLHeadingElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="h1" variant="4xl" weight="bold" ref={ref} {...props} />
  )
);

export const Heading2 = forwardRef<HTMLHeadingElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="h2" variant="3xl" weight="semibold" ref={ref} {...props} />
  )
);

export const Heading3 = forwardRef<HTMLHeadingElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="h3" variant="2xl" weight="semibold" ref={ref} {...props} />
  )
);

export const Heading4 = forwardRef<HTMLHeadingElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="h4" variant="xl" weight="medium" ref={ref} {...props} />
  )
);

export const Heading5 = forwardRef<HTMLHeadingElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="h5" variant="lg" weight="medium" ref={ref} {...props} />
  )
);

export const Heading6 = forwardRef<HTMLHeadingElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="h6" variant="base" weight="medium" ref={ref} {...props} />
  )
);

export const BodyText = forwardRef<HTMLParagraphElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="p" variant="base" ref={ref} {...props} />
  )
);

export const SmallText = forwardRef<HTMLSpanElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="span" variant="sm" ref={ref} {...props} />
  )
);

export const Caption = forwardRef<HTMLSpanElement, Omit<FluidTypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <FluidTypography as="span" variant="xs" weight="light" ref={ref} {...props} />
  )
);

Heading1.displayName = 'Heading1';
Heading2.displayName = 'Heading2';
Heading3.displayName = 'Heading3';
Heading4.displayName = 'Heading4';
Heading5.displayName = 'Heading5';
Heading6.displayName = 'Heading6';
BodyText.displayName = 'BodyText';
SmallText.displayName = 'SmallText';
Caption.displayName = 'Caption';