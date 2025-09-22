-- Enhanced Question Management System
-- This migration adds advanced question features and management

-- Question categories for better organization
CREATE TABLE public.question_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    color_code TEXT DEFAULT '#3B82F6', -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question tags for flexible categorization
CREATE TABLE public.question_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-many relationship between questions and tags
CREATE TABLE public.question_tag_relations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.question_tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, tag_id)
);

-- Question hints system
CREATE TABLE public.question_hints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    hint_text TEXT NOT NULL,
    hint_order INTEGER NOT NULL DEFAULT 1,
    xp_penalty INTEGER DEFAULT 0, -- XP reduction for using hint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question explanations for learning
CREATE TABLE public.question_explanations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    explanation_text TEXT NOT NULL,
    explanation_type TEXT DEFAULT 'general' CHECK (explanation_type IN ('general', 'correct', 'incorrect')),
    media_url TEXT, -- Optional image/video URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question difficulty adaptation
CREATE TABLE public.adaptive_difficulty (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    current_difficulty NUMERIC DEFAULT 1.0 CHECK (current_difficulty >= 0.5 AND current_difficulty <= 5.0),
    success_rate NUMERIC DEFAULT 0.0 CHECK (success_rate >= 0.0 AND success_rate <= 1.0),
    recent_performance JSONB DEFAULT '[]', -- Array of recent performance scores
    last_adjustment TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject_id)
);

-- Question pools for randomized selection
CREATE TABLE public.question_pools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    age_range TEXT NOT NULL,
    difficulty_range TEXT NOT NULL, -- e.g., "1-3", "3-5"
    pool_size INTEGER DEFAULT 10,
    selection_strategy TEXT DEFAULT 'random' CHECK (selection_strategy IN ('random', 'adaptive', 'sequential')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions in pools (many-to-many)
CREATE TABLE public.question_pool_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pool_id UUID REFERENCES public.question_pools(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    weight NUMERIC DEFAULT 1.0, -- For weighted random selection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pool_id, question_id)
);

-- User question history for avoiding repeats
CREATE TABLE public.user_question_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    times_seen INTEGER DEFAULT 1,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performance_score NUMERIC DEFAULT 0.0, -- 0-1 based on accuracy and speed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Add category reference to existing questions table
ALTER TABLE public.questions 
ADD COLUMN category_id UUID REFERENCES public.question_categories(id) ON DELETE SET NULL,
ADD COLUMN media_url TEXT,
ADD COLUMN time_limit_seconds INTEGER,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_question_categories_subject_id ON public.question_categories(subject_id);
CREATE INDEX idx_question_tag_relations_question_id ON public.question_tag_relations(question_id);
CREATE INDEX idx_question_tag_relations_tag_id ON public.question_tag_relations(tag_id);
CREATE INDEX idx_question_hints_question_id ON public.question_hints(question_id);
CREATE INDEX idx_question_explanations_question_id ON public.question_explanations(question_id);
CREATE INDEX idx_adaptive_difficulty_user_subject ON public.adaptive_difficulty(user_id, subject_id);
CREATE INDEX idx_question_pools_subject_age ON public.question_pools(subject_id, age_range);
CREATE INDEX idx_question_pool_items_pool_id ON public.question_pool_items(pool_id);
CREATE INDEX idx_user_question_history_user_id ON public.user_question_history(user_id);
CREATE INDEX idx_questions_category_id ON public.questions(category_id);
CREATE INDEX idx_questions_active ON public.questions(is_active);

-- Add updated_at triggers
CREATE TRIGGER update_adaptive_difficulty_updated_at BEFORE UPDATE ON public.adaptive_difficulty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_pools_updated_at BEFORE UPDATE ON public.question_pools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_question_history_updated_at BEFORE UPDATE ON public.user_question_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get adaptive question for user
CREATE OR REPLACE FUNCTION get_adaptive_question(
    user_uuid UUID,
    subject_uuid UUID,
    age_range_param TEXT
)
RETURNS TABLE(
    question_id UUID,
    question_text TEXT,
    answer_options JSONB,
    difficulty_level INTEGER,
    xp_reward INTEGER,
    time_limit_seconds INTEGER,
    category_name TEXT
) AS $
DECLARE
    user_difficulty NUMERIC;
    target_difficulty INTEGER;
