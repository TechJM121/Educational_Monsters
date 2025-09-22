-- Number Theory, Patterns, and Logic
-- This migration focuses on number patterns, sequences, and mathematical reasoning

DO $$ 
DECLARE
    math_subject_id UUID;
    arithmetic_category_id UUID;
BEGIN
    -- Get subject and category IDs
    SELECT id INTO math_subject_id FROM public.subjects WHERE name = 'Mathematics';
    SELECT id INTO arithmetic_category_id FROM public.question_categories WHERE name = 'Basic Arithmetic';

    -- Ages 3-6: Simple Patterns and Number Recognition
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'What comes next: 1, 2, 3, ?', '["4", "5", "6", "1"]', '4', 1, 10, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'What comes next: red, blue, red, blue, ?', '["red", "blue", "green", "yellow"]', 'red', 2, 15, '3-6', arithmetic_category_id, 35),
    (math_subject_id, 'Count by 2s: 2, 4, 6, ?', '["7", "8", "9", "10"]', '8', 2, 15, '3-6', arithmetic_category_id, 35),
    (math_subject_id, 'Which number is missing: 1, 2, _, 4, 5?', '["2", "3", "4", "6"]', '3', 1, 10, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'What comes next: big, small, big, small, ?', '["big", "small", "medium", "tiny"]', 'big', 2, 15, '3-6', arithmetic_category_id, 35),
    (math_subject_id, 'Count backwards: 5, 4, 3, ?', '["1", "2", "6", "0"]', '2', 2, 15, '3-6', arithmetic_category_id, 35),
    (math_subject_id, 'What number comes between 7 and 9?', '["6", "7", "8", "10"]', '8', 1, 10, '3-6', arithmetic_category_id, 25),
    (math_subject_id, 'Pattern: ○○●○○●○○?', '["○", "●", "◐", "□"]', '●', 2, 15, '3-6', arithmetic_category_id, 40),
    (math_subject_id, 'Which is the odd one out: 2, 4, 5, 6?', '["2", "4", "5", "6"]', '5', 2, 15, '3-6', arithmetic_category_id, 40),
    (math_subject_id, 'What comes next: A, B, C, ?', '["D", "E", "F", "A"]', 'D', 1, 10, '3-6', arithmetic_category_id, 30),

    -- Ages 7-10: Number Patterns and Basic Logic
    (math_subject_id, 'What comes next: 5, 10, 15, 20, ?', '["22", "24", "25", "30"]', '25', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'Find the pattern: 3, 6, 9, 12, ?', '["14", "15", "16", "18"]', '15', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What comes next: 1, 4, 7, 10, ?', '["12", "13", "14", "15"]', '13', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'Complete the sequence: 2, 4, 8, 16, ?', '["24", "28", "30", "32"]', '32', 3, 25, '7-10', arithmetic_category_id, 55),
    (math_subject_id, 'What is the rule for: 1, 3, 5, 7, 9?', '["Add 2", "Add 3", "Multiply by 2", "Add 1"]', 'Add 2', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'Find the missing number: 10, 20, __, 40, 50', '["25", "30", "35", "45"]', '30', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What comes next: 100, 90, 80, 70, ?', '["50", "55", "60", "65"]', '60', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'Pattern: 1, 1, 2, 3, 5, 8, ?', '["11", "12", "13", "15"]', '13', 3, 30, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'Which numbers are even: 12, 15, 18, 21?', '["12, 18", "15, 21", "12, 15", "18, 21"]', '12, 18', 3, 25, '7-10', arithmetic_category_id, 50),
    (math_subject_id, 'What comes next: 1, 4, 9, 16, ?', '["20", "24", "25", "30"]', '25', 3, 30, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'Find the pattern: 50, 45, 40, 35, ?', '["25", "28", "30", "32"]', '30', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What is special about: 2, 3, 5, 7, 11?', '["All odd", "All prime", "All even", "All composite"]', 'All prime', 3, 30, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'Complete: 6, 12, 18, 24, ?', '["28", "30", "32", "36"]', '30', 2, 20, '7-10', arithmetic_category_id, 45),
    (math_subject_id, 'What comes next: 64, 32, 16, 8, ?', '["2", "4", "6", "0"]', '4', 3, 25, '7-10', arithmetic_category_id, 55),
    (math_subject_id, 'Find the rule: 7, 14, 21, 28, 35', '["Add 7", "Add 14", "Multiply by 2", "Add 6"]', 'Add 7', 2, 20, '7-10', arithmetic_category_id, 45),

    -- Ages 11-14: Advanced Patterns and Number Theory
    (math_subject_id, 'What is the 10th term in the sequence: 2, 5, 8, 11, ...?', '["26", "28", "29", "32"]', '29', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'Find the sum of first 10 odd numbers', '["90", "95", "100", "105"]', '100', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'What is the greatest common divisor of 48 and 72?', '["12", "16", "20", "24"]', '24', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'What is the least common multiple of 12 and 18?', '["30", "36", "42", "48"]', '36', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'Which number is NOT prime: 17, 19, 21, 23?', '["17", "19", "21", "23"]', '21', 4, 30, '11-14', arithmetic_category_id, 70),
    (math_subject_id, 'What is the nth term formula for: 3, 7, 11, 15, ...?', '["4n - 1", "4n + 1", "3n + 4", "n + 3"]', '4n - 1', 4, 40, '11-14', arithmetic_category_id, 85),
    (math_subject_id, 'Find the sum: 1 + 2 + 3 + ... + 20', '["200", "210", "220", "230"]', '210', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'What comes next in Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, ?', '["18", "19", "20", "21"]', '21', 4, 35, '11-14', arithmetic_category_id, 75),
    (math_subject_id, 'How many factors does 36 have?', '["6", "7", "8", "9"]', '9', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'What is 2⁵?', '["16", "25", "32", "64"]', '32', 3, 25, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'Find the pattern: 1, 8, 27, 64, ?', '["100", "125", "144", "169"]', '125', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'What is the sum of arithmetic series: 2 + 5 + 8 + ... + 29?', '["150", "155", "160", "165"]', '155', 4, 40, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'Which is a perfect square: 48, 49, 50, 51?', '["48", "49", "50", "51"]', '49', 3, 25, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'What is the remainder when 17 is divided by 5?', '["1", "2", "3", "4"]', '2', 3, 25, '11-14', arithmetic_category_id, 60),
    (math_subject_id, 'Find the geometric mean of 4 and 16', '["8", "10", "12", "14"]', '8', 4, 35, '11-14', arithmetic_category_id, 80),

    -- Ages 15-18: Advanced Number Theory and Mathematical Proofs
    (math_subject_id, 'What is the sum of the infinite geometric series: 1 + 1/3 + 1/9 + 1/27 + ...?', '["3/2", "4/3", "5/4", "2"]', '3/2', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'How many integers from 1 to 100 are divisible by both 2 and 3?', '["15", "16", "17", "18"]', '16', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is φ(12) where φ is Euler''s totient function?', '["2", "3", "4", "6"]', '4', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Find the coefficient of x⁵ in the expansion of (1 + x)¹⁰', '["210", "252", "120", "792"]', '252', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'What is the last digit of 3²⁰²³?', '["1", "3", "7", "9"]', '7', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'How many ways can you arrange the letters in MATHEMATICS?', '["4989600", "1663200", "39916800", "2494800"]', '4989600', 5, 55, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'What is the generating function for the sequence 1, 2, 4, 8, 16, ...?', '["1/(1-2x)", "1/(1-x)²", "(1+x)/(1-x)", "1+2x+4x²+..."]', '1/(1-2x)', 5, 55, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'Find the number of solutions to x₁ + x₂ + x₃ = 10 where xᵢ ≥ 0', '["66", "84", "120", "220"]', '66', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'What is the chromatic number of the complete graph K₅?', '["3", "4", "5", "6"]', '5', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'How many primes are there less than 100?', '["23", "24", "25", "26"]', '25', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'What is the value of ∑(k=1 to n) k²?', '["n(n+1)/2", "n(n+1)(2n+1)/6", "n²(n+1)²/4", "n(n+1)(n+2)/6"]', 'n(n+1)(2n+1)/6', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Find the recurrence relation for aₙ = 2ⁿ + 3ⁿ', '["aₙ = 5aₙ₋₁ - 6aₙ₋₂", "aₙ = 6aₙ₋₁ - 5aₙ₋₂", "aₙ = 5aₙ₋₁ + 6aₙ₋₂", "aₙ = 2aₙ₋₁ + 3aₙ₋₂"]', 'aₙ = 5aₙ₋₁ - 6aₙ₋₂', 5, 55, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'What is the Möbius function μ(30)?', '["0", "1", "-1", "2"]', '-1', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'How many derangements are there of 4 objects?', '["8", "9", "10", "11"]', '9', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'What is the value of the Ramsey number R(3,3)?', '["5", "6", "7", "8"]', '6', 5, 50, '15-18', arithmetic_category_id, 110);

END $$;