import React, { useState, useEffect, useCallback } from 'react';
import { enhancedQuestionService, type QuestionFilters, type SubjectProgress } from '../../services/enhancedQuestionService';
import type { Question, Subject } from '../../types/question';

interface QuestionLoaderProps {
  userId: string;
  ageRange: string;
  onQuestionsLoaded?: (questions: Question[]) => void;
  onError?: (error: string) => void;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export const QuestionLoader: React.FC<QuestionLoaderProps> = ({
  userId,
  ageRange,
  onQuestionsLoaded,
  onError
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userProgress, setUserProgress] = useState<SubjectProgress[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    progress: 0
  });
  const [filters, setFilters] = useState<QuestionFilters>({
    ageRange,
    limit: 20,
    excludeAnswered: false
  });

  /**
   * Load subjects on component mount
   */
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoadingState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const [subjectsData, progressData] = await Promise.all([
          enhancedQuestionService.getSubjectsWithCounts(ageRange),
          enhancedQuestionService.getUserProgressBySubject(userId, ageRange)
        ]);
        
        setSubjects(subjectsData);
        setUserProgress(progressData);
        
        setLoadingState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load subjects';
        setLoadingState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        onError?.(errorMessage);
      }
    };

    if (userId && ageRange) {
      loadSubjects();
    }
  }, [userId, ageRange, onError]);

  /**
   * Load questions based on current filters
   */
  const loadQuestions = useCallback(async () => {
    try {
      setLoadingState(prev => ({ ...prev, isLoading: true, error: null, progress: 0 }));
      
      const currentFilters = {
        ...filters,
        subjectId: selectedSubject || undefined,
        userId: filters.excludeAnswered ? userId : undefined
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 100);

      const questionBatch = await enhancedQuestionService.loadQuestions(currentFilters);
      
      clearInterval(progressInterval);
      setLoadingState(prev => ({ ...prev, progress: 100 }));
      
      setQuestions(questionBatch.questions);
      onQuestionsLoaded?.(questionBatch.questions);
      
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isLoading: false, progress: 0 }));
      }, 200);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load questions';
      setLoadingState(prev => ({ ...prev, isLoading: false, error: errorMessage, progress: 0 }));
      onError?.(errorMessage);
    }
  }, [filters, selectedSubject, userId, onQuestionsLoaded, onError]);

  /**
   * Load adaptive questions for the user
   */
  const loadAdaptiveQuestions = useCallback(async () => {
    try {
      setLoadingState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const adaptiveQuestions = await enhancedQuestionService.getAdaptiveQuestions(
        userId,
        ageRange,
        selectedSubject || undefined,
        filters.limit || 10
      );
      
      setQuestions(adaptiveQuestions);
      onQuestionsLoaded?.(adaptiveQuestions);
      
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load adaptive questions';
      setLoadingState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [userId, ageRange, selectedSubject, filters.limit, onQuestionsLoaded, onError]);

  /**
   * Handle filter changes
   */
  const updateFilters = (newFilters: Partial<QuestionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Get progress for selected subject
   */
  const getSelectedSubjectProgress = () => {
    if (!selectedSubject) return null;
    return userProgress.find(p => p.subjectId === selectedSubject);
  };

  return (
    <div className="question-loader p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Question Loader
        </h2>
        
        {/* Subject Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.icon} {subject.name} ({subject.questionCount} questions)
              </option>
            ))}
          </select>
        </div>

        {/* Subject Progress Display */}
        {selectedSubject && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            {(() => {
              const progress = getSelectedSubjectProgress();
              if (!progress) return null;
              
              return (
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Your Progress</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Questions Answered:</span>
                      <span className="ml-2 font-medium">{progress.answeredQuestions}/{progress.totalQuestions}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Accuracy:</span>
                      <span className="ml-2 font-medium">{progress.accuracy.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(progress.answeredQuestions / progress.totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              value={filters.difficultyLevel || ''}
              onChange={(e) => updateFilters({ 
                difficultyLevel: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Difficulty</option>
              <option value="1">⭐ Easy</option>
              <option value="2">⭐⭐ Medium</option>
              <option value="3">⭐⭐⭐ Hard</option>
              <option value="4">⭐⭐⭐⭐ Very Hard</option>
              <option value="5">⭐⭐⭐⭐⭐ Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Questions
            </label>
            <select
              value={filters.limit || 20}
              onChange={(e) => updateFilters({ limit: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 Questions</option>
              <option value="20">20 Questions</option>
              <option value="50">50 Questions</option>
              <option value="100">100 Questions</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.excludeAnswered || false}
                onChange={(e) => updateFilters({ excludeAnswered: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Exclude answered</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={loadQuestions}
            disabled={loadingState.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingState.isLoading ? 'Loading...' : 'Load Questions'}
          </button>
          
          <button
            onClick={loadAdaptiveQuestions}
            disabled={loadingState.isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingState.isLoading ? 'Loading...' : 'Load Adaptive Questions'}
          </button>
        </div>

        {/* Loading Progress */}
        {loadingState.isLoading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Loading questions...</span>
              <span>{loadingState.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {loadingState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{loadingState.error}</p>
          </div>
        )}
      </div>

      {/* Questions Display */}
      {questions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Loaded Questions ({questions.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Question {index + 1}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {question.subjects?.name}
                    </span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      Level {question.difficulty_level}
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      {question.xp_reward} XP
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-800 mb-2">{question.question_text}</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {question.answer_options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 text-sm rounded border ${
                        option === question.correct_answer
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {String.fromCharCode(65 + optionIndex)}. {option}
                      {option === question.correct_answer && (
                        <span className="ml-1 text-green-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
                
                {question.hint && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <strong className="text-blue-800">Hint:</strong>
                    <span className="text-blue-700 ml-1">{question.hint}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Progress Summary */}
      {userProgress.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Overall Progress
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProgress.map(progress => (
              <div
                key={progress.subjectId}
                className="p-3 border border-gray-200 rounded-md hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">
                    {subjects.find(s => s.id === progress.subjectId)?.icon} {progress.subjectName}
                  </h4>
                  <span className="text-sm text-gray-600">
                    {progress.accuracy.toFixed(0)}%
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {progress.answeredQuestions}/{progress.totalQuestions} questions
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.answeredQuestions / progress.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionLoader;