import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../modern-ui/GlassCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useContextualSounds } from '../../hooks/useContextualSounds';
import type { Monster, MonsterCustomization, UnlockableItem } from '../../types/monster';
import { MONSTER_UNLOCKABLES, getUnlockablesByType, getAvailableUnlocks } from '../../data/monsterUnlockables';

interface MonsterCustomizationModalProps {
  monster: Monster;
  unlockedItems: string[];
  playerLevel: number;
  playerXP: number;
  playerAchievements: string[];
  onSave: (customization: MonsterCustomization) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const customizationTabs = [
  { key: 'colors', label: 'Colors', icon: '🎨', description: 'Primary, secondary, and accent colors' },
  { key: 'patterns', label: 'Patterns', icon: '🌟', description: 'Surface patterns and textures' },
  { key: 'bodyParts', label: 'Body Parts', icon: '🦋', description: 'Wings, horns, tails, and more' },
  { key: 'accessories', label: 'Accessories', icon: '👑', description: 'Hats, collars, and jewelry' },
  { key: 'effects', label: 'Effects', icon: '✨', description: 'Magical auras and particles' },
  { key: 'size', label: 'Size', icon: '📏', description: 'Monster size modifications' },
] as const;

const colorPalettes = {
  basic: [
    { name: 'Crimson', value: '#DC2626', unlockId: 'color_crimson' },
    { name: 'Sapphire', value: '#2563EB', unlockId: 'color_sapphire' },
    { name: 'Emerald', value: '#059669', unlockId: 'color_emerald' },
    { name: 'Sunset', value: '#EA580C', unlockId: 'color_sunset' },
    { name: 'Amethyst', value: '#9333EA', unlockId: 'color_amethyst' },
  ],
  magical: [
    { name: 'Rainbow', value: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)', unlockId: 'color_rainbow' },
    { name: 'Galaxy', value: 'radial-gradient(circle, #1a1a2e, #16213e, #0f3460)', unlockId: 'color_galaxy' },
  ]
};

export function MonsterCustomizationModal({
  monster,
  unlockedItems,
  playerLevel,
  playerXP,
  playerAchievements,
  onSave,
  onCancel,
  isLoading = false
}: MonsterCustomizationModalProps) {
  const [customization, setCustomization] = useState<MonsterCustomization>(monster.customization);
  const [activeTab, setActiveTab] = useState<typeof customizationTabs[number]['key']>('colors');

  const [showUnlockHints, setShowUnlockHints] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { playContextualSound } = useContextualSounds();
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const availableUnlocks = getAvailableUnlocks(playerLevel, playerXP, playerAchievements, monster.bond);
  const allUnlockableItems = [...unlockedItems, ...availableUnlocks.map(item => item.id)];

  const handleCustomizationChange = (category: keyof MonsterCustomization, value: any) => {
    playContextualSound('ui_click');
    setCustomization(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleTabChange = (tab: typeof customizationTabs[number]['key']) => {
    playContextualSound('ui_tab_switch');
    setActiveTab(tab);
  };

  const handleSave = async () => {
    try {
      playContextualSound('ui_success');
      await onSave(customization);
    } catch (error) {
      playContextualSound('ui_error');
      console.error('Failed to save monster customization:', error);
    }
  };

  const handleCancel = () => {
    playContextualSound('ui_cancel');
    onCancel();
  };

  const isItemUnlocked = (unlockId: string): boolean => {
    return allUnlockableItems.includes(unlockId);
  };

  const getUnlockableItem = (unlockId: string): UnlockableItem | undefined => {
    return MONSTER_UNLOCKABLES.find(item => item.id === unlockId);
  };

  const renderColorPicker = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Primary Color</h4>
        <div className="grid grid-cols-5 gap-3">
          {colorPalettes.basic.map((color) => {
            const isUnlocked = isItemUnlocked(color.unlockId);
            const unlockableItem = getUnlockableItem(color.unlockId);
            
            return (
              <motion.button
                key={color.unlockId}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                onClick={() => isUnlocked && handleCustomizationChange('primaryColor', color.value)}
                disabled={!isUnlocked}
                className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  customization.primaryColor === color.value
                    ? 'border-white shadow-lg scale-110'
                    : 'border-slate-400/50'
                } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-white'}`}
                style={{ backgroundColor: color.value }}
                title={isUnlocked ? color.name : `Locked: ${unlockableItem?.unlockCondition.description}`}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <span className="text-white text-xs">🔒</span>
                  </div>
                )}
                {customization.primaryColor === color.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Magical Colors</h4>
        <div className="grid grid-cols-3 gap-4">
          {colorPalettes.magical.map((color) => {
            const isUnlocked = isItemUnlocked(color.unlockId);
            const unlockableItem = getUnlockableItem(color.unlockId);
            
            return (
              <motion.button
                key={color.unlockId}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                onClick={() => isUnlocked && handleCustomizationChange('primaryColor', color.value)}
                disabled={!isUnlocked}
                className={`relative h-16 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  customization.primaryColor === color.value
                    ? 'border-white shadow-lg scale-105'
                    : 'border-slate-400/50'
                } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-white'}`}
                style={{ background: color.value }}
                title={isUnlocked ? color.name : `Locked: ${unlockableItem?.unlockCondition.description}`}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔒</div>
                      <div className="text-xs text-white">{unlockableItem?.rarity}</div>
                    </div>
                  </div>
                )}
                {customization.primaryColor === color.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-xs font-medium text-white bg-black/50 rounded px-2 py-1 text-center">
                    {color.name}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderUnlockableGrid = (type: string) => {
    const items = getUnlockablesByType(type);
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isUnlocked = isItemUnlocked(item.id);
          const isSelected = false; // TODO: Implement selection logic based on type
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: prefersReducedMotion ? 1 : 1.05,
                y: prefersReducedMotion ? 0 : -2
              }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              onClick={() => {
                if (isUnlocked) {
                  // TODO: Apply the unlockable based on type
                  playContextualSound('ui_select');
                }
              }}
              disabled={!isUnlocked}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
                isSelected
                  ? 'border-primary-400 bg-primary-500/20 shadow-lg shadow-primary-500/25'
                  : isUnlocked
                  ? 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50 hover:bg-slate-600/30'
                  : 'border-slate-700/30 bg-slate-800/30 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Rarity indicator */}
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                item.rarity === 'common' ? 'bg-gray-400' :
                item.rarity === 'uncommon' ? 'bg-green-400' :
                item.rarity === 'rare' ? 'bg-blue-400' :
                item.rarity === 'epic' ? 'bg-purple-400' :
                item.rarity === 'legendary' ? 'bg-yellow-400' :
                'bg-pink-400'
              }`} />

              {/* Lock overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="text-xs text-white px-2">
                      {item.unlockCondition.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
              
              <div className="text-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div className="text-sm text-white font-medium mb-1">
                  {item.name}
                </div>
                <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colors':
        return renderColorPicker();
      case 'patterns':
        return renderUnlockableGrid('pattern');
      case 'bodyParts':
        return renderUnlockableGrid('bodyPart');
      case 'accessories':
        return renderUnlockableGrid('accessory');
      case 'effects':
        return renderUnlockableGrid('effect');
      case 'size':
        return renderUnlockableGrid('size');
      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.6,
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        variants={itemVariants}
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        <GlassCard blur="lg" opacity={0.1} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Customize {monster.name}
              </h2>
              <p className="text-slate-300">
                Personalize your monster companion with unlockable features
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                onClick={() => setShowUnlockHints(!showUnlockHints)}
                className="px-4 py-2 bg-slate-600/50 backdrop-blur-sm hover:bg-slate-500/50 text-white rounded-xl transition-all duration-300 border border-slate-500/30"
              >
                {showUnlockHints ? '🔍 Hide Hints' : '💡 Show Hints'}
              </motion.button>
              <motion.button
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-2 bg-slate-600/50 backdrop-blur-sm hover:bg-slate-500/50 text-white rounded-xl transition-all duration-300 disabled:opacity-50 border border-slate-500/30"
              >
                Cancel
              </motion.button>
              <motion.button
                ref={saveButtonRef}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                onClick={handleSave}
                disabled={isLoading}
                className="px-8 py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-primary-500/25"
              >
                {isLoading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                )}
                Save Changes
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Monster Preview */}
            <div className="xl:col-span-1">
              <GlassCard blur="md" opacity={0.1} className="p-4 h-fit sticky top-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Preview</h3>
                  
                  {/* Monster Avatar Placeholder */}
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl shadow-xl">
                    {monster.species === 'dragon' ? '🐲' : 
                     monster.species === 'phoenix' ? '🔥🦅' :
                     monster.species === 'unicorn' ? '🦄' :
                     monster.species === 'fox' ? '🦊' : '🐾'}
                  </div>
                  
                  <div className="text-slate-300 space-y-2">
                    <p className="font-medium text-white text-lg">{monster.name}</p>
                    <p className="text-sm">Level {monster.level} {monster.species}</p>
                    <p className="text-sm text-purple-400">Bond: {monster.bond}%</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Customization Options */}
            <div className="xl:col-span-3">
              <GlassCard blur="md" opacity={0.1} className="p-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {customizationTabs.map(tab => (
                    <motion.button
                      key={tab.key}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                      onClick={() => handleTabChange(tab.key)}
                      className={`relative px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                        activeTab === tab.key
                          ? 'text-white shadow-lg bg-gradient-to-r from-primary-600 to-primary-500'
                          : 'text-slate-300 hover:text-white bg-slate-700/30 hover:bg-slate-600/30'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{tab.label}</div>
                        <div className="text-xs opacity-75 hidden sm:block">{tab.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                    className="min-h-[400px]"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </GlassCard>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}