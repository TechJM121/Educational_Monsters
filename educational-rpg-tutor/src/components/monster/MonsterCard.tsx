import { motion } from 'framer-motion';
import { GlassCard } from '../modern-ui/GlassCard';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useContextualSounds } from '../../hooks/useContextualSounds';
import type { Monster } from '../../types/monster';

interface MonsterCardProps {
  monster: Monster;
  isActive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onCustomize?: () => void;
  onSetActive?: () => void;
  showActions?: boolean;
}

const getSpeciesEmoji = (species: string): string => {
  const emojiMap: Record<string, string> = {
    dragon: '🐲',
    phoenix: '🔥🦅',
    unicorn: '🦄',
    griffin: '🦅',
    fox: '🦊',
    wolf: '🐺',
    cat: '🐱',
    owl: '🦉',
    turtle: '🐢',
    rabbit: '🐰',
    bear: '🐻',
    deer: '🦌'
  };
  return emojiMap[species] || '🐾';
};

const getRarityColor = (level: number): string => {
  if (level >= 50) return 'from-pink-500 to-rose-400'; // Mythic
  if (level >= 30) return 'from-yellow-500 to-orange-400'; // Legendary
  if (level >= 20) return 'from-purple-500 to-purple-400'; // Epic
  if (level >= 10) return 'from-blue-500 to-blue-400'; // Rare
  if (level >= 5) return 'from-green-500 to-green-400'; // Uncommon
  return 'from-gray-500 to-gray-400'; // Common
};

const getBondColor = (bond: number): string => {
  if (bond >= 90) return 'text-pink-400';
  if (bond >= 75) return 'text-purple-400';
  if (bond >= 50) return 'text-blue-400';
  if (bond >= 25) return 'text-green-400';
  return 'text-yellow-400';
};

export function MonsterCard({
  monster,
  isActive = false,
  isSelected = false,
  onClick,
  onCustomize,
  onSetActive,
  showActions = true
}: MonsterCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { playContextualSound } = useContextualSounds();

  const handleClick = () => {
    playContextualSound('ui_click');
    onClick?.();
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    playContextualSound('ui_select');
    onCustomize?.();
  };

  const handleSetActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    playContextualSound('ui_success');
    onSetActive?.();
  };

  const speciesEmoji = getSpeciesEmoji(monster.species);
  const rarityGradient = getRarityColor(monster.level);
  const bondColorClass = getBondColor(monster.bond);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: prefersReducedMotion ? 1 : 1.02,
        y: prefersReducedMotion ? 0 : -2
      }}
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary-400' : ''
      }`}
    >
      <GlassCard 
        blur="md" 
        opacity={0.1} 
        className={`p-6 border transition-all duration-300 ${
          isActive 
            ? 'border-primary-400/50 bg-primary-500/10 shadow-lg shadow-primary-500/20' 
            : 'border-white/20 hover:border-white/30'
        }`}
      >
        {/* Active Badge */}
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-500 to-primary-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
          >
            Active
          </motion.div>
        )}

        <div className="text-center">
          {/* Monster Avatar */}
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${rarityGradient} flex items-center justify-center text-4xl shadow-xl relative overflow-hidden`}>
            {/* Background pattern based on customization */}
            {monster.customization.pattern !== 'solid' && (
              <div className="absolute inset-0 opacity-30">
                {monster.customization.pattern === 'stripes' && (
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45" />
                )}
                {monster.customization.pattern === 'spots' && (
                  <div className="w-full h-full">
                    <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full" />
                    <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-white rounded-full" />
                    <div className="absolute bottom-3 left-4 w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            )}
            
            {/* Species emoji */}
            <span className="relative z-10">{speciesEmoji}</span>
            
            {/* Special effects */}
            {monster.customization.aura && (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full border-2 border-primary-400/50"
              />
            )}
          </div>
          
          {/* Monster Info */}
          <h3 className="text-lg font-bold text-white mb-2">{monster.name}</h3>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${rarityGradient} text-white`}>
              Lv. {monster.level}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300 capitalize">
              {monster.species}
            </span>
          </div>
          
          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Bond</span>
              <span className={`font-medium ${bondColorClass}`}>
                {monster.bond}% ❤️
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${monster.bond}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`bg-gradient-to-r ${
                  monster.bond >= 75 ? 'from-pink-500 to-red-400' :
                  monster.bond >= 50 ? 'from-purple-500 to-pink-400' :
                  monster.bond >= 25 ? 'from-blue-500 to-purple-400' :
                  'from-green-500 to-blue-400'
                } h-2 rounded-full transition-all duration-300`}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">XP</span>
              <span className="text-blue-400 font-medium">
                {monster.currentXP}/{monster.level * 100}
              </span>
            </div>
          </div>
          
          {/* Personality Traits */}
          {monster.personality.traits.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 justify-center">
                {monster.personality.traits.slice(0, 3).map((trait) => (
                  <span 
                    key={trait}
                    className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded-full capitalize"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          {showActions && (
            <div className="flex flex-col gap-2">
              {!isActive && onSetActive && (
                <motion.button
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  onClick={handleSetActive}
                  className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-lg shadow-primary-500/25"
                >
                  Set Active
                </motion.button>
              )}
              
              {onCustomize && (
                <motion.button
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  onClick={handleCustomize}
                  className="w-full px-4 py-2 bg-slate-600/50 hover:bg-slate-500/50 text-slate-300 hover:text-white rounded-lg font-medium text-sm transition-all duration-300 border border-slate-500/30"
                >
                  🎨 Customize
                </motion.button>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}