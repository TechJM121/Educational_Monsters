-- Enhanced Seed Data for Educational RPG Tutor
-- This file adds comprehensive seed data for the enhanced progression and question systems

-- Insert question categories
INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Basic Arithmetic', 'Addition, subtraction, multiplication, division', s.id, '#10B981'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Geometry', 'Shapes, angles, and spatial reasoning', s.id, '#3B82F6'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Cell Biology', 'Cell structure and function', s.id, '#10B981'
FROM public.subjects s WHERE s.name = 'Biology';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Human Body', 'Anatomy and physiology', s.id, '#EF4444'
FROM public.subjects s WHERE s.name = 'Biology';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Ancient History', 'Early civilizations and empires', s.id, '#8B5CF6'
FROM public.subjects s WHERE s.name = 'History';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Modern History', 'Recent historical events', s.id, '#F59E0B'
FROM public.subjects s WHERE s.name = 'History';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Reading Comprehension', 'Understanding written text', s.id, '#06B6D4'
FROM public.subjects s WHERE s.name = 'Language Arts';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Grammar', 'Language rules and structure', s.id, '#84CC16'
FROM public.subjects s WHERE s.name = 'Language Arts';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Physics', 'Forces, energy, and matter', s.id, '#6366F1'
FROM public.subjects s WHERE s.name = 'Science';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Chemistry', 'Elements, compounds, and reactions', s.id, '#EC4899'
FROM public.subjects s WHERE s.name = 'Science';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Drawing & Painting', 'Visual art techniques', s.id, '#F97316'
FROM public.subjects s WHERE s.name = 'Art';

INSERT INTO public.question_categories (name, description, subject_id, color_code) 
SELECT 'Art History', 'Famous artists and movements', s.id, '#A855F7'
FROM public.subjects s WHERE s.name = 'Art';

-- Insert question tags
INSERT INTO public.question_tags (name, description) VALUES
('beginner', 'Suitable for beginners'),
('intermediate', 'Requires some prior knowledge'),
('advanced', 'Challenging questions'),
('visual', 'Includes images or diagrams'),
('word-problem', 'Text-based problem solving'),
('multiple-choice', 'Multiple choice format'),
('true-false', 'True or false questions'),
('fill-blank', 'Fill in the blank format'),
('practical', 'Real-world applications'),
('theoretical', 'Conceptual understanding'),
('calculation', 'Requires mathematical computation'),
('memorization', 'Fact recall questions'),
('analysis', 'Requires critical thinking'),
('creativity', 'Open-ended creative responses');

-- Insert skills for each subject
INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Addition', 'Adding numbers together', s.id, 85
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Subtraction', 'Taking numbers away', s.id, 85
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Multiplication', 'Repeated addition', s.id, 80
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Division', 'Splitting into equal groups', s.id, 80
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Fractions', 'Parts of a whole', s.id, 75
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Reading Comprehension', 'Understanding written text', s.id, 80
FROM public.subjects s WHERE s.name = 'Language Arts';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Vocabulary', 'Word knowledge and usage', s.id, 85
FROM public.subjects s WHERE s.name = 'Language Arts';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Grammar', 'Language rules and structure', s.id, 75
FROM public.subjects s WHERE s.name = 'Language Arts';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Cell Structure', 'Understanding cell components', s.id, 80
FROM public.subjects s WHERE s.name = 'Biology';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Human Anatomy', 'Body systems and organs', s.id, 75
FROM public.subjects s WHERE s.name = 'Biology';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Ecosystems', 'Environmental interactions', s.id, 80
FROM public.subjects s WHERE s.name = 'Biology';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Ancient Civilizations', 'Early human societies', s.id, 75
FROM public.subjects s WHERE s.name = 'History';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'World Wars', 'Major 20th century conflicts', s.id, 80
FROM public.subjects s WHERE s.name = 'History';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Forces and Motion', 'Physics fundamentals', s.id, 75
FROM public.subjects s WHERE s.name = 'Science';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Chemical Reactions', 'How substances interact', s.id, 70
FROM public.subjects s WHERE s.name = 'Science';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Color Theory', 'Understanding color relationships', s.id, 80
FROM public.subjects s WHERE s.name = 'Art';

