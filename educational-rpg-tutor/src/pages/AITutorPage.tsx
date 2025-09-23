import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AITutorChatSimple } from '../components/learning/AITutorChatSimple';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const AITutorPage: React.FC = () => {
  const { user } = useSimpleAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const subjects: Subject[] = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      description: 'Numbers, algebra, geometry, and problem-solving',
      icon: '🔢',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Physics, chemistry, biology, and natural phenomena',
      icon: '🧪',
      color: 'from-green-500 to-emerald-400'
    },
    {
      id: 'language-arts',
      name: 'Language Arts',
      description: 'Reading, writing, grammar, and literature',
      icon: '📚',
      color: 'from-purple-500 to-pink-400'
    },
    {
      id: 'history',
      name: 'History',
      description: 'World events, civilizations, and historical analysis',
      icon: '🏛️',
      color: 'from-yellow-500 to-orange-400'
    },
    {
      id: 'art',
      name: 'Art & Creativity',
      description: 'Visual arts, music, creative expression',
      icon: '🎨',
      color: 'from-pink-500 to-rose-400'
    },
    {
      id: 'general',
      name: 'General Learning',
      description: 'Any topic you want to explore',
      icon: '🌟',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Please log in to access AI Tutor
            </h1>
            <p className="text-lg text-slate-300 mb-6">
              Create an account or sign in to chat with your personal AI tutor
            </p>
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showChat) {
    return (
      <AITutorChatSimple
        userAge={user.age || 10}
        subject={selectedSubject || undefined}
        onClose={() => setShowChat(false)}
      />
    );
  }

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setShowChat(true);
  };

  const handleGeneralChat = () => {
    setSelectedSubject(null);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-4">
              🤖 AI Personal Tutor
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Welcome, {user.name}! Ready to learn with AI?
            </p>
            <p className="text-lg text-slate-400">
              Choose a subject or start a general conversation with your AI tutor
            </p>
          </motion.div>
        </div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              What can your AI tutor do?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">💡</div>
                <p className="text-sm font-semibold text-white mb-1">Explain Concepts</p>
                <p className="text-xs text-slate-400">Break down complex topics into simple explanations</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">❓</div>
                <p className="text-sm font-semibold text-white mb-1">Answer Questions</p>
                <p className="text-xs text-slate-400">Get instant answers to your learning questions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm font-semibold text-white mb-1">Personalized Help</p>
                <p className="text-xs text-slate-400">Adapted to your age and learning level</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <p className="text-sm font-semibold text-white mb-1">Study Tips</p>
                <p className="text-xs text-slate-400">Get strategies to improve your learning</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <button
            onClick={handleGeneralChat}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <span>Start General Chat</span>
              <span className="text-2xl">✨</span>
            </div>
          </button>
          <p className="text-sm text-slate-400 mt-2">
            Ask about any topic you're curious about!
          </p>
        </motion.div>

        {/* Subject Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Or choose a specific subject:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <motion.button
                key={subject.id}
                onClick={() => handleSubjectSelect(subject.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-6 rounded-2xl border-2 border-slate-600 bg-slate-800/50 backdrop-blur-sm hover:border-slate-500 hover:shadow-xl transition-all duration-300 text-left group"
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{subject.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-slate-300 mb-3">
                      {subject.description}
                    </p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${subject.color} text-white text-xs font-semibold`}>
                      <span>💬</span>
                      <span>Chat Now</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            💡 Tips for getting the most from your AI tutor:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-lg">✓</span>
              <div>
                <p className="text-sm font-semibold text-white">Be specific with your questions</p>
                <p className="text-xs text-slate-400">Instead of "help with math," try "explain how to solve quadratic equations"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg">✓</span>
              <div>
                <p className="text-sm font-semibold text-white">Ask for examples</p>
                <p className="text-xs text-slate-400">Request real-world examples to better understand concepts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 text-lg">✓</span>
              <div>
                <p className="text-sm font-semibold text-white">Don't hesitate to ask follow-ups</p>
                <p className="text-xs text-slate-400">If something isn't clear, ask for clarification or simpler explanations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-lg">✓</span>
              <div>
                <p className="text-sm font-semibold text-white">Practice with the tutor</p>
                <p className="text-xs text-slate-400">Ask for practice problems or quiz yourself on topics</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => window.location.href = '/app/home'}
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            ← Back to Dashboard
          </button>
        </motion.div>
    </div>
  );
};