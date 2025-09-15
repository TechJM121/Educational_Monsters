import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatImprovement {
  stat: 'intelligence' | 'vitality' | 'wisdom' | 'charisma' | 'dexterity' | 'creativity';
  oldValue: number;
  newValue: number;
}

interface StatImprovementNotificationProps {
  improvements: StatImprovement[];
  isVisible: boolean;
  onComplete?: () => void;
  duration?: number;
}

const STAT_CONFIG = {
  intelligence: { icon: '🧠', color: '#3b82f6', name: 'Intelligence' },
  vitality: { icon: '❤️', color: '#22c55e', name: 'Vitality' },
  wisdom: { icon: '📚', color: '#8b5cf6', name: 'Wisdom' },
  charisma: { icon: '💬', color: '#f59e0b', name: 'Charisma' },
  dexterity: { icon: '⚡', color: '#06b6d4', name: 'Dexterity' },
  creativity: { icon: '🎨', color: '#ec4899', name: 'Creativity' }
};

export function StatImprovementNotification({
  improvements,
  isVisible,
  onComplete,
  duration = 3000
}: StatImprovementNotificationProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible && improvements.length > 0) {
      setShouldShow(true);
      
      const timer = setTimeout(() => {
        setShouldShow(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, improvements, duration, onComplete]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-xl"
              >
                📈
              </motion.span>
              <h3 className="font-rpg text-slate-200 text-lg">Stats Improved!</h3>
            </div>

            <div className="space-y-2">
              {improvements.map((improvement, index) => {
                const config = STAT_CONFIG[improvement.stat];
                const increase = improvement.newValue - improvement.oldValue;
                
                return (
                  <motion.div
                    key={improvement.stat}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 bg-slate-700 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-slate-300 text-sm">{config.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">
                        {improvement.oldValue}
                      </span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="text-green-400 text-sm font-bold"
                      >
                        +{increase}
                      </motion.span>
                      <span 
                        className="text-sm font-bold"
                        style={{ color: config.color }}
                      >
                        {improvement.newValue}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-blue-400/30"
              animate={{
                borderColor: [
                  'rgba(59, 130, 246, 0.3)',
                  'rgba(59, 130, 246, 0.6)',
                  'rgba(59, 130, 246, 0.3)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}