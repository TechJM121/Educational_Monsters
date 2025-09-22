import React from 'react';
import { motion } from 'framer-motion';

export const CharacterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-4">
            🧙‍♂️ Character Sheet
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl">
            Manage your character's stats, abilities, and appearance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Character Avatar */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Avatar</h2>
            <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center text-6xl mx-auto mb-4">
              👤
            </div>
            <p className="text-center text-slate-300 mb-4">Guest Explorer</p>
            <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium">
              Customize Avatar
            </button>
          </div>

          {/* Stats */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Stats</h2>
            <div className="space-y-4">
              {[
                { name: 'Intelligence', value: 10, max: 20, icon: '🧠' },
                { name: 'Creativity', value: 8, max: 20, icon: '🎨' },
                { name: 'Focus', value: 12, max: 20, icon: '🎯' },
                { name: 'Memory', value: 9, max: 20, icon: '🧩' }
              ].map((stat) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2">
                      {stat.icon} {stat.name}
                    </span>
                    <span className="text-white font-bold">{stat.value}/{stat.max}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stat.value / stat.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Equipment</h2>
            <div className="space-y-3">
              {[
                { slot: 'Weapon', item: 'Pencil of Power', icon: '✏️' },
                { slot: 'Armor', item: 'Backpack of Holding', icon: '🎒' },
                { slot: 'Accessory', item: 'Glasses of Wisdom', icon: '👓' }
              ].map((equipment) => (
                <div key={equipment.slot} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{equipment.icon}</span>
                    <div>
                      <p className="text-white font-medium">{equipment.item}</p>
                      <p className="text-slate-400 text-sm">{equipment.slot}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};