# Educational RPG Tutor - Complete Database Setup Guide

This guide will walk you through setting up the complete Supabase database for the Educational RPG Tutor, including progression tracking and adaptive question systems.

## 📋 Prerequisites

- A Supabase account (free tier is sufficient for development)
- Basic understanding of SQL
- Access to the Supabase SQL editor

## 🎯 What You'll Build

By the end of this setup, you'll have a complete educational database with:

- **User Management**: Secure authentication with parental consent
- **Character Progression**: RPG-style leveling with 6 core stats
- **Adaptive Learning**: Questions that adjust to student performance
- **Progress Tracking**: Detailed analytics and learning paths
- **Gamification**: Achievements, streaks, and collectible items

## 🚀 Step-by-Step Setup

### Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `educational-rpg-tutor`
   - **Database Password**: Use a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for initialization

### Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJ...` (long string starting with eyJ)
   - **Service role key**: `eyJ...` (different long string)

### Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Development settings
NODE_ENV=development
VITE_APP_TITLE=Educational RPG Tutor
```

### Step 4: Run Database Migrations

Open the **SQL Editor** in your Supabase dashboard and run these files **in order**:

#### 🏗️ Core Database Structure

**1. Initial Schema** (`001_initial_schema.sql`)
```sql
-- This creates all the core tables: users, characters, questions, etc.
-- Copy and paste the entire contents of this file
```

**2. Security Policies** (`002_rls_policies.sql`)
```sql
-- This sets up Row Level Security to protect user data
-- Copy and paste the entire contents of this file
```

**3. XP Functions** (`003_xp_functions.sql`)
```sql
-- This creates functions for XP calculation and character progression
-- Copy and paste the entire contents of this file
```

#### 🎮 Game Features

**4. Achievement System** (`004_achievement_functions.sql`)
```sql
-- This adds the achievement and badge system
-- Copy and paste the entire contents of this file
```

**5. World Structure** (`005_worlds_and_quests.sql`)
```sql
-- This creates the game world and quest system
-- Copy and paste the entire contents of this file
```

**6. Learning Sessions** (`006_learning_sessions.sql`)
```sql
-- This adds session tracking and analytics
-- Copy and paste the entire contents of this file
```

#### 🧠 Advanced Learning Features

**7. Enhanced Progression** (`007_enhanced_progression.sql`)
```sql
-- This adds learning paths, skills, and daily goals
-- Copy and paste the entire contents of this file
```

**8. Question Management** (`008_question_management.sql`)
```sql
-- This creates the adaptive question system
-- Copy and paste the entire contents of this file
```

#### 📊 Sample Data

**9. Basic Seed Data** (`seed.sql`)
```sql
-- This adds subjects, questions, achievements, and items
-- Copy and paste the entire contents of this file
```

**10. Enhanced Seed Data** (`enhanced_seed.sql`)
```sql
-- This adds learning paths, question pools, and advanced content
-- Copy and paste the entire contents of this file
```

### Step 5: Verify Your Setup

After running all migrations, check that you have these tables in your **Table Editor**:

#### ✅ Core Tables (Required)
- [ ] `users` - User profiles and authentication
- [ ] `characters` - Student characters with levels
- [ ] `character_stats` - RPG stats (Intelligence, Vitality, etc.)
- [ ] `subjects` - Learning subjects (Math, Science, etc.)
- [ ] `questions` - Educational questions
- [ ] `question_responses` - Student answers and XP

#### ✅ Progression Tables (Enhanced)
- [ ] `user_progress` - Learning progress per subject
- [ ] `learning_paths` - Structured curriculum
- [ ] `skills` - Specific skills within subjects
- [ ] `daily_goals` - Daily learning objectives
- [ ] `learning_streaks` - Motivation tracking

#### ✅ Gamification Tables
- [ ] `achievements` - Badges and accomplishments
- [ ] `inventory_items` - Collectible items
- [ ] `user_achievements` - Earned badges
- [ ] `user_inventory` - Owned items

#### ✅ Advanced Features
- [ ] `question_categories` - Organized question groups
- [ ] `question_pools` - Curated question collections
- [ ] `adaptive_difficulty` - Personalized difficulty
- [ ] `performance_analytics` - Detailed learning data

### Step 6: Test Your Database

Run these test queries in the SQL Editor:

```sql
-- Test 1: Check subjects were created
SELECT name, description FROM subjects;

