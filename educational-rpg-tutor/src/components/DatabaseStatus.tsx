// Simple component to check database status
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<{
    subjects: number;
    questions: number;
    error?: string;
  }>({ subjects: 0, questions: 0 });

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Check subjects
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');

        if (subjectsError) {
          setStatus({ subjects: 0, questions: 0, error: subjectsError.message });
          return;
        }

        // Check questions
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('*');

        if (questionsError) {
          setStatus({ subjects: subjects?.length || 0, questions: 0, error: questionsError.message });
          return;
        }

        setStatus({
          subjects: subjects?.length || 0,
          questions: questions?.length || 0
        });

      } catch (error) {
        setStatus({ 
          subjects: 0, 
          questions: 0, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    };

    checkDatabase();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">Database Status</h3>
      
      {status.error ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 font-semibold">Database Error:</p>
          <p className="text-red-600 text-sm">{status.error}</p>
          <div className="mt-2 text-sm text-red-600">
            <p>This usually means the database tables haven't been created yet.</p>
            <p>Please run the migration files in your Supabase SQL Editor:</p>
            <ol className="list-decimal list-inside mt-1 ml-2">
              <li>001_complete_database_setup.sql</li>
              <li>002_seed_data_safe.sql</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subjects:</span>
            <span className={status.subjects > 0 ? 'text-green-600' : 'text-red-600'}>
              {status.subjects} {status.subjects === 6 ? '✅' : '❌'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Questions:</span>
            <span className={status.questions > 0 ? 'text-green-600' : 'text-red-600'}>
              {status.questions} {status.questions > 0 ? '✅' : '❌'}
            </span>
          </div>
          
          {status.subjects === 6 && status.questions > 0 ? (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 text-sm">✅ Database is set up correctly!</p>
            </div>
          ) : (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-700 text-sm">⚠️ Database needs setup. Expected: 6 subjects, 20+ questions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;