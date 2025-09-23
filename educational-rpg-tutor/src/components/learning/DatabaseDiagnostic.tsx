import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

interface DiagnosticResult {
  subjects: any[];
  questions: any[];
  mathQuestions: any[];
  error: string | null;
  isLoading: boolean;
}

export const DatabaseDiagnostic: React.FC = () => {
  const [result, setResult] = useState<DiagnosticResult>({
    subjects: [],
    questions: [],
    mathQuestions: [],
    error: null,
    isLoading: true
  });

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        setResult(prev => ({ ...prev, isLoading: true, error: null }));

        // Check subjects
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('name');

        if (subjectsError) {
          throw new Error(`Subjects error: ${subjectsError.message}`);
        }

        // Check all questions
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            subjects (
              name,
              primary_stat,
              secondary_stat
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (questionsError) {
          throw new Error(`Questions error: ${questionsError.message}`);
        }

        // Check specifically for math questions
        const mathSubject = subjects?.find(s => s.name === 'Mathematics');
        let mathQuestions: any[] = [];
        
        if (mathSubject) {
          const { data: mathQs, error: mathError } = await supabase
            .from('questions')
            .select(`
              *,
              subjects (
                name,
                primary_stat,
                secondary_stat
              )
            `)
            .eq('subject_id', mathSubject.id)
            .order('age_range')
            .order('difficulty_level');

          if (mathError) {
            throw new Error(`Math questions error: ${mathError.message}`);
          }

          mathQuestions = mathQs || [];
        }

        setResult({
          subjects: subjects || [],
          questions: questions || [],
          mathQuestions,
          error: null,
          isLoading: false
        });

      } catch (error) {
        setResult(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false
        }));
      }
    };

    runDiagnostic();
  }, []);

  const createMathSubject = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: 'Mathematics',
          description: 'Numbers, calculations, and problem-solving',
          primary_stat: 'intelligence',
          secondary_stat: 'wisdom'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create Mathematics subject: ${error.message}`);
      }

      // Refresh the diagnostic
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createSampleMathQuestions = async () => {
    try {
      const mathSubject = result.subjects.find(s => s.name === 'Mathematics');
      if (!mathSubject) {
        alert('Mathematics subject not found. Create it first.');
        return;
      }

      const sampleQuestions = [
        {
          subject_id: mathSubject.id,
          question_text: 'What is 2 + 2?',
          answer_options: JSON.stringify(['3', '4', '5', '6']),
          correct_answer: '4',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '7-10',
          hint: 'Count on your fingers',
          explanation: '2 + 2 = 4'
        },
        {
          subject_id: mathSubject.id,
          question_text: 'What is 5 + 3?',
          answer_options: JSON.stringify(['7', '8', '9', '10']),
          correct_answer: '8',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '7-10',
          hint: 'Count up from 5',
          explanation: '5 + 3 = 8'
        },
        {
          subject_id: mathSubject.id,
          question_text: 'Count the stars: ⭐⭐⭐',
          answer_options: JSON.stringify(['2', '3', '4', '5']),
          correct_answer: '3',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '3-6',
          hint: 'Point to each star and count',
          explanation: 'There are 3 stars'
        }
      ];

      const { error } = await supabase
        .from('questions')
        .insert(sampleQuestions);

      if (error) {
        throw new Error(`Failed to create questions: ${error.message}`);
      }

      // Refresh the diagnostic
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (result.isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Running database diagnostic...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Database Diagnostic</h2>

      {result.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{result.error}</p>
        </div>
      )}

      {/* Subjects Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Subjects ({result.subjects.length})
        </h3>
        {result.subjects.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">No subjects found in database.</p>
            <button
              onClick={createMathSubject}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Mathematics Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.subjects.map(subject => (
              <div key={subject.id} className="p-3 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800">{subject.name}</h4>
                <p className="text-sm text-gray-600">{subject.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Primary: {subject.primary_stat} | Secondary: {subject.secondary_stat}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Math Questions Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Mathematics Questions ({result.mathQuestions.length})
        </h3>
        {result.mathQuestions.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">No mathematics questions found.</p>
            {result.subjects.find(s => s.name === 'Mathematics') ? (
              <button
                onClick={createSampleMathQuestions}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Sample Math Questions
              </button>
            ) : (
              <p className="text-sm text-yellow-600 mt-2">
                Create the Mathematics subject first.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {result.mathQuestions.map(question => (
              <div key={question.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{question.question_text}</h4>
                  <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {question.age_range}
                    </span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      Level {question.difficulty_level}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      {question.xp_reward} XP
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Correct Answer:</strong> {question.correct_answer}
                </div>
                {question.hint && (
                  <div className="text-sm text-gray-500 mt-1">
                    <strong>Hint:</strong> {question.hint}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Questions Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Recent Questions ({result.questions.length})
        </h3>
        {result.questions.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">No questions found in database.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {result.questions.map(question => (
              <div key={question.id} className="p-2 border border-gray-200 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{question.question_text}</span>
                  <div className="flex space-x-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {question.subjects?.name || 'Unknown'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {question.age_range}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh Diagnostic
          </button>
          {result.subjects.find(s => s.name === 'Mathematics') && result.mathQuestions.length === 0 && (
            <button
              onClick={createSampleMathQuestions}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Sample Math Questions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseDiagnostic;