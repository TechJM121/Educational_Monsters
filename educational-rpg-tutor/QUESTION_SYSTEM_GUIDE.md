# Hybrid Question System Guide

The Educational RPG Tutor now includes a hybrid question system that automatically checks if Supabase is available and falls back to local questions when needed.

## How It Works

The system follows this priority order:

1. **Supabase First**: If Supabase credentials are configured and the database is accessible, it uses the full Supabase question database with all advanced features.

2. **Local Fallback**: If Supabase is not configured or not accessible, it automatically falls back to a curated set of local questions stored in the app.

3. **Automatic Detection**: The system periodically checks connectivity and switches between modes seamlessly.

## Key Components

### 1. HybridQuestionService (`src/services/hybridQuestionService.ts`)

The main service that handles the logic for choosing between Supabase and local questions.

```typescript
import { hybridQuestionService } from '../services/hybridQuestionService';

// Get questions (automatically chooses source)
const questions = await hybridQuestionService.getQuestions({
  ageRange: '3-6',
  subjectId: 'math-local',
  limit: 10
});

// Check connectivity status
const status = await hybridQuestionService.getConnectivityStatus();
console.log(status.usingLocalFallback); // true if using local questions
```

### 2. React Hook (`src/hooks/useQuestions.ts`)

A convenient React hook for using the question system in components.

```typescript
import { useQuestions } from '../hooks/useQuestions';

function MyComponent() {
  const {
    questions,
    subjects,
    loading,
    connectivity,
    loadQuestions,
    submitResponse
  } = useQuestions({
    ageRange: '7-10',
    userId: 'user-123',
    autoLoad: true
  });

  return (
    <div>
      {connectivity?.usingLocalFallback && (
        <div>Using local questions (Supabase not available)</div>
      )}
      {/* Render questions */}
    </div>
  );
}
```

### 3. Local Question Data (`src/data/localQuestions.ts`)

Contains fallback questions and subjects that work offline.

## Usage Examples

### Basic Question Loading

```typescript
// Load questions for a specific age range
const { questions, loading } = useQuestions({
  ageRange: '3-6',
  limit: 5,
  autoLoad: true
});
```

### Subject-Specific Questions

```typescript
// Load math questions for ages 7-10
const { questions } = useQuestionsForSubject('math-local', '7-10');
```

### Adaptive Questions (Supabase only)

```typescript
// Load adaptive questions based on user performance
const { questions } = useAdaptiveQuestions('user-123', '7-10', 'math-local');
```

### Submitting Responses

```typescript
const { submitResponse } = useQuestions({ userId: 'user-123' });

// Submit an answer (only works with Supabase)
const response = await submitResponse('question-id', 'selected-answer', 30);
if (response) {
  console.log(`XP earned: ${response.xp_earned}`);
}
```

## Configuration

### Supabase Setup

1. Set your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Run the database migrations:
```sql
-- Run the files in supabase/migrations/
-- 001_complete_database_setup.sql
-- 002_seed_data_safe.sql
```

### Local Questions

Local questions are defined in `src/data/localQuestions.ts`. You can:

1. **Add new subjects**:
```typescript
export const localSubjects: Subject[] = [
  // ... existing subjects
  {
    id: 'new-subject',
    name: 'New Subject',
    description: 'Description here',
    icon: '📚',
    color: '#3B82F6',
    statMapping: {
      primary: 'intelligence',
      secondary: 'wisdom'
    }
  }
];
```

2. **Add new questions**:
```typescript
export const localQuestions: Question[] = [
  // ... existing questions
  {
    id: 'new-question-1',
    subject_id: 'new-subject',
    question_text: 'What is 2 + 2?',
    answer_options: ['3', '4', '5', '6'],
    correct_answer: '4',
    difficulty_level: 1,
    xp_reward: 10,
    age_range: '3-6',
    hint: 'Count on your fingers!',
    explanation: '2 + 2 equals 4.',
    subjects: localSubjects.find(s => s.id === 'new-subject')
  }
];
```

## Features by Mode

### Supabase Mode (Full Features)
- ✅ Adaptive difficulty based on user performance
- ✅ Progress tracking and analytics
- ✅ XP and character progression
- ✅ Achievement system
- ✅ Large question database
- ✅ User response history
- ✅ Advanced filtering and search

### Local Mode (Limited Features)
- ✅ Basic question display
- ✅ Subject filtering
- ✅ Age-appropriate content
- ✅ Offline functionality
- ❌ No progress persistence
- ❌ No adaptive difficulty
- ❌ Limited question variety
- ❌ No user analytics

## Connectivity Status

The system provides real-time connectivity information:

```typescript
const { connectivity } = useQuestions();

if (connectivity) {
  console.log('Supabase configured:', connectivity.isSupabaseConfigured);
  console.log('Supabase available:', connectivity.isSupabaseAvailable);
  console.log('Using local fallback:', connectivity.usingLocalFallback);
}
```

## Testing Components

Two demo components are included:

1. **QuestionSystemTest** (`src/components/QuestionSystemTest.tsx`): Simple connectivity and data loading test
2. **QuestionDemo** (`src/components/QuestionDemo.tsx`): Full interactive demo with question answering

## Best Practices

1. **Always handle both modes**: Design your UI to work whether using Supabase or local questions.

2. **Show connectivity status**: Let users know when they're offline or using limited functionality.

3. **Graceful degradation**: Disable features that require Supabase when in local mode.

4. **Error handling**: The system handles errors gracefully, but always check for null responses.

5. **Performance**: Local questions load instantly, while Supabase queries may take time.

## Troubleshooting

### Common Issues

1. **"Using local questions" when Supabase should work**:
   - Check your `.env` file has correct credentials
   - Verify Supabase project is running
   - Check network connectivity

2. **No questions loading**:
   - Verify local questions are properly imported
   - Check console for error messages
   - Ensure age ranges match available questions

3. **TypeScript errors**:
   - Make sure question types match the interface
   - Check that all required fields are present

### Debug Mode

Enable debug logging by checking the browser console. The system logs which mode it's using:

```
"Using Supabase for questions" - Connected to database
"Using local questions" - Fallback mode active
```

## Migration Guide

If you have existing question-related code:

1. Replace direct Supabase calls with `hybridQuestionService`
2. Use the `useQuestions` hook instead of custom hooks
3. Handle the case where `submitResponse` returns `null` (local mode)
4. Update UI to show connectivity status

This hybrid approach ensures your app works reliably regardless of database connectivity while providing the best possible experience when Supabase is available.