import React, { useState } from 'react';
import { CharacterCustomization } from './CharacterCustomization';
import { StatAllocation } from './StatAllocation';
import { SpecializationSelector } from './SpecializationSelector';
import { EquipmentSystem } from './EquipmentSystem';
import { RespecSystem } from './RespecSystem';
import { StatChangeAnimation } from './StatChangeAnimation';
import { EquipmentChangeAnimation } from './EquipmentChangeAnimation';
import type { Character, AvatarConfig, Specialization, CharacterStats } from '../../types/character';

interface StatChange {
  stat: string;
  oldValue: number;
  newValue: number;
  icon: string;
}

interface EquipmentChange {
  type: 'equipped' | 'unequipped';
  itemName: string;
  itemIcon: string;
  slot: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface CharacterCustomizationModalProps {
  character: Character;
  availableItems?: any[]; // TODO: Define proper Item type
  respecTokens?: number;
  onUpdateAvatar: (avatarConfig: AvatarConfig) => Promise<void>;
  onAllocateStats: (allocations: Partial<Omit<CharacterStats, 'availablePoints'>>) => Promise<void>;
  onSelectSpecialization: (specialization: Specialization) => Promise<void>;
  onEquipItem: (itemId: string, slot: string) => Promise<void>;
  onUnequipItem: (slot: string) => Promise<void>;
  onRespec: (newStats: Partial<Omit<CharacterStats, 'availablePoints'>>) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

type CustomizationTab = 'appearance' | 'stats' | 'specialization' | 'equipment' | 'respec';

export function CharacterCustomizationModal({
  character,
  availableItems = [],
  respecTokens = 0,
  onUpdateAvatar,
  onAllocateStats,
  onSelectSpecialization,
  onEquipItem,
  onUnequipItem,
  onRespec,
  onClose,
  isLoading = false
}: CharacterCustomizationModalProps) {
  const [activeTab, setActiveTab] = useState<CustomizationTab>('appearance');
  const [statChanges, setStatChanges] = useState<StatChange[] | null>(null);
  const [equipmentChange, setEquipmentChange] = useState<EquipmentChange | null>(null);

  const handleStatChange = (changes: StatChange[]) => {
    setStatChanges(changes);
  };

  const handleEquipmentChange = (change: EquipmentChange) => {
    setEquipmentChange(change);
  };

  const clearStatChanges = () => {
    setStatChanges(null);
  };

  const clearEquipmentChange = () => {
    setEquipmentChange(null);
  };

  const tabs = [
    {
      id: 'appearance' as const,
      name: 'Appearance',
      icon: '🎨',
      description: 'Customize your character\'s look',
      available: true
    },
    {
      id: 'stats' as const,
      name: 'Stats',
      icon: '📊',
      description: 'Allocate stat points',
      available: character.stats.availablePoints > 0,
      badge: character.stats.availablePoints > 0 ? character.stats.availablePoints : undefined
    },
    {
      id: 'specialization' as const,
      name: 'Specialization',
      icon: '⭐',
      description: 'Choose your character path',
      available: character.level >= 10
    },
    {
      id: 'equipment' as const,
      name: 'Equipment',
      icon: '⚔️',
      description: 'Manage your gear',
      available: true
    },
    {
      id: 'respec' as const,
      name: 'Respec',
      icon: '🔄',
      description: 'Reset and redistribute stats',
      available: respecTokens > 0,
      badge: respecTokens > 0 ? respecTokens : undefined
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <CharacterCustomization
            character={character}
            onSave={onUpdateAvatar}
            onCancel={onClose}
            isLoading={isLoading}
          />
        );
      
      case 'stats':
        return (
          <StatAllocation
            currentStats={character.stats}
            onAllocate={(allocations) => {
              // Create stat change data for animation
              const statIcons = {
                intelligence: '🧠',
                vitality: '❤️',
                wisdom: '📜',
                charisma: '💬',
                dexterity: '⚡',
                creativity: '🎨'
              };

              const changes: StatChange[] = Object.entries(allocations)
                .filter(([, points]) => points && points > 0)
                .map(([stat, points]) => ({
                  stat,
                  oldValue: character.stats[stat as keyof Omit<CharacterStats, 'availablePoints'>] as number,
                  newValue: (character.stats[stat as keyof Omit<CharacterStats, 'availablePoints'>] as number) + (points || 0),
                  icon: statIcons[stat as keyof typeof statIcons]
                }));

              if (changes.length > 0) {
                handleStatChange(changes);
              }

              return onAllocateStats(allocations);
            }}
            onCancel={onClose}
            isLoading={isLoading}
          />
        );
      
      case 'specialization':
        return (
          <SpecializationSelector
            character={character}
            onSelect={onSelectSpecialization}
            onCancel={onClose}
            isLoading={isLoading}
          />
        );
      
      case 'equipment':
        return (
          <EquipmentSystem
            character={character}
            availableItems={availableItems}
            onEquip={(itemId, slot) => {
              // Find item details for animation
              const item = availableItems.find(i => i.id === itemId);
              if (item) {
                handleEquipmentChange({
                  type: 'equipped',
                  itemName: item.name,
                  itemIcon: item.icon,
                  slot,
                  rarity: item.rarity
                });
              }
              return onEquipItem(itemId, slot);
            }}
            onUnequip={(slot) => {
              // Find currently equipped item for animation
              const equippedItem = character.equippedItems.find(item => item.slot === slot);
              if (equippedItem) {
                const item = availableItems.find(i => i.id === equippedItem.itemId);
                if (item) {
                  handleEquipmentChange({
                    type: 'unequipped',
                    itemName: item.name,
                    itemIcon: item.icon,
                    slot,
                    rarity: item.rarity
                  });
                }
              }
              return onUnequipItem(slot);
            }}
            onClose={onClose}
            isLoading={isLoading}
          />
        );
      
      case 'respec':
        return (
          <RespecSystem
            character={character}
            respecTokens={respecTokens}
            onRespec={onRespec}
            onCancel={onClose}
            isLoading={isLoading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header with Tabs */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Character Customization</h1>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!tab.available}
                className={`relative px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : tab.available
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline font-medium">{tab.name}</span>
                
                {/* Badge for available actions */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
                
                {/* Lock indicator */}
                {!tab.available && (
                  <span className="text-xs">🔒</span>
                )}
              </button>
            ))}
          </div>
          
          {/* Tab Description */}
          <div className="mt-3">
            <p className="text-slate-400 text-sm">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderTabContent()}
        </div>

        {/* Visual Feedback Animations */}
        {statChanges && (
          <StatChangeAnimation
            changes={statChanges}
            onComplete={clearStatChanges}
          />
        )}

        {equipmentChange && (
          <EquipmentChangeAnimation
            change={equipmentChange}
            onComplete={clearEquipmentChange}
          />
        )}
      </div>
    </div>
  );
}