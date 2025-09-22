-- Advanced Mathematics Topics
-- This migration adds questions for advanced math concepts across all age groups

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

    -- Ages 3-6: More Basic Concepts and Patterns
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'What comes next in the pattern: 2, 4, 6, ?', '["7", "8", "9", "10"]', '8', 2, 15, '3-6', arithmetic_category_id, 35),
    (math_subject_id, 'Which group has MORE? Group A: 🐶🐶🐶 Group B: 🐱🐱', '["Group A", "Group B", "Same", "Cannot tell"]', 'Group A', 1, 10, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'Which number is the BIGGEST: 1, 5, 3?', '["1", "3", "5", "They are all the same"]', '5', 1, 10, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'Count by 2s: 2, 4, 6, ?', '["7", "8", "9", "10"]', '8', 2, 15, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'If you have 4 crayons and lose 2, how many do you have?', '["1", "2", "3", "6"]', '2', 2, 15, '3-6', arithmetic_category_id, 35),
    (math_subject_id, 'How many legs do 2 cats have in total?', '["6", "8", "10", "12"]', '8', 2, 15, '3-6', arithmetic_category_id, 40),
    (math_subject_id, 'What shape has NO corners?', '["Square", "Triangle", "Circle", "Rectangle"]', 'Circle', 2, 15, '3-6', geometry_category_id, 30),
    (math_subject_id, 'Which is longer: your arm or your finger?', '["Arm", "Finger", "Same length", "Cannot tell"]', 'Arm', 1, 10, '3-6', geometry_category_id, 25),
    (math_subject_id, 'How many sides does a rectangle have?', '["2", "3", "4", "5"]', '4', 2, 15, '3-6', geometry_category_id, 30),
    (math_subject_id, 'If today is your birthday and you turn 5, how old were you yesterday?', '["3", "4", "5", "6"]', '4', 2, 15, '3-6', arithmetic_category_id, 40),

    -- Ages 7-10: More Complex Operations and Problem Solving
    (math_subject_id, 'What is 15 + 27 + 8?', '["48", "49", "50", "51"]', '50', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'What is 100 - 47?', '["51", "52", "53", "54"]', '53', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 12 × 11?', '["130", "131", "132", "133"]', '132', 3, 30, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'What is 96 ÷ 8?', '["11", "12", "13", "14"]', '12', 3, 25, '7-10', arithmetic_category_id, 55),
    (math_subject_id, 'Round 347 to the nearest hundred', '["300", "350", "400", "340"]', '300', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What is 2/3 of 18?', '["10", "11", "12", "13"]', '12', 3, 30, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'A train travels 60 miles in 2 hours. How far in 1 hour?', '["25 miles", "30 miles", "35 miles", "40 miles"]', '30 miles', 3, 30, '7-10', arithmetic_category_id, 75),
    (math_subject_id, 'What is the perimeter of a triangle with sides 5, 7, and 8?', '["18", "19", "20", "21"]', '20', 3, 30, '7-10', geometry_category_id, 70),
    (math_subject_id, 'How many faces does a cube have?', '["4", "5", "6", "8"]', '6', 3, 25, '7-10', geometry_category_id, 50),
    (math_subject_id, 'If a square has a perimeter of 20 cm, what is the length of each side?', '["4 cm", "5 cm", "6 cm", "10 cm"]', '5 cm', 3, 30, '7-10', geometry_category_id, 70),
    (math_subject_id, 'What comes next: 5, 10, 15, 20, ?', '["22", "24", "25", "30"]', '25', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'A pizza has 12 slices. If 3/4 of it is eaten, how many slices are left?', '["2", "3", "4", "9"]', '3', 3, 30, '7-10', arithmetic_category_id, 75),
    (math_subject_id, 'What is 0.5 + 0.3?', '["0.7", "0.8", "0.9", "1.0"]', '0.8', 3, 25, '7-10', arithmetic_category_id, 55),
    (math_subject_id, 'How many degrees are in a right angle?', '["45°", "60°", "90°", "180°"]', '90°', 3, 25, '7-10', geometry_category_id, 50),
    (math_subject_id, 'If you buy 4 packs of gum with 5 pieces each, how many pieces total?', '["15", "18", "20", "25"]', '20', 3, 25, '7-10', arithmetic_category_id, 60),

    -- Ages 11-14: Advanced Problem Solving and Pre-Algebra
    (math_subject_id, 'What is 2.7 × 1.5?', '["4.05", "4.15", "4.25", "4.35"]', '4.05', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'What is 7/12 + 5/12?', '["11/12", "12/12", "1", "12/24"]', '1', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'Solve: 3x - 8 = 19', '["8", "9", "10", "11"]', '9', 4, 40, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'What is 35% of 140?', '["47", "48", "49", "50"]', '49', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'What is the square root of 169?', '["12", "13", "14", "15"]', '13', 4, 35, '11-14', arithmetic_category_id, 70),
    (math_subject_id, 'If y = 2x + 5 and x = 3, what is y?', '["9", "10", "11", "12"]', '11', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'What is the area of a circle with diameter 10? (Use π ≈ 3.14)', '["78.5", "31.4", "314", "157"]', '78.5', 4, 40, '11-14', geometry_category_id, 90),
    (math_subject_id, 'Convert 5/8 to a percentage', '["60%", "62.5%", "65%", "67.5%"]', '62.5%', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'What is 4² + 3²?', '["20", "23", "25", "28"]', '25', 4, 35, '11-14', arithmetic_category_id, 70),
    (math_subject_id, 'A rectangle has area 48 and width 6. What is its length?', '["6", "7", "8", "9"]', '8', 4, 35, '11-14', geometry_category_id, 80),
    (math_subject_id, 'What is the slope of a line through (1,2) and (3,8)?', '["2", "3", "4", "6"]', '3', 4, 40, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'Simplify: 2(x + 3) - 4', '["2x + 2", "2x + 6", "2x - 1", "2x + 10"]', '2x + 2', 4, 40, '11-14', arithmetic_category_id, 85),
    (math_subject_id, 'What is 20% of 20% of 100?', '["2", "4", "8", "20"]', '4', 4, 40, '11-14', arithmetic_category_id, 85),
    (math_subject_id, 'If a triangle has angles 45° and 60°, what is the third angle?', '["70°", "75°", "80°", "85°"]', '75°', 4, 35, '11-14', geometry_category_id, 80),
    (math_subject_id, 'What is the volume of a rectangular prism: 4×3×5?', '["50", "55", "60", "65"]', '60', 4, 35, '11-14', geometry_category_id, 80),

    -- Ages 15-18: Advanced High School Mathematics
    (math_subject_id, 'Solve: x² + 4x - 5 = 0', '["x = 1, -5", "x = -1, 5", "x = 2, -3", "x = -2, 3"]', 'x = 1, -5', 5, 50, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'What is the derivative of f(x) = 3x² + 2x - 1?', '["6x + 2", "3x + 2", "6x - 1", "3x² + 2"]', '6x + 2', 5, 50, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is log₃(27)?', '["2", "3", "4", "9"]', '3', 5, 45, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'Evaluate: ∫(2x + 3)dx', '["x² + 3x + C", "2x² + 3x + C", "x² + 3x", "2x + 3x + C"]', 'x² + 3x + C', 5, 55, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'What is sin²(x) + cos²(x)?', '["0", "1", "2", "sin(2x)"]', '1', 5, 45, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'Find the limit: lim(x→2) (x² - 4)/(x - 2)', '["2", "4", "0", "undefined"]', '4', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'What is the equation of a line with slope 2 passing through (1,3)?', '["y = 2x + 1", "y = 2x - 1", "y = 2x + 3", "y = x + 2"]', 'y = 2x + 1', 4, 40, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'Solve the system: 2x + y = 7, x - y = 2', '["x=3, y=1", "x=2, y=3", "x=1, y=5", "x=4, y=-1"]', 'x=3, y=1', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is the sum of the infinite series: 1 + 1/2 + 1/4 + 1/8 + ...?', '["1", "2", "3", "∞"]', '2', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'What is the area between y = x² and y = 4 from x = -2 to x = 2?', '["32/3", "16/3", "8", "16"]', '32/3', 5, 55, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'If f(x) = e^x, what is f''(x)?', '["e^x", "xe^x", "e^(x-1)", "2e^x"]', 'e^x', 5, 50, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is the period of f(x) = sin(2x)?', '["π/2", "π", "2π", "4π"]', 'π', 5, 45, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'Find the inverse of f(x) = 2x + 3', '["f⁻¹(x) = (x-3)/2", "f⁻¹(x) = (x+3)/2", "f⁻¹(x) = 2x-3", "f⁻¹(x) = x/2-3"]', 'f⁻¹(x) = (x-3)/2', 5, 50, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is the discriminant of x² - 6x + 9?', '["0", "12", "36", "-12"]', '0', 5, 45, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'What is cot(π/4)?', '["0", "1", "√2", "undefined"]', '1', 5, 45, '15-18', arithmetic_category_id, 90);

END $$;