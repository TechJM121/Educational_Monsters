import React, { useState } from 'react';
import { Tooltip } from '../shared/Tooltip';
import type { CharacterStats } from '../../types/character';

interface StatAllocationProps {
  currentStats: CharacterStats;
  onAllocate: (allocations: Partial<Omit<CharacterStats, 'availablePoints'>>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const statInfo = {
  intelligence: {
    name: 'Intelligence',
    icon: '🧠',
    color: 'from-blue-500 to-blue-400',
    description: 'Increases XP from math and logic problems. Unlocks advanced problem-solving hints.',
    benefits: ['Math XP +20%', 'Logic puzzle hints', 'Advanced content access'],
  },
  vitality: {
    name: 'Vitality',
    icon: '❤️',
    color: 'from-red-500 to-red-400',
    description: 'Allows longer study sessions without fatigue. Faster recovery between activities.',
    benefits: ['Study session +25%', 'Faster recovery', 'Reduced fatigue'],
  },
  wisdom: {
    name: 'Wisdom',
    icon: '📜',
    color: 'from-purple-500 to-purple-400',
    description: 'Unlocks historical context and deeper learning insights. Provides learning bonuses.',
    benefits: ['Historical context', 'Learning insights', 'Bonus XP +15%'],
  },
  charisma: {
    name: 'Charisma',
    icon: '💬',
    color: 'from-yellow-500 to-yellow-400',
    description: 'Improves social interactions and trading success. Increases group challenge bonuses.',
    benefits: ['Trading success +30%', 'Social bonuses', 'Group XP +20%'],
  },
  dexterity: {
    name: 'Dexterity',
    icon: '⚡',
    color: 'from-green-500 to-green-400',
    description: 'Reduces time penalties and increases accuracy in timed activities.',
    benefits: ['Time bonus +25%', 'Accuracy +15%', 'Speed bonuses'],
  },
  creativity: {
    name: 'Creativity',
    icon: '🎨',
    color: 'from-pink-500 to-pink-400',
    description: 'Unlocks artistic customizations and alternative solution paths in problems.',
    benefits: ['Art customizations', 'Alternative solutions', 'Creative XP +20%'],
  },
};

export function StatAllocation({
  currentStats,
  onAllocate,
  onCancel,
  isLoading = false
}: StatAllocationProps) {
  const [allocations, setAllocations] = useState<Partial<Omit<CharacterStats, 'availablePoints'>>>({});
  const [remainingPoints, setRemainingPoints] = useState(currentStats.availablePoints);

  const handleStatChange = (stat: keyof Omit<CharacterStats, 'availablePoints'>, change: number) => {
    const currentAllocation = allocations[stat] || 0;
    const newAllocation = Math.max(0, currentAllocation + change);
    const allocationDiff = newAllocation - currentAllocation;
    
    // Check if we have enough points
    if (allocationDiff > remainingPoints) return;
    
    setAllocations(prev => ({
      ...prev,
      [stat]: newAllocation
    }));
    
    setRemainingPoints(prev => prev - allocationDiff);
  };

  const handleReset = () => {
    setAllocations({});
    setRemainingPoints(currentStats.availablePoints);
  };

  const handleAllocate = async () => {
    try {
      await onAllocate(allocations);
    } catch (error) {
      console.error('Failed to allocate stat points:', error);
    }
  };

  const getTotalAllocated = () => {
    return Object.values(allocations).reduce((sum, points) => sum + (points || 0), 0);
  };

  const getNewStatValue = (stat: keyof Omit<CharacterStats, 'availablePoints'>) => {
    return (currentStats[stat] as number) + (allocations[stat] || 0);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Allocate Stat Points</h2>
          <p className="text-slate-400 mt-1">
            Distribute your {currentStats.availablePoints} available points to improve your character
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">
            {remainingPoints}
          </div>
          <div className="text-sm text-slate-400">Points Left</div>
        </div>
      </div>

      {remainingPoints === 0 && getTotalAllocated() === 0 && (
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="text-white font-medium">No points to allocate</p>
              <p className="text-slate-400 text-sm">
                Level up your character to earn more stat points!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {Object.entries(statInfo).map(([key, info]) => {
          const statKey = key as keyof Omit<CharacterStats, 'availablePoints'>;
          const currentValue = currentStats[statKey] as number;
          const allocation = allocations[statKey] || 0;
          const newValue = getNewStatValue(statKey);

          return (
            <div key={key} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold">{info.name}</h3>
                    <p className="text-slate-400 text-sm">{info.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {currentValue}
                    {allocation > 0 && (
                      <span className="text-green-400 ml-1">+{allocation}</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    → {newValue}
                  </div>
                </div>
              </div>

              {/* Stat Benefits */}
              <div className="mb-3">
                <Tooltip
                  content={
                    <div className="max-w-xs">
                      <div className="font-semibold mb-2">Benefits:</div>
                      <ul className="text-sm space-y-1">
                        {info.benefits.map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  }
                >
                  <div className="text-xs text-slate-500 hover:text-slate-400 cursor-help">
                    Hover for benefits
                  </div>
                </Tooltip>
              </div>

              {/* Allocation Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatChange(statKey, -1)}
                    disabled={allocation === 0 || isLoading}
                    className="w-8 h-8 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-white font-medium">
                    {allocation}
                  </span>
                  <button
                    onClick={() => handleStatChange(statKey, 1)}
                    disabled={remainingPoints === 0 || isLoading}
                    className="w-8 h-8 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Quick Allocation Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStatChange(statKey, Math.min(5, remainingPoints))}
                    disabled={remainingPoints === 0 || isLoading}
                    className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded transition-colors"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => handleStatChange(statKey, remainingPoints)}
                    disabled={remainingPoints === 0 || isLoading}
                    className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${info.color} transition-all duration-300`}
                    style={{ width: `${Math.min((newValue / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          disabled={getTotalAllocated() === 0 || isLoading}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          Reset
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAllocate}
            disabled={getTotalAllocated() === 0 || isLoading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Allocate Points ({getTotalAllocated()})
          </button>
        </div>
      </div>
    </div>
  );
}