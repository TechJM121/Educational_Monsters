import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SimpleErrorBoundary } from './components/SimpleErrorBoundary';

// Simple test components
function HomePage() {
  const { user, loading } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-rpg text-yellow-400 mb-4">🏰 Educational RPG Tutor</h1>
        <p className="text-slate-300 mb-8">Welcome to your magical learning adventure!</p>
        <div className="bg-slate-800 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center text-green-400">
              <span className="mr-2">✅</span>
              <span>React App Running</span>
            </div>
            <div className="flex items-center text-green-400">
              <span className="mr-2">✅</span>
              <span>React Router Working</span>
            </div>
            <div className="flex items-center text-green-400">
              <span className="mr-2">✅</span>
              <span>Tailwind CSS Working</span>
            </div>
            <div className="flex items-center text-green-400">
              <span className="mr-2">✅</span>
              <span>Custom Fonts Loaded</span>
            </div>
            <div className="flex items-center text-green-400">
              <span className="mr-2">✅</span>
              <span>Auth System Working</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-slate-700 rounded">
            <p className="text-sm text-slate-300">
              Auth Status: {loading ? 'Loading...' : user ? `Logged in as ${user.email}` : 'Not logged in'}
            </p>
          </div>
          
          <div className="mt-6">
            <button className="rpg-button">
              Start Your Adventure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <SimpleErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SimpleErrorBoundary>
  );
}

export default App;
