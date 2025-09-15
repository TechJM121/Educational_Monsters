import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpContent } from '../../types/error';
import { Tooltip } from './Tooltip';

// Help content database
const helpDatabase: HelpContent[] = [
  {
    id: 'character-stats',
    title: 'Character Stats',
    content: 'Your character has 6 stats that improve as you learn:\n• Intelligence: Increases with math and logic\n• Vitality: Grows with biology and health topics\n• Wisdom: Develops through history and social studies\n• Charisma: Improves with language arts and reading\n• Dexterity: Enhanced by science experiments\n• Creativity: Boosted by art and creative subjects',
    category: 'character',
    keywords: ['stats', 'intelligence', 'vitality', 'wisdom', 'charisma', 'dexterity', 'creativity'],
    relatedTopics: ['character-leveling', 'xp-system']
  },
  {
    id: 'xp-system',
    title: 'Experience Points (XP)',
    content: 'Earn XP by completing learning activities:\n• Correct answers give base XP\n• Time bonuses for quick responses\n• Streak bonuses for consecutive correct answers\n• Achievement bonuses for milestones\n• Your stats affect XP multipliers',
    category: 'learning',
    keywords: ['xp', 'experience', 'points', 'leveling'],
    relatedTopics: ['character-stats', 'achievements']
  },
  {
    id: 'character-leveling',
    title: 'Leveling Up',
    content: 'Your character levels up as you earn XP:\n• Each level requires more XP than the last\n• Leveling up gives you stat points to allocate\n• Higher levels unlock new content and features\n• Level milestones provide special rewards',
    category: 'character',
    keywords: ['level', 'leveling', 'level up'],
    relatedTopics: ['xp-system', 'character-stats']
  },
  {
    id: 'achievements',
    title: 'Achievements & Badges',
    content: 'Unlock achievements by reaching learning milestones:\n• Subject mastery badges\n• Streak achievements\n• Social achievements\n• Rare achievements give special rewards\n• View all achievements in your profile',
    category: 'learning',
    keywords: ['achievements', 'badges', 'rewards'],
    relatedTopics: ['xp-system', 'quests']
  },
  {
    id: 'quests',
    title: 'Daily & Weekly Quests',
    content: 'Complete quests for bonus rewards:\n• Daily quests reset every 24 hours\n• Weekly quests offer bigger challenges\n• Quest completion gives bonus XP and items\n• Maintain streaks for increasing rewards',
    category: 'quests',
    keywords: ['quests', 'daily', 'weekly', 'challenges'],
    relatedTopics: ['achievements', 'xp-system']
  },
  {
    id: 'learning-worlds',
    title: 'Learning Worlds',
    content: 'Explore themed worlds for different subjects:\n• Numerical Kingdom (Math)\n• Laboratory Realm (Science)\n• History Hall (Social Studies)\n• Word Workshop (Language Arts)\n• Each world has unique themes and rewards',
    category: 'learning',
    keywords: ['worlds', 'subjects', 'themes'],
    relatedTopics: ['quests', 'character-stats']
  },
  {
    id: 'social-features',
    title: 'Social Features',
    content: 'Connect with classmates and friends:\n• View leaderboards and compete\n• Trade collectible items\n• Participate in group challenges\n• Help friends with learning activities\n• Parents can monitor social interactions',
    category: 'social',
    keywords: ['friends', 'leaderboard', 'trading', 'social'],
    relatedTopics: ['achievements', 'quests']
  }
];

interface HelpContextType {
  searchHelp: (query: string) => HelpContent[];
  getHelpById: (id: string) => HelpContent | undefined;
  getHelpByCategory: (category: HelpContent['category']) => HelpContent[];
  showHelp: (id: string) => void;
  hideHelp: () => void;
  currentHelp: HelpContent | null;
}

const HelpContext = createContext<HelpContextType | null>(null);

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}

interface HelpProviderProps {
  children: React.ReactNode;
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [currentHelp, setCurrentHelp] = useState<HelpContent | null>(null);

