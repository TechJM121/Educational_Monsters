import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MorphingNumber } from './MorphingNumber';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { AnimatedProgressRing } from './AnimatedProgressRing';

interface StatCardProps {
  title: string;
  value: number;
  maxValue?: number;
  previousValue?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  format?: (value: number) => string;
  showProgress?: boolean;
  progressType?: 'bar' | 'ring';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  tooltip?: string;
  className?: string;
}

const trendColors = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-600 dark:text-gray-400',
};

const trendIcons = {
  up: '↗',
  down: '↘',
  neutral: '→',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  maxValue,
  previousValue,
  icon,
  trend,
  trendValue,
  format,
  showProgress = false,
  progressType = 'bar',
  color = 'primary',
  tooltip,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const hasProgress = showProgress && maxValue !== undefined;
  const hasTrend = trend && trendValue !== undefined;

  return (
    <motion.div
      className={`
        relative p-6 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md 
        border border-white/20 dark:border-gray-700/20 rounded-2xl 
        shadow-lg hover:shadow-xl transition-all duration-300
        ${className}
      `}
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <motion.div
              className="text-2xl"
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          )}
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </h3>
        </div>
        
        {hasTrend && (
          <motion.div
            className={`flex items-center space-x-1 text-sm ${trendColors[trend!]}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span>{trendIcons[trend!]}</span>
            <MorphingNumber
              value={trendValue!}
              format={(val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
              className="font-semibold"
            />
          </motion.div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <MorphingNumber
          value={value}
          format={format}
          className="text-3xl font-bold text-gray-900 dark:text-gray-100"
          animateOnChange={true}
        />
      </div>

      {/* Progress Indicator */}
      {hasProgress && (
        <div className="mt-4">
          {progressType === 'bar' ? (
            <AnimatedProgressBar
              value={value}
              max={maxValue!}
              color={color}
              size="sm"
              showValue={false}
              tooltip={tooltip}
            />
          ) : (
            <div className="flex justify-center">
              <AnimatedProgressRing
                value={value}
                max={maxValue!}
                size={60}
                strokeWidth={4}
                color={color}
                showValue={false}
                tooltip={tooltip}
              />
            </div>
          )}
        </div>
      )}

      {/* Hover Tooltip */}
      {tooltip && isHovered && !hasProgress && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg z-10 whitespace-nowrap"
        >
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </motion.div>
      )}

      {/* Animated background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl"
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};