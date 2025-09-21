import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';
import { AnimationPreset } from '../../utils/deviceCapabilityDetector';

export const DeviceCapabilityDemo: React.FC = () => {
  const {
    capabilities,
    animationPreset,
    isDetecting,
    detectionError,
    optimizedSettings,
    shouldReduceAnimations,
    deviceInfo,
    detectCapabilities,
    updateUserPreferences,
    isHighEndDevice,
    isMediumEndDevice,
    isLowEndDevice,
    performanceScore,
    memoryGB,
    cpuCores
  } = useDeviceCapabilities({
    enableAutoDetection: true,
    enableBatteryOptimization: true,
    enableNetworkOptimization: true,
    onCapabilitiesDetected: (caps) => {
      console.log('Device capabilities detected:', caps);
    }
  });

  const [userPreferences, setUserPreferences] = useState<Partial<AnimationPreset>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePreferenceChange = (key: keyof AnimationPreset, value: any) => {
    const newPreferences = { ...userPreferences, [key]: value };
    setUserPreferences(newPreferences);
    updateUserPreferences(newPreferences);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isDetecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Detecting device capabilities...</p>
        </div>
      </div>
    );
  }

  if (detectionError) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Detection Error:</strong> {detectionError}
        </div>
        <button
          onClick={() => detectCapabilities(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry Detection
        </button>
      </div>
    );
  }

  if (!capabilities || !animationPreset || !deviceInfo) {
    return (
      <div className="p-6">
        <p>No device capabilities detected.</p>
        <button
          onClick={() => detectCapabilities(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
        >
          Start Detection
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Device Capability Detection</h2>
        <p className="text-gray-600">
          Automatic device assessment and animation optimization
        </p>
      </div>

      {/* Device Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-white rounded-lg shadow-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-2">Device Tier</h3>
          <div className={`text-2xl font-bold px-3 py-1 rounded-full inline-block ${getTierColor(deviceInfo.tier)}`}>
            {deviceInfo.tier.toUpperCase()}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-2">Performance Score</h3>
          <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
            {performanceScore}/100
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${performanceScore >= 70 ? 'bg-green-500' : performanceScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${performanceScore}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-2">Hardware</h3>
          <div className="text-sm space-y-1">
            <div><strong>RAM:</strong> {memoryGB} GB</div>
            <div><strong>CPU:</strong> {cpuCores} cores</div>
            <div><strong>GPU:</strong> {deviceInfo.gpu.isDedicated ? 'Dedicated' : 'Integrated'}</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-2">Display</h3>
          <div className="text-sm space-y-1">
            <div><strong>Resolution:</strong> {deviceInfo.screen.resolution}</div>
            <div><strong>Pixel Ratio:</strong> {deviceInfo.screen.pixelRatio}x</div>
            <div><strong>Refresh Rate:</strong> {deviceInfo.screen.refreshRate}Hz</div>
          </div>
        </motion.div>
      </div>

      {/* Current Animation Preset */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Current Animation Preset: {animationPreset.name}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <span className="font-medium">Particles:</span> {animationPreset.particleCount}
          </div>
          <div>
            <span className="font-medium">Blur Effects:</span> {animationPreset.blurEffects}
          </div>
          <div>
            <span className="font-medium">Shadow Effects:</span> {animationPreset.shadowEffects}
          </div>
          <div>
            <span className="font-medium">Transition Duration:</span> {animationPreset.transitionDuration}ms
          </div>
          <div>
            <span className="font-medium">GPU Acceleration:</span> {animationPreset.enableGPUAcceleration ? 'On' : 'Off'}
          </div>
          <div>
            <span className="font-medium">3D Transforms:</span> {animationPreset.enable3DTransforms ? 'On' : 'Off'}
          </div>
          <div>
            <span className="font-medium">Parallax:</span> {animationPreset.enableParallax ? 'On' : 'Off'}
          </div>
          <div>
            <span className="font-medium">Complex Animations:</span> {animationPreset.enableComplexAnimations ? 'On' : 'Off'}
          </div>
        </div>

        {shouldReduceAnimations && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
            <strong>⚠️ Performance Mode Active:</strong> Animations are being reduced due to battery, network, or performance constraints.
          </div>
        )}
      </div>

      {/* User Preferences */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">User Preferences Override</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Particle Count</label>
            <input
              type="range"
              min="0"
              max="300"
              value={userPreferences.particleCount || animationPreset.particleCount}
              onChange={(e) => handlePreferenceChange('particleCount', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-500">
              {userPreferences.particleCount || animationPreset.particleCount}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Transition Duration (ms)</label>
            <input
              type="range"
              min="100"
              max="1000"
              value={userPreferences.transitionDuration || animationPreset.transitionDuration}
              onChange={(e) => handlePreferenceChange('transitionDuration', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-500">
              {userPreferences.transitionDuration || animationPreset.transitionDuration}ms
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Blur Effects</label>
            <select
              value={userPreferences.blurEffects || animationPreset.blurEffects}
              onChange={(e) => handlePreferenceChange('blurEffects', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="full">Full</option>
              <option value="reduced">Reduced</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Shadow Effects</label>
            <select
              value={userPreferences.shadowEffects || animationPreset.shadowEffects}
              onChange={(e) => handlePreferenceChange('shadowEffects', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="full">Full</option>
              <option value="reduced">Reduced</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userPreferences.enableGPUAcceleration ?? animationPreset.enableGPUAcceleration}
              onChange={(e) => handlePreferenceChange('enableGPUAcceleration', e.target.checked)}
              className="mr-2"
            />
            GPU Acceleration
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userPreferences.enable3DTransforms ?? animationPreset.enable3DTransforms}
              onChange={(e) => handlePreferenceChange('enable3DTransforms', e.target.checked)}
              className="mr-2"
            />
            3D Transforms
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userPreferences.enableParallax ?? animationPreset.enableParallax}
              onChange={(e) => handlePreferenceChange('enableParallax', e.target.checked)}
              className="mr-2"
            />
            Parallax Effects
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userPreferences.enableComplexAnimations ?? animationPreset.enableComplexAnimations}
              onChange={(e) => handlePreferenceChange('enableComplexAnimations', e.target.checked)}
              className="mr-2"
            />
            Complex Animations
          </label>
        </div>
      </div>

      {/* Advanced Device Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Advanced Device Information</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            {showAdvanced ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">GPU Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Vendor:</strong> {deviceInfo.gpu.vendor}</div>
                <div><strong>Renderer:</strong> {deviceInfo.gpu.renderer}</div>
                <div><strong>WebGL Version:</strong> {deviceInfo.gpu.webglVersion}</div>
                <div><strong>Type:</strong> {deviceInfo.gpu.isDedicated ? 'Dedicated' : 'Integrated'}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Feature Support</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(deviceInfo.features).map(([feature, supported]) => (
                  <div key={feature} className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${supported ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Battery & Network</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Battery Level:</strong> {Math.round(deviceInfo.battery.level * 100)}%
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${deviceInfo.battery.level > 0.5 ? 'bg-green-500' : deviceInfo.battery.level > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${deviceInfo.battery.level * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-1">
                    {deviceInfo.battery.charging ? '🔌 Charging' : '🔋 On Battery'}
                  </div>
                </div>
                <div>
                  <strong>Network:</strong> {deviceInfo.network.effectiveType}
                  <div>Downlink: {deviceInfo.network.downlink} Mbps</div>
                  <div>RTT: {deviceInfo.network.rtt} ms</div>
                  {deviceInfo.network.saveData && (
                    <div className="text-yellow-600">📱 Data Saver Mode</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Controls</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => detectCapabilities(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Re-detect Capabilities
          </button>
          
          <button
            onClick={() => {
              setUserPreferences({});
              updateUserPreferences({});
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset Preferences
          </button>
        </div>
      </div>

      {/* Device Tier Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border-2 ${isHighEndDevice ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
          <h4 className="font-semibold text-green-600">High-End Device</h4>
          <p className="text-sm text-gray-600">8GB+ RAM, 6+ cores, dedicated GPU</p>
          <p className="text-sm text-gray-600">Full animation effects enabled</p>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${isMediumEndDevice ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
          <h4 className="font-semibold text-yellow-600">Medium-End Device</h4>
          <p className="text-sm text-gray-600">4GB+ RAM, 4+ cores</p>
          <p className="text-sm text-gray-600">Balanced animation settings</p>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${isLowEndDevice ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <h4 className="font-semibold text-red-600">Low-End Device</h4>
          <p className="text-sm text-gray-600">&lt;4GB RAM, &lt;4 cores</p>
          <p className="text-sm text-gray-600">Optimized for performance</p>
        </div>
      </div>
    </div>
  );
};