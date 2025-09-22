-- Math Question Hints and Explanations
-- This migration adds helpful hints and detailed explanations for math questions

DO $$ 
DECLARE
    question_record RECORD;
BEGIN
    -- Add hints for basic arithmetic questions (Ages 3-6)
    
    -- Hints for counting questions
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE question_text LIKE '%Count%' AND age_range = '3-6'
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Point to each item as you count: 1, 2, 3...', 1, 2),
        (question_record.id, 'Use your fingers to help count!', 2, 3);
    END LOOP;
    
    -- Hints for simple addition
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE question_text LIKE '%+%' AND age_range = '3-6'
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Start with the first number and count up!', 1, 2),
        (question_record.id, 'You can use your fingers or draw dots to help.', 2, 3);
    END LOOP;
    
    -- Hints for simple subtraction
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE question_text LIKE '%-%' AND age_range = '3-6'
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Start with the bigger number and count backwards.', 1, 2),
        (question_record.id, 'Think about taking away or removing items.', 2, 3);
    END LOOP;
    
    -- Add hints for elementary math (Ages 7-10)
    
    -- Hints for multiplication
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE question_text LIKE '%×%' AND age_range = '7-10'
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Remember your times tables!', 1, 3),
        (question_record.id, 'You can add the number to itself multiple times.', 2, 5);
    END LOOP;
    
    -- Hints for division
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE question_text LIKE '%÷%' AND age_range = '7-10'
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Think: what number times the divisor equals the dividend?', 1, 3),
        (question_record.id, 'Division is the opposite of multiplication.', 2, 5);
    END LOOP;
    
    -- Hints for word problems
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE (question_text LIKE '%has%' OR question_text LIKE '%buy%' OR question_text LIKE '%cost%') 
        AND age_range IN ('7-10', '11-14')
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Read the problem carefully and identify the numbers.', 1, 3),
        (question_record.id, 'Decide if you need to add, subtract, multiply, or divide.', 2, 5);
    END LOOP;
    
    -- Add hints for middle school math (Ages 11-14)
    
    -- Hints for fractions
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE question_text LIKE '%/%' AND age_range = '11-14'
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Find a common denominator when adding or subtracting fractions.', 1, 5),
        (question_record.id, 'Remember: multiply across for fraction multiplication.', 2, 7);
    END LOOP;
    
    -- Hints for percentages
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE question_text LIKE '%percent%' OR question_text LIKE '%\%%' AND age_range = '11-14'
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Convert the percentage to a decimal by dividing by 100.', 1, 5),
        (question_record.id, 'Then multiply by the number to find the percentage of it.', 2, 7);
    END LOOP;
    
    -- Hints for basic algebra
    FOR question_record IN 
        SELECT id FROM public.questions 
        WHERE question_text LIKE '%x%' AND question_text LIKE '%=%' AND age_range = '11-14'
    LOOP
        INSERT INTO public.question_hints (question_id, hint_text, hint_order, xp_penalty) VALUES
        (question_record.id, 'Do the same operation to both sides of the equation.', 1, 5),
        (question_record.id, 'Try to get x by itself on one side.', 2, 7);
    END LOOP;
    
    -- Add explanations for various question types
    
    -- Explanations for basic addition
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id, 
           'When we add numbers, we combine them together. For example, 2 + 3 means we start with 2 and add 3 more, giving us 5 total.',
           'general'
    FROM public.questions 
    WHERE question_text = 'What is 2 + 3?' AND age_range = '3-6';
    
    -- Explanations for multiplication
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'Multiplication is repeated addition. 7 × 8 means adding 7 eight times: 7+7+7+7+7+7+7+7 = 56. Learning times tables helps you solve these quickly!',
           'correct'
    FROM public.questions 
    WHERE question_text = 'What is 7 × 8?' AND age_range = '7-10';
    
    -- Explanations for area calculations
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'To find the area of a rectangle, multiply length × width. Area tells us how much space is inside the shape. The answer is in square units (like cm²).',
           'correct'
    FROM public.questions 
    WHERE question_text LIKE '%area of a rectangle%' AND age_range = '7-10';
    
    -- Explanations for fractions
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'When adding fractions, you need a common denominator. 2/3 + 1/6: Convert 2/3 to 4/6, then add: 4/6 + 1/6 = 5/6.',
           'correct'
    FROM public.questions 
    WHERE question_text = 'What is 2/3 + 1/6?' AND age_range = '11-14';
    
    -- Explanations for percentages
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'To find 25% of 80: Convert 25% to 0.25 (25 ÷ 100), then multiply: 0.25 × 80 = 20. Percent means "per hundred".',
           'correct'
    FROM public.questions 
    WHERE question_text = 'What is 25% of 80?' AND age_range = '11-14';
    
    -- Explanations for basic algebra
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'To solve x + 7 = 15: Subtract 7 from both sides. x + 7 - 7 = 15 - 7, so x = 8. Always do the same operation to both sides!',
           'correct'
    FROM public.questions 
    WHERE question_text = 'Solve for x: x + 7 = 15' AND age_range = '11-14';
    
    -- Explanations for geometry
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'A triangle always has 3 sides and 3 angles. The sum of all angles in any triangle is always 180°. This is a fundamental rule in geometry.',
           'correct'
    FROM public.questions 
    WHERE question_text = 'How many sides does a triangle have?' AND age_range = '3-6';
    
    -- Explanations for advanced concepts
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'To factor x² - 5x + 6: Look for two numbers that multiply to 6 and add to -5. Those are -2 and -3. So x² - 5x + 6 = (x - 2)(x - 3) = 0, giving x = 2 or x = 3.',
           'correct'
    FROM public.questions 
    WHERE question_text = 'Solve: x² - 5x + 6 = 0' AND age_range = '15-18';
    
    -- Add some incorrect answer explanations
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'Remember that when subtracting, you take away from the first number. If you got a larger number, you might have added instead of subtracted.',
           'incorrect'
    FROM public.questions 
    WHERE question_text LIKE '%-%' AND age_range = '3-6'
    LIMIT 5;
    
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'When multiplying fractions, you multiply the numerators together and the denominators together. You don''t need a common denominator for multiplication.',
           'incorrect'
    FROM public.questions 
    WHERE question_text LIKE '%×%' AND question_text LIKE '%/%' AND age_range = '11-14'
    LIMIT 3;
    
    -- Add general learning tips
    INSERT INTO public.question_explanations (question_id, explanation_text, explanation_type)
    SELECT id,
           'Math builds on itself - each concept connects to others. Don''t worry if it takes practice to understand. Every mathematician started as a beginner!',
           'general'
    FROM public.questions 
    WHERE age_range = '7-10'
    LIMIT 10;

END $$;