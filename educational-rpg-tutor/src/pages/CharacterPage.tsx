import React from 'react';
import { CharacterPageTransition } from '../components/navigation/PageTransition';

export const CharacterPage: React.FC = () => {
  return (
    <CharacterPageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-rpg text-yellow-400 mb-6 flex items-center gap-3">
            ⚔️ Character Sheet
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Character Avatar */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h2 className="text-2xl font-rpg text-yellow-400 mb-4">Character Avatar</h2>
              <div className="flex items-center justify-center h-48 bg-slate-700/50 rounded-lg mb-4">
                <span className="text-6xl">🧙‍♂️</span>
              </div>
              <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                               text-white font-rpg rounded-lg hover:from-purple-500 hover:to-pink-500 
                               transition-all duration-200">
                Customize Avatar
              </button>
            </div>
            
            {/* Character Stats */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h2 className="text-2xl font-rpg text-yellow-400 mb-4">Character Stats</h2>
              <div className="space-y-3">
                {[
                  { name: 'Intelligence', value: 15, icon: '🧠' },
                  { name: 'Vitality', value: 12, icon: '❤️' },
                  { name: 'Wisdom', value: 10, icon: '🦉' },
                  { name: 'Charisma', value: 8, icon: '✨' },
                  { name: 'Dexterity', value: 11, icon: '🏃' },
                  { name: 'Creativity', value: 14, icon: '🎨' }
                ].map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span>{stat.icon}</span>
                      <span className="font-rpg">{stat.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                          style={{ width: `${(stat.value / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-yellow-400 font-bold w-8 text-right">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CharacterPageTransition>
  );
};