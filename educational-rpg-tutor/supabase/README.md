# Supabase Database Setup

This directory contains the database schema, migrations, and seed data for the Educational RPG Tutor application.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Copy your project URL and anon key from the project settings

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env` in the project root
2. Update the environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Run Database Migrations

Execute the SQL files in order in your Supabase SQL editor:

1. **001_initial_schema.sql** - Creates all database tables and indexes
2. **002_rls_policies.sql** - Sets up Row Level Security policies
3. **003_xp_functions.sql** - Creates XP calculation and progression functions
4. **seed.sql** - Populates the database with initial data

### 4. Verify Setup

After running all migrations, you should have the following tables:
- `users` - User profiles and parental consent tracking
- `characters` - Student characters with levels and XP
- `character_stats` - RPG-style character statistics
- `subjects` - Learning subjects (Math, Science, etc.)
- `questions` - Educational questions by subject and age group
- `question_responses` - Student answers and XP earned
- `achievements` - Badges and accomplishments
- `user_achievements` - Earned achievements per user
- `user_progress` - Learning progress tracking
- `inventory_items` - Collectible items and equipment
- `user_inventory` - Items owned by each user

## Database Functions

The following PostgreSQL functions are available for XP calculations:

- `calculate_xp_for_level(target_level)` - Returns XP needed for a specific level
- `calculate_level_from_xp(total_xp)` - Returns current level based on total XP
- `calculate_xp_reward(difficulty, is_correct, time, stats)` - Calculates XP for question answers
- `award_xp_and_level_up(character_id, xp)` - Awards XP and handles level progression
- `allocate_stat_points(character_id, stats...)` - Distributes stat points
- `process_question_response(user_id, question_id, answer, time)` - Complete question processing

## Row Level Security

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Parents can view their children's data
- Age-appropriate content filtering
- Secure stat and XP calculations

## Seed Data

The seed file includes:
- 6 core subjects with stat mappings
- 14 achievements across different categories
- 10 inventory items with various rarities
- Sample questions for different age groups and subjects

## Testing the Setup

You can test the database setup by:
1. Creating a test user account
2. Verifying RLS policies work correctly
3. Testing XP calculation functions
4. Ensuring age-appropriate content filtering works

## Troubleshooting

**Common Issues:**
- Make sure to run migrations in order
- Verify environment variables are correct
- Check that RLS is enabled on all tables
- Ensure the `uuid-ossp` extension is enabled

**Function Errors:**
- Functions must be created with `SECURITY DEFINER` for RLS to work properly
- Test functions individually in the SQL editor before using in the app