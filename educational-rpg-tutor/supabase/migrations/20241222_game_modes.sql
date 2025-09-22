-- Game Modes System Tables

-- Game Sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    game_mode_id TEXT NOT NULL,
    host_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')) DEFAULT 'waiting',
    current_round INTEGER NOT NULL DEFAULT 0,
    total_rounds INTEGER NOT NULL DEFAULT 1,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Game Participants table
CREATE TABLE IF NOT EXISTS game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    character_name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_ready BOOLEAN NOT NULL DEFAULT FALSE,
    current_score INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('active', 'eliminated', 'disconnected')) DEFAULT 'active',
    power_ups_used JSONB NOT NULL DEFAULT '[]',
    UNIQUE(session_id, user_id)
);

-- Game Questions table (for storing questions used in game sessions)
CREATE TABLE IF NOT EXISTS game_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL, -- References questions table
    round_number INTEGER NOT NULL,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Answers table (for storing participant answers)
CREATE TABLE IF NOT EXISTS game_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    points_earned INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Power-up Usage table
CREATE TABLE IF NOT EXISTS game_power_up_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    power_up_id TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Results table (final results for completed games)
CREATE TABLE IF NOT EXISTS game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    final_score INTEGER NOT NULL DEFAULT 0,
    final_position INTEGER NOT NULL,
    accuracy REAL NOT NULL DEFAULT 0,
    time_bonus INTEGER NOT NULL DEFAULT 0,
    streak_bonus INTEGER NOT NULL DEFAULT 0,
    power_up_bonus INTEGER NOT NULL DEFAULT 0,
    rewards_earned JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special Events table (for managing special event game modes)
CREATE TABLE IF NOT EXISTS special_events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    game_mode_ids TEXT[] NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    rewards JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Power-ups Inventory table
CREATE TABLE IF NOT EXISTS user_power_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    power_up_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    cooldown_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, power_up_id)
);

-- Game Mode Statistics table (for tracking user performance per game mode)
CREATE TABLE IF NOT EXISTS game_mode_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_mode_id TEXT NOT NULL,
    games_played INTEGER NOT NULL DEFAULT 0,
    games_won INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    average_accuracy REAL NOT NULL DEFAULT 0,
    total_time_played INTEGER NOT NULL DEFAULT 0, -- in minutes
    favorite_rating INTEGER CHECK (favorite_rating >= 1 AND favorite_rating <= 5),
    last_played TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_mode_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_mode ON game_sessions(game_mode_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_game_participants_session ON game_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_user ON game_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_score ON game_participants(current_score DESC);

CREATE INDEX IF NOT EXISTS idx_game_answers_session ON game_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_user ON game_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_submitted_at ON game_answers(submitted_at);

CREATE INDEX IF NOT EXISTS idx_game_results_user ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_score ON game_results(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at);

CREATE INDEX IF NOT EXISTS idx_special_events_active ON special_events(is_active, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_user_power_ups_user ON user_power_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_power_ups_cooldown ON user_power_ups(cooldown_until);

CREATE INDEX IF NOT EXISTS idx_game_mode_stats_user ON game_mode_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_mode_stats_game_mode ON game_mode_stats(game_mode_id);
CREATE INDEX IF NOT EXISTS idx_game_mode_stats_best_score ON game_mode_stats(best_score DESC);

-- RLS Policies
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_power_up_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_power_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_mode_stats ENABLE ROW LEVEL SECURITY;

-- Game Sessions policies
CREATE POLICY "Users can view game sessions they participate in" ON game_sessions
    FOR SELECT USING (
        id IN (
            SELECT session_id FROM game_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create game sessions" ON game_sessions
    FOR INSERT WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Hosts can update their game sessions" ON game_sessions
    FOR UPDATE USING (host_user_id = auth.uid());

-- Game Participants policies
CREATE POLICY "Users can view participants in their sessions" ON game_participants
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM game_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join game sessions" ON game_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON game_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Game Questions policies
CREATE POLICY "Users can view questions in their sessions" ON game_questions
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM game_participants WHERE user_id = auth.uid()
        )
    );

-- Game Answers policies
CREATE POLICY "Users can view answers in their sessions" ON game_answers
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM game_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can submit their own answers" ON game_answers
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Power-up Usage policies
CREATE POLICY "Users can view power-up usage in their sessions" ON game_power_up_usage
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM game_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can use their own power-ups" ON game_power_up_usage
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Game Results policies
CREATE POLICY "Users can view results from their sessions" ON game_results
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM game_participants WHERE user_id = auth.uid()
        )
    );

-- Special Events policies (public read)
CREATE POLICY "Anyone can view active special events" ON special_events
    FOR SELECT USING (is_active = true);

-- User Power-ups policies
CREATE POLICY "Users can view their own power-ups" ON user_power_ups
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own power-ups" ON user_power_ups
    FOR ALL USING (user_id = auth.uid());

-- Game Mode Stats policies
CREATE POLICY "Users can view their own game mode stats" ON game_mode_stats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own game mode stats" ON game_mode_stats
    FOR ALL USING (user_id = auth.uid());

-- Functions for leaderboards and statistics

-- Function to get game mode leaderboard
CREATE OR REPLACE FUNCTION get_game_mode_leaderboard(
    game_mode_id TEXT,
    date_filter TEXT DEFAULT ''
)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    character_name TEXT,
    score INTEGER,
    accuracy REAL,
    time_bonus INTEGER,
    streak_bonus INTEGER,
    power_up_bonus INTEGER,
    final_position INTEGER,
    rewards_earned JSONB
) AS $$
BEGIN
    RETURN QUERY
    EXECUTE format('
        SELECT 
            gr.user_id,
            gp.username,
            gp.character_name,
            gr.final_score as score,
            gr.accuracy,
            gr.time_bonus,
            gr.streak_bonus,
            gr.power_up_bonus,
            gr.final_position,
            gr.rewards_earned
        FROM game_results gr
        JOIN game_participants gp ON gr.user_id = gp.user_id AND gr.session_id = gp.session_id
        JOIN game_sessions gs ON gr.session_id = gs.id
        WHERE gs.game_mode_id = %L
        AND gs.status = ''completed''
        %s
        ORDER BY gr.final_score DESC, gr.accuracy DESC
        LIMIT 100
    ', game_mode_id, date_filter);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update game mode statistics
CREATE OR REPLACE FUNCTION update_game_mode_stats(
    p_user_id UUID,
    p_game_mode_id TEXT,
    p_score INTEGER,
    p_accuracy REAL,
    p_time_played INTEGER,
    p_won BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO game_mode_stats (
        user_id, 
        game_mode_id, 
        games_played, 
        games_won, 
        total_score, 
        best_score, 
        average_accuracy, 
        total_time_played,
        last_played,
        updated_at
    )
    VALUES (
        p_user_id, 
        p_game_mode_id, 
        1, 
        CASE WHEN p_won THEN 1 ELSE 0 END, 
        p_score, 
        p_score, 
        p_accuracy, 
        p_time_played,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, game_mode_id)
    DO UPDATE SET
        games_played = game_mode_stats.games_played + 1,
        games_won = game_mode_stats.games_won + CASE WHEN p_won THEN 1 ELSE 0 END,
        total_score = game_mode_stats.total_score + p_score,
        best_score = GREATEST(game_mode_stats.best_score, p_score),
        average_accuracy = (game_mode_stats.average_accuracy * game_mode_stats.games_played + p_accuracy) / (game_mode_stats.games_played + 1),
        total_time_played = game_mode_stats.total_time_played + p_time_played,
        last_played = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create game results when session completes
CREATE OR REPLACE FUNCTION create_game_results()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create results when session status changes to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO game_results (
            session_id,
            user_id,
            final_score,
            final_position,
            accuracy,
            time_bonus,
            streak_bonus,
            power_up_bonus
        )
        SELECT 
            gp.session_id,
            gp.user_id,
            gp.current_score,
            gp.position,
            COALESCE(
                (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
                 FROM game_answers ga 
                 WHERE ga.session_id = gp.session_id AND ga.user_id = gp.user_id), 
                0
            ) as accuracy,
            0 as time_bonus, -- Would be calculated based on answer times
            0 as streak_bonus, -- Would be calculated based on consecutive correct answers
            0 as power_up_bonus -- Would be calculated based on power-ups used
        FROM game_participants gp
        WHERE gp.session_id = NEW.id;
        
        -- Update game mode statistics for each participant
        PERFORM update_game_mode_stats(
            gp.user_id,
            NEW.game_mode_id,
            gp.current_score,
            COALESCE(
                (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
                 FROM game_answers ga 
                 WHERE ga.session_id = gp.session_id AND ga.user_id = gp.user_id), 
                0
            ),
            EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER / 60, -- minutes
            gp.position = 1 -- won if first place
        )
        FROM game_participants gp
        WHERE gp.session_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_game_results
    AFTER UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION create_game_results();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;