import React, { forwardRef, useEffect, useState } from 'react';
import { 
  generateResponsiveTypography,
  calculateOptimalLineHeight,
  calculateOptimalLetterSpacing,
  ReadingContext
} from '../../utils/readabilityOptimization';

export interface ResponsiveTypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'code';
  responsive?: boolean;
  adaptToDistance?: boolean;
  optimizeForDevice?: boolean;
  children: React.ReactNode;
}

const typographyVariants = {
  h1: { baseSize: 32, minSize: 24, maxSize: 48, weight: 700, element: 'h1' as const },
  h2: { baseSize: 28, minSize: 22, maxSize: 40, weight: 600, element: 'h2' as const },
  h3: { baseSize: 24, minSize: 20, maxSize: 32, weight: 600, element: 'h3' as const },
  h4: { baseSize: 20, minSize: 18, maxSize: 28, weight: 500, element: 'h4' as const },
  h5: { baseSize: 18, minSize: 16, maxSize: 24, weight: 500, element: 'h5' as const },
  h6: { baseSize: 16, minSize: 14, maxSize: 20, weight: 500, element: 'h6' as const },
  body: { baseSize: 16, minSize: 14, maxSize: 18, weight: 400, element: 'p' as const },
  caption: { baseSize: 14, minSize: 12, maxSize: 16, weight: 400, element: 'span' as const },
  code: { baseSize: 14, minSize: 12, maxSize: 16, weight: 400, element: 'code' as const },
};

/**
 * Responsive typography component that adapts to screen size, device, and viewing distance
 */
export const ResponsiveTypography = forwardRef<HTMLElement, ResponsiveTypographyProps>(({
  as,
  variant = 'body',
  responsive = true,
  adaptToDistance = false,
  optimizeForDevice = true,
  className = '',
  style = {},
  children,
  ...props
}, ref) => {
  const [deviceContext, setDeviceContext] = useState<ReadingContext>({
    deviceType: 'desktop',
    screenSize: { width: 1200, height: 800 },
    viewingDistance: 'normal',
    ambientLight: 'normal',
  });

  const variantConfig = typographyVariants[variant];
  const Component = as || variantConfig.element;

  // Detect device and context
  useEffect(() => {
    const updateContext = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let deviceType: ReadingContext['deviceType'] = 'desktop';
      if (width < 768) {
        deviceType = 'mobile';
      } else if (width < 1024) {
        deviceType = 'tablet';
      }

      // Estimate viewing distance based on device type and screen size
      let viewingDistance: ReadingContext['viewingDistance'] = 'normal';
      if (deviceType === 'mobile') {
        viewingDistance = 'close';
      } else if (deviceType === 'desktop' && width > 1920) {
        viewingDistance = 'far';
      }

      setDeviceContext(prev => ({
        ...prev,
        deviceType,
        screenSize: { width, height },
        viewingDistance: adaptToDistance ? viewingDistance : prev.viewingDistance,
      }));
    };

    if (optimizeForDevice) {
      updateContext();
      window.addEventListener('resize', updateContext);
      return () => window.removeEventListener('resize', updateContext);
    }
  }, [optimizeForDevice, adaptToDistance]);

  // Generate responsive styles
  const getResponsiveStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      fontWeight: variantConfig.weight,
      ...style,
    };

    if (responsive) {
      // Generate responsive font size
      const fontSize = generateResponsiveTypography(
        variantConfig.baseSize,
        variantConfig.minSize,
        variantConfig.maxSize
      );
      styles.fontSize = fontSize;

      // Calculate optimal line height
      const lineHeight = calculateOptimalLineHeight(
        variantConfig.baseSize,
        variant === 'body' ? 'body' : 
        variant === 'code' ? 'code' :
        variant.startsWith('h') ? 'heading' : 'caption'
      );
      styles.lineHeight = lineHeight;

      // Calculate optimal letter spacing
      const letterSpacing = calculateOptimalLetterSpacing(
        variantConfig.baseSize,
        variantConfig.weight
      );
      if (letterSpacing !== 0) {
        styles.letterSpacing = `${letterSpacing}em`;
      }
    } else {
      styles.fontSize = `${variantConfig.baseSize}px`;
    }

    // Device-specific optimizations
    if (optimizeForDevice) {
      const { deviceType, viewingDistance } = deviceContext;
      
      // Adjust for device type
      if (deviceType === 'mobile') {
        styles.fontSize = styles.fontSize || `${Math.max(variantConfig.minSize, variantConfig.baseSize * 0.9)}px`;
        styles.lineHeight = (styles.lineHeight as number || 1.5) * 1.1;
      } else if (deviceType === 'desktop') {
        styles.fontSize = styles.fontSize || `${Math.min(variantConfig.maxSize, variantConfig.baseSize * 1.1)}px`;
      }

      // Adjust for viewing distance
      if (adaptToDistance) {
        const distanceMultiplier = {
          close: 0.9,
          normal: 1.0,
          far: 1.2,
        }[viewingDistance];

        if (typeof styles.fontSize === 'string' && styles.fontSize.includes('clamp')) {
          // For clamp values, we need to adjust the calculation
          styles.transform = `scale(${distanceMultiplier})`;
          styles.transformOrigin = 'top left';
        } else {
          const currentSize = parseInt(styles.fontSize as string) || variantConfig.baseSize;
          styles.fontSize = `${currentSize * distanceMultiplier}px`;
        }
      }
    }

    return styles;
  };

  // Generate CSS classes
  const getClasses = () => {
    const classes = [
      'responsive-typography',
      `responsive-typography--${variant}`,
      className,
    ];

    if (responsive) {
      classes.push('responsive-typography--fluid');
    }

    if (optimizeForDevice) {
      classes.push(`responsive-typography--${deviceContext.deviceType}`);
    }

    if (adaptToDistance) {
      classes.push(`responsive-typography--${deviceContext.viewingDistance}`);
    }

    return classes.filter(Boolean).join(' ');
  };

  return (
    <Component
      ref={ref}
      className={getClasses()}
      style={getResponsiveStyles()}
      {...props}
    >
      {children}
    </Component>
  );
});

ResponsiveTypography.displayName = 'ResponsiveTypography';

// Convenience components for common variants
export const ResponsiveHeading = forwardRef<HTMLHeadingElement, Omit<ResponsiveTypographyProps, 'variant'> & { level: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ level, ...props }, ref) => (
    <ResponsiveTypography
      ref={ref}
      variant={`h${level}` as any}
      {...props}
    />
  )
);

ResponsiveHeading.displayName = 'ResponsiveHeading';

export const ResponsiveText = forwardRef<HTMLParagraphElement, Omit<ResponsiveTypographyProps, 'variant'>>(
  (props, ref) => (
    <ResponsiveTypography
      ref={ref}
      variant="body"
      {...props}
    />
  )
);

ResponsiveText.displayName = 'ResponsiveText';

export const ResponsiveCaption = forwardRef<HTMLSpanElement, Omit<ResponsiveTypographyProps, 'variant'>>(
  (props, ref) => (
    <ResponsiveTypography
      ref={ref}
      variant="caption"
      {...props}
    />
  )
);

ResponsiveCaption.displayName = 'ResponsiveCaption';

export const ResponsiveCode = forwardRef<HTMLElement, Omit<ResponsiveTypographyProps, 'variant'>>(
  (props, ref) => (
    <ResponsiveTypography
      ref={ref}
      variant="code"
      {...props}
    />
  )
);

ResponsiveCode.displayName = 'ResponsiveCode';