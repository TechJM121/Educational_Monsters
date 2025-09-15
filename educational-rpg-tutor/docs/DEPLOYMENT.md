# Production Deployment Guide

## Overview

This guide covers the complete deployment process for the Educational RPG Tutor application, including infrastructure setup, security configuration, monitoring, and maintenance procedures.

## Prerequisites

### Required Accounts and Services
- [Supabase](https://supabase.com) account for database and authentication
- [Vercel](https://vercel.com) account for hosting and CDN
- [GitHub](https://github.com) repository with Actions enabled
- Domain name for production deployment
- SSL certificate (handled automatically by Vercel)

### Required Environment Variables

#### Production Environment
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel Configuration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Monitoring and Alerts
VITE_MONITORING_ENDPOINT=https://your-monitoring-service.com/api
SLACK_WEBHOOK_URL=your-slack-webhook-url
SNYK_TOKEN=your-snyk-security-token

# External Services
CYPRESS_RECORD_KEY=your-cypress-dashboard-key
```

## Deployment Process

### 1. Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, e2e)
- [ ] Security scan completed with no high-severity issues
- [ ] Performance benchmarks meet requirements
- [ ] Database migrations tested in staging
- [ ] Backup strategy verified
- [ ] Monitoring and alerting configured
- [ ] SSL certificates valid
- [ ] CDN configuration optimized

### 2. Staging Deployment

```bash
# Deploy to staging environment
git push origin main

# Or trigger manual deployment
gh workflow run deploy.yml -f environment=staging
```

**Staging Environment:**
- URL: https://staging.educational-rpg-tutor.com
- Database: Staging Supabase instance
- Monitoring: Enabled with test data
- Rate limiting: Relaxed for testing

### 3. Production Deployment

```bash
# Create and push release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Or trigger manual production deployment
gh workflow run deploy.yml -f environment=production
```

**Production Environment:**
- URL: https://educational-rpg-tutor.com
- Database: Production Supabase instance
- Monitoring: Full monitoring and alerting
- Rate limiting: Production limits enforced

## Infrastructure Configuration

### Supabase Production Setup

#### 1. Database Configuration
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
```

#### 2. Security Settings
- Enable Row Level Security on all tables
- Configure JWT secret (minimum 32 characters)
- Set up CORS for production domain only
- Enable rate limiting: 100 requests/minute per IP
- Configure session timeout: 24 hours
- Enable email confirmation for new accounts

#### 3. Performance Optimization
- Connection pooling with PgBouncer
- Database indexes for common queries
- Query performance monitoring
- Automated backup schedule

### Vercel Configuration

#### 1. Project Settings
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`

#### 2. Environment Variables
Configure all required environment variables in Vercel dashboard:
- Production variables for main deployment
- Preview variables for staging branches

#### 3. Domain Configuration
- Add custom domain: `educational-rpg-tutor.com`
- Configure DNS records
- Enable automatic HTTPS
- Set up redirects from www to apex domain

## Security Configuration

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
```

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Rate Limiting
- API endpoints: 100 requests/minute per IP
- Authentication: 5 attempts per 5 minutes
- Question submissions: 30 per minute per user
- XP updates: 50 per minute per user

## Monitoring and Alerting

### Application Monitoring
- Error tracking and logging
- Performance metrics collection
- User analytics and learning data
- Real-time application health checks

### Infrastructure Monitoring
- Database performance and connections
- CDN cache hit rates and response times
- SSL certificate expiration
- Domain and DNS health

### Alert Configuration
- High error rates (>5% in 5 minutes)
- Slow response times (>2s average)
- Database connection issues
- Failed authentication attempts (>50/hour)
- SSL certificate expiration (30 days)

## Backup and Recovery

### Automated Backups
```bash
# Full backup (daily at 2 AM UTC)
node scripts/backup-strategy.js full

# Incremental backup (every 6 hours)
node scripts/backup-strategy.js incremental "2024-01-01T00:00:00Z"

# Cleanup old backups (retain 30 days)
node scripts/backup-strategy.js cleanup 30
```

### Recovery Procedures
```bash
# Restore from backup
node scripts/backup-strategy.js restore /path/to/backup.tar.gz

# Verify restoration
npm run test:integration
```

### Disaster Recovery Plan
1. **Database Failure**: Restore from latest backup (RTO: 30 minutes)
2. **Application Failure**: Automatic rollback via Vercel (RTO: 5 minutes)
3. **CDN Failure**: Fallback to origin server (automatic)
4. **Complete Outage**: Restore from backup to new infrastructure (RTO: 2 hours)

## Performance Optimization

### Bundle Optimization
- Code splitting by route and vendor libraries
- Tree shaking to remove unused code
- Asset compression and minification
- Service worker for offline functionality

### CDN Configuration
- Static asset caching (1 year)
- HTML caching (5 minutes)
- API response caching (disabled)
- Image optimization and WebP conversion

### Database Optimization
- Query optimization and indexing
- Connection pooling
- Read replicas for analytics queries
- Automated vacuum and analyze

## Rollback Procedures

### Automatic Rollback
- Triggered on deployment failure
- Health check failures
- Critical error rate threshold exceeded

### Manual Rollback
```bash
# Rollback to previous version
vercel rollback --token $VERCEL_TOKEN

# Or rollback to specific deployment
vercel rollback [deployment-url] --token $VERCEL_TOKEN
```

### Database Rollback
```bash
# Restore database from backup
node scripts/backup-strategy.js restore /path/to/previous-backup.tar.gz

# Run any necessary migration rollbacks
npm run migrate:rollback
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly
- [ ] Review error logs and performance metrics
- [ ] Check backup integrity
- [ ] Update dependencies (security patches)
- [ ] Review user feedback and support tickets

#### Monthly
- [ ] Security audit and vulnerability scan
- [ ] Performance optimization review
- [ ] Database maintenance (vacuum, reindex)
- [ ] SSL certificate renewal check
- [ ] Disaster recovery test

#### Quarterly
- [ ] Full security penetration test
- [ ] Capacity planning review
- [ ] Backup and recovery procedure test
- [ ] Documentation updates
- [ ] Third-party service review

### Emergency Procedures

#### High Error Rate
1. Check application logs for error patterns
2. Verify database connectivity and performance
3. Check third-party service status
4. Consider temporary rate limiting increase
5. Rollback if necessary

#### Database Issues
1. Check connection pool status
2. Review slow query log
3. Monitor disk space and memory usage
4. Consider read-only mode if necessary
5. Restore from backup if corrupted

#### Security Incident
1. Immediately block suspicious IPs
2. Review authentication logs
3. Check for data breaches
4. Notify users if necessary
5. Update security measures

## Support and Troubleshooting

### Common Issues

#### Deployment Failures
- Check build logs for errors
- Verify environment variables
- Ensure all tests pass
- Check for dependency conflicts

#### Performance Issues
- Review monitoring dashboards
- Check database query performance
- Verify CDN cache hit rates
- Monitor memory and CPU usage

#### Authentication Problems
- Verify Supabase configuration
- Check JWT token validity
- Review RLS policies
- Test email delivery

### Getting Help
- GitHub Issues: Technical problems and bug reports
- Slack Channel: Real-time support and discussions
- Documentation: Comprehensive guides and API reference
- Monitoring Dashboards: Real-time system status

## Compliance and Security

### Data Protection
- COPPA compliance for users under 13
- GDPR compliance for EU users
- Data encryption at rest and in transit
- Regular security audits

### Privacy Controls
- Parental consent workflows
- Data retention policies
- User data export/deletion
- Privacy-by-design principles

### Audit Trail
- All user actions logged
- Administrative actions tracked
- Database changes recorded
- Security events monitored