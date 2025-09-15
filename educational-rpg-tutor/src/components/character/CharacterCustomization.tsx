import React, { useState } from 'react';
import { CharacterAvatar } from './CharacterAvatar';
import type { Character, AvatarConfig } from '../../types/character';

interface CharacterCustomizationProps {
  character: Character;
  onSave: (avatarConfig: AvatarConfig) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const customizationOptions = {
  hairStyle: [
    { id: 'short', name: 'Short', preview: '✂️' },
    { id: 'long', name: 'Long', preview: '💇' },
    { id: 'curly', name: 'Curly', preview: '🌀' },
    { id: 'braided', name: 'Braided', preview: '🎀' },
    { id: 'spiky', name: 'Spiky', preview: '⚡' },
  ],
  hairColor: [
    { id: 'brown', name: 'Brown', color: '#8B4513' },
    { id: 'black', name: 'Black', color: '#2C2C2C' },
    { id: 'blonde', name: 'Blonde', color: '#FFD700' },
    { id: 'red', name: 'Red', color: '#CD853F' },
    { id: 'white', name: 'White', color: '#F5F5F5' },
    { id: 'blue', name: 'Blue', color: '#4169E1' },
    { id: 'purple', name: 'Purple', color: '#8A2BE2' },
    { id: 'green', name: 'Green', color: '#228B22' },
  ],
  skinTone: [
    { id: 'pale', name: 'Pale', color: '#F7E7CE' },
    { id: 'light', name: 'Light', color: '#FDBCB4' },
    { id: 'medium', name: 'Medium', color: '#E0AC69' },
    { id: 'dark', name: 'Dark', color: '#C68642' },
    { id: 'deep', name: 'Deep', color: '#8B4513' },
  ],
  eyeColor: [
    { id: 'brown', name: 'Brown', color: '#8B4513' },
    { id: 'blue', name: 'Blue', color: '#4169E1' },
    { id: 'green', name: 'Green', color: '#228B22' },
    { id: 'hazel', name: 'Hazel', color: '#DAA520' },
    { id: 'gray', name: 'Gray', color: '#708090' },
    { id: 'violet', name: 'Violet', color: '#8A2BE2' },
  ],
  outfit: [
    { id: 'casual', name: 'Casual', preview: '👕' },
    { id: 'formal', name: 'Formal', preview: '👔' },
    { id: 'adventurer', name: 'Adventurer', preview: '🧥' },
    { id: 'scholar', name: 'Scholar', preview: '🎓' },
    { id: 'artist', name: 'Artist', preview: '🎨' },
    { id: 'explorer', name: 'Explorer', preview: '🗺️' },
  ],
  accessories: [
    { id: 'glasses', name: 'Glasses', preview: '👓' },
    { id: 'hat', name: 'Hat', preview: '🎩' },
    { id: 'necklace', name: 'Necklace', preview: '📿' },
    { id: 'earrings', name: 'Earrings', preview: '💎' },
    { id: 'watch', name: 'Watch', preview: '⌚' },
    { id: 'bracelet', name: 'Bracelet', preview: '📿' },
  ],
};

export function CharacterCustomization({
  character,
  onSave,
  onCancel,
  isLoading = false
}: CharacterCustomizationProps) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(character.avatarConfig);
  const [activeTab, setActiveTab] = useState<keyof typeof customizationOptions>('hairStyle');

  const handleOptionSelect = (category: keyof AvatarConfig, value: string) => {
    if (category === 'accessories') {
      const currentAccessories = avatarConfig.accessories || [];
      const newAccessories = currentAccessories.includes(value)
        ? currentAccessories.filter(acc => acc !== value)
        : [...currentAccessories, value];
      
      setAvatarConfig(prev => ({
        ...prev,
        accessories: newAccessories
      }));
    } else {
      setAvatarConfig(prev => ({
        ...prev,
        [category]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      await onSave(avatarConfig);
    } catch (error) {
      console.error('Failed to save avatar configuration:', error);
    }
  };

  const previewCharacter: Character = {
    ...character,
    avatarConfig
  };

  const tabs = [
    { key: 'hairStyle', label: 'Hair Style', icon: '💇' },
    { key: 'hairColor', label: 'Hair Color', icon: '🎨' },
    { key: 'skinTone', label: 'Skin Tone', icon: '👤' },
    { key: 'eyeColor', label: 'Eye Color', icon: '👁️' },
    { key: 'outfit', label: 'Outfit', icon: '👕' },
    { key: 'accessories', label: 'Accessories', icon: '💎' },
  ] as const;

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Customize Your Character</h2>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Preview */}
        <div className="lg:col-span-1">
          <div className="bg-slate-700 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="flex justify-center mb-4">
              <CharacterAvatar
                character={previewCharacter}
                size="xl"
                showLevel={true}
                showEquipment={true}
              />
            </div>
            <div className="text-slate-300">
              <p className="font-medium">{character.name}</p>
              <p className="text-sm">Level {character.level}</p>
              {character.specialization && (
                <p className="text-sm text-purple-400 capitalize">
                  {character.specialization}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Options Grid */}
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 capitalize">
              {tabs.find(tab => tab.key === activeTab)?.label}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {customizationOptions[activeTab].map(option => {
                const isSelected = activeTab === 'accessories'
                  ? avatarConfig.accessories?.includes(option.id)
                  : avatarConfig[activeTab] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(activeTab, option.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-slate-600 bg-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-center">
                      {'color' in option ? (
                        <div
                          className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-slate-400"
                          style={{ backgroundColor: option.color }}
                        />
                      ) : (
                        <div className="text-2xl mb-2">{option.preview}</div>
                      )}
                      <div className="text-sm text-slate-300 font-medium">
                        {option.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}