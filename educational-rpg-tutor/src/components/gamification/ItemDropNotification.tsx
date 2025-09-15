import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CollectibleItem } from '../../types/achievement';

interface ItemDropNotificationProps {
  item: CollectibleItem | null;
  onClose: () => void;
  autoCloseDelay?: number;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600',
};

const rarityGlow = {
  common: 'shadow-gray-400/25',
  uncommon: 'shadow-green-400/50',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-purple-400/50',
  legendary: 'shadow-yellow-400/75',
};

const categoryIcons = {
  spell_book: '📚',
  potion: '🧪',
  artifact: '🏺',
  equipment: '⚔️',
};

export function ItemDropNotification({
  item,
  onClose,
  autoCloseDelay = 3000
}: ItemDropNotificationProps) {
  useEffect(() => {
    if (item) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [item, onClose, autoCloseDelay]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }}
        className="fixed top-4 right-4 z-50 bg-white rounded-xl p-4 shadow-2xl border-2 border-slate-200 max-w-sm"
        onClick={onClose}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${rarityColors[item.rarity]} opacity-10 blur-sm`} />
        
        <div className="relative z-10 flex items-center space-x-3">
          {/* Item Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className={`
              w-12 h-12 rounded-lg border-2 flex items-center justify-center
              bg-gradient-to-br ${rarityColors[item.rarity]}
              ${rarityGlow[item.rarity]}
            `}
          >
            <span className="text-2xl text-white">
              {item.icon || categoryIcons[item.category]}
            </span>
          </motion.div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-sm font-medium text-slate-600 mb-1">
                Item Found! ✨
              </div>
              <div className="font-bold text-slate-800 truncate">
                {item.name}
              </div>
              <div className={`
                inline-block px-2 py-1 rounded-full text-xs font-medium text-white mt-1
                bg-gradient-to-r ${rarityColors[item.rarity]}
              `}>
                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
              </div>
            </motion.div>
          </div>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Sparkle Animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-2 -right-2 text-yellow-400 text-lg"
        >
          ✨
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}