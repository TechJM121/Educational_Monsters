import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../modern-ui/GlassCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useContextualSounds } from '../../hooks/useContextualSounds';
import type { Monster, MonsterSpecies } from '../../types/monster';

interface MonsterCreationModalProps {
  onCreateMonster: (monster: Omit<Monster, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const availableSpecies: Array<{
  species: MonsterSpecies;
  name: string;
  emoji: string;
  rarity: string;
  description: string;
  baseStats: {
    strength: number;
    intelligence: number;
    agility: number;
    magic: number;
    loyalty: number;
    curiosity: number;
  };
}> = [
  {
    species: 'dragon',
    name: 'Dragon',
    emoji: '🐲',
    rarity: 'Epic',
    description: 'Powerful and wise, dragons excel in magic and strength.',
    baseStats: { strength: 20, intelligence: 18, agility: 12, magic: 25, loyalty: 15, curiosity: 16 }
  },
  {
    species: 'fox',
    name: 'Fox',
    emoji: '🦊',
    rarity: 'Common',
    description: 'Clever and agile, foxes are excellent companions for learning.',
    baseStats: { strength: 10, intelligence: 18, agility: 22, magic: 15, loyalty: 16, curiosity: 25 }
  },
  {
    species: 'wolf',
    name: 'Wolf',
    emoji: '🐺',
    rarity: 'Uncommon',
    description: 'Loyal and strong, wolves are protective companions.',
    baseStats: { strength: 18, intelligence: 16, agility: 20, magic: 12, loyalty: 25, curiosity: 15 }
  },
  {
    species: 'owl',
    name: 'Owl',
    emoji: '🦉',
    rarity: 'Rare',
    description: 'Wise and observant, owls excel in intelligence and magic.',
    baseStats: { strength: 8, intelligence: 25, agility: 14, magic: 20, loyalty: 18, curiosity: 22 }
  }
];

export function MonsterCreationModal({
  onCreateMonster,
  onCancel,
  isLoading = false
}: MonsterCreationModalProps) {
  const [selectedSpecies, setSelectedSpecies] = useState<MonsterSpecies | null>(null);
  const [monsterName, setMonsterName] = useState('');
  const [step, setStep] = useState<'species' | 'name' | 'confirm'>('species');
  const prefersReducedMotion = useReducedMotion();
  const { playContextualSound } = useContextualSounds();

  const selectedSpeciesData = availableSpecies.find(s => s.species === selectedSpecies);

  const handleSpeciesSelect = (species: MonsterSpecies) => {
    playContextualSound('ui_select');
    setSelectedSpecies(species);
    setStep('name');
  };

  const handleNameSubmit = () => {
    if (monsterName.trim()) {
      playContextualSound('ui_success');
      setStep('confirm');
    }
  };

  const handleCreateMonster = async () => {
    if (!selectedSpecies || !monsterName.trim() || !selectedSpeciesData) return;

    const newMonster: Omit<Monster, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'current-user',
      name: monsterName.trim(),
      species: selectedSpecies,
      level: 1,
      totalXP: 0,
      currentXP: 0,
      customization: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#A855F7',
        accentColor: '#C084FC',
        pattern: 'solid',
        size: 'medium',
        eyes: { shape: 'round', color: '#3B82F6' }
      },
      stats: {
        ...selectedSpeciesData.baseStats,
        availablePoints: 5
      },
      abilities: [],
      personality: {
        traits: ['curious'],
        mood: 'content',
        preferences: {
          favoriteActivity: 'Learning',
          favoriteFood: 'Knowledge crystals',
          favoriteLocation: 'The study'
        }
      },
      bond: 10,
      isActive: false,
      unlockedFeatures: []
    };

    try {
      await onCreateMonster(newMonster);
      playContextualSound('ui_success');
    } catch (error) {
      playContextualSound('ui_error');
      console.error('Failed to create monster:', error);
    }
  };

  const handleBack = () => {
    playContextualSound('ui_click');
    if (step === 'name') {
      setStep('species');
    } else if (step === 'confirm') {
      setStep('name');
    }
  };

  const handleCancel = () => {
    playContextualSound('ui_cancel');
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleCancel}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <GlassCard blur="lg" opacity={0.1} className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              ✨ Create New Monster
            </h2>
            <p className="text-slate-300">
              {step === 'species' && 'Choose your monster species'}
              {step === 'name' && 'Give your monster a name'}
              {step === 'confirm' && 'Confirm your new companion'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'species' && (
              <motion.div
                key="species"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {availableSpecies.map((species) => (
                  <motion.button
                    key={species.species}
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                    onClick={() => handleSpeciesSelect(species.species)}
                    className="p-6 bg-slate-800/50 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 text-left"
                  >
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">{species.emoji}</div>
                      <h3 className="text-xl font-bold text-white">{species.name}</h3>
                      <div className="text-sm text-purple-400">{species.rarity}</div>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">{species.description}</p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {step === 'name' && selectedSpeciesData && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4">{selectedSpeciesData.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Your {selectedSpeciesData.name}
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Monster Name
                    </label>
                    <input
                      type="text"
                      value={monsterName}
                      onChange={(e) => setMonsterName(e.target.value)}
                      placeholder="Enter a name for your monster..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-400 transition-all duration-300"
                      maxLength={20}
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleNameSubmit}
                    disabled={!monsterName.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && selectedSpeciesData && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-lg mx-auto"
              >
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4">{selectedSpeciesData.emoji}</div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {monsterName}
                  </h3>
                  <p className="text-slate-300">
                    Level 1 {selectedSpeciesData.name}
                  </p>
                </div>

                <button
                  onClick={handleCreateMonster}
                  disabled={isLoading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-medium text-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  )}
                  ✨ Create Monster
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <button
              onClick={step === 'species' ? handleCancel : handleBack}
              disabled={isLoading}
              className="px-6 py-2 bg-slate-600/50 hover:bg-slate-500/50 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {step === 'species' ? 'Cancel' : 'Back'}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}