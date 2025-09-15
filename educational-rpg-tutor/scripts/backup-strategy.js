#!/usr/bin/env node

/**
 * Backup strategy implementation for user data and character progression
 * Handles automated backups, verification, and restoration procedures
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BackupService {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.backupDir = path.join(__dirname, '../backups');
    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createFullBackup() {
    console.log('🔄 Starting full database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `full-backup-${timestamp}`);
    
    try {
      // 1. Export all user data
      await this.exportUserData(backupPath);
      
      // 2. Export character progression data
      await this.exportCharacterData(backupPath);
      
      // 3. Export learning analytics
      await this.exportLearningData(backupPath);
      
      // 4. Create backup metadata
      await this.createBackupMetadata(backupPath, 'full');
      
      // 5. Compress backup
      await this.compressBackup(backupPath);
      
      // 6. Verify backup integrity
      await this.verifyBackup(backupPath);
      
      console.log(`✅ Full backup completed: ${backupPath}.tar.gz`);
      return `${backupPath}.tar.gz`;
      
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  async createIncrementalBackup(lastBackupTime) {
    console.log('🔄 Starting incremental backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `incremental-backup-${timestamp}`);
    
    try {
      // Export only data modified since last backup
      await this.exportIncrementalData(backupPath, lastBackupTime);
      await this.createBackupMetadata(backupPath, 'incremental', lastBackupTime);
      await this.compressBackup(backupPath);
      await this.verifyBackup(backupPath);
      
      console.log(`✅ Incremental backup completed: ${backupPath}.tar.gz`);
      return `${backupPath}.tar.gz`;
      
    } catch (error) {
      console.error('❌ Incremental backup failed:', error);
      throw error;
    }
  }

  async exportUserData(backupPath) {
    console.log('📊 Exporting user data...');
    
    const { data: users, error } = await this.supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    fs.writeFileSync(
      path.join(backupPath, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    
    console.log(`✅ Exported ${users.length} user records`);
  }

  async exportCharacterData(backupPath) {
    console.log('🎮 Exporting character data...');
    
    // Export characters
    const { data: characters, error: charError } = await this.supabase
      .from('characters')
      .select('*');
    
    if (charError) throw charError;
    
    // Export character stats
    const { data: stats, error: statsError } = await this.supabase
      .from('character_stats')
      .select('*');
    
    if (statsError) throw statsError;
    
    // Export achievements
    const { data: achievements, error: achError } = await this.supabase
      .from('user_achievements')
      .select('*');
    
    if (achError) throw achError;
    
    // Export inventory
    const { data: inventory, error: invError } = await this.supabase
      .from('user_inventory')
      .select('*');
    
    if (invError) throw invError;
    
    fs.writeFileSync(
      path.join(backupPath, 'characters.json'),
      JSON.stringify(characters, null, 2)
    );
    
    fs.writeFileSync(
      path.join(backupPath, 'character_stats.json'),
      JSON.stringify(stats, null, 2)
    );
    
    fs.writeFileSync(
      path.join(backupPath, 'user_achievements.json'),
      JSON.stringify(achievements, null, 2)
    );
    
    fs.writeFileSync(
      path.join(backupPath, 'user_inventory.json'),
      JSON.stringify(inventory, null, 2)
    );
    
    console.log(`✅ Exported character data for ${characters.length} characters`);
  }

  async exportLearningData(backupPath) {
    console.log('📚 Exporting learning data...');
    
    // Export question responses
    const { data: responses, error: respError } = await this.supabase
      .from('question_responses')
      .select('*');
    
    if (respError) throw respError;
    
    // Export user progress
    const { data: progress, error: progError } = await this.supabase
      .from('user_progress')
      .select('*');
    
    if (progError) throw progError;
    
    fs.writeFileSync(
      path.join(backupPath, 'question_responses.json'),
      JSON.stringify(responses, null, 2)
    );
    
    fs.writeFileSync(
      path.join(backupPath, 'user_progress.json'),
      JSON.stringify(progress, null, 2)
    );
    
    console.log(`✅ Exported ${responses.length} question responses and ${progress.length} progress records`);
  }

  async exportIncrementalData(backupPath, lastBackupTime) {
    console.log(`📊 Exporting incremental data since ${lastBackupTime}...`);
    
    const tables = [
      'users', 'characters', 'character_stats', 'question_responses',
      'user_achievements', 'user_progress', 'user_inventory'
    ];
    
    for (const table of tables) {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .gte('updated_at', lastBackupTime);
      
      if (error) throw error;
      
      if (data.length > 0) {
        fs.writeFileSync(
          path.join(backupPath, `${table}.json`),
          JSON.stringify(data, null, 2)
        );
        console.log(`✅ Exported ${data.length} updated ${table} records`);
      }
    }
  }

  async createBackupMetadata(backupPath, type, lastBackupTime = null) {
    const metadata = {
      type,
      timestamp: new Date().toISOString(),
      lastBackupTime,
      version: '1.0.0',
      tables: fs.readdirSync(backupPath).filter(f => f.endsWith('.json')),
      environment: process.env.NODE_ENV || 'production'
    };
    
    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
  }

  async compressBackup(backupPath) {
    console.log('🗜️ Compressing backup...');
    
    try {
      execSync(`tar -czf "${backupPath}.tar.gz" -C "${path.dirname(backupPath)}" "${path.basename(backupPath)}"`);
      
      // Remove uncompressed directory
      execSync(`rm -rf "${backupPath}"`);
      
    } catch (error) {
      console.error('Compression failed:', error);
      throw error;
    }
  }

  async verifyBackup(backupPath) {
    console.log('🔍 Verifying backup integrity...');
    
    try {
      // Extract to temporary location for verification
      const tempPath = `${backupPath}-verify`;
      execSync(`tar -xzf "${backupPath}.tar.gz" -C "${path.dirname(backupPath)}"`);
      
      // Verify all expected files exist
      const metadata = JSON.parse(fs.readFileSync(path.join(backupPath, 'metadata.json')));
      
      for (const table of metadata.tables) {
        const filePath = path.join(backupPath, table);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Missing backup file: ${table}`);
        }
        
        // Verify JSON is valid
        const data = JSON.parse(fs.readFileSync(filePath));
        if (!Array.isArray(data)) {
          throw new Error(`Invalid backup data format: ${table}`);
        }
      }
      
      // Clean up verification files
      execSync(`rm -rf "${backupPath}"`);
      
      console.log('✅ Backup verification successful');
      
    } catch (error) {
      console.error('Backup verification failed:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupFilePath, targetTables = null) {
    console.log(`🔄 Starting restore from ${backupFilePath}...`);
    
    try {
      // Extract backup
      const extractPath = backupFilePath.replace('.tar.gz', '');
      execSync(`tar -xzf "${backupFilePath}" -C "${path.dirname(backupFilePath)}"`);
      
      // Read metadata
      const metadata = JSON.parse(fs.readFileSync(path.join(extractPath, 'metadata.json')));
      console.log(`Restoring ${metadata.type} backup from ${metadata.timestamp}`);
      
      // Restore each table
      const tablesToRestore = targetTables || metadata.tables;
      
      for (const tableFile of tablesToRestore) {
        if (tableFile === 'metadata.json') continue;
        
        const tableName = tableFile.replace('.json', '');
        const data = JSON.parse(fs.readFileSync(path.join(extractPath, tableFile)));
        
        console.log(`Restoring ${data.length} records to ${tableName}...`);
        
        // Use upsert to handle conflicts
        const { error } = await this.supabase
          .from(tableName)
          .upsert(data, { onConflict: 'id' });
        
        if (error) {
          console.error(`Failed to restore ${tableName}:`, error);
          throw error;
        }
        
        console.log(`✅ Restored ${tableName}`);
      }
      
      // Clean up extracted files
      execSync(`rm -rf "${extractPath}"`);
      
      console.log('✅ Restore completed successfully');
      
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  async cleanupOldBackups(retentionDays = 30) {
    console.log(`🧹 Cleaning up backups older than ${retentionDays} days...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const files = fs.readdirSync(this.backupDir);
    let deletedCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.tar.gz')) continue;
      
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted old backup: ${file}`);
      }
    }
    
    console.log(`✅ Cleaned up ${deletedCount} old backup files`);
  }
}

// CLI interface
async function main() {
  const backup = new BackupService();
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'full':
        await backup.createFullBackup();
        break;
        
      case 'incremental':
        const lastBackup = process.argv[3];
        if (!lastBackup) {
          console.error('Please provide last backup timestamp for incremental backup');
          process.exit(1);
        }
        await backup.createIncrementalBackup(lastBackup);
        break;
        
      case 'restore':
        const backupFile = process.argv[3];
        if (!backupFile) {
          console.error('Please provide backup file path for restore');
          process.exit(1);
        }
        await backup.restoreFromBackup(backupFile);
        break;
        
      case 'cleanup':
        const days = parseInt(process.argv[3]) || 30;
        await backup.cleanupOldBackups(days);
        break;
        
      default:
        console.log(`
Usage: node backup-strategy.js <command> [options]

Commands:
  full                    Create full backup
  incremental <timestamp> Create incremental backup since timestamp
  restore <backup-file>   Restore from backup file
  cleanup [days]          Clean up backups older than N days (default: 30)
        `);
    }
  } catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = BackupService;