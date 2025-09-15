// Friends system component for managing friendships and viewing profiles

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FriendProfile, Friend } from '../../types/social';
import { socialService } from '../../services/socialService';
import { AnimatedButton } from '../shared/AnimatedButton';
import { Tooltip } from '../shared/Tooltip';

interface FriendsSystemProps {
  userId: string;
  className?: string;
}

export const FriendsSystem: React.FC<FriendsSystemProps> = ({
  userId,
  className = ''
}) => {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, [userId]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await socialService.getFriends(userId);
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const _handleSendFriendRequest = async (targetUserId: string) => {
    try {
      setSendingRequest(targetUserId);
      await socialService.sendFriendRequest(userId, targetUserId);
      
      // Show success message or update UI
      setSearchQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
    } finally {
      setSendingRequest(null);
    }
  };

  const getSpecializationIcon = (specialization?: string) => {
    const icons = {
      scholar: '📚',
      explorer: '🗺️',
      guardian: '🛡️',
      artist: '🎨',
      diplomat: '🤝',
      inventor: '⚙️'
    };
    return specialization ? icons[specialization as keyof typeof icons] || '⭐' : '⭐';
  };

  const getOnlineStatus = (isOnline: boolean, lastActive: Date) => {
    if (isOnline) return { text: 'Online', color: 'text-green-500', dot: 'bg-green-500' };
    
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return { text: `${diffMinutes}m ago`, color: 'text-yellow-500', dot: 'bg-yellow-500' };
    if (diffMinutes < 1440) return { text: `${Math.floor(diffMinutes / 60)}h ago`, color: 'text-orange-500', dot: 'bg-orange-500' };
    return { text: 'Offline', color: 'text-slate-400', dot: 'bg-slate-400' };
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">👥 Friends</h3>
            <p className="text-blue-100 text-sm">{friends.length} friends</p>
          </div>
          <button
            onClick={loadFriends}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors"
            title="Refresh friends list"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: 'friends', label: 'Friends', icon: '👥' },
          { key: 'requests', label: 'Requests', icon: '📨' },
          { key: 'add', label: 'Add Friends', icon: '➕' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
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

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'friends' && (
          <div>
            {/* Search */}
            <div className="p-4 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Friends List */}
            <AnimatePresence>
              {filteredFriends.map((friend, index) => {
                const status = getOnlineStatus(friend.isOnline, friend.lastActive);
                
                return (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Online Status Dot */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${status.dot} rounded-full border-2 border-white`}></div>
                      </div>

                      {/* Friend Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900 truncate">{friend.name}</span>
                          <Tooltip content={`${friend.specialization || 'No specialization'} - Level ${friend.level}`}>
                            <span className="text-sm text-slate-500">
                              {getSpecializationIcon(friend.specialization)} Lv.{friend.level}
                            </span>
                          </Tooltip>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                          <span className={status.color}>{status.text}</span>
                          <span>{friend.totalXP.toLocaleString()} Total XP</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Tooltip content="View Profile">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                            👤
                          </button>
                        </Tooltip>
                        <Tooltip content="Send Message">
                          <button className="p-2 text-slate-400 hover:text-green-600 transition-colors">
                            💬
                          </button>
                        </Tooltip>
                        <Tooltip content="Challenge to Learning Duel">
                          <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
                            ⚔️
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {filteredFriends.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-sm">
                  {searchQuery ? 'No friends found matching your search' : 'No friends yet'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? 'Try a different search term' : 'Add some friends to start learning together!'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="p-8 text-center text-slate-500">
            <div className="text-4xl mb-2">📨</div>
            <p className="text-sm">Friend requests feature coming soon!</p>
            <p className="text-xs text-slate-400 mt-1">
              You'll be able to manage incoming and outgoing friend requests here.
            </p>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Find friends by username or email
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <AnimatedButton
                  onClick={() => {/* TODO: Implement search */}}
                  variant="primary"
                  size="sm"
                >
                  Search
                </AnimatedButton>
              </div>
            </div>

            <div className="text-center text-slate-500 py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm">Search for friends feature coming soon!</p>
              <p className="text-xs text-slate-400 mt-1">
                You'll be able to find and add friends by their username or email.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs text-slate-500">
          Learn together with friends • Compete in challenges • Share achievements
        </p>
      </div>
    </div>
  );
};