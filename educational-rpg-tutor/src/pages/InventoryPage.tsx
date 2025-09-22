import React from 'react';
import { motion } from 'framer-motion';

export const InventoryPage: React.FC = () => {
  const inventory = [
    {
      name: 'Pencil of Power',
      type: 'Weapon',
      rarity: 'Common',
      description: 'A magical pencil that never breaks',
      icon: '✏️',
      equipped: true
    },
    {
      name: 'Backpack of Holding',
      type: 'Armor',
      rarity: 'Uncommon',
      description: 'Carries unlimited school supplies',
      icon: '🎒',
      equipped: true
    },
    {
      name: 'Glasses of Wisdom',
      type: 'Accessory',
      rarity: 'Rare',
      description: '+5 Intelligence when worn',
      icon: '👓',
      equipped: true
    },
    {
      name: 'Calculator of Truth',
      type: 'Tool',
      rarity: 'Epic',
      description: 'Never gives wrong answers',
      icon: '🧮',
      equipped: false
    },
    {
      name: 'Book of All Knowledge',
      type: 'Consumable',
      rarity: 'Legendary',
      description: 'Contains answers to any question',
      icon: '📚',
      equipped: false
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'from-gray-500 to-gray-400';
      case 'Uncommon': return 'from-green-500 to-green-400';
      case 'Rare': return 'from-blue-500 to-blue-400';
      case 'Epic': return 'from-purple-500 to-purple-400';
      case 'Legendary': return 'from-yellow-500 to-orange-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent mb-4">
            🎒 Inventory
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl">
            Manage your learning tools and magical items
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {inventory.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`backdrop-blur-xl rounded-2xl p-4 sm:p-6 border transition-all duration-300 cursor-pointer ${
                item.equipped 
                  ? 'bg-white/15 border-indigo-400/30 shadow-lg shadow-indigo-400/20' 
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${getRarityColor(item.rarity)} rounded-xl flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-4 shadow-lg`}>
                  {item.icon}
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.name}</h3>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(item.rarity)} text-white`}>
                    {item.rarity}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                    {item.type}
                  </span>
                </div>
                
                <p className="text-slate-300 text-sm mb-4">{item.description}</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  {item.equipped ? (
                    <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-lg text-white font-medium text-xs sm:text-sm hover:from-red-500 hover:to-red-400 transition-all duration-300">
                      Unequip
                    </button>
                  ) : (
                    <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium text-xs sm:text-sm hover:from-indigo-500 hover:to-purple-500 transition-all duration-300">
                      Equip
                    </button>
                  )}
                  <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-medium text-xs sm:text-sm transition-all duration-300">
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Inventory Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Inventory Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400">{inventory.length}</div>
              <div className="text-slate-300">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{inventory.filter(item => item.equipped).length}</div>
              <div className="text-slate-300">Equipped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{inventory.filter(item => item.rarity === 'Legendary' || item.rarity === 'Epic').length}</div>
              <div className="text-slate-300">Rare Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">∞</div>
              <div className="text-slate-300">Capacity</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};