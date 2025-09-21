import React from 'react';
import { motion } from 'framer-motion';

export interface SkeletonChartProps {
  type?: 'bar' | 'line' | 'pie' | 'area';
  animation?: 'pulse' | 'wave' | 'shimmer';
  className?: string;
  width?: string | number;
  height?: string | number;
  withTitle?: boolean;
  withLegend?: boolean;
  dataPoints?: number;
  responsive?: boolean;
}

const SkeletonChart: React.FC<SkeletonChartProps> = ({
  type = 'bar',
  animation = 'pulse',
  className = '',
  width,
  height,
  withTitle = true,
  withLegend = true,
  dataPoints = 6,
  responsive = true
}) => {
  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-wave';
      case 'shimmer':
        return 'animate-shimmer';
      default:
        return 'animate-pulse';
    }
  };

  const getBaseClasses = () => {
    return `bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${getAnimationClasses()} rounded-lg`;
  };

  const getResponsiveClasses = () => {
    if (!responsive) return '';
    return 'w-full max-w-full';
  };

  const renderBarChart = () => (
    <div className="flex items-end justify-between h-48 p-4 space-x-2">
      {Array.from({ length: dataPoints }, (_, i) => (
        <motion.div
          key={i}
          className={`${getBaseClasses()} w-8 rounded-t-md`}
          style={{ height: `${Math.random() * 60 + 20}%` }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: `${Math.random() * 60 + 20}%`, 
            opacity: 1 
          }}
          transition={{ 
            delay: i * 0.1, 
            duration: 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="relative h-48 p-4">
      {/* Grid lines */}
      <div className="absolute inset-4 space-y-8">
        {Array.from({ length: 4 }, (_, i) => (
          <motion.div
            key={i}
            className={`${getBaseClasses()} h-px w-full opacity-30`}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.3 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        ))}
      </div>
      
      {/* Line path simulation */}
      <motion.div
        className={`${getBaseClasses()} absolute inset-4 rounded-full opacity-60`}
        style={{ 
          height: '2px',
          top: `${Math.random() * 60 + 20}%`,
          transform: 'rotate(-5deg)'
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.6 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />
      
      {/* Data points */}
      <div className="absolute inset-4 flex justify-between items-center">
        {Array.from({ length: dataPoints }, (_, i) => (
          <motion.div
            key={i}
            className={`${getBaseClasses()} w-3 h-3 rounded-full`}
            style={{ 
              marginTop: `${Math.random() * 100}px`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.5 + (i * 0.1), 
              duration: 0.3,
              type: "spring",
              stiffness: 200
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="flex items-center justify-center h-48 p-4">
      <motion.div
        className={`${getBaseClasses()} w-32 h-32 rounded-full relative overflow-hidden`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Pie segments simulation */}
        {Array.from({ length: 4 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from ${i * 90}deg, transparent ${i * 25}%, rgba(148, 163, 184, 0.5) ${(i + 1) * 25}%, transparent ${(i + 1) * 25}%)`,
            }}
            initial={{ rotate: 0, opacity: 0 }}
            animate={{ rotate: 360, opacity: 1 }}
            transition={{ 
              delay: i * 0.2, 
              duration: 1,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );

  const renderAreaChart = () => (
    <div className="relative h-48 p-4 overflow-hidden">
      {/* Area fill simulation */}
      <motion.div
        className={`${getBaseClasses()} absolute bottom-4 left-4 right-4 rounded-t-lg opacity-40`}
        style={{ height: '60%' }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.4 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      />
      
      {/* Area line */}
      <motion.div
        className={`${getBaseClasses()} absolute left-4 right-4 h-0.5 rounded-full`}
        style={{ bottom: '64%' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      />
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <motion.div
      className={`${getResponsiveClasses()} ${className}`}
      style={{ 
        width: width || '100%',
        height: height || 'auto'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        {/* Chart title */}
        {withTitle && (
          <motion.div
            className={`${getBaseClasses()} h-6 w-1/3`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        )}
        
        {/* Chart area */}
        <div className={`${getBaseClasses()} relative overflow-hidden`}>
          {renderChart()}
        </div>
        
        {/* Chart legend */}
        {withLegend && (
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <motion.div
                  className={`${getBaseClasses()} w-4 h-4 rounded-full`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.9 + (i * 0.1), 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                />
                <motion.div
                  className={`${getBaseClasses()} h-4 w-16`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + (i * 0.1), duration: 0.3 }}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SkeletonChart;