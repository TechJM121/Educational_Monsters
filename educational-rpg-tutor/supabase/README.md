# Supabase Database Setup for Educational RPG Tutor

This directory contains the complete database schema, migrations, and seed data for the Educational RPG Tutor application, including advanced progression tracking and adaptive question systems.

## 🚀 Quick Setup Guide

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a strong database password and save it securely
3. Wait for the project to be fully initialized (this may take a few minutes)
4. Navigate to Settings → API to find your project credentials

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env` in the project root directory
2. Update the environment variables with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 3. Run Database Migrations (In Order)

Execute these SQL files **in the exact order listed** using the Supabase SQL editor:

#### Core Database Setup (Required)
1. **migrations/001_complete_database_setup.sql** - Complete database schema with all tables, functions, and RLS policies
2. **migrations/002_seed_data_safe.sql** - Sample data including subjects, questions, achievements, and inventory items

#### Database Utilities
- **check_database_status.sql** - Utility script to verify database setup and check table contents

### 4. Verify Setup

After running all migrations, you should have the following tables:

#### Core User & Character System
- `users` - User profiles and parental consent tracking
- `characters` - Student characters with levels and XP
- `character_stats` - RPG-style character statistics (Intelligence, Vitality, etc.)

#### Educational Content
- `subjects` - Learning subjects (Math, Science, Language Arts, etc.)
- `questions` - Educational questions by subject and age group
- `question_categories` - Organized question groupings
- `question_tags` - Flexible question tagging system
- `question_hints` - Helpful hints for difficult questions
- `question_explanations` - Detailed explanations for learning

#### Progression & Analytics
- `question_responses` - Student answers and XP earned
- `user_progress` - Learning progress tracking per subject
- `learning_paths` - Structured curriculum paths
- `user_learning_paths` - Individual progress through learning paths
- `skills` - Specific skills within subjects
- `user_skills` - Skill mastery tracking
- `daily_goals` - Daily learning objectives
- `learning_streaks` - Streak tracking for motivation
- `performance_analytics` - Detailed learning analytics
- `adaptive_difficulty` - Personalized difficulty adjustment

#### Gamification
- `achievements` - Badges and accomplishments
- `user_achievements` - Earned achievements per user
- `inventory_items` - Collectible items and equipment
- `user_inventory` - Items owned by each user

#### Question Management
- `question_pools` - Curated question collections
- `question_pool_items` - Questions within pools
- `user_question_history` - Question interaction tracking

## 🔧 Database Functions

### Core Progression Functions
- `calculate_xp_for_level(target_level)` - Returns XP needed for a specific level
- `calculate_level_from_xp(total_xp)` - Returns current level based on total XP
- `calculate_xp_reward(difficulty, is_correct, time, stats)` - Calculates XP for question answers
- `award_xp_and_level_up(character_id, xp)` - Awards XP and handles level progression
- `allocate_stat_points(character_id, stats...)` - Distributes stat points
- `process_question_response(user_id, question_id, answer, time)` - Complete question processing

### Enhanced Progression Functions
- `update_daily_goals_progress(user_id, xp, questions, time)` - Updates daily learning goals
- `update_learning_streak(user_id, streak_type, subject_id)` - Manages learning streaks
- `update_performance_analytics(user_id, subject_id, ...)` - Records detailed analytics

### Adaptive Learning Functions
- `get_adaptive_question(user_id, subject_id, age_range)` - Gets personalized questions
- `update_adaptive_difficulty(user_id, subject_id, performance)` - Adjusts difficulty
- `record_question_interaction(user_id, question_id, score)` - Tracks question history

### Usage Examples

```sql
-- Get a personalized question for a 7-year-old studying math
SELECT * FROM get_adaptive_question(
    'user-uuid-here', 
    'math-subject-uuid', 
    '7-10'
);

-- Process a question response and award XP
SELECT process_question_response(
    'user-uuid-here',
    'question-uuid-here', 
    'selected answer',
    25 -- response time in seconds
);

