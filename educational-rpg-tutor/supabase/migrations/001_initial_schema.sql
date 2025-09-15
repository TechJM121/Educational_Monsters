-- Educational RPG Tutor Database Schema
-- This migration creates the core tables for the educational RPG system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
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
CREATE TABLE public.characters (
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
CREATE TABLE public.character_stats (
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
CREATE TABLE public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    primary_stat TEXT NOT NULL CHECK (primary_stat IN ('intelligence', 'vitality', 'wisdom', 'charisma', 'dexterity', 'creativity')),
    secondary_stat TEXT CHECK (secondary_stat IN ('intelligence', 'vitality', 'wisdom', 'charisma', 'dexterity', 'creativity')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    answer_options JSONB NOT NULL, -- Array of answer options
    correct_answer TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
    age_range TEXT NOT NULL, -- e.g., "3-6", "7-10", "11-14", "15-18"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question responses table (for tracking student answers)
CREATE TABLE public.question_responses (
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
CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    badge_icon TEXT NOT NULL, -- URL or icon identifier
    unlock_criteria JSONB NOT NULL, -- JSON describing unlock conditions
    rarity_level INTEGER NOT NULL CHECK (rarity_level >= 1 AND rarity_level <= 5),
    category TEXT NOT NULL, -- e.g., 'learning', 'streak', 'social', 'collection'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table (many-to-many relationship)
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id) -- Prevent duplicate achievements
);

-- User progress table (for tracking learning progress)
CREATE TABLE public.user_progress (
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
    UNIQUE(user_id, subject_id) -- One progress record per user per subject
);

-- Inventory items table
CREATE TABLE public.inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL, -- e.g., 'equipment', 'collectible', 'consumable'
    rarity_level INTEGER NOT NULL CHECK (rarity_level >= 1 AND rarity_level <= 5),
    icon_url TEXT,
    stat_bonuses JSONB DEFAULT '{}', -- JSON object with stat bonuses
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User inventory table (many-to-many relationship)
CREATE TABLE public.user_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id) -- One record per user per item
);

-- Create indexes for better performance
CREATE INDEX idx_characters_user_id ON public.characters(user_id);
CREATE INDEX idx_character_stats_character_id ON public.character_stats(character_id);
CREATE INDEX idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX idx_questions_age_range ON public.questions(age_range);
CREATE INDEX idx_question_responses_user_id ON public.question_responses(user_id);
CREATE INDEX idx_question_responses_question_id ON public.question_responses(question_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_inventory_user_id ON public.user_inventory(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_character_stats_updated_at BEFORE UPDATE ON public.character_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();