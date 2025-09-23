import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

interface DiagnosticResult {
  supabaseConfigured: boolean;
  connectionWorking: boolean;
  tablesExist: boolean;
  authWorking: boolean;
  error: string | null;
  details: any;
}

export const AuthDiagnostic: React.FC = () => {
  const [result, setResult] = useState<DiagnosticResult>({
    supabaseConfigured: false,
    connectionWorking: false,
    tablesExist: false,
    authWorking: false,
    error: null,
    details: {}
  });
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const diagnosticResult: DiagnosticResult = {
      supabaseConfigured: false,
      connectionWorking: false,
      tablesExist: false,
      authWorking: false,
      error: null,
      details: {}
    };

    try {
      // Check if Supabase is configured
      diagnosticResult.supabaseConfigured = isSupabaseConfigured;
      diagnosticResult.details.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      diagnosticResult.details.hasAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!isSupabaseConfigured) {
        diagnosticResult.error = 'Supabase is not configured. Check your .env file.';
        setResult(diagnosticResult);
        setIsRunning(false);
        return;
      }

      // Test basic connection
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
          if (error.code === '42P01') {
            diagnosticResult.connectionWorking = true;
            diagnosticResult.tablesExist = false;
            diagnosticResult.error = 'Connected to Supabase but users table does not exist.';
          } else {
            diagnosticResult.connectionWorking = false;
            diagnosticResult.error = `Database connection error: ${error.message}`;
          }
        } else {
          diagnosticResult.connectionWorking = true;
          diagnosticResult.tablesExist = true;
        }
      } catch (err) {
        diagnosticResult.connectionWorking = false;
        diagnosticResult.error = `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }

      // Test auth functionality
      try {
        const { data: { session } } = await supabase.auth.getSession();
        diagnosticResult.authWorking = true;
        diagnosticResult.details.currentSession = !!session;
      } catch (err) {
        diagnosticResult.authWorking = false;
        diagnosticResult.details.authError = err instanceof Error ? err.message : 'Unknown auth error';
      }

      // Check what tables exist
      if (diagnosticResult.connectionWorking) {
        try {
          const tables = ['users', 'characters', 'subjects', 'questions'];
          const tableStatus: any = {};
          
          for (const table of tables) {
            try {
              const { error } = await supabase.from(table).select('count').limit(1);
              tableStatus[table] = !error;
            } catch {
              tableStatus[table] = false;
            }
          }
          
          diagnosticResult.details.tables = tableStatus;
        } catch (err) {
          diagnosticResult.details.tableCheckError = err instanceof Error ? err.message : 'Unknown error';
        }
      }

    } catch (err) {
      diagnosticResult.error = `Diagnostic failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
    }

    setResult(diagnosticResult);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const createBasicTables = async () => {
    try {
      setIsRunning(true);
      
      // Create users table
      const { error } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            age INTEGER NOT NULL CHECK (age >= 3 AND age <= 18),
            parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
            parental_consent_given BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (error) {
        throw error;
      }

      // Re-run diagnostic
      await runDiagnostic();
    } catch (err) {
      console.error('Failed to create tables:', err);
      alert(`Failed to create tables: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testGuestLogin = async () => {
    try {
      setIsRunning(true);
      
      // Try to sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        throw error;
      }

      alert('Guest login successful! You can now use the app.');
      window.location.href = '/app/home';
    } catch (err) {
      alert(`Guest login failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Authentication Diagnostic</h2>

      <div className="space-y-4">
        {/* Supabase Configuration */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Supabase Configuration</h3>
            <p className="text-sm text-gray-600">
              URL: {result.details.supabaseUrl || 'Not set'}
            </p>
            <p className="text-sm text-gray-600">
              Anon Key: {result.details.hasAnonKey ? 'Set' : 'Not set'}
            </p>
          </div>
          <div className={`px-3 py-1 rounded text-sm ${
            result.supabaseConfigured 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {result.supabaseConfigured ? '✓ Configured' : '✗ Not Configured'}
          </div>
        </div>

        {/* Database Connection */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Database Connection</h3>
            <p className="text-sm text-gray-600">Can connect to Supabase database</p>
          </div>
          <div className={`px-3 py-1 rounded text-sm ${
            result.connectionWorking 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {result.connectionWorking ? '✓ Working' : '✗ Failed'}
          </div>
        </div>

        {/* Tables Exist */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Required Tables</h3>
            <p className="text-sm text-gray-600">Users table and other required tables exist</p>
            {result.details.tables && (
              <div className="mt-2 text-xs">
                {Object.entries(result.details.tables).map(([table, exists]) => (
                  <span key={table} className={`mr-2 px-2 py-1 rounded ${
                    exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {table}: {exists ? '✓' : '✗'}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={`px-3 py-1 rounded text-sm ${
            result.tablesExist 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {result.tablesExist ? '✓ Exist' : '✗ Missing'}
          </div>
        </div>

        {/* Auth System */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Authentication System</h3>
            <p className="text-sm text-gray-600">Supabase Auth is working</p>
            {result.details.currentSession !== undefined && (
              <p className="text-xs text-gray-500">
                Current session: {result.details.currentSession ? 'Active' : 'None'}
              </p>
            )}
          </div>
          <div className={`px-3 py-1 rounded text-sm ${
            result.authWorking 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {result.authWorking ? '✓ Working' : '✗ Failed'}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {result.error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
          <p className="text-red-600 text-sm">{result.error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Re-run Diagnostic'}
        </button>

        {result.supabaseConfigured && result.connectionWorking && !result.tablesExist && (
          <button
            onClick={createBasicTables}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Create Basic Tables
          </button>
        )}

        {result.supabaseConfigured && result.authWorking && (
          <button
            onClick={testGuestLogin}
            disabled={isRunning}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Guest Login
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Quick Fix Instructions</h3>
        <ol className="list-decimal list-inside text-blue-700 text-sm space-y-1">
          <li>If Supabase is not configured, check your <code>.env</code> file</li>
          <li>If tables are missing, run the database setup SQL scripts in your Supabase dashboard</li>
          <li>If auth is not working, check your Supabase project settings</li>
          <li>Try the "Test Guest Login" button for a quick workaround</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDiagnostic;