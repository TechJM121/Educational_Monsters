import React from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  animate?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = 'md',
  center = true,
  animate = false,
}) => {
  const { isMobile, isTablet, screenWidth } = useResponsive();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg lg:max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: isMobile ? 'p-2' : 'p-4',
    md: isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-6',
    lg: isMobile ? 'p-4' : isTablet ? 'p-8' : 'p-8',
    xl: isMobile ? 'p-6' : isTablet ? 'p-10' : 'p-12',
  };

  const containerClasses = [
    'w-full',
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    center ? 'mx-auto' : '',
    // Add responsive classes based on screen size
    screenWidth < 375 ? 'xs-compact' : '',
    isMobile && screenWidth < 500 ? 'landscape-compact' : '',
    isTablet ? 'tablet-portrait' : '',
    screenWidth >= 1920 ? 'xl-spacing' : '',
    className,
  ].filter(Boolean).join(' ');

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={containerClasses}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getGridClasses = () => {
    const gapClasses = {
      sm: 'gap-2 sm:gap-3 lg:gap-4',
      md: 'gap-4 sm:gap-6 lg:gap-8',
      lg: 'gap-6 sm:gap-8 lg:gap-10',
    };

    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    };

    return `grid ${columnClasses[columns]} ${gapClasses[gap]}`;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'base',
  weight = 'normal',
  className = '',
  as: Component = 'p',
}) => {
  const { isMobile } = useResponsive();

  const sizeClasses = {
    xs: isMobile ? 'text-xs' : 'text-sm',
    sm: isMobile ? 'text-sm' : 'text-base',
    base: isMobile ? 'text-base' : 'text-lg',
    lg: isMobile ? 'text-lg' : 'text-xl',
    xl: isMobile ? 'text-xl' : 'text-2xl',
    '2xl': isMobile ? 'text-2xl' : 'text-3xl',
    '3xl': isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const textClasses = [
    sizeClasses[size],
    weightClasses[weight],
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
};

// Responsive card component
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  padding = 'md',
  interactive = false,
  onClick,
}) => {
  const { isMobile } = useResponsive();

  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-6' : 'p-8',
  };

  const baseClasses = 'backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 transition-all duration-300';
  const interactiveClasses = interactive ? 'cursor-pointer hover:border-blue-400/30 hover:bg-white/15' : '';

  const cardClasses = [
    baseClasses,
    paddingClasses[padding],
    interactiveClasses,
    className,
  ].filter(Boolean).join(' ');

  if (interactive) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className={cardClasses}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};