BEGIN
    -- Get user's adaptive difficulty for this subject
    SELECT current_difficulty INTO user_difficulty
    FROM public.adaptive_difficulty
    WHERE user_id = user_uuid AND subject_id = subject_uuid;
    
    -- If no adaptive difficulty exists, start with level 1
    IF user_difficulty IS NULL THEN
        user_difficulty := 1.0;
        
        INSERT INTO public.adaptive_difficulty (user_id, subject_id, current_difficulty)
        VALUES (user_uuid, subject_uuid, 1.0)
        ON CONFLICT (user_id, subject_id) DO NOTHING;
    END IF;
    
    -- Convert to integer difficulty level
    target_difficulty := ROUND(user_difficulty)::INTEGER;
    
    -- Return questions that match criteria and haven't been seen recently
    RETURN QUERY
    SELECT 
        q.id,
        q.question_text,
        q.answer_options,
        q.difficulty_level,
        q.xp_reward,
        q.time_limit_seconds,
        COALESCE(qc.name, 'General') as category_name
    FROM public.questions q
    LEFT JOIN public.question_categories qc ON q.category_id = qc.id
    LEFT JOIN public.user_question_history uqh ON q.id = uqh.question_id AND uqh.user_id = user_uuid
    WHERE q.subject_id = subject_uuid
    AND q.age_range = age_range_param
    AND q.difficulty_level BETWEEN (target_difficulty - 1) AND (target_difficulty + 1)
    AND q.is_active = TRUE
    AND (uqh.last_seen IS NULL OR uqh.last_seen < NOW() - INTERVAL '1 day')
    ORDER BY 
        CASE WHEN uqh.last_seen IS NULL THEN 0 ELSE 1 END, -- Prioritize unseen questions
        RANDOM()
    LIMIT 1;
END;
$ LANGUAGE plpgsql;

-- Function to update adaptive difficulty based on performance
CREATE OR REPLACE FUNCTION update_adaptive_difficulty(
    user_uuid UUID,
    subject_uuid UUID,
    is_correct BOOLEAN,
    response_time_seconds INTEGER,
    question_difficulty INTEGER
)
RETURNS JSONB AS $
DECLARE
    current_record RECORD;
    performance_score NUMERIC;
    new_difficulty NUMERIC;
    recent_scores JSONB;
    adjustment_factor NUMERIC := 0.1;
BEGIN
    -- Calculate performance score (0-1)
    performance_score := 0.0;
    
    IF is_correct THEN
        performance_score := 0.7; -- Base score for correct answer
        
        -- Bonus for quick response (assuming 30 seconds is target)
        IF response_time_seconds IS NOT NULL AND response_time_seconds <= 30 THEN
            performance_score := performance_score + (0.3 * (1.0 - response_time_seconds::NUMERIC / 30.0));
        END IF;
    END IF;
    
    -- Get current adaptive difficulty record
    SELECT * INTO current_record
    FROM public.adaptive_difficulty
    WHERE user_id = user_uuid AND subject_id = subject_uuid;
    
    IF NOT FOUND THEN
        -- Create new record
        INSERT INTO public.adaptive_difficulty (
            user_id, subject_id, current_difficulty, success_rate, recent_performance
        ) VALUES (
            user_uuid, subject_uuid, question_difficulty::NUMERIC, 
            performance_score, jsonb_build_array(performance_score)
        );
        
        RETURN jsonb_build_object(
            'new_difficulty', question_difficulty::NUMERIC,
            'performance_score', performance_score,
            'adjustment', 'initialized'
        );
    END IF;
    
    -- Update recent performance (keep last 10 scores)
    recent_scores := current_record.recent_performance;
    recent_scores := recent_scores || jsonb_build_array(performance_score);
    
    -- Keep only last 10 scores
    IF jsonb_array_length(recent_scores) > 10 THEN
        recent_scores := jsonb_extract_path(recent_scores, '[1:]');
    END IF;
    
    -- Calculate new success rate (average of recent scores)
    SELECT AVG((value::TEXT)::NUMERIC) INTO new_difficulty
    FROM jsonb_array_elements(recent_scores);
    
    -- Adjust difficulty based on performance
    IF new_difficulty > 0.8 THEN
        -- Performing well, increase difficulty
        new_difficulty := LEAST(current_record.current_difficulty + adjustment_factor, 5.0);
    ELSIF new_difficulty < 0.4 THEN
        -- Struggling, decrease difficulty
        new_difficulty := GREATEST(current_record.current_difficulty - adjustment_factor, 0.5);
    ELSE
        -- Maintain current difficulty
        new_difficulty := current_record.current_difficulty;
    END IF;
    
    -- Update record
    UPDATE public.adaptive_difficulty
    SET 
        current_difficulty = new_difficulty,
        success_rate = (SELECT AVG((value::TEXT)::NUMERIC) FROM jsonb_array_elements(recent_scores)),
        recent_performance = recent_scores,
        last_adjustment = NOW(),
        updated_at = NOW()
    WHERE user_id = user_uuid AND subject_id = subject_uuid;
    
    RETURN jsonb_build_object(
        'old_difficulty', current_record.current_difficulty,
        'new_difficulty', new_difficulty,
        'performance_score', performance_score,
        'success_rate', (SELECT AVG((value::TEXT)::NUMERIC) FROM jsonb_array_elements(recent_scores))
    );
END;
$ LANGUAGE plpgsql;

-- Function to record question interaction
CREATE OR REPLACE FUNCTION record_question_interaction(
    user_uuid UUID,
    question_uuid UUID,
    performance_score NUMERIC
)
RETURNS BOOLEAN AS $
BEGIN
    INSERT INTO public.user_question_history (
        user_id, question_id, times_seen, performance_score
    ) VALUES (
        user_uuid, question_uuid, 1, performance_score
    )
    ON CONFLICT (user_id, question_id)
    DO UPDATE SET
        times_seen = user_question_history.times_seen + 1,
        last_seen = NOW(),
        performance_score = (user_question_history.performance_score + performance_score) / 2,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql;