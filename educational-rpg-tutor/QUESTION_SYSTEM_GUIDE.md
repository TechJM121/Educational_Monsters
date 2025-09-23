# 🎯 Educational RPG Tutor - Question System Guide

This guide explains how to set up and use the comprehensive question loading system for the Educational RPG Tutor.

## 📋 Overview

The question system provides:
- **100+ comprehensive questions** across 6 subjects and 4 age ranges
- **Adaptive difficulty** based on user performance
- **Progress tracking** and analytics
- **Efficient caching** and batch loading
- **Search and filtering** capabilities
- **Offline support** for question pre-loading

## 🏗️ Database Setup

### Step 1: Run the Setup Script

```bash
node setup_questions.js
```

This will show you detailed instructions for setting up your Supabase database.

### Step 2: Execute SQL Scripts

In your Supabase SQL Editor, run these scripts **in order**:

1. **`complete_database_setup.sql`** - Creates all tables, functions, and indexes
2. **`comprehensive_questions_seed.sql`** - Loads 100+ questions across all subjects
3. **`seed_data_safe.sql`** - Adds achievements, items, and additional data

### Step 3: Verify Setup

Run this verification query:

```sql
SELECT 
    s.name as subject,
    q.age_range,
    COUNT(*) as question_count
FROM public.questions q
JOIN public.subjects s ON q.subject_id = s.id
GROUP BY s.name, q.age_range
ORDER BY s.name, q.age_range;
```

Expected results:
- **Mathematics**: 15+ questions (3-6, 7-10, 11-14, 15-18)
- **Science**: 10+ questions across age ranges
- **Language Arts**: 8+ questions across age ranges
- **History**: 6+ questions across age ranges
- **Biology**: 6+ questions across age ranges
- **Art**: 6+ questions across age ranges

## 🚀 Using the Question System

### Enhanced Question Service

The `enhancedQuestionService` provides advanced question loading capabilities:

```typescript
import { enhancedQuestionService } from './services/enhancedQuestionService';

// Load questions with filters
const questionBatch = await enhancedQuestionService.loadQuestions({
  ageRange: '7-10',
  subjectId: 'math-subject-id',
  difficultyLevel: 2,
  limit: 20,
  excludeAnswered: true,
  userId: 'user-id'
});

// Get adaptive questions based on performance
const adaptiveQuestions = await enhancedQuestionService.getAdaptiveQuestions(
  userId,
  '7-10',
  subjectId,
  10
);

// Get user progress across subjects
const progress = await enhancedQuestionService.getUserProgressBySubject(
  userId, 
  '7-10'
);

// Search questions by content
const searchResults = await enhancedQuestionService.searchQuestions(
  'addition',
  { ageRange: '7-10', subjectId: 'math-id' }
);

// Bulk load for offline use
const offlineQuestions = await enhancedQuestionService.bulkLoadQuestions(
  '7-10',
  ['math-id', 'science-id']
);
```

### Question Loader Component

Use the pre-built React component for easy question management:

```tsx
import QuestionLoader from './components/learning/QuestionLoader';

function LearningPage() {
  const handleQuestionsLoaded = (questions: Question[]) => {
    console.log('Loaded questions:', questions);
    // Start learning session with questions
  };

  const handleError = (error: string) => {
    console.error('Question loading error:', error);
    // Show error message to user
  };

  return (
    <div>
      <QuestionLoader
        userId={currentUser.id}
        ageRange="7-10"
        onQuestionsLoaded={handleQuestionsLoaded}
        onError={handleError}
      />
    </div>
  );
}
```

### Question System Hook

For custom implementations, use the question system hook:

