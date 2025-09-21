/**
 * GlassCard Demo Component
 * Demonstrates the various configurations and states of the GlassCard component
 */

import React from 'react';
import { GlassCard } from './GlassCard';

export const GlassCardDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-cosmic-start to-gradient-cosmic-end p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-white mb-8 text-center">
          GlassCard Component Demo
        </h1>
        
        {/* Blur Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-white mb-6">Blur Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard blur="sm">
              <h3 className="text-lg font-semibold text-white mb-2">Small Blur</h3>
              <p className="text-white/80">backdrop-blur-sm effect with subtle transparency</p>
            </GlassCard>
            
            <GlassCard blur="md">
              <h3 className="text-lg font-semibold text-white mb-2">Medium Blur</h3>
              <p className="text-white/80">backdrop-blur-md effect (default)</p>
            </GlassCard>
            
            <GlassCard blur="lg">
              <h3 className="text-lg font-semibold text-white mb-2">Large Blur</h3>
              <p className="text-white/80">backdrop-blur-lg effect with enhanced glass look</p>
            </GlassCard>
            
            <GlassCard blur="xl">
              <h3 className="text-lg font-semibold text-white mb-2">Extra Large Blur</h3>
              <p className="text-white/80">backdrop-blur-xl effect for maximum glass effect</p>
            </GlassCard>
          </div>
        </section>

        {/* Opacity Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-white mb-6">Opacity Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard opacity={0.05}>
              <h3 className="text-lg font-semibold text-white mb-2">Light Glass</h3>
              <p className="text-white/80">Very subtle transparency (0.05)</p>
            </GlassCard>
            
            <GlassCard opacity={0.15}>
              <h3 className="text-lg font-semibold text-white mb-2">Medium Glass</h3>
              <p className="text-white/80">Balanced transparency (0.15)</p>
            </GlassCard>
            
            <GlassCard opacity={0.25}>
              <h3 className="text-lg font-semibold text-white mb-2">Strong Glass</h3>
              <p className="text-white/80">More opaque glass effect (0.25)</p>
            </GlassCard>
          </div>
        </section>

        {/* Border Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-white mb-6">Border Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard border="subtle">
              <h3 className="text-lg font-semibold text-white mb-2">Subtle Border</h3>
              <p className="text-white/80">Minimal border with soft appearance</p>
            </GlassCard>
            
            <GlassCard border="prominent">
              <h3 className="text-lg font-semibold text-white mb-2">Prominent Border</h3>
              <p className="text-white/80">Thicker border for more definition</p>
            </GlassCard>
            
            <GlassCard border="glow">
              <h3 className="text-lg font-semibold text-white mb-2">Glow Border</h3>
              <p className="text-white/80">Border with subtle glow effect</p>
            </GlassCard>
          </div>
        </section>

        {/* Shadow Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-white mb-6">Shadow Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard shadow="soft">
              <h3 className="text-lg font-semibold text-white mb-2">Soft Shadow</h3>
              <p className="text-white/80">Gentle shadow for subtle depth</p>
            </GlassCard>
            
            <GlassCard shadow="medium">
              <h3 className="text-lg font-semibold text-white mb-2">Medium Shadow</h3>
              <p className="text-white/80">Balanced shadow depth (default)</p>
            </GlassCard>
            
            <GlassCard shadow="dramatic">
              <h3 className="text-lg font-semibold text-white mb-2">Dramatic Shadow</h3>
              <p className="text-white/80">Strong shadow for maximum depth</p>
            </GlassCard>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-white mb-6">Interactive Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard interactive>
              <h3 className="text-lg font-semibold text-white mb-2">Interactive Card</h3>
              <p className="text-white/80">Hover and click for smooth animations</p>
              <div className="mt-4 flex space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              </div>
            </GlassCard>
            
            <GlassCard interactive={false}>
              <h3 className="text-lg font-semibold text-white mb-2">Static Card</h3>
              <p className="text-white/80">No hover effects, purely visual</p>
              <div className="mt-4 flex space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Complex Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-white mb-6">Complex Example</h2>
          <GlassCard 
            blur="xl" 
            opacity={0.2}
            border="glow" 
            shadow="dramatic" 
            interactive 
            className="max-w-2xl mx-auto"
          >
            <div className="text-center">
              <h3 className="text-2xl font-display font-bold text-white mb-4">
                Premium Glass Card
              </h3>
              <p className="text-white/90 mb-6">
                This card combines all the best features: extra large blur, custom opacity, 
                glowing border, dramatic shadow, and interactive animations.
              </p>
              <div className="flex justify-center space-x-4">
                <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <span className="text-white font-medium">Feature 1</span>
                </div>
                <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <span className="text-white font-medium">Feature 2</span>
                </div>
                <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <span className="text-white font-medium">Feature 3</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  );
};