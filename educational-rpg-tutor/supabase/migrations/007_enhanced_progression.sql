-- Enhanced Progression System
-- This migration adds advanced progression tracking features

-- Learning paths table for structured curriculum
CREATE TABLE public.learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    age_range TEXT NOT NULL,
    difficulty_progression JSONB NOT NULL, -- Array of difficulty levels in order
    estimated_duration_minutes INTEGER,
    prerequisites JSONB DEFAULT '[]', -- Array of prerequisite learning path IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning path progress tracking
CREATE TABLE public.user_learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
    current_step INTEGER DEFAULT 0,
    completed_steps INTEGER DEFAULT 0,
    total_steps INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, learning_path_id)
);

-- Skill mastery tracking
CREATE TABLE public.skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    mastery_threshold INTEGER DEFAULT 80, -- Percentage needed for mastery
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skill progress
CREATE TABLE public.user_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
    proficiency_level INTEGER DEFAULT 0 CHECK (proficiency_level >= 0 AND proficiency_level <= 100),
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    is_mastered BOOLEAN DEFAULT FALSE,
    mastered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Daily learning goals
CREATE TABLE public.daily_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    goal_date DATE NOT NULL,
    target_xp INTEGER DEFAULT 100,
    target_questions INTEGER DEFAULT 10,
    target_time_minutes INTEGER DEFAULT 30,
    achieved_xp INTEGER DEFAULT 0,
    achieved_questions INTEGER DEFAULT 0,
    achieved_time_minutes INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, goal_date)
);

-- Learning streaks tracking
CREATE TABLE public.learning_streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    streak_type TEXT NOT NULL CHECK (streak_type IN ('daily', 'weekly', 'subject_specific')),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type, subject_id)
);

-- Performance analytics
CREATE TABLE public.performance_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    average_response_time NUMERIC DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    difficulty_distribution JSONB DEFAULT '{}', -- Count of questions by difficulty
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, subject_id)
);

-- Create indexes for performance
CREATE INDEX idx_learning_paths_subject_id ON public.learning_paths(subject_id);
CREATE INDEX idx_user_learning_paths_user_id ON public.user_learning_paths(user_id);
CREATE INDEX idx_user_learning_paths_path_id ON public.user_learning_paths(learning_path_id);
CREATE INDEX idx_skills_subject_id ON public.skills(subject_id);
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_daily_goals_user_date ON public.daily_goals(user_id, goal_date);
CREATE INDEX idx_learning_streaks_user_id ON public.learning_streaks(user_id);
CREATE INDEX idx_performance_analytics_user_date ON public.performance_analytics(user_id, date);

