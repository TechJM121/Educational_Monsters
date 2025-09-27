// Quick test component to verify question system
import React, { useEffect, useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';

export const QuickTest: React.FC = () => {
  const {
    questions,
    subjects,
    loading,
    error,
    connectivity,
    refreshConnectivity
  } = useQuestions({
    ageRange: '3-6',
    limit: 3,
    autoLoad: true
  });

  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Question System Status</h2>
      
      {/* Connectivity Status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Connection Status</h3>
            {connectivity ? (
              <div className="text-sm space-y-1">
                <p>Supabase Configured: {connectivity.isSupabaseConfigured ? '✅' : '❌'}</p>
                <p>Supabase Available: {connectivity.isSupabaseAvailable ? '✅' : '❌'}</p>
                <p className={connectivity.usingLocalFallback ? 'text-orange-600' : 'text-green-600'}>
                  Mode: {connectivity.usingLocalFallback ? 'Local Questions' : 'Supabase Database'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Checking...</p>
            )}
          </div>
          <button
            onClick={refreshConnectivity}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Subjects Found: {subjects.length}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {subjects.map(subject => (
                <span
                  key={subject.id}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  {subject.icon} {subject.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Questions Found: {questions.length}</h3>
            {questions.length > 0 ? (
              <div className="mt-2 space-y-2">
                {questions.slice(0, 2).map((question, index) => (
                  <div key={question.id} className="p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium">{question.question_text}</p>
                    <p className="text-gray-600">
                      Subject: {question.subjects?.name || 'Unknown'} | 
                      Difficulty: {question.difficulty_level} | 
                      XP: {question.xp_reward}
                    </p>
                  </div>
                ))}
                {questions.length > 2 && (
                  <p className="text-gray-500 text-sm">...and {questions.length - 2} more</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 mt-2">No questions available</p>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Show'} Debug Info
        </button>
        
        {showDetails && (
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
            <p><strong>Environment:</strong></p>
            <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
            <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
            
            {connectivity && (
              <>
                <p className="mt-2"><strong>Connectivity:</strong></p>
                <p>{JSON.stringify(connectivity, null, 2)}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      {connectivity?.usingLocalFallback && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800">Using Local Questions</h4>
          <p className="text-yellow-700 text-sm mt-1">
            To use the full Supabase database with more questions and features:
          </p>
          <ol className="text-yellow-700 text-sm mt-2 list-decimal list-inside space-y-1">
            <li>Go to your Supabase project dashboard</li>
            <li>Open the SQL Editor</li>
            <li>Run the migration files in supabase/migrations/</li>
            <li>Click "Refresh" above to test the connection</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default QuickTest;