import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassModal } from '../modern-ui/GlassModal';
import { ModernCharacterCustomization } from './ModernCharacterCustomization';
import { StatAllocation } from './StatAllocation';
import { SpecializationSelector } from './SpecializationSelector';
import { EquipmentSystem } from './EquipmentSystem';
import { RespecSystem } from './RespecSystem';
import { StatChangeAnimation } from './StatChangeAnimation';
import { EquipmentChangeAnimation } from './EquipmentChangeAnimation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useContextualSounds } from '../../hooks/useContextualSounds';
import type { Character, AvatarConfig, Specialization, CharacterStats } from '../../types/character';

interface StatChange {
    stat: string;
    oldValue: number;
    newValue: number;
    icon: string;
}

interface EquipmentChange {
    type: 'equipped' | 'unequipped';
    itemName: string;
    itemIcon: string;
    slot: string;
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface ModernCharacterCustomizationModalProps {
    character: Character;
    availableItems?: any[];
    respecTokens?: number;
    onUpdateAvatar: (avatarConfig: AvatarConfig) => Promise<void>;
    onAllocateStats: (allocations: Partial<Omit<CharacterStats, 'availablePoints'>>) => Promise<void>;
    onSelectSpecialization: (specialization: Specialization) => Promise<void>;
    onEquipItem: (itemId: string, slot: string) => Promise<void>;
    onUnequipItem: (slot: string) => Promise<void>;
    onRespec: (newStats: Partial<Omit<CharacterStats, 'availablePoints'>>) => Promise<void>;
    onClose: () => void;
    isLoading?: boolean;
}

type CustomizationTab = 'appearance' | 'stats' | 'specialization' | 'equipment' | 'respec';

export function ModernCharacterCustomizationModal({
    character,
    availableItems = [],
    respecTokens = 0,
    onUpdateAvatar,
    onAllocateStats,
    onSelectSpecialization,
    onEquipItem,
    onUnequipItem,
    onRespec,
    onClose,
    isLoading = false
}: ModernCharacterCustomizationModalProps) {
    const [activeTab, setActiveTab] = useState<CustomizationTab>('appearance');
    const [statChanges, setStatChanges] = useState<StatChange[] | null>(null);
    const [equipmentChange, setEquipmentChange] = useState<EquipmentChange | null>(null);
    const prefersReducedMotion = useReducedMotion();
    const { playSound } = useContextualSounds();

    const handleTabChange = (tab: CustomizationTab) => {
        playSound('ui_tab_switch');
        setActiveTab(tab);
    };

    const handleStatChange = (changes: StatChange[]) => {
        setStatChanges(changes);
        playSound('stat_increase');
    };

    const handleEquipmentChange = (change: EquipmentChange) => {
        setEquipmentChange(change);
        playSound(change.type === 'equipped' ? 'item_equip' : 'item_unequip');
    };

    const clearStatChanges = () => {
        setStatChanges(null);
    };

    const clearEquipmentChange = () => {
        setEquipmentChange(null);
    };

    const handleClose = () => {
        playSound('ui_cancel');
        onClose();
    };

    const tabs = [
        {
            id: 'appearance' as const,
            name: 'Appearance',
            icon: '🎨',
            description: 'Customize your character\'s look with modern styling',
            available: true,
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            id: 'stats' as const,
            name: 'Stats',
            icon: '📊',
            description: 'Allocate stat points to enhance abilities',
            available: character.stats.availablePoints > 0,
            badge: character.stats.availablePoints > 0 ? character.stats.availablePoints : undefined,
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'specialization' as const,
            name: 'Specialization',
            icon: '⭐',
            description: 'Choose your character\'s specialized path',
            available: character.level >= 10,
            gradient: 'from-purple-500 to-indigo-500'
        },
        {
            id: 'equipment' as const,
            name: 'Equipment',
            icon: '⚔️',
            description: 'Manage your gear and equipment',
            available: true,
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            id: 'respec' as const,
            name: 'Respec',
            icon: '🔄',
            description: 'Reset and redistribute your stat points',
            available: respecTokens > 0,
            badge: respecTokens > 0 ? respecTokens : undefined,
            gradient: 'from-yellow-500 to-amber-500'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'appearance':
                return (
                    <ModernCharacterCustomization
                        character={character}
                        onSave={onUpdateAvatar}
                        onCancel={handleClose}
                        isLoading={isLoading}
                    />
                );

            case 'stats':
                return (
                    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
                        <StatAllocation
                            currentStats={character.stats}
                            onAllocate={(allocations) => {
                                const statIcons = {
                                    intelligence: '🧠',
                                    vitality: '❤️',
                                    wisdom: '📜',
                                    charisma: '💬',
                                    dexterity: '⚡',
                                    creativity: '🎨'
                                };

                                const changes: StatChange[] = Object.entries(allocations)
                                    .filter(([, points]) => points && points > 0)
                                    .map(([stat, points]) => ({
                                        stat,
                                        oldValue: character.stats[stat as keyof Omit<CharacterStats, 'availablePoints'>] as number,
                                        newValue: (character.stats[stat as keyof Omit<CharacterStats, 'availablePoints'>] as number) + (points || 0),
                                        icon: statIcons[stat as keyof typeof statIcons]
                                    }));

                                if (changes.length > 0) {
                                    handleStatChange(changes);
                                }

                                return onAllocateStats(allocations);
                            }}
                            onCancel={handleClose}
                            isLoading={isLoading}
                        />
                    </div>
                );

            case 'specialization':
                return (
                    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
                        <SpecializationSelector
                            character={character}
                            onSelect={onSelectSpecialization}
                            onCancel={handleClose}
                            isLoading={isLoading}
                        />
                    </div>
                );

            case 'equipment':
                return (
                    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
                        <EquipmentSystem
                            character={character}
                            availableItems={availableItems}
                            onEquip={(itemId, slot) => {
                                const item = availableItems.find(i => i.id === itemId);
                                if (item) {
                                    handleEquipmentChange({
                                        type: 'equipped',
                                        itemName: item.name,
                                        itemIcon: item.icon,
                                        slot,
                                        rarity: item.rarity
                                    });
                                }
                                return onEquipItem(itemId, slot);
                            }}
                            onUnequip={(slot) => {
                                const equippedItem = character.equippedItems.find(item => item.slot === slot);
                                if (equippedItem) {
                                    const item = availableItems.find(i => i.id === equippedItem.itemId);
                                    if (item) {
                                        handleEquipmentChange({
                                            type: 'unequipped',
                                            itemName: item.name,
                                            itemIcon: item.icon,
                                            slot,
                                            rarity: item.rarity
                                        });
                                    }
                                }
                                return onUnequipItem(slot);
                            }}
                            onClose={handleClose}
                            isLoading={isLoading}
                        />
                    </div>
                );

            case 'respec':
                return (
                    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-6">
                        <RespecSystem
                            character={character}
                            respecTokens={respecTokens}
                            onRespec={onRespec}
                            onCancel={handleClose}
                            isLoading={isLoading}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <GlassModal
            isOpen={true}
            onClose={handleClose}
            size="fullscreen"
            blur="xl"
            className="overflow-hidden"
        >
            <div className="h-full flex flex-col">
                {/* Modern Tab Navigation */}
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Character Customization
                            </h1>
                            <p className="text-slate-300">
                                Enhance and personalize your character
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                            whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                            onClick={handleClose}
                            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </div>

                    {/* Enhanced Tab Navigation */}
                    <div className="flex flex-wrap gap-3">
                        {tabs.map((tab, index) => (
                            <motion.button
                                key={tab.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: prefersReducedMotion ? 0.1 : 0.3,
                                    delay: prefersReducedMotion ? 0 : index * 0.1
                                }}
                                whileHover={{
                                    scale: prefersReducedMotion ? 1 : 1.05,
                                    y: prefersReducedMotion ? 0 : -2
                                }}
                                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                                onClick={() => handleTabChange(tab.id)}
                                disabled={!tab.available}
                                className={`relative px-6 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden group ${activeTab === tab.id
                                    ? 'text-white shadow-xl'
                                    : tab.available
                                        ? 'text-slate-300 hover:text-white bg-slate-700/30 hover:bg-slate-600/30'
                                        : 'text-slate-500 cursor-not-allowed opacity-50 bg-slate-800/30'
                                    }`}
                            >
                                {/* Active tab background */}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabBackground"
                                        className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl`}
                                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                                    />
                                )}

                                {/* Tab content */}
                                <span className="relative text-2xl">{tab.icon}</span>
                                <div className="relative">
                                    <span className="font-medium">{tab.name}</span>
                                    <div className="text-xs opacity-75 hidden lg:block">
                                        {tab.description}
                                    </div>
                                </div>

                                {/* Badge for available actions */}
                                {tab.badge && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="relative bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold ml-2"
                                    >
                                        {tab.badge}
                                    </motion.span>
                                )}

                                {/* Lock indicator */}
                                {!tab.available && (
                                    <span className="relative text-lg">🔒</span>
                                )}

                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                            className="h-full overflow-y-auto"
                        >
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Visual Feedback Animations */}
                <AnimatePresence>
                    {statChanges && (
                        <StatChangeAnimation
                            changes={statChanges}
                            onComplete={clearStatChanges}
                        />
                    )}

                    {equipmentChange && (
                        <EquipmentChangeAnimation
                            change={equipmentChange}
                            onComplete={clearEquipmentChange}
                        />
                    )}
                </AnimatePresence>
            </div>
        </GlassModal>
    );
}