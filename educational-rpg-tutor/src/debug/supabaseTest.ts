// Debug script to test Supabase connectivity and data
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  console.log('Is Configured:', isSupabaseConfigured);

  if (!isSupabaseConfigured) {
    console.error('❌ Supabase is not properly configured');
    return false;
  }

  try {
    // Test 1: Basic connection
    console.log('\n📡 Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('subjects')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Health check failed:', healthError);
      return false;
    }
    console.log('✅ Basic connection successful');

    // Test 2: Check if subjects table exists and has data
    console.log('\n📚 Testing subjects table...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(5);

    if (subjectsError) {
      console.error('❌ Subjects query failed:', subjectsError);
      return false;
    }
    console.log('✅ Subjects found:', subjects?.length || 0);
    console.log('Sample subjects:', subjects?.map(s => s.name));

    // Test 3: Check if questions table exists and has data
    console.log('\n❓ Testing questions table...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(5);

    if (questionsError) {
      console.error('❌ Questions query failed:', questionsError);
      console.error('Error details:', questionsError);
      return false;
    }
    console.log('✅ Questions found:', questions?.length || 0);
    console.log('Sample questions:', questions?.map(q => q.question_text?.substring(0, 50) + '...'));

    // Test 4: Test questions with subjects join
    console.log('\n🔗 Testing questions with subjects join...');
    const { data: questionsWithSubjects, error: joinError } = await supabase
      .from('questions')
      .select(`
        *,
        subjects (
          id,
          name,
          description,
          primary_stat,
          secondary_stat
        )
      `)
      .limit(3);

    if (joinError) {
      console.error('❌ Questions with subjects join failed:', joinError);
      return false;
    }
    console.log('✅ Questions with subjects join successful');
    console.log('Sample with subjects:', questionsWithSubjects?.map(q => ({
      question: q.question_text?.substring(0, 30) + '...',
      subject: q.subjects?.name
    })));

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Function to check database schema
export async function checkDatabaseSchema() {
  console.log('\n🏗️ Checking database schema...');
  
  try {
    // Check what tables exist
    const { data: tables, error } = await supabase
      .rpc('get_table_names'); // This might not exist, but let's try

    if (error) {
      console.log('RPC not available, trying direct table queries...');
      
      // Try to query each expected table
      const tablesToCheck = ['subjects', 'questions', 'users', 'characters'];
      
      for (const table of tablesToCheck) {
        try {
          const { data, error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (tableError) {
            console.log(`❌ Table '${table}' error:`, tableError.message);
          } else {
            console.log(`✅ Table '${table}' exists and accessible`);
          }
        } catch (err) {
          console.log(`❌ Table '${table}' not accessible:`, err);
        }
      }
    } else {
      console.log('Available tables:', tables);
    }
  } catch (error) {
    console.error('Schema check error:', error);
  }
}

// Run tests if this file is imported
if (typeof window !== 'undefined') {
  // Browser environment
  window.testSupabase = testSupabaseConnection;
  window.checkSchema = checkDatabaseSchema;
}