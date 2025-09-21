import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../modern-ui/GlassCard';
import Avatar3D from '../3d/Avatar3D';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useContextualSounds } from '../../hooks/useContextualSounds';
import type { Character, AvatarConfig } from '../../types/character';

interface ModernCharacterCustomizationProps {
  character: Character;
  onSave: (avatarConfig: AvatarConfig) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const customizationOptions = {
  hairStyle: [
    { id: 'short', name: 'Short', preview: '✂️', description: 'Clean and professional' },
    { id: 'long', name: 'Long', preview: '💇', description: 'Flowing and elegant' },
    { id: 'curly', name: 'Curly', preview: '🌀', description: 'Bouncy and fun' },
    { id: 'braided', name: 'Braided', preview: '🎀', description: 'Intricate and stylish' },
    { id: 'spiky', name: 'Spiky', preview: '⚡', description: 'Bold and edgy' },
    { id: 'wavy', name: 'Wavy', preview: '🌊', description: 'Natural and relaxed' },
  ],
  hairColor: [
    { id: 'brown', name: 'Brown', color: '#8B4513', description: 'Natural earth tone' },
    { id: 'black', name: 'Black', color: '#2C2C2C', description: 'Classic and timeless' },
    { id: 'blonde', name: 'Blonde', color: '#FFD700', description: 'Bright and cheerful' },
    { id: 'red', name: 'Red', color: '#CD853F', description: 'Fiery and passionate' },
    { id: 'white', name: 'White', color: '#F5F5F5', description: 'Wise and distinguished' },
    { id: 'blue', name: 'Blue', color: '#4169E1', description: 'Cool and mystical' },
    { id: 'purple', name: 'Purple', color: '#8A2BE2', description: 'Royal and magical' },
    { id: 'green', name: 'Green', color: '#228B22', description: 'Natural and vibrant' },
  ],
  skinTone: [
    { id: 'pale', name: 'Pale', color: '#F7E7CE', description: 'Light and delicate' },
    { id: 'light', name: 'Light', color: '#FDBCB4', description: 'Warm and gentle' },
    { id: 'medium', name: 'Medium', color: '#E0AC69', description: 'Balanced and natural' },
    { id: 'dark', name: 'Dark', color: '#C68642', description: 'Rich and warm' },
    { id: 'deep', name: 'Deep', color: '#8B4513', description: 'Deep and beautiful' },
  ],
  eyeColor: [
    { id: 'brown', name: 'Brown', color: '#8B4513', description: 'Warm and inviting' },
    { id: 'blue', name: 'Blue', color: '#4169E1', description: 'Clear and bright' },
    { id: 'green', name: 'Green', color: '#228B22', description: 'Mysterious and alluring' },
    { id: 'hazel', name: 'Hazel', color: '#DAA520', description: 'Multi-toned and unique' },
    { id: 'gray', name: 'Gray', color: '#708090', description: 'Subtle and sophisticated' },
    { id: 'violet', name: 'Violet', color: '#8A2BE2', description: 'Rare and enchanting' },
  ],
  outfit: [
    { id: 'casual', name: 'Casual', preview: '👕', description: 'Comfortable everyday wear' },
    { id: 'formal', name: 'Formal', preview: '👔', description: 'Professional and polished' },
    { id: 'adventurer', name: 'Adventurer', preview: '🧥', description: 'Ready for exploration' },
    { id: 'scholar', name: 'Scholar', preview: '🎓', description: 'Academic and studious' },
    { id: 'artist', name: 'Artist', preview: '🎨', description: 'Creative and expressive' },
    { id: 'explorer', name: 'Explorer', preview: '🗺️', description: 'Built for discovery' },
    { id: 'mystic', name: 'Mystic', preview: '🔮', description: 'Magical and mysterious' },
    { id: 'warrior', name: 'Warrior', preview: '⚔️', description: 'Strong and protective' },
  ],
  accessories: [
    { id: 'glasses', name: 'Glasses', preview: '👓', description: 'Intellectual and stylish' },
    { id: 'hat', name: 'Hat', preview: '🎩', description: 'Classic and distinguished' },
    { id: 'necklace', name: 'Necklace', preview: '📿', description: 'Elegant and refined' },
    { id: 'earrings', name: 'Earrings', preview: '💎', description: 'Sparkling and beautiful' },
    { id: 'watch', name: 'Watch', preview: '⌚', description: 'Practical and sophisticated' },
    { id: 'bracelet', name: 'Bracelet', preview: '📿', description: 'Delicate and charming' },
    { id: 'cape', name: 'Cape', preview: '🦸', description: 'Heroic and dramatic' },
    { id: 'crown', name: 'Crown', preview: '👑', description: 'Royal and majestic' },
  ],
};

export function ModernCharacterCustomization({
  character,
  onSave,
  onCancel,
  isLoading = false
}: ModernCharacterCustomizationProps) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(character.avatarConfig);
  const [activeTab, setActiveTab] = useState<keyof typeof customizationOptions>('hairStyle');
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('3d');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { playSound } = useContextualSounds();
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const handleOptionSelect = (category: keyof AvatarConfig, value: string) => {
    playSound('ui_click');
    setIsTransitioning(true);
    
    if (category === 'accessories') {
      const currentAccessories = avatarConfig.accessories || [];
      const newAccessories = currentAccessories.includes(value)
        ? currentAccessories.filter(acc => acc !== value)
        : [...currentAccessories, value];
      
      setAvatarConfig(prev => ({
        ...prev,
        accessories: newAccessories
      }));
    } else {
      setAvatarConfig(prev => ({
        ...prev,
        [category]: value
      }));
    }

    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTabChange = (tab: keyof typeof customizationOptions) => {
    playSound('ui_tab_switch');
    setActiveTab(tab);
  };

  const handleSave = async () => {
    try {
      playSound('ui_success');
      await onSave(avatarConfig);
    } catch (error) {
      playSound('ui_error');
      console.error('Failed to save avatar configuration:', error);
    }
  };

  const handleCancel = () => {
    playSound('ui_cancel');
    onCancel();
  };

  const previewCharacter: Character = {
    ...character,
    avatarConfig
  };

  const tabs = [
    { key: 'hairStyle', label: 'Hair Style', icon: '💇', color: 'from-pink-500 to-rose-500' },
    { key: 'hairColor', label: 'Hair Color', icon: '🎨', color: 'from-purple-500 to-indigo-500' },
    { key: 'skinTone', label: 'Skin Tone', icon: '👤', color: 'from-amber-500 to-orange-500' },
    { key: 'eyeColor', label: 'Eye Color', icon: '👁️', color: 'from-blue-500 to-cyan-500' },
    { key: 'outfit', label: 'Outfit', icon: '👕', color: 'from-green-500 to-emerald-500' },
    { key: 'accessories', label: 'Accessories', icon: '💎', color: 'from-yellow-500 to-amber-500' },
  ] as const;

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
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <GlassCard blur="lg" opacity={0.1} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Customize Your Character
                </h1>
                <p className="text-slate-300">
                  Create your unique avatar with modern styling options
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 py-3 bg-slate-600/50 backdrop-blur-sm hover:bg-slate-500/50 text-white rounded-xl transition-all duration-300 disabled:opacity-50 border border-slate-500/30"
                >
                  Cancel
                </motion.button>
                <motion.button
                  ref={saveButtonRef}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-primary-500/25"
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
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Character Preview */}
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <GlassCard blur="md" opacity={0.1} className="p-6 h-fit sticky top-6">
              <div className="text-center">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-white">Preview</h3>
                  <div className="flex bg-slate-700/50 rounded-lg p-1">
                    <button
                      onClick={() => setPreviewMode('2d')}
                      className={`px-3 py-1 rounded-md text-sm transition-all ${
                        previewMode === '2d'
                          ? 'bg-primary-500 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      2D
                    </button>
                    <button
                      onClick={() => setPreviewMode('3d')}
                      className={`px-3 py-1 rounded-md text-sm transition-all ${
                        previewMode === '3d'
                          ? 'bg-primary-500 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      3D
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewMode}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                    className="mb-6"
                  >
                    {previewMode === '3d' ? (
                      <div className="h-64 w-full">
                        <Avatar3D
                          character={previewCharacter}
                          interactive={true}
                          lighting="dramatic"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                          {character.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  animate={isTransitioning ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-slate-300 space-y-2"
                >
                  <p className="font-medium text-white text-xl">{character.name}</p>
                  <p className="text-sm">Level {character.level}</p>
                  {character.specialization && (
                    <p className="text-sm text-purple-400 capitalize">
                      {character.specialization}
                    </p>
                  )}
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Customization Options */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <GlassCard blur="md" opacity={0.1} className="p-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-3 mb-8">
                {tabs.map(tab => (
                  <motion.button
                    key={tab.key}
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    onClick={() => handleTabChange(tab.key)}
                    className={`relative px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${
                      activeTab === tab.key
                        ? 'text-white shadow-lg'
                        : 'text-slate-300 hover:text-white bg-slate-700/30 hover:bg-slate-600/30'
                    }`}
                  >
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                      />
                    )}
                    <span className="relative text-xl">{tab.icon}</span>
                    <span className="relative font-medium hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Options Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                >
                  <h3 className="text-2xl font-semibold text-white mb-6 capitalize">
                    {tabs.find(tab => tab.key === activeTab)?.label}
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {customizationOptions[activeTab].map((option, index) => {
                      const isSelected = activeTab === 'accessories'
                        ? avatarConfig.accessories?.includes(option.id)
                        : avatarConfig[activeTab] === option.id;

                      return (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: prefersReducedMotion ? 0.1 : 0.3,
                            delay: prefersReducedMotion ? 0 : index * 0.05
                          }}
                          whileHover={{ 
                            scale: prefersReducedMotion ? 1 : 1.05,
                            y: prefersReducedMotion ? 0 : -2
                          }}
                          whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                          onClick={() => handleOptionSelect(activeTab, option.id)}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
                            isSelected
                              ? 'border-primary-400 bg-primary-500/20 shadow-lg shadow-primary-500/25'
                              : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50 hover:bg-slate-600/30'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          )}
                          
                          <div className="text-center">
                            {'color' in option ? (
                              <div
                                className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-slate-400/50 shadow-lg"
                                style={{ backgroundColor: option.color }}
                              />
                            ) : (
                              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                {option.preview}
                              </div>
                            )}
                            <div className="text-sm text-white font-medium mb-1">
                              {option.name}
                            </div>
                            {'description' in option && (
                              <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}