import React from 'react';
import { motion } from 'framer-motion';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: string;
  features?: string[];
  expectedDate?: string;
  onBack?: () => void;
  className?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  description,
  icon,
  features = [],
  expectedDate,
  onBack,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-8xl mb-6"
        >
          {icon}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-4"
        >
          {title}
        </motion.h1>

        {/* Coming Soon Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-bold text-lg mb-6"
        >
          <span className="animate-pulse">🚀</span>
          <span>Coming Soon</span>
          <span className="animate-pulse">✨</span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-slate-300 mb-8 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Expected Date */}
        {expectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
              <span className="text-blue-400">📅</span>
              <span className="text-slate-300">Expected: {expectedDate}</span>
            </div>
          </motion.div>
        )}

        {/* Features List */}
        {features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">What to expect:</h3>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-slate-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              ← Go Back
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/app/home'}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
          >
            🏠 Back to Dashboard
          </button>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};