import React, { useState, useEffect, useCallback } from 'react';
import { ParticleEngine } from './ParticleEngine';
import { createParticleConfig } from './ParticleConfig';
import { ParticlePerformanceBenchmark, performanceUtils } from '../../utils/particlePerformanceBenchmark';
import { AdvancedDeviceDetector } from '../../utils/deviceCapability';
import { PerformanceMonitor } from '../../utils/performance';
import type { DeviceCapability } from '../../types/animation';

interface OptimizedParticleDemoProps {
  className?: string;
}

export const OptimizedParticleDemo: React.FC<OptimizedParticleDemoProps> = ({
  className = ''
}) => {
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>('medium');
  const [currentTheme, setCurrentTheme] = useState<'magical' | 'tech' | 'nature' | 'cosmic'>('magical');
  const [useWebWorker, setUseWebWorker] = useState(true);
  const [adaptToDevice, setAdaptToDevice] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    frameDrops: 0,
    memoryUsage: 0,
    particleCount: 0
  });
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any>({});
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // Initialize device detection and performance monitoring
  useEffect(() => {
    const initializeOptimization = async () => {
      const detector = AdvancedDeviceDetector.getInstance();
      const info = await detector.detectDevice();
      setDeviceInfo(info);
      setDeviceCapability(info.capability);

      // Start performance monitoring
      const monitor = PerformanceMonitor.getInstance();
      monitor.startMonitoring();

      // Subscribe to performance updates
      const unsubscribe = monitor.subscribe((metrics) => {
        setPerformanceMetrics({
          fps: metrics.fps,
          frameDrops: metrics.frameDrops,
          memoryUsage: metrics.memoryUsage,
          particleCount: 0 // Will be updated by particle config
        });
      });

      // Set up performance watcher for optimization suggestions
      const unsubscribeWatcher = performanceUtils.createPerformanceWatcher((suggestions) => {
        setOptimizationSuggestions(suggestions);
      });

      return () => {
        unsubscribe();
        unsubscribeWatcher();
        monitor.stopMonitoring();
      };
    };

    initializeOptimization();
  }, []);

  // Get optimized particle configuration
  const particleConfig = React.useMemo(() => {
    const config = createParticleConfig(currentTheme, deviceCapability);
    setPerformanceMetrics(prev => ({ ...prev, particleCount: config.count }));
    return config;
  }, [currentTheme, deviceCapability]);

  // Run performance benchmark
  const runBenchmark = useCallback(async () => {
    setIsRunningBenchmark(true);
    
    try {
      const benchmark = ParticlePerformanceBenchmark.getInstance();
      const results = await benchmark.runBenchmark({
        duration: 3000,
        particleCounts: [25, 50, 100, 150],
        themes: [currentTheme],
        includeWebWorker: useWebWorker,
        includeInteraction: true
      });
      
      setBenchmarkResults(results);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunningBenchmark(false);
    }
  }, [currentTheme, useWebWorker]);

  // Run quick performance test
  const runQuickTest = useCallback(async () => {
    try {
      const benchmark = ParticlePerformanceBenchmark.getInstance();
      const result = await benchmark.quickPerformanceTest();
      
      setOptimizationSuggestions({
        recommendedParticleCount: result.recommendedParticleCount,
        shouldUseWebWorker: result.shouldUseWebWorker,
        recommendedCapability: result.recommendedDeviceCapability
      });
    } catch (error) {
      console.error('Quick test failed:', error);
    }
  }, []);

  // Apply optimization suggestions
  const applyOptimizations = useCallback(() => {
    if (optimizationSuggestions.reduceParticles) {
      setDeviceCapability('low');
    }
    if (optimizationSuggestions.useWebWorker !== undefined) {
      setUseWebWorker(optimizationSuggestions.useWebWorker);
    }
    if (optimizationSuggestions.recommendedCapability) {
      setDeviceCapability(optimizationSuggestions.recommendedCapability);
    }
  }, [optimizationSuggestions]);

  const getPerformanceColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCapabilityColor = (capability: DeviceCapability) => {
    switch (capability) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`relative w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 ${className}`}>
      {/* Particle System */}
      <ParticleEngine
        config={particleConfig}
        theme={currentTheme}
        interactive={true}
        useWebWorker={useWebWorker}
        adaptToDevice={adaptToDevice}
        className="absolute inset-0"
      />

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md rounded-lg p-4 text-white max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Particle Optimization Demo</h3>
        
        {/* Theme Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value as any)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm"
          >
            <option value="magical">Magical</option>
            <option value="tech">Tech</option>
            <option value="nature">Nature</option>
            <option value="cosmic">Cosmic</option>
          </select>
        </div>

        {/* Device Capability Override */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Device Capability</label>
          <select
            value={deviceCapability}
            onChange={(e) => setDeviceCapability(e.target.value as DeviceCapability)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Options */}
        <div className="mb-4 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useWebWorker}
              onChange={(e) => setUseWebWorker(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Use Web Worker</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={adaptToDevice}
              onChange={(e) => setAdaptToDevice(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Adapt to Device</span>
          </label>
        </div>

        {/* Benchmark Controls */}
        <div className="mb-4 space-y-2">
          <button
            onClick={runQuickTest}
            className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Quick Performance Test
          </button>
          
          <button
            onClick={runBenchmark}
            disabled={isRunningBenchmark}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            {isRunningBenchmark ? 'Running Benchmark...' : 'Full Benchmark'}
          </button>
        </div>

        {/* Apply Optimizations */}
        {Object.keys(optimizationSuggestions).length > 0 && (
          <button
            onClick={applyOptimizations}
            className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium transition-colors mb-4"
          >
            Apply Optimizations
          </button>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md rounded-lg p-4 text-white max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className={getPerformanceColor(performanceMetrics.fps)}>
              {performanceMetrics.fps}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Frame Drops:</span>
            <span className={performanceMetrics.frameDrops > 5 ? 'text-red-500' : 'text-green-500'}>
              {performanceMetrics.frameDrops}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={performanceMetrics.memoryUsage > 100 ? 'text-red-500' : 'text-green-500'}>
              {performanceMetrics.memoryUsage.toFixed(1)} MB
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Particles:</span>
            <span>{performanceMetrics.particleCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Capability:</span>
            <span className={getCapabilityColor(deviceCapability)}>
              {deviceCapability.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Device Information */}
        {deviceInfo && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <h4 className="font-medium mb-2">Device Info</h4>
            <div className="space-y-1 text-xs">
              <div>CPU Cores: {deviceInfo.cores}</div>
              <div>Memory: {deviceInfo.memory} GB</div>
              <div>GPU: {deviceInfo.gpu.substring(0, 30)}...</div>
              <div>WebGL: {deviceInfo.features.webgl ? '✓' : '✗'}</div>
              <div>Web Workers: {deviceInfo.features.webWorkers ? '✓' : '✗'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Optimization Suggestions */}
      {Object.keys(optimizationSuggestions).length > 0 && (
        <div className="absolute bottom-4 left-4 bg-yellow-900/20 backdrop-blur-md rounded-lg p-4 text-white max-w-md">
          <h3 className="text-lg font-semibold mb-2">Optimization Suggestions</h3>
          <div className="space-y-1 text-sm">
            {optimizationSuggestions.reduceParticles && (
              <div>• Reduce particle count for better performance</div>
            )}
            {optimizationSuggestions.disableInteraction && (
              <div>• Disable particle interaction to improve FPS</div>
            )}
            {optimizationSuggestions.simplifyRendering && (
              <div>• Use simplified rendering mode</div>
            )}
            {optimizationSuggestions.useWebWorker !== undefined && (
              <div>• {optimizationSuggestions.useWebWorker ? 'Enable' : 'Disable'} Web Worker</div>
            )}
            {optimizationSuggestions.recommendedParticleCount && (
              <div>• Recommended particle count: {optimizationSuggestions.recommendedParticleCount}</div>
            )}
          </div>
        </div>
      )}

      {/* Benchmark Results */}
      {benchmarkResults && (
        <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-md rounded-lg p-4 text-white max-w-md max-h-64 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Benchmark Results</h3>
          <div className="space-y-2 text-xs">
            {benchmarkResults.map((result: any, index: number) => (
              <div key={index} className="border-b border-white/20 pb-2">
                <div className="font-medium">
                  {result.recommendedParticleCount} particles
                </div>
                <div>FPS: {result.averageFPS}</div>
                <div>Score: {result.score}/100</div>
                <div>Render: {result.renderTime.toFixed(2)}ms</div>
                <div>Physics: {result.physicsTime.toFixed(2)}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};