import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: string;
  expectedDate?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon = '🚀',
  expectedDate
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Icon */}
                <div className="text-6xl mb-4">{icon}</div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>

                {/* Coming Soon Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-medium text-sm mb-4">
                  <span className="animate-pulse">✨</span>
                  <span>Coming Soon</span>
                </div>

                {/* Description */}
                <p className="text-slate-300 mb-4 leading-relaxed">{description}</p>

                {/* Expected Date */}
                {expectedDate && (
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
                      <span className="text-blue-400">📅</span>
                      <span className="text-slate-300 text-sm">Expected: {expectedDate}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Got it
                  </button>
                  <button
                    onClick={() => {
                      // Could implement notification signup here
                      onClose();
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    Notify Me
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};