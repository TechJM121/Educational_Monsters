import React from 'react';
import type { Character } from '../../types/character';

interface CharacterAvatarProps {
  character: Character;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  showEquipment?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const levelBadgeSize = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg',
};

export function CharacterAvatar({
  character,
  size = 'md',
  showLevel = true,
  showEquipment = true,
  className = ''
}: CharacterAvatarProps) {
  const { avatarConfig, level, equippedItems } = character;

  // Generate avatar style based on configuration
  const avatarStyle = {
    background: `linear-gradient(135deg, ${getHairColor(avatarConfig.hairColor)}, ${getSkinTone(avatarConfig.skinTone)})`,
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Avatar */}
      <div
        className={`${sizeClasses[size]} rounded-full border-4 border-primary-400 shadow-lg relative overflow-hidden`}
        style={avatarStyle}
      >
        {/* Avatar Face */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white font-bold text-2xl">
            {character.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Equipment Overlay */}
        {showEquipment && equippedItems.length > 0 && (
          <div className="absolute inset-0">
            {equippedItems.map((item) => (
              <div
                key={item.id}
                className={`absolute ${getEquipmentPosition(item.slot)}`}
              >
                <div className="w-4 h-4 bg-yellow-400 rounded-full border border-yellow-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Level Badge */}
      {showLevel && (
        <div
          className={`absolute -bottom-1 -right-1 ${levelBadgeSize[size]} bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center font-bold text-slate-900`}
        >
          {level}
        </div>
      )}

      {/* Specialization Indicator */}
      {character.specialization && (
        <div className="absolute -top-1 -left-1 w-6 h-6 bg-purple-500 rounded-full border-2 border-purple-600 flex items-center justify-center">
          <span className="text-xs text-white font-bold">
            {getSpecializationIcon(character.specialization)}
          </span>
        </div>
      )}
    </div>
  );
}

function getHairColor(hairColor: string): string {
  const colors: Record<string, string> = {
    brown: '#8B4513',
    black: '#2C2C2C',
    blonde: '#FFD700',
    red: '#CD853F',
    white: '#F5F5F5',
  };
  return colors[hairColor] || colors.brown;
}

function getSkinTone(skinTone: string): string {
  const tones: Record<string, string> = {
    light: '#FDBCB4',
    medium: '#E0AC69',
    dark: '#C68642',
    pale: '#F7E7CE',
  };
  return tones[skinTone] || tones.medium;
}

function getEquipmentPosition(slot: string): string {
  const positions: Record<string, string> = {
    head: 'top-0 left-1/2 transform -translate-x-1/2',
    body: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    weapon: 'top-1/2 right-0 transform -translate-y-1/2',
    accessory: 'bottom-0 left-0',
  };
  return positions[slot] || positions.accessory;
}

function getSpecializationIcon(specialization: string): string {
  const icons: Record<string, string> = {
    scholar: '📚',
    explorer: '🗺️',
    guardian: '🛡️',
    artist: '🎨',
    diplomat: '🤝',
    inventor: '⚙️',
  };
  return icons[specialization] || '⭐';
}