import React, { useState } from 'react';
import { AdvancedParticleSystem } from './AdvancedParticleSystem';
import { createParticleConfig, getThemeColors } from './ParticleConfig';
import { useDeviceCapability } from '../../hooks/useDeviceCapability';

export const ParticleSystemDemo: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'magical' | 'tech' | 'nature' | 'cosmic'>('magical');
  const [isInteractive, setIsInteractive] = useState(true);
  const deviceCapability = useDeviceCapability();
  
  const themes = [
    { name: 'Magical', value: 'magical' as const, description: 'Purple mystical particles' },
    { name: 'Tech', value: 'tech' as const, description: 'Cyan digital particles' },
    { name: 'Nature', value: 'nature' as const, description: 'Green organic particles' },
    { name: 'Cosmic', value: 'cosmic' as const, description: 'Deep purple space particles' }
  ];

  const currentConfig = createParticleConfig(currentTheme, deviceCapability);
  const themeColors = getThemeColors(currentTheme);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Particle System */}
      <AdvancedParticleSystem
        theme={currentTheme}
        interactive={isInteractive}
        className="opacity-80"
      />
      
      {/* Controls Panel */}
      <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Particle System Demo</h2>
        
        {/* Device Info */}
        <div className="mb-4 p-3 bg-black/20 rounded-lg">
          <p className="text-sm text-white/80">
            Device Capability: <span className="font-semibold text-white">{deviceCapability}</span>
          </p>
          <p className="text-sm text-white/80">
            Particle Count: <span className="font-semibold text-white">{currentConfig.count}</span>
          </p>
        </div>
        
        {/* Theme Selection */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Theme</h3>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => setCurrentTheme(theme.value)}
                className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                  currentTheme === theme.value
                    ? 'border-white bg-white/20 text-white'
                    : 'border-white/30 bg-white/5 text-white/80 hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: currentTheme === theme.value ? themeColors.background : undefined
                }}
              >
                <div className="text-sm font-medium">{theme.name}</div>
                <div className="text-xs opacity-80">{theme.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Interactive Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isInteractive}
              onChange={(e) => setIsInteractive(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500"
            />
            <span className="text-white font-medium">Interactive Mode</span>
          </label>
          <p className="text-xs text-white/60 mt-1">
            Move your mouse to attract particles
          </p>
        </div>
        
        {/* Configuration Display */}
        <div className="text-xs text-white/60 space-y-1">
          <div>Interaction Radius: {currentConfig.interactionRadius}px</div>
          <div>Magnetic Force: {currentConfig.magneticForce}</div>
          <div>Friction: {currentConfig.friction}</div>
          <div>Size Range: {currentConfig.size.min}-{currentConfig.size.max}px</div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-6 right-6 z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl max-w-sm">
        <h3 className="text-lg font-semibold text-white mb-2">Instructions</h3>
        <ul className="text-sm text-white/80 space-y-1">
          <li>• Move your mouse to interact with particles</li>
          <li>• Switch themes to see different particle behaviors</li>
          <li>• Toggle interactive mode on/off</li>
          <li>• Particle count adapts to your device capability</li>
        </ul>
      </div>
      
      {/* Performance Indicator */}
      <div className="absolute top-6 right-6 z-10 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: themeColors.primary }}
          />
          <span className="text-white text-sm font-medium">
            {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Theme Active
          </span>
        </div>
      </div>
    </div>
  );
};