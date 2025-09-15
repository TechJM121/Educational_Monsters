import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { SubjectSelector } from './SubjectSelector';
import { SessionCompletion } from './SessionCompletion';
import { useLearningSession } from '../../hooks/useLearningSession';
import type { Subject, LearningSessionConfig } from '../../types/question';

interface LearningSessionProps {
  userId: string;
  age: number;
  userLevel?: number;
  worldId?: string;
  onSessionComplete?: (analytics: any) => void;
  onReturnHome?: () => void;
}

type SessionPhase = 'subject-selection' | 'learning' | 'completion';

export const LearningSession: React.FC<LearningSessionProps> = ({
  userId,
  age,
  userLevel = 1,
  worldId,
  onSessionComplete,
  onReturnHome
}) => {
  const [phase, setPhase] = useState<SessionPhase>('subject-selection');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Session configuration
  const sessionConfig: Partial<LearningSessionConfig> = {
    questionsPerSession: 10,
    adaptiveDifficulty: true,
    showProgress: true,
    enableHints: userLevel >= 5 // Enable hints for higher level users
  };

  const {
    session,
    currentQuestion,
    isLoading,
    error,
    isComplete,
    finalAnalytics,
    startSession,
    submitAnswer,
    nextQuestion,
    completeSession,
    restartSession,
    getSubjects,
    progress,
    currentStats
  } = useLearningSession({
    userId,
    subjectId: selectedSubject?.id,
    worldId,
    config: sessionConfig
  });

  // Load subjects on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const allSubjects = await getSubjects();
        setSubjects(allSubjects);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, [getSubjects]);

  // Handle session completion
  useEffect(() => {
    if (isComplete && finalAnalytics) {
      setPhase('completion');
      if (onSessionComplete) {
        onSessionComplete(finalAnalytics);
      }
    }
  }, [isComplete, finalAnalytics, onSessionComplete]);

  // Handle subject selection and start session
  const handleStartSession = async () => {
    setPhase('learning');
    if (!session) {
      await startSession();
    }
  };

  // Handle new session
  const handleNewSession = () => {
    setPhase('subject-selection');
    setSelectedSubject(null);
  };

  // Handle return home
  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      window.location.reload();
    }
  };

  // Loading state for subjects
  if (isLoadingSubjects) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning worlds...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => {
            setPhase('subject-selection');
            restartSession();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render based on current phase
  switch (phase) {
    case 'subject-selection':
      return (
        <SubjectSelector
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSubjectSelect={setSelectedSubject}
          onStartSession={handleStartSession}
          isLoading={isLoading}
          userLevel={userLevel}
        />
      );

    case 'completion':
      if (!finalAnalytics) return null;
      
      return (
        <SessionCompletion
          analytics={finalAnalytics}
          onNewSession={handleNewSession}
          onReturnHome={handleReturnHome}
          subjectName={selectedSubject?.name || 'Mixed Subjects'}
        />
      );

    case 'learning':
    default:
      // Loading state for session
      if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Preparing your adventure...</p>
            </div>
          </div>
        );
      }

      // No questions available
      if (!currentQuestion) {
        return (
          <div className="max-w-md mx-auto mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Questions Available</h2>
            <p className="text-yellow-600 mb-4">
              No questions found for your selected criteria. Try a different subject or check back later.
            </p>
            <button
              onClick={() => setPhase('subject-selection')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Choose Different Subject
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedSubject ? selectedSubject.name : 'Mixed Subjects'} Adventure
                </h1>
                
                <button
                  onClick={() => setPhase('subject-selection')}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Change Subject
                </button>
              </div>

              {/* Progress Bar */}
              <div className="bg-white rounded-full h-4 shadow-inner overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress?.percentage || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span>Question {progress?.current || 0} of {progress?.total || 0}</span>
                <span>Current XP: +{currentStats?.totalXPEarned || 0}</span>
              </div>
            </div>

            {/* Current Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-3 rounded-lg shadow text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {currentStats?.correctAnswers || 0}/{currentStats?.totalQuestions || 0}
                </div>
                <div className="text-xs text-gray-600">Correct</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow text-center">
                <div className="text-lg font-semibold text-green-600">
                  {(currentStats?.accuracy || 0).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow text-center">
                <div className="text-lg font-semibold text-yellow-600">
                  +{currentStats?.totalXPEarned || 0}
                </div>
                <div className="text-xs text-gray-600">XP Earned</div>
              </div>

              <div className="bg-white p-3 rounded-lg shadow text-center">
                <div className="text-lg font-semibold text-purple-600">
                  Level {currentStats?.currentDifficulty || 1}
                </div>
                <div className="text-xs text-gray-600">Difficulty</div>
              </div>
            </div>

            {/* Question Component */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <MultipleChoiceQuestion
                  question={currentQuestion}
                  onAnswer={submitAnswer}
                  onNext={nextQuestion}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      );
  }
};