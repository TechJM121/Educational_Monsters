import React from 'react';
import { motion } from 'framer-motion';
import SkeletonText from './SkeletonText';
import SkeletonCard from './SkeletonCard';
import SkeletonAvatar from './SkeletonAvatar';
import SkeletonChart from './SkeletonChart';

export interface SkeletonLayoutProps {
  layout: 'dashboard' | 'profile' | 'feed' | 'grid' | 'list' | 'custom';
  animation?: 'pulse' | 'wave' | 'shimmer';
  className?: string;
  responsive?: boolean;
  customElements?: React.ReactNode[];
}

const SkeletonLayout: React.FC<SkeletonLayoutProps> = ({
  layout,
  animation = 'pulse',
  className = '',
  responsive = true,
  customElements
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const renderDashboardLayout = () => (
    <motion.div
      className={`space-y-6 ${responsive ? 'w-full' : ''} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <SkeletonText lines={1} animation={animation} className="w-1/3" />
        <SkeletonAvatar size="md" animation={animation} withName />
      </motion.div>
      
      {/* Stats cards */}
      <motion.div 
        variants={itemVariants}
        className={`grid ${responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4'} gap-4`}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard
            key={i}
            animation={animation}
            hasImage={false}
            hasButton={false}
            textLines={2}
            height="120px"
          />
        ))}
      </motion.div>
      
      {/* Main content area */}
      <motion.div 
        variants={itemVariants}
        className={`grid ${responsive ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-3'} gap-6`}
      >
        <div className="lg:col-span-2 space-y-4">
          <SkeletonChart type="bar" animation={animation} />
          <SkeletonChart type="line" animation={animation} />
        </div>
        <div className="space-y-4">
          <SkeletonCard animation={animation} textLines={4} />
          <SkeletonCard animation={animation} textLines={3} hasImage={false} />
        </div>
      </motion.div>
    </motion.div>
  );

  const renderProfileLayout = () => (
    <motion.div
      className={`space-y-6 ${responsive ? 'w-full max-w-4xl mx-auto' : ''} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <SkeletonAvatar size="2xl" animation={animation} className="mx-auto" />
        <SkeletonText lines={2} animation={animation} className="max-w-md mx-auto" />
      </motion.div>
      
      {/* Profile stats */}
      <motion.div 
        variants={itemVariants}
        className={`grid ${responsive ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-3'} gap-4`}
      >
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="text-center space-y-2">
            <SkeletonText lines={1} animation={animation} className="w-16 mx-auto" />
            <SkeletonText lines={1} animation={animation} className="w-20 mx-auto" />
          </div>
        ))}
      </motion.div>
      
      {/* Profile content */}
      <motion.div 
        variants={itemVariants}
        className={`grid ${responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'} gap-6`}
      >
        <SkeletonCard animation={animation} textLines={5} />
        <SkeletonChart type="pie" animation={animation} />
      </motion.div>
    </motion.div>
  );

  const renderFeedLayout = () => (
    <motion.div
      className={`space-y-4 ${responsive ? 'w-full max-w-2xl mx-auto' : ''} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div key={i} variants={itemVariants} className="space-y-3">
          <div className="flex items-start space-x-3">
            <SkeletonAvatar size="md" animation={animation} />
            <div className="flex-1 space-y-2">
              <SkeletonText lines={1} animation={animation} className="w-1/4" />
              <SkeletonText lines={3} animation={animation} />
            </div>
          </div>
          <SkeletonCard animation={animation} hasImage textLines={2} hasButton={false} />
        </motion.div>
      ))}
    </motion.div>
  );

  const renderGridLayout = () => (
    <motion.div
      className={`grid ${responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-4'} gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div key={i} variants={itemVariants}>
          <SkeletonCard animation={animation} textLines={2} />
        </motion.div>
      ))}
    </motion.div>
  );

  const renderListLayout = () => (
    <motion.div
      className={`space-y-3 ${responsive ? 'w-full' : ''} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div 
          key={i} 
          variants={itemVariants}
          className="flex items-center space-x-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm"
        >
          <SkeletonAvatar size="sm" animation={animation} />
          <div className="flex-1">
            <SkeletonText lines={2} animation={animation} />
          </div>
          <SkeletonText lines={1} animation={animation} className="w-20" />
        </motion.div>
      ))}
    </motion.div>
  );

  const renderCustomLayout = () => (
    <motion.div
      className={`${responsive ? 'w-full' : ''} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {customElements?.map((element, i) => (
        <motion.div key={i} variants={itemVariants}>
          {element}
        </motion.div>
      ))}
    </motion.div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'dashboard':
        return renderDashboardLayout();
      case 'profile':
        return renderProfileLayout();
      case 'feed':
        return renderFeedLayout();
      case 'grid':
        return renderGridLayout();
      case 'list':
        return renderListLayout();
      case 'custom':
        return renderCustomLayout();
      default:
        return renderDashboardLayout();
    }
  };

  return renderLayout();
};

export default SkeletonLayout;