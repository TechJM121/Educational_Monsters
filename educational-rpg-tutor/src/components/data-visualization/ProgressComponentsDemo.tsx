import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { AnimatedProgressRing } from './AnimatedProgressRing';
import { MorphingNumber } from './MorphingNumber';
import { StatCard } from './StatCard';

export const ProgressComponentsDemo: React.FC = () => {
  const [xpValue, setXpValue] = useState(750);
  const [healthValue, setHealthValue] = useState(85);
  const [manaValue, setManaValue] = useState(60);
  const [level, setLevel] = useState(12);
  const [score, setScore] = useState(2450);

  // Simulate dynamic value changes
  useEffect(() => {
    const interval = setInterval(() => {
      setXpValue(prev => Math.min(prev + Math.random() * 50, 1000));
      setHealthValue(prev => Math.max(Math.min(prev + (Math.random() - 0.5) * 20, 100), 0));
      setManaValue(prev => Math.max(Math.min(prev + (Math.random() - 0.5) * 15, 100), 0));
      
      // Occasionally level up
      if (Math.random() < 0.1) {
        setLevel(prev => prev + 1);
      }
      
      setScore(prev => prev + Math.floor(Math.random() * 100));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const resetValues = () => {
    setXpValue(0);
    setHealthValue(100);
    setManaValue(100);
    setLevel(1);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Interactive Progress Components
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Animated progress bars, rings, and stat cards with smooth transitions
          </p>
          
          <motion.button
            onClick={resetValues}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset Values
          </motion.button>
        </motion.div>

        {/* Progress Bars Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Animated Progress Bars
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <AnimatedProgressBar
                value={xpValue}
                max={1000}
                label="Experience Points"
                color="primary"
                size="lg"
                tooltip="XP gained from completing quests and challenges"
              />
            </div>
            
            <div className="p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <AnimatedProgressBar
                value={healthValue}
                max={100}
                label="Health"
                color="success"
                size="md"
                tooltip="Current health status"
              />
            </div>
            
            <div className="p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <AnimatedProgressBar
                value={manaValue}
                max={100}
                label="Mana"
                color="secondary"
                size="md"
                tooltip="Magical energy for casting spells"
              />
            </div>
            
            <div className="p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <AnimatedProgressBar
                value={75}
                max={100}
                label="Quest Progress"
                color="warning"
                size="sm"
                tooltip="Progress on current quest objectives"
              />
            </div>
          </div>
        </motion.section>

        {/* Progress Rings Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Animated Progress Rings
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <AnimatedProgressRing
                value={xpValue}
                max={1000}
                color="primary"
                size={120}
                strokeWidth={8}
                label="XP"
                tooltip="Experience Points"
              />
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <AnimatedProgressRing
                value={healthValue}
                max={100}
                color="success"
                size={120}
                strokeWidth={8}
                label="HP"
                tooltip="Health Points"
              />
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <AnimatedProgressRing
                value={manaValue}
                max={100}
                color="secondary"
                size={120}
                strokeWidth={8}
                label="MP"
                tooltip="Mana Points"
              />
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <AnimatedProgressRing
                value={88}
                max={100}
                color="warning"
                size={120}
                strokeWidth={8}
                label="Skill"
                tooltip="Skill Mastery"
              />
            </div>
          </div>
        </motion.section>

        {/* Morphing Numbers Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Morphing Numbers
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Level</div>
              <MorphingNumber
                value={level}
                className="text-4xl font-bold text-blue-600 dark:text-blue-400"
                animateOnChange={true}
              />
            </div>
            
            <div className="text-center p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Score</div>
              <MorphingNumber
                value={score}
                format={(val) => val.toLocaleString()}
                className="text-4xl font-bold text-green-600 dark:text-green-400"
                animateOnChange={true}
              />
            </div>
            
            <div className="text-center p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Accuracy</div>
              <MorphingNumber
                value={92.5}
                decimals={1}
                suffix="%"
                className="text-4xl font-bold text-purple-600 dark:text-purple-400"
                animateOnChange={true}
              />
            </div>
            
            <div className="text-center p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-white/30">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coins</div>
              <MorphingNumber
                value={1250}
                format={(val) => val.toLocaleString()}
                prefix="🪙 "
                className="text-4xl font-bold text-yellow-600 dark:text-yellow-400"
                animateOnChange={true}
              />
            </div>
          </div>
        </motion.section>

        {/* Stat Cards Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Interactive Stat Cards
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Experience Points"
              value={xpValue}
              maxValue={1000}
              icon="⚡"
              trend="up"
              trendValue={12.5}
              showProgress={true}
              progressType="bar"
              color="primary"
              tooltip="XP gained from completing educational challenges"
            />
            
            <StatCard
              title="Learning Streak"
              value={15}
              icon="🔥"
              trend="up"
              trendValue={25.0}
              format={(val) => `${val} days`}
              color="warning"
              tooltip="Consecutive days of learning activity"
            />
            
            <StatCard
              title="Skill Mastery"
              value={88}
              maxValue={100}
              icon="🎯"
              trend="up"
              trendValue={8.2}
              showProgress={true}
              progressType="ring"
              color="success"
              tooltip="Overall skill proficiency across all subjects"
            />
            
            <StatCard
              title="Total Score"
              value={score}
              icon="🏆"
              trend="up"
              trendValue={15.3}
              format={(val) => val.toLocaleString()}
              color="secondary"
              tooltip="Cumulative points earned from all activities"
            />
            
            <StatCard
              title="Achievements"
              value={23}
              icon="🏅"
              trend="neutral"
              trendValue={0}
              color="warning"
              tooltip="Badges and achievements unlocked"
            />
            
            <StatCard
              title="Study Time"
              value={127}
              icon="⏱️"
              trend="up"
              trendValue={18.7}
              format={(val) => `${val}h`}
              color="primary"
              tooltip="Total time spent in learning activities this month"
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
};