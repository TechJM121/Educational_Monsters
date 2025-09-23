#!/usr/bin/env node

/**
 * Clean up duplicate SQL files
 * Keeps only the essential files needed for setup
 */

import { unlinkSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

console.log('🧹 Cleaning up duplicate SQL files...')

const migrationsDir = './supabase/migrations'
const supabaseDir = './supabase'

// Files to keep (the essential ones)
const filesToKeep = [
  'complete_database_setup.sql',
  'complete_seed_data.sql',
  'check_database_status.sql'
]

// Clean up migration files (keep only the complete setup)
if (existsSync(migrationsDir)) {
  const migrationFiles = readdirSync(migrationsDir)
  
  migrationFiles.forEach(filename => {
    const filePath = join(migrationsDir, filename)
    
    // Remove all individual migration files since we have the complete setup
    try {
      unlinkSync(filePath)
      console.log(`🗑️  Removed ${filename}`)
    } catch (err) {
      console.log(`⚠️  Could not remove ${filename}: ${err.message}`)
    }
  })
}

// Clean up root supabase directory
if (existsSync(supabaseDir)) {
  const supabaseFiles = readdirSync(supabaseDir).filter(f => f.endsWith('.sql'))
  
  supabaseFiles.forEach(filename => {
    if (!filesToKeep.includes(filename)) {
      const filePath = join(supabaseDir, filename)
      
      try {
        unlinkSync(filePath)
        console.log(`🗑️  Removed ${filename}`)
      } catch (err) {
        console.log(`⚠️  Could not remove ${filename}: ${err.message}`)
      }
    }
  })
}

// Clean up setup scripts we no longer need
const scriptsToRemove = [
  'setup_database.sql',
  'setup_db.ps1', 
  'setup_db.bat',
  'setup-database.js',
  'fix_sql_syntax.js',
  'create_fixed_sql.js'
]

scriptsToRemove.forEach(filename => {
  if (existsSync(filename)) {
    try {
      unlinkSync(filename)
      console.log(`🗑️  Removed ${filename}`)
    } catch (err) {
      console.log(`⚠️  Could not remove ${filename}: ${err.message}`)
    }
  }
})

console.log('✨ Cleanup complete!')
console.log('\n📁 Files remaining:')
console.log('• check_database_status.sql - Check what\'s in your database')
console.log('• complete_database_setup.sql - Complete table and function setup')  
console.log('• complete_seed_data.sql - All seed data (subjects, questions, etc.)')
console.log('\n🚀 You now have just 3 clean, idempotent SQL files to run!')