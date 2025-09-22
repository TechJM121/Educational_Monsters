import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText, ResponsiveCard } from '../components/shared/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

export const CharacterPage: React.FC = () => {
  const { isMobile } = useResponsive();

  const stats = [
    { name: 'Intelligence', value: 10, max: 20, icon: '🧠' },
    { name: 'Creativity', value: 8, max: 20, icon: '🎨' },
    { name: 'Focus', value: 12, max: 20, icon: '🎯' },
    { name: 'Memory', value: 9, max: 20, icon: '🧩' }
  ];

  const equipment = [
    { slot: 'Weapon', item: 'Pencil of Power', icon: '✏️' },
    { slot: 'Armor', item: 'Backpack of Holding', icon: '🎒' },
    { slot: 'Accessory', item: 'Glasses of Wisdom', icon: '👓' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ResponsiveContainer maxWidth="xl" padding="md" animate>
        <div className="text-center mb-6 lg:mb-8">
          <ResponsiveText 
            as="h1" 
            size="3xl" 
            weight="bold" 
            className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-4"
          >
            🧙‍♂️ Character Sheet
          </ResponsiveText>
          <ResponsiveText size="lg" className="text-slate-300">
            Manage your character's stats, abilities, and appearance
          </ResponsiveText>
        </div>

        <ResponsiveGrid columns={isMobile ? 1 : 3} gap="lg">
          {/* Character Avatar */}
          <ResponsiveCard padding="md">
            <ResponsiveText as="h2" size="xl" weight="bold" className="text-white mb-4 text-center">
              Avatar
            </ResponsiveText>
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center text-4xl lg:text-6xl mx-auto mb-4">
              👤
            </div>
            <ResponsiveText size="base" className="text-center text-slate-300 mb-4">
              Guest Explorer
            </ResponsiveText>
            <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium touch-target">
              Customize Avatar
            </button>
          </ResponsiveCard>

          {/* Stats */}
          <ResponsiveCard padding="md">
            <ResponsiveText as="h2" size="xl" weight="bold" className="text-white mb-4">
              Stats
            </ResponsiveText>
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <ResponsiveText size="sm" className="text-slate-300 flex items-center gap-2">
                      <span className="text-lg">{stat.icon}</span>
                      {stat.name}
                    </ResponsiveText>
                    <ResponsiveText size="sm" weight="bold" className="text-white">
                      {stat.value}/{stat.max}
                    </ResponsiveText>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stat.value / stat.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ResponsiveCard>

          {/* Equipment */}
          <ResponsiveCard padding="md">
            <ResponsiveText as="h2" size="xl" weight="bold" className="text-white mb-4">
              Equipment
            </ResponsiveText>
            <div className="space-y-3">
              {equipment.map((item) => (
                <div key={item.slot} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl lg:text-2xl">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <ResponsiveText size="sm" weight="medium" className="text-white truncate">
                        {item.item}
                      </ResponsiveText>
                      <ResponsiveText size="xs" className="text-slate-400">
                        {item.slot}
                      </ResponsiveText>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>
      </ResponsiveContainer>
    </div>
  );
};