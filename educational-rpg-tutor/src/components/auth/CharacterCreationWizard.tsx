import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from './AuthLayout';
import { AnimatedButton } from '../shared/AnimatedButton';
import { CharacterCustomization } from '../character/CharacterCustomization';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { characterService } from '../../services/characterService';
import type { Character, AvatarConfig } from '../../types/character';

type WizardStep = 'welcome' | 'customization' | 'specialization' | 'complete';

interface CharacterCreationWizardProps {
  userId: string;
  onCharacterCreated: (character: Character) => void;
}

export const CharacterCreationWizard: React.FC<CharacterCreationWizardProps> = ({
  userId,
  onCharacterCreated
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [characterData, setCharacterData] = useState({
    name: '',
    avatarConfig: {} as AvatarConfig,
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const specializations = [
    {
      id: 'scholar',
      name: 'Scholar',
      description: 'Masters of knowledge and wisdom. Gains bonus XP from reading and research activities.',
      icon: '📚',
      bonuses: ['Intelligence +2', 'Wisdom +1', '+20% XP from reading']
    },
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Adventurous learners who excel at discovering new concepts. Balanced growth across all subjects.',
      icon: '🗺️',
      bonuses: ['All stats +1', '+10% XP from new topics', 'Unlock worlds faster']
    },
    {
      id: 'creator',
      name: 'Creator',
      description: 'Innovative thinkers who love building and making. Excels in creative and hands-on learning.',
      icon: '🎨',
      bonuses: ['Creativity +2', 'Dexterity +1', '+20% XP from projects']
    },
    {
      id: 'socialite',
      name: 'Socialite',
      description: 'Natural leaders who learn best through interaction. Gains bonuses from group activities.',
      icon: '👥',
      bonuses: ['Charisma +2', 'Wisdom +1', '+20% XP from group work']
    }
  ];

  const handleNameSubmit = (name: string) => {
    if (name.trim().length < 2) {
      setError('Character name must be at least 2 characters long');
      return;
    }
    setCharacterData(prev => ({ ...prev, name: name.trim() }));
    setCurrentStep('customization');
    setError('');
  };

  const handleCustomizationComplete = (avatarConfig: AvatarConfig) => {
    setCharacterData(prev => ({ ...prev, avatarConfig }));
    setCurrentStep('specialization');
  };

  const handleSpecializationSelect = (specialization: string) => {
    setCharacterData(prev => ({ ...prev, specialization }));
    setCurrentStep('complete');
  };

  const handleCreateCharacter = async () => {
    setLoading(true);
    setError('');

    try {
      const character = await characterService.createCharacter(
        userId,
        characterData.name,
        characterData.avatarConfig
      );

      onCharacterCreated(character);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout title="Creating Your Character">
        <div className="text-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-300">Bringing your character to life...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Create Your Hero"
      subtitle="Design your character and begin your learning adventure"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && (
          <WelcomeStep
            key="welcome"
            onNameSubmit={handleNameSubmit}
          />
        )}

        {currentStep === 'customization' && (
          <CustomizationStep
            key="customization"
            characterName={characterData.name}
            onCustomizationComplete={handleCustomizationComplete}
            onBack={() => setCurrentStep('welcome')}
          />
        )}

        {currentStep === 'specialization' && (
          <SpecializationStep
            key="specialization"
            specializations={specializations}
            onSpecializationSelect={handleSpecializationSelect}
            onBack={() => setCurrentStep('customization')}
          />
        )}

        {currentStep === 'complete' && (
          <CompleteStep
            key="complete"
            characterData={characterData}
            specializations={specializations}
            onCreateCharacter={handleCreateCharacter}
            onBack={() => setCurrentStep('specialization')}
          />
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="mt-8 flex justify-center space-x-2">
        {['welcome', 'customization', 'specialization', 'complete'].map((step, index) => {
          const isActive = currentStep === step;
          const isCompleted = ['welcome', 'customization', 'specialization', 'complete'].indexOf(currentStep) > index;
          
          return (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${
                isActive
                  ? 'bg-primary-500'
                  : isCompleted
                  ? 'bg-green-500'
                  : 'bg-slate-600'
              }`}
            />
          );
        })}
      </div>
    </AuthLayout>
  );
};

// Welcome Step Component
const WelcomeStep: React.FC<{
  onNameSubmit: (name: string) => void;
}> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNameSubmit(name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">⚔️</div>
        <h2 className="text-2xl font-rpg text-primary-300 mb-2">Welcome, Future Hero!</h2>
        <p className="text-slate-300 text-sm">
          Every great adventure begins with a name. What shall we call your character?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="characterName" className="block text-sm font-medium text-slate-300 mb-2">
            Character Name
          </label>
          <input
            type="text"
            id="characterName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your character's name"
            required
            maxLength={20}
          />
          <div className="mt-1 text-xs text-slate-400">
            {name.length}/20 characters
          </div>
        </div>

        <AnimatedButton
          type="submit"
          className="w-full"
          disabled={name.trim().length < 2}
        >
          Continue Adventure
        </AnimatedButton>
      </form>

      <div className="mt-6 text-xs text-slate-400 text-center">
        <p>
          Choose a name that represents you! You can always change it later in your character settings.
        </p>
      </div>
    </motion.div>
  );
};

// Customization Step Component
const CustomizationStep: React.FC<{
  characterName: string;
  onCustomizationComplete: (avatarConfig: AvatarConfig) => void;
  onBack: () => void;
}> = ({ characterName, onCustomizationComplete, onBack }) => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    hairStyle: 'short',
    hairColor: 'brown',
    skinTone: 'medium',
    eyeColor: 'brown',
    outfit: 'casual',
    accessories: []
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-2xl font-rpg text-primary-300 mb-2">Customize {characterName}</h2>
        <p className="text-slate-300 text-sm">
          Make your character unique! Choose their appearance and style.
        </p>
      </div>

      <CharacterCustomization
        avatarConfig={avatarConfig}
        onConfigChange={setAvatarConfig}
        showPreview={true}
      />

      <div className="flex gap-3 mt-6">
        <AnimatedButton
          type="button"
          onClick={onBack}
          variant="secondary"
          className="flex-1"
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          type="button"
          onClick={() => onCustomizationComplete(avatarConfig)}
          className="flex-1"
        >
          Continue
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

// Specialization Step Component
const SpecializationStep: React.FC<{
  specializations: any[];
  onSpecializationSelect: (specialization: string) => void;
  onBack: () => void;
}> = ({ specializations, onSpecializationSelect, onBack }) => {
  const [selectedSpec, setSelectedSpec] = useState<string>('');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-2xl font-rpg text-primary-300 mb-2">Choose Your Path</h2>
        <p className="text-slate-300 text-sm">
          Select a specialization that matches your learning style and interests.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {specializations.map((spec) => (
          <motion.button
            key={spec.id}
            type="button"
            onClick={() => setSelectedSpec(spec.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedSpec === spec.id
                ? 'border-primary-500 bg-primary-900/20'
                : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{spec.icon}</div>
              <div className="flex-1">
                <h3 className="font-rpg text-lg text-primary-300">{spec.name}</h3>
                <p className="text-slate-300 text-sm mb-2">{spec.description}</p>
                <div className="flex flex-wrap gap-1">
                  {spec.bonuses.map((bonus: string, index: number) => (
                    <span
                      key={index}
                      className="text-xs bg-primary-900/30 text-primary-200 px-2 py-1 rounded"
                    >
                      {bonus}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <AnimatedButton
          type="button"
          onClick={onBack}
          variant="secondary"
          className="flex-1"
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          type="button"
          onClick={() => onSpecializationSelect(selectedSpec)}
          className="flex-1"
          disabled={!selectedSpec}
        >
          Choose Path
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

// Complete Step Component
const CompleteStep: React.FC<{
  characterData: any;
  specializations: any[];
  onCreateCharacter: () => void;
  onBack: () => void;
}> = ({ characterData, specializations, onCreateCharacter, onBack }) => {
  const selectedSpec = specializations.find(s => s.id === characterData.specialization);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-rpg text-primary-300 mb-2">Character Summary</h2>
        <p className="text-slate-300 text-sm">
          Review your character before starting your adventure!
        </p>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">👤</div>
          <h3 className="text-xl font-rpg text-primary-300">{characterData.name}</h3>
          <p className="text-slate-400 text-sm">Level 1 {selectedSpec?.name}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-300">Specialization:</span>
            <span className="text-primary-300">{selectedSpec?.name} {selectedSpec?.icon}</span>
          </div>
          <div className="text-slate-400 text-sm">
            {selectedSpec?.description}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedSpec?.bonuses.map((bonus: string, index: number) => (
              <span
                key={index}
                className="text-xs bg-primary-900/30 text-primary-200 px-2 py-1 rounded"
              >
                {bonus}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-green-300 font-semibold mb-2">Ready to Begin!</h3>
        <ul className="text-green-200 text-sm space-y-1">
          <li>• Start at Level 1 with balanced stats</li>
          <li>• Earn XP by completing educational activities</li>
          <li>• Unlock new worlds and abilities as you progress</li>
          <li>• Customize your character further as you level up</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <AnimatedButton
          type="button"
          onClick={onBack}
          variant="secondary"
          className="flex-1"
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          type="button"
          onClick={onCreateCharacter}
          className="flex-1"
        >
          Start Adventure!
        </AnimatedButton>
      </div>
    </motion.div>
  );
};