-- Add updated_at triggers
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_learning_paths_updated_at BEFORE UPDATE ON public.user_learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON public.user_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON public.daily_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_streaks_updated_at BEFORE UPDATE ON public.learning_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update daily goals progress
CREATE OR REPLACE FUNCTION update_daily_goals_progress(
    user_uuid UUID,
    xp_earned INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $
DECLARE
    today_date DATE := CURRENT_DATE;
    goal_record RECORD;
BEGIN
    -- Get or create today's goal
    INSERT INTO public.daily_goals (user_id, goal_date, target_xp, target_questions, target_time_minutes)
    VALUES (user_uuid, today_date, 100, 10, 30)
    ON CONFLICT (user_id, goal_date) DO NOTHING;
    
    -- Update progress
    UPDATE public.daily_goals 
    SET 
        achieved_xp = achieved_xp + xp_earned,
        achieved_questions = achieved_questions + questions_answered,
        achieved_time_minutes = achieved_time_minutes + time_spent,
        updated_at = NOW()
    WHERE user_id = user_uuid AND goal_date = today_date;
    
    -- Check if goal is completed
    SELECT * INTO goal_record 
    FROM public.daily_goals 
    WHERE user_id = user_uuid AND goal_date = today_date;
    
    IF goal_record.achieved_xp >= goal_record.target_xp AND 
       goal_record.achieved_questions >= goal_record.target_questions AND
       goal_record.achieved_time_minutes >= goal_record.target_time_minutes AND
       NOT goal_record.is_completed THEN
        
        UPDATE public.daily_goals 
        SET 
            is_completed = TRUE,
            completed_at = NOW(),
            updated_at = NOW()
        WHERE user_id = user_uuid AND goal_date = today_date;
    END IF;
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql;

-- Function to update learning streaks
CREATE OR REPLACE FUNCTION update_learning_streak(
    user_uuid UUID,
    streak_type_param TEXT DEFAULT 'daily',
    subject_uuid UUID DEFAULT NULL
)
RETURNS JSONB AS $
DECLARE
    today_date DATE := CURRENT_DATE;
    yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
    streak_record RECORD;
    streak_broken BOOLEAN := FALSE;
    streak_continued BOOLEAN := FALSE;
BEGIN
    -- Get existing streak record
    SELECT * INTO streak_record
    FROM public.learning_streaks
    WHERE user_id = user_uuid 
    AND streak_type = streak_type_param 
    AND (subject_id = subject_uuid OR (subject_id IS NULL AND subject_uuid IS NULL));
    
    IF NOT FOUND THEN
        -- Create new streak
        INSERT INTO public.learning_streaks (
            user_id, streak_type, subject_id, current_streak, longest_streak, 
            last_activity_date, streak_start_date
        ) VALUES (
            user_uuid, streak_type_param, subject_uuid, 1, 1, today_date, today_date
        );
        
        RETURN jsonb_build_object(
            'current_streak', 1,
            'longest_streak', 1,
            'streak_status', 'started'
        );
    END IF;
    
    -- Check streak continuation
    IF streak_record.last_activity_date = today_date THEN
        -- Already counted today
        RETURN jsonb_build_object(
            'current_streak', streak_record.current_streak,
            'longest_streak', streak_record.longest_streak,
            'streak_status', 'already_counted'
        );
    ELSIF streak_record.last_activity_date = yesterday_date THEN
        -- Continue streak
        streak_continued := TRUE;
    ELSIF streak_record.last_activity_date < yesterday_date THEN
        -- Streak broken
        streak_broken := TRUE;
    END IF;
    
    -- Update streak
    IF streak_continued THEN
        UPDATE public.learning_streaks
        SET 
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = today_date,
            updated_at = NOW()
        WHERE user_id = user_uuid 
        AND streak_type = streak_type_param 
        AND (subject_id = subject_uuid OR (subject_id IS NULL AND subject_uuid IS NULL));
        
        RETURN jsonb_build_object(
            'current_streak', streak_record.current_streak + 1,
            'longest_streak', GREATEST(streak_record.longest_streak, streak_record.current_streak + 1),
            'streak_status', 'continued'
        );
    ELSE
        -- Reset streak
        UPDATE public.learning_streaks
        SET 
            current_streak = 1,
            last_activity_date = today_date,
            streak_start_date = today_date,
            updated_at = NOW()
        WHERE user_id = user_uuid 
        AND streak_type = streak_type_param 
        AND (subject_id = subject_uuid OR (subject_id IS NULL AND subject_uuid IS NULL));
        
        RETURN jsonb_build_object(
            'current_streak', 1,
            'longest_streak', streak_record.longest_streak,
            'streak_status', 'reset'
        );
    END IF;
END;
$ LANGUAGE plpgsql;

-- Function to update performance analytics
CREATE OR REPLACE FUNCTION update_performance_analytics(
    user_uuid UUID,
    subject_uuid UUID,
    questions_attempted_count INTEGER,
    questions_correct_count INTEGER,
    response_time_seconds INTEGER,
    xp_earned_amount INTEGER,
    difficulty_level INTEGER
)
RETURNS BOOLEAN AS $
DECLARE
    today_date DATE := CURRENT_DATE;
    current_analytics RECORD;
    new_difficulty_dist JSONB;
BEGIN
    -- Get existing analytics for today
    SELECT * INTO current_analytics
    FROM public.performance_analytics
    WHERE user_id = user_uuid 
    AND date = today_date 
    AND subject_id = subject_uuid;
    
    IF NOT FOUND THEN
        -- Create new analytics record
        new_difficulty_dist := jsonb_build_object(difficulty_level::TEXT, 1);
        
        INSERT INTO public.performance_analytics (
            user_id, date, subject_id, questions_attempted, questions_correct,
            average_response_time, xp_earned, difficulty_distribution
        ) VALUES (
            user_uuid, today_date, subject_uuid, questions_attempted_count,
            questions_correct_count, response_time_seconds, xp_earned_amount,
            new_difficulty_dist
        );
    ELSE
        -- Update existing analytics
        new_difficulty_dist := current_analytics.difficulty_distribution;
        
        -- Update difficulty distribution
        IF new_difficulty_dist ? difficulty_level::TEXT THEN
            new_difficulty_dist := jsonb_set(
                new_difficulty_dist,
                ARRAY[difficulty_level::TEXT],
                ((new_difficulty_dist->>difficulty_level::TEXT)::INTEGER + 1)::TEXT::JSONB
            );
        ELSE
            new_difficulty_dist := new_difficulty_dist || jsonb_build_object(difficulty_level::TEXT, 1);
        END IF;
        
        -- Calculate new average response time
        UPDATE public.performance_analytics
        SET 
            questions_attempted = questions_attempted + questions_attempted_count,
            questions_correct = questions_correct + questions_correct_count,
            average_response_time = (
                (average_response_time * questions_attempted + response_time_seconds * questions_attempted_count) / 
                (questions_attempted + questions_attempted_count)
            ),
            xp_earned = xp_earned + xp_earned_amount,
            difficulty_distribution = new_difficulty_dist
        WHERE user_id = user_uuid 
        AND date = today_date 
        AND subject_id = subject_uuid;
    END IF;
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql;