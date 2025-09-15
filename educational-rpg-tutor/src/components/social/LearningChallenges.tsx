// Learning challenges component for time-limited educational competitions

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LearningChallenge, ChallengeParticipant } from '../../types/social';
import { socialService } from '../../services/socialService';
import { AnimatedButton } from '../shared/AnimatedButton';
import { ProgressBar } from '../shared/ProgressBar';
import { Tooltip } from '../shared/Tooltip';

interface LearningChallengesProps {
  userId: string;
  className?: string;
}

export const LearningChallenges: React.FC<LearningChallengesProps> = ({
  userId,
  className = ''
}) => {
  const [challenges, setChallenges] = useState<LearningChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await socialService.getActiveChallenges();
      setChallenges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      setJoiningChallenge(challengeId);
      await socialService.joinChallenge(challengeId, userId);
      
      // Refresh challenges to update participant count
      await loadChallenges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge');
    } finally {
      setJoiningChallenge(null);
    }
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getSubjectIcon = (subjectId: string) => {
    const icons: Record<string, string> = {
      mathematics: '🔢',
      science: '🔬',
      history: '📜',
      language_arts: '📚',
      art: '🎨',
      biology: '🧬'
    };
    return icons[subjectId] || '📖';
  };

  const getDifficultyColor = (requirements?: LearningChallenge['requirements']) => {
    if (!requirements?.minLevel) return 'text-green-600 bg-green-50 border-green-200';
    if (requirements.minLevel >= 20) return 'text-red-600 bg-red-50 border-red-200';
    if (requirements.minLevel >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getDifficultyLabel = (requirements?: LearningChallenge['requirements']) => {
    if (!requirements?.minLevel) return 'Beginner';
    if (requirements.minLevel >= 20) return 'Expert';
    if (requirements.minLevel >= 10) return 'Intermediate';
    return 'Beginner';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 mb-4">
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">⚔️ Learning Challenges</h3>
            <p className="text-green-100 text-sm">Compete with friends in educational battles!</p>
          </div>
          <button
            onClick={loadChallenges}
            className="p-2 rounded-full bg-green-500 hover:bg-green-400 transition-colors"
            title="Refresh challenges"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadChallenges}
                className="text-sm text-red-600 hover:text-red-800 underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenges List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Challenge Header */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getSubjectIcon(challenge.subjectId)}</span>
                    <div>
                      <h4 className="font-bold text-slate-900">{challenge.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span className={`px-2 py-1 rounded-full border ${getDifficultyColor(challenge.requirements)}`}>
                          {getDifficultyLabel(challenge.requirements)}
                        </span>
                        <span>•</span>
                        <span>{challenge.currentParticipants} participants</span>
                        {challenge.maxParticipants && (
                          <>
                            <span>•</span>
                            <span>Max: {challenge.maxParticipants}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-3">{challenge.description}</p>

                  {/* Progress and Time */}
                  <div className="space-y-2">
                    {/* Participation Progress */}
                    {challenge.maxParticipants && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>Participants</span>
                          <span>{challenge.currentParticipants}/{challenge.maxParticipants}</span>
                        </div>
                        <ProgressBar
                          current={challenge.currentParticipants}
                          max={challenge.maxParticipants}
                          color="success"
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    )}

                    {/* Time Remaining */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Time remaining:</span>
                      <span className="font-medium text-orange-600">
                        {getTimeRemaining(challenge.endDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-4 flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      +{challenge.xpReward.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">XP Reward</div>
                  </div>

                  <AnimatedButton
                    onClick={() => handleJoinChallenge(challenge.id)}
                    disabled={joiningChallenge === challenge.id || 
                             (challenge.maxParticipants && challenge.currentParticipants >= challenge.maxParticipants)}
                    variant="success"
                    size="sm"
                    className="min-w-[80px]"
                  >
                    {joiningChallenge === challenge.id ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Joining...</span>
                      </div>
                    ) : challenge.maxParticipants && challenge.currentParticipants >= challenge.maxParticipants ? (
                      'Full'
                    ) : (
                      'Join'
                    )}
                  </AnimatedButton>
                </div>
              </div>

              {/* Requirements */}
              {challenge.requirements && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    {challenge.requirements.minLevel && (
                      <Tooltip content="Minimum character level required">
                        <span>Min Level: {challenge.requirements.minLevel}</span>
                      </Tooltip>
                    )}
                    {challenge.requirements.maxLevel && (
                      <Tooltip content="Maximum character level allowed">
                        <span>Max Level: {challenge.requirements.maxLevel}</span>
                      </Tooltip>
                    )}
                    {challenge.requirements.ageRange && (
                      <Tooltip content="Age range for this challenge">
                        <span>Ages: {challenge.requirements.ageRange}</span>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {challenges.length === 0 && !loading && (
        <div className="p-8 text-center text-slate-500">
          <div className="text-4xl mb-2">⚔️</div>
          <p className="text-sm">No active challenges right now</p>
          <p className="text-xs text-slate-400 mt-1">
            Check back later for new learning competitions!
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs text-slate-500">
          New challenges appear daily • Compete with friends to earn bonus XP!
        </p>
      </div>
    </div>
  );
};