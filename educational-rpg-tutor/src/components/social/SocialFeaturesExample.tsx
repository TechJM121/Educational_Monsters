// Example component showing how to integrate guest feature gates with social features

import React, { useState } from 'react';
import { GuestFeatureGate } from '../auth/GuestFeatureGate';
import { GuestConversionModal } from '../auth/GuestConversionModal';

export function SocialFeaturesExample() {
  const [showConversionModal, setShowConversionModal] = useState(false);

  const handleUpgradeClick = () => {
    setShowConversionModal(true);
  };

  const handleConversionSuccess = (user: any) => {
    console.log('Account created successfully:', user);
    setShowConversionModal(false);
    // Refresh the page or update auth state
  };

  return (
    <div className="social-features-container space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Social Features</h2>

      {/* Friends Feature */}
      <div className="feature-section">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Friends</h3>
        <GuestFeatureGate 
          feature="friends" 
          onUpgradeClick={handleUpgradeClick}
        >
          <div className="friends-list bg-white p-4 rounded-lg border">
            <p className="text-gray-600 mb-3">Your Friends:</p>
            <div className="space-y-2">
              <div className="friend-item flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <span>Alex the Scholar</span>
                <span className="text-sm text-gray-500">Level 15</span>
              </div>
              <div className="friend-item flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <span>Jordan the Explorer</span>
                <span className="text-sm text-gray-500">Level 12</span>
              </div>
            </div>
            <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add Friend
            </button>
          </div>
        </GuestFeatureGate>
      </div>

      {/* Trading Feature */}
      <div className="feature-section">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Item Trading</h3>
        <GuestFeatureGate 
          feature="trading" 
          onUpgradeClick={handleUpgradeClick}
        >
          <div className="trading-interface bg-white p-4 rounded-lg border">
            <p className="text-gray-600 mb-3">Trade your items with friends:</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="your-items">
                <h4 className="font-medium mb-2">Your Items</h4>
                <div className="space-y-1">
                  <div className="item p-2 bg-purple-100 rounded text-sm">Magic Scroll</div>
                  <div className="item p-2 bg-blue-100 rounded text-sm">Wisdom Potion</div>
                </div>
              </div>
              <div className="friend-items">
                <h4 className="font-medium mb-2">Friend's Items</h4>
                <div className="space-y-1">
                  <div className="item p-2 bg-green-100 rounded text-sm">Health Elixir</div>
                  <div className="item p-2 bg-yellow-100 rounded text-sm">Speed Boots</div>
                </div>
              </div>
            </div>
            <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Propose Trade
            </button>
          </div>
        </GuestFeatureGate>
      </div>

      {/* Learning Challenges */}
      <div className="feature-section">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Learning Challenges</h3>
        <GuestFeatureGate 
          feature="challenges" 
          onUpgradeClick={handleUpgradeClick}
        >
          <div className="challenges-list bg-white p-4 rounded-lg border">
            <p className="text-gray-600 mb-3">Active Challenges:</p>
            <div className="space-y-3">
              <div className="challenge-item p-3 bg-orange-50 border border-orange-200 rounded">
                <h4 className="font-medium text-orange-800">Math Marathon</h4>
                <p className="text-sm text-orange-600">Solve 50 math problems this week</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-orange-500">25/50 completed</span>
                  <button className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600">
                    Join Challenge
                  </button>
                </div>
              </div>
              <div className="challenge-item p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-800">Science Quest</h4>
                <p className="text-sm text-blue-600">Complete 3 science experiments</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-blue-500">1/3 completed</span>
                  <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                    Join Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </GuestFeatureGate>
      </div>

      {/* Leaderboards (allowed for guests) */}
      <div className="feature-section">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Leaderboards</h3>
        <GuestFeatureGate 
          feature="leaderboards" 
          onUpgradeClick={handleUpgradeClick}
        >
          <div className="leaderboard bg-white p-4 rounded-lg border">
            <p className="text-gray-600 mb-3">Weekly XP Leaders:</p>
            <div className="space-y-2">
              <div className="leader-item flex items-center justify-between p-2 bg-yellow-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-yellow-600">1st</span>
                  <span>Sarah the Sage</span>
                </div>
                <span className="text-sm font-medium">2,450 XP</span>
              </div>
              <div className="leader-item flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-600">2nd</span>
                  <span>Mike the Mathematician</span>
                </div>
                <span className="text-sm font-medium">2,100 XP</span>
              </div>
              <div className="leader-item flex items-center justify-between p-2 bg-orange-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-orange-600">3rd</span>
                  <span>Emma the Explorer</span>
                </div>
                <span className="text-sm font-medium">1,875 XP</span>
              </div>
            </div>
          </div>
        </GuestFeatureGate>
      </div>

      {/* Conversion Modal */}
      <GuestConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        onSuccess={handleConversionSuccess}
      />
    </div>
  );
}