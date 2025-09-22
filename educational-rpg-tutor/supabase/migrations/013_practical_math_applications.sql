-- Practical Mathematics Applications
-- This migration focuses on real-world math problems and applications

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

    -- Ages 3-6: Everyday Math Situations
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'You have 3 cookies. Your friend gives you 2 more. How many cookies do you have now?', '["4", "5", "6", "7"]', '5', 2, 15, '3-6', arithmetic_category_id, 40),
    (math_subject_id, 'There are 6 birds on a tree. 2 birds fly away. How many birds are left?', '["3", "4", "5", "8"]', '4', 2, 15, '3-6', arithmetic_category_id, 40),
    (math_subject_id, 'Mom buys 8 apples. The family eats 3. How many apples are left?', '["4", "5", "6", "11"]', '5', 2, 15, '3-6', arithmetic_category_id, 45),
    (math_subject_id, 'You see 2 dogs. Each dog has 4 legs. How many legs in total?', '["6", "7", "8", "9"]', '8', 2, 15, '3-6', arithmetic_category_id, 40),
    (math_subject_id, 'A box has 10 crayons. You use 4 crayons. How many are left in the box?', '["5", "6", "7", "14"]', '6', 2, 15, '3-6', arithmetic_category_id, 40),
    (math_subject_id, 'You have 2 hands. How many fingers do you have in total?', '["8", "9", "10", "12"]', '10', 1, 10, '3-6', arithmetic_category_id, 30),
    (math_subject_id, 'A car has 4 wheels. How many wheels do 2 cars have?', '["6", "7", "8", "9"]', '8', 2, 15, '3-6', arithmetic_category_id, 40),
    (math_subject_id, 'You stack 3 blocks, then add 2 more blocks. How many blocks total?', '["4", "5", "6", "1"]', '5', 2, 15, '3-6', arithmetic_category_id, 35),
    (math_subject_id, 'There are 7 ducks in a pond. 3 ducks swim away. How many ducks are still in the pond?', '["3", "4", "5", "10"]', '4', 2, 15, '3-6', arithmetic_category_id, 45),
    (math_subject_id, 'You have 1 toy car. Your dad gives you 3 more toy cars. How many toy cars do you have?', '["3", "4", "5", "2"]', '4', 2, 15, '3-6', arithmetic_category_id, 40),

    -- Ages 7-10: School and Home Math Problems
    (math_subject_id, 'A classroom has 6 rows of desks with 4 desks in each row. How many desks total?', '["20", "22", "24", "26"]', '24', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'Sarah saves $5 each week. How much will she have after 8 weeks?', '["$35", "$40", "$45", "$50"]', '$40', 3, 30, '7-10', arithmetic_category_id, 70),
    (math_subject_id, 'A recipe needs 3 cups of flour. You want to make 4 batches. How much flour total?', '["10 cups", "11 cups", "12 cups", "13 cups"]', '12 cups', 3, 25, '7-10', arithmetic_category_id, 65),
    (math_subject_id, 'A movie starts at 2:15 PM and lasts 90 minutes. What time does it end?', '["3:30 PM", "3:45 PM", "4:00 PM", "4:15 PM"]', '3:45 PM', 3, 30, '7-10', arithmetic_category_id, 75),
    (math_subject_id, 'You buy 3 packs of stickers for $2 each. How much do you spend?', '["$5", "$6", "$7", "$8"]', '$6', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'A garden is 8 feet long and 5 feet wide. What is its area?', '["35 sq ft", "40 sq ft", "45 sq ft", "26 sq ft"]', '40 sq ft', 3, 30, '7-10', geometry_category_id, 70),
    (math_subject_id, 'There are 144 students. They sit in groups of 12. How many groups?', '["10", "11", "12", "13"]', '12', 3, 25, '7-10', arithmetic_category_id, 65),
    (math_subject_id, 'A bus can hold 48 students. How many buses needed for 150 students?', '["3", "4", "5", "6"]', '4', 3, 30, '7-10', arithmetic_category_id, 75),
    (math_subject_id, 'You read 15 pages per day. How many pages in 2 weeks?', '["200", "210", "220", "230"]', '210', 3, 30, '7-10', arithmetic_category_id, 70),
    (math_subject_id, 'A pizza is cut into 8 equal slices. You eat 3 slices. What fraction did you eat?', '["3/8", "3/5", "5/8", "1/3"]', '3/8', 3, 25, '7-10', arithmetic_category_id, 65),
    (math_subject_id, 'Temperature is 75°F in the morning and rises 12°F by afternoon. What is the afternoon temperature?', '["85°F", "87°F", "89°F", "63°F"]', '87°F', 3, 25, '7-10', arithmetic_category_id, 65),
    (math_subject_id, 'A rope is 24 feet long. You cut it into 3 equal pieces. How long is each piece?', '["6 feet", "7 feet", "8 feet", "9 feet"]', '8 feet', 3, 25, '7-10', arithmetic_category_id, 60),
    (math_subject_id, 'You have $20. You buy a book for $7.50. How much change do you get?', '["$12.50", "$13.00", "$13.50", "$27.50"]', '$12.50', 3, 25, '7-10', arithmetic_category_id, 65),
    (math_subject_id, 'A swimming pool is 25 meters long. How many laps to swim 200 meters?', '["6", "7", "8", "9"]', '8', 3, 25, '7-10', arithmetic_category_id, 65),
    (math_subject_id, 'School starts at 8:00 AM. You need 45 minutes to get ready. What time should you wake up?', '["7:00 AM", "7:15 AM", "7:30 AM", "7:45 AM"]', '7:15 AM', 3, 30, '7-10', arithmetic_category_id, 70),

    -- Ages 11-14: Complex Real-World Problems
    (math_subject_id, 'A store marks up items by 40%. If an item costs $25, what is the selling price?', '["$30", "$32", "$35", "$40"]', '$35', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'You get 15% discount on a $80 jacket. How much do you pay?', '["$65", "$68", "$70", "$72"]', '$68', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'A car gets 28 miles per gallon. How many gallons for a 350-mile trip?', '["12", "12.5", "13", "13.5"]', '12.5', 4, 35, '11-14', arithmetic_category_id, 85),
    (math_subject_id, 'You invest $500 at 6% annual interest. How much after 2 years (simple interest)?', '["$560", "$580", "$600", "$620"]', '$560', 4, 40, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'A rectangular pool is 20 ft × 15 ft × 4 ft deep. How many cubic feet of water?', '["1000", "1100", "1200", "1300"]', '1200', 4, 40, '11-14', geometry_category_id, 90),
    (math_subject_id, 'Pizza costs $12 for 4 people. How much for 10 people?', '["$28", "$30", "$32", "$35"]', '$30', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'A phone plan costs $40/month plus $0.10 per text. Bill is $52. How many texts?', '["100", "120", "140", "160"]', '120', 4, 40, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'You save 25% of your $200 allowance each month. How much saved in 6 months?', '["$250", "$275", "$300", "$325"]', '$300', 4, 35, '11-14', arithmetic_category_id, 85),
    (math_subject_id, 'A ladder leans against a wall. The ladder is 13 ft, base is 5 ft from wall. How high up the wall?', '["10 ft", "11 ft", "12 ft", "13 ft"]', '12 ft', 4, 40, '11-14', geometry_category_id, 90),
    (math_subject_id, 'Population grows from 10,000 to 12,000. What is the percent increase?', '["15%", "18%", "20%", "25%"]', '20%', 4, 35, '11-14', arithmetic_category_id, 85),
    (math_subject_id, 'A map scale is 1 inch = 50 miles. Cities are 3.5 inches apart on map. Actual distance?', '["150 miles", "165 miles", "175 miles", "200 miles"]', '175 miles', 4, 35, '11-14', arithmetic_category_id, 85),
    (math_subject_id, 'You mix 40% salt solution with 60% salt solution equally. What is the final concentration?', '["45%", "48%", "50%", "55%"]', '50%', 4, 40, '11-14', arithmetic_category_id, 90),
    (math_subject_id, 'A cylindrical tank has radius 3 ft and height 8 ft. What is its volume? (π ≈ 3.14)', '["226 cu ft", "240 cu ft", "254 cu ft", "268 cu ft"]', '226 cu ft', 4, 40, '11-14', geometry_category_id, 95),
    (math_subject_id, 'Speed limit is 65 mph. You travel 260 miles. Minimum time needed?', '["3.5 hours", "4 hours", "4.5 hours", "5 hours"]', '4 hours', 4, 35, '11-14', arithmetic_category_id, 80),
    (math_subject_id, 'A recipe serves 6 people and uses 2.5 cups flour. How much flour for 15 people?', '["5.5 cups", "6 cups", "6.25 cups", "7 cups"]', '6.25 cups', 4, 35, '11-14', arithmetic_category_id, 85),

    -- Ages 15-18: Advanced Applications and Modeling
    (math_subject_id, 'A ball is thrown upward with velocity v₀ = 64 ft/s. Height h = -16t² + 64t. When does it hit the ground?', '["3 sec", "4 sec", "5 sec", "6 sec"]', '4 sec', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Compound interest: $1000 at 8% annually for 3 years. Final amount? A = P(1+r)ⁿ', '["$1240", "$1260", "$1280", "$1300"]', '$1260', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'A population grows exponentially: P(t) = 1000e^(0.05t). Population after 10 years?', '["1500", "1600", "1649", "1700"]', '1649', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Optimization: Rectangle inscribed in semicircle of radius 5. Maximum area?', '["20", "25", "30", "50"]', '25', 5, 55, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'Related rates: Balloon radius increases at 2 cm/s. Rate of volume change when r = 6 cm?', '["288π cm³/s", "144π cm³/s", "72π cm³/s", "36π cm³/s"]', '288π cm³/s', 5, 55, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'Normal distribution: Mean = 100, SD = 15. What percent score between 85 and 115?', '["68%", "75%", "80%", "95%"]', '68%', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Loan payment: $10,000 at 5% for 4 years. Monthly payment? PMT = P[r(1+r)ⁿ]/[(1+r)ⁿ-1]', '["$230", "$240", "$250", "$260"]', '$230', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Physics: Object falls from 100 ft. Time to hit ground? h = -16t² + 100', '["2.5 sec", "3 sec", "3.5 sec", "4 sec"]', '2.5 sec', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'Business: Revenue R = 100x - x². What price x maximizes revenue?', '["$40", "$45", "$50", "$55"]', '$50', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Probability: 3 coins flipped. Probability of exactly 2 heads?', '["1/4", "3/8", "1/2", "5/8"]', '3/8', 5, 45, '15-18', arithmetic_category_id, 100),
    (math_subject_id, 'Trigonometry: Tower 50 ft tall casts 30 ft shadow. Angle of elevation of sun?', '["45°", "50°", "59°", "60°"]', '59°', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Calculus: Area under y = x² from x = 0 to x = 3', '["6", "7", "8", "9"]', '9', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Economics: Supply S = 2p + 10, Demand D = 50 - p. Equilibrium price?', '["$12", "$13", "$14", "$15"]', '$13', 5, 50, '15-18', arithmetic_category_id, 110),
    (math_subject_id, 'Engineering: Beam deflection y = (wx⁴)/(24EI). Find dy/dx', '["wx³/(6EI)", "wx³/(8EI)", "4wx³/(24EI)", "wx³/(24EI)"]', 'wx³/(6EI)', 5, 55, '15-18', arithmetic_category_id, 120),
    (math_subject_id, 'Statistics: Sample of 100, mean = 75, SD = 10. 95% confidence interval for population mean?', '["73-77", "74-76", "75-77", "73-75"]', '73-77', 5, 50, '15-18', arithmetic_category_id, 110);

END $$;