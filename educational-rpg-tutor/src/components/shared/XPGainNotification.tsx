import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPGainNotificationProps {
  xpGained: number;
  isVisible: boolean;
  onComplete?: () => void;
  position?: 'center' | 'top-right' | 'bottom-center';
  showReason?: string;
}

export function XPGainNotification({
  xpGained,
  isVisible,
  onComplete,
  position = 'center',
  showReason
}: XPGainNotificationProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible && xpGained > 0) {
      setShouldShow(true);
      
      const timer = setTimeout(() => {
        setShouldShow(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, xpGained, onComplete]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.5, 
            y: position === 'center' ? 0 : 20 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: position === 'center' ? -20 : 0 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8, 
            y: position === 'center' ? -40 : -20 
          }}
          transition={{ 
            duration: 0.6,
            ease: "easeOut"
          }}
          className={`fixed z-50 ${getPositionClasses()}`}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg border-2 border-yellow-300">
            <div className="flex items-center gap-2">
              {/* XP Icon */}
              <motion.span
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1,
                  ease: "easeInOut"
                }}
                className="text-xl"
              >
                ⭐
              </motion.span>

              {/* XP Amount */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="font-bold text-lg"
              >
                +{xpGained} XP
              </motion.span>

              {/* Reason (if provided) */}
              {showReason && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-yellow-100 ml-2"
                >
                  {showReason}
                </motion.span>
              )}
            </div>

            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 1.5,
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