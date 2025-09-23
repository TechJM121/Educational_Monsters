import React from 'react';
import { aiTutorService } from '../../services/aiTutorService';

export const AITutorTest: React.FC = () => {
  const testService = () => {
    console.log('AI Tutor Service:', aiTutorService);
    console.log('Has API Key:', aiTutorService.hasApiKey());
    console.log('Suggested Questions:', aiTutorService.getSuggestedQuestions(10, 'mathematics'));
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h3 className="text-white mb-4">AI Tutor Service Test</h3>
      <button
        onClick={testService}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Service (Check Console)
      </button>
    </div>
  );
};