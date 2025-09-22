import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText, ResponsiveCard } from '../components/shared/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

export const LearningPage: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();

  const subjects = [
    { title: 'Mathematics', icon: '🔢', color: 'from-blue-500 to-cyan-400' },
    { title: 'Science', icon: '🧪', color: 'from-green-500 to-emerald-400' },
    { title: 'Literature', icon: '📖', color: 'from-purple-500 to-pink-400' },
    { title: 'History', icon: '🏛️', color: 'from-yellow-500 to-orange-400' },
    { title: 'Geography', icon: '🌍', color: 'from-teal-500 to-blue-400' },
    { title: 'Art', icon: '🎨', color: 'from-pink-500 to-rose-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950">
      <ResponsiveContainer maxWidth="lg" padding="md" animate>
        <div className="text-center mb-6 lg:mb-8">
          <ResponsiveText 
            as="h1" 
            size="3xl" 
            weight="bold" 
            className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent mb-4"
          >
            📚 Learning Worlds
          </ResponsiveText>
          <ResponsiveText size="lg" className="text-slate-300">
            Embark on educational adventures across different subjects
          </ResponsiveText>
        </div>

        <ResponsiveGrid columns={isMobile ? 1 : isTablet ? 2 : 3} gap="md">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <ResponsiveCard padding="md" interactive className="cursor-pointer text-center">
                <div className={`w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r ${subject.color} rounded-xl flex items-center justify-center text-2xl lg:text-3xl mb-3 lg:mb-4 mx-auto`}>
                  {subject.icon}
                </div>
                <ResponsiveText 
                  as="h3" 
                  size="base" 
                  weight="semibold" 
                  className="text-white mb-2"
                >
                  {subject.title}
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-slate-400">
                  Coming Soon
                </ResponsiveText>
              </ResponsiveCard>
            </motion.div>
          ))}
        </ResponsiveGrid>
      </ResponsiveContainer>
    </div>
  );
};