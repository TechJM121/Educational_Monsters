import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';

const OAuthSetup: React.FC = () => {
  const [age, setAge] = useState<number>(0);
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (age < 3 || age > 18) {
      setError('Age must be between 3 and 18 years old');
      return;
    }

    if (age < 13 && !parentEmail.trim()) {
      setError('Parent email is required for users under 13');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await AuthService.completeOAuthSetup(age, parentEmail || undefined);
      
      if (result.needsParentalConsent) {
        navigate('/auth/parental-consent-pending');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('OAuth setup error:', err);
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Complete Your Setup
          </h2>
          <p className="text-gray-600">
            We need a bit more information to personalize your learning experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Your Age *
            </label>
            <input
              type="number"
              id="age"
              min="3"
              max="18"
              value={age || ''}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your age"
              required
            />
          </div>

          {age > 0 && age < 13 && (
            <div>
              <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Parent's Email Address *
              </label>
              <input
                type="email"
                id="parentEmail"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="parent@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send a consent request to your parent or guardian.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || age < 3 || age > 18}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting up...
              </span>
            ) : (
              'Complete Setup'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthSetup;