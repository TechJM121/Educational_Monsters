import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EquipmentChange {
  type: 'equipped' | 'unequipped';
  itemName: string;
  itemIcon: string;
  slot: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface EquipmentChangeAnimationProps {
  change: EquipmentChange;
  onComplete?: () => void;
  duration?: number;
}

const rarityColors = {
  common: 'from-gray-500 to-gray-400',
  uncommon: 'from-green-500 to-green-400',
  rare: 'from-blue-500 to-blue-400',
  epic: 'from-purple-500 to-purple-400',
  legendary: 'from-yellow-500 to-yellow-400',
};

export function EquipmentChangeAnimation({
  change,
  onComplete,
  duration = 2500
}: EquipmentChangeAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const isEquipped = change.type === 'equipped';
  const rarity = change.rarity || 'common';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 border border-slate-600 shadow-2xl max-w-sm">
            <div className="text-center">
              {/* Item Icon with Rarity Glow */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative mb-4"
              >
                <div className={`w-20 h-20 mx-auto rounded-lg bg-gradient-to-br ${rarityColors[rarity]} flex items-center justify-center text-4xl shadow-lg`}>
                  {change.itemIcon}
                </div>
                
                {/* Rarity glow effect */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.6, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  className={`absolute inset-0 rounded-lg bg-gradient-to-br ${rarityColors[rarity]} blur-md`}
                />
              </motion.div>

              {/* Action Text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-4"
              >
                <h3 className={`text-xl font-bold mb-2 ${
                  isEquipped ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {isEquipped ? 'Item Equipped!' : 'Item Unequipped!'}
                </h3>
                
                <div className="text-white font-medium mb-1">
                  {change.itemName}
                </div>
                
                <div className="text-slate-400 text-sm capitalize">
                  {change.slot} Slot
                </div>
                
                {change.rarity && (
                  <div className={`text-sm font-medium mt-1 capitalize ${
                    rarity === 'legendary' ? 'text-yellow-400' :
                    rarity === 'epic' ? 'text-purple-400' :
                    rarity === 'rare' ? 'text-blue-400' :
                    rarity === 'uncommon' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {rarity}
                  </div>
                )}
              </motion.div>

              {/* Status Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                className={`text-3xl ${
                  isEquipped ? 'text-green-400' : 'text-orange-400'
                }`}
              >
                {isEquipped ? '⚔️' : '📦'}
              </motion.div>
            </div>

            {/* Sparkle effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
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
                    x: `${50 + (Math.random() - 0.5) * 300}%`,
                    y: `${50 + (Math.random() - 0.5) * 300}%`,
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: 0.3 + Math.random() * 0.8,
                    ease: "easeOut"
                  }}
                  className={`absolute w-1 h-1 rounded-full ${
                    rarity === 'legendary' ? 'bg-yellow-400' :
                    rarity === 'epic' ? 'bg-purple-400' :
                    rarity === 'rare' ? 'bg-blue-400' :
                    rarity === 'uncommon' ? 'bg-green-400' :
                    'bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Ring effect for rare+ items */}
            {['rare', 'epic', 'legendary'].includes(rarity) && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2, 3], opacity: [0, 0.8, 0] }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className={`absolute inset-0 rounded-full border-4 ${
                  rarity === 'legendary' ? 'border-yellow-400' :
                  rarity === 'epic' ? 'border-purple-400' :
                  'border-blue-400'
                }`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}