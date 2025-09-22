-- Geometry and Measurement Questions
-- This migration focuses specifically on geometric concepts and measurement

DO $$ 
DECLARE
    math_subject_id UUID;
    geometry_category_id UUID;
BEGIN
    -- Get subject and category IDs
    SELECT id INTO math_subject_id FROM public.subjects WHERE name = 'Mathematics';
    SELECT id INTO geometry_category_id FROM public.question_categories WHERE name = 'Geometry';

    -- Ages 3-6: Basic Shapes and Spatial Concepts
    INSERT INTO public.questions (subject_id, question_text, answer_options, correct_answer, difficulty_level, xp_reward, age_range, category_id, time_limit_seconds) VALUES
    (math_subject_id, 'Which shape is a circle? 🔴 🔺 ⬜ ⬛', '["Red circle", "Triangle", "White square", "Black square"]', 'Red circle', 1, 10, '3-6', geometry_category_id, 25),
    (math_subject_id, 'How many corners does a triangle have?', '["1", "2", "3", "4"]', '3', 1, 10, '3-6', geometry_category_id, 30),
    (math_subject_id, 'Which is bigger: a basketball or a marble?', '["Basketball", "Marble", "Same size", "Cannot tell"]', 'Basketball', 1, 10, '3-6', geometry_category_id, 25),
    (math_subject_id, 'What shape has 4 equal sides?', '["Circle", "Triangle", "Square", "Oval"]', 'Square', 2, 15, '3-6', geometry_category_id, 30),
    (math_subject_id, 'Which line is longer? _____ vs ___', '["First line", "Second line", "Same length", "Cannot tell"]', 'First line', 1, 10, '3-6', geometry_category_id, 25),
    (math_subject_id, 'How many sides does a square have?', '["2", "3", "4", "5"]', '4', 1, 10, '3-6', geometry_category_id, 25),
    (math_subject_id, 'What comes next in the pattern: ○ △ ○ △ ?', '["○", "△", "□", "◇"]', '○', 2, 15, '3-6', geometry_category_id, 35),
    (math_subject_id, 'Which container holds MORE water: a big cup or a small cup?', '["Big cup", "Small cup", "Same amount", "Cannot tell"]', 'Big cup', 1, 10, '3-6', geometry_category_id, 30),
    (math_subject_id, 'How many wheels does a bicycle have?', '["1", "2", "3", "4"]', '2', 1, 10, '3-6', geometry_category_id, 25),
    (math_subject_id, 'What shape is a ball?', '["Square", "Triangle", "Circle", "Rectangle"]', 'Circle', 1, 10, '3-6', geometry_category_id, 25),

    -- Ages 7-10: Basic Geometry and Measurement
    (math_subject_id, 'What is the perimeter of a rectangle with length 8 and width 3?', '["19", "20", "21", "22"]', '22', 3, 25, '7-10', geometry_category_id, 60),
    (math_subject_id, 'How many vertices does a cube have?', '["6", "8", "10", "12"]', '8', 3, 25, '7-10', geometry_category_id, 50),
    (math_subject_id, 'What is the area of a square with side length 7?', '["42", "45", "49", "52"]', '49', 3, 25, '7-10', geometry_category_id, 55),
    (math_subject_id, 'How many inches are in 2 feet?', '["20", "22", "24", "26"]', '24', 2, 20, '7-10', geometry_category_id, 45),
    (math_subject_id, 'What is the circumference of a circle with radius 5? (Use π ≈ 3)', '["15", "30", "45", "75"]', '30', 3, 30, '7-10', geometry_category_id, 70),
    (math_subject_id, 'How many right angles are in a rectangle?', '["2", "3", "4", "6"]', '4', 3, 25, '7-10', geometry_category_id, 50),
    (math_subject_id, 'What is the volume of a cube with side length 4?', '["48", "56", "64", "72"]', '64', 3, 30, '7-10', geometry_category_id, 65),
    (math_subject_id, 'How many millimeters are in 1 centimeter?', '["5", "10", "50", "100"]', '10', 2, 20, '7-10', geometry_category_id, 45),
    (math_subject_id, 'What type of triangle has all sides equal?', '["Right", "Isosceles", "Equilateral", "Scalene"]', 'Equilateral', 3, 25, '7-10', geometry_category_id, 55),
    (math_subject_id, 'How many faces does a rectangular prism have?', '["4", "5", "6", "8"]', '6', 3, 25, '7-10', geometry_category_id, 50),
    (math_subject_id, 'What is the area of a triangle with base 6 and height 8?', '["20", "22", "24", "26"]', '24', 3, 30, '7-10', geometry_category_id, 65),
    (math_subject_id, 'How many degrees in a complete circle?', '["180°", "270°", "360°", "450°"]', '360°', 3, 25, '7-10', geometry_category_id, 50),
    (math_subject_id, 'What is the perimeter of a triangle with sides 5, 7, and 9?', '["19", "20", "21", "22"]', '21', 3, 25, '7-10', geometry_category_id, 60),
    (math_subject_id, 'How many ounces are in 1 pound?', '["12", "14", "16", "18"]', '16', 2, 20, '7-10', geometry_category_id, 45),
    (math_subject_id, 'What is the diagonal of a square with side 3? (Use Pythagorean theorem)', '["3√2", "4", "4.2", "6"]', '3√2', 3, 30, '7-10', geometry_category_id, 70),

    -- Ages 11-14: Advanced Geometry and Coordinate Geometry
    (math_subject_id, 'What is the area of a circle with radius 6? (Use π ≈ 3.14)', '["113.04", "37.68", "18.84", "226.08"]', '113.04', 4, 35, '11-14', geometry_category_id, 80),
    (math_subject_id, 'What is the surface area of a cube with side length 5?', '["125", "150", "175", "200"]', '150', 4, 35, '11-14', geometry_category_id, 75),
    (math_subject_id, 'Find the distance between points (3, 4) and (6, 8)', '["4", "5", "6", "7"]', '5', 4, 35, '11-14', geometry_category_id, 80),
    (math_subject_id, 'What is the volume of a cylinder with radius 3 and height 7? (π ≈ 3.14)', '["197.82", "65.94", "131.88", "263.76"]', '197.82', 4, 40, '11-14', geometry_category_id, 90),
    (math_subject_id, 'In a right triangle, if one leg is 9 and hypotenuse is 15, what is the other leg?', '["10", "11", "12", "13"]', '12', 4, 35, '11-14', geometry_category_id, 85),
    (math_subject_id, 'What is the midpoint of the line segment from (2, 6) to (8, 14)?', '["(5, 10)", "(6, 10)", "(5, 11)", "(6, 11)"]', '(5, 10)', 4, 35, '11-14', geometry_category_id, 80),
    (math_subject_id, 'How many liters are in 2500 milliliters?', '["2.5", "25", "250", "0.25"]', '2.5', 3, 25, '11-14', geometry_category_id, 60),
    (math_subject_id, 'What is the area of a trapezoid with bases 8 and 12, and height 5?', '["45", "50", "55", "60"]', '50', 4, 35, '11-14', geometry_category_id, 85),
    (math_subject_id, 'If a triangle has angles 30° and 60°, what is the third angle?', '["80°", "85°", "90°", "95°"]', '90°', 4, 30, '11-14', geometry_category_id, 70),
    (math_subject_id, 'What is the slope of the line passing through (1, 3) and (5, 11)?', '["1", "2", "3", "4"]', '2', 4, 35, '11-14', geometry_category_id, 80),
    (math_subject_id, 'Convert 5 kilometers to meters', '["50", "500", "5000", "50000"]', '5000', 3, 25, '11-14', geometry_category_id, 60),
    (math_subject_id, 'What is the volume of a sphere with radius 3? (Use π ≈ 3.14)', '["113.04", "37.68", "28.26", "56.52"]', '113.04', 4, 40, '11-14', geometry_category_id, 90),
    (math_subject_id, 'Find the equation of a line with slope 3 passing through (2, 7)', '["y = 3x + 1", "y = 3x - 1", "y = 3x + 7", "y = 2x + 3"]', 'y = 3x + 1', 4, 40, '11-14', geometry_category_id, 85),
    (math_subject_id, 'What is the area of a regular hexagon with side length 4?', '["24√3", "48", "36√3", "16√3"]', '24√3', 4, 40, '11-14', geometry_category_id, 90),
    (math_subject_id, 'How many square feet are in 3 square yards?', '["9", "18", "27", "36"]', '27', 3, 25, '11-14', geometry_category_id, 65),

    -- Ages 15-18: Advanced Geometry, Trigonometry, and Calculus Applications
    (math_subject_id, 'Find the area of an ellipse with semi-major axis 5 and semi-minor axis 3', '["15π", "30π", "45π", "60π"]', '15π', 5, 45, '15-18', geometry_category_id, 100),
    (math_subject_id, 'What is the surface area of a sphere with radius 4? (Use π)', '["32π", "48π", "64π", "256π"]', '64π', 5, 45, '15-18', geometry_category_id, 100),
    (math_subject_id, 'Find the volume of a cone with radius 6 and height 8', '["96π", "144π", "288π", "384π"]', '96π', 5, 45, '15-18', geometry_category_id, 100),
    (math_subject_id, 'What is the length of arc subtended by 60° in a circle of radius 9?', '["3π", "6π", "9π", "18π"]', '3π', 5, 45, '15-18', geometry_category_id, 100),
    (math_subject_id, 'Find the centroid of triangle with vertices (0,0), (6,0), (3,9)', '["(3, 3)", "(3, 4)", "(4, 3)", "(2, 3)"]', '(3, 3)', 5, 50, '15-18', geometry_category_id, 110),
    (math_subject_id, 'What is the equation of a circle with center (2, -3) and radius 5?', '["(x-2)² + (y+3)² = 25", "(x+2)² + (y-3)² = 25", "(x-2)² + (y-3)² = 25", "(x+2)² + (y+3)² = 25"]', '(x-2)² + (y+3)² = 25', 5, 45, '15-18', geometry_category_id, 100),
    (math_subject_id, 'Find the area between y = x² and y = x from x = 0 to x = 1', '["1/6", "1/4", "1/3", "1/2"]', '1/6', 5, 50, '15-18', geometry_category_id, 110),
    (math_subject_id, 'What is the volume of revolution when y = √x is rotated about x-axis from x = 0 to x = 4?', '["8π", "16π", "32π", "64π"]', '8π', 5, 55, '15-18', geometry_category_id, 120),
    (math_subject_id, 'Find the angle between vectors (3, 4) and (1, 2)', '["arccos(11/5√5)", "arccos(11/10)", "arccos(√5/5)", "arccos(2/5)"]', 'arccos(11/5√5)', 5, 55, '15-18', geometry_category_id, 120),
    (math_subject_id, 'What is the curvature of y = x² at point (1, 1)?', '["1", "2", "2/√5³", "4"]', '2', 5, 55, '15-18', geometry_category_id, 120),
    (math_subject_id, 'Find the parametric equations for the line through (1, 2, 3) with direction vector (2, -1, 4)', '["x=1+2t, y=2-t, z=3+4t", "x=2+t, y=-1+2t, z=4+3t", "x=1+t, y=2+2t, z=3-t", "x=2t, y=1-t, z=4+3t"]', 'x=1+2t, y=2-t, z=3+4t', 5, 50, '15-18', geometry_category_id, 110),
    (math_subject_id, 'What is the gradient of f(x,y) = x²y + xy² at point (2, 1)?', '["(5, 8)", "(8, 5)", "(4, 6)", "(6, 4)"]', '(5, 8)', 5, 55, '15-18', geometry_category_id, 120),
    (math_subject_id, 'Find the equation of the tangent plane to z = x² + y² at point (1, 2, 5)', '["z = 2x + 4y - 3", "z = x + 2y + 1", "z = 2x + 4y + 1", "z = x + y + 2"]', 'z = 2x + 4y - 3', 5, 55, '15-18', geometry_category_id, 120),
    (math_subject_id, 'What is the flux of F = (x, y, z) through the unit sphere?', '["4π", "8π", "12π", "16π"]', '4π', 5, 55, '15-18', geometry_category_id, 120),
    (math_subject_id, 'Find the moment of inertia of a uniform disk of radius R and mass M about its center', '["MR²/4", "MR²/2", "MR²", "2MR²"]', 'MR²/2', 5, 50, '15-18', geometry_category_id, 110);

END $$;