-- Update daily learning goals
SELECT update_daily_goals_progress(
    'user-uuid-here',
    50, -- XP earned
    5,  -- questions answered
    15  -- time spent in minutes
);
```

## Row Level Security

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Parents can view their children's data
- Age-appropriate content filtering
- Secure stat and XP calculations

## 📊 Seed Data

### Basic Seed Data (seed.sql)
- **6 core subjects** with stat mappings (Math, Science, Language Arts, History, Biology, Art)
- **14 achievements** across different categories (learning, streaks, levels)
- **10 inventory items** with various rarities and stat bonuses
- **Sample questions** for different age groups and subjects (15+ questions)

### Enhanced Seed Data (enhanced_seed.sql)
- **12 question categories** organized by subject
- **14 question tags** for flexible categorization
- **18 skills** across all subjects with mastery thresholds
- **7 learning paths** with structured progression
- **6 question pools** including specialized math pools
- **Question hints and explanations** for enhanced learning
- **Advanced questions** with time limits and difficulty scaling

### Comprehensive Mathematics Content
- **400+ math questions** across all age groups (3-18 years)
- **Complete curriculum coverage** from basic counting to advanced calculus
- **7 specialized question pools** for targeted learning
- **Multiple math categories**: Arithmetic, Geometry, Patterns, Applications
- **Real-world applications** including finance, physics, engineering
- **Progressive difficulty scaling** with adaptive selection
- **Comprehensive hint system** with step-by-step guidance
- **Detailed explanations** for both correct and incorrect answers

#### Mathematics Question Categories
- **Basic Arithmetic**: Addition, subtraction, multiplication, division, fractions, decimals
- **Geometry & Measurement**: Shapes, area, volume, coordinate geometry, trigonometry
- **Patterns & Logic**: Number sequences, Fibonacci, prime numbers, mathematical reasoning
- **Practical Applications**: Money problems, time calculations, real-world scenarios
- **Advanced Topics**: Algebra, calculus, statistics, number theory, discrete mathematics

### Data Coverage by Age Group
- **Ages 3-6**: Basic concepts, simple recognition, foundational skills
- **Ages 7-10**: Elementary skills, problem-solving, practical applications
- **Ages 11-14**: Advanced concepts, critical thinking, complex problems
- **Ages 15-18**: Specialized knowledge, analytical skills, preparation for higher education

## 🧪 Testing the Setup

### Basic Functionality Tests
1. **User Registration**: Create a test user account through the app
2. **Character Creation**: Verify character and stats are created properly
3. **Question System**: Test question retrieval and response processing
4. **XP Calculation**: Verify XP is awarded correctly for correct answers
5. **Level Progression**: Test level-up functionality and stat point allocation

### Advanced Feature Tests
```sql
-- Test adaptive question selection
SELECT * FROM get_adaptive_question(
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Mathematics'),
    '7-10'
);

-- Test daily goals tracking
SELECT update_daily_goals_progress(
    (SELECT id FROM users LIMIT 1),
    25, 3, 10
);

-- Test learning streak updates
SELECT update_learning_streak(
    (SELECT id FROM users LIMIT 1),
    'daily'
);
```

### Security Tests
1. **RLS Policies**: Verify users can only access their own data
2. **Age Filtering**: Ensure age-appropriate content is served
3. **Parental Access**: Test parent-child data access permissions
4. **Input Validation**: Test function parameter validation

## 🔧 Troubleshooting

### Common Setup Issues

**Migration Order Problems**
- ❌ Running migrations out of order will cause foreign key errors
- ✅ Always run migrations in the numbered sequence (001, 002, 003...)
- ✅ If you encounter errors, drop all tables and start fresh

**Environment Variable Issues**
```bash
# Verify your .env file has the correct format
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (starts with eyJ)
```

**Extension Issues**
```sql
-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**RLS Policy Issues**
- All tables have RLS enabled by default
- Test policies using different user contexts
- Use the Supabase Auth UI to create test users

### Function Debugging

**Test Functions Individually**
```sql
-- Test XP calculation
SELECT calculate_xp_for_level(5);
SELECT calculate_level_from_xp(500);

-- Test question processing
SELECT process_question_response(
    'test-user-id',
    'test-question-id',
    'correct answer',
    30
);
```

**Common Function Errors**
- `SECURITY DEFINER` is required for functions that bypass RLS
- Check function parameter types match table column types
- Verify all referenced tables and columns exist

### Performance Optimization

**Index Usage**
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE SELECT * FROM questions WHERE subject_id = 'uuid-here';
```

**Query Performance**
- Use `EXPLAIN ANALYZE` to identify slow queries
- Consider adding indexes for frequently queried columns
- Monitor database performance in Supabase dashboard

### Getting Help

1. **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
2. **PostgreSQL Functions**: [postgresql.org/docs](https://www.postgresql.org/docs/)
3. **Project Issues**: Check the GitHub repository for known issues
4. **Community Support**: Supabase Discord or Stack Overflow

## 🚀 Production Deployment

### Before Going Live
1. **Security Review**: Audit all RLS policies and functions
2. **Performance Testing**: Test with realistic data volumes
3. **Backup Strategy**: Set up automated backups
4. **Monitoring**: Configure alerts for errors and performance
5. **Environment Separation**: Use separate projects for dev/staging/prod

### Recommended Settings
- Enable Point-in-Time Recovery (PITR)
- Set up database webhooks for real-time features
- Configure connection pooling for high traffic
- Enable query performance insights