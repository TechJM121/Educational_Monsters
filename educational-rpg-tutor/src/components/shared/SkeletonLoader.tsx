import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animated?: boolean;
}

export function SkeletonLoader({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animated = true
}: SkeletonLoaderProps) {
  const baseClasses = `bg-slate-700 ${rounded ? 'rounded-full' : 'rounded'}`;
  
  if (!animated) {
    return (
      <div
        className={`${baseClasses} ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

// Character Card Skeleton
export function CharacterCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rpg-card p-6 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Avatar skeleton */}
        <SkeletonLoader width={80} height={80} rounded className="flex-shrink-0" />
        
        <div className="flex-1 space-y-3">
          {/* Name skeleton */}
          <SkeletonLoader width="60%" height="1.5rem" />
          
          {/* Level skeleton */}
          <SkeletonLoader width="40%" height="1rem" />
          
          {/* XP Bar skeleton */}
          <SkeletonLoader width="100%" height="0.5rem" rounded />
        </div>
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rpg-card p-6 ${className}`}>
      <SkeletonLoader width="50%" height="1.5rem" className="mb-4" />
      
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonLoader width={24} height={24} rounded />
              <SkeletonLoader width="80px" height="1rem" />
            </div>
            <SkeletonLoader width="40px" height="1rem" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Achievement Badge Skeleton
export function AchievementBadgeSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 bg-slate-700 rounded-lg ${className}`}>
      <SkeletonLoader width={40} height={40} rounded />
      <div className="flex-1 space-y-2">
        <SkeletonLoader width="70%" height="1rem" />
        <SkeletonLoader width="50%" height="0.75rem" />
      </div>
    </div>
  );
}

// Quest Card Skeleton
export function QuestCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rpg-card p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <SkeletonLoader width={32} height={32} rounded />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="80%" height="1rem" />
          <SkeletonLoader width="60%" height="0.75rem" />
          <SkeletonLoader width="100%" height="0.5rem" rounded className="mt-3" />
        </div>
      </div>
    </div>
  );
}

// Inventory Grid Skeleton
export function InventoryGridSkeleton({ 
  itemCount = 8, 
  className = '' 
}: { 
  itemCount?: number; 
  className?: string; 
}) {
  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="aspect-square bg-slate-700 rounded-lg p-2">
          <SkeletonLoader width="100%" height="100%" rounded />
        </div>
      ))}
    </div>
  );
}

// Home Page Skeleton
export function HomePageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-screen bg-rpg-pattern ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="rpg-card mb-8 p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <SkeletonLoader width={120} height={120} rounded className="flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <SkeletonLoader width="60%" height="2rem" />
              <SkeletonLoader width="80%" height="1.25rem" />
              <div className="flex gap-4">
                <SkeletonLoader width="100px" height="1rem" />
                <SkeletonLoader width="120px" height="1rem" />
                <SkeletonLoader width="90px" height="1rem" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="space-y-6">
            <StatsCardSkeleton />
          </div>
          
          <div className="space-y-6">
            <div className="rpg-card p-6">
              <SkeletonLoader width="40%" height="1.5rem" className="mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <QuestCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="rpg-card p-6">
              <SkeletonLoader width="50%" height="1.5rem" className="mb-4" />
              <InventoryGridSkeleton />
            </div>
            
            <div className="rpg-card p-6">
              <SkeletonLoader width="40%" height="1.5rem" className="mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <AchievementBadgeSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}