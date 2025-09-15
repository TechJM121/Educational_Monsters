-- Row Level Security Policies for Educational RPG Tutor
-- These policies ensure users can only access their own data and appropriate content

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Parents can view their children's profiles
CREATE POLICY "Parents can view children profiles" ON public.users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT parent_id FROM public.users WHERE id = auth.uid()
        ) OR parent_id = auth.uid()
    );

-- Characters table policies
CREATE POLICY "Users can view their own character" ON public.characters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own character" ON public.characters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own character" ON public.characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Parents can view their children's characters
CREATE POLICY "Parents can view children characters" ON public.characters
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE parent_id = auth.uid()
        )
    );

-- Character stats table policies
CREATE POLICY "Users can view their character stats" ON public.character_stats
    FOR SELECT USING (
        character_id IN (
            SELECT id FROM public.characters WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their character stats" ON public.character_stats
    FOR UPDATE USING (
        character_id IN (
            SELECT id FROM public.characters WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their character stats" ON public.character_stats
    FOR INSERT WITH CHECK (
        character_id IN (
            SELECT id FROM public.characters WHERE user_id = auth.uid()
        )
    );

-- Subjects table policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view subjects" ON public.subjects
    FOR SELECT USING (auth.role() = 'authenticated');

-- Questions table policies (read-only for authenticated users, age-appropriate)
CREATE POLICY "Users can view age-appropriate questions" ON public.questions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (
                age_range = '3-6' AND age BETWEEN 3 AND 6 OR
                age_range = '7-10' AND age BETWEEN 7 AND 10 OR
                age_range = '11-14' AND age BETWEEN 11 AND 14 OR
                age_range = '15-18' AND age BETWEEN 15 AND 18
            )
        )
    );

-- Question responses table policies
CREATE POLICY "Users can view their own responses" ON public.question_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" ON public.question_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Parents can view their children's responses
CREATE POLICY "Parents can view children responses" ON public.question_responses
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE parent_id = auth.uid()
        )
    );

-- Achievements table policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view achievements" ON public.achievements
    FOR SELECT USING (auth.role() = 'authenticated');

-- User achievements table policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Parents can view their children's achievements
CREATE POLICY "Parents can view children achievements" ON public.user_achievements
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE parent_id = auth.uid()
        )
    );

-- User progress table policies
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Parents can view their children's progress
CREATE POLICY "Parents can view children progress" ON public.user_progress
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE parent_id = auth.uid()
        )
    );

-- Inventory items table policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view inventory items" ON public.inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- User inventory table policies
CREATE POLICY "Users can view their own inventory" ON public.user_inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" ON public.user_inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own inventory" ON public.user_inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Parents can view their children's inventory
CREATE POLICY "Parents can view children inventory" ON public.user_inventory
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE parent_id = auth.uid()
        )
    );

-- Create a function to check if user is a parent of another user
CREATE OR REPLACE FUNCTION is_parent_of(parent_uuid UUID, child_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = child_uuid AND parent_id = parent_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's age for age-appropriate content
CREATE OR REPLACE FUNCTION get_user_age(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    user_age INTEGER;
BEGIN
    SELECT age INTO user_age FROM public.users WHERE id = user_uuid;
    RETURN COALESCE(user_age, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;