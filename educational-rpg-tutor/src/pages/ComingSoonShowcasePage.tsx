import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FeatureCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  features: ComingSoonFeature[];
}

interface ComingSoonFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  expectedDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planning' | 'development' | 'testing' | 'soon';
}

export const ComingSoonShowcasePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: FeatureCategory[] = [
    {
      id: 'learning',
      name: 'Learning & AI',
      icon: '🧠',
      color: 'from-blue-500 to-cyan-400',
      features: [
        {
          id: 'ai-personalization',
          title: 'AI Personalization',
          description: 'Advanced AI that adapts to your unique learning style',
          icon: '🤖',
          route: '/app/ai-personalization',
          expectedDate: 'Q2 2025',
          priority: 'high',
          status: 'development'
        },
        {
          id: 'advanced-analytics',
          title: 'Advanced Analytics',
          description: 'Deep insights into learning patterns and progress',
          icon: '📊',
          route: '/app/advanced-analytics',
          expectedDate: 'Q3 2025',
          priority: 'medium',
          status: 'planning'
        },
        {
          id: 'vr-learning',
          title: 'VR Learning',
          description: 'Immersive virtual reality educational experiences',
          icon: '🥽',
          route: '/app/vr-learning',
          expectedDate: '2026',
          priority: 'low',
          status: 'planning'
        }
      ]
    },
    {
      id: 'social',
      name: 'Social & Multiplayer',
      icon: '👥',
      color: 'from-green-500 to-emerald-400',
      features: [
        {
          id: 'social-hub',
          title: 'Social Learning Hub',
          description: 'Connect with friends and learn together',
          icon: '👥',
          route: '/app/social-hub',
          expectedDate: 'Q2 2025',
          priority: 'medium',
          status: 'development'
        },
        {
          id: 'multiplayer',
          title: 'Multiplayer Adventures',
          description: 'Team up for epic learning quests and battles',
          icon: '⚔️',
          route: '/app/multiplayer',
          expectedDate: 'Summer 2025',
          priority: 'medium',
          status: 'planning'
        }
      ]
    },
    {
      id: 'education',
      name: 'Education Tools',
      icon: '🎓',
      color: 'from-purple-500 to-pink-400',
      features: [
        {
          id: 'teacher-portal',
          title: 'Teacher Portal',
          description: 'Comprehensive classroom management tools',
          icon: '👩‍🏫',
          route: '/app/teacher-portal',
          expectedDate: 'Q1 2025',
          priority: 'high',
          status: 'testing'
        }
      ]
    },
    {
      id: 'platform',
      name: 'Platform & Apps',
      icon: '📱',
      color: 'from-yellow-500 to-orange-400',
      features: [
        {
          id: 'mobile-app',
          title: 'Mobile Apps',
          description: 'Native iOS and Android apps with offline support',
          icon: '📱',
          route: '/app/mobile-app',
          expectedDate: 'Q4 2025',
          priority: 'medium',
          status: 'planning'
        },
        {
          id: 'premium-features',
          title: 'Premium Features',
          description: 'Unlock exclusive content and advanced features',
          icon: '💎',
          route: '/app/premium-features',
          expectedDate: 'Q1 2025',
          priority: 'high',
          status: 'development'
        }
      ]
    }
  ];

  const allFeatures = categories.flatMap(cat => cat.features);
  const filteredFeatures = selectedCategory === 'all' 
    ? allFeatures 
    : categories.find(cat => cat.id === selectedCategory)?.features || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'soon': return 'bg-green-500';
      case 'testing': return 'bg-blue-500';
      case 'development': return 'bg-yellow-500';
      case 'planning': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'soon': return 'Coming Soon';
      case 'testing': return 'In Testing';
      case 'development': return 'In Development';
      case 'planning': return 'Planned';
      default: return 'Future';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⭐';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-4">
            🚀 Future of Learning
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Discover the exciting features coming to Educational RPG Tutor
          </p>
          
          <button
            onClick={() => navigate('/app/home')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Features ({allFeatures.length})
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="text-xs bg-slate-600 px-2 py-0.5 rounded-full">
                  {category.features.length}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredFeatures.map((feature, index) => (
            <motion.button
              key={feature.id}
              onClick={() => navigate(feature.route)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 text-left group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{feature.icon}</div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(feature.status)}`}>
                    {getStatusText(feature.status)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{getPriorityIcon(feature.priority)}</span>
                    <span className="text-xs text-slate-400 capitalize">{feature.priority}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-sm">📅</span>
                  <span className="text-xs text-slate-400">{feature.expectedDate}</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Learn More →
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Want to be the first to know?
            </h2>
            <p className="text-slate-300 mb-6">
              Get notified when these exciting features launch and be among the first to experience the future of learning!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all duration-300">
                📧 Get Updates
              </button>
              <button 
                onClick={() => navigate('/app/home')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                🏠 Back to Learning
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};