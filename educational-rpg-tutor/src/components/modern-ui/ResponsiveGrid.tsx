import React from 'react';
import { motion } from 'framer-motion';

export interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
  autoFill?: boolean;
  minItemWidth?: string;
  className?: string;
  animated?: boolean;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 'md',
  autoFit = false,
  autoFill = false,
  minItemWidth = '250px',
  className = '',
  animated = true
}) => {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  const getGridClasses = () => {
    if (autoFit || autoFill) {
      const fitType = autoFit ? 'auto-fit' : 'auto-fill';
      return `grid-cols-[repeat(${fitType},minmax(${minItemWidth},1fr))]`;
    }

    return [
      columns.xs && `grid-cols-${columns.xs}`,
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`
    ].filter(Boolean).join(' ');
  };

  const gridClasses = `
    grid
    ${getGridClasses()}
    ${gapClasses[gap]}
    ${className}
  `.trim();

  if (animated) {
    return (
      <motion.div
        className={gridClasses}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;