import React from 'react';
import { ProgressBar } from '../shared/ProgressBar';
import { Tooltip } from '../shared/Tooltip';
import type { CharacterStats as CharacterStatsType } from '../../types/character';

interface CharacterStatsProps {
  stats: CharacterStatsType;
  effectiveStats?: CharacterStatsType;
  showAvailablePoints?: boolean;
  compact?: boolean;
  className?: string;
}

const statInfo = {
  intelligence: {
    name: 'Intelligence',
    icon: '🧠',
    color: 'primary' as const,
    description: 'Increases XP from math and logic problems. Unlocks advanced problem-solving hints.',
  },
  vitality: {
    name: 'Vitality',
    icon: '❤️',
    color: 'danger' as const,
    description: 'Allows longer study sessions without fatigue. Faster recovery between activities.',
  },
  wisdom: {
    name: 'Wisdom',
    icon: '📜',
    color: 'secondary' as const,
    description: 'Unlocks historical context and deeper learning insights. Provides learning bonuses.',
  },
  charisma: {
    name: 'Charisma',
    icon: '💬',
    color: 'warning' as const,
    description: 'Improves social interactions and trading success. Increases group challenge bonuses.',
  },
  dexterity: {
    name: 'Dexterity',
    icon: '⚡',
    color: 'success' as const,
    description: 'Reduces time penalties and increases accuracy in timed activities.',
  },
  creativity: {
    name: 'Creativity',
    icon: '🎨',
    color: 'secondary' as const,
    description: 'Unlocks artistic customizations and alternative solution paths in problems.',
  },
};

export function CharacterStats({
  stats,
  effectiveStats,
  showAvailablePoints = true,
  compact = false,
  className = ''
}: CharacterStatsProps) {
  const maxStatValue = 100; // Assuming max stat value for progress bars

  if (compact) {
    return (
      <div className={`grid grid-cols-3 gap-2 ${className}`}>
        {Object.entries(statInfo).map(([key, info]) => {
          const statKey = key as keyof CharacterStatsType;
          const baseValue = stats[statKey] as number;
          const effectiveValue = effectiveStats?.[statKey] as number || baseValue;
          const hasBonus = effectiveValue > baseValue;

          return (
            <Tooltip
              key={key}
              content={
                <div>
                  <div className="font-semibold">{info.name}</div>
                  <div className="text-xs mt-1">{info.description}</div>
                  {hasBonus && (
                    <div className="text-green-400 text-xs mt-1">
                      +{effectiveValue - baseValue} from specialization
                    </div>
                  )}
                </div>
              }
            >
              <div className="text-center">
                <div className="text-lg mb-1">{info.icon}</div>
                <div className="text-sm font-medium text-slate-300">
                  {hasBonus ? (
                    <span>
                      {baseValue}
                      <span className="text-green-400">+{effectiveValue - baseValue}</span>
                    </span>
                  ) : (
                    baseValue
                  )}
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showAvailablePoints && stats.availablePoints > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-lg">⭐</span>
            <span className="text-yellow-400 font-medium">
              {stats.availablePoints} stat points available to allocate!
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(statInfo).map(([key, info]) => {
          const statKey = key as keyof CharacterStatsType;
          const baseValue = stats[statKey] as number;
          const effectiveValue = effectiveStats?.[statKey] as number || baseValue;
          const hasBonus = effectiveValue > baseValue;

          return (
            <div key={key} className="flex items-center gap-3">
              <Tooltip content={info.description}>
                <div className="flex items-center gap-2 min-w-[120px]">
                  <span className="text-lg">{info.icon}</span>
                  <span className="text-sm font-medium text-slate-300">
                    {info.name}
                  </span>
                </div>
              </Tooltip>

              <div className="flex-1">
                <ProgressBar
                  current={effectiveValue}
                  max={maxStatValue}
                  color={info.color}
                  size="sm"
                  showText={false}
                />
              </div>

              <div className="min-w-[60px] text-right">
                <span className="text-sm font-medium text-slate-300">
                  {hasBonus ? (
                    <span>
                      {baseValue}
                      <span className="text-green-400 ml-1">+{effectiveValue - baseValue}</span>
                    </span>
                  ) : (
                    baseValue
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}