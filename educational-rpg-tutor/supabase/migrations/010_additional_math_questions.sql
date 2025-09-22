-- Additional Comprehensive Mathematics Questions
-- This migration adds more math questions with focus on word problems and practical applications

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

    -- More Ages 3-6 Questions: Fun and Visual Math
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'If you have 2 cookies and eat 1, how many are left?', '["0", "1", "2", "3"]', '1', 1, 10, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'Count the balloons: 🎈🎈🎈🎈', '["3", "4", "5", "6"]', '4', 1, 10, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'Which number is bigger: 3 or 7?', '["3", "7", "Same", "Cannot tell"]', '7', 1, 10, '3-6', arithmetic_category_id, 20),
    (math_subject_id, 'Which number is smaller: 5 or 2?', '["5", "2", "Same", "Cannot tell"]', '2', 1, 10, '3-6', arithmetic_category_id, 20),
    (math_subject_id, 'How many wheels does a car have?', '["2", "3", "4", "5"]', '4', 1, 10, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'If you have 3 toys and get 2 more, how many toys do you have?', '["4", "5", "6", "7"]', '5', 2, 15, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'Count backwards from 5: 5, 4, 3, 2, ?', '["0", "1", "6", "7"]', '1', 2, 15, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'How many eyes do you have?', '["1", "2", "3", "4"]', '2', 1, 10, '3-6', arithmetic_category_id, 20),
    (math_subject_id, 'What comes between 4 and 6?', '["3", "5", "7", "8"]', '5', 2, 15, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'If you see 6 birds and 2 fly away, how many are left?', '["3", "4", "5", "6"]', '4', 2, 15, '3-6', arithmetic_category_id, 35),
    
    -- More Ages 7-10 Questions: Practical Applications
    (math_subject_id, 'A pizza is cut into 8 slices. If you eat 3 slices, how many are left?', '["4", "5", "6", "7"]', '5', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'There are 24 students in a class. If they form groups of 4, how many groups are there?', '["5", "6", "7", "8"]', '6', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'A book has 120 pages. If you read 15 pages each day, how many days to finish?', '["6", "7", "8", "9"]', '8', 3, 30, '7-10', arithmetic_category_id, 75),
    (math_subject_id, 'What is 100 - 37?', '["61", "62", "63", "64"]', '63', 2, 20, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'Round 67 to the nearest 10', '["60", "70", "65", "75"]', '70', 3, 25, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 6 × 9?', '["52", "53", "54", "55"]', '54', 3, 25, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is 72 ÷ 9?', '["7", "8", "9", "10"]', '8', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'If a toy costs $8 and you have $20, how much change will you get?', '["$10", "$11", "$12", "$13"]', '$12', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'What time is it 2 hours after 3:30?', '["5:30", "6:30", "4:30", "5:00"]', '5:30', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'How many minutes are in 2 hours?', '["100", "110", "120", "130"]', '120', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'A rectangle has length 6 cm and width 4 cm. What is its area?', '["20 cm²", "22 cm²", "24 cm²", "26 cm²"]', '24 cm²', 3, 30, '7-10', geometry_category_id, 60),
    (math_subject_id, 'How many edges does a cube have?', '["8", "10", "12", "14"]', '12', 3, 25, '7-10', geometry_category_id, 50),
    (math_subject_id, 'What is 1/3 of 15?', '["4", "5", "6", "7"]', '5', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'Which is equivalent to 2/4?', '["1/2", "1/3", "3/4", "2/3"]', '1/2', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'If you buy 3 packs of stickers with 8 stickers each, how many stickers total?', '["21", "22", "23", "24"]', '24', 3, 30, '7-10', arithmetic_category_id, 60),
    
    -- More Ages 11-14 Questions: Real-world Applications
    (math_subject_id, 'A store offers 20% off a $50 item. What is the sale price?', '["$35", "$40", "$45", "$48"]', '$40', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'If you save $15 per week, how much will you have after 8 weeks?', '["$110", "$115", "$120", "$125"]', '$120', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'A car travels 240 miles in 4 hours. What is its average speed?', '["55 mph", "60 mph", "65 mph", "70 mph"]', '60 mph', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'What is 3/8 + 1/4? (Express as a fraction)', '["4/12", "5/8", "7/12", "1/2"]', '5/8', 4, 35, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'Convert 7/8 to a decimal', '["0.825", "0.875", "0.925", "0.975"]', '0.875', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'What is 40% of 150?', '["50", "55", "60", "65"]', '60', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'Solve for y: 4y - 7 = 17', '["5", "6", "7", "8"]', '6', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'What is the area of a circle with radius 4 cm? (Use π ≈ 3.14)', '["50.24 cm²", "25.12 cm²", "12.56 cm²", "100.48 cm²"]', '50.24 cm²', 4, 40, '11-14', geometry_category_id, 90),
    (math_subject_id, 'A triangle has angles of 60° and 70°. What is the third angle?', '["40°", "45°", "50°", "55°"]', '50°', 4, 35, '11-14', geometry_category_id, 75),
    (math_subject_id, 'What is the square root of 144?', '["10", "11", "12", "13"]', '12', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'If 5x + 3 = 28, what is x?', '["4", "5", "6", "7"]', '5', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'What is 2³ × 3²?', '["70", "71", "72", "73"]', '72', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'A recipe for 4 people uses 2 cups of flour. How much for 10 people?', '["4 cups", "4.5 cups", "5 cups", "5.5 cups"]', '5 cups', 4, 35, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'What is the median of: 3, 7, 2, 9, 5?', '["4", "5", "6", "7"]', '5', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'If a right triangle has legs of 3 and 4, what is the hypotenuse?', '["5", "6", "7", "8"]', '5', 4, 40, '11-14', geometry_category_id, 90),
    
    -- More Ages 15-18 Questions: Advanced Concepts
    (math_subject_id, 'Solve: x² + 6x + 9 = 0', '["x = -3", "x = 3", "x = -3, 3", "No solution"]', 'x = -3', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is the derivative of f(x) = x³?', '["3x²", "x²", "3x", "x³"]', '3x²', 5, 50, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'What is log₂(8)?', '["2", "3", "4", "5"]', '3', 4, 40, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'If f(x) = x² - 4x + 3, what is the vertex of the parabola?', '["(2, -1)", "(2, 1)", "(-2, -1)", "(-2, 1)"]', '(2, -1)', 5, 50, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'What is tan(45°)?', '["0", "1/2", "1", "√3"]', '1', 4, 40, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'Solve the system: x + y = 5, x - y = 1', '["x=3, y=2", "x=2, y=3", "x=4, y=1", "x=1, y=4"]', 'x=3, y=2', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is the sum of the arithmetic sequence: 2, 5, 8, 11, 14?', '["35", "38", "40", "42"]', '40', 4, 40, '15-18', arithmetic_category_id, 90),
    (math_subject_id, 'What is the area under the curve y = x² from x = 0 to x = 2?', '["8/3", "4", "16/3", "8"]', '8/3', 5, 50, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'In how many ways can 5 people be arranged in a line?', '["60", "100", "120", "150"]', '120', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is the standard deviation of: 2, 4, 6, 8, 10?', '["2.83", "3.16", "3.46", "4.00"]', '3.16', 5, 50, '15-18', arithmetic_category_id, 120),
    
    -- Money and Practical Math (All Ages)
    (math_subject_id, 'How many pennies equal one dime?', '["5", "10", "15", "20"]', '10', 2, 15, '7-10', arithmetic_category_id, 40),
    (math_subject_id, 'If you have 2 quarters, 3 dimes, and 5 pennies, how much money do you have?', '["75¢", "80¢", "85¢", "90¢"]', '85¢', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'A shirt costs $25. With 8% tax, what is the total cost?', '["$26", "$27", "$28", "$29"]', '$27', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'If you invest $1000 at 5% annual interest, how much after 1 year?', '["$1040", "$1050", "$1060", "$1070"]', '$1050', 4, 40, '15-18', arithmetic_category_id, 90),
    
    -- Time and Calendar Math
    (math_subject_id, 'How many days are in February during a leap year?', '["28", "29", "30", "31"]', '29', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'If today is Wednesday, what day will it be in 10 days?', '["Friday", "Saturday", "Sunday", "Monday"]', 'Saturday', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'How many seconds are in 5 minutes?', '["250", "300", "350", "400"]', '300', 3, 25, '11-14', arithmetic_category_id, 60),
    
    -- Measurement and Units
    (math_subject_id, 'How many centimeters are in 1 meter?', '["10", "50", "100", "1000"]', '100', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'How many grams are in 2.5 kilograms?', '["250", "2500", "25000", "250000"]', '2500', 3, 30, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'Convert 5 feet to inches', '["50", "55", "60", "65"]', '60', 3, 25, '11-14', arithmetic_category_id, 60);

END $$;