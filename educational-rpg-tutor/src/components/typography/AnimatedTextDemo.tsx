import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './TypewriterText';
import { TextReveal } from './TextReveal';
import { GradientText } from './GradientText';
import { AnimatedUnderline } from './AnimatedUnderline';

/**
 * Demo component showcasing all animated text effects
 */
export const AnimatedTextDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('typewriter');

  const demoSections = [
    { id: 'typewriter', title: 'Typewriter Effects' },
    { id: 'reveal', title: 'Text Reveal Animations' },
    { id: 'gradient', title: 'Gradient Text Effects' },
    { id: 'underline', title: 'Animated Underlines' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          <GradientText gradient="cosmic" animated animationType="shimmer">
            Animated Text Effects
          </GradientText>
        </h1>
        <p className="text-gray-600 text-lg">
          Explore modern typography animations and effects
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {demoSections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveDemo(section.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeDemo === section.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Typewriter Effects */}
      {activeDemo === 'typewriter' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-bold mb-6">Typewriter Effects</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Basic Typewriter</h3>
              <TypewriterText
                text="Welcome to the Educational RPG Tutor!"
                speed={80}
                className="text-xl text-gray-800"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Fast Typewriter</h3>
              <TypewriterText
                text="Level up your learning with interactive quests!"
                speed={30}
                className="text-xl text-blue-600"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Looping Text</h3>
              <TypewriterText
                text={[
                  "Master new skills",
                  "Earn experience points",
                  "Unlock achievements",
                  "Become a learning hero!"
                ]}
                speed={60}
                loop
                pauseDuration={1500}
                className="text-xl text-green-600"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Custom Cursor</h3>
              <TypewriterText
                text="Customize your learning journey"
                speed={70}
                cursorChar="▋"
                className="text-xl text-purple-600"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Text Reveal Animations */}
      {activeDemo === 'reveal' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-bold mb-6">Text Reveal Animations</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Fade Up (Characters)</h3>
              <TextReveal
                text="Character by character reveal"
                animation="fadeUp"
                stagger={0.05}
                className="text-xl text-gray-800"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Slide Left (Words)</h3>
              <TextReveal
                text="Word by word animation effect"
                animation="slideLeft"
                splitBy="word"
                stagger={0.1}
                className="text-xl text-blue-600"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Scale Animation</h3>
              <TextReveal
                text="Scaling text animation"
                animation="scale"
                stagger={0.08}
                className="text-xl text-green-600"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Blur Effect</h3>
              <TextReveal
                text="Blur to focus transition"
                animation="blur"
                stagger={0.06}
                className="text-xl text-purple-600"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Gradient Text Effects */}
      {activeDemo === 'gradient' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-bold mb-6">Gradient Text Effects</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Rainbow Shimmer</h3>
              <GradientText
                gradient="rainbow"
                animated
                animationType="shimmer"
                className="text-2xl font-bold"
              >
                Rainbow Gradient
              </GradientText>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Ocean Wave</h3>
              <GradientText
                gradient="ocean"
                animated
                animationType="wave"
                className="text-2xl font-bold"
              >
                Ocean Waves
              </GradientText>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Fire Pulse</h3>
              <GradientText
                gradient="fire"
                animated
                animationType="pulse"
                className="text-2xl font-bold"
              >
                Fire Effect
              </GradientText>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Cosmic Flow</h3>
              <GradientText
                gradient="cosmic"
                animated
                animationType="flow"
                className="text-2xl font-bold"
              >
                Cosmic Energy
              </GradientText>
            </div>
          </div>
        </motion.div>
      )}

      {/* Animated Underlines */}
      {activeDemo === 'underline' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-bold mb-6">Animated Underlines</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Expand on Hover</h3>
              <AnimatedUnderline
                animationType="expand"
                color="#3b82f6"
                thickness={3}
                className="text-xl text-gray-800 cursor-pointer"
              >
                Hover to see underline expand
              </AnimatedUnderline>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Slide Animation</h3>
              <AnimatedUnderline
                animationType="slide"
                color="#10b981"
                thickness={2}
                className="text-xl text-gray-800 cursor-pointer"
              >
                Sliding underline effect
              </AnimatedUnderline>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Wavy Underline</h3>
              <AnimatedUnderline
                underlineType="wavy"
                animationType="draw"
                color="#8b5cf6"
                thickness={2}
                className="text-xl text-gray-800 cursor-pointer"
              >
                Wavy animated underline
              </AnimatedUnderline>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Gradient Bounce</h3>
              <AnimatedUnderline
                underlineType="gradient"
                animationType="bounce"
                gradient="linear-gradient(90deg, #ff6b6b, #ffa726)"
                thickness={4}
                className="text-xl text-gray-800 cursor-pointer"
              >
                Gradient bouncing underline
              </AnimatedUnderline>
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Examples */}
      <div className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Usage in Educational Context</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Quest Introduction</h3>
            <TypewriterText
              text="A new quest awaits! Are you ready to embark on your learning journey?"
              speed={50}
              className="text-lg text-blue-700"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Achievement Unlock</h3>
            <TextReveal
              text="🏆 ACHIEVEMENT UNLOCKED: Master of Mathematics!"
              animation="scale"
              stagger={0.1}
              splitBy="word"
              className="text-lg text-yellow-600 font-bold"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Level Up Celebration</h3>
            <GradientText
              gradient="rainbow"
              animated
              animationType="shimmer"
              className="text-2xl font-bold"
            >
              🎉 LEVEL UP! You've reached Level 5! 🎉
            </GradientText>
          </div>
        </div>
      </div>
    </div>
  );
};