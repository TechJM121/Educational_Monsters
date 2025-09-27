// React hook for using the hybrid question service
import { useState, useEffect, useCallback } from 'react';
import { hybridQuestionService, type QuestionFilters } from '../services/hybridQuestionService';
import type { Question, Subject, QuestionResponse } from '../types/question';

export interface UseQuestionsOptions {
  ageRange?: string;
  subjectId?: string;
  difficultyLevel?: number;
  limit?: number;
  userId?: string;
  autoLoad?: boolean;
}

export interface UseQuestionsReturn {
  questions: Question[];
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  connectivity: {
    isSupabaseConfigured: boolean;
    isSupabaseAvailable: boolean;
    usingLocalFallback: boolean;
  } | null;

  // Actions
  loadQuestions: (filters?: QuestionFilters) => Promise<void>;
  loadSubjects: () => Promise<void>;
  submitResponse: (questionId: string, selectedAnswer: string, responseTime?: number) => Promise<QuestionResponse | null>;
  searchQuestions: (searchTerm: string, filters?: Omit<QuestionFilters, 'limit'>, limit?: number) => Promise<Question[]>;
  getQuestionById: (questionId: string) => Promise<Question | null>;
  refreshConnectivity: () => Promise<void>;

  // Utilities
  getFilteredQuestions: (filters: Partial<QuestionFilters>) => Question[];
  getSubjectById: (subjectId: string) => Subject | undefined;
}

export function useQuestions(options: UseQuestionsOptions = {}): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectivity, setConnectivity] = useState<{
    isSupabaseConfigured: boolean;
    isSupabaseAvailable: boolean;
    usingLocalFallback: boolean;
  } | null>(null);

  // Load questions based on filters
  const loadQuestions = useCallback(async (filters?: QuestionFilters) => {
    setLoading(true);
    setError(null);

    try {
      const finalFilters = {
        ageRange: options.ageRange,
        subjectId: options.subjectId,
        difficultyLevel: options.difficultyLevel,
        limit: options.limit,
        userId: options.userId,
        ...filters
      };

      const loadedQuestions = await hybridQuestionService.getQuestions(finalFilters);
      setQuestions(loadedQuestions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions';
      setError(errorMessage);
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  }, [options.ageRange, options.subjectId, options.difficultyLevel, options.limit, options.userId]);

  // Load subjects
  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedSubjects = await hybridQuestionService.getSubjects();
      setSubjects(loadedSubjects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subjects';
      setError(errorMessage);
      console.error('Error loading subjects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit question response
  const submitResponse = useCallback(async (
    questionId: string,
    selectedAnswer: string,
    responseTime?: number
  ): Promise<QuestionResponse | null> => {
    if (!options.userId) {
      console.warn('Cannot submit response without userId');
      return null;
    }

    try {
      const response = await hybridQuestionService.submitQuestionResponse(
        options.userId,
        questionId,
        selectedAnswer,
        responseTime
      );
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit response';
      setError(errorMessage);
      console.error('Error submitting response:', err);
      return null;
    }
  }, [options.userId]);

  // Search questions
  const searchQuestions = useCallback(async (
    searchTerm: string,
    filters: Omit<QuestionFilters, 'limit'> = {},
    limit: number = 20
  ): Promise<Question[]> => {
    try {
      return await hybridQuestionService.searchQuestions(searchTerm, filters, limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search questions';
      setError(errorMessage);
      console.error('Error searching questions:', err);
      return [];
    }
  }, []);

  // Get question by ID
  const getQuestionById = useCallback(async (questionId: string): Promise<Question | null> => {
    try {
      return await hybridQuestionService.getQuestionById(questionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get question';
      setError(errorMessage);
      console.error('Error getting question:', err);
      return null;
    }
  }, []);

  // Refresh connectivity status
  const refreshConnectivity = useCallback(async () => {
    try {
      await hybridQuestionService.refreshConnectivity();
      const status = await hybridQuestionService.getConnectivityStatus();
      setConnectivity(status);
    } catch (err) {
      console.error('Error refreshing connectivity:', err);
    }
  }, []);

  // Get filtered questions from current state
  const getFilteredQuestions = useCallback((filters: Partial<QuestionFilters>): Question[] => {
    return questions.filter(question => {
      if (filters.ageRange && question.age_range !== filters.ageRange) return false;
      if (filters.subjectId && question.subject_id !== filters.subjectId) return false;
      if (filters.difficultyLevel && question.difficulty_level !== filters.difficultyLevel) return false;
      return true;
    });
  }, [questions]);

  // Get subject by ID
  const getSubjectById = useCallback((subjectId: string): Subject | undefined => {
    return subjects.find(subject => subject.id === subjectId);
  }, [subjects]);

  // Load connectivity status on mount
  useEffect(() => {
    const loadConnectivity = async () => {
      try {
        const status = await hybridQuestionService.getConnectivityStatus();
        setConnectivity(status);
      } catch (err) {
        console.error('Error loading connectivity status:', err);
      }
    };

    loadConnectivity();
  }, []);

  // Auto-load data if requested
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadSubjects();
      loadQuestions();
    }
  }, [options.autoLoad, loadSubjects, loadQuestions]);

  return {
    questions,
    subjects,
    loading,
    error,
    connectivity,

    // Actions
    loadQuestions,
    loadSubjects,
    submitResponse,
    searchQuestions,
    getQuestionById,
    refreshConnectivity,

    // Utilities
    getFilteredQuestions,
    getSubjectById
  };
}

// Specialized hooks for common use cases
export function useSubjects() {
  const { subjects, loading, error, loadSubjects } = useQuestions({ autoLoad: false });

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  return { subjects, loading, error, loadSubjects };
}

export function useQuestionsForAge(ageRange: string, limit?: number) {
  return useQuestions({
    ageRange,
    limit,
    autoLoad: true
  });
}

export function useQuestionsForSubject(subjectId: string, ageRange?: string, userId?: string) {
  return useQuestions({
    subjectId,
    ageRange,
    userId,
    autoLoad: true
  });
}

export function useAdaptiveQuestions(userId: string, ageRange: string, subjectId?: string) {
  return useQuestions({
    userId,
    ageRange,
    subjectId,
    autoLoad: true
  });
}