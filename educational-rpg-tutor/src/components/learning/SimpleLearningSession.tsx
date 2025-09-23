import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';

interface SimpleQuestion {
  id: string;
  question: string;
  options: string[];
  correct: string;
  subject: string;
  difficulty: number;
  xp: number;
  hint?: string;
  explanation?: string;
}

// Sample questions for immediate use
const SAMPLE_QUESTIONS: SimpleQuestion[] = [
  {
    id: '1',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correct: '4',
    subject: 'Mathematics',
    difficulty: 1,
    xp: 10,
    hint: 'Count on your fingers',
    explanation: '2 + 2 = 4'
  },
  {
    id: '2',
    question: 'What is 5 + 3?',
    options: ['7', '8', '9', '10'],
    correct: '8',
    subject: 'Mathematics',
    difficulty: 1,
    xp: 10,
    hint: 'Count up from 5',
    explanation: '5 + 3 = 8'
  },
  {
    id: '3',
    question: 'What is 10 - 4?',
    options: ['5', '6', '7', '8'],
    correct: '6',
    subject: 'Mathematics',
    difficulty: 1,
    xp: 10,
    hint: 'Count backwards from 10',
    explanation: '10 - 4 = 6'
  },
  {
    id: '4',
    question: 'What is 3 × 4?',
    options: ['10', '11', '12', '13'],
    correct: '12',
    subject: 'Mathematics',
    difficulty: 2,
    xp: 20,
    hint: 'Think of it as 3 + 3 + 3 + 3',
    explanation: '3 × 4 = 12'
  },
  {
    id: '5',
    question: 'Count the stars: ⭐⭐⭐⭐⭐',
    options: ['4', '5', '6', '7'],
    correct: '5',
    subject: 'Mathematics',
    difficulty: 1,
    xp: 10,
    hint: 'Point to each star and count',
    explanation: 'There are 5 stars'
  },
  {
    id: '6',
    question: 'What do plants need to grow?',
    options: ['Only water', 'Only sunlight', 'Water and sunlight', 'Nothing'],
    correct: 'Water and sunlight',
    subject: 'Science',
    difficulty: 1,
    xp: 10,
    hint: 'Think about what you give plants at home',
    explanation: 'Plants need both water and sunlight to grow healthy'
  },
  {
    id: '7',
    question: 'How many legs does a spider have?',
    options: ['6', '8', '10', '12'],
    correct: '8',
    subject: 'Science',
    difficulty: 2,
    xp: 20,
    hint: 'Spiders are arachnids, not insects',
    explanation: 'All spiders have 8 legs'
  },
  {
    id: '8',
    question: 'What letter does "Apple" start with?',
    options: ['A', 'B', 'C', 'D'],
    correct: 'A',
    subject: 'Language Arts',
    difficulty: 1,
    xp: 10,
    hint: 'Say the word slowly: A-pple',
    explanation: 'Apple starts with the letter A'
  },
  {
    id: '9',
    question: 'Which word rhymes with "cat"?',
    options: ['dog', 'hat', 'bird', 'fish'],
    correct: 'hat',
    subject: 'Language Arts',
    difficulty: 1,
    xp: 10,
    hint: 'Think of words that end with the same sound as "cat"',
    explanation: 'Hat rhymes with cat because they both end with "at"'
  },
  {
    id: '10',
    question: 'Who was the first President of the United States?',
    options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'],
    correct: 'George Washington',
    subject: 'History',
    difficulty: 2,
    xp: 20,
    hint: 'He is on the one dollar bill',
    explanation: 'George Washington was the first President from 1789-1797'
  },
  {
    id: '11',
    question: 'What are the primary colors?',
    options: ['Red, Blue, Yellow', 'Red, Green, Blue', 'Blue, Yellow, Orange', 'Red, Purple, Green'],
    correct: 'Red, Blue, Yellow',
    subject: 'Art',
    difficulty: 1,
    xp: 10,
    hint: 'These colors cannot be made by mixing other colors',
    explanation: 'Red, blue, and yellow are primary colors that mix to make all other colors'
  },
  {
    id: '12',
    question: 'What do we call baby frogs?',
    options: ['Puppies', 'Tadpoles', 'Kittens', 'Chicks'],
    correct: 'Tadpoles',
    subject: 'Science',
    difficulty: 1,
    xp: 10,
    hint: 'They swim in water and have tails',
    explanation: 'Baby frogs are called tadpoles and they live in water before becoming frogs'
  }
];

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  difficulty: string;
  questionCount: number;
  unlockLevel: number;
}

interface SimpleLearningSessionProps {
  selectedSubject?: Subject | null;
  onComplete?: (analytics: any) => void;
  onBack?: () => void;
}

