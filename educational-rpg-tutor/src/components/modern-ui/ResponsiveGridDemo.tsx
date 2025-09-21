import React, { useState } from 'react';
import ResponsiveGrid from './ResponsiveGrid';
import FlexGrid from './FlexGrid';
import GlassCard from './GlassCard';

const ResponsiveGridDemo: React.FC = () => {
  const [gridType, setGridType] = useState<'css-grid' | 'flex-grid' | 'auto-fit'>('css-grid');
  const [itemCount, setItemCount] = useState(12);

  const generateItems = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <GlassCard key={i} className="p-6 min-h-[200px]" interactive>
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Item {i + 1}</h3>
          <p className="text-gray-600 text-sm">
            This is a responsive grid item that adapts to different screen sizes.
          </p>
        </div>
      </GlassCard>
    ));
  };

  const renderGrid = () => {
    const items = generateItems(itemCount);

    switch (gridType) {
      case 'css-grid':
        return (
          <ResponsiveGrid
            columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
            gap="md"
            animated
          >
            {items}
          </ResponsiveGrid>
        );
      
      case 'flex-grid':
        return (
          <FlexGrid
            justify="center"
            align="stretch"
            gap="md"
            animated
            responsive={{
              sm: { justify: 'start' },
              lg: { gap: 'lg' }
            }}
          >
            {items.map((item, index) => (
              <div key={index} className="flex-1 min-w-[250px] max-w-[300px]">
                {item}
              </div>
            ))}
          </FlexGrid>
        );
      
      case 'auto-fit':
        return (
          <ResponsiveGrid
            autoFit
            minItemWidth="280px"
            gap="lg"
            animated
          >
            {items}
          </ResponsiveGrid>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Responsive Grid System
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Modern layout patterns using CSS Grid and Flexbox with responsive breakpoints
            and smooth animations.
          </p>
        </div>

        {/* Controls */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setGridType('css-grid')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  gridType === 'css-grid'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
              >
                CSS Grid
              </button>
              <button
                onClick={() => setGridType('flex-grid')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  gridType === 'flex-grid'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
              >
                Flex Grid
              </button>
              <button
                onClick={() => setGridType('auto-fit')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  gridType === 'auto-fit'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
              >
                Auto-Fit
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium">Items:</label>
              <input
                type="range"
                min="4"
                max="20"
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-gray-600 min-w-[2rem]">{itemCount}</span>
            </div>
          </div>
        </GlassCard>

        {/* Grid Display */}
        <div className="mb-8">
          {renderGrid()}
        </div>

        {/* Breakpoint Indicators */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Current Breakpoint
          </h3>
          <div className="flex gap-2">
            <div className="block sm:hidden px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              XS (< 640px)
            </div>
            <div className="hidden sm:block md:hidden px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              SM (640px - 768px)
            </div>
            <div className="hidden md:block lg:hidden px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              MD (768px - 1024px)
            </div>
            <div className="hidden lg:block xl:hidden px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              LG (1024px - 1280px)
            </div>
            <div className="hidden xl:block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              XL (≥ 1280px)
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ResponsiveGridDemo;