import React from 'react';
import { motion } from 'framer-motion';
import type { LearningWorld } from '../../types/world';

interface WorldCardProps {
  world: LearningWorld;
  onEnterWorld: (worldId: string) => void;
  onUnlockWorld?: (worldId: string) => void;
  className?: string;
}

export const WorldCard: React.FC<WorldCardProps> = ({
  world,
  onEnterWorld,
  onUnlockWorld,
  className = ''
}) => {
  const handleClick = () => {
    if (world.isUnlocked) {
      onEnterWorld(world.id);
    } else if (onUnlockWorld) {
      onUnlockWorld(world.id);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 ${className}`}
      onClick={handleClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: world.isUnlocked 
          ? `linear-gradient(135deg, ${world.theme.primaryColor}20, ${world.theme.secondaryColor}20)`
          : 'linear-gradient(135deg, #64748b20, #475569)'
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: world.isUnlocked ? `url(${world.theme.backgroundImage})` : 'none'
        }}
      />
      
      {/* Lock Overlay for Locked Worlds */}
      {!world.isUnlocked && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-sm font-medium">
              Level {world.unlockRequirements.minimumLevel} Required
            </div>
            {world.unlockRequirements.requiredSubjectXP > 0 && (
              <div className="text-xs opacity-75 mt-1">
                {world.unlockRequirements.requiredSubjectXP} XP in {world.subjectName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ 
                backgroundColor: world.isUnlocked ? world.theme.primaryColor : '#64748b',
                color: 'white'
              }}
            >
              {world.theme.iconUrl ? (
                <img 
                  src={world.theme.iconUrl} 
                  alt={world.name}
                  className="w-8 h-8"
                />
              ) : (
                world.subjectName.charAt(0)
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {world.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {world.subjectName}
              </p>
            </div>
          </div>
          
          {world.isUnlocked && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {world.completionPercentage}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 flex-grow">
          {world.description}
        </p>

        {/* Progress Bar */}
        {world.isUnlocked && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{world.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${getProgressColor(world.completionPercentage)}`}
                initial={{ width: 0 }}
                animate={{ width: `${world.completionPercentage}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Available Quests */}
        {world.isUnlocked && world.availableQuests.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {world.availableQuests.length} quest{world.availableQuests.length !== 1 ? 's' : ''} available
            </span>
            <div className="flex space-x-1">
              {world.availableQuests.slice(0, 3).map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: world.theme.primaryColor }}
                />
              ))}
              {world.availableQuests.length > 3 && (
                <span className="text-xs text-gray-500">+{world.availableQuests.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <motion.button
          className={`mt-4 w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
            world.isUnlocked
              ? 'bg-gradient-to-r text-white hover:opacity-90'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
          style={{
            background: world.isUnlocked 
              ? `linear-gradient(135deg, ${world.theme.primaryColor}, ${world.theme.secondaryColor})`
              : undefined
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {world.isUnlocked ? 'Enter World' : 'Unlock World'}
        </motion.button>
      </div>

      {/* Visual Effects */}
      {world.isUnlocked && world.theme.visualEffects.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {world.theme.visualEffects.map((effect, index) => (
            <div key={index} className="absolute inset-0">
              {effect.type === 'particles' && (
                <div className="particles-container">
                  {/* Particle effects would be implemented here */}
                  <div 
                    className="particle-effect"
                    style={{
                      background: `radial-gradient(circle, ${effect.config.color}40, transparent)`,
                      animation: 'float 3s ease-in-out infinite'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};