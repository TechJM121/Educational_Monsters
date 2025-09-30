import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../modern-ui/GlassCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useContextualSounds } from '../../hooks/useContextualSounds';
import type { UnlockableItem } from '../../types/monster';
import { MONSTER_UNLOCKABLES, getUnlockablesByType, getUnlockablesByRarity } from '../../data/monsterUnlockables';

interface UnlockablesGridProps {
    unlockedItems: string[];
    playerLevel: number;
    playerXP: number;
    playerAchievements: string[];
    onItemSelect?: (item: UnlockableItem) => void;
    filterType?: string;
    filterRarity?: string;
    showLocked?: boolean;
}

const rarityColors = {
    common: 'from-gray-500 to-gray-400',
    uncommon: 'from-green-500 to-green-400',
    rare: 'from-blue-500 to-blue-400',
    epic: 'from-purple-500 to-purple-400',
    legendary: 'from-yellow-500 to-orange-400',
    mythic: 'from-pink-500 to-rose-400'
};

const typeIcons: Record<string, string> = {
    color: '🎨',
    pattern: '🌟',
    accessory: '👑',
    effect: '✨',
    bodyPart: '🦋',
    species: '🐾',
    size: '📏',
    ability: '⚡'
};

export function UnlockablesGrid({
    unlockedItems,
    playerLevel,
    playerXP,
    playerAchievements,
    onItemSelect,
    filterType,
    filterRarity,
    showLocked = true
}: UnlockablesGridProps) {
    const [selectedItem, setSelectedItem] = useState<UnlockableItem | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'type' | 'unlock'>('rarity');
    const prefersReducedMotion = useReducedMotion();
    const { playContextualSound } = useContextualSounds();

    // Filter items based on props
    let filteredItems = MONSTER_UNLOCKABLES;

    if (filterType) {
        filteredItems = getUnlockablesByType(filterType);
    }

    if (filterRarity) {
        filteredItems = getUnlockablesByRarity(filterRarity);
    }

    // Filter out locked items if showLocked is false
    if (!showLocked) {
        filteredItems = filteredItems.filter(item =>
            unlockedItems.includes(item.id) || isItemAvailable(item)
        );
    }

    // Sort items
    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'rarity':
                const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
                return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
            case 'type':
                return a.type.localeCompare(b.type);
            case 'unlock':
                const aUnlocked = unlockedItems.includes(a.id);
                const bUnlocked = unlockedItems.includes(b.id);
                if (aUnlocked && !bUnlocked) return -1;
                if (!aUnlocked && bUnlocked) return 1;
                return 0;
            default:
                return 0;
        }
    });

    function isItemAvailable(item: UnlockableItem): boolean {
        const condition = item.unlockCondition;

        switch (condition.type) {
            case 'level':
                return playerLevel >= (condition.requirement as number);
            case 'xp':
                return playerXP >= (condition.requirement as number);
            case 'achievement':
                return playerAchievements.includes(condition.requirement as string);
            case 'bond':
                // This would need to be passed as a prop or calculated differently
                return false;
            case 'time':
            case 'special':
                // These would need special handling
                return false;
            default:
                return false;
        }
    }

    function getItemStatus(item: UnlockableItem): 'unlocked' | 'available' | 'locked' {
        if (unlockedItems.includes(item.id)) return 'unlocked';
        if (isItemAvailable(item)) return 'available';
        return 'locked';
    }

    const handleItemClick = (item: UnlockableItem) => {
        const status = getItemStatus(item);

        if (status === 'unlocked' || status === 'available') {
            playContextualSound('ui_select');
            setSelectedItem(item);
            onItemSelect?.(item);
        } else {
            playContextualSound('ui_error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: prefersReducedMotion ? 0.1 : 0.3 }
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-white font-medium">
                        {sortedItems.length} items
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                        <span>Unlocked: {sortedItems.filter(item => unlockedItems.includes(item.id)).length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                        <span>Available: {sortedItems.filter(item => !unlockedItems.includes(item.id) && isItemAvailable(item)).length}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-primary-400"
                    >
                        <option value="rarity">Sort by Rarity</option>
                        <option value="name">Sort by Name</option>
                        <option value="type">Sort by Type</option>
                        <option value="unlock">Sort by Status</option>
                    </select>
                </div>
            </div>

            {/* Items Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
                {sortedItems.map((item) => {
                    const status = getItemStatus(item);
                    const isSelected = selectedItem?.id === item.id;

                    return (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            whileHover={{
                                scale: prefersReducedMotion ? 1 : 1.05,
                                y: prefersReducedMotion ? 0 : -2
                            }}
                            whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                            onClick={() => handleItemClick(item)}
                            className={`cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-primary-400' : ''
                                }`}
                        >
                            <GlassCard
                                blur="md"
                                opacity={0.1}
                                className={`p-4 border transition-all duration-300 relative overflow-hidden ${status === 'unlocked'
                                    ? 'border-green-400/50 bg-green-500/10'
                                    : status === 'available'
                                        ? 'border-yellow-400/50 bg-yellow-500/10 hover:border-yellow-300/50'
                                        : 'border-slate-600/30 bg-slate-800/30 opacity-60'
                                    }`}
                            >
                                {/* Rarity indicator */}
                                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r ${rarityColors[item.rarity]}`} />

                                {/* Type indicator */}
                                <div className="absolute top-2 left-2 text-lg">
                                    {typeIcons[item.type] || '❓'}
                                </div>

                                {/* Status indicator */}
                                <div className="absolute bottom-2 right-2">
                                    {status === 'unlocked' && (
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    {status === 'available' && (
                                        <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">!</span>
                                        </div>
                                    )}
                                    {status === 'locked' && (
                                        <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">🔒</span>
                                        </div>
                                    )}
                                </div>

                                {/* Lock overlay for locked items */}
                                {status === 'locked' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                        <div className="text-center">
                                            <div className="text-2xl mb-1">🔒</div>
                                            <div className="text-xs text-white px-2 text-center">
                                                {item.unlockCondition.description}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="text-center pt-6">
                                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                        {item.icon}
                                    </div>
                                    <div className="text-sm text-white font-medium mb-1 truncate">
                                        {item.name}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full inline-block bg-gradient-to-r ${rarityColors[item.rarity]} text-white capitalize`}>
                                        {item.rarity}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Item Details Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md"
                        >
                            <GlassCard blur="lg" opacity={0.1} className="p-6">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">{selectedItem.icon}</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h3>
                                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${rarityColors[selectedItem.rarity]} text-white capitalize mb-4`}>
                                        {selectedItem.rarity}
                                    </div>
                                    <p className="text-slate-300 mb-4">{selectedItem.description}</p>

                                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                                        <h4 className="text-white font-medium mb-2">Unlock Condition</h4>
                                        <p className="text-slate-300 text-sm">{selectedItem.unlockCondition.description}</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            className="flex-1 px-4 py-2 bg-slate-600/50 hover:bg-slate-500/50 text-white rounded-lg transition-all duration-300"
                                        >
                                            Close
                                        </button>
                                        {getItemStatus(selectedItem) !== 'locked' && (
                                            <button
                                                onClick={() => {
                                                    onItemSelect?.(selectedItem);
                                                    setSelectedItem(null);
                                                }}
                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg transition-all duration-300"
                                            >
                                                Use Item
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {sortedItems.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
                    <p className="text-slate-300">Try adjusting your filters or unlock more items by progressing in the game.</p>
                </div>
            )}
        </div>
    );
}