export const SimpleLearningSession: React.FC<SimpleLearningSessionProps> = ({
  selectedSubject,
  onComplete,
  onBack
}) => {
  const { user } = useSimpleAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    totalXP: 0
  });
  const [questions, setQuestions] = useState<SimpleQuestion[]>([]);

  // Initialize questions based on user age and selected subject
  useEffect(() => {
    if (user) {
      // Filter questions based on selected subject
      let filteredQuestions = SAMPLE_QUESTIONS;
      
      if (selectedSubject && selectedSubject.id !== 'mixed') {
        // Filter by subject
        filteredQuestions = SAMPLE_QUESTIONS.filter(q => 
          q.subject.toLowerCase().includes(selectedSubject.id.replace('-', ' '))
        );
      }
      
      // Filter by age/difficulty
      if (user.age <= 6) {
        // Younger kids get easier questions
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === 1);
      } else if (user.age <= 10) {
        // Elementary age gets mix of easy and medium
        filteredQuestions = filteredQuestions.filter(q => q.difficulty <= 2);
      }
      
      // If no questions match the subject, fall back to math
      if (filteredQuestions.length === 0) {
        filteredQuestions = SAMPLE_QUESTIONS.filter(q => q.subject === 'Mathematics');
      }
      
      // Shuffle questions
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 5)); // Take first 5 questions
    }
  }, [user, selectedSubject]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correct;
    const xpEarned = isCorrect ? currentQuestion.xp : 0;

    setSessionStats(prev => ({
      totalQuestions: prev.totalQuestions + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      totalXP: prev.totalXP + xpEarned
    }));

    // Save progress to localStorage
    const progress = JSON.parse(localStorage.getItem('educational_rpg_progress') || '{}');
    progress.totalXP = (progress.totalXP || 0) + xpEarned;
    progress.questionsAnswered = (progress.questionsAnswered || 0) + 1;
    progress.correctAnswers = (progress.correctAnswers || 0) + (isCorrect ? 1 : 0);
    localStorage.setItem('educational_rpg_progress', JSON.stringify(progress));

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      // Session complete
      const finalStats = {
        totalQuestions: sessionStats.totalQuestions + 1,
        correctAnswers: sessionStats.correctAnswers + (selectedAnswer === currentQuestion?.correct ? 1 : 0),
        totalXP: sessionStats.totalXP + (selectedAnswer === currentQuestion?.correct ? currentQuestion?.xp || 0 : 0),
        subject: selectedSubject?.name || 'Mixed'
      };
      
      if (onComplete) {
        onComplete(finalStats);
      } else {
        alert(`Session Complete!\nQuestions: ${finalStats.totalQuestions}\nCorrect: ${finalStats.correctAnswers}\nXP Earned: ${finalStats.totalXP}`);
        // Reset session
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setShowHint(false);
        setSessionStats({ totalQuestions: 0, correctAnswers: 0, totalXP: 0 });
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Please log in to start learning</h2>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No questions available</h2>
          <button
            onClick={() => window.location.href = '/app/home'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">
              {selectedSubject?.name || currentQuestion.subject} Adventure
            </h1>
            <button
              onClick={onBack || (() => window.location.href = '/app/learning')}
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Back to Subjects
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-800 rounded-full h-4 shadow-inner overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-2 text-sm text-slate-300">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>XP: +{sessionStats.totalXP}</span>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-3 rounded-lg shadow text-center">
            <div className="text-lg font-semibold text-blue-400">
              {sessionStats.correctAnswers}/{sessionStats.totalQuestions}
            </div>
            <div className="text-xs text-slate-400">Correct</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg shadow text-center">
            <div className="text-lg font-semibold text-green-400">
              {sessionStats.totalQuestions > 0 ? Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100) : 0}%
            </div>
            <div className="text-xs text-slate-400">Accuracy</div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg shadow text-center">
            <div className="text-lg font-semibold text-yellow-400">
              +{sessionStats.totalXP}
            </div>
            <div className="text-xs text-slate-400">XP Earned</div>
          </div>

          <div className="bg-slate-800 p-3 rounded-lg shadow text-center">
            <div className="text-lg font-semibold text-purple-400">
              Level {currentQuestion.difficulty}
            </div>
            <div className="text-xs text-slate-400">Difficulty</div>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                {currentQuestion.subject}
              </span>
              <span className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-full">
                {currentQuestion.xp} XP
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              {currentQuestion.question}
            </h2>

            {/* Hint Button */}
            {currentQuestion.hint && !showResult && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'} 💡
              </button>
            )}

            {/* Hint Display */}
            {showHint && currentQuestion.hint && (
              <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <strong>Hint:</strong> {currentQuestion.hint}
                </p>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                  selectedAnswer === option
                    ? showResult
                      ? option === currentQuestion.correct
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-red-600 border-red-500 text-white'
                      : 'bg-blue-600 border-blue-500 text-white'
                    : showResult && option === currentQuestion.correct
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
                } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="font-semibold mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {showResult && option === currentQuestion.correct && (
                  <span className="ml-2 text-green-300">✓</span>
                )}
                {showResult && selectedAnswer === option && option !== currentQuestion.correct && (
                  <span className="ml-2 text-red-300">✗</span>
                )}
              </button>
            ))}
          </div>

          {/* Result Display */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg border-2 ${
                selectedAnswer === currentQuestion.correct
                  ? 'bg-green-900/30 border-green-700'
                  : 'bg-red-900/30 border-red-700'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">
                  {selectedAnswer === currentQuestion.correct ? '🎉' : '😔'}
                </span>
                <h3 className={`text-lg font-bold ${
                  selectedAnswer === currentQuestion.correct ? 'text-green-300' : 'text-red-300'
                }`}>
                  {selectedAnswer === currentQuestion.correct ? 'Correct!' : 'Not quite right'}
                </h3>
              </div>
              
              {currentQuestion.explanation && (
                <p className="text-slate-300 text-sm">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
              )}
              
              {selectedAnswer === currentQuestion.correct && (
                <p className="text-green-300 text-sm mt-2">
                  +{currentQuestion.xp} XP earned!
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Session'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};