INSERT INTO public.skills (name, description, subject_id, mastery_threshold) 
SELECT 'Art History', 'Famous artists and movements', s.id, 75
FROM public.subjects s WHERE s.name = 'Art';

-- Insert learning paths
INSERT INTO public.learning_paths (name, description, subject_id, age_range, difficulty_progression, estimated_duration_minutes, total_steps) 
SELECT 
    'Basic Math Foundations', 
    'Learn fundamental math concepts step by step',
    s.id,
    '3-6',
    '[1, 1, 2, 2, 3]',
    45,
    5
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.learning_paths (name, description, subject_id, age_range, difficulty_progression, estimated_duration_minutes, total_steps) 
SELECT 
    'Elementary Math Skills', 
    'Build on basic math with more complex problems',
    s.id,
    '7-10',
    '[2, 2, 3, 3, 4]',
    60,
    5
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.learning_paths (name, description, subject_id, age_range, difficulty_progression, estimated_duration_minutes, total_steps) 
SELECT 
    'Reading Adventures', 
    'Develop reading skills through engaging stories',
    s.id,
    '3-6',
    '[1, 1, 2, 2, 2]',
    40,
    5
FROM public.subjects s WHERE s.name = 'Language Arts';

INSERT INTO public.learning_paths (name, description, subject_id, age_range, difficulty_progression, estimated_duration_minutes, total_steps) 
SELECT 
    'Science Explorers', 
    'Discover the wonders of science',
    s.id,
    '7-10',
    '[1, 2, 2, 3, 3]',
    50,
    5
FROM public.subjects s WHERE s.name = 'Science';

INSERT INTO public.learning_paths (name, description, subject_id, age_range, difficulty_progression, estimated_duration_minutes, total_steps) 
SELECT 
    'Living Things', 
    'Learn about plants, animals, and ecosystems',
    s.id,
    '7-10',
    '[2, 2, 3, 3, 4]',
    55,
    5
FROM public.subjects s WHERE s.name = 'Biology';

INSERT INTO public.learning_paths (name, description, subject_id, age_range, difficulty_progression, estimated_duration_minutes, total_steps) 
SELECT 
    'Time Travelers', 
    'Journey through history',
    s.id,
    '11-14',
    '[2, 3, 3, 4, 4]',
    70,
    5
FROM public.subjects s WHERE s.name = 'History';

INSERT INTO public.learning_paths (name, description, subject_id, age_range, difficulty_progression, estimated_duration_minutes, total_steps) 
SELECT 
    'Creative Expression', 
    'Explore different art forms and techniques',
    s.id,
    '7-10',
    '[1, 2, 2, 3, 3]',
    45,
    5
FROM public.subjects s WHERE s.name = 'Art';

-- Insert question pools
INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Early Math Pool', 
    'Basic counting and simple arithmetic',
    s.id,
    '3-6',
    '1-2',
    15,
    'adaptive'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Elementary Math Pool', 
    'Multiplication, division, and word problems',
    s.id,
    '7-10',
    '2-4',
    20,
    'adaptive'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Reading Basics Pool', 
    'Letter recognition and simple words',
    s.id,
    '3-6',
    '1-2',
    12,
    'sequential'
FROM public.subjects s WHERE s.name = 'Language Arts';

INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Science Discovery Pool', 
    'Basic science concepts and observations',
    s.id,
    '7-10',
    '1-3',
    18,
    'random'
FROM public.subjects s WHERE s.name = 'Science';

