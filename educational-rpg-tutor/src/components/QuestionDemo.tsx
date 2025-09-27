// Demo component showing how to use the hybrid question service
import React, { useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';

export const QuestionDemo: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState('3-6');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const {
    questions,
    subjects,
    loading,
    error,
    connectivity,
    loadQuestions,
    submitResponse,
    refreshConnectivity
  } = useQuestions({
    ageRange: selectedAge,
    subjectId: selectedSubject || undefined,
    limit: 5,
    userId: 'demo-user', // In real app, this would come from auth
    autoLoad: true
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !selectedAnswer) return;

    const response = await submitResponse(currentQuestion.id, selectedAnswer);
    setLastResponse(response);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    setSelectedAnswer('');
    setShowResult(false);
    setLastResponse(null);
  };

  const handleFilterChange = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setLastResponse(null);
    loadQuestions({
      ageRange: selectedAge,
      subjectId: selectedSubject || undefined,
      limit: 5
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Question System Demo
        </h1>
        
        {/* Connectivity Status */}
        {connectivity && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Status: {connectivity.usingLocalFallback ? 
                    <span className="text-orange-600">Using Local Questions</span> :
                    <span className="text-green-600">Connected to Supabase</span>
                  }
                </p>
                <p className="text-xs text-gray-600">
                  Supabase Configured: {connectivity.isSupabaseConfigured ? 'Yes' : 'No'} | 
                  Available: {connectivity.isSupabaseAvailable ? 'Yes' : 'No'}
                </p>
              </div>
              <button
                onClick={refreshConnectivity}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Range
            </label>
            <select
              value={selectedAge}
              onChange={(e) => {
                setSelectedAge(e.target.value);
                setTimeout(handleFilterChange, 100);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="3-6">Ages 3-6</option>
              <option value="7-10">Ages 7-10</option>
              <option value="11-14">Ages 11-14</option>
              <option value="15-18">Ages 15-18</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setTimeout(handleFilterChange, 100);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.icon} {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilterChange}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Reload Questions'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Question Display */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length > 0 && currentQuestion ? (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {currentQuestion.subjects?.name || 'Unknown Subject'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500">
                  Difficulty: {currentQuestion.difficulty_level}/5
                </span>
                <span className="text-xs text-gray-500">
                  XP Reward: {currentQuestion.xp_reward}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {currentQuestion.question_text}
            </h3>

            {!showResult ? (
              <div className="space-y-3">
                {currentQuestion.answer_options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}

                <div className="flex justify-between items-center mt-6">
                  {currentQuestion.hint && (
                    <div className="text-sm text-gray-600">
                      💡 Hint: {currentQuestion.hint}
                    </div>
                  )}
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-md ${
                  lastResponse?.is_correct 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">
                      {lastResponse?.is_correct ? '✅' : '❌'}
                    </span>
                    <span className={`font-semibold ${
                      lastResponse?.is_correct ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {lastResponse?.is_correct ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Your answer:</strong> {selectedAnswer}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Correct answer:</strong> {currentQuestion.correct_answer}
                  </p>
                  
                  {lastResponse?.is_correct && (
                    <p className="text-sm text-green-700">
                      <strong>XP Earned:</strong> {lastResponse.xp_earned}
                    </p>
                  )}
                </div>

                {currentQuestion.explanation && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                    <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Start Over' : 'Next Question'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>No questions available for the selected filters.</p>
            <button
              onClick={handleFilterChange}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Different Filters
            </button>
          </div>
        )}
      </div>

      {/* Subjects Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Available Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedSubject(subject.id);
                setTimeout(handleFilterChange, 100);
              }}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{subject.icon}</span>
                <h3 className="font-semibold text-gray-800">{subject.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{subject.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                Primary: {subject.statMapping.primary} | 
                Secondary: {subject.statMapping.secondary}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionDemo;