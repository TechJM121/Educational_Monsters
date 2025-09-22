-- Comprehensive Mathematics Questions
-- This migration adds extensive math questions across all age groups and difficulty levels

-- Get the Mathematics subject ID and Basic Arithmetic category ID for reference
DO $$ 
DECLARE
    math_subject_id UUID;
    arithmetic_category_id UUID;
    geometry_category_id UUID;
BEGIN
    -- Get subject and category IDs
    SELECT id INTO math_subject_id FROM public.subjects WHERE name = 'Mathematics';
    SELECT id INTO arithmetic_category_id FROM public.question_categories WHERE name = 'Basic Arithmetic';
    SELECT id INTO geometry_category_id FROM public.question_categories WHERE name = 'Geometry';

    -- Ages 3-6: Early Math Concepts (Difficulty 1-2)
    
    -- Counting and Number Recognition
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'How many apples are there? 🍎🍎🍎', '["2", "3", "4", "5"]', '3', 1, 10, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'Count the stars: ⭐⭐⭐⭐⭐', '["4", "5", "6", "7"]', '5', 1, 10, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'Which number comes after 4?', '["3", "5", "6", "7"]', '5', 1, 10, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'Which number comes before 7?', '["5", "6", "8", "9"]', '6', 1, 10, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'Count the dots: • • • • • •', '["5", "6", "7", "8"]', '6', 1, 10, '3-6', arithmetic_category_id, 30),
    
    -- Simple Addition
    (math_subject_id, 'What is 1 + 1?', '["1", "2", "3", "4"]', '2', 1, 10, '3-6', arithmetic_category_id, 20),
    (math_subject_id, 'What is 2 + 1?', '["2", "3", "4", "5"]', '3', 1, 10, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'What is 3 + 1?', '["3", "4", "5", "6"]', '4', 1, 10, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'What is 2 + 3?', '["4", "5", "6", "7"]', '5', 2, 15, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'What is 4 + 2?', '["5", "6", "7", "8"]', '6', 2, 15, '3-6', arithmetic_category_id, 30),
    
    -- Simple Subtraction
    (math_subject_id, 'What is 3 - 1?', '["1", "2", "3", "4"]', '2', 2, 15, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'What is 5 - 2?', '["2", "3", "4", "5"]', '3', 2, 15, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'What is 4 - 1?', '["2", "3", "4", "5"]', '3', 2, 15, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'What is 6 - 3?', '["2", "3", "4", "5"]', '3', 2, 15, '3-6', arithmetic_category_id, 30),
    
    -- Basic Shapes and Patterns
    (math_subject_id, 'How many sides does a triangle have?', '["2", "3", "4", "5"]', '3', 2, 15, '3-6', geometry_category_id, 30),
    (math_subject_id, 'How many sides does a square have?', '["3", "4", "5", "6"]', '4', 2, 15, '3-6', geometry_category_id, 30),
    (math_subject_id, 'Which shape is round?', '["Square", "Triangle", "Circle", "Rectangle"]', 'Circle', 2, 15, '3-6', geometry_category_id, 25);

    -- Ages 7-10: Elementary Math (Difficulty 2-3)
    
    -- Addition and Subtraction
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'What is 15 + 8?', '["21", "22", "23", "24"]', '23', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 27 + 16?', '["41", "42", "43", "44"]', '43', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 34 + 29?', '["61", "62", "63", "64"]', '63', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 56 + 37?', '["91", "92", "93", "94"]', '93', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 25 - 9?', '["14", "15", "16", "17"]', '16', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 42 - 18?', '["22", "23", "24", "25"]', '24', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 73 - 26?', '["45", "46", "47", "48"]', '47', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 91 - 35?', '["54", "55", "56", "57"]', '56', 3, 25, '7-10', arithmetic_category_id, 50),
    
    -- Multiplication Tables
    (math_subject_id, 'What is 3 × 4?', '["10", "11", "12", "13"]', '12', 2, 20, '7-10', arithmetic_category_id, 40),
    (math_subject_id, 'What is 5 × 6?', '["28", "29", "30", "31"]', '30', 2, 20, '7-10', arithmetic_category_id, 40),
    (math_subject_id, 'What is 7 × 8?', '["54", "55", "56", "57"]', '56', 3, 25, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 9 × 6?', '["52", "53", "54", "55"]', '54', 3, 25, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 8 × 7?', '["54", "55", "56", "57"]', '56', 3, 25, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 9 × 9?', '["79", "80", "81", "82"]', '81', 3, 25, '7-10', arithmetic_category_id, 45),
    
    -- Division
    (math_subject_id, 'What is 24 ÷ 6?', '["3", "4", "5", "6"]', '4', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 35 ÷ 7?', '["4", "5", "6", "7"]', '5', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 48 ÷ 8?', '["5", "6", "7", "8"]', '6', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 63 ÷ 9?', '["6", "7", "8", "9"]', '7', 3, 25, '7-10', arithmetic_category_id, 50),
    
    -- Word Problems
    (math_subject_id, 'Sarah has 12 stickers. She gives 5 to her friend. How many does she have left?', '["6", "7", "8", "9"]', '7', 3, 30, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'There are 8 birds in a tree. 3 more birds join them. How many birds are there now?', '["10", "11", "12", "13"]', '11', 3, 30, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'A box has 6 rows of eggs with 4 eggs in each row. How many eggs are there?', '["22", "23", "24", "25"]', '24', 3, 30, '7-10', arithmetic_category_id, 60),
    
    -- Fractions (Basic)
    (math_subject_id, 'What is 1/2 of 8?', '["3", "4", "5", "6"]', '4', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 1/4 of 12?', '["2", "3", "4", "5"]', '3', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'Which fraction is larger: 1/2 or 1/4?', '["1/2", "1/4", "They are equal", "Cannot tell"]', '1/2', 3, 25, '7-10', arithmetic_category_id, 45),
    
    -- Geometry
    (math_subject_id, 'What is the perimeter of a square with sides of 5 cm?', '["15 cm", "20 cm", "25 cm", "30 cm"]', '20 cm', 3, 30, '7-10', geometry_category_id, 60),
    (math_subject_id, 'How many corners does a rectangle have?', '["3", "4", "5", "6"]', '4', 2, 20, '7-10', geometry_category_id, 40);

    -- Ages 11-14: Middle School Math (Difficulty 3-4)
    
    -- Advanced Arithmetic
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'What is 127 + 89 + 156?', '["370", "371", "372", "373"]', '372', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'What is 456 - 178?', '["276", "277", "278", "279"]', '278', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'What is 23 × 17?', '["389", "390", "391", "392"]', '391', 3, 30, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'What is 684 ÷ 12?', '["55", "56", "57", "58"]', '57', 3, 30, '11-14', arithmetic_category_id, 75),
    
    -- Fractions and Decimals
    (math_subject_id, 'What is 2/3 + 1/6?', '["3/6", "4/6", "5/6", "6/6"]', '5/6', 4, 35, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'What is 3/4 - 1/8?', '["5/8", "6/8", "7/8", "8/8"]', '5/8', 4, 35, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'What is 0.25 + 0.75?', '["0.9", "1.0", "1.1", "1.2"]', '1.0', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'What is 2.5 × 4?', '["9", "10", "11", "12"]', '10', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'Convert 3/5 to a decimal', '["0.4", "0.5", "0.6", "0.7"]', '0.6', 4, 35, '11-14', arithmetic_category_id, 75),
    
    -- Percentages
    (math_subject_id, 'What is 25% of 80?', '["15", "20", "25", "30"]', '20', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'What is 15% of 200?', '["25", "30", "35", "40"]', '30', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'If 60% of students passed a test, and there are 150 students, how many passed?', '["85", "90", "95", "100"]', '90', 4, 40, '11-14', arithmetic_category_id, 90),
    
    -- Algebra (Basic)
    (math_subject_id, 'Solve for x: x + 7 = 15', '["6", "7", "8", "9"]', '8', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'Solve for x: 3x = 21', '["6", "7", "8", "9"]', '7', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'Solve for x: 2x + 5 = 13', '["3", "4", "5", "6"]', '4', 4, 40, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'What is the value of 2x + 3 when x = 4?', '["9", "10", "11", "12"]', '11', 4, 35, '11-14', arithmetic_category_id, 75),
    
    -- Geometry (Advanced)
    (math_subject_id, 'What is the area of a rectangle with length 12 cm and width 8 cm?', '["88 cm²", "92 cm²", "96 cm²", "100 cm²"]', '96 cm²', 3, 30, '11-14', geometry_category_id, 75),
    (math_subject_id, 'What is the area of a triangle with base 10 cm and height 6 cm?', '["25 cm²", "30 cm²", "35 cm²", "40 cm²"]', '30 cm²', 4, 35, '11-14', geometry_category_id, 90),
    (math_subject_id, 'What is the circumference of a circle with radius 5 cm? (Use π ≈ 3.14)', '["31.4 cm", "15.7 cm", "78.5 cm", "25 cm"]', '31.4 cm', 4, 40, '11-14', geometry_category_id, 90),
    (math_subject_id, 'What is the volume of a cube with side length 4 cm?', '["48 cm³", "56 cm³", "64 cm³", "72 cm³"]', '64 cm³', 4, 40, '11-14', geometry_category_id, 90),
    
    -- Ratios and Proportions
    (math_subject_id, 'If 3 apples cost $2, how much do 9 apples cost?', '["$4", "$5", "$6", "$7"]', '$6', 4, 35, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'A recipe calls for 2 cups of flour for 12 cookies. How much flour for 18 cookies?', '["2.5 cups", "3 cups", "3.5 cups", "4 cups"]', '3 cups', 4, 40, '11-14', arithmetic_category_id, 90);

    -- Ages 15-18: High School Math (Difficulty 4-5)
    
    -- Advanced Algebra
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'Solve: x² - 5x + 6 = 0', '["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = 2, -3"]', 'x = 2, 3', 5, 50, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'Simplify: (x + 3)(x - 2)', '["x² + x - 6", "x² - x + 6", "x² + x + 6", "x² - x - 6"]', 'x² + x - 6', 4, 40, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'What is the slope of the line passing through (2, 3) and (6, 11)?', '["1", "2", "3", "4"]', '2', 4, 40, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'Solve for x: 2^x = 32', '["4", "5", "6", "7"]', '5', 4, 40, '15-18', arithmetic_category_id, 90),
    
    -- Functions
    (math_subject_id, 'If f(x) = 2x + 3, what is f(5)?', '["11", "12", "13", "14"]', '13', 4, 35, '15-18', arithmetic_category_id, 75),
    (math_subject_id, 'What is the domain of f(x) = 1/(x-2)?', '["All real numbers", "x ≠ 2", "x > 2", "x < 2"]', 'x ≠ 2', 5, 45, '15-18', arithmetic_category_id, 100),
    
    -- Trigonometry
    (math_subject_id, 'What is sin(30°)?', '["1/2", "√2/2", "√3/2", "1"]', '1/2', 4, 40, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'What is cos(60°)?', '["1/2", "√2/2", "√3/2", "1"]', '1/2', 4, 40, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'In a right triangle, if the opposite side is 3 and the hypotenuse is 5, what is sin(θ)?', '["3/4", "3/5", "4/5", "5/3"]', '3/5', 5, 45, '15-18', arithmetic_category_id, 100),
    
    -- Advanced Geometry
    (math_subject_id, 'What is the surface area of a sphere with radius 3? (Use π ≈ 3.14)', '["113.04", "28.26", "37.68", "56.52"]', '113.04', 5, 50, '15-18', geometry_category_id, 120),
    (math_subject_id, 'What is the distance between points (1, 2) and (4, 6)?', '["3", "4", "5", "6"]', '5', 4, 40, '15-18', geometry_category_id, 90),
    
    -- Statistics and Probability
    (math_subject_id, 'What is the mean of: 2, 4, 6, 8, 10?', '["5", "6", "7", "8"]', '6', 3, 30, '15-18', arithmetic_category_id, 60),
    (math_subject_id, 'What is the probability of rolling a 6 on a fair die?', '["1/4", "1/5", "1/6", "1/7"]', '1/6', 4, 35, '15-18', arithmetic_category_id, 75),
    (math_subject_id, 'In a normal distribution, what percentage of data falls within one standard deviation?', '["68%", "75%", "85%", "95%"]', '68%', 5, 45, '15-18', arithmetic_category_id, 100);

END $$;