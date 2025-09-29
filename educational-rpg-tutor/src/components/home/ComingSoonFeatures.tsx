import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ComingSoonFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  expectedDate: string;
  priority: 'high' | 'medium' | 'low';
}

export const ComingSoonFeatures: React.FC = () => {
  const navigate = useNavigate();

  const features: ComingSoonFeature[] = [
    {
      id: 'teacher-portal',
      title: 'Teacher Portal',
      description: 'Comprehensive classroom management for educators',
      icon: '👩‍🏫',
      route: '/app/teacher-portal',
      expectedDate: 'Q1 2025',
      priority: 'high'
    },
    {
      id: 'ai-personalization',
      title: 'AI Personalization',
      description: 'Adaptive learning powered by advanced AI',
      icon: '🤖',
      route: '/app/ai-personalization',
      expectedDate: 'Q2 2025',
      priority: 'high'
    },
    {
      id: 'social-hub',
      title: 'Social Learning Hub',
      description: 'Connect and learn with friends',
      icon: '👥',
      route: '/app/social-hub',
      expectedDate: 'Q2 2025',
      priority: 'medium'
    },
    {
      id: 'multiplayer',
      title: 'Multiplayer Adventures',
      description: 'Team up for epic learning quests',
      icon: '⚔️',
      route: '/app/multiplayer',
      expectedDate: 'Summer 2025',
      priority: 'medium'
    },
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics',
      description: 'Deep insights into learning patterns',
      icon: '📊',
      route: '/app/advanced-analytics',
      expectedDate: 'Q3 2025',
      priority: 'medium'
    },
    {
      id: 'mobile-app',
      title: 'Mobile Apps',
      description: 'Native iOS and Android apps',
      icon: '📱',
      route: '/app/mobile-app',
      expectedDate: 'Q4 2025',
      priority: 'low'
    },
    {
      id: 'vr-learning',
      title: 'VR Learning',
      description: 'Immersive virtual reality experiences',
      icon: '🥽',
      route: '/app/vr-learning',
      expectedDate: '2026',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-green-500 to-emerald-400';
      case 'medium': return 'from-yellow-500 to-orange-400';
      case 'low': return 'from-blue-500 to-cyan-400';
      default: return 'from-gray-500 to-slate-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { text: 'Coming Soon', color: 'bg-green-500' };
      case 'medium': return { text: 'In Development', color: 'bg-yellow-500' };
      case 'low': return { text: 'Planned', color: 'bg-blue-500' };
      default: return { text: 'Future', color: 'bg-gray-500' };
    }
  };

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-2">
          🚀 Exciting Features Coming Soon!
        </h2>
        <p className="text-slate-300 text-sm md:text-base">
          Get a sneak peek at what's coming to enhance your learning adventure
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const badge = getPriorityBadge(feature.priority);
          
          return (
            <motion.button
              key={feature.id}
              onClick={() => navigate(feature.route)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300 text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{feature.icon}</div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
                    {badge.text}
                  </span>
                  <span className="text-xs text-slate-400">{feature.expectedDate}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-sm text-slate-300 mb-3">
                {feature.description}
              </p>

              <div className="flex items-center justify-between">
                <div className={`h-1 w-full bg-gradient-to-r ${getPriorityColor(feature.priority)} rounded-full opacity-60`} />
                <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">Learn More →</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-6 text-center"
      >
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
          <p className="text-slate-300 text-sm mb-3">
            Want to see all upcoming features?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate('/app/coming-soon')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-300 text-sm"
            >
              🚀 View All Features
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all duration-300 text-sm">
              📧 Get Updates
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};