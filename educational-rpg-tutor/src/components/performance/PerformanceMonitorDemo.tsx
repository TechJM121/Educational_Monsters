import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useAnimationOptimization } from '../../hooks/useAnimationOptimization';
import { performanceBenchmark, ANIMATION_BENCHMARKS, BenchmarkResult } from '../../utils/performanceBenchmark';

export const PerformanceMonitorDemo: React.FC = () => {
  const { metrics, resetMetrics, measureAnimation } = usePerformanceMonitor();
  const {
    settings,
    isOptimizing,
    optimizationLog,
    manualOptimize,
    resetOptimizations,
    getAnimationProps,
    appliedOptimizations
  } = useAnimationOptimization();

  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [stressTestActive, setStressTestActive] = useState(false);

  const runBenchmarks = async () => {
    setIsRunningBenchmark(true);
    try {
      const results = await performanceBenchmark.runMultipleBenchmarks(ANIMATION_BENCHMARKS);
      setBenchmarkResults(results);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  const startStressTest = () => {
    setStressTestActive(true);
    
    // Create multiple animated elements to stress test performance
    const stressElements = Array.from({ length: 50 }, (_, i) => {
      const element = document.createElement('div');
      element.className = 'fixed w-4 h-4 bg-blue-500 rounded-full pointer-events-none';
      element.style.left = `${Math.random() * window.innerWidth}px`;
      element.style.top = `${Math.random() * window.innerHeight}px`;
      element.style.zIndex = '9999';
      document.body.appendChild(element);
      
      const animate = () => {
        if (stressTestActive) {
          element.style.transform = `
            translateX(${Math.sin(Date.now() / 1000 + i) * 200}px)
            translateY(${Math.cos(Date.now() / 1000 + i) * 200}px)
            rotate(${Date.now() / 10 + i * 45}deg)
            scale(${0.5 + Math.sin(Date.now() / 500 + i) * 0.5})
          `;
          requestAnimationFrame(animate);
        } else {
          document.body.removeChild(element);
        }
      };
      
      animate();
      return element;
    });
    
    // Auto-stop after 10 seconds
    setTimeout(() => {
      setStressTestActive(false);
    }, 10000);
  };

  const stopStressTest = () => {
    setStressTestActive(false);
  };

  const testAnimation = () => {
    measureAnimation('demo-animation', () => {
      // Simulate some animation work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Busy wait for 10ms
      }
    });
  };

  const getPerformanceColor = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Performance Monitor Demo</h2>
        <p className="text-gray-600">
          Real-time performance monitoring and automatic optimization
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-white rounded-lg shadow-lg p-4"
          {...getAnimationProps()}
        >
          <h3 className="text-lg font-semibold mb-2">FPS</h3>
          <div className={`text-2xl font-bold ${getPerformanceColor(metrics.fps, 55)}`}>
            {metrics.fps}
          </div>
          <div className="text-sm text-gray-500">
            Avg: {metrics.averageFPS}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-4"
          {...getAnimationProps()}
        >
          <h3 className="text-lg font-semibold mb-2">Frame Drops</h3>
          <div className={`text-2xl font-bold ${getPerformanceColor(metrics.frameDrops, 5, true)}`}>
            {metrics.frameDrops}
          </div>
          <div className="text-sm text-gray-500">
            Total dropped frames
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-4"
          {...getAnimationProps()}
        >
          <h3 className="text-lg font-semibold mb-2">Memory</h3>
          <div className={`text-2xl font-bold ${getPerformanceColor(metrics.memoryUsage, 100, true)}`}>
            {metrics.memoryUsage} MB
          </div>
          <div className="text-sm text-gray-500">
            JS Heap Usage
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-4"
          {...getAnimationProps()}
        >
          <h3 className="text-lg font-semibold mb-2">Device</h3>
          <div className="text-2xl font-bold capitalize">
            {metrics.deviceCapability}
          </div>
          <div className={`text-sm ${metrics.isPerformanceGood ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.isPerformanceGood ? 'Good' : 'Poor'} Performance
          </div>
        </motion.div>
      </div>

      {/* Current Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Current Animation Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Particles:</span> {settings.particleCount}
          </div>
          <div>
            <span className="font-medium">Blur:</span> {settings.blurEffects}
          </div>
          <div>
            <span className="font-medium">Shadows:</span> {settings.shadowEffects}
          </div>
          <div>
            <span className="font-medium">Duration:</span> {settings.transitionDuration}ms
          </div>
          <div>
            <span className="font-medium">GPU:</span> {settings.enableGPUAcceleration ? 'On' : 'Off'}
          </div>
          <div>
            <span className="font-medium">3D:</span> {settings.enable3DTransforms ? 'On' : 'Off'}
          </div>
        </div>
        
        {appliedOptimizations.length > 0 && (
          <div className="mt-4">
            <span className="font-medium">Applied Optimizations:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {appliedOptimizations.map((opt, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                >
                  {opt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Controls</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={testAnimation}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Animation
          </button>
          
          <button
            onClick={manualOptimize}
            disabled={isOptimizing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isOptimizing ? 'Optimizing...' : 'Manual Optimize'}
          </button>
          
          <button
            onClick={resetOptimizations}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Reset Optimizations
          </button>
          
          <button
            onClick={resetMetrics}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset Metrics
          </button>
          
          {!stressTestActive ? (
            <button
              onClick={startStressTest}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Start Stress Test
            </button>
          ) : (
            <button
              onClick={stopStressTest}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Stop Stress Test
            </button>
          )}
          
          <button
            onClick={runBenchmarks}
            disabled={isRunningBenchmark}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {isRunningBenchmark ? 'Running Benchmarks...' : 'Run Benchmarks'}
          </button>
        </div>
      </div>

      {/* Optimization Log */}
      {optimizationLog.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Optimization Log</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {optimizationLog.map((log, index) => (
              <div key={index} className="text-sm font-mono text-gray-600">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benchmark Results */}
      {benchmarkResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Benchmark Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Test</th>
                  <th className="text-left p-2">FPS</th>
                  <th className="text-left p-2">Memory</th>
                  <th className="text-left p-2">Frame Drops</th>
                  <th className="text-left p-2">Success</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkResults.map((result, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{result.name}</td>
                    <td className={`p-2 ${result.fps >= 45 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.fps}
                    </td>
                    <td className="p-2">{result.memoryUsage.toFixed(1)} MB</td>
                    <td className="p-2">{result.frameDrops}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};