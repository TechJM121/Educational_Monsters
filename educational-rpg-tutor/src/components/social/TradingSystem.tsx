// Trading system component for item trading with approval workflows

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TradeRequest, TradeItem, FriendProfile } from '../../types/social';
import { CollectibleItem } from '../../types/achievement';
import { socialService } from '../../services/socialService';
import { AnimatedButton } from '../shared/AnimatedButton';
import { Tooltip } from '../shared/Tooltip';

interface TradingSystemProps {
  userId: string;
  userInventory: CollectibleItem[];
  className?: string;
}

export const TradingSystem: React.FC<TradingSystemProps> = ({
  userId,
  userInventory,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'incoming' | 'outgoing' | 'history'>('create');
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [selectedUserItems, setSelectedUserItems] = useState<CollectibleItem[]>([]);
  const [selectedFriendItems, setSelectedFriendItems] = useState<CollectibleItem[]>([]);
  const [, setTradeRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
    loadTradeRequests();
  }, [userId]);

  const loadFriends = async () => {
    try {
      const data = await socialService.getFriends(userId);
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    }
  };

  const loadTradeRequests = async () => {
    try {
      // TODO: Implement getTradeRequests in socialService
      // const data = await socialService.getTradeRequests(userId);
      // setTradeRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trade requests');
    }
  };

  const handleCreateTrade = async () => {
    if (!selectedFriend || selectedUserItems.length === 0) {
      setError('Please select a friend and at least one item to trade');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fromItems: TradeItem[] = selectedUserItems.map(item => ({
        inventoryItemId: item.id,
        itemId: item.id,
        itemName: item.name,
        rarity: item.rarity,
        category: item.category,
        quantity: 1
      }));

      const toItems: TradeItem[] = selectedFriendItems.map(item => ({
        inventoryItemId: item.id,
        itemId: item.id,
        itemName: item.name,
        rarity: item.rarity,
        category: item.category,
        quantity: 1
      }));

      await socialService.createTradeRequest(userId, selectedFriend.id, fromItems, toItems);
      
      // Reset form
      setSelectedFriend(null);
      setSelectedUserItems([]);
      setSelectedFriendItems([]);
      setActiveTab('outgoing');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trade request');
    } finally {
      setLoading(false);
    }
  };

  const _handleAcceptTrade = async (tradeId: string) => {
    try {
      setLoading(true);
      await socialService.acceptTradeRequest(tradeId);
      await loadTradeRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept trade');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50',
      uncommon: 'border-green-300 bg-green-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      spell_book: '📚',
      potion: '🧪',
      artifact: '💎',
      equipment: '⚔️'
    };
    return icons[category as keyof typeof icons] || '📦';
  };

  const tradeableItems = userInventory.filter(item => item.tradeable);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">🔄 Trading Post</h3>
            <p className="text-orange-100 text-sm">Trade items with friends</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-orange-100">Tradeable Items</div>
            <div className="text-lg font-bold">{tradeableItems.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: 'create', label: 'Create Trade', icon: '➕' },
          { key: 'incoming', label: 'Incoming', icon: '📥' },
          { key: 'outgoing', label: 'Outgoing', icon: '📤' },
          { key: 'history', label: 'History', icon: '📜' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
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
        {activeTab === 'create' && (
          <div className="p-4 space-y-4">
            {/* Friend Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select a friend to trade with
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`p-2 rounded-lg border-2 transition-colors text-left ${
                      selectedFriend?.id === friend.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{friend.name}</div>
                        <div className="text-xs text-slate-500">Lv.{friend.level}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Your Items */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your items to trade ({selectedUserItems.length} selected)
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {tradeableItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (selectedUserItems.includes(item)) {
                        setSelectedUserItems(prev => prev.filter(i => i.id !== item.id));
                      } else {
                        setSelectedUserItems(prev => [...prev, item]);
                      }
                    }}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      selectedUserItems.includes(item)
                        ? 'border-orange-500 bg-orange-50'
                        : `border-slate-200 hover:border-slate-300 ${getRarityColor(item.rarity)}`
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{getCategoryIcon(item.category)}</div>
                      <div className="text-xs font-medium truncate">{item.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{item.rarity}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Friend's Items (placeholder) */}
            {selectedFriend && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {selectedFriend.name}'s items you want
                </label>
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="text-sm">Friend's inventory viewing coming soon!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    You'll be able to browse your friend's tradeable items here.
                  </p>
                </div>
              </div>
            )}

            {/* Create Trade Button */}
            <div className="pt-4 border-t border-slate-200">
              <AnimatedButton
                onClick={handleCreateTrade}
                disabled={!selectedFriend || selectedUserItems.length === 0 || loading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Trade...</span>
                  </div>
                ) : (
                  'Create Trade Request'
                )}
              </AnimatedButton>
            </div>
          </div>
        )}

        {activeTab === 'incoming' && (
          <div className="p-8 text-center text-slate-500">
            <div className="text-4xl mb-2">📥</div>
            <p className="text-sm">No incoming trade requests</p>
            <p className="text-xs text-slate-400 mt-1">
              Trade requests from friends will appear here.
            </p>
          </div>
        )}

        {activeTab === 'outgoing' && (
          <div className="p-8 text-center text-slate-500">
            <div className="text-4xl mb-2">📤</div>
            <p className="text-sm">No outgoing trade requests</p>
            <p className="text-xs text-slate-400 mt-1">
              Your pending trade requests will appear here.
            </p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-8 text-center text-slate-500">
            <div className="text-4xl mb-2">📜</div>
            <p className="text-sm">No trade history</p>
            <p className="text-xs text-slate-400 mt-1">
              Your completed trades will be recorded here.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Only tradeable items can be exchanged</span>
          <span>Parental approval may be required</span>
        </div>
      </div>
    </div>
  );
};