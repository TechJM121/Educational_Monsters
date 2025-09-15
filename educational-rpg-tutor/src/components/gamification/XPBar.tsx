import React from 'react';
import { ProgressBar } from '../shared/ProgressBar';

interface XPBarProps {
  currentXP: number;
  xpForNextLevel: number;
  level: number;
  totalXP?: number;
  showLevel?: boolean;
  showTotal?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function XPBar({
  currentXP,
  xpForNextLevel,
  level,
  totalXP,
  showLevel = true,
  showTotal = false,
  animated = true,
  size = 'md',
  className = ''
}: XPBarProps) {
  const percentage = Math.min((currentXP / xpForNextLevel) * 100, 100);

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {showLevel && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-lg">⭐</span>
              <span className="font-rpg text-lg text-yellow-400">
                Level {level}
              </span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm text-slate-300">
            {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
          </div>
          {showTotal && totalXP && (
            <div className="text-xs text-slate-400">
              Total: {totalXP.toLocaleString()} XP
            </div>
          )}
        </div>
      </div>

      <ProgressBar
        current={currentXP}
        max={xpForNextLevel}
        color="warning"
        size={size}
        showText={false}
        animated={animated}
      />

      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-slate-400">
          {percentage.toFixed(1)}% to next level
        </span>
        <span className="text-xs text-slate-400">
          {(xpForNextLevel - currentXP).toLocaleString()} XP needed
        </span>
      </div>
    </div>
  );
}