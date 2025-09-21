import React, { useState, useCallback } from 'react';
import { ParticleEngine } from './ParticleEngine';
import { createParticleConfig } from './ParticleConfig';
import { DeviceCapability } from '../../types/animation';
import { useDeviceCapability } from '../../hooks/useDeviceCapability';

export const ParticleEngineDemo: React.FC = () => {
  const [theme, setTheme] = useState<'magical' | 'tech' | 'nature' | 'cosmic'>('magical');
  const [interactive, setInteractive] = useState(true);
  const [particleCount, setParticleCount] = useState(100);
  const [magneticForce, setMagneticForce] = useState(0.02);
  const [interactionRadius, setInteractionRadius] = useState(80);
  const [friction, setFriction] = useState(0.98);
  
  const deviceCapability = useDeviceCapability();
  
  const config = {
    ...createParticleConfig(theme, deviceCapability),
    count: particleCount,
    magneticForce,
    interactionRadius,
    friction
  };

  const handleThemeChange = useCallback((newTheme: typeof theme) => {
    setTheme(newTheme);
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaultConfig = createParticleConfig(theme, deviceCapability);
    setParticleCount(defaultConfig.count);
    setMagneticForce(defaultConfig.magneticForce);
    setInteractionRadius(defaultConfig.interactionRadius);
    setFriction(defaultConfig.friction);
  }, [theme, deviceCapability]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Particle Engine */}
      <ParticleEngine
        config={config}
        theme={theme}
        interactive={interactive}
        className="absolute inset-0"
      />
      
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md rounded-lg p-6 text-white max-w-sm">
        <h2 className="text-xl font-bold mb-4">Particle Engine Demo</h2>
        
        {/* Device Info */}
        <div className="mb-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm font-medium">Device Capability: <span className="text-green-400">{deviceCapability}</span></p>
          <p className="text-xs text-gray-300 mt-1">
            Particles auto-adjusted for optimal performance
          </p>
        </div>
        
        {/* Theme Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="grid grid-cols-2 gap-2">
            {(['magical', 'tech', 'nature', 'cosmic'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                  theme === t
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Interactive Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={interactive}
              onChange={(e) => setInteractive(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Mouse Interaction</span>
          </label>
        </div>
        
        {/* Particle Count */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Particle Count: {particleCount}
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        {/* Magnetic Force */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Magnetic Force: {magneticForce.toFixed(3)}
          </label>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={magneticForce}
            onChange={(e) => setMagneticForce(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        {/* Interaction Radius */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Interaction Radius: {interactionRadius}px
          </label>
          <input
            type="range"
            min="20"
            max="200"
            value={interactionRadius}
            onChange={(e) => setInteractionRadius(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        {/* Friction */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Friction: {friction.toFixed(3)}
          </label>
          <input
            type="range"
            min="0.9"
            max="0.999"
            step="0.001"
            value={friction}
            onChange={(e) => setFriction(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        {/* Reset Button */}
        <button
          onClick={resetToDefaults}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-md rounded-lg p-4 text-white max-w-xs">
        <h3 className="font-medium mb-2">Instructions</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Move your mouse to attract particles</li>
          <li>• Adjust settings to see physics changes</li>
          <li>• Try different themes for unique effects</li>
          <li>• Performance auto-adapts to your device</li>
        </ul>
      </div>
      
      {/* Performance Indicator */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md rounded-lg p-3 text-white">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">60 FPS Target</span>
        </div>
      </div>
    </div>
  );
};