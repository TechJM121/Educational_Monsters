import React, { useState } from 'react';
import { CharacterAvatar } from './CharacterAvatar';
import type { Character, Specialization } from '../../types/character';

interface SpecializationSelectorProps {
  character: Character;
  onSelect: (specialization: Specialization) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const specializationData: Record<Specialization, {
  name: string;
  icon: string;
  description: string;
  primaryStat: string;
  secondaryStat: string;
  bonuses: string[];
  unlockRequirement: string;
  color: string;
}> = {
  scholar: {
    name: 'Scholar',
    icon: '📚',
    description: 'Masters of knowledge and learning, scholars excel at academic pursuits and unlock advanced educational content.',
    primaryStat: 'Intelligence',
    secondaryStat: 'Wisdom',
    bonuses: [
      '+25% XP from math and science activities',
      'Unlock advanced problem-solving hints',
      'Access to exclusive scholarly content',
      '+15% bonus to Intelligence and Wisdom stats'
    ],
    unlockRequirement: 'Reach level 10 with Intelligence ≥ 25',
    color: 'from-blue-600 to-blue-400'
  },
  explorer: {
    name: 'Explorer',
    icon: '🗺️',
    description: 'Adventurous learners who discover new worlds and excel at hands-on activities and exploration.',
    primaryStat: 'Dexterity',
    secondaryStat: 'Vitality',
    bonuses: [
      '+20% XP from all world exploration activities',
      'Unlock hidden areas in learning worlds',
      'Faster movement between learning activities',
      '+15% bonus to Dexterity and Vitality stats'
    ],
    unlockRequirement: 'Reach level 10 with Dexterity ≥ 25',
    color: 'from-green-600 to-green-400'
  },
  guardian: {
    name: 'Guardian',
    icon: '🛡️',
    description: 'Protective and resilient learners who help others and excel at collaborative learning activities.',
    primaryStat: 'Vitality',
    secondaryStat: 'Charisma',
    bonuses: [
      '+30% XP from helping other students',
      'Unlock special group challenge bonuses',
      'Extended study session duration',
      '+15% bonus to Vitality and Charisma stats'
    ],
    unlockRequirement: 'Reach level 10 with Vitality ≥ 25',
    color: 'from-red-600 to-red-400'
  },
  artist: {
    name: 'Artist',
    icon: '🎨',
    description: 'Creative souls who express learning through art and unlock unique customization options.',
    primaryStat: 'Creativity',
    secondaryStat: 'Charisma',
    bonuses: [
      '+25% XP from creative and art-based activities',
      'Unlock exclusive avatar customizations',
      'Access to artistic learning paths',
      '+15% bonus to Creativity and Charisma stats'
    ],
    unlockRequirement: 'Reach level 10 with Creativity ≥ 25',
    color: 'from-pink-600 to-pink-400'
  },
  diplomat: {
    name: 'Diplomat',
    icon: '🤝',
    description: 'Social learners who excel at communication, trading, and collaborative problem-solving.',
    primaryStat: 'Charisma',
    secondaryStat: 'Wisdom',
    bonuses: [
      '+30% success rate in trading activities',
      'Unlock advanced social features',
      '+20% XP from group learning activities',
      '+15% bonus to Charisma and Wisdom stats'
    ],
    unlockRequirement: 'Reach level 10 with Charisma ≥ 25',
    color: 'from-yellow-600 to-yellow-400'
  },
  inventor: {
    name: 'Inventor',
    icon: '⚙️',
    description: 'Innovative thinkers who excel at STEM subjects and unlock experimental learning features.',
    primaryStat: 'Intelligence',
    secondaryStat: 'Dexterity',
    bonuses: [
      '+25% XP from science and engineering activities',
      'Unlock experimental learning features',
      'Access to advanced STEM content',
      '+15% bonus to Intelligence and Dexterity stats'
    ],
    unlockRequirement: 'Reach level 10 with Intelligence ≥ 25 and Dexterity ≥ 20',
    color: 'from-purple-600 to-purple-400'
  }
};

export function SpecializationSelector({
  character,
  onSelect,
  onCancel,
  isLoading = false
}: SpecializationSelectorProps) {
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(
    character.specialization || null
  );

  const handleSelect = async () => {
    if (!selectedSpecialization) return;
    
    try {
      await onSelect(selectedSpecialization);
    } catch (error) {
      console.error('Failed to select specialization:', error);
    }
  };

  const isSpecializationUnlocked = (spec: Specialization): boolean => {
    const _data = specializationData[spec];
    const stats = character.stats;
    
    // Basic level requirement
    if (character.level < 10) return false;
    
    // Stat requirements based on specialization
    switch (spec) {
      case 'scholar':
        return stats.intelligence >= 25;
      case 'explorer':
        return stats.dexterity >= 25;
      case 'guardian':
        return stats.vitality >= 25;
      case 'artist':
        return stats.creativity >= 25;
      case 'diplomat':
        return stats.charisma >= 25;
      case 'inventor':
        return stats.intelligence >= 25 && stats.dexterity >= 20;
      default:
        return false;
    }
  };

  const previewCharacter: Character = selectedSpecialization ? {
    ...character,
    specialization: selectedSpecialization
  } : character;

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Choose Your Specialization</h2>
          <p className="text-slate-400 mt-1">
            Specializations provide unique bonuses and unlock special abilities
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedSpecialization || isLoading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {character.specialization ? 'Change Specialization' : 'Select Specialization'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Character Preview */}
        <div className="lg:col-span-1">
          <div className="bg-slate-700 rounded-lg p-6 text-center sticky top-6">
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
              {selectedSpecialization && (
                <div className="mt-3 p-3 bg-slate-600 rounded-lg">
                  <p className="text-sm font-medium text-purple-400">
                    {specializationData[selectedSpecialization].name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    +{specializationData[selectedSpecialization].primaryStat} & {specializationData[selectedSpecialization].secondaryStat}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specialization Options */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(specializationData).map(([key, data]) => {
              const spec = key as Specialization;
              const isUnlocked = isSpecializationUnlocked(spec);
              const isSelected = selectedSpecialization === spec;
              const isCurrent = character.specialization === spec;

              return (
                <div
                  key={key}
                  className={`relative bg-slate-700 rounded-lg p-6 border-2 transition-all cursor-pointer hover:scale-[1.02] ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/10'
                      : isUnlocked
                      ? 'border-slate-600 hover:border-slate-500'
                      : 'border-slate-700 opacity-60'
                  } ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
                  onClick={() => isUnlocked && setSelectedSpecialization(spec)}
                >
                  {/* Lock Overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-800/80 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <div className="text-sm text-slate-400 font-medium">Locked</div>
                      </div>
                    </div>
                  )}

                  {/* Current Badge */}
                  {isCurrent && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Current
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${data.color} flex items-center justify-center text-2xl`}>
                      {data.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{data.name}</h3>
                      <p className="text-sm text-slate-400">
                        {data.primaryStat} + {data.secondaryStat}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    {data.description}
                  </p>

                  {/* Bonuses */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Bonuses:</h4>
                    <ul className="space-y-1">
                      {data.bonuses.map((bonus, index) => (
                        <li key={index} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          <span>{bonus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Unlock Requirement */}
                  <div className="border-t border-slate-600 pt-3">
                    <p className="text-xs text-slate-500">
                      <span className="font-medium">Requirement:</span> {data.unlockRequirement}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-slate-700 border border-slate-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-white font-medium mb-1">About Specializations</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Specializations are unlocked at level 10 when you meet the stat requirements. 
                  Each specialization provides permanent bonuses to your character and unlocks unique features. 
                  You can change your specialization later, but it will cost respec tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}