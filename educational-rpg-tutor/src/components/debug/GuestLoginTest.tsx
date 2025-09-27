import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';

export const GuestLoginTest: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, refreshAuth } = useSimpleAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testGuestLogin = async () => {
    setTestResult('Testing guest login...');
    
    try {
      // Create test guest user
      const guestUser = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Test Guest',
        age: 10,
        email: `guest_${Date.now()}@example.com`,
        isGuest: true
      };

      console.log('Creating test guest user:', guestUser);

      // Store in localStorage
      localStorage.setItem('educational_rpg_user', JSON.stringify(guestUser));
      localStorage.setItem('educational_rpg_session', 'active');

      // Update auth context immediately
      setUser(guestUser);

      setTestResult('✅ Guest login successful! User should be authenticated now.');
      
      // Try to navigate after a short delay
      setTimeout(() => {
        navigate('/app/home');
      }, 1000);

    } catch (error) {
      console.error('Guest login test error:', error);
      setTestResult(`❌ Guest login failed: ${error}`);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('educational_rpg_user');
    localStorage.removeItem('educational_rpg_session');
    setUser(null);
    setTestResult('Auth cleared');
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-slate-800 border border-slate-600 rounded-lg p-4 text-white text-sm max-w-md">
      <h3 className="font-bold mb-2">Guest Login Test</h3>
      <div className="space-y-2 mb-3">
        <div>Current User: {user ? `${user.name} (${user.isGuest ? 'Guest' : 'User'})` : 'None'}</div>
        <div className="text-xs text-slate-300">{testResult}</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={testGuestLogin}
          className="px-3 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
        >
          Test Guest Login
        </button>
        <button
          onClick={clearAuth}
          className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
        >
          Clear Auth
        </button>
        <button
          onClick={refreshAuth}
          className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};