-- Check Database Status
-- Run this first to see what's already in your database

-- Check if tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if subjects exist
SELECT 'subjects' as table_name, COUNT(*) as record_count 
FROM public.subjects
UNION ALL
SELECT 'questions', COUNT(*) FROM public.questions
UNION ALL  
SELECT 'achievements', COUNT(*) FROM public.achievements
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM public.inventory_items;

-- Check if functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;