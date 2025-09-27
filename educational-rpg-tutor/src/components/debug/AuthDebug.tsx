import React from 'react';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';

export const AuthDebug: React.FC = () => {
  const { user, loading, error } = useSimpleAuth();

  const checkLocalStorage = () => {
    const session = localStorage.getItem('educational_rpg_session');
    const userData = localStorage.getItem('educational_rpg_user');
    const guestUser = localStorage.getItem('educational_rpg_guest_user');
    const guestSession = localStorage.getItem('educational_rpg_guest_session');
    
    console.log('=== Auth Debug ===');
    console.log('Session:', session);
    console.log('User Data:', userData);
    console.log('Guest User:', guestUser);
    console.log('Guest Session:', guestSession);
    console.log('Parsed User:', user);
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('================');
  };

  const clearAllAuth = () => {
    localStorage.removeItem('educational_rpg_session');
    localStorage.removeItem('educational_rpg_user');
    localStorage.removeItem('educational_rpg_guest_user');
    localStorage.removeItem('educational_rpg_guest_session');
    localStorage.removeItem('educational_rpg_progress');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-800 border border-slate-600 rounded-lg p-4 text-white text-sm max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1 mb-3">
        <div>User: {user ? `${user.name} (${user.isGuest ? 'Guest' : 'User'})` : 'None'}</div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Error: {error || 'None'}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={checkLocalStorage}
          className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
        >
          Check Storage
        </button>
        <button
          onClick={clearAllAuth}
          className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};