import React from 'react';
import { motion } from 'framer-motion';

export interface FlexGridProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: Partial<FlexGridProps>;
    md?: Partial<FlexGridProps>;
    lg?: Partial<FlexGridProps>;
    xl?: Partial<FlexGridProps>;
  };
  className?: string;
  animated?: boolean;
}

const FlexGrid: React.FC<FlexGridProps> = ({
  children,
  direction = 'row',
  wrap = 'wrap',
  justify = 'start',
  align = 'stretch',
  gap = 'md',
  responsive,
  className = '',
  animated = true
}) => {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col'
  };

  const wrapClasses = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  const getResponsiveClasses = () => {
    if (!responsive) return '';

    const breakpoints = ['sm', 'md', 'lg', 'xl'] as const;
    return breakpoints.map(bp => {
      const config = responsive[bp];
      if (!config) return '';

      const classes = [];
      if (config.direction) classes.push(`${bp}:${directionClasses[config.direction]}`);
      if (config.wrap) classes.push(`${bp}:${wrapClasses[config.wrap]}`);
      if (config.justify) classes.push(`${bp}:${justifyClasses[config.justify]}`);
      if (config.align) classes.push(`${bp}:${alignClasses[config.align]}`);
      if (config.gap) classes.push(`${bp}:${gapClasses[config.gap]}`);

      return classes.join(' ');
    }).join(' ');
  };

  const flexClasses = `
    flex
    ${directionClasses[direction]}
    ${wrapClasses[wrap]}
    ${justifyClasses[justify]}
    ${alignClasses[align]}
    ${gapClasses[gap]}
    ${getResponsiveClasses()}
    ${className}
  `.trim();

  if (animated) {
    return (
      <motion.div
        className={flexClasses}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
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
    <div className={flexClasses}>
      {children}
    </div>
  );
};

export default FlexGrid;