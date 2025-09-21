import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TouchOptimized from './TouchOptimized';
import GlassCard from './GlassCard';
import { mobileAnimationVariants, triggerHaptic, isTouchDevice } from '../../utils/mobileAnimations';

const TouchInteractionDemo: React.FC = () => {
  const [gestureLog, setGestureLog] = useState<string[]>([]);
  const [currentScale, setCurrentScale] = useState(1);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);

  const addToLog = (gesture: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGestureLog(prev => [`${timestamp}: ${gesture}`, ...prev.slice(0, 9)]);
  };

  const resetDemo = () => {
    setGestureLog([]);
    setCurrentScale(1);
    setCardPosition({ x: 0, y: 0 });
    setShowMenu(false);
  };

  const handleSwipe = (direction: string) => {
    addToLog(`Swiped ${direction}`);
    triggerHaptic('light');
    
    // Animate card based on swipe direction
    const movements = {
      left: { x: -50, y: 0 },
      right: { x: 50, y: 0 },
      up: { x: 0, y: -50 },
      down: { x: 0, y: 50 }
    };
    
    const movement = movements[direction as keyof typeof movements];
    if (movement) {
      setCardPosition(movement);
      setTimeout(() => setCardPosition({ x: 0, y: 0 }), 500);
    }
  };

  const handlePinch = (scale: number) => {
    setCurrentScale(scale);
    addToLog(`Pinched: ${scale.toFixed(2)}x`);
  };

  const handleTap = () => {
    addToLog('Single tap');
    triggerHaptic('light');
  };

  const handleDoubleTap = () => {
    addToLog('Double tap');
    triggerHaptic('medium');
    setCurrentScale(currentScale === 1 ? 1.5 : 1);
  };

  const handleLongPress = () => {
    addToLog('Long press');
    triggerHaptic('heavy');
    setShowMenu(true);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Touch-Optimized Interactions
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience mobile-first touch gestures with haptic feedback and smooth animations.
            {!isTouchDevice() && ' (Use a touch device for the full experience)'}
          </p>
        </div>

        {/* Device Info */}
        <GlassCard className="p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {isTouchDevice() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Touch Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {'vibrate' in navigator ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Haptic Feedback</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {navigator.maxTouchPoints || 0}
              </div>
              <div className="text-sm text-gray-600">Max Touch Points</div>
            </div>
          </div>
        </GlassCard>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Interactive Demo Area */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Interactive Demo Card
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Try these gestures on the card below:
              </p>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-6 relative overflow-hidden">
                <TouchOptimized
                  onSwipeLeft={() => handleSwipe('left')}
                  onSwipeRight={() => handleSwipe('right')}
                  onSwipeUp={() => handleSwipe('up')}
                  onSwipeDown={() => handleSwipe('down')}
                  onPinch={handlePinch}
                  onTap={handleTap}
                  onDoubleTap={handleDoubleTap}
                  onLongPress={handleLongPress}
                  className="w-full"
                >
                  <motion.div
                    className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg p-8 text-white text-center cursor-pointer"
                    animate={{
                      scale: currentScale,
                      x: cardPosition.x,
                      y: cardPosition.y
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="text-2xl font-bold mb-2">Touch Me!</div>
                    <div className="text-sm opacity-90">
                      Tap, swipe, pinch, or long press
                    </div>
                    <div className="text-xs opacity-75 mt-2">
                      Scale: {currentScale.toFixed(2)}x
                    </div>
                  </motion.div>
                </TouchOptimized>

                {/* Context Menu */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-10"
                      variants={mobileAnimationVariants.scale}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <button
                        onClick={() => {
                          addToLog('Menu: Reset');
                          resetDemo();
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        Reset Demo
                      </button>
                      <button
                        onClick={() => {
                          addToLog('Menu: Test Haptic');
                          triggerHaptic('success');
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        Test Haptic
                      </button>
                      <button
                        onClick={() => setShowMenu(false)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-red-600"
                      >
                        Close Menu
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Gesture Guide */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div>• Single tap: Basic interaction</div>
                <div>• Double tap: Zoom toggle</div>
                <div>• Long press: Context menu</div>
                <div>• Swipe: Move card</div>
                <div>• Pinch: Scale (2 fingers)</div>
                <div>• All gestures have haptic feedback</div>
              </div>
            </GlassCard>

            {/* Touch Buttons */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Touch-Optimized Buttons
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <TouchOptimized
                  onTap={() => {
                    addToLog('Primary button tapped');
                    triggerHaptic('medium');
                  }}
                  feedbackScale={0.92}
                >
                  <div className="bg-blue-500 text-white rounded-lg p-4 text-center font-medium">
                    Primary Action
                  </div>
                </TouchOptimized>

                <TouchOptimized
                  onTap={() => {
                    addToLog('Secondary button tapped');
                    triggerHaptic('light');
                  }}
                  feedbackScale={0.95}
                >
                  <div className="bg-gray-200 text-gray-800 rounded-lg p-4 text-center font-medium">
                    Secondary
                  </div>
                </TouchOptimized>

                <TouchOptimized
                  onTap={() => {
                    addToLog('Success button tapped');
                    triggerHaptic('success');
                  }}
                  feedbackScale={0.93}
                >
                  <div className="bg-green-500 text-white rounded-lg p-4 text-center font-medium">
                    Success
                  </div>
                </TouchOptimized>

                <TouchOptimized
                  onTap={() => {
                    addToLog('Danger button tapped');
                    triggerHaptic('error');
                  }}
                  feedbackScale={0.90}
                >
                  <div className="bg-red-500 text-white rounded-lg p-4 text-center font-medium">
                    Danger
                  </div>
                </TouchOptimized>
              </div>
            </GlassCard>
          </div>

          {/* Gesture Log */}
          <div>
            <GlassCard className="p-6 h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Gesture Log
                </h3>
                <button
                  onClick={resetDemo}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Log
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {gestureLog.map((entry, index) => (
                    <motion.div
                      key={`${entry}-${index}`}
                      className="bg-white/50 rounded-lg p-3 text-sm"
                      variants={mobileAnimationVariants.slideUp}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      layout
                    >
                      {entry}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {gestureLog.length === 0 && (
                  <div className="text-gray-500 text-center py-8">
                    No gestures detected yet.
                    <br />
                    Try interacting with the demo card above!
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Performance Info */}
        <GlassCard className="p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Mobile Performance Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <strong className="text-gray-800">Optimized Animations:</strong> Reduced duration and complexity on mobile devices
            </div>
            <div>
              <strong className="text-gray-800">Haptic Feedback:</strong> Native vibration patterns for different interaction types
            </div>
            <div>
              <strong className="text-gray-800">Touch Targets:</strong> Minimum 44px touch targets for accessibility
            </div>
            <div>
              <strong className="text-gray-800">Gesture Recognition:</strong> Swipe, pinch, tap, and long press detection
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default TouchInteractionDemo;