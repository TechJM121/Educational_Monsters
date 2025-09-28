# Database Setup Instructions

The hybrid question system requires the Supabase database to be properly set up with tables and seed data.

## Quick Setup

1. **Open your Supabase project dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project: `dpscqnvcppozufsrzjot`

2. **Run the database migrations**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of each file below **in order**:

### Step 1: Create Tables and Functions
Copy and run the entire contents of:
```
educational-rpg-tutor/supabase/migrations/001_complete_database_setup.sql
```

### Step 2: Add Sample Data
Copy and run the entire contents of:
```
educational-rpg-tutor/supabase/migrations/002_seed_data_safe.sql
```

## Verification

After running the migrations, you should have:

### Tables Created:
- `subjects` (6 subjects: Math, Science, Biology, History, Language Arts, Art)
- `questions` (20+ sample questions across different subjects and age ranges)
- `users` (for user management)
- `characters` (for RPG character system)
- `character_stats` (for character attributes)
- `question_responses` (for tracking answers)
- `user_progress` (for learning analytics)
- `achievements` (for gamification)
- `inventory_items` (for rewards)
- `user_inventory` (for user items)

### Sample Data:
- 6 subjects with proper stat mappings
- 20+ questions for ages 3-6 and 7-10
- 12+ achievements
- 12+ inventory items
- Question categories and learning paths

## Testing the Setup

Use the debug component to test your setup:

```typescript
import SupabaseDebug from './components/SupabaseDebug';

// Add this to your app to test
<SupabaseDebug />
```

Or test manually in browser console:
```javascript
// Test basic connection
const { data, error } = await supabase.from('subjects').select('*').limit(5);
console.log('Subjects:', data, 'Error:', error);

// Test questions
const { data: questions, error: qError } = await supabase.from('questions').select('*').limit(5);
console.log('Questions:', questions, 'Error:', qError);
```

## Common Issues

### 1. "relation 'public.subjects' does not exist"
- **Solution**: Run the migration files in the SQL Editor
- Make sure you run `001_complete_database_setup.sql` first

### 2. "No questions found"
- **Solution**: Run `002_seed_data_safe.sql` to add sample data
- Check that the questions table has data: `SELECT COUNT(*) FROM questions;`

### 3. "Permission denied"
- **Solution**: Check your RLS (Row Level Security) policies
- The migration scripts should set up proper policies

### 4. "Invalid API key"
- **Solution**: Verify your `.env` file has the correct keys:
  ```
  VITE_SUPABASE_URL=https://dpscqnvcppozufsrzjot.supabase.co
  VITE_SUPABASE_ANON_KEY=your_actual_anon_key
  ```

## Manual Verification Queries

Run these in the Supabase SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count records in each table
SELECT 'subjects' as table_name, COUNT(*) as count FROM subjects
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items;

-- Sample questions with subjects
SELECT 
    q.question_text,
    q.age_range,
    q.difficulty_level,
    s.name as subject_name
FROM questions q
JOIN subjects s ON q.subject_id = s.id
LIMIT 5;
```

Expected results:
- subjects: 6 records
- questions: 20+ records  
- achievements: 12+ records
- inventory_items: 12+ records

## Next Steps

Once the database is set up:

1. The hybrid question service will automatically detect Supabase is available
2. Questions will be loaded from the database instead of local fallback
3. User progress and responses can be saved
4. Full RPG features will be enabled

If you continue to have issues, use the `SupabaseDebug` component to get detailed error information.