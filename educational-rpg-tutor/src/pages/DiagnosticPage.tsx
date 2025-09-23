import React from 'react';
import DatabaseDiagnostic from '../components/learning/DatabaseDiagnostic';

export const DiagnosticPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Database Diagnostic Tool
          </h1>
          <p className="text-gray-600">
            Check your database setup and fix any issues with math questions
          </p>
        </div>
        
        <DatabaseDiagnostic />
        
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            Instructions to Fix Math Questions
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Go to your Supabase Dashboard → SQL Editor</li>
            <li>Copy and paste the contents of <code>fix_math_questions.sql</code></li>
            <li>Click "Run" to execute the script</li>
            <li>Come back here and click "Refresh Diagnostic"</li>
            <li>If Mathematics subject is missing, click "Create Mathematics Subject"</li>
            <li>If questions are missing, click "Create Sample Math Questions"</li>
          </ol>
          
          <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
            <h3 className="font-medium text-blue-800 mb-2">Alternative: Quick Fix</h3>
            <p className="text-sm text-blue-700">
              If you see the Mathematics subject but no questions, use the "Create Sample Math Questions" 
              button above to add some basic questions for testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;