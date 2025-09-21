import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const subjects = [
    { icon: '📚', name: 'Mathematics', color: 'from-blue-500 to-cyan-400', students: '12.5K' },
    { icon: '🧪', name: 'Science', color: 'from-green-500 to-emerald-400', students: '8.3K' },
    { icon: '📖', name: 'Literature', color: 'from-purple-500 to-pink-400', students: '9.7K' },
    { icon: '🌍', name: 'Geography', color: 'from-orange-500 to-red-400', students: '6.2K' },
    { icon: '🎨', name: 'Arts', color: 'from-pink-500 to-rose-400', students: '4.8K' },
    { icon: '💻', name: 'Technology', color: 'from-indigo-500 to-blue-400', students: '11.1K' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      {/* Animated Grid Background */}
      <motion.div 
        className="fixed inset-0 opacity-10"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </motion.div>

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 flex justify-between items-center p-6 backdrop-blur-sm bg-white/5 border-b border-white/10"
      >
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🚀</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              LearnCraft
            </h1>
            <p className="text-xs text-slate-400">Adventure Awaits</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-300">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {currentTime.toLocaleTimeString()}
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold shadow-lg transition-all duration-300"
          >
            Begin Journey
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
        style={{ y: heroY }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Master
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Every
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Subject
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Embark on personalized learning quests, unlock achievements, and level up your knowledge 
              in an immersive educational universe designed just for you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-white font-bold text-lg shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Start Learning Quest</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 border-2 border-blue-500 rounded-2xl text-blue-400 font-bold text-lg hover:bg-blue-500/10 transition-all duration-300 backdrop-blur-sm"
              >
                Explore Features
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Subject Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto"
          >
            {subjects.map((subject, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
                className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300 cursor-pointer group"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className={`w-12 h-12 bg-gradient-to-r ${subject.color} rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto shadow-lg`}
                >
                  {subject.icon}
                </motion.div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-sm text-slate-400">
                  {subject.students} students
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Why Choose LearnCraft?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience education reimagined with cutting-edge technology and gamification.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Adaptive Learning',
                description: 'AI-powered system that adapts to your learning pace and style for optimal results.',
                color: 'from-blue-500 to-cyan-400'
              },
              {
                icon: '⚡',
                title: 'Instant Feedback',
                description: 'Get real-time feedback and corrections to accelerate your learning journey.',
                color: 'from-purple-500 to-pink-400'
              },
              {
                icon: '🏆',
                title: 'Achievement System',
                description: 'Earn badges, unlock rewards, and track your progress across all subjects.',
                color: 'from-orange-500 to-red-400'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="backdrop-blur-md bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-blue-400/30 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="backdrop-blur-md bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-3xl p-12 border border-blue-500/20"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Ready to Level Up?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who have transformed their education into an exciting adventure.
            </p>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="px-12 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-white font-bold text-xl shadow-2xl transition-all duration-300"
            >
              Begin Your Adventure
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <span className="text-lg">🚀</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              LearnCraft
            </span>
          </div>
          <p className="text-slate-400">
            © 2025 LearnCraft. Crafting the future of education.
          </p>
        </div>
      </footer>
    </div>
  );
};