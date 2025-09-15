# Production Supabase Configuration

## Production Instance Setup

### 1. Create Production Project
1. Create a new Supabase project for production
2. Enable the following extensions:
   - `uuid-ossp` for UUID generation
   - `pg_stat_statements` for performance monitoring
   - `pg_cron` for scheduled tasks

### 2. Security Configuration

#### Database Security
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- Set secure defaults
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_min_duration_statement = 1000;
```

#### API Security Settings
- Enable JWT verification
- Set secure JWT secret (minimum 32 characters)
- Configure CORS for production domain only
- Enable rate limiting: 100 requests per minute per IP
- Set session timeout to 24 hours

#### Authentication Settings
- Enable email confirmation required
- Set password requirements: minimum 8 characters, mixed case, numbers
- Configure password reset token expiry: 1 hour
- Enable account lockout after 5 failed attempts

### 3. Performance Optimization

#### Database Indexes
```sql
-- Performance indexes for common queries
CREATE INDEX CONCURRENTLY idx_characters_user_id ON characters(user_id);
CREATE INDEX CONCURRENTLY idx_character_stats_character_id ON character_stats(character_id);
CREATE INDEX CONCURRENTLY idx_questions_subject_age ON questions(subject_id, age_range);
CREATE INDEX CONCURRENTLY idx_question_responses_user_created ON question_responses(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX CONCURRENTLY idx_user_progress_user_subject ON user_progress(user_id, subject_id);

-- Composite indexes for leaderboards
CREATE INDEX CONCURRENTLY idx_characters_level_xp ON characters(level DESC, total_xp DESC);
CREATE INDEX CONCURRENTLY idx_user_progress_weekly ON user_progress(created_at) WHERE created_at >= NOW() - INTERVAL '7 days';
```

#### Connection Pooling
- Enable connection pooling with PgBouncer
- Set max connections: 100
- Pool mode: Transaction
- Default pool size: 25

### 4. Backup Strategy

#### Automated Backups
- Enable daily automated backups
- Retention period: 30 days
- Backup window: 2:00 AM - 4:00 AM UTC

#### Point-in-Time Recovery
- Enable PITR with 7-day retention
- Configure backup verification scripts

### 5. Monitoring and Alerts

#### Database Monitoring
- Enable slow query logging (>1000ms)
- Monitor connection count and usage
- Track table sizes and growth
- Monitor replication lag

#### Alert Configuration
- CPU usage > 80% for 5 minutes
- Memory usage > 85% for 5 minutes
- Disk usage > 90%
- Connection count > 80% of limit
- Failed authentication attempts > 50/hour

### 6. Environment Variables

```bash
# Production Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_DB_PASSWORD=your-secure-db-password
```

### 7. Migration Strategy

#### Production Deployment Process
1. Test all migrations in staging environment
2. Create database backup before migration
3. Run migrations during low-traffic window
4. Verify data integrity post-migration
5. Monitor performance for 24 hours

#### Rollback Plan
1. Keep previous backup accessible
2. Document rollback procedures
3. Test rollback process in staging
4. Have emergency contact procedures