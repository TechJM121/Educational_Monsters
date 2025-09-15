-- Migration for Learning Worlds and Quest System
-- This migration adds tables for themed learning worlds and quest system

-- World progress table (tracks user progress in each learning world)
CREATE TABLE public.world_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    world_id TEXT NOT NULL, -- References world IDs from application code
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quests_completed INTEGER DEFAULT 0 CHECK (quests_completed >= 0),
    total_quests INTEGER DEFAULT 0 CHECK (total_quests >= 0),
    time_spent INTEGER DEFAULT 0 CHECK (time_spent >= 0), -- in minutes
    last_visited TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    favorite_rating INTEGER CHECK (favorite_rating >= 1 AND favorite_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, world_id) -- One progress record per user per world
);

-- Quests table (stores quest definitions)
CREATE TABLE public.quests (
    id TEXT PRIMARY KEY, -- Generated quest IDs from application
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
    category TEXT NOT NULL CHECK (category IN ('learning', 'social', 'achievement')),
    world_id TEXT, -- Optional world association
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    estimated_time_minutes INTEGER NOT NULL CHECK (estimated_time_minutes > 0),
    rewards JSONB NOT NULL DEFAULT '[]', -- Array of reward objects
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quests table (tracks individual user quest progress)
CREATE TABLE public.user_quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    quest_id TEXT REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
    progress JSONB DEFAULT '[]', -- Array of quest objectives with current progress
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quest_id) -- Prevent duplicate quest assignments
);

-- Learning streaks table (tracks daily learning streaks)
CREATE TABLE public.learning_streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_rewards JSONB DEFAULT '[]', -- Array of streak milestone rewards
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One streak record per user
);

-- Quest completion log (for analytics and history)
CREATE TABLE public.quest_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    quest_id TEXT NOT NULL,
    quest_type TEXT NOT NULL,
    quest_category TEXT NOT NULL,
    world_id TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    completion_time_minutes INTEGER,
    xp_earned INTEGER DEFAULT 0,
    bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_world_progress_user_id ON public.world_progress(user_id);
CREATE INDEX idx_world_progress_world_id ON public.world_progress(world_id);
CREATE INDEX idx_quests_type ON public.quests(type);
CREATE INDEX idx_quests_world_id ON public.quests(world_id);
CREATE INDEX idx_quests_expires_at ON public.quests(expires_at);
CREATE INDEX idx_user_quests_user_id ON public.user_quests(user_id);
CREATE INDEX idx_user_quests_quest_id ON public.user_quests(quest_id);
CREATE INDEX idx_user_quests_completed ON public.user_quests(completed);
CREATE INDEX idx_learning_streaks_user_id ON public.learning_streaks(user_id);
CREATE INDEX idx_quest_completions_user_id ON public.quest_completions(user_id);
CREATE INDEX idx_quest_completions_completed_at ON public.quest_completions(completed_at);

-- Add updated_at triggers
CREATE TRIGGER update_world_progress_updated_at 
    BEFORE UPDATE ON public.world_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at 
    BEFORE UPDATE ON public.quests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_streaks_updated_at 
    BEFORE UPDATE ON public.learning_streaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired quests
CREATE OR REPLACE FUNCTION cleanup_expired_quests()
RETURNS void AS $$
BEGIN
    -- Delete expired quests and their user assignments
    DELETE FROM public.user_quests 
    WHERE quest_id IN (
        SELECT id FROM public.quests 
        WHERE expires_at < NOW()
    );
    
    DELETE FROM public.quests 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update quest progress
CREATE OR REPLACE FUNCTION update_quest_progress(
    p_user_id UUID,
    p_activity_type TEXT,
    p_subject_id UUID DEFAULT NULL,
    p_xp_earned INTEGER DEFAULT 0,
    p_accuracy DECIMAL DEFAULT NULL,
    p_questions_answered INTEGER DEFAULT 0,
    p_correct_answers INTEGER DEFAULT 0
)
RETURNS void AS $$
DECLARE
    quest_record RECORD;
    objective_record JSONB;
    updated_objectives JSONB;
    objective_updated BOOLEAN;
    quest_completed BOOLEAN;
