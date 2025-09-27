// Simple test component to verify the hybrid question system
import React, { useEffect, useState } from 'react';
import { hybridQuestionService } from '../services/hybridQuestionService';

export const QuestionSystemTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [connectivity, setConnectivity] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const runTests = async () => {
      try {
        setStatus('Checking connectivity...');
        const connectivityStatus = await hybridQuestionService.getConnectivityStatus();
        setConnectivity(connectivityStatus);

        setStatus('Loading subjects...');
        const loadedSubjects = await hybridQuestionService.getSubjects();
        setSubjects(loadedSubjects);

        setStatus('Loading questions...');
        const loadedQuestions = await hybridQuestionService.getQuestions({
          ageRange: '3-6',
          limit: 5
        });
        setQuestions(loadedQuestions);

        setStatus('Tests completed successfully!');
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Test error:', error);
      }
    };

    runTests();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Question System Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Status:</h3>
          <p className="text-sm text-gray-600">{status}</p>
        </div>

        {connectivity && (
          <div>
            <h3 className="font-semibold">Connectivity:</h3>
            <div className="text-sm space-y-1">
              <p>Supabase Configured: {connectivity.isSupabaseConfigured ? '✅' : '❌'}</p>
              <p>Supabase Available: {connectivity.isSupabaseAvailable ? '✅' : '❌'}</p>
              <p>Using Local Fallback: {connectivity.usingLocalFallback ? '✅' : '❌'}</p>
            </div>
          </div>
        )}

        {subjects.length > 0 && (
          <div>
            <h3 className="font-semibold">Subjects ({subjects.length}):</h3>
            <div className="text-sm space-y-1">
              {subjects.map((subject, index) => (
                <p key={index}>
                  {subject.icon} {subject.name} - {subject.description}
                </p>
              ))}
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div>
            <h3 className="font-semibold">Sample Questions ({questions.length}):</h3>
            <div className="text-sm space-y-2">
              {questions.slice(0, 3).map((question, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">{question.question_text}</p>
                  <p className="text-xs text-gray-600">
                    Subject: {question.subjects?.name || 'Unknown'} | 
                    Difficulty: {question.difficulty_level} | 
                    XP: {question.xp_reward}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSystemTest;