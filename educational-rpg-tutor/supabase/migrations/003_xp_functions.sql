-- XP Calculation and Level Progression Functions
-- These functions handle character progression logic server-side for security

-- Function to calculate XP required for a specific level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(target_level INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_xp INTEGER := 0;
    level_counter INTEGER := 1;
BEGIN
    -- Level 1 starts at 0 XP
    IF target_level <= 1 THEN
        RETURN 0;
    END IF;
    
    -- Calculate cumulative XP needed
    WHILE level_counter < target_level LOOP
        IF level_counter <= 10 THEN
            total_xp := total_xp + 100; -- 100 XP per level for levels 1-10
        ELSIF level_counter <= 25 THEN
            total_xp := total_xp + 150; -- 150 XP per level for levels 11-25
        ELSE
            total_xp := total_xp + 200; -- 200 XP per level for 26+
        END IF;
        level_counter := level_counter + 1;
    END LOOP;
    
    RETURN total_xp;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate current level from total XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_level INTEGER := 1;
    xp_needed INTEGER := 0;
BEGIN
    -- Start from level 1 and work up
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
    
    -- Return the last level we could afford
    RETURN current_level - 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate XP reward based on question difficulty and performance
CREATE OR REPLACE FUNCTION calculate_xp_reward(
    base_difficulty INTEGER,
    is_correct BOOLEAN,
    response_time_seconds INTEGER DEFAULT NULL,
    user_stats JSONB DEFAULT '{}'::JSONB
)
RETURNS INTEGER AS $$
DECLARE
    base_xp INTEGER;
    accuracy_bonus NUMERIC := 0;
    time_bonus NUMERIC := 0;
    stat_multiplier NUMERIC := 1.0;
    intelligence_stat INTEGER;
    final_xp INTEGER;
BEGIN
    -- Base XP calculation
    base_xp := base_difficulty * 10;
    
    -- No XP for incorrect answers
    IF NOT is_correct THEN
        RETURN 0;
    END IF;
    
    -- Accuracy bonus (full bonus for correct answers)
    accuracy_bonus := base_xp * 0.5;
    
    -- Time bonus (bonus for quick responses, max 30 seconds for full bonus)
    IF response_time_seconds IS NOT NULL AND response_time_seconds <= 30 THEN
        time_bonus := base_xp * 0.3 * (1.0 - (response_time_seconds::NUMERIC / 30.0));
    END IF;
    
    -- Intelligence stat multiplier (if provided)
    IF user_stats ? 'intelligence' THEN
        intelligence_stat := (user_stats->>'intelligence')::INTEGER;
        stat_multiplier := 1.0 + (intelligence_stat::NUMERIC / 100.0 * 0.2); -- Max 20% bonus at 100 intelligence
    END IF;
    
    -- Calculate final XP
    final_xp := FLOOR((base_xp + accuracy_bonus + time_bonus) * stat_multiplier);
    
    -- Ensure minimum 1 XP for correct answers
    RETURN GREATEST(final_xp, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to award XP and handle level progression
CREATE OR REPLACE FUNCTION award_xp_and_level_up(
    character_uuid UUID,
    xp_to_award INTEGER
)
RETURNS JSONB AS $$
DECLARE
    char_record RECORD;
    old_level INTEGER;
    new_level INTEGER;
    new_total_xp INTEGER;
    stat_points_awarded INTEGER := 0;
    level_up_occurred BOOLEAN := FALSE;
    result JSONB;
BEGIN
    -- Get current character data
    SELECT * INTO char_record FROM public.characters WHERE id = character_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Character not found';
    END IF;
    
    -- Calculate new totals
    old_level := char_record.level;
    new_total_xp := char_record.total_xp + xp_to_award;
    new_level := calculate_level_from_xp(new_total_xp);
    
    -- Check if level up occurred
    IF new_level > old_level THEN
        level_up_occurred := TRUE;
        stat_points_awarded := (new_level - old_level) * 3; -- 3 stat points per level
    END IF;
    
    -- Update character
    UPDATE public.characters 
    SET 
        total_xp = new_total_xp,
        level = new_level,
        current_xp = new_total_xp - calculate_xp_for_level(new_level),
        updated_at = NOW()
    WHERE id = character_uuid;
    
    -- Award stat points if leveled up
    IF level_up_occurred THEN
        UPDATE public.character_stats 
        SET 
            available_points = available_points + stat_points_awarded,
            updated_at = NOW()
        WHERE character_id = character_uuid;
    END IF;
    
    -- Return result information
    result := jsonb_build_object(
        'xp_awarded', xp_to_award,
        'old_level', old_level,
        'new_level', new_level,
        'new_total_xp', new_total_xp,
        'level_up_occurred', level_up_occurred,
        'stat_points_awarded', stat_points_awarded
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to allocate stat points
CREATE OR REPLACE FUNCTION allocate_stat_points(
    character_uuid UUID,
    intelligence_points INTEGER DEFAULT 0,
    vitality_points INTEGER DEFAULT 0,
    wisdom_points INTEGER DEFAULT 0,
    charisma_points INTEGER DEFAULT 0,
    dexterity_points INTEGER DEFAULT 0,
    creativity_points INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
    stats_record RECORD;
    total_points_to_spend INTEGER;
BEGIN
    -- Calculate total points being spent
    total_points_to_spend := intelligence_points + vitality_points + wisdom_points + 
                           charisma_points + dexterity_points + creativity_points;
    
    -- Get current stats
    SELECT * INTO stats_record FROM public.character_stats WHERE character_id = character_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Character stats not found';
    END IF;
    
    -- Check if user has enough available points
    IF stats_record.available_points < total_points_to_spend THEN
        RAISE EXCEPTION 'Not enough available stat points';
    END IF;
    
    -- Check stat limits (max 100 per stat)
    IF (stats_record.intelligence + intelligence_points > 100) OR
       (stats_record.vitality + vitality_points > 100) OR
       (stats_record.wisdom + wisdom_points > 100) OR
       (stats_record.charisma + charisma_points > 100) OR
       (stats_record.dexterity + dexterity_points > 100) OR
       (stats_record.creativity + creativity_points > 100) THEN
        RAISE EXCEPTION 'Stat allocation would exceed maximum of 100';
    END IF;
    
    -- Update stats
    UPDATE public.character_stats 
    SET 
        intelligence = intelligence + intelligence_points,
        vitality = vitality + vitality_points,
        wisdom = wisdom + wisdom_points,
        charisma = charisma + charisma_points,
        dexterity = dexterity + dexterity_points,
        creativity = creativity + creativity_points,
        available_points = available_points - total_points_to_spend,
        updated_at = NOW()
    WHERE character_id = character_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to process question response and award XP
CREATE OR REPLACE FUNCTION process_question_response(
    user_uuid UUID,
    question_uuid UUID,
    selected_answer TEXT,
    response_time_seconds INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    question_record RECORD;
    character_record RECORD;
    stats_record RECORD;
    is_correct BOOLEAN;
    xp_reward INTEGER;
    progression_result JSONB;
    response_id UUID;
    subject_record RECORD;
    stat_bonus INTEGER := 1;
BEGIN
    -- Get question details
    SELECT q.*, s.primary_stat, s.secondary_stat, s.name as subject_name
    INTO question_record, subject_record
    FROM public.questions q
    JOIN public.subjects s ON q.subject_id = s.id
    WHERE q.id = question_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Question not found';
    END IF;
    
    -- Get character and stats
    SELECT c.*, cs.intelligence, cs.vitality, cs.wisdom, cs.charisma, cs.dexterity, cs.creativity
    INTO character_record, stats_record
    FROM public.characters c
    JOIN public.character_stats cs ON c.id = cs.character_id
    WHERE c.user_id = user_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Character not found';
    END IF;
    
    -- Check if answer is correct
    is_correct := (selected_answer = question_record.correct_answer);
    
    -- Calculate XP reward with stat bonuses
    IF is_correct THEN
        -- Get relevant stat bonus
        CASE subject_record.primary_stat
            WHEN 'intelligence' THEN stat_bonus := stats_record.intelligence;
            WHEN 'vitality' THEN stat_bonus := stats_record.vitality;
            WHEN 'wisdom' THEN stat_bonus := stats_record.wisdom;
            WHEN 'charisma' THEN stat_bonus := stats_record.charisma;
            WHEN 'dexterity' THEN stat_bonus := stats_record.dexterity;
            WHEN 'creativity' THEN stat_bonus := stats_record.creativity;
        END CASE;
        
        xp_reward := calculate_xp_reward(
            question_record.difficulty_level,
            is_correct,
            response_time_seconds,
            jsonb_build_object('intelligence', stat_bonus)
        );
    ELSE
        xp_reward := 0;
    END IF;
    
    -- Record the response
    INSERT INTO public.question_responses (
        user_id, question_id, selected_answer, is_correct, xp_earned, response_time_seconds
    ) VALUES (
        user_uuid, question_uuid, selected_answer, is_correct, xp_reward, response_time_seconds
    ) RETURNING id INTO response_id;
    
    -- Award XP and handle level progression
    IF xp_reward > 0 THEN
        progression_result := award_xp_and_level_up(character_record.id, xp_reward);
    ELSE
        progression_result := jsonb_build_object(
            'xp_awarded', 0,
            'old_level', character_record.level,
            'new_level', character_record.level,
            'new_total_xp', character_record.total_xp,
            'level_up_occurred', false,
            'stat_points_awarded', 0
        );
    END IF;
    
    -- Update user progress
    INSERT INTO public.user_progress (user_id, subject_id, questions_answered, questions_correct, total_xp_earned)
    VALUES (user_uuid, question_record.subject_id, 1, CASE WHEN is_correct THEN 1 ELSE 0 END, xp_reward)
    ON CONFLICT (user_id, subject_id) 
    DO UPDATE SET
        questions_answered = user_progress.questions_answered + 1,
        questions_correct = user_progress.questions_correct + CASE WHEN is_correct THEN 1 ELSE 0 END,
        total_xp_earned = user_progress.total_xp_earned + xp_reward,
        last_activity = NOW(),
        updated_at = NOW();
    
    -- Return comprehensive result
    RETURN jsonb_build_object(
        'response_id', response_id,
        'is_correct', is_correct,
        'correct_answer', question_record.correct_answer,
        'xp_earned', xp_reward,
        'progression', progression_result,
        'subject', subject_record.subject_name
    );
END;
$$ LANGUAGE plpgsql;