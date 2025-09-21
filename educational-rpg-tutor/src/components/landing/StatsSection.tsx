import React from 'react';
import { motion } from 'framer-motion';

export const StatsSection: React.FC = () => {
  const stats = [
    { number: '50K+', label: 'Active Learners', icon: '👨‍🎓' },
    { number: '1M+', label: 'Quests Completed', icon: '⚔️' },
    { number: '95%', label: 'Success Rate', icon: '🎯' },
    { number: '24/7', label: 'AI Support', icon: '🤖' },
  ];

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-rpg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Join a thriving community of learners who have transformed their educational journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100
              }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 10
              }}
              className="text-center group"
            >
              <div className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl mb-4"
                >
                  {stat.icon}
                </motion.div>

                {/* Number */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
                >
                  <CountUpNumber target={stat.number} />
                </motion.div>

                {/* Label */}
                <div className="text-slate-300 font-medium group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Simple count-up animation component
const CountUpNumber: React.FC<{ target: string }> = ({ target }) => {
  const [count, setCount] = React.useState(0);
  const isNumber = /^\d+/.test(target);
  const numericValue = isNumber ? parseInt(target.replace(/\D/g, '')) : 0;
  const suffix = target.replace(/^\d+/, '');

  React.useEffect(() => {
    if (!isNumber) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue, isNumber]);

  if (!isNumber) return <span>{target}</span>;

  return <span>{count.toLocaleString()}{suffix}</span>;
};