import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { InventoryGrid } from './InventoryGrid';
import type { CollectibleItem, UserInventory } from '../../types/achievement';

interface InventoryManagerProps {
  items: Array<{
    item: CollectibleItem;
    inventory: UserInventory;
  }>;
  className?: string;
}

type FilterRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | null;
type FilterCategory = 'spell_book' | 'potion' | 'artifact' | 'equipment' | null;
type SortOption = 'rarity' | 'name' | 'acquired' | 'quantity';

const rarityFilters: Array<{ value: FilterRarity; label: string; color: string }> = [
  { value: null, label: 'All', color: 'bg-slate-500' },
  { value: 'common', label: 'Common', color: 'bg-gray-500' },
  { value: 'uncommon', label: 'Uncommon', color: 'bg-green-500' },
  { value: 'rare', label: 'Rare', color: 'bg-blue-500' },
  { value: 'epic', label: 'Epic', color: 'bg-purple-500' },
  { value: 'legendary', label: 'Legendary', color: 'bg-yellow-500' },
];

const categoryFilters: Array<{ value: FilterCategory; label: string; icon: string }> = [
  { value: null, label: 'All', icon: '📦' },
  { value: 'spell_book', label: 'Books', icon: '📚' },
  { value: 'potion', label: 'Potions', icon: '🧪' },
  { value: 'artifact', label: 'Artifacts', icon: '🏺' },
  { value: 'equipment', label: 'Equipment', icon: '⚔️' },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'rarity', label: 'Rarity' },
  { value: 'name', label: 'Name' },
  { value: 'acquired', label: 'Recently Acquired' },
  { value: 'quantity', label: 'Quantity' },
];

export function InventoryManager({ items, className = '' }: InventoryManagerProps) {
  const [rarityFilter, setRarityFilter] = useState<FilterRarity>(null);
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rarity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate statistics
  const totalItems = items.reduce((sum, { inventory }) => sum + inventory.quantity, 0);
  const uniqueItems = items.length;
  const rarityStats = items.reduce((stats, { item, inventory }) => {
    stats[item.rarity] = (stats[item.rarity] || 0) + inventory.quantity;
    return stats;
  }, {} as Record<string, number>);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Inventory</h3>
          <div className="text-sm text-slate-600">
            {totalItems} items • {uniqueItems} unique
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-primary-100 text-primary-600' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-primary-100 text-primary-600' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {rarityFilters.slice(1).map(({ value, label, color }) => {
          const count = rarityStats[value!] || 0;
          return (
            <div key={value} className="text-center">
              <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-1`} />
              <div className="text-xs text-slate-600">{label}</div>
              <div className="text-sm font-medium text-slate-800">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Rarity Filter */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Filter by Rarity
          </label>
          <div className="flex flex-wrap gap-2">
            {rarityFilters.map(({ value, label, color }) => (
              <motion.button
                key={value || 'all'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRarityFilter(value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${rarityFilter === value
                    ? `${color} text-white shadow-lg`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map(({ value, label, icon }) => (
              <motion.button
                key={value || 'all'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategoryFilter(value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1
                  ${categoryFilter === value
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Display */}
      <InventoryGrid
        items={items}
        filterByRarity={rarityFilter}
        filterByCategory={categoryFilter}
        sortBy={sortBy}
        maxDisplay={viewMode === 'grid' ? 16 : 8}
        gridCols={viewMode === 'grid' ? 4 : 2}
        showQuantity={true}
      />
    </div>
  );
}