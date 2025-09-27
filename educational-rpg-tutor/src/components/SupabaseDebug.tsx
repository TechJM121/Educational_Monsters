// Debug component to test Supabase connectivity
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { hybridQuestionService } from '../services/hybridQuestionService';

export const SupabaseDebug: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testSupabaseConnection = async () => {
    setTesting(true);
    clearLogs();

    try {
      addLog('🔍 Starting Supabase connection test...');
      addLog(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);
      addLog(`Supabase Key (first 20 chars): ${import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)}...`);
      addLog(`Is Configured: ${isSupabaseConfigured}`);

      if (!isSupabaseConfigured) {
        addLog('❌ Supabase is not properly configured');
        return;
      }

      // Test 1: Basic connection
      addLog('📡 Testing basic connection...');
      const { data: healthCheck, error: healthError } = await supabase
        .from('subjects')
        .select('count')
        .limit(1);
      
      if (healthError) {
        addLog(`❌ Health check failed: ${healthError.message}`);
        addLog(`Error code: ${healthError.code}`);
        addLog(`Error details: ${JSON.stringify(healthError.details)}`);
        return;
      }
      addLog('✅ Basic connection successful');

      // Test 2: Check subjects table
      addLog('📚 Testing subjects table...');
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .limit(5);

      if (subjectsError) {
        addLog(`❌ Subjects query failed: ${subjectsError.message}`);
        addLog(`Error code: ${subjectsError.code}`);
        return;
      }
      addLog(`✅ Subjects found: ${subjects?.length || 0}`);
      if (subjects && subjects.length > 0) {
        addLog(`Sample subjects: ${subjects.map(s => s.name).join(', ')}`);
      }

      // Test 3: Check questions table
      addLog('❓ Testing questions table...');
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .limit(5);

      if (questionsError) {
        addLog(`❌ Questions query failed: ${questionsError.message}`);
        addLog(`Error code: ${questionsError.code}`);
        addLog(`Error details: ${JSON.stringify(questionsError.details)}`);
        return;
      }
      addLog(`✅ Questions found: ${questions?.length || 0}`);
      if (questions && questions.length > 0) {
        addLog(`Sample questions: ${questions.map(q => q.question_text?.substring(0, 50) + '...').join(', ')}`);
      }

      // Test 4: Test questions with subjects join
      addLog('🔗 Testing questions with subjects join...');
      const { data: questionsWithSubjects, error: joinError } = await supabase
        .from('questions')
        .select(`
          *,
          subjects (
            id,
            name,
            description,
            primary_stat,
            secondary_stat
          )
        `)
        .limit(3);

      if (joinError) {
        addLog(`❌ Questions with subjects join failed: ${joinError.message}`);
        addLog(`Error code: ${joinError.code}`);
        return;
      }
      addLog('✅ Questions with subjects join successful');
      if (questionsWithSubjects && questionsWithSubjects.length > 0) {
        questionsWithSubjects.forEach((q, i) => {
          addLog(`  ${i + 1}. "${q.question_text?.substring(0, 30)}..." - Subject: ${q.subjects?.name || 'Unknown'}`);
        });
      }

      addLog('🎉 All tests passed! Supabase is working correctly.');

    } catch (error) {
      addLog(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Full error:', error);
    } finally {
      setTesting(false);
    }
  };

  const testHybridService = async () => {
    setTesting(true);
    addLog('🔄 Testing Hybrid Question Service...');

    try {
      // Test connectivity status
      const connectivity = await hybridQuestionService.getConnectivityStatus();
      addLog(`Connectivity Status:`);
      addLog(`  - Supabase Configured: ${connectivity.isSupabaseConfigured}`);
      addLog(`  - Supabase Available: ${connectivity.isSupabaseAvailable}`);
      addLog(`  - Using Local Fallback: ${connectivity.usingLocalFallback}`);

      // Test getting subjects
      addLog('📚 Testing hybrid subjects...');
      const subjects = await hybridQuestionService.getSubjects();
      addLog(`✅ Got ${subjects.length} subjects`);
      subjects.forEach(s => addLog(`  - ${s.icon} ${s.name}`));

      // Test getting questions
      addLog('❓ Testing hybrid questions...');
      const questions = await hybridQuestionService.getQuestions({
        ageRange: '3-6',
        limit: 5
      });
      addLog(`✅ Got ${questions.length} questions`);
      questions.forEach((q, i) => addLog(`  ${i + 1}. "${q.question_text?.substring(0, 40)}..."`));

    } catch (error) {
      addLog(`❌ Hybrid service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const runDatabaseSetup = async () => {
    addLog('🏗️ Checking if database needs setup...');
    addLog('Note: You may need to run the migration scripts manually in Supabase SQL editor');
    addLog('Files to run:');
    addLog('  1. supabase/migrations/001_complete_database_setup.sql');
    addLog('  2. supabase/migrations/002_seed_data_safe.sql');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Supabase Debug Console</h2>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testSupabaseConnection}
          disabled={testing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Supabase Connection'}
        </button>
        
        <button
          onClick={testHybridService}
          disabled={testing}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Hybrid Service'}
        </button>
        
        <button
          onClick={runDatabaseSetup}
          disabled={testing}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Database Setup Info
        </button>
        
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500">Click a test button to start debugging...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Environment Info:</h3>
        <div className="text-sm space-y-1">
          <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
          <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'}</p>
          <p><strong>Is Configured:</strong> {isSupabaseConfigured ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Setup Guide:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Make sure your .env file has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
          <li>Go to your Supabase project dashboard</li>
          <li>Navigate to SQL Editor</li>
          <li>Run the migration files in order:
            <ul className="ml-4 mt-1 list-disc list-inside">
              <li>001_complete_database_setup.sql</li>
              <li>002_seed_data_safe.sql</li>
            </ul>
          </li>
          <li>Click "Test Supabase Connection" to verify everything works</li>
        </ol>
      </div>
    </div>
  );
};

export default SupabaseDebug;