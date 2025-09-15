import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { useQuestionSystem } from '../../hooks/useQuestionSystem';
import { questionService } from '../../services/questionService';
import type { Subject } from '../../types/question';

interface LearningSessionProps {
  userId: string;
  age: number;
  selectedSubject?: Subject;
  onSessionComplete?: (stats: any) => void;
}

export const LearningSession: React.FC<LearningSessionProps> = ({
  userId,
  age,
  selectedSubject,
  onSessionComplete
}) => {
  const [, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Determine age range based on age
  const getAgeRange = (age: number): string => {
    if (age <= 6) return '3-6';
    if (age <= 10) return '7-10';
    if (age <= 14) return '11-14';
    return '15-18';
  };

  const ageRange = getAgeRange(age);

  const {
    currentQuestion,
    isLoading,
    error,
    sessionComplete,
    sessionStats,
    progress,
    currentStats,
    submitAnswer,
    nextQuestion,
    restartSession
  } = useQuestionSystem({
    userId,
    ageRange,
    subjectId: selectedSubject?.id,
    questionsPerSession: 10
  });

  // Load subjects on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const allSubjects = await questionService.getSubjects();
        setSubjects(allSubjects);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, []);

  // Handle session completion
  useEffect(() => {
    if (sessionComplete && onSessionComplete) {
      onSessionComplete(sessionStats);
    }
  }, [sessionComplete, sessionStats, onSessionComplete]);

  if (isLoadingSubjects) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={restartSession}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mt-8 p-8 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Session Complete!
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {sessionStats.correctAnswers}/{sessionStats.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {sessionStats.accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">
                +{sessionStats.totalXPEarned}
              </div>
              <div className="text-sm text-gray-600">XP Earned</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {sessionStats.averageResponseTime.toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600">Avg. Time</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={restartSession}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start New Session
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Questions Available</h2>
        <p className="text-yellow-600 mb-4">
          No questions found for your age group and selected subject.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Go Back
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
              {selectedSubject ? selectedSubject.name : 'Mixed Subjects'} Learning Session
            </h1>
            
            <div className="text-sm text-gray-600">
              Age Range: {ageRange}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-full h-3 shadow-inner overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
            <span>Question {progress.current} of {progress.total}</span>
            <span>Current XP: +{currentStats.totalXPEarned}</span>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-3 rounded-lg shadow text-center">
            <div className="text-lg font-semibold text-blue-600">
              {currentStats.correctAnswers}/{currentStats.totalQuestions}
            </div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow text-center">
            <div className="text-lg font-semibold text-green-600">
              {currentStats.accuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow text-center">
            <div className="text-lg font-semibold text-yellow-600">
              +{currentStats.totalXPEarned}
            </div>
            <div className="text-xs text-gray-600">XP Earned</div>
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
};