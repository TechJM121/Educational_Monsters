import React, { useState, useEffect } from 'react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { NotificationSystem } from '../components/shared/NotificationSystem';
import { ConnectionStatus } from '../components/shared/ConnectionStatus';
import type { Character } from '../types/character';

/**
 * Demo component showing real-time sync functionality
 * This demonstrates all the key features implemented in task 11:
 * - Real-time character updates
 * - Offline support with local caching
 * - Notification system
 * - Connection status monitoring
 * - Conflict resolution
 */
export const RealtimeSyncDemo: React.FC<{ userId: string }> = ({ userId }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const {
    isOnline,
    isConnected,
    pendingActionCount,
    syncInProgress,
    notifications,
    dismissNotification,
    syncCharacter,
    onCharacterUpdate,
    queueOfflineAction,
    syncNow,
    getCachedData
  } = useRealtimeSync({
    userId,
    enabled: true
  }, {});

  // Set up character update callback
  useEffect(() => {
    onCharacterUpdate((update) => {
      setLogs(prev => [...prev, `Character updated: Level ${update.level}, XP ${update.totalXP}`]);
      
      if (character) {
        setCharacter(prev => prev ? {
          ...prev,
          level: update.level || prev.level,
          totalXP: update.totalXP || prev.totalXP,
          currentXP: update.currentXP || prev.currentXP,
          stats: update.stats || prev.stats
        } : null);
      }
    });
  }, [onCharacterUpdate, character]);

  // Log connection changes
  useEffect(() => {
    setLogs(prev => [...prev, `Connection: ${isOnline ? 'Online' : 'Offline'}, Connected: ${isConnected}`]);
  }, [isOnline, isConnected]);

  // Create a demo character
  const createDemoCharacter = () => {
    const demoCharacter: Character = {
      id: `char-${Date.now()}`,
      userId: userId,
      name: 'Demo Character',
      level: 1,
      totalXP: 0,
      currentXP: 0,
      avatarConfig: {
        hairStyle: 'short',
        hairColor: 'brown',
        skinTone: 'medium',
        eyeColor: 'blue',
        outfit: 'casual',
        accessories: []
      },
      stats: {
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        charisma: 10,
        dexterity: 10,
        creativity: 10,
        availablePoints: 0
      },
      equippedItems: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCharacter(demoCharacter);
    syncCharacter(demoCharacter);
    setLogs(prev => [...prev, 'Demo character created and synced']);
  };

  // Simulate earning XP
  const earnXP = () => {
    if (!character) return;

    const xpAmount = 100;
    const newTotalXP = character.totalXP + xpAmount;
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    // Update local character
    const updatedCharacter = {
      ...character,
      totalXP: newTotalXP,
      level: newLevel,
      currentXP: newTotalXP % 100
    };

    setCharacter(updatedCharacter);

    // Queue offline action (will sync immediately if online)
    queueOfflineAction({
      type: 'xp_award',
      payload: {
        characterId: character.id,
        xpAmount: xpAmount,
        source: 'demo'
      }
    });

    setLogs(prev => [...prev, `Earned ${xpAmount} XP. New total: ${newTotalXP}`]);
  };

  // Simulate going offline
  const simulateOffline = () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    window.dispatchEvent(new Event('offline'));
    setLogs(prev => [...prev, 'Simulated going offline']);
  };

  // Simulate coming back online
  const simulateOnline = () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    window.dispatchEvent(new Event('online'));
    setLogs(prev => [...prev, 'Simulated coming back online']);
  };

  // Get cached data
  const showCachedData = () => {
    const cached = getCachedData();
    setLogs(prev => [...prev, `Cached data: ${JSON.stringify(cached, null, 2)}`]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Real-time Sync Demo</h1>
      
      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionStatus
          isOnline={isOnline}
          pendingActionCount={pendingActionCount}
          syncInProgress={syncInProgress}
          className="inline-flex"
        />
      </div>

      {/* Character Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Character</h2>
        {character ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {character.name}</p>
              <p><strong>Level:</strong> {character.level}</p>
              <p><strong>Total XP:</strong> {character.totalXP}</p>
              <p><strong>Current XP:</strong> {character.currentXP}</p>
            </div>
            <div>
              <p><strong>Intelligence:</strong> {character.stats.intelligence}</p>
              <p><strong>Vitality:</strong> {character.stats.vitality}</p>
              <p><strong>Wisdom:</strong> {character.stats.wisdom}</p>
              <p><strong>Available Points:</strong> {character.stats.availablePoints}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No character created</p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={createDemoCharacter}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Demo Character
          </button>
          <button
            onClick={earnXP}
            disabled={!character}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Earn 100 XP
          </button>
          <button
            onClick={simulateOffline}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Go Offline
          </button>
          <button
            onClick={simulateOnline}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Go Online
          </button>
          <button
            onClick={syncNow}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Sync Now
          </button>
          <button
            onClick={showCachedData}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Show Cached Data
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Online:</strong> {isOnline ? 'Yes' : 'No'}</p>
            <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p><strong>Pending Actions:</strong> {pendingActionCount}</p>
            <p><strong>Sync in Progress:</strong> {syncInProgress ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
        <div className="max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No activity yet</p>
          ) : (
            <ul className="space-y-1">
              {logs.slice(-20).reverse().map((log, index) => (
                <li key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {new Date().toLocaleTimeString()}: {log}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => setLogs([])}
          className="mt-3 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Clear Log
        </button>
      </div>

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
};