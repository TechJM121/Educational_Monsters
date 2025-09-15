import React from 'react';
import { LearningPageTransition } from '../components/navigation/PageTransition';

export const LearningPage: React.FC = () => {
  return (
    <LearningPageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-rpg text-yellow-400 mb-6 flex items-center gap-3">
            🌍 Learning Worlds
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for learning worlds */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h3 className="text-xl font-rpg text-yellow-400 mb-3">🔢 Numerical Kingdom</h3>
              <p className="text-slate-300 mb-4">Master the art of mathematics in this mystical realm.</p>
              <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                               text-white font-rpg rounded-lg hover:from-blue-500 hover:to-purple-500 
                               transition-all duration-200">
                Enter World
              </button>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h3 className="text-xl font-rpg text-yellow-400 mb-3">🧪 Laboratory Realm</h3>
              <p className="text-slate-300 mb-4">Conduct experiments and discover scientific wonders.</p>
              <button className="w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 
                               text-white font-rpg rounded-lg hover:from-green-500 hover:to-teal-500 
                               transition-all duration-200">
                Enter World
              </button>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20">
              <h3 className="text-xl font-rpg text-yellow-400 mb-3">📚 Library of Wisdom</h3>
              <p className="text-slate-300 mb-4">Explore literature and enhance your language skills.</p>
              <button className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 
                               text-white font-rpg rounded-lg hover:from-orange-500 hover:to-red-500 
                               transition-all duration-200">
                Enter World
              </button>
            </div>
          </div>
        </div>
      </div>
    </LearningPageTransition>
  );
};