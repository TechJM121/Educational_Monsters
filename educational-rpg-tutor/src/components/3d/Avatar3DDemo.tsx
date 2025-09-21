import React, { useState, useCallback } from 'react';
import Avatar3D, { type Character } from './Avatar3D';
import { motion } from 'framer-motion';

const Avatar3DDemo: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character>({
    id: 'demo-character-1',
    name: 'Aria the Mage',
    primaryColor: '#4A90E2',
    secondaryColor: '#50C878',
    level: 15,
    class: 'mage',
  });

  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [lighting, setLighting] = useState<'ambient' | 'dramatic' | 'soft'>('ambient');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [interactive, setInteractive] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  const characters: Character[] = [
    {
      id: 'demo-character-1',
      name: 'Aria the Mage',
      primaryColor: '#4A90E2',
      secondaryColor: '#50C878',
      level: 15,
      class: 'mage',
    },
    {
      id: 'demo-character-2',
      name: 'Thorin the Warrior',
      primaryColor: '#E74C3C',
      secondaryColor: '#F39C12',
      level: 22,
      class: 'warrior',
    },
    {
      id: 'demo-character-3',
      name: 'Luna the Rogue',
      primaryColor: '#9B59B6',
      secondaryColor: '#1ABC9C',
      level: 18,
      class: 'rogue',
    },
  ];

  const handleHover = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
  }, []);

  const handleRotationChange = useCallback((newRotation: { x: number; y: number; z: number }) => {
    setRotation(newRotation);
  }, []);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            3D Character Avatar Demo
          </h1>
          <p className="text-xl text-gray-300">
            Interactive 3D avatars with smooth animations and lighting effects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Avatar Display */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <Avatar3D
                character={selectedCharacter}
                interactive={interactive}
                lighting={lighting}
                size={size}
                autoRotate={autoRotate}
                animationSpeed={animationSpeed}
                onHover={handleHover}
                onRotationChange={handleRotationChange}
                className="mx-auto"
              />
              
              {/* Character Info */}
              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedCharacter.name}</h3>
                <div className="flex justify-center items-center gap-4 text-sm">
                  <span className="bg-blue-500/20 px-3 py-1 rounded-full">
                    Level {selectedCharacter.level}
                  </span>
                  <span className="bg-purple-500/20 px-3 py-1 rounded-full capitalize">
                    {selectedCharacter.class}
                  </span>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-4 flex justify-center gap-4 text-sm text-gray-300">
                <div className={`flex items-center gap-2 ${isHovered ? 'text-green-400' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${isHovered ? 'bg-green-400' : 'bg-gray-500'}`} />
                  {isHovered ? 'Hovered' : 'Idle'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  Rotation: {Math.round(rotation.y * 180 / Math.PI)}°
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Character Selection */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Select Character</h3>
              <div className="grid grid-cols-1 gap-3">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => handleCharacterSelect(character)}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      selectedCharacter.id === character.id
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-semibold">{character.name}</div>
                        <div className="text-sm opacity-75">
                          Level {character.level} {character.class}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: character.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: character.secondaryColor }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Display Settings</h3>
              
              <div className="space-y-4">
                {/* Size Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Size
                  </label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map((sizeOption) => (
                      <button
                        key={sizeOption}
                        onClick={() => setSize(sizeOption)}
                        className={`px-4 py-2 rounded-lg capitalize transition-all duration-300 ${
                          size === sizeOption
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {sizeOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lighting Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lighting
                  </label>
                  <div className="flex gap-2">
                    {(['ambient', 'dramatic', 'soft'] as const).map((lightingOption) => (
                      <button
                        key={lightingOption}
                        onClick={() => setLighting(lightingOption)}
                        className={`px-4 py-2 rounded-lg capitalize transition-all duration-300 ${
                          lighting === lightingOption
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {lightingOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation Speed */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Animation Speed: {animationSpeed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Toggle Controls */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={interactive}
                      onChange={(e) => setInteractive(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500"
                    />
                    <span className="text-gray-300">Interactive Mode</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRotate}
                      onChange={(e) => setAutoRotate(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-purple-500 checked:border-purple-500"
                    />
                    <span className="text-gray-300">Auto Rotate</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Performance Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Performance Info</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Hover State:</span>
                  <span className={isHovered ? 'text-green-400' : 'text-gray-400'}>
                    {isHovered ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rotation Y:</span>
                  <span>{Math.round(rotation.y * 180 / Math.PI)}°</span>
                </div>
                <div className="flex justify-between">
                  <span>Rotation X:</span>
                  <span>{Math.round(rotation.x * 180 / Math.PI)}°</span>
                </div>
                <div className="flex justify-between">
                  <span>Animation Speed:</span>
                  <span>{animationSpeed.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Mouse Interactions</h4>
              <ul className="space-y-1 text-sm">
                <li>• Move mouse over avatar to rotate</li>
                <li>• Hover for scale and glow effects</li>
                <li>• Mouse leave resets position</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Customization</h4>
              <ul className="space-y-1 text-sm">
                <li>• Switch between different characters</li>
                <li>• Adjust lighting and size</li>
                <li>• Control animation speed</li>
                <li>• Toggle interactive features</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4A90E2;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4A90E2;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
      `}</style>
    </div>
  );
};

export default Avatar3DDemo;