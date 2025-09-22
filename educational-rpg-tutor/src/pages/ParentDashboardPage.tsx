import React from 'react';
import { motion } from 'framer-motion';

export const ParentDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-teal-400 to-green-300 bg-clip-text text-transparent mb-4">
            👨‍👩‍👧‍👦 Parent Dashboard
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl">
            Monitor your child's learning progress and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Progress Overview */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Progress Overview</h2>
            <div className="space-y-4">
              {[
                { subject: 'Mathematics', progress: 75, color: 'from-blue-500 to-cyan-400' },
                { subject: 'Science', progress: 60, color: 'from-green-500 to-emerald-400' },
                { subject: 'Reading', progress: 85, color: 'from-purple-500 to-pink-400' },
                { subject: 'History', progress: 45, color: 'from-yellow-500 to-orange-400' }
              ].map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">{subject.subject}</span>
                    <span className="text-white font-bold">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className={`bg-gradient-to-r ${subject.color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { activity: 'Completed Math Quiz', time: '2 hours ago', icon: '🔢' },
                { activity: 'Read "The Magic Tree"', time: '1 day ago', icon: '📚' },
                { activity: 'Science Experiment', time: '2 days ago', icon: '🧪' },
                { activity: 'History Timeline', time: '3 days ago', icon: '📜' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.activity}</p>
                    <p className="text-slate-400 text-sm">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Stats */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Learning Stats</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-400">45</div>
                <div className="text-slate-300">Hours This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">12</div>
                <div className="text-slate-300">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">8</div>
                <div className="text-slate-300">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">5</div>
                <div className="text-slate-300">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Settings & Controls */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Settings & Controls</h2>
            <div className="space-y-4">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-green-600 rounded-lg text-white font-medium hover:from-teal-500 hover:to-green-500 transition-all duration-300">
                Set Learning Goals
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-300">
                Manage Screen Time
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg text-white font-medium hover:from-yellow-500 hover:to-orange-500 transition-all duration-300">
                View Detailed Reports
              </button>
              <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-medium transition-all duration-300">
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Guest Mode Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 backdrop-blur-xl bg-yellow-900/20 border border-yellow-600/30 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="text-yellow-300 font-semibold mb-2">Guest Mode - Limited Features</h3>
              <p className="text-yellow-200 text-sm mb-4">
                This is a preview of the Parent Dashboard. Create an account to access full parental controls, 
                detailed progress tracking, and personalized learning recommendations.
              </p>
              <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors">
                Create Parent Account
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};