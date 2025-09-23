import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SimpleLearningSession } from '../components/learning/SimpleLearningSession';
import { SubjectSelection } from '../components/learning/SubjectSelection';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import { ResponsiveContainer, ResponsiveText } from '../components/shared/ResponsiveContainer';

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

export const LearningPage: React.FC = () => {
  const { user } = useSimpleAuth();
  const [currentView, setCurrentView] = useState<'welcome' | 'subjects' | 'session'>('welcome');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [userAge, setUserAge] = useState<number>(10);
  const [userLevel, setUserLevel] = useState<number>(1);

  // Get user data from user object and progress
  useEffect(() => {
    if (user?.age) {
      setUserAge(user.age);
    }
    
    // Get user level from progress
    const progress = JSON.parse(localStorage.getItem('educational_rpg_progress') || '{}');
    const totalXP = progress.totalXP || 0;
    const calculatedLevel = Math.floor(totalXP / 100) + 1; // 100 XP per level
    setUserLevel(calculatedLevel);
  }, [user?.age]);

  // Handle subject selection
  const handleSubjectSelect = (subject: Subject | null) => {
    setSelectedSubject(subject);
  };

  // Handle starting learning session
  const handleStartSession = () => {
    setCurrentView('session');
  };

  // Handle session completion
  const handleSessionComplete = (analytics: any) => {
    console.log('Session completed:', analytics);
    setCurrentView('subjects'); // Return to subject selection
  };

  // Handle return to subjects
  const handleReturnToSubjects = () => {
    setCurrentView('subjects');
    setSelectedSubject(null);
  };

  // Handle return to home
  const handleReturnHome = () => {
    setCurrentView('welcome');
    setSelectedSubject(null);
  };

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 flex items-center justify-center">
        <ResponsiveContainer maxWidth="md" padding="md">
          <div className="text-center">
            <ResponsiveText 
              as="h1" 
              size="2xl" 
              weight="bold" 
              className="text-white mb-4"
            >
              Please log in to start learning
            </ResponsiveText>
            <ResponsiveText size="lg" className="text-slate-300 mb-6">
              Create an account or sign in to access your personalized learning adventure
            </ResponsiveText>
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-500 transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  // Show learning session if started
  if (currentView === 'session') {
    return <SimpleLearningSession selectedSubject={selectedSubject} onComplete={handleSessionComplete} onBack={handleReturnToSubjects} />;
  }

  // Show subject selection if subjects view
  if (currentView === 'subjects') {
    return (
      <SubjectSelection
        userAge={userAge}
        userLevel={userLevel}
        onSubjectSelect={handleSubjectSelect}
        onStartSession={handleStartSession}
      />
    );
  }

  // Show welcome screen with start button
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950">
      <ResponsiveContainer maxWidth="lg" padding="md" animate>
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ResponsiveText 
              as="h1" 
              size="4xl" 
              weight="bold" 
              className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent mb-4"
            >
              🎓 Learning Adventure
            </ResponsiveText>
            <ResponsiveText size="xl" className="text-slate-300 mb-2">
              Welcome back, {user.name || 'Learner'}!
            </ResponsiveText>
            <ResponsiveText size="lg" className="text-slate-400">
              Ready to explore new worlds of knowledge?
            </ResponsiveText>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-700">
            <div className="text-6xl mb-4">🚀</div>
            <ResponsiveText 
              as="h2" 
              size="2xl" 
              weight="semibold" 
              className="text-white mb-4"
            >
              Your Learning Journey Awaits
            </ResponsiveText>
            <ResponsiveText size="lg" className="text-slate-300 mb-6">
              Discover mathematics, science, history, and more through interactive questions
              tailored to your age and skill level.
            </ResponsiveText>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-blue-400 font-semibold">🎯 Adaptive</div>
                <div className="text-slate-300">Questions adjust to your level</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-green-400 font-semibold">⚡ Real-time XP</div>
                <div className="text-slate-300">Earn points as you learn</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-purple-400 font-semibold">📊 Progress</div>
                <div className="text-slate-300">Track your improvement</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-yellow-400 font-semibold">🏆 Achievements</div>
                <div className="text-slate-300">Unlock rewards</div>
              </div>
            </div>

            <motion.button
              onClick={() => setCurrentView('subjects')}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Choose Your Subject
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-slate-400 text-sm"
          >
            Age: {userAge} years • Personalized content for your level
          </motion.div>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
};