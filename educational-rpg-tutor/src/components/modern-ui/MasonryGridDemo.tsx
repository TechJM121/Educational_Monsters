import React, { useState, useCallback } from 'react';
import MasonryGrid from './MasonryGrid';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface DemoItem {
  id: number;
  title: string;
  content: string;
  height: 'short' | 'medium' | 'tall' | 'extra-tall';
  color: string;
}

const MasonryGridDemo: React.FC = () => {
  const [items, setItems] = useState<DemoItem[]>([
    { id: 1, title: 'Welcome', content: 'This is a short card to demonstrate the masonry layout.', height: 'short', color: 'from-blue-400 to-blue-600' },
    { id: 2, title: 'Features', content: 'This card has more content to show how the masonry layout handles different heights. The layout automatically adjusts to fit items optimally.', height: 'medium', color: 'from-purple-400 to-purple-600' },
    { id: 3, title: 'Responsive', content: 'The masonry grid is fully responsive and adapts to different screen sizes. It uses CSS Grid with fallbacks for better browser support.', height: 'medium', color: 'from-green-400 to-green-600' },
    { id: 4, title: 'Animations', content: 'Items animate smoothly when added or removed from the grid. The staggered animations create a pleasant visual effect.', height: 'tall', color: 'from-red-400 to-red-600' },
    { id: 5, title: 'Performance', content: 'Optimized for performance with efficient layout calculations and minimal re-renders.', height: 'short', color: 'from-yellow-400 to-yellow-600' },
    { id: 6, title: 'Dynamic Content', content: 'This is a very tall card that demonstrates how the masonry layout handles items of varying heights. The algorithm finds the shortest column and places new items there, creating a balanced layout. This approach ensures optimal use of space while maintaining visual harmony. The layout recalculates automatically when items are added or removed, providing smooth transitions and maintaining the overall balance of the grid.', height: 'extra-tall', color: 'from-indigo-400 to-indigo-600' },
    { id: 7, title: 'Touch Friendly', content: 'Designed with mobile devices in mind, providing smooth interactions on touch screens.', height: 'medium', color: 'from-pink-400 to-pink-600' },
    { id: 8, title: 'Accessibility', content: 'Built with accessibility in mind, supporting screen readers and keyboard navigation.', height: 'tall', color: 'from-teal-400 to-teal-600' }
  ]);

  const [nextId, setNextId] = useState(9);
  const [itemCount, setItemCount] = useState(items.length);

  const heightClasses = {
    short: 'min-h-[120px]',
    medium: 'min-h-[180px]',
    tall: 'min-h-[250px]',
    'extra-tall': 'min-h-[350px]'
  };

  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-yellow-600',
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600'
  ];

  const heights: DemoItem['height'][] = ['short', 'medium', 'tall', 'extra-tall'];

  const addItem = useCallback(() => {
    const randomHeight = heights[Math.floor(Math.random() * heights.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newItem: DemoItem = {
      id: nextId,
      title: `New Item ${nextId}`,
      content: `This is a dynamically added item with ${randomHeight} height. It demonstrates how the masonry layout handles new content additions with smooth animations.`,
      height: randomHeight,
      color: randomColor
    };

    setItems(prev => [...prev, newItem]);
    setNextId(prev => prev + 1);
  }, [nextId, heights, colors]);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const shuffleItems = useCallback(() => {
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const resetItems = useCallback(() => {
    setItems([
      { id: 1, title: 'Welcome', content: 'This is a short card to demonstrate the masonry layout.', height: 'short', color: 'from-blue-400 to-blue-600' },
      { id: 2, title: 'Features', content: 'This card has more content to show how the masonry layout handles different heights.', height: 'medium', color: 'from-purple-400 to-purple-600' },
      { id: 3, title: 'Responsive', content: 'The masonry grid is fully responsive and adapts to different screen sizes.', height: 'medium', color: 'from-green-400 to-green-600' }
    ]);
    setNextId(4);
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Masonry Grid Layout
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Dynamic masonry layout with smooth animations, responsive design, and 
            efficient item insertion and removal.
          </p>
        </div>

        {/* Controls */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <GlassButton onClick={addItem} className="px-4 py-2">
              Add Item
            </GlassButton>
            <GlassButton onClick={shuffleItems} className="px-4 py-2">
              Shuffle
            </GlassButton>
            <GlassButton onClick={clearItems} className="px-4 py-2">
              Clear All
            </GlassButton>
            <GlassButton onClick={resetItems} className="px-4 py-2">
              Reset
            </GlassButton>
            <div className="text-gray-600 font-medium">
              Items: {itemCount}
            </div>
          </div>
        </GlassCard>

        {/* Masonry Grid */}
        <MasonryGrid
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          gap={24}
          animated
          onItemsChange={setItemCount}
          className="mb-8"
        >
          {items.map((item) => (
            <GlassCard
              key={item.id}
              className={`p-6 ${heightClasses[item.height]} cursor-pointer group`}
              interactive
              onClick={() => removeItem(item.id)}
            >
              <div className="h-full flex flex-col">
                <div className={`w-full h-16 bg-gradient-to-r ${item.color} rounded-lg mb-4 flex items-center justify-center`}>
                  <div className="w-8 h-8 bg-white/30 rounded-full"></div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 text-sm flex-1">
                  {item.content}
                </p>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>ID: {item.id}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to remove
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </MasonryGrid>

        {/* Info */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Masonry Layout Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong className="text-gray-800">Responsive:</strong> Adapts to different screen sizes
            </div>
            <div>
              <strong className="text-gray-800">Animated:</strong> Smooth item transitions
            </div>
            <div>
              <strong className="text-gray-800">Dynamic:</strong> Add/remove items seamlessly
            </div>
            <div>
              <strong className="text-gray-800">Optimized:</strong> Efficient layout calculations
            </div>
            <div>
              <strong className="text-gray-800">Fallback:</strong> CSS Grid masonry support
            </div>
            <div>
              <strong className="text-gray-800">Touch-friendly:</strong> Mobile optimized
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default MasonryGridDemo;