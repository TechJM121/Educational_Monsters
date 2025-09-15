import React from 'react';
import { PageTransition } from '../components/navigation/PageTransition';

export const InventoryPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-rpg text-yellow-400 mb-6 flex items-center gap-3">
            🎒 Inventory Bag
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Sample inventory items */}
            {[
              { name: 'Magic Scroll', icon: '📜', rarity: 'common' },
              { name: 'Crystal Orb', icon: '🔮', rarity: 'rare' },
              { name: 'Golden Quill', icon: '🖋️', rarity: 'epic' },
              { name: 'Health Potion', icon: '🧪', rarity: 'common' },
              { name: 'Wisdom Book', icon: '📖', rarity: 'uncommon' },
              { name: 'Star Badge', icon: '⭐', rarity: 'legendary' }
            ].map((item, index) => (
              <div 
                key={index}
                className={`aspect-square p-4 rounded-lg border-2 transition-all duration-200 
                           hover:scale-105 cursor-pointer ${
                  item.rarity === 'common' ? 'border-gray-500 bg-gray-500/10' :
                  item.rarity === 'uncommon' ? 'border-green-500 bg-green-500/10' :
                  item.rarity === 'rare' ? 'border-blue-500 bg-blue-500/10' :
                  item.rarity === 'epic' ? 'border-purple-500 bg-purple-500/10' :
                  'border-yellow-500 bg-yellow-500/10'
                }`}
              >
                <div className="text-center h-full flex flex-col justify-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-xs font-rpg text-slate-300">{item.name}</div>
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 12 }, (_, index) => (
              <div 
                key={`empty-${index}`}
                className="aspect-square p-4 rounded-lg border-2 border-dashed border-slate-600 
                           bg-slate-800/20 flex items-center justify-center"
              >
                <span className="text-slate-600 text-2xl">+</span>
              </div>
            ))}
          </div>
          
          {/* Item details panel */}
          <div className="mt-8 bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
            <h2 className="text-xl font-rpg text-yellow-400 mb-3">Item Details</h2>
            <p className="text-slate-300">Select an item to view its details and properties.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};