BEGIN
    -- Get active quests for the user
    FOR quest_record IN 
        SELECT uq.*, q.world_id, q.subject_id as quest_subject_id
        FROM public.user_quests uq
        JOIN public.quests q ON uq.quest_id = q.id
        WHERE uq.user_id = p_user_id 
        AND uq.completed = FALSE
        AND q.expires_at > NOW()
    LOOP
        updated_objectives := '[]'::jsonb;
        quest_completed := TRUE;
        
        -- Process each objective
        FOR objective_record IN 
            SELECT * FROM jsonb_array_elements(quest_record.progress)
        LOOP
            objective_updated := FALSE;
            
            -- Check if this objective should be updated based on activity type
            IF (objective_record->>'completed')::boolean = FALSE THEN
                -- Check subject filter if applicable
                IF (objective_record->>'subjectFilter') IS NULL 
                   OR (p_subject_id IS NOT NULL AND (
                       SELECT name FROM public.subjects WHERE id = p_subject_id
                   ) = (objective_record->>'subjectFilter')) THEN
                    
                    -- Update based on objective type
                    CASE objective_record->>'type'
                        WHEN 'answer_questions' THEN
                            IF p_activity_type = 'answer_question' AND p_correct_answers > 0 THEN
                                objective_record := jsonb_set(
                                    objective_record,
                                    '{currentValue}',
                                    to_jsonb(LEAST(
                                        (objective_record->>'currentValue')::integer + p_correct_answers,
                                        (objective_record->>'targetValue')::integer
                                    ))
                                );
                                objective_updated := TRUE;
                            END IF;
                        WHEN 'complete_lessons' THEN
                            IF p_activity_type = 'complete_lesson' THEN
                                objective_record := jsonb_set(
                                    objective_record,
                                    '{currentValue}',
                                    to_jsonb(LEAST(
                                        (objective_record->>'currentValue')::integer + 1,
                                        (objective_record->>'targetValue')::integer
                                    ))
                                );
                                objective_updated := TRUE;
                            END IF;
                        WHEN 'earn_xp' THEN
                            IF p_activity_type = 'earn_xp' AND p_xp_earned > 0 THEN
                                objective_record := jsonb_set(
                                    objective_record,
                                    '{currentValue}',
                                    to_jsonb(LEAST(
                                        (objective_record->>'currentValue')::integer + p_xp_earned,
                                        (objective_record->>'targetValue')::integer
                                    ))
                                );
                                objective_updated := TRUE;
                            END IF;
                        WHEN 'achieve_accuracy' THEN
                            IF p_activity_type = 'answer_question' AND p_accuracy IS NOT NULL THEN
                                objective_record := jsonb_set(
                                    objective_record,
                                    '{currentValue}',
                                    to_jsonb(p_accuracy)
                                );
                                objective_updated := TRUE;
                            END IF;
                    END CASE;
                    
                    -- Mark objective as completed if target reached
                    IF (objective_record->>'currentValue')::integer >= (objective_record->>'targetValue')::integer THEN
                        objective_record := jsonb_set(objective_record, '{completed}', 'true'::jsonb);
                    END IF;
                END IF;
                
                -- Check if quest is still incomplete
                IF (objective_record->>'completed')::boolean = FALSE THEN
                    quest_completed := FALSE;
                END IF;
            END IF;
            
            updated_objectives := updated_objectives || objective_record;
        END LOOP;
        
        -- Update quest progress
        UPDATE public.user_quests 
        SET progress = updated_objectives,
            completed = quest_completed,
            completed_at = CASE WHEN quest_completed THEN NOW() ELSE NULL END
        WHERE id = quest_record.id;
        
        -- Log quest completion
        IF quest_completed THEN
            INSERT INTO public.quest_completions (
                user_id, quest_id, quest_type, quest_category, 
                world_id, subject_id, xp_earned, completed_at
            )
            SELECT 
                quest_record.user_id,
                quest_record.quest_id,
                q.type,
                q.category,
                q.world_id,
                q.subject_id,
                p_xp_earned,
                NOW()
            FROM public.quests q
            WHERE q.id = quest_record.quest_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate daily quests (called by application)
CREATE OR REPLACE FUNCTION generate_daily_quests_for_user(p_user_id UUID)
RETURNS TABLE(world_id TEXT, quest_count INTEGER) AS $$
BEGIN
    -- This function would be called by the application to trigger quest generation
    -- The actual quest generation logic is handled in the application layer
    -- This function can be used for cleanup and preparation
    
    -- Clean up expired quests first
    PERFORM cleanup_expired_quests();
    
    -- Return unlocked worlds for the user
    RETURN QUERY
    SELECT wp.world_id, 0 as quest_count
    FROM public.world_progress wp
    WHERE wp.user_id = p_user_id
    ORDER BY wp.unlocked_at;
END;
$$ LANGUAGE plpgsql;

-- Insert default subjects if they don't exist
INSERT INTO public.subjects (name, primary_stat, secondary_stat, description) VALUES
    ('Mathematics', 'intelligence', 'wisdom', 'Mathematical concepts and problem-solving'),
    ('Science', 'dexterity', 'intelligence', 'Scientific experiments and discoveries'),
    ('History', 'wisdom', 'charisma', 'Historical events and civilizations'),
    ('Language Arts', 'charisma', 'creativity', 'Reading, writing, and communication'),
    ('Art', 'creativity', 'charisma', 'Artistic expression and creativity'),
    ('Biology', 'vitality', 'intelligence', 'Life sciences and living organisms')
ON CONFLICT (name) DO NOTHING;

-- Create default world unlock for new users (Numerical Kingdom)
CREATE OR REPLACE FUNCTION unlock_default_world_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Unlock the Numerical Kingdom (mathematics world) for new characters
    INSERT INTO public.world_progress (user_id, world_id, unlocked_at, total_quests)
    VALUES (NEW.user_id, 'numerical-kingdom', NOW(), 10);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to unlock default world when character is created
CREATE TRIGGER unlock_default_world_trigger
    AFTER INSERT ON public.characters
    FOR EACH ROW
    EXECUTE FUNCTION unlock_default_world_for_new_user();