-- Test 2: Check questions exist
SELECT COUNT(*) as question_count FROM questions;

-- Test 3: Check achievements were created
SELECT name, category FROM achievements;

-- Test 4: Test XP calculation function
SELECT calculate_xp_for_level(5) as xp_needed_for_level_5;

-- Test 5: Test adaptive question function (will return empty until you have users)
SELECT COUNT(*) as total_questions FROM questions WHERE age_range = '7-10';
```

Expected results:
- 6 subjects (Math, Science, Language Arts, History, Biology, Art)
- 15+ questions across different subjects and age groups
- 14+ achievements in various categories
- XP calculation should return a number (like 400)

## 🔧 Configuration Options

### Age Groups
The system supports these age ranges:
- `3-6`: Early childhood (basic concepts)
- `7-10`: Elementary (fundamental skills)
- `11-14`: Middle school (advanced concepts)
- `15-18`: High school (specialized knowledge)

### Difficulty Levels
Questions are rated 1-5:
- **Level 1**: Very easy, basic recognition
- **Level 2**: Easy, simple application
- **Level 3**: Medium, problem-solving required
- **Level 4**: Hard, complex reasoning
- **Level 5**: Very hard, advanced concepts

### Character Stats
Six core stats that affect learning:
- **Intelligence**: Affects XP bonuses for all subjects
- **Vitality**: Health and energy for learning sessions
- **Wisdom**: Helps with understanding complex concepts
- **Charisma**: Social learning and communication
- **Dexterity**: Hands-on activities and experiments
- **Creativity**: Art, creative writing, and innovation

## 🎮 How the System Works

### 1. User Registration & Character Creation
- Students register with age verification
- Parents provide consent for users under 13
- Each student gets one character with starting stats
- Characters begin at level 1 with 10 points in each stat

### 2. Adaptive Learning
- Questions are selected based on student performance
- Difficulty adjusts automatically based on success rate
- Students who struggle get easier questions
- High performers get more challenging content

### 3. Progression System
- Correct answers award XP based on difficulty and speed
- Characters level up and gain stat points to allocate
- Learning streaks provide motivation and bonuses
- Daily goals encourage consistent practice

### 4. Analytics & Insights
- Detailed performance tracking per subject
- Learning path progress monitoring
- Skill mastery identification
- Parent/teacher dashboard data

## 🔒 Security Features

### Row Level Security (RLS)
- Students can only see their own data
- Parents can view their children's progress
- Teachers can access their students' data
- Age-appropriate content filtering

### Data Protection
- All sensitive data is encrypted
- Parental consent tracking for COPPA compliance
- Secure authentication with Supabase Auth
- Input validation on all functions

## 📈 Scaling Considerations

### Performance Optimization
- Indexes on frequently queried columns
- Efficient query patterns for large datasets
- Connection pooling for high traffic
- Caching strategies for static content

### Data Growth Management
- Automatic cleanup of old session data
- Archiving of inactive user accounts
- Performance monitoring and alerts
- Regular database maintenance

## 🆘 Troubleshooting

### Common Issues

**"Function does not exist" errors**
- Make sure you ran all migration files in order
- Check that the function was created successfully
- Verify there are no syntax errors in the SQL

**"Permission denied" errors**
- Ensure RLS policies are set up correctly
- Check that you're using the correct user context
- Verify the user has the necessary permissions

**"Foreign key constraint" errors**
- Run migrations in the correct order
- Make sure referenced tables exist before creating relationships
- Check that UUIDs are valid format

**No questions returned**
- Verify seed data was inserted successfully
- Check age_range and subject_id parameters
- Ensure questions are marked as active

### Getting Help

1. Check the Supabase logs in your dashboard
2. Use `EXPLAIN ANALYZE` to debug slow queries
3. Test functions individually before using in app
4. Refer to the PostgreSQL documentation for function syntax

## 🎉 Next Steps

Once your database is set up:

1. **Test the API**: Use the Supabase client to connect from your app
2. **Create Test Users**: Register some test accounts with different ages
3. **Try the Functions**: Test question selection and XP calculation
4. **Monitor Performance**: Watch the database metrics as you develop
5. **Plan Your UI**: Design how you'll display the progression data

Your Educational RPG Tutor database is now ready to power an engaging, adaptive learning experience! 🚀

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Functions Guide](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Row Level Security Tutorial](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/database-design)