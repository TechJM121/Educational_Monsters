-- Seed data for Educational RPG Tutor
-- This file populates the database with initial subjects, questions, achievements, and items

-- Insert subjects with their stat mappings
INSERT INTO public.subjects (name, description, primary_stat, secondary_stat) VALUES
('Mathematics', 'Numbers, calculations, and problem-solving', 'intelligence', 'wisdom'),
('Biology', 'Living organisms and life processes', 'vitality', 'intelligence'),
('History', 'Past events and civilizations', 'wisdom', 'charisma'),
('Language Arts', 'Reading, writing, and communication', 'charisma', 'creativity'),
('Science', 'Physics, chemistry, and experiments', 'dexterity', 'intelligence'),
('Art', 'Creative expression and design', 'creativity', 'charisma');

-- Insert sample achievements
INSERT INTO public.achievements (name, description, badge_icon, unlock_criteria, rarity_level, category) VALUES
('First Steps', 'Complete your first lesson', 'first-steps-badge', '{"type": "lessons_completed", "count": 1}', 1, 'learning'),
('Math Wizard', 'Answer 50 math questions correctly', 'math-wizard-badge', '{"type": "subject_correct_answers", "subject": "Mathematics", "count": 50}', 2, 'learning'),
('Science Explorer', 'Complete 10 science experiments', 'science-explorer-badge', '{"type": "subject_lessons", "subject": "Science", "count": 10}', 2, 'learning'),
('Bookworm', 'Read 25 language arts passages', 'bookworm-badge', '{"type": "subject_lessons", "subject": "Language Arts", "count": 25}', 2, 'learning'),
('History Buff', 'Learn about 15 historical events', 'history-buff-badge', '{"type": "subject_lessons", "subject": "History", "count": 15}', 2, 'learning'),
('Artist', 'Complete 20 art projects', 'artist-badge', '{"type": "subject_lessons", "subject": "Art", "count": 20}', 2, 'learning'),
('Biology Expert', 'Master 30 biology concepts', 'biology-expert-badge', '{"type": "subject_lessons", "subject": "Biology", "count": 30}', 3, 'learning'),
('Speed Learner', 'Answer 10 questions in under 5 seconds each', 'speed-learner-badge', '{"type": "fast_answers", "time_limit": 5, "count": 10}', 3, 'learning'),
('Perfectionist', 'Get 100% accuracy on 20 consecutive questions', 'perfectionist-badge', '{"type": "accuracy_streak", "accuracy": 100, "count": 20}', 4, 'learning'),
('Learning Streak', 'Study for 7 consecutive days', 'learning-streak-badge', '{"type": "daily_streak", "count": 7}', 2, 'streak'),
('Dedication', 'Study for 30 consecutive days', 'dedication-badge', '{"type": "daily_streak", "count": 30}', 4, 'streak'),
('Level 10', 'Reach character level 10', 'level-10-badge', '{"type": "character_level", "level": 10}', 2, 'learning'),
('Level 25', 'Reach character level 25', 'level-25-badge', '{"type": "character_level", "level": 25}', 3, 'learning'),
('Legendary', 'Reach character level 50', 'legendary-badge', '{"type": "character_level", "level": 50}', 5, 'learning');

-- Insert sample inventory items
INSERT INTO public.inventory_items (name, description, item_type, rarity_level, icon_url, stat_bonuses) VALUES
('Wooden Wand', 'A simple wand for beginning wizards', 'equipment', 1, 'wooden-wand.png', '{"intelligence": 2}'),
('Health Potion', 'Restores vitality and energy', 'consumable', 1, 'health-potion.png', '{"vitality": 5}'),
('Wisdom Scroll', 'Ancient knowledge in written form', 'collectible', 2, 'wisdom-scroll.png', '{"wisdom": 3}'),
('Silver Crown', 'A crown that boosts charisma', 'equipment', 2, 'silver-crown.png', '{"charisma": 4}'),
('Nimble Gloves', 'Gloves that improve dexterity', 'equipment', 2, 'nimble-gloves.png', '{"dexterity": 3}'),
('Artist Palette', 'A palette that enhances creativity', 'equipment', 2, 'artist-palette.png', '{"creativity": 4}'),
('Crystal Orb', 'A magical orb of great power', 'equipment', 3, 'crystal-orb.png', '{"intelligence": 6, "wisdom": 3}'),
('Dragon Scale', 'A rare scale from an ancient dragon', 'collectible', 4, 'dragon-scale.png', '{"vitality": 8}'),
('Phoenix Feather', 'A legendary feather of rebirth', 'collectible', 5, 'phoenix-feather.png', '{"creativity": 10, "charisma": 5}'),
('Master''s Tome', 'The ultimate book of knowledge', 'equipment', 5, 'masters-tome.png', '{"intelligence": 12, "wisdom": 8}');

