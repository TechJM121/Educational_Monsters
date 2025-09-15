import React from 'react';
import { Tooltip } from '../shared/Tooltip';
import type { CollectibleItem, UserInventory } from '../../types/achievement';

interface InventoryGridProps {
  items: Array<{
    item: CollectibleItem;
    inventory: UserInventory;
  }>;
  maxDisplay?: number;
  showQuantity?: boolean;
  gridCols?: number;
  filterByRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | null;
  filterByCategory?: 'spell_book' | 'potion' | 'artifact' | 'equipment' | null;
  sortBy?: 'rarity' | 'name' | 'acquired' | 'quantity';
  className?: string;
}

const rarityColors = {
  common: 'border-gray-400 bg-gray-100',
  uncommon: 'border-green-400 bg-green-100',
  rare: 'border-blue-400 bg-blue-100',
  epic: 'border-purple-400 bg-purple-100',
  legendary: 'border-yellow-400 bg-yellow-100 shadow-lg',
};

const rarityGlow = {
  common: '',
  uncommon: 'shadow-green-400/25',
  rare: 'shadow-blue-400/25',
  epic: 'shadow-purple-400/25',
  legendary: 'shadow-yellow-400/50 animate-pulse',
};

const categoryIcons = {
  spell_book: '📚',
  potion: '🧪',
  artifact: '🏺',
  equipment: '⚔️',
};

export function InventoryGrid({
  items,
  maxDisplay = 12,
  showQuantity = true,
  gridCols = 4,
  filterByRarity = null,
  filterByCategory = null,
  sortBy = 'rarity',
  className = ''
}: InventoryGridProps) {
  // Apply filters
  let filteredItems = items;
  
  if (filterByRarity) {
    filteredItems = filteredItems.filter(({ item }) => item.rarity === filterByRarity);
  }
  
  if (filterByCategory) {
    filteredItems = filteredItems.filter(({ item }) => item.category === filterByCategory);
  }

  // Apply sorting
  filteredItems.sort((a, b) => {
    switch (sortBy) {
      case 'rarity': {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
        return rarityOrder[b.item.rarity] - rarityOrder[a.item.rarity];
      }
      case 'name':
        return a.item.name.localeCompare(b.item.name);
      case 'acquired':
        return b.inventory.acquiredAt.getTime() - a.inventory.acquiredAt.getTime();
      case 'quantity':
        return b.inventory.quantity - a.inventory.quantity;
      default:
        return 0;
    }
  });

  const displayItems = filteredItems.slice(0, maxDisplay);

  if (displayItems.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-2">🎒</div>
        <div className="text-slate-400">No items collected yet</div>
        <div className="text-sm text-slate-500 mt-1">
          Complete lessons to earn collectible items!
        </div>
      </div>
    );
  }

  const gridClass = `grid-cols-${gridCols}`;

  return (
    <div className={`grid ${gridClass} gap-3 ${className}`}>
      {displayItems.map(({ item, inventory }) => {
        const tooltipContent = (
          <div className="max-w-xs">
            <div className="font-semibold text-white">{item.name}</div>
            <div className="text-xs text-slate-300 mt-1">{item.description}</div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getRarityTextColor(item.rarity)}`}>
                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
              </span>
              {showQuantity && inventory.quantity > 1 && (
                <span className="text-xs text-slate-400">
                  Qty: {inventory.quantity}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {item.tradeable ? 'Tradeable' : 'Bound to character'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Acquired: {new Date(inventory.acquiredAt).toLocaleDateString()}
            </div>
          </div>
        );

        return (
          <Tooltip key={inventory.id} content={tooltipContent}>
            <div
              className={`
                relative w-16 h-16 rounded-lg border-2 flex items-center justify-center
                cursor-pointer transition-all duration-200 hover:scale-110
                ${rarityColors[item.rarity]}
                ${rarityGlow[item.rarity]}
              `}
            >
              <span className="text-2xl">
                {item.icon || categoryIcons[item.category]}
              </span>

              {/* Quantity Badge */}
              {showQuantity && inventory.quantity > 1 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {inventory.quantity > 99 ? '99+' : inventory.quantity}
                </div>
              )}

              {/* Rarity Indicator */}
              <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full border border-white">
                <div className={`w-full h-full rounded-full ${getRarityDot(item.rarity)}`} />
              </div>

              {/* Tradeable Indicator */}
              {item.tradeable && (
                <div className="absolute top-0 right-0 w-3 h-3">
                  <span className="text-xs">🔄</span>
                </div>
              )}
            </div>
          </Tooltip>
        );
      })}

      {/* Show More Indicator */}
      {filteredItems.length > maxDisplay && (
        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-400 flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors">
          <div className="text-center">
            <div className="text-slate-400 text-sm">+{filteredItems.length - maxDisplay}</div>
            <div className="text-xs text-slate-500">more</div>
          </div>
        </div>
      )}
    </div>
  );
}

function getRarityTextColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'bg-gray-600 text-gray-100',
    uncommon: 'bg-green-600 text-green-100',
    rare: 'bg-blue-600 text-blue-100',
    epic: 'bg-purple-600 text-purple-100',
    legendary: 'bg-yellow-600 text-yellow-100',
  };
  return colors[rarity] || colors.common;
}

function getRarityDot(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'bg-gray-500',
    uncommon: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500',
  };
  return colors[rarity] || colors.common;
}