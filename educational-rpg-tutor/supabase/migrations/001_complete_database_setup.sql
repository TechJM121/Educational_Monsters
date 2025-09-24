-- Complete Educational RPG Tutor Database Setup
-- This script is IDEMPOTENT - safe to run multiple times
-- It will create everything needed and skip what already exists

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 3 AND age <= 18),
    parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    parental_consent_given BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 50),
    avatar_config JSONB DEFAULT '{}',
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    specialization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One character per user
);

-- Character stats table
CREATE TABLE IF NOT EXISTS public.character_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
    intelligence INTEGER DEFAULT 10 CHECK (intelligence >= 0 AND intelligence <= 100),
    vitality INTEGER DEFAULT 10 CHECK (vitality >= 0 AND vitality <= 100),
    wisdom INTEGER DEFAULT 10 CHECK (wisdom >= 0 AND wisdom <= 100),
    charisma INTEGER DEFAULT 10 CHECK (charisma >= 0 AND charisma <= 100),
    dexterity INTEGER DEFAULT 10 CHECK (dexterity >= 0 AND dexterity <= 100),
    creativity INTEGER DEFAULT 10 CHECK (creativity >= 0 AND creativity <= 100),
    available_points INTEGER DEFAULT 0 CHECK (available_points >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(character_id) -- One stats record per character
);

-- Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    primary_stat TEXT NOT NULL CHECK (primary_stat IN ('intelligence', 'vitality', 'wisdom', 'charisma', 'dexterity', 'creativity')),
    secondary_stat TEXT CHECK (secondary_stat IN ('intelligence', 'vitality', 'wisdom', 'charisma', 'dexterity', 'creativity')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    answer_options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
    age_range TEXT NOT NULL,
    hint TEXT,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question responses table
CREATE TABLE IF NOT EXISTS public.question_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    response_time_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    unlock_criteria JSONB NOT NULL,
    rarity_level INTEGER NOT NULL CHECK (rarity_level >= 1 AND rarity_level <= 5),
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- User progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    questions_answered INTEGER DEFAULT 0 CHECK (questions_answered >= 0),
    questions_correct INTEGER DEFAULT 0 CHECK (questions_correct >= 0),
    total_xp_earned INTEGER DEFAULT 0 CHECK (total_xp_earned >= 0),
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    best_streak INTEGER DEFAULT 0 CHECK (best_streak >= 0),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject_id)
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL,
    rarity_level INTEGER NOT NULL CHECK (rarity_level >= 1 AND rarity_level <= 5),
    icon_url TEXT,
    stat_bonuses JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User inventory table
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- ============================================================================
-- ENHANCED TABLES
-- ============================================================================

-- Question categories table
CREATE TABLE IF NOT EXISTS public.question_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    color_code TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, subject_id)
);

-- Learning paths table
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    difficulty_progression JSONB DEFAULT '[]',
    estimated_duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    prerequisite_skills JSONB DEFAULT '[]',
    mastery_threshold NUMERIC DEFAULT 0.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily goals table
CREATE TABLE IF NOT EXISTS public.daily_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    goal_date DATE NOT NULL,
    target_questions INTEGER DEFAULT 10,
    target_xp INTEGER DEFAULT 100,
    questions_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, goal_date)
);

-- Learning streaks table
CREATE TABLE IF NOT EXISTS public.learning_streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_type TEXT DEFAULT 'daily',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_character_stats_character_id ON public.character_stats(character_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_age_range ON public.questions(age_range);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_question_responses_user_id ON public.question_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_question_id ON public.question_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON public.daily_goals(user_id, goal_date);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- XP calculation function
CREATE OR REPLACE FUNCTION calculate_xp_for_level(target_level INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_xp INTEGER := 0;
    level_counter INTEGER := 1;
BEGIN
    IF target_level <= 1 THEN
        RETURN 0;
    END IF;
    
    WHILE level_counter < target_level LOOP
        IF level_counter <= 10 THEN
            total_xp := total_xp + 100;
        ELSIF level_counter <= 25 THEN
            total_xp := total_xp + 150;
        ELSE
            total_xp := total_xp + 200;
        END IF;
        level_counter := level_counter + 1;
    END LOOP;
    
    RETURN total_xp;
END;
$$ LANGUAGE plpgsql;

-- Level calculation function
CREATE OR REPLACE FUNCTION calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_level INTEGER := 1;
    xp_needed INTEGER := 0;
BEGIN
    WHILE xp_needed <= total_xp LOOP
        current_level := current_level + 1;
        
        IF current_level <= 10 THEN
            xp_needed := xp_needed + 100;
        ELSIF current_level <= 25 THEN
            xp_needed := xp_needed + 150;
        ELSE
            xp_needed := xp_needed + 200;
        END IF;
    END LOOP;
    
    RETURN current_level - 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_characters_updated_at ON public.characters;
DROP TRIGGER IF EXISTS update_character_stats_updated_at ON public.character_stats;
DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
DROP TRIGGER IF EXISTS update_learning_streaks_updated_at ON public.learning_streaks;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_character_stats_updated_at BEFORE UPDATE ON public.character_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_streaks_updated_at BEFORE UPDATE ON public.learning_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();