-- Update existing questions with categories and enhanced data
UPDATE public.questions 
SET category_id = (
    SELECT qc.id FROM public.question_categories qc 
    JOIN public.subjects s ON qc.subject_id = s.id 
    WHERE s.name = 'Mathematics' AND qc.name = 'Basic Arithmetic'
), time_limit_seconds = 30
WHERE subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
AND age_range = '3-6';

UPDATE public.questions 
SET category_id = (
    SELECT qc.id FROM public.question_categories qc 
    JOIN public.subjects s ON qc.subject_id = s.id 
    WHERE s.name = 'Mathematics' AND qc.name = 'Basic Arithmetic'
), time_limit_seconds = 45
WHERE subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
AND age_range = '7-10';

UPDATE public.questions 
SET category_id = (
    SELECT qc.id FROM public.question_categories qc 
    JOIN public.subjects s ON qc.subject_id = s.id 
    WHERE s.name = 'Science' AND qc.name = 'Physics'
), time_limit_seconds = 60
WHERE subject_id = (SELECT id FROM public.subjects WHERE name = 'Science');

UPDATE public.questions 
SET category_id = (
    SELECT qc.id FROM public.question_categories qc 
    JOIN public.subjects s ON qc.subject_id = s.id 
    WHERE s.name = 'Language Arts' AND qc.name = 'Reading Comprehension'
), time_limit_seconds = 45
WHERE subject_id = (SELECT id FROM public.subjects WHERE name = 'Language Arts');

UPDATE public.questions 
SET category_id = (
    SELECT qc.id FROM public.question_categories qc 
    JOIN public.subjects s ON qc.subject_id = s.id 
    WHERE s.name = 'History' AND qc.name = 'Modern History'
), time_limit_seconds = 60
WHERE subject_id = (SELECT id FROM public.subjects WHERE name = 'History');

UPDATE public.questions 
SET category_id = (
    SELECT qc.id FROM public.question_categories qc 
    JOIN public.subjects s ON qc.subject_id = s.id 
    WHERE s.name = 'Biology' AND qc.name = 'Cell Biology'
), time_limit_seconds = 60
WHERE subject_id = (SELECT id FROM public.subjects WHERE name = 'Biology');

UPDATE public.questions 
SET category_id = (
    SELECT qc.id FROM public.question_categories qc 
    JOIN public.subjects s ON qc.subject_id = s.id 
    WHERE s.name = 'Art' AND qc.name = 'Art History'
), time_limit_seconds = 90
WHERE subject_id = (SELECT id FROM public.subjects WHERE name = 'Art');

-- Add question hints for some questions
INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty)
SELECT q.id, 'Try counting on your fingers!', 1, 2
FROM public.questions q
JOIN public.subjects s ON q.subject_id = s.id
WHERE s.name = 'Mathematics' AND q.question_text LIKE '%fingers%';

INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty)
SELECT q.id, 'Think about what plants need to grow.', 1, 3
FROM public.questions q
JOIN public.subjects s ON q.subject_id = s.id
WHERE s.name = 'Science' AND q.question_text LIKE '%plants%';

INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty)
SELECT q.id, 'Remember the order of the alphabet.', 1, 2
FROM public.questions q
JOIN public.subjects s ON q.subject_id = s.id
WHERE s.name = 'Language Arts' AND q.question_text LIKE '%letter%';

-- Add question explanations
INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
SELECT q.id, 'When we add 2 + 2, we are combining two groups of 2 items each, which gives us 4 items total.', 'correct'
FROM public.questions q
JOIN public.subjects s ON q.subject_id = s.id
WHERE s.name = 'Mathematics' AND q.question_text = 'What is 2 + 2?';

INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
SELECT q.id, 'Plants use sunlight and water in a process called photosynthesis to make their own food (glucose).', 'correct'
FROM public.questions q
JOIN public.subjects s ON q.subject_id = s.id
WHERE s.name = 'Science' AND q.question_text LIKE '%plants need%';

INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
SELECT q.id, 'George Washington was chosen as the first President because he led the Continental Army during the Revolutionary War and was trusted by the people.', 'correct'
FROM public.questions q
JOIN public.subjects s ON q.subject_id = s.id
WHERE s.name = 'History' AND q.question_text LIKE '%first President%';

-- Add more comprehensive questions with enhanced features

-- Advanced Mathematics Questions (ages 11-14)
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) 
SELECT 
    s.id,
    'If a rectangle has a length of 8 cm and a width of 5 cm, what is its area?',
    '["30 cm²", "40 cm²", "45 cm²", "50 cm²"]',
    '40 cm²',
    3,
    30,
    '11-14',
    qc.id,
    60
FROM public.subjects s, public.question_categories qc
WHERE s.name = 'Mathematics' AND qc.name = 'Geometry';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) 
SELECT 
    s.id,
    'What is 15% of 200?',
    '["25", "30", "35", "40"]',
    '30',
    4,
    40,
    '11-14',
    qc.id,
    75
FROM public.subjects s, public.question_categories qc
WHERE s.name = 'Mathematics' AND qc.name = 'Basic Arithmetic';

-- Advanced Science Questions
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) 
SELECT 
    s.id,
    'What is the chemical symbol for gold?',
    '["Go", "Gd", "Au", "Ag"]',
    'Au',
    3,
    30,
    '11-14',
    qc.id,
    45
FROM public.subjects s, public.question_categories qc
WHERE s.name = 'Science' AND qc.name = 'Chemistry';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) 
SELECT 
    s.id,
    'Which force keeps planets in orbit around the Sun?',
    '["Magnetic force", "Gravitational force", "Electric force", "Nuclear force"]',
    'Gravitational force',
    4,
    40,
    '11-14',
    qc.id,
    60
FROM public.subjects s, public.question_categories qc
WHERE s.name = 'Science' AND qc.name = 'Physics';

-- Advanced Language Arts Questions
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) 
SELECT 
    s.id,
    'Which of the following is a metaphor?',
    '["The wind whispered through the trees", "Her voice is music to my ears", "The car stopped suddenly", "He ran as fast as lightning"]',
    'Her voice is music to my ears',
    4,
    40,
    '11-14',
    qc.id,
    90
FROM public.subjects s, public.question_categories qc
WHERE s.name = 'Language Arts' AND qc.name = 'Grammar';

-- Create additional math-specific question pools
INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Advanced Math Pool', 
    'Complex mathematics for high school students',
    s.id,
    '15-18',
    '4-5',
    50,
    'adaptive'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Middle School Math Pool', 
    'Algebra, geometry, and advanced arithmetic',
    s.id,
    '11-14',
    '3-4',
    60,
    'adaptive'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Geometry & Measurement Pool', 
    'Shapes, spatial reasoning, and measurement',
    s.id,
    '7-18',
    '2-5',
    40,
    'adaptive'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Patterns & Logic Pool', 
    'Number patterns, sequences, and logical reasoning',
    s.id,
    '3-18',
    '1-5',
    35,
    'adaptive'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.question_pools (name, description, subject_id, age_range, difficulty_range, pool_size, selection_strategy) 
SELECT 
    'Practical Math Pool', 
    'Real-world applications and word problems',
    s.id,
    '3-18',
    '1-5',
    45,
    'adaptive'
FROM public.subjects s WHERE s.name = 'Mathematics';

-- Add questions to appropriate pools (this will include all math questions from all migrations)
INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 
    CASE 
        WHEN q.difficulty_level = 1 THEN 1.2  -- Slightly favor easier questions for beginners
        WHEN q.difficulty_level = 5 THEN 0.8  -- Slightly reduce weight of hardest questions
        ELSE 1.0 
    END as weight
