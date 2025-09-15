import React from 'react';
import { ProgressBar } from '../shared/ProgressBar';
import { Tooltip } from '../shared/Tooltip';
import type { Quest, UserQuest } from '../../types/quest';

interface QuestTrackerProps {
  quests: Array<{
    quest: Quest;
    userQuest: UserQuest;
  }>;
  maxDisplay?: number;
  showCompleted?: boolean;
  className?: string;
}

const questTypeIcons = {
  daily: '📅',
  weekly: '📆',
};

const questCategoryColors = {
  learning: 'border-blue-400 bg-blue-50',
  social: 'border-green-400 bg-green-50',
  achievement: 'border-purple-400 bg-purple-50',
};

export function QuestTracker({
  quests,
  maxDisplay = 5,
  showCompleted = false,
  className = ''
}: QuestTrackerProps) {
  const filteredQuests = quests
    .filter(({ userQuest }) => showCompleted || !userQuest.completed)
    .slice(0, maxDisplay);

  if (filteredQuests.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-2">🎯</div>
        <div className="text-slate-400">No active quests</div>
        <div className="text-sm text-slate-500 mt-1">
          New quests will appear here daily!
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {filteredQuests.map(({ quest, userQuest }) => {
        const completedObjectives = userQuest.progress.filter(obj => obj.completed).length;
        const totalObjectives = quest.objectives.length;
        const _overallProgress = (completedObjectives / totalObjectives) * 100;

        return (
          <div
            key={quest.id}
            className={`
              ${questCategoryColors[quest.category]}
              border rounded-lg p-4 transition-all duration-200 hover:shadow-md
              ${userQuest.completed ? 'opacity-75' : ''}
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {questTypeIcons[quest.type]}
                </span>
                <div>
                  <h4 className="font-medium text-slate-800">
                    {quest.title}
                    {userQuest.completed && (
                      <span className="ml-2 text-green-600 text-sm">✓ Complete</span>
                    )}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {quest.description}
                  </p>
                </div>
              </div>

              <Tooltip
                content={`${quest.type.charAt(0).toUpperCase() + quest.type.slice(1)} ${quest.category} quest`}
              >
                <div className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">
                  {quest.type}
                </div>
              </Tooltip>
            </div>

            {/* Quest Objectives */}
            <div className="space-y-2 mb-3">
              {userQuest.progress.map((objective) => (
                <div key={objective.id} className="flex items-center gap-2">
                  <div
                    className={`
                      w-4 h-4 rounded border-2 flex items-center justify-center
                      ${objective.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-slate-400'
                      }
                    `}
                  >
                    {objective.completed && <span className="text-xs">✓</span>}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-700">
                      {objective.description}
                    </div>
                    {objective.targetValue > 1 && (
                      <div className="text-xs text-slate-500">
                        {objective.currentValue} / {objective.targetValue}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="mb-3">
              <ProgressBar
                current={completedObjectives}
                max={totalObjectives}
                color="success"
                size="sm"
                label="Progress"
                showText={false}
              />
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {quest.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-1 text-slate-600">
                    <span>
                      {reward.type === 'xp' && '⭐'}
                      {reward.type === 'item' && '🎁'}
                      {reward.type === 'stat_points' && '💪'}
                    </span>
                    <span>{reward.value}</span>
                  </div>
                ))}
              </div>

              <div className="text-slate-500">
                Expires: {new Date(quest.expiresAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}