// Parental controls component for managing social interactions

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParentalControl } from '../../types/social';
import { socialService } from '../../services/socialService';
import { AnimatedButton } from '../shared/AnimatedButton';
import { Tooltip } from '../shared/Tooltip';

interface ParentalControlsProps {
  userId: string;
  isParent: boolean;
  className?: string;
}

export const ParentalControls: React.FC<ParentalControlsProps> = ({
  userId,
  isParent,
  className = ''
}) => {
  const [controls, setControls] = useState<ParentalControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    loadParentalControls();
  }, [userId]);

  const loadParentalControls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await socialService.getParentalControls(userId);
      setControls(data || getDefaultControls());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parental controls');
      setControls(getDefaultControls());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultControls = (): ParentalControl => ({
    id: '',
    userId,
    parentId: '',
    allowFriendRequests: true,
    allowTrading: true,
    allowChallenges: true,
    allowLeaderboards: true,
    restrictedUsers: [],
    approvalRequired: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const handleControlChange = (key: keyof ParentalControl, value: any) => {
    if (!controls) return;

    setControls(prev => prev ? { ...prev, [key]: value } : null);
    setUnsavedChanges(true);
  };

  const handleSaveControls = async () => {
    if (!controls) return;

    try {
      setSaving(true);
      setError(null);

      const updatedControls = await socialService.updateParentalControls(controls);
      setControls(updatedControls);
      setUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save parental controls');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setControls(getDefaultControls());
    setUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-200">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="w-12 h-6 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isParent) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-slate-500">
          <div className="text-4xl mb-2">🔒</div>
          <p className="text-sm">Access Restricted</p>
          <p className="text-xs text-slate-400 mt-1">
            Only parents and teachers can access these controls.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">🛡️ Parental Controls</h3>
            <p className="text-indigo-100 text-sm">Manage your child's social interactions</p>
          </div>
          {unsavedChanges && (
            <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium">
              Unsaved Changes
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-6 space-y-6">
        {/* Social Features Toggle */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Social Features</h4>
          <div className="space-y-4">
            {[
              {
                key: 'allowFriendRequests' as const,
                label: 'Friend Requests',
                description: 'Allow your child to send and receive friend requests',
                icon: '👥'
              },
              {
                key: 'allowTrading' as const,
                label: 'Item Trading',
                description: 'Allow your child to trade items with friends',
                icon: '🔄'
              },
              {
                key: 'allowChallenges' as const,
                label: 'Learning Challenges',
                description: 'Allow your child to participate in competitive learning challenges',
                icon: '⚔️'
              },
              {
                key: 'allowLeaderboards' as const,
                label: 'Leaderboards',
                description: 'Show your child on class leaderboards and rankings',
                icon: '🏆'
              }
            ].map((setting) => (
              <motion.div
                key={setting.key}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{setting.icon}</span>
                  <div>
                    <div className="font-medium text-slate-900">{setting.label}</div>
                    <div className="text-sm text-slate-600">{setting.description}</div>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={controls?.[setting.key] || false}
                    onChange={(e) => handleControlChange(setting.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Approval Settings */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Approval Settings</h4>
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-medium text-slate-900">Require Approval</div>
                  <div className="text-sm text-slate-600">
                    Require your approval for trades and friend requests
                  </div>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={controls?.approvalRequired || false}
                  onChange={(e) => handleControlChange('approvalRequired', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </motion.div>
          </div>
        </div>

        {/* Restricted Users */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Blocked Users</h4>
          <div className="border border-slate-200 rounded-lg p-4">
            {controls?.restrictedUsers && controls.restrictedUsers.length > 0 ? (
              <div className="space-y-2">
                {controls.restrictedUsers.map((userId, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-700">User ID: {userId}</span>
                    <button
                      onClick={() => {
                        const newRestricted = controls.restrictedUsers.filter((_, i) => i !== index);
                        handleControlChange('restrictedUsers', newRestricted);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-4">
                <div className="text-2xl mb-2">👤</div>
                <p className="text-sm">No blocked users</p>
                <p className="text-xs text-slate-400 mt-1">
                  Blocked users will appear here and won't be able to interact with your child.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-slate-200">
          <AnimatedButton
            onClick={handleSaveControls}
            disabled={!unsavedChanges || saving}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            {saving ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </AnimatedButton>

          <AnimatedButton
            onClick={handleResetToDefaults}
            variant="secondary"
            size="lg"
          >
            Reset to Defaults
          </AnimatedButton>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-lg">ℹ️</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Safety Information</p>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• All social interactions are monitored for safety</li>
                <li>• You can review your child's activity at any time</li>
                <li>• Changes take effect immediately</li>
                <li>• Your child will be notified of any restrictions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};