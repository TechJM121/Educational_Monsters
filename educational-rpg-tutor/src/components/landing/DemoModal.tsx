import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-auto border border-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* Content */}
            <div className="text-center">
              <h2 className="text-3xl font-rpg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                EduQuest Demo
              </h2>
              
              {/* Video placeholder */}
              <div className="bg-slate-700 rounded-xl aspect-video flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-slate-300 text-lg">Demo Video Coming Soon!</p>
                  <p className="text-slate-400 text-sm mt-2">
                    Experience the magic of gamified learning
                  </p>
                </div>
              </div>

              {/* Features preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: '🎮', title: 'RPG Elements', desc: 'Level up as you learn' },
                  { icon: '🤖', title: 'AI Tutoring', desc: 'Personalized guidance' },
                  { icon: '🏆', title: 'Achievements', desc: 'Unlock rewards' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-700/50 rounded-lg p-4"
                  >
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-slate-300 text-sm">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Start Your Adventure Now
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};