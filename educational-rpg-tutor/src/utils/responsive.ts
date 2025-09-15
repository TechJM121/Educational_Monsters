import { useEffect, useState } from 'react';

// Breakpoint definitions matching Tailwind CSS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook to get current screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    breakpoint: Breakpoint | 'xs';
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    breakpoint: 'lg'
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint: Breakpoint | 'xs' = 'xs';
      if (width >= breakpoints['2xl']) breakpoint = '2xl';
      else if (width >= breakpoints.xl) breakpoint = 'xl';
      else if (width >= breakpoints.lg) breakpoint = 'lg';
      else if (width >= breakpoints.md) breakpoint = 'md';
      else if (width >= breakpoints.sm) breakpoint = 'sm';

      setScreenSize({ width, height, breakpoint });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

// Hook to check if screen is at least a certain breakpoint
export function useBreakpoint(breakpoint: Breakpoint) {
  const { width } = useScreenSize();
  return width >= breakpoints[breakpoint];
}

// Hook to detect mobile devices
export function useIsMobile() {
  const { breakpoint } = useScreenSize();
  return breakpoint === 'xs' || breakpoint === 'sm';
}

// Hook to detect tablet devices
export function useIsTablet() {
  const { breakpoint } = useScreenSize();
  return breakpoint === 'md';
}

// Hook to detect desktop devices
export function useIsDesktop() {
  const { breakpoint } = useScreenSize();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
}

// Responsive grid utilities
export const getResponsiveGridCols = (
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
) => {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
};

// Responsive spacing utilities
export const getResponsiveSpacing = (
  mobile: string = 'p-4',
  tablet: string = 'md:p-6',
  desktop: string = 'lg:p-8'
) => {
  return `${mobile} ${tablet} ${desktop}`;
};

// Responsive text size utilities
export const getResponsiveTextSize = (
  mobile: string = 'text-sm',
  tablet: string = 'md:text-base',
  desktop: string = 'lg:text-lg'
) => {
  return `${mobile} ${tablet} ${desktop}`;
};

// Touch device detection
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });
    
    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return isTouch;
}

// Orientation detection
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

// Safe area detection for mobile devices
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}

// Responsive component props helper
export function useResponsiveProps<T>(
  props: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    default: T;
  }
) {
  const { breakpoint } = useScreenSize();
  
  if (breakpoint === 'xs' || breakpoint === 'sm') {
    return props.mobile ?? props.default;
  } else if (breakpoint === 'md') {
    return props.tablet ?? props.mobile ?? props.default;
  } else {
    return props.desktop ?? props.tablet ?? props.mobile ?? props.default;
  }
}