import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveDebugProps {
  show?: boolean;
}

export const ResponsiveDebug: React.FC<ResponsiveDebugProps> = ({ show = false }) => {
  const [isVisible, setIsVisible] = useState(show);
  const responsive = useResponsive();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-2 rounded-full text-xs opacity-50 hover:opacity-100 transition-opacity"
        title="Show responsive debug info"
      >
        📱
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Responsive Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div>Screen: {responsive.screenWidth}×{responsive.screenHeight}</div>
        <div>Orientation: {responsive.orientation}</div>
        <div>Touch: {responsive.isTouch ? 'Yes' : 'No'}</div>
        <div className="space-y-1 mt-2">
          <div className={responsive.isMobile ? 'text-green-400' : 'text-gray-400'}>
            📱 Mobile: {responsive.isMobile ? 'Yes' : 'No'}
          </div>
          <div className={responsive.isTablet ? 'text-green-400' : 'text-gray-400'}>
            📟 Tablet: {responsive.isTablet ? 'Yes' : 'No'}
          </div>
          <div className={responsive.isDesktop ? 'text-green-400' : 'text-gray-400'}>
            🖥️ Desktop: {responsive.isDesktop ? 'Yes' : 'No'}
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-gray-300">Breakpoints:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className={responsive.screenWidth >= 640 ? 'text-green-400' : 'text-gray-500'}>
              SM: {responsive.screenWidth >= 640 ? '✓' : '✗'}
            </div>
            <div className={responsive.screenWidth >= 768 ? 'text-green-400' : 'text-gray-500'}>
              MD: {responsive.screenWidth >= 768 ? '✓' : '✗'}
            </div>
            <div className={responsive.screenWidth >= 1024 ? 'text-green-400' : 'text-gray-500'}>
              LG: {responsive.screenWidth >= 1024 ? '✓' : '✗'}
            </div>
            <div className={responsive.screenWidth >= 1280 ? 'text-green-400' : 'text-gray-500'}>
              XL: {responsive.screenWidth >= 1280 ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to test responsive layouts
export const ResponsiveTestGrid: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-white">Responsive Test Grid</h2>
      
      {/* Test different grid layouts */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">1-2-3-4 Column Grid</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-blue-600 p-4 rounded text-white text-center">
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Auto-fit Grid</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="bg-green-600 p-4 rounded text-white text-center">
                Auto {i + 1}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Responsive Cards</h3>
          <div className="grid-cards-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="rpg-card-mobile text-white text-center">
                <h4 className="font-bold mb-2">Card {i + 1}</h4>
                <p className="text-sm text-slate-300">This is a responsive card that adapts to different screen sizes.</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Responsive Text Sizes</h3>
          <div className="space-y-2">
            <div className="text-responsive-xs">Extra Small Text (responsive)</div>
            <div className="text-responsive-sm">Small Text (responsive)</div>
            <div className="text-responsive-base">Base Text (responsive)</div>
            <div className="text-responsive-lg">Large Text (responsive)</div>
            <div className="text-responsive-xl">Extra Large Text (responsive)</div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Touch Targets</h3>
          <div className="flex flex-wrap gap-2">
            <button className="touch-target bg-blue-600 text-white px-4 py-2 rounded">
              Touch Button 1
            </button>
            <button className="touch-target bg-green-600 text-white px-4 py-2 rounded">
              Touch Button 2
            </button>
            <button className="touch-target bg-red-600 text-white px-4 py-2 rounded">
              Touch Button 3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};