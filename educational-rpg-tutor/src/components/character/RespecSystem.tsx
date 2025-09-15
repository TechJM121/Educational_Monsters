import React, { useState } from 'react';
import { StatAllocation } from './StatAllocation';
import { Tooltip } from '../shared/Tooltip';
import type { Character, CharacterStats } from '../../types/character';

interface RespecSystemProps {
  character: Character;
  respecTokens: number;
  onRespec: (newStats: Partial<Omit<CharacterStats, 'availablePoints'>>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const RESPEC_COST = 1; // Cost in respec tokens
const BASE_STAT_VALUE = 10; // Starting value for all stats

export function RespecSystem({
  character,
  respecTokens,
  onRespec,
  onCancel,
  isLoading = false
}: RespecSystemProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showStatAllocation, setShowStatAllocation] = useState(false);
  const [, setNewStatDistribution] = useState<Partial<Omit<CharacterStats, 'availablePoints'>> | null>(null);

  // Calculate total stat points invested (excluding base values)
  const getTotalInvestedPoints = (): number => {
    const stats = character.stats;
    return (
      (stats.intelligence - BASE_STAT_VALUE) +
      (stats.vitality - BASE_STAT_VALUE) +
      (stats.wisdom - BASE_STAT_VALUE) +
      (stats.charisma - BASE_STAT_VALUE) +
      (stats.dexterity - BASE_STAT_VALUE) +
      (stats.creativity - BASE_STAT_VALUE)
    );
  };

  const handleStartRespec = () => {
    if (respecTokens < RESPEC_COST) return;
    setShowConfirmation(true);
  };

  const handleConfirmRespec = () => {
    setShowConfirmation(false);
    setShowStatAllocation(true);
  };

  const handleStatAllocation = async (allocations: Partial<Omit<CharacterStats, 'availablePoints'>>) => {
    setNewStatDistribution(allocations);
    
    // Calculate new stat values
    const newStats: Partial<Omit<CharacterStats, 'availablePoints'>> = {
      intelligence: BASE_STAT_VALUE + (allocations.intelligence || 0),
      vitality: BASE_STAT_VALUE + (allocations.vitality || 0),
      wisdom: BASE_STAT_VALUE + (allocations.wisdom || 0),
      charisma: BASE_STAT_VALUE + (allocations.charisma || 0),
      dexterity: BASE_STAT_VALUE + (allocations.dexterity || 0),
      creativity: BASE_STAT_VALUE + (allocations.creativity || 0),
    };

    try {
      await onRespec(newStats);
    } catch (error) {
      console.error('Failed to respec character:', error);
    }
  };

  // Create a temporary character with reset stats for the allocation interface
  const respecCharacter: Character = {
    ...character,
    stats: {
      intelligence: BASE_STAT_VALUE,
      vitality: BASE_STAT_VALUE,
      wisdom: BASE_STAT_VALUE,
      charisma: BASE_STAT_VALUE,
      dexterity: BASE_STAT_VALUE,
      creativity: BASE_STAT_VALUE,
      availablePoints: getTotalInvestedPoints()
    }
  };

  if (showStatAllocation) {
    return (
      <StatAllocation
        currentStats={respecCharacter.stats}
        onAllocate={handleStatAllocation}
        onCancel={() => setShowStatAllocation(false)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Respec Character</h2>
          <p className="text-slate-400 mt-1">
            Reset and redistribute your character's stat points
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Current Stats Overview */}
      <div className="bg-slate-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(character.stats).map(([stat, value]) => {
            if (stat === 'availablePoints') return null;
            
            const invested = (value as number) - BASE_STAT_VALUE;
            
            return (
              <div key={stat} className="text-center">
                <div className="text-2xl font-bold text-white">{value as number}</div>
                <div className="text-sm text-slate-400 capitalize">{stat}</div>
                {invested > 0 && (
                  <div className="text-xs text-green-400">+{invested} invested</div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Points Invested:</span>
            <span className="text-yellow-400 font-bold">{getTotalInvestedPoints()}</span>
          </div>
        </div>
      </div>

      {/* Respec Information */}
      <div className="bg-slate-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Respec Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Respec Cost:</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎫</span>
              <span className="text-white font-bold">{RESPEC_COST} Token</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Available Tokens:</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎫</span>
              <span className={`font-bold ${respecTokens >= RESPEC_COST ? 'text-green-400' : 'text-red-400'}`}>
                {respecTokens}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Points to Redistribute:</span>
            <span className="text-yellow-400 font-bold">{getTotalInvestedPoints()}</span>
          </div>
        </div>
      </div>

      {/* Respec Effects */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="text-blue-400 font-medium mb-2">What happens during respec:</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• All stats reset to base value ({BASE_STAT_VALUE})</li>
              <li>• You get {getTotalInvestedPoints()} points to redistribute</li>
              <li>• Specialization bonuses remain active</li>
              <li>• Equipment bonuses are unaffected</li>
              <li>• Process costs {RESPEC_COST} respec token</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How to Earn Tokens */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="text-yellow-400 font-medium mb-2">How to earn respec tokens:</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Complete special milestone achievements</li>
              <li>• Participate in seasonal events</li>
              <li>• Reach certain level milestones</li>
              <li>• Complete challenging learning quests</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        {respecTokens >= RESPEC_COST ? (
          <button
            onClick={handleStartRespec}
            disabled={isLoading}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Start Respec Process
          </button>
        ) : (
          <Tooltip content="You need at least 1 respec token to reset your stats">
            <button
              disabled
              className="px-8 py-3 bg-slate-600 opacity-50 text-white rounded-lg cursor-not-allowed font-medium"
            >
              Insufficient Tokens
            </button>
          </Tooltip>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Respec</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to reset your character's stats? This will cost {RESPEC_COST} respec token 
              and reset all your stats to {BASE_STAT_VALUE}, giving you {getTotalInvestedPoints()} points to redistribute.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRespec}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                Confirm Respec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}