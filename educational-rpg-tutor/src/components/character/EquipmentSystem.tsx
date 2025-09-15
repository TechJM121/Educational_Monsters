import React, { useState } from 'react';
import { CharacterAvatar } from './CharacterAvatar';
import { Tooltip } from '../shared/Tooltip';
import type { Character, EquippedItem } from '../../types/character';

interface Item {
  id: string;
  name: string;
  description: string;
  slot: 'head' | 'body' | 'weapon' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  stats: {
    intelligence?: number;
    vitality?: number;
    wisdom?: number;
    charisma?: number;
    dexterity?: number;
    creativity?: number;
  };
  unlockRequirement: string;
  isUnlocked: boolean;
}

interface EquipmentSystemProps {
  character: Character;
  availableItems: Item[];
  onEquip: (itemId: string, slot: string) => Promise<void>;
  onUnequip: (slot: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

const rarityColors = {
  common: 'from-gray-500 to-gray-400',
  uncommon: 'from-green-500 to-green-400',
  rare: 'from-blue-500 to-blue-400',
  epic: 'from-purple-500 to-purple-400',
  legendary: 'from-yellow-500 to-yellow-400',
};

const rarityBorders = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
};

const slotNames = {
  head: 'Head',
  body: 'Body',
  weapon: 'Weapon',
  accessory: 'Accessory',
};

export function EquipmentSystem({
  character,
  availableItems,
  onEquip,
  onUnequip,
  onClose,
  isLoading = false
}: EquipmentSystemProps) {
  const [selectedSlot, setSelectedSlot] = useState<'head' | 'body' | 'weapon' | 'accessory' | null>(null);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);

  const getEquippedItem = (slot: string): EquippedItem | undefined => {
    return character.equippedItems.find(item => item.slot === slot);
  };

  const getItemById = (itemId: string): Item | undefined => {
    return availableItems.find(item => item.id === itemId);
  };

  const getSlotItems = (slot: string): Item[] => {
    return availableItems.filter(item => item.slot === slot && item.isUnlocked);
  };

  const calculateTotalStats = (items: Item[]) => {
    return items.reduce((total, item) => {
      Object.entries(item.stats).forEach(([stat, value]) => {
        total[stat] = (total[stat] || 0) + (value || 0);
      });
      return total;
    }, {} as Record<string, number>);
  };

  const getEquippedItems = (): Item[] => {
    return character.equippedItems
      .map(equipped => getItemById(equipped.itemId))
      .filter(Boolean) as Item[];
  };

  const previewCharacter = hoveredItem ? {
    ...character,
    equippedItems: [
      ...character.equippedItems.filter(item => item.slot !== hoveredItem.slot),
      {
        id: `preview-${hoveredItem.id}`,
        itemId: hoveredItem.id,
        slot: hoveredItem.slot,
        equippedAt: new Date()
      }
    ]
  } : character;

  const totalStats = calculateTotalStats(getEquippedItems());

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Equipment System</h2>
          <p className="text-slate-400 mt-1">
            Equip items to boost your character's stats and abilities
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Preview */}
        <div className="lg:col-span-1">
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Character</h3>
            
            {/* Character Avatar */}
            <div className="flex justify-center mb-6">
              <CharacterAvatar
                character={previewCharacter}
                size="xl"
                showLevel={true}
                showEquipment={true}
              />
            </div>

            {/* Equipment Slots */}
            <div className="space-y-3">
              {Object.entries(slotNames).map(([slot, name]) => {
                const equippedItem = getEquippedItem(slot);
                const item = equippedItem ? getItemById(equippedItem.itemId) : null;
                const isSelected = selectedSlot === slot;

                return (
                  <div
                    key={slot}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedSlot(slot as any)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                        {item ? (
                          <span className="text-lg">{item.icon}</span>
                        ) : (
                          <span className="text-slate-400">+</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{name}</div>
                        <div className="text-sm text-slate-400">
                          {item ? item.name : 'No item equipped'}
                        </div>
                      </div>
                      {item && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnequip(slot);
                          }}
                          disabled={isLoading}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Stats */}
            <div className="mt-6 pt-4 border-t border-slate-600">
              <h4 className="text-white font-medium mb-3">Equipment Bonuses</h4>
              {Object.keys(totalStats).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(totalStats).map(([stat, value]) => (
                    <div key={stat} className="text-sm">
                      <span className="text-slate-400 capitalize">{stat}:</span>
                      <span className="text-green-400 ml-1">+{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No equipment bonuses</p>
              )}
            </div>
          </div>
        </div>

        {/* Item Selection */}
        <div className="lg:col-span-2">
          <div className="bg-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedSlot ? `${slotNames[selectedSlot]} Items` : 'Select a slot to view items'}
              </h3>
              {selectedSlot && (
                <div className="text-sm text-slate-400">
                  {getSlotItems(selectedSlot).length} items available
                </div>
              )}
            </div>

            {selectedSlot ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {getSlotItems(selectedSlot).map(item => {
                  const isEquipped = character.equippedItems.some(
                    equipped => equipped.itemId === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                        rarityBorders[item.rarity]
                      } ${isEquipped ? 'bg-green-500/10' : 'bg-slate-600'}`}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => !isEquipped && onEquip(item.id, selectedSlot)}
                    >
                      {/* Item Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rarityColors[item.rarity]} flex items-center justify-center text-lg`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.name}</div>
                          <div className={`text-sm capitalize ${
                            item.rarity === 'legendary' ? 'text-yellow-400' :
                            item.rarity === 'epic' ? 'text-purple-400' :
                            item.rarity === 'rare' ? 'text-blue-400' :
                            item.rarity === 'uncommon' ? 'text-green-400' :
                            'text-gray-400'
                          }`}>
                            {item.rarity}
                          </div>
                        </div>
                        {isEquipped && (
                          <div className="text-green-400 text-sm font-medium">
                            Equipped
                          </div>
                        )}
                      </div>

                      {/* Item Description */}
                      <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Item Stats */}
                      {Object.keys(item.stats).length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-slate-400 mb-1">Stats:</div>
                          <div className="grid grid-cols-2 gap-1">
                            {Object.entries(item.stats).map(([stat, value]) => (
                              <div key={stat} className="text-xs">
                                <span className="text-slate-400 capitalize">{stat}:</span>
                                <span className="text-green-400 ml-1">+{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unlock Requirement */}
                      <div className="text-xs text-slate-500">
                        {item.unlockRequirement}
                      </div>
                    </div>
                  );
                })}

                {getSlotItems(selectedSlot).length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-slate-400">No items available for this slot</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Complete learning activities to unlock equipment!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⚔️</div>
                <p className="text-slate-400 mb-2">Select an equipment slot to view available items</p>
                <p className="text-slate-500 text-sm">
                  Click on Head, Body, Weapon, or Accessory slots to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}