-- Insert sample questions for Mathematics (ages 3-6)
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'What comes after the number 2?',
    '["1", "3", "5", "4"]',
    '3',
    1,
    10,
    '3-6'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'How many fingers do you have on one hand?',
    '["3", "4", "5", "6"]',
    '5',
    1,
    10,
    '3-6'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'What is 2 + 2?',
    '["3", "4", "5", "6"]',
    '4',
    2,
    20,
    '3-6'
FROM public.subjects s WHERE s.name = 'Mathematics';

-- Insert sample questions for Mathematics (ages 7-10)
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'What is 7 × 8?',
    '["54", "56", "58", "64"]',
    '56',
    3,
    30,
    '7-10'
FROM public.subjects s WHERE s.name = 'Mathematics';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'What is 144 ÷ 12?',
    '["11", "12", "13", "14"]',
    '12',
    3,
    30,
    '7-10'
FROM public.subjects s WHERE s.name = 'Mathematics';

-- Insert sample questions for Science (ages 7-10)
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'What do plants need to make their own food?',
    '["Water only", "Sunlight only", "Sunlight and water", "Soil only"]',
    'Sunlight and water',
    2,
    20,
    '7-10'
FROM public.subjects s WHERE s.name = 'Science';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'Which planet is closest to the Sun?',
    '["Venus", "Earth", "Mercury", "Mars"]',
    'Mercury',
    3,
    30,
    '7-10'
FROM public.subjects s WHERE s.name = 'Science';

-- Insert sample questions for Language Arts (ages 3-6)
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'Which letter comes after B?',
    '["A", "C", "D", "E"]',
    'C',
    1,
    10,
    '3-6'
FROM public.subjects s WHERE s.name = 'Language Arts';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'What sound does a cow make?',
    '["Woof", "Meow", "Moo", "Chirp"]',
    'Moo',
    1,
    10,
    '3-6'
FROM public.subjects s WHERE s.name = 'Language Arts';

-- Insert sample questions for History (ages 11-14)
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'Who was the first President of the United States?',
    '["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"]',
    'George Washington',
    3,
    30,
    '11-14'
FROM public.subjects s WHERE s.name = 'History';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'In which year did World War II end?',
    '["1944", "1945", "1946", "1947"]',
    '1945',
    4,
    40,
    '11-14'
FROM public.subjects s WHERE s.name = 'History';

-- Insert sample questions for Biology (ages 11-14)
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'What is the powerhouse of the cell?',
    '["Nucleus", "Mitochondria", "Ribosome", "Cytoplasm"]',
    'Mitochondria',
    3,
    30,
    '11-14'
FROM public.subjects s WHERE s.name = 'Biology';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'How many chambers does a human heart have?',
    '["2", "3", "4", "5"]',
    '4',
    3,
    30,
    '11-14'
FROM public.subjects s WHERE s.name = 'Biology';

-- Insert sample questions for Art (ages 7-10)
INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'What are the three primary colors?',
    '["Red, Blue, Yellow", "Red, Green, Blue", "Blue, Yellow, Orange", "Red, Blue, Purple"]',
    'Red, Blue, Yellow',
    2,
    20,
    '7-10'
FROM public.subjects s WHERE s.name = 'Art';

INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range) 
SELECT 
    s.id,
    'Who painted the Mona Lisa?',
    '["Pablo Picasso", "Vincent van Gogh", "Leonardo da Vinci", "Michelangelo"]',
    'Leonardo da Vinci',
    4,
    40,
    '11-14'
FROM public.subjects s WHERE s.name = 'Art';