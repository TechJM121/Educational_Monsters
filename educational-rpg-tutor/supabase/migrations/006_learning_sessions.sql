-- Migration for Learning Sessions Analytics
-- This migration adds tables for tracking detailed learning session analytics

-- Learning sessions table (for detailed session tracking)
CREATE TABLE public.learning_sessions (
    id TEXT PRIMARY KEY, -- Session ID from application
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    world_id TEXT, -- References world IDs from application code
    questions_answered INTEGER DEFAULT 0 CHECK (questions_answered >= 0),
    correct_answers INTEGER DEFAULT 0 CHECK (correct_answers >= 0),
    total_xp_earned INTEGER DEFAULT 0 CHECK (total_xp_earned >= 0),
    accuracy DECIMAL(5,2) DEFAULT 0 CHECK (accuracy >= 0 AND accuracy <= 100),
    average_response_time DECIMAL(8,2) DEFAULT 0 CHECK (average_response_time >= 0),
    difficulty_progression JSONB DEFAULT '[]', -- Array of difficulty levels per question
    session_config JSONB DEFAULT '{}', -- Session configuration settings
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session performance metrics table (for detailed analytics)
CREATE TABLE public.session_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT REFERENCES public.learning_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL, -- e.g., 'response_time', 'difficulty_adjustment', 'streak_bonus'
    metric_value DECIMAL(10,2) NOT NULL,
    question_index INTEGER, -- Which question this metric relates to
    timestamp_offset INTEGER, -- Seconds from session start
    metadata JSONB DEFAULT '{}', -- Additional metric data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adaptive difficulty tracking table
CREATE TABLE public.difficulty_adjustments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT REFERENCES public.learning_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    question_index INTEGER NOT NULL,
    old_difficulty INTEGER NOT NULL CHECK (old_difficulty >= 1 AND old_difficulty <= 5),
    new_difficulty INTEGER NOT NULL CHECK (new_difficulty >= 1 AND new_difficulty <= 5),
    adjustment_reason TEXT NOT NULL, -- e.g., 'consecutive_correct', 'consecutive_incorrect', 'performance_trend'
    performance_history JSONB DEFAULT '[]', -- Recent performance data that triggered adjustment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session completion bonuses table
CREATE TABLE public.session_bonuses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT REFERENCES public.learning_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bonus_type TEXT NOT NULL, -- e.g., 'accuracy', 'speed', 'completion', 'streak'
    bonus_amount INTEGER NOT NULL CHECK (bonus_amount >= 0),
    bonus_criteria JSONB NOT NULL, -- Criteria that earned the bonus
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_subject_id ON public.learning_sessions(subject_id);
CREATE INDEX idx_learning_sessions_world_id ON public.learning_sessions(world_id);
CREATE INDEX idx_learning_sessions_started_at ON public.learning_sessions(started_at);
CREATE INDEX idx_learning_sessions_completed_at ON public.learning_sessions(completed_at);

CREATE INDEX idx_session_metrics_session_id ON public.session_metrics(session_id);
CREATE INDEX idx_session_metrics_user_id ON public.session_metrics(user_id);
CREATE INDEX idx_session_metrics_metric_type ON public.session_metrics(metric_type);

CREATE INDEX idx_difficulty_adjustments_session_id ON public.difficulty_adjustments(session_id);
CREATE INDEX idx_difficulty_adjustments_user_id ON public.difficulty_adjustments(user_id);

CREATE INDEX idx_session_bonuses_session_id ON public.session_bonuses(session_id);
CREATE INDEX idx_session_bonuses_user_id ON public.session_bonuses(user_id);
CREATE INDEX idx_session_bonuses_bonus_type ON public.session_bonuses(bonus_type);

-- Function to calculate session completion rate
CREATE OR REPLACE FUNCTION get_user_session_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    total_sessions INTEGER,
    completed_sessions INTEGER,
    completion_rate DECIMAL,
    average_accuracy DECIMAL,
    total_xp_earned INTEGER,
    favorite_subject TEXT,
    average_session_duration INTERVAL
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_sessions,
        COUNT(ls.completed_at)::INTEGER as completed_sessions,
        CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(ls.completed_at)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0::DECIMAL
        END as completion_rate,
        COALESCE(ROUND(AVG(ls.accuracy), 2), 0::DECIMAL) as average_accuracy,
        COALESCE(SUM(ls.total_xp_earned), 0)::INTEGER as total_xp_earned,
        (
            SELECT s.name 
            FROM public.learning_sessions ls2
            JOIN public.subjects s ON ls2.subject_id = s.id
            WHERE ls2.user_id = p_user_id 
            AND ls2.started_at >= NOW() - INTERVAL '1 day' * p_days
            AND ls2.completed_at IS NOT NULL
            GROUP BY s.name
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ) as favorite_subject,
        COALESCE(
            AVG(ls.completed_at - ls.started_at),
            INTERVAL '0 minutes'
        ) as average_session_duration
    FROM public.learning_sessions ls
    WHERE ls.user_id = p_user_id
    AND ls.started_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$ LANGUAGE plpgsql;

-- Function to get learning progress trends
CREATE OR REPLACE FUNCTION get_learning_trends(p_user_id UUID, p_subject_id UUID DEFAULT NULL)
RETURNS TABLE(
    date_bucket DATE,
    sessions_count INTEGER,
    average_accuracy DECIMAL,
    total_xp INTEGER,
    average_difficulty DECIMAL
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        DATE(ls.started_at) as date_bucket,
        COUNT(*)::INTEGER as sessions_count,
        COALESCE(ROUND(AVG(ls.accuracy), 2), 0::DECIMAL) as average_accuracy,
        COALESCE(SUM(ls.total_xp_earned), 0)::INTEGER as total_xp,
        COALESCE(
            ROUND(AVG(
                (SELECT AVG((elem->>'value')::INTEGER) 
                 FROM jsonb_array_elements(ls.difficulty_progression) elem)
            ), 2), 
            0::DECIMAL
        ) as average_difficulty
    FROM public.learning_sessions ls
    WHERE ls.user_id = p_user_id
    AND ls.completed_at IS NOT NULL
    AND (p_subject_id IS NULL OR ls.subject_id = p_subject_id)
    AND ls.started_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(ls.started_at)
    ORDER BY date_bucket DESC;
END;
$ LANGUAGE plpgsql;

-- Function to award session completion bonuses
CREATE OR REPLACE FUNCTION award_session_bonuses(
    p_session_id TEXT,
    p_user_id UUID,
    p_accuracy DECIMAL,
    p_avg_response_time DECIMAL,
    p_questions_answered INTEGER
)
RETURNS INTEGER AS $
DECLARE
    total_bonus INTEGER := 0;
    accuracy_bonus INTEGER := 0;
    speed_bonus INTEGER := 0;
    completion_bonus INTEGER := 25; -- Base completion bonus
BEGIN
    -- Calculate accuracy bonus
    IF p_accuracy >= 95 THEN
        accuracy_bonus := 50;
    ELSIF p_accuracy >= 85 THEN
        accuracy_bonus := 30;
    ELSIF p_accuracy >= 75 THEN
        accuracy_bonus := 20;
    ELSIF p_accuracy >= 65 THEN
        accuracy_bonus := 10;
    END IF;
    
    -- Calculate speed bonus
    IF p_avg_response_time <= 5 THEN
        speed_bonus := 30;
    ELSIF p_avg_response_time <= 10 THEN
        speed_bonus := 20;
    ELSIF p_avg_response_time <= 15 THEN
        speed_bonus := 10;
    END IF;
    
    total_bonus := accuracy_bonus + speed_bonus + completion_bonus;
    
    -- Record bonuses
    IF accuracy_bonus > 0 THEN
        INSERT INTO public.session_bonuses (session_id, user_id, bonus_type, bonus_amount, bonus_criteria)
        VALUES (p_session_id, p_user_id, 'accuracy', accuracy_bonus, 
                jsonb_build_object('accuracy', p_accuracy, 'threshold', 
                    CASE 
                        WHEN p_accuracy >= 95 THEN 95
                        WHEN p_accuracy >= 85 THEN 85
                        WHEN p_accuracy >= 75 THEN 75
                        ELSE 65
                    END));
    END IF;
    
    IF speed_bonus > 0 THEN
        INSERT INTO public.session_bonuses (session_id, user_id, bonus_type, bonus_amount, bonus_criteria)
        VALUES (p_session_id, p_user_id, 'speed', speed_bonus, 
                jsonb_build_object('avg_response_time', p_avg_response_time, 'threshold',
                    CASE 
                        WHEN p_avg_response_time <= 5 THEN 5
                        WHEN p_avg_response_time <= 10 THEN 10
                        ELSE 15
                    END));
    END IF;
    
    INSERT INTO public.session_bonuses (session_id, user_id, bonus_type, bonus_amount, bonus_criteria)
    VALUES (p_session_id, p_user_id, 'completion', completion_bonus, 
            jsonb_build_object('questions_answered', p_questions_answered));
    
    RETURN total_bonus;
END;
$ LANGUAGE plpgsql;

-- Function to track difficulty adjustments
CREATE OR REPLACE FUNCTION track_difficulty_adjustment(
    p_session_id TEXT,
    p_user_id UUID,
    p_question_index INTEGER,
    p_old_difficulty INTEGER,
    p_new_difficulty INTEGER,
    p_reason TEXT,
    p_performance_history JSONB
)
RETURNS void AS $
BEGIN
    INSERT INTO public.difficulty_adjustments (
        session_id, user_id, question_index, old_difficulty, 
        new_difficulty, adjustment_reason, performance_history
    )
    VALUES (
        p_session_id, p_user_id, p_question_index, p_old_difficulty,
        p_new_difficulty, p_reason, p_performance_history
    );
END;
$ LANGUAGE plpgsql;

-- Function to get personalized learning recommendations
CREATE OR REPLACE FUNCTION get_learning_recommendations(p_user_id UUID)
RETURNS TABLE(
    recommendation_type TEXT,
    subject_name TEXT,
    reason TEXT,
    priority INTEGER
) AS $
BEGIN
    RETURN QUERY
    -- Recommend subjects with low recent accuracy
    SELECT 
        'improve_accuracy'::TEXT as recommendation_type,
        s.name as subject_name,
        'Recent accuracy below 70% - practice recommended'::TEXT as reason,
        1 as priority
    FROM public.learning_sessions ls
    JOIN public.subjects s ON ls.subject_id = s.id
    WHERE ls.user_id = p_user_id
    AND ls.started_at >= NOW() - INTERVAL '7 days'
    AND ls.completed_at IS NOT NULL
    GROUP BY s.id, s.name
    HAVING AVG(ls.accuracy) < 70
    
    UNION ALL
    
    -- Recommend subjects not practiced recently
    SELECT 
        'practice_neglected'::TEXT as recommendation_type,
        s.name as subject_name,
        'Not practiced in the last 7 days'::TEXT as reason,
        2 as priority
    FROM public.subjects s
    WHERE s.id NOT IN (
        SELECT DISTINCT ls.subject_id
        FROM public.learning_sessions ls
        WHERE ls.user_id = p_user_id
        AND ls.started_at >= NOW() - INTERVAL '7 days'
        AND ls.subject_id IS NOT NULL
    )
    
    ORDER BY priority, subject_name;
END;
$ LANGUAGE plpgsql;