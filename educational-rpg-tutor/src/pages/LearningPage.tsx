import React from 'react';
import { motion } from 'framer-motion';

export const LearningPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent mb-4">
            📚 Learning Worlds
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl">
            Embark on educational adventures across different subjects
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { title: 'Mathematics', icon: '🔢', color: 'from-blue-500 to-cyan-400' },
            { title: 'Science', icon: '🧪', color: 'from-green-500 to-emerald-400' },
            { title: 'Literature', icon: '📖', color: 'from-purple-500 to-pink-400' },
            { title: 'History', icon: '🏛️', color: 'from-yellow-500 to-orange-400' },
            { title: 'Geography', icon: '🌍', color: 'from-teal-500 to-blue-400' },
            { title: 'Art', icon: '🎨', color: 'from-pink-500 to-rose-400' }
          ].map((subject, index) => (
            <motion.div
              key={subject.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 cursor-pointer"
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${subject.color} rounded-xl flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 mx-auto`}>
                {subject.icon}
              </div>
              <h3 className="text-white font-semibold text-center mb-2 text-sm sm:text-base">{subject.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm text-center">Coming Soon</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};