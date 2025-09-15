import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatChange {
  stat: string;
  oldValue: number;
  newValue: number;
  icon: string;
}

interface StatChangeAnimationProps {
  changes: StatChange[];
  onComplete?: () => void;
  duration?: number;
}

export function StatChangeAnimation({
  changes,
  onComplete,
  duration = 2000
}: StatChangeAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (changes.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 border border-slate-600 shadow-2xl">
            <div className="text-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-4xl mb-2"
              >
                ⭐
              </motion.div>
              <h3 className="text-xl font-bold text-white">Stats Updated!</h3>
            </div>

            <div className="space-y-3">
              {changes.map((change, index) => {
                const difference = change.newValue - change.oldValue;
                const isIncrease = difference > 0;

                return (
                  <motion.div
                    key={change.stat}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{change.icon}</span>
                      <span className="text-white font-medium capitalize">
                        {change.stat}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{change.oldValue}</span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="text-slate-400"
                      >
                        →
                      </motion.span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className={`font-bold ${
                          isIncrease ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {change.newValue}
                      </motion.span>
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className={`text-sm font-bold ${
                          isIncrease ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        ({isIncrease ? '+' : ''}{difference})
                      </motion.span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Particle effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0,
                    scale: 0,
                    x: '50%',
                    y: '50%'
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: 0.5 + Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}