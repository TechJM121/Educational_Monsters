import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question, QuestionResponse } from '../../types/question';

interface MultipleChoiceQuestionProps {
  question: Question;
  onAnswer: (selectedAnswer: string, responseTime: number) => Promise<QuestionResponse>;
  onNext: () => void;
  disabled?: boolean;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswer,
  onNext,
  disabled = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [response, setResponse] = useState<QuestionResponse | null>(null);
  const [startTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setIsSubmitted(false);
    setResponse(null);
    setIsLoading(false);
  }, [question.id]);

  const handleAnswerSelect = (answer: string) => {
    if (isSubmitted || disabled) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitted || disabled) return;

    setIsLoading(true);
    const responseTime = Math.floor((Date.now() - startTime) / 1000);

    try {
      const questionResponse = await onAnswer(selectedAnswer, responseTime);
      setResponse(questionResponse);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnswerOptionClass = (option: string) => {
    const baseClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium";
    
    if (!isSubmitted) {
      if (selectedAnswer === option) {
        return `${baseClass} border-blue-500 bg-blue-50 text-blue-700 shadow-md`;
      }
      return `${baseClass} border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25 text-gray-700`;
    }

    // After submission, show correct/incorrect states
    if (option === question.correct_answer) {
      return `${baseClass} border-green-500 bg-green-50 text-green-700 shadow-md`;
    }
    
    if (selectedAnswer === option && option !== question.correct_answer) {
      return `${baseClass} border-red-500 bg-red-50 text-red-700 shadow-md`;
    }
    
    return `${baseClass} border-gray-200 bg-gray-50 text-gray-500`;
  };

  const getAnswerIcon = (option: string) => {
    if (!isSubmitted) return null;
    
    if (option === question.correct_answer) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-2 text-green-600"
        >
          ✓
        </motion.div>
      );
    }
    
    if (selectedAnswer === option && option !== question.correct_answer) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-2 text-red-600"
        >
          ✗
        </motion.div>
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Difficulty: {question.difficulty_level}/5
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            {question.xp_reward} XP
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {question.question_text}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.answer_options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={isSubmitted || disabled || isLoading}
            className={getAnswerOptionClass(option)}
            whileHover={!isSubmitted && !disabled ? { scale: 1.02 } : {}}
            whileTap={!isSubmitted && !disabled ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-between">
              <span className="flex-1">{option}</span>
              {getAnswerIcon(option)}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <motion.button
          onClick={handleSubmit}
          disabled={!selectedAnswer || disabled || isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            selectedAnswer && !disabled && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={selectedAnswer && !disabled && !isLoading ? { scale: 1.02 } : {}}
          whileTap={selectedAnswer && !disabled && !isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            'Submit Answer'
          )}
        </motion.button>
      )}

      {/* Result Display */}
      <AnimatePresence>
        {isSubmitted && response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <div className={`p-4 rounded-lg ${
              response.is_correct 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${
                  response.is_correct ? 'text-green-700' : 'text-red-700'
                }`}>
                  {response.is_correct ? '🎉 Correct!' : '❌ Incorrect'}
                </span>
                
                {response.is_correct && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"
                  >
                    +{response.xp_earned} XP
                  </motion.span>
                )}
              </div>
              
              {!response.is_correct && (
                <p className="text-red-600 text-sm">
                  The correct answer was: <strong>{question.correct_answer}</strong>
                </p>
              )}
            </div>

            {/* Next Button */}
            <motion.button
              onClick={onNext}
              className="w-full mt-4 py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next Question
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};