  const searchHelp = (query: string): HelpContent[] => {
    const lowercaseQuery = query.toLowerCase();
    return helpDatabase.filter(help => 
      help.title.toLowerCase().includes(lowercaseQuery) ||
      help.content.toLowerCase().includes(lowercaseQuery) ||
      help.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getHelpById = (id: string): HelpContent | undefined => {
    return helpDatabase.find(help => help.id === id);
  };

  const getHelpByCategory = (category: HelpContent['category']): HelpContent[] => {
    return helpDatabase.filter(help => help.category === category);
  };

  const showHelp = (id: string) => {
    const help = getHelpById(id);
    if (help) {
      setCurrentHelp(help);
    }
  };

  const hideHelp = () => {
    setCurrentHelp(null);
  };

  const contextValue: HelpContextType = {
    searchHelp,
    getHelpById,
    getHelpByCategory,
    showHelp,
    hideHelp,
    currentHelp
  };

  return (
    <HelpContext.Provider value={contextValue}>
      {children}
      <HelpModal />
    </HelpContext.Provider>
  );
}

function HelpModal() {
  const { currentHelp, hideHelp, getHelpById } = useHelp();
  const [relatedHelp, setRelatedHelp] = useState<HelpContent[]>([]);

  useEffect(() => {
    if (currentHelp) {
      const related = currentHelp.relatedTopics
        .map(id => getHelpById(id))
        .filter(Boolean) as HelpContent[];
      setRelatedHelp(related);
    }
  }, [currentHelp, getHelpById]);

  if (!currentHelp) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={hideHelp}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-800 border border-slate-600 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-600">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">❓</span>
              <h2 className="text-xl font-rpg text-white">{currentHelp.title}</h2>
            </div>
            <button
              onClick={hideHelp}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close help"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line text-slate-200 leading-relaxed">
                {currentHelp.content}
              </div>
            </div>

            {/* Related Topics */}
            {relatedHelp.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-600">
                <h3 className="text-lg font-rpg text-white mb-3">Related Topics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {relatedHelp.map(help => (
                    <button
                      key={help.id}
                      onClick={() => showHelp(help.id)}
                      className="text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <div className="text-primary-400 font-medium">{help.title}</div>
                      <div className="text-slate-400 text-sm mt-1 line-clamp-2">
                        {help.content.split('\n')[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface HelpButtonProps {
  helpId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HelpButton({ helpId, className = '', size = 'md' }: HelpButtonProps) {
  const { showHelp, getHelpById } = useHelp();
  const help = getHelpById(helpId);

  if (!help) return null;

  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  return (
    <Tooltip content={`Help: ${help.title}`} position="top">
      <button
        onClick={() => showHelp(helpId)}
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center rounded-full 
          bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-white
          transition-colors duration-200
          ${className}
        `}
        aria-label={`Get help about ${help.title}`}
      >
        ?
      </button>
    </Tooltip>
  );
}

interface ContextualHelpProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function ContextualHelp({ 
  content, 
  position = 'top', 
  children, 
  className = '' 
}: ContextualHelpProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <Tooltip content={content} position={position}>
        {children}
      </Tooltip>
    </div>
  );
}

interface HelpSearchProps {
  onSelectHelp: (help: HelpContent) => void;
  className?: string;
}

export function HelpSearch({ onSelectHelp, className = '' }: HelpSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HelpContent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { searchHelp } = useHelp();

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchHelp(query);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, searchHelp]);

  const handleSelectHelp = (help: HelpContent) => {
    onSelectHelp(help);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for help..."
          className="w-full px-4 py-2 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-slate-400">🔍</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {results.map(help => (
              <button
                key={help.id}
                onClick={() => handleSelectHelp(help)}
                className="w-full text-left p-3 hover:bg-slate-700 transition-colors border-b border-slate-600 last:border-b-0"
              >
                <div className="font-medium text-white">{help.title}</div>
                <div className="text-sm text-slate-400 mt-1 line-clamp-2">
                  {help.content.split('\n')[0]}
                </div>
                <div className="text-xs text-primary-400 mt-1 capitalize">
                  {help.category}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}