FROM public.question_pools qp, public.questions q, public.subjects s
WHERE qp.name = 'Early Math Pool' 
AND q.subject_id = s.id 
AND s.name = 'Mathematics' 
AND q.age_range = '3-6'
ON CONFLICT (pool_id, question_id) DO NOTHING;

INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 1.0
FROM public.question_pools qp, public.questions q, public.subjects s
WHERE qp.name = 'Elementary Math Pool' 
AND q.subject_id = s.id 
AND s.name = 'Mathematics' 
AND q.age_range = '7-10'
ON CONFLICT (pool_id, question_id) DO NOTHING;

INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 1.0
FROM public.question_pools qp, public.questions q, public.subjects s
WHERE qp.name = 'Middle School Math Pool' 
AND q.subject_id = s.id 
AND s.name = 'Mathematics' 
AND q.age_range = '11-14'
ON CONFLICT (pool_id, question_id) DO NOTHING;

INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 
    CASE 
        WHEN q.difficulty_level = 5 THEN 1.1  -- Slightly favor the hardest questions for advanced students
        ELSE 1.0 
    END as weight
FROM public.question_pools qp, public.questions q, public.subjects s
WHERE qp.name = 'Advanced Math Pool' 
AND q.subject_id = s.id 
AND s.name = 'Mathematics' 
AND q.age_range = '15-18'
ON CONFLICT (pool_id, question_id) DO NOTHING;

-- Add geometry questions to geometry pool
INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 1.0
FROM public.question_pools qp, public.questions q, public.question_categories qc
WHERE qp.name = 'Geometry & Measurement Pool' 
AND q.category_id = qc.id 
AND qc.name = 'Geometry'
ON CONFLICT (pool_id, question_id) DO NOTHING;

-- Add pattern questions to patterns pool (questions with specific keywords)
INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 1.0
FROM public.question_pools qp, public.questions q, public.subjects s
WHERE qp.name = 'Patterns & Logic Pool' 
AND q.subject_id = s.id 
AND s.name = 'Mathematics' 
AND (q.question_text ILIKE '%pattern%' OR 
     q.question_text ILIKE '%next%' OR 
     q.question_text ILIKE '%sequence%' OR
     q.question_text ILIKE '%comes next%' OR
     q.question_text ILIKE '%fibonacci%' OR
     q.question_text ILIKE '%prime%')
ON CONFLICT (pool_id, question_id) DO NOTHING;

-- Add practical/word problem questions to practical pool
INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 1.0
FROM public.question_pools qp, public.questions q, public.subjects s
WHERE qp.name = 'Practical Math Pool' 
AND q.subject_id = s.id 
AND s.name = 'Mathematics' 
AND (q.question_text ILIKE '%buy%' OR 
     q.question_text ILIKE '%cost%' OR 
     q.question_text ILIKE '%save%' OR
     q.question_text ILIKE '%recipe%' OR
     q.question_text ILIKE '%classroom%' OR
     q.question_text ILIKE '%students%' OR
     q.question_text ILIKE '%time%' OR
     q.question_text ILIKE '%money%' OR
     q.question_text ILIKE '%trip%' OR
     q.question_text ILIKE '%store%')
ON CONFLICT (pool_id, question_id) DO NOTHING;

-- Add other subject questions to their pools
INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 1.0
FROM public.question_pools qp, public.questions q, public.subjects s
WHERE qp.name = 'Science Discovery Pool' 
AND q.subject_id = s.id 
AND s.name = 'Science'
ON CONFLICT (pool_id, question_id) DO NOTHING;

INSERT INTO public.question_pool_items (pool_id, question_id, weight)
SELECT qp.id, q.id, 1.0
FROM public.question_pools qp, public.questions q, public.subjects s
WHERE qp.name = 'Reading Basics Pool' 
AND q.subject_id = s.id 
AND s.name = 'Language Arts' 
AND q.age_range = '3-6'
ON CONFLICT (pool_id, question_id) DO NOTHING;