#!/usr/bin/env node

/**
 * Educational RPG Tutor - Question Setup Script
 * 
 * This script helps you set up the Supabase database with comprehensive questions
 * across all subjects and age ranges.
 */

import fs from 'fs';
import path from 'path';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
  console.log(colorize('\n🎯 Educational RPG Tutor - Question Setup', 'cyan'));
  console.log(colorize('=' .repeat(50), 'blue'));
}

function printStep(step, description) {
  console.log(colorize(`\n${step}. ${description}`, 'yellow'));
}

function printSuccess(message) {
  console.log(colorize(`✅ ${message}`, 'green'));
}

function printError(message) {
  console.log(colorize(`❌ ${message}`, 'red'));
}

function printInfo(message) {
  console.log(colorize(`ℹ️  ${message}`, 'blue'));
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function printInstructions() {
  printHeader();
  
  printStep(1, 'Check Database Setup Files');
  
  const setupFiles = [
    'complete_database_setup.sql',
    'comprehensive_questions_seed.sql',
    'seed_data_safe.sql'
  ];
  
  let allFilesExist = true;
  
  setupFiles.forEach(file => {
    if (checkFileExists(file)) {
      printSuccess(`Found: ${file}`);
    } else {
      printError(`Missing: ${file}`);
      allFilesExist = false;
    }
  });
  
  if (!allFilesExist) {
    printError('Some required files are missing. Please ensure all SQL files are present.');
    return;
  }
  
  printStep(2, 'Environment Configuration');
  
  if (checkFileExists('.env')) {
    const envContent = readFileContent('.env');
    if (envContent && envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')) {
      printSuccess('Environment file configured');
    } else {
      printError('Environment file exists but missing Supabase configuration');
    }
  } else {
    printError('No .env file found');
  }
  
  printStep(3, 'Database Setup Instructions');
  
  console.log(colorize('\nTo set up your database with questions:', 'bright'));
  console.log('');
  console.log('1. Go to your Supabase Dashboard:');
  console.log(colorize('   https://supabase.com/dashboard', 'cyan'));
  console.log('');
  console.log('2. Navigate to SQL Editor');
  console.log('');
  console.log('3. Run the following scripts IN ORDER:');
  console.log('');
  
  console.log(colorize('   a) Create Database Structure:', 'yellow'));
  console.log('      Copy and paste: complete_database_setup.sql');
  console.log('      This creates all tables, functions, and indexes');
  console.log('');
  
  console.log(colorize('   b) Load Comprehensive Questions:', 'yellow'));
  console.log('      Copy and paste: comprehensive_questions_seed.sql');
  console.log('      This loads 100+ questions across all subjects');
  console.log('');
  
  console.log(colorize('   c) Load Additional Data:', 'yellow'));
  console.log('      Copy and paste: seed_data_safe.sql');
  console.log('      This adds achievements, items, and more sample data');
  console.log('');
  
  printStep(4, 'Verification');
  
  console.log(colorize('\nAfter running the scripts, verify with this query:', 'bright'));
  console.log('');
  console.log(colorize(`SELECT 
    s.name as subject,
    q.age_range,
    COUNT(*) as question_count
FROM public.questions q
JOIN public.subjects s ON q.subject_id = s.id
GROUP BY s.name, q.age_range
ORDER BY s.name, q.age_range;`, 'cyan'));
  
  console.log('');
  console.log(colorize('Expected results:', 'bright'));
  console.log('- Mathematics: 15+ questions across age ranges 3-6, 7-10, 11-14, 15-18');
  console.log('- Science: 10+ questions across age ranges');
  console.log('- Language Arts: 8+ questions across age ranges');
  console.log('- History: 6+ questions across age ranges');
  console.log('- Biology: 6+ questions across age ranges');
  console.log('- Art: 6+ questions across age ranges');
  
  printStep(5, 'Using the Question System');
  
  console.log(colorize('\nIn your React app, use the enhanced question service:', 'bright'));
  console.log('');
  console.log(colorize(`import { enhancedQuestionService } from './services/enhancedQuestionService';

// Load questions for a specific age range and subject
const questions = await enhancedQuestionService.loadQuestions({
  ageRange: '7-10',
  subjectId: 'math-subject-id',
  limit: 20
});

// Get adaptive questions based on user performance
const adaptiveQuestions = await enhancedQuestionService.getAdaptiveQuestions(
  userId,
  '7-10',
  subjectId,
  10
);

// Get user progress across subjects
const progress = await enhancedQuestionService.getUserProgressBySubject(userId, '7-10');`, 'cyan'));
  
  printStep(6, 'Question Loader Component');
  
  console.log(colorize('\nUse the QuestionLoader component in your app:', 'bright'));
  console.log('');
  console.log(colorize(`import QuestionLoader from './components/learning/QuestionLoader';

function LearningPage() {
  const handleQuestionsLoaded = (questions) => {
    console.log('Loaded questions:', questions);
  };

  return (
    <QuestionLoader
      userId={currentUser.id}
      ageRange="7-10"
      onQuestionsLoaded={handleQuestionsLoaded}
      onError={(error) => console.error(error)}
    />
  );
}`, 'cyan'));
  
  printStep(7, 'Troubleshooting');
  
  console.log(colorize('\nCommon issues and solutions:', 'bright'));
  console.log('');
  console.log('• If tables already exist: Scripts use IF NOT EXISTS - safe to re-run');
  console.log('• If questions are duplicated: Scripts use ON CONFLICT DO NOTHING');
  console.log('• If functions fail: Scripts use CREATE OR REPLACE FUNCTION');
  console.log('• If you need to start fresh: Drop all tables and re-run setup');
  console.log('');
  
  printSuccess('Setup instructions complete!');
  console.log(colorize('\nHappy coding! 🚀📚\n', 'magenta'));
}

// File analysis
function analyzeFiles() {
  printHeader();
  
  printStep(1, 'Analyzing SQL Files');
  
  const files = [
    'complete_database_setup.sql',
    'comprehensive_questions_seed.sql', 
    'seed_data_safe.sql'
  ];
  
  files.forEach(file => {
    if (checkFileExists(file)) {
      const content = readFileContent(file);
      if (content) {
        const lines = content.split('\n').length;
        const size = (content.length / 1024).toFixed(1);
        const tables = (content.match(/CREATE TABLE/g) || []).length;
        const inserts = (content.match(/INSERT INTO/g) || []).length;
        
        console.log(colorize(`\n📄 ${file}:`, 'yellow'));
        console.log(`   Lines: ${lines}`);
        console.log(`   Size: ${size} KB`);
        console.log(`   Tables: ${tables}`);
        console.log(`   Inserts: ${inserts}`);
      }
    }
  });
  
  printStep(2, 'Question Distribution Analysis');
  
  const questionsFile = 'comprehensive_questions_seed.sql';
  if (checkFileExists(questionsFile)) {
    const content = readFileContent(questionsFile);
    if (content) {
      const subjects = ['Mathematics', 'Science', 'Language Arts', 'History', 'Biology', 'Art'];
      const ageRanges = ['3-6', '7-10', '11-14', '15-18'];
      
      console.log(colorize('\nQuestion distribution by subject:', 'bright'));
      subjects.forEach(subject => {
        const subjectQuestions = (content.match(new RegExp(`s\\.name = '${subject}'`, 'g')) || []).length;
        console.log(`   ${subject}: ${subjectQuestions} questions`);
      });
      
      console.log(colorize('\nQuestion distribution by age range:', 'bright'));
      ageRanges.forEach(range => {
        const rangeQuestions = (content.match(new RegExp(`'${range}'`, 'g')) || []).length;
        console.log(`   Age ${range}: ${rangeQuestions} questions`);
      });
    }
  }
  
  printSuccess('File analysis complete!');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--analyze') || args.includes('-a')) {
    analyzeFiles();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(colorize('\nEducational RPG Tutor - Question Setup Script', 'cyan'));
    console.log('');
    console.log('Usage:');
    console.log('  node setup_questions.js           Show setup instructions');
    console.log('  node setup_questions.js --analyze Analyze SQL files');
    console.log('  node setup_questions.js --help    Show this help');
    console.log('');
  } else {
    printInstructions();
  }
}

// Run the script
main();