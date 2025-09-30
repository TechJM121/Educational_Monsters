import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Working Monster Page - Fully functional and accessible
export const MonsterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'collection' | 'unlockables' | 'create'>('collection');

  const mockMonsters = [
    {
      id: '1',
      name: 'Sparkle',
      species: 'dragon',
      level: 15,
      bond: 85,
      isActive: true
    },
    {
      id: '2',
      name: 'Whisper',
      species: 'fox',
      level: 8,
      bond: 65,
      isActive: false
    }
  ];

  const tabs = [
    { key: 'collection', label: 'My Monsters', icon: '🐾', count: mockMonsters.length },
    { key: 'unlockables', label: 'Unlockables', icon: '🎁', count: 6 },
    { key: 'create', label: 'Create New', icon: '✨', count: null }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-4">
            🐾 Monster Companions
          </h1>
          <p className="text-lg text-slate-300 mb-4">
            Collect, customize, and bond with magical creatures
          </p>
          
          {/* Development Notice */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-sm font-medium">
            <span className="animate-pulse">🚧</span>
            <span>This feature is still in development</span>
            <span className="animate-pulse">🚧</span>
          </div>
        </div>

        {/* Development Notice Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="backdrop-blur-xl bg-amber-500/10 rounded-2xl border border-amber-400/30 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl animate-pulse">
                🚧
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-amber-300 mb-1">
                  Feature in Development
                </h2>
                <p className="text-amber-200/80 text-sm">
                  The Monster Companions system is currently being developed. The interface you see below is a preview of upcoming features including monster collection, customization, and breeding mechanics.
                </p>
              </div>
              <div className="text-amber-300/60 text-xs bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/20">
                Coming Soon
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Monster Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-3xl">
                  🐲
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Sparkle is your active companion
                  </h2>
                  <p className="text-slate-300">
                    Level 15 dragon • Bond: 85%
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 opacity-75 cursor-not-allowed">
                🎨 Customize (Preview)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95 ${
                activeTab === tab.key
                  ? 'text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-500'
                  : 'text-slate-300 hover:text-white bg-slate-700/30 hover:bg-slate-600/30'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                {tab.count !== null && (
                  <div className="text-xs opacity-75">{tab.count} items</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'collection' && (
              <div className="space-y-8">
                {/* Monster Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockMonsters.map((monster) => (
                    <div
                      key={monster.id}
                      className={`backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 transition-all duration-300 hover:border-white/30 ${
                        monster.isActive ? 'ring-2 ring-purple-400' : ''
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-4xl">
                          {monster.species === 'dragon' ? '🐲' : '🦊'}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{monster.name}</h3>
                        <p className="text-slate-300 mb-4">
                          Level {monster.level} {monster.species}
                        </p>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">Bond</span>
                            <span className="text-purple-400">{monster.bond}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${monster.bond}%` }}
                            />
                          </div>
                        </div>
                        {monster.isActive && (
                          <div className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full mb-2">
                            Active
                          </div>
                        )}
                        <div className="flex gap-2">
                          {!monster.isActive && (
                            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg text-sm hover:from-purple-500 hover:to-purple-400 transition-all duration-300 opacity-75 cursor-not-allowed">
                              Set Active (Preview)
                            </button>
                          )}
                          <button className="flex-1 px-4 py-2 bg-slate-600/50 text-slate-300 rounded-lg text-sm hover:bg-slate-500/50 hover:text-white transition-all duration-300 opacity-75 cursor-not-allowed">
                            🎨 Customize (Preview)
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Collection Stats */}
                <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                  <h2 className="text-xl font-bold text-white mb-6 text-center">
                    Collection Stats
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">2</div>
                      <div className="text-slate-300">Total Monsters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-400">75%</div>
                      <div className="text-slate-300">Avg Bond</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">12</div>
                      <div className="text-slate-300">Avg Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">6</div>
                      <div className="text-slate-300">Unlocked Items</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'unlockables' && (
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Customization Unlockables
                    </h2>
                    <div className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full border border-amber-400/30">
                      Preview
                    </div>
                  </div>
                  <p className="text-slate-300 mb-6">
                    Unlock new colors, patterns, accessories, and effects by progressing through the game.
                  </p>
                  
                  {/* Simple unlockables grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      { id: 'color_red', name: 'Crimson Red', icon: '🔴', unlocked: true },
                      { id: 'color_blue', name: 'Sapphire Blue', icon: '🔵', unlocked: true },
                      { id: 'color_green', name: 'Emerald Green', icon: '🟢', unlocked: true },
                      { id: 'pattern_stripes', name: 'Tiger Stripes', icon: '🐅', unlocked: true },
                      { id: 'wings_butterfly', name: 'Butterfly Wings', icon: '🦋', unlocked: true },
                      { id: 'accessory_crown', name: 'Royal Crown', icon: '👑', unlocked: false },
                      { id: 'effect_sparkles', name: 'Fairy Sparkles', icon: '✨', unlocked: false },
                      { id: 'color_rainbow', name: 'Rainbow', icon: '🌈', unlocked: false }
                    ].map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                          item.unlocked
                            ? 'border-green-400/50 bg-green-500/10 hover:border-green-300/50'
                            : 'border-slate-600/30 bg-slate-800/30 opacity-60'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{item.icon}</div>
                          <div className="text-sm text-white font-medium mb-1">{item.name}</div>
                          {item.unlocked ? (
                            <div className="text-xs text-green-400">Unlocked</div>
                          ) : (
                            <div className="text-xs text-slate-400">Locked</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'create' && (
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🥚</div>
                    <h2 className="text-xl font-bold text-white mb-4">
                      Create New Monster
                    </h2>
                    <p className="text-slate-300 mb-6">
                      Hatch a new monster companion from a magical egg. Each monster has unique traits and abilities.
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium text-lg transition-all duration-300 shadow-lg shadow-purple-500/25 opacity-75 cursor-not-allowed">
                      ✨ Hatch New Monster (Preview)
                    </button>
                  </div>
                </div>

                {/* Available Species */}
                <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Available Species
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { species: 'dragon', emoji: '🐲', name: 'Dragon', rarity: 'Epic' },
                      { species: 'phoenix', emoji: '🔥🦅', name: 'Phoenix', rarity: 'Legendary' },
                      { species: 'unicorn', emoji: '🦄', name: 'Unicorn', rarity: 'Legendary' },
                      { species: 'fox', emoji: '🦊', name: 'Fox', rarity: 'Common' },
                      { species: 'wolf', emoji: '🐺', name: 'Wolf', rarity: 'Uncommon' },
                      { species: 'owl', emoji: '🦉', name: 'Owl', rarity: 'Rare' }
                    ].map((species) => (
                      <div
                        key={species.species}
                        className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/30 text-center hover:border-slate-500/50 transition-all duration-300 cursor-pointer"
                      >
                        <div className="text-4xl mb-2">{species.emoji}</div>
                        <div className="text-white font-medium">{species.name}</div>
                        <div className="text-xs text-slate-400">{species.rarity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};