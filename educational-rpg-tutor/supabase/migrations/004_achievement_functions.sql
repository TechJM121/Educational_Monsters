-- Achievement and inventory management functions

-- Function to increment item quantity in user inventory
CREATE OR REPLACE FUNCTION increment_item_quantity(p_user_id UUID, p_item_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.user_inventory 
    SET quantity = quantity + 1
    WHERE user_id = p_user_id AND item_id = p_item_id;
    
    -- If no rows were updated, insert a new record
    IF NOT FOUND THEN
        INSERT INTO public.user_inventory (user_id, item_id, quantity)
        VALUES (p_user_id, p_item_id, 1);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has achieved a milestone
CREATE OR REPLACE FUNCTION check_learning_milestone(p_user_id UUID, p_milestone_type TEXT, p_threshold INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER := 0;
BEGIN
    CASE p_milestone_type
        WHEN 'total_questions' THEN
            SELECT COUNT(*) INTO current_count
            FROM public.question_responses
            WHERE user_id = p_user_id;
            
        WHEN 'correct_answers' THEN
            SELECT COUNT(*) INTO current_count
            FROM public.question_responses
            WHERE user_id = p_user_id AND is_correct = true;
            
        WHEN 'daily_streak' THEN
            SELECT COALESCE(MAX(best_streak), 0) INTO current_count
            FROM public.user_progress
            WHERE user_id = p_user_id;
            
        ELSE
            RETURN false;
    END CASE;
    
    RETURN current_count >= p_threshold;
END;
$$ LANGUAGE plpgsql;

-- Function to get achievement progress for a user
CREATE OR REPLACE FUNCTION get_achievement_progress(p_user_id UUID, p_achievement_id UUID)
RETURNS INTEGER AS $$
DECLARE
    achievement_criteria JSONB;
    progress_count INTEGER := 0;
BEGIN
    -- Get achievement criteria
    SELECT unlock_criteria INTO achievement_criteria
    FROM public.achievements
    WHERE id = p_achievement_id;
    
    IF achievement_criteria IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate progress based on criteria type
    CASE achievement_criteria->>'type'
        WHEN 'lessons_completed' THEN
            SELECT COUNT(*) INTO progress_count
            FROM public.question_responses
            WHERE user_id = p_user_id;
            
        WHEN 'subject_correct_answers' THEN
            SELECT COUNT(*) INTO progress_count
            FROM public.question_responses qr
            JOIN public.questions q ON qr.question_id = q.id
            JOIN public.subjects s ON q.subject_id = s.id
            WHERE qr.user_id = p_user_id 
            AND qr.is_correct = true
            AND s.name = achievement_criteria->>'subject';
            
        WHEN 'character_level' THEN
            SELECT COALESCE(level, 0) INTO progress_count
            FROM public.characters
            WHERE user_id = p_user_id;
            
        ELSE
            progress_count := 0;
    END CASE;
    
    RETURN progress_count;
END;
$$ LANGUAGE plpgsql;

-- Function to award achievement with celebration tracking
CREATE OR REPLACE FUNCTION award_achievement_with_celebration(p_user_id UUID, p_achievement_id UUID)
RETURNS TABLE(achievement_name TEXT, rarity_level INTEGER, should_celebrate BOOLEAN) AS $$
DECLARE
    achievement_record RECORD;
    already_exists BOOLEAN := false;
BEGIN
    -- Check if achievement already exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = p_user_id AND achievement_id = p_achievement_id
    ) INTO already_exists;
    
    IF already_exists THEN
        RETURN;
    END IF;
    
    -- Get achievement details
    SELECT name, rarity_level INTO achievement_record
    FROM public.achievements
    WHERE id = p_achievement_id;
    
    -- Award the achievement
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (p_user_id, p_achievement_id);
    
    -- Return achievement info for celebration
    RETURN QUERY SELECT 
        achievement_record.name,
        achievement_record.rarity_level,
        true as should_celebrate;
END;
$$ LANGUAGE plpgsql;