```tsx
import { useQuestionSystem } from '../hooks/useQuestionSystem';

function CustomLearningComponent() {
  const {
    questions,
    currentQuestion,
    isLoading,
    error,
    sessionComplete,
    sessionStats,
    submitAnswer,
    nextQuestion,
    progress
  } = useQuestionSystem({
    userId: 'user-id',
    ageRange: '7-10',
    subjectId: 'math-id',
    questionsPerSession: 10
  });

  const handleAnswerSubmit = async (selectedAnswer: string) => {
    const responseTime = 5; // seconds
    try {
      const response = await submitAnswer(selectedAnswer, responseTime);
      console.log('Answer submitted:', response);
      
      // Move to next question after a delay
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  if (isLoading) return <div>Loading questions...</div>;
  if (error) return <div>Error: {error}</div>;
  if (sessionComplete) return <div>Session complete! Stats: {sessionStats}</div>;

  return (
    <div>
      <div>Progress: {progress.current}/{progress.total}</div>
      {currentQuestion && (
        <div>
          <h3>{currentQuestion.question_text}</h3>
          {currentQuestion.answer_options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSubmit(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 📊 Question Structure

Each question includes:

```typescript
interface Question {
  id: string;
  subject_id: string;
  question_text: string;
  answer_options: string[];
  correct_answer: string;
  difficulty_level: number; // 1-5
  xp_reward: number;
  age_range: string; // '3-6', '7-10', '11-14', '15-18'
  hint?: string;
  explanation?: string;
  subjects?: {
    name: string;
    primary_stat: string;
    secondary_stat: string;
  };
}
```

## 🎯 Adaptive Learning Features

### Difficulty Scaling

The system automatically adjusts question difficulty based on:
- **User accuracy**: Higher accuracy → harder questions
- **Response time**: Faster responses → slight difficulty increase
- **Recent performance trend**: Improving/declining performance
- **Subject-specific progress**: Individual subject mastery levels

### Performance Tracking

Track user progress with detailed metrics:
- Questions answered per subject
- Accuracy rates and trends
- Average response times
- Difficulty progression
- Learning streaks
- XP earned per session

### Smart Question Selection

Questions are selected using:
- **Spaced repetition**: Avoid recently answered questions
- **Difficulty balancing**: Mix of appropriate difficulty levels
- **Subject rotation**: Balanced exposure to different topics
- **Weakness targeting**: Focus on areas needing improvement

## 🔧 Configuration Options

### Question Filters

```typescript
interface QuestionFilters {
  subjectId?: string;        // Filter by subject
  ageRange?: string;         // Filter by age range
  difficultyLevel?: number;  // Filter by difficulty (1-5)
  limit?: number;            // Number of questions to load
  excludeAnswered?: boolean; // Skip already answered questions
  userId?: string;           // User ID for personalization
}
```

### Learning Session Config

```typescript
interface LearningSessionConfig {
  questionsPerSession: number;  // Questions in one session
  timeLimit?: number;           // Session time limit (seconds)
  adaptiveDifficulty: boolean;  // Enable adaptive difficulty
  showProgress: boolean;        // Show progress indicators
  enableHints: boolean;         // Allow hints for questions
}
```

## 📈 Analytics and Progress

### Subject Progress

```typescript
interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageDifficulty: number;
  lastActivity: Date | null;
}
```

### Session Analytics

```typescript
interface SessionAnalytics {
  sessionId: string;
  userId: string;
  subjectId?: string;
  startTime: Date;
  endTime?: Date;
  totalQuestions: number;
  correctAnswers: number;
  totalXPEarned: number;
  averageResponseTime: number;
  accuracy: number;
  difficultyProgression: number[];
  timeSpentPerQuestion: number[];
  streakBonuses: number;
}
```

## 🎮 Gamification Integration

### XP and Leveling

- **Base XP**: Each question has a base XP reward
- **Difficulty multiplier**: Harder questions give more XP
- **Time bonus**: Faster responses earn bonus XP
- **Streak bonuses**: Consecutive correct answers multiply XP
- **Subject mastery**: Bonus XP for completing subject milestones

### Character Stats

Questions boost character stats based on subject:
- **Mathematics**: Intelligence + Wisdom
- **Science**: Dexterity + Intelligence  
- **Biology**: Vitality + Intelligence
- **History**: Wisdom + Charisma
- **Language Arts**: Charisma + Creativity
- **Art**: Creativity + Charisma

### Achievements

Unlock achievements for:
- Answering questions correctly
- Completing learning streaks
- Mastering subjects
- Speed achievements
- Perfect scores

## 🔍 Troubleshooting

### Common Issues

**Questions not loading:**
- Check Supabase connection
- Verify table structure exists
- Check user permissions

**Adaptive questions not working:**
- Ensure user has answer history
- Check performance calculation logic
- Verify difficulty scaling parameters

**Cache issues:**
- Clear cache: `enhancedQuestionService.clearCache()`
- Check cache expiry settings
- Verify cache key generation

**Performance problems:**
- Use question batching for large datasets
- Implement pagination for question lists
- Pre-load questions for offline use

### Debug Queries

Check question distribution:
```sql
SELECT 
    s.name,
    q.difficulty_level,
    COUNT(*) as count
FROM questions q
JOIN subjects s ON q.subject_id = s.id
GROUP BY s.name, q.difficulty_level
ORDER BY s.name, q.difficulty_level;
```

Check user progress:
```sql
SELECT 
    s.name,
    COUNT(qr.*) as answered,
    SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct,
    AVG(qr.response_time_seconds) as avg_time
FROM question_responses qr
JOIN questions q ON qr.question_id = q.id
JOIN subjects s ON q.subject_id = s.id
WHERE qr.user_id = 'user-id'
GROUP BY s.name;
```

## 🚀 Next Steps

1. **Run the setup script**: `node setup_questions.js`
2. **Execute SQL scripts** in your Supabase dashboard
3. **Integrate the QuestionLoader component** in your app
4. **Test the adaptive learning** with different user scenarios
5. **Customize the UI** to match your app's design
6. **Add more questions** using the same SQL pattern

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [Educational Game Design Principles](https://www.edutopia.org/game-based-learning-resources)

---

**Happy Learning! 🎓✨**

The question system is designed to grow with your users, providing personalized, engaging educational experiences that adapt to each learner's needs and progress.