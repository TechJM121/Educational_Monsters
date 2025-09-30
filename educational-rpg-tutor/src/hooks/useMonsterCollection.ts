import { useState, useEffect, useCallback } from 'react';
import type { Monster, MonsterCollection, MonsterCustomization, UnlockableItem } from '../types/monster';
import { getAvailableUnlocks } from '../data/monsterUnlockables';

interface UseMonsterCollectionReturn {
  collection: MonsterCollection | null;
  monsters: Monster[];
  activeMonster: Monster | null;
  unlockedItems: string[];
  availableUnlocks: UnlockableItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createMonster: (monster: Omit<Monster, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Monster>;
  updateMonster: (id: string, updates: Partial<Monster>) => Promise<void>;
  deleteMonster: (id: string) => Promise<void>;
  setActiveMonster: (id: string) => Promise<void>;
  updateCustomization: (id: string, customization: MonsterCustomization) => Promise<void>;
  unlockItem: (itemId: string) => Promise<void>;
  
  // Utilities
  getMonsterById: (id: string) => Monster | undefined;
  getMonstersBySpecies: (species: string) => Monster[];
  getTotalBondPoints: () => number;
  getCollectionLevel: () => number;
}

// Mock data for development - replace with actual API calls
const mockCollection: MonsterCollection = {
  userId: 'user1',
  monsters: [],
  unlockedItems: [
    {
      id: 'color_crimson',
      type: 'color',
      category: 'basic_colors',
      itemId: 'color_crimson',
      unlockedAt: new Date(),
      unlockCondition: {
        type: 'level',
        requirement: 1,
        description: 'Available from the start'
      }
    }
  ],
  totalBondPoints: 0,
  collectionLevel: 1,
  achievements: []
};

export function useMonsterCollection(
  playerLevel: number = 1,
  playerXP: number = 0,
  playerAchievements: string[] = []
): UseMonsterCollectionReturn {
  const [collection, setCollection] = useState<MonsterCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize collection
  useEffect(() => {
    const initializeCollection = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setCollection(mockCollection);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load monster collection');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCollection();
  }, []);

  // Derived values
  const monsters = collection?.monsters || [];
  const activeMonster = monsters.find(m => m.isActive) || null;
  const unlockedItems = collection?.unlockedItems.map(item => item.id) || [];
  const availableUnlocks = getAvailableUnlocks(playerLevel, playerXP, playerAchievements, activeMonster?.bond || 0);

  // Actions
  const createMonster = useCallback(async (monsterData: Omit<Monster, 'id' | 'createdAt' | 'updatedAt'>): Promise<Monster> => {
    if (!collection) throw new Error('Collection not initialized');

    const newMonster: Monster = {
      ...monsterData,
      id: `monster_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCollection(prev => prev ? {
      ...prev,
      monsters: [...prev.monsters, newMonster]
    } : null);

    return newMonster;
  }, [collection]);

  const updateMonster = useCallback(async (id: string, updates: Partial<Monster>): Promise<void> => {
    if (!collection) throw new Error('Collection not initialized');

    setCollection(prev => prev ? {
      ...prev,
      monsters: prev.monsters.map(monster => 
        monster.id === id 
          ? { ...monster, ...updates, updatedAt: new Date() }
          : monster
      )
    } : null);
  }, [collection]);

  const deleteMonster = useCallback(async (id: string): Promise<void> => {
    if (!collection) throw new Error('Collection not initialized');

    setCollection(prev => prev ? {
      ...prev,
      monsters: prev.monsters.filter(monster => monster.id !== id)
    } : null);
  }, [collection]);

  const setActiveMonster = useCallback(async (id: string): Promise<void> => {
    if (!collection) throw new Error('Collection not initialized');

    setCollection(prev => prev ? {
      ...prev,
      monsters: prev.monsters.map(monster => ({
        ...monster,
        isActive: monster.id === id,
        updatedAt: new Date()
      })),
      activeMonster: id
    } : null);
  }, [collection]);

  const updateCustomization = useCallback(async (id: string, customization: MonsterCustomization): Promise<void> => {
    await updateMonster(id, { customization });
  }, [updateMonster]);

  const unlockItem = useCallback(async (itemId: string): Promise<void> => {
    if (!collection) throw new Error('Collection not initialized');

    // Check if item is already unlocked
    if (unlockedItems.includes(itemId)) return;

    const newUnlock = {
      id: `unlock_${Date.now()}`,
      type: 'color' as const, // This should be determined by the actual item
      category: 'unlocked',
      itemId,
      unlockedAt: new Date(),
      unlockCondition: {
        type: 'level' as const,
        requirement: 0,
        description: 'Manually unlocked'
      }
    };

    setCollection(prev => prev ? {
      ...prev,
      unlockedItems: [...prev.unlockedItems, newUnlock]
    } : null);
  }, [collection, unlockedItems]);

  // Utilities
  const getMonsterById = useCallback((id: string): Monster | undefined => {
    return monsters.find(monster => monster.id === id);
  }, [monsters]);

  const getMonstersBySpecies = useCallback((species: string): Monster[] => {
    return monsters.filter(monster => monster.species === species);
  }, [monsters]);

  const getTotalBondPoints = useCallback((): number => {
    return monsters.reduce((total, monster) => total + monster.bond, 0);
  }, [monsters]);

  const getCollectionLevel = useCallback((): number => {
    const totalBond = getTotalBondPoints();
    const monsterCount = monsters.length;
    const unlockedCount = unlockedItems.length;
    
    // Simple formula for collection level
    return Math.floor((totalBond + (monsterCount * 10) + (unlockedCount * 5)) / 100) + 1;
  }, [monsters, unlockedItems, getTotalBondPoints]);

  return {
    collection,
    monsters,
    activeMonster,
    unlockedItems,
    availableUnlocks,
    isLoading,
    error,
    
    // Actions
    createMonster,
    updateMonster,
    deleteMonster,
    setActiveMonster,
    updateCustomization,
    unlockItem,
    
    // Utilities
    getMonsterById,
    getMonstersBySpecies,
    getTotalBondPoints,
    getCollectionLevel
  };
}