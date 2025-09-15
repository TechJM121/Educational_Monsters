#!/usr/bin/env node

/**
 * Security audit and penetration testing script
 * Performs automated security checks and vulnerability assessments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAuditor {
  constructor() {
    this.reportDir = path.join(__dirname, '../security-reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async runFullAudit() {
    console.log('🔒 Starting comprehensive security audit...');
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      tests: {}
    };

    try {
      // 1. Dependency vulnerability scan
      results.tests.dependencies = await this.auditDependencies();
      
      // 2. Code security analysis
      results.tests.codeAnalysis = await this.analyzeCode();
      
      // 3. Configuration security check
      results.tests.configuration = await this.checkConfiguration();
      
      // 4. Authentication security test
      results.tests.authentication = await this.testAuthentication();
      
      // 5. API security assessment
      results.tests.apiSecurity = await this.assessApiSecurity();
      
      // 6. Client-side security check
      results.tests.clientSecurity = await this.checkClientSecurity();
      
      // 7. Database security audit
      results.tests.database = await this.auditDatabase();
      
      // 8. Infrastructure security scan
      results.tests.infrastructure = await this.scanInfrastructure();
      
      // Generate comprehensive report
      await this.generateReport(results);
      
      console.log('✅ Security audit completed successfully');
      return results;
      
    } catch (error) {
      console.error('❌ Security audit failed:', error);
      throw error;
    }
  }

  async auditDependencies() {
    console.log('📦 Auditing dependencies for vulnerabilities...');
    
    const results = {
      status: 'pass',
      vulnerabilities: [],
      recommendations: []
    };

    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { 
        cwd: path.join(__dirname, '../'),
        encoding: 'utf8' 
      });
      
      const auditData = JSON.parse(auditOutput);
      
      if (auditData.metadata.vulnerabilities.total > 0) {
        results.status = auditData.metadata.vulnerabilities.high > 0 ? 'fail' : 'warn';
        results.vulnerabilities = Object.values(auditData.vulnerabilities || {});
        
        if (auditData.metadata.vulnerabilities.high > 0) {
          results.recommendations.push('Fix high-severity vulnerabilities immediately');
        }
        if (auditData.metadata.vulnerabilities.moderate > 0) {
          results.recommendations.push('Review and fix moderate vulnerabilities');
        }
      }
      
      // Check for known malicious packages
      const suspiciousPatterns = [
        'bitcoin', 'crypto-miner', 'keylogger', 'backdoor'
      ];
      
      const packageJson = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../package.json'), 'utf8'
      ));
      
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const [pkg, version] of Object.entries(allDeps)) {
        if (suspiciousPatterns.some(pattern => pkg.includes(pattern))) {
          results.vulnerabilities.push({
            name: pkg,
            severity: 'high',
            title: 'Potentially malicious package detected'
          });
          results.status = 'fail';
        }
      }
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async analyzeCode() {
    console.log('🔍 Analyzing code for security issues...');
    
    const results = {
      status: 'pass',
      issues: [],
      recommendations: []
    };

    try {
      // Check for hardcoded secrets
      const secretPatterns = [
        /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi,
        /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]+['"]/gi,
        /(?:secret|token)\s*[:=]\s*['"][^'"]+['"]/gi,
        /(?:private[_-]?key)\s*[:=]\s*['"][^'"]+['"]/gi
      ];

      const sourceFiles = this.getSourceFiles();
      
      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of secretPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            results.issues.push({
              file: file.replace(path.join(__dirname, '../'), ''),
              type: 'hardcoded-secret',
              severity: 'high',
              matches: matches.length
            });
            results.status = 'fail';
          }
        }
        
        // Check for dangerous functions
        const dangerousPatterns = [
          /eval\s*\(/gi,
          /innerHTML\s*=/gi,
          /document\.write\s*\(/gi,
          /dangerouslySetInnerHTML/gi
        ];
        
        for (const pattern of dangerousPatterns) {
          if (pattern.test(content)) {
            results.issues.push({
              file: file.replace(path.join(__dirname, '../'), ''),
              type: 'dangerous-function',
              severity: 'medium',
              pattern: pattern.source
            });
            if (results.status === 'pass') results.status = 'warn';
          }
        }
      }
      
      if (results.issues.length > 0) {
        results.recommendations.push('Review and fix identified security issues');
        results.recommendations.push('Use environment variables for sensitive data');
        results.recommendations.push('Implement proper input sanitization');
      }
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async checkConfiguration() {
    console.log('⚙️ Checking security configuration...');
    
    const results = {
      status: 'pass',
      issues: [],
      recommendations: []
    };

    try {
      // Check environment variables
      const requiredEnvVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY'
      ];
      
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          results.issues.push({
            type: 'missing-env-var',
            severity: 'high',
            variable: envVar
          });
          results.status = 'fail';
        }
      }
      
      // Check for development configurations in production
      if (process.env.NODE_ENV === 'production') {
        const devPatterns = [
          'localhost',
          '127.0.0.1',
          'debug',
          'development'
        ];
        
        const envContent = fs.readFileSync(
          path.join(__dirname, '../.env'), 'utf8'
        ).toLowerCase();
        
        for (const pattern of devPatterns) {
          if (envContent.includes(pattern)) {
            results.issues.push({
              type: 'dev-config-in-prod',
              severity: 'high',
              pattern
            });
            results.status = 'fail';
          }
        }
      }
      
      // Check Vercel configuration
      const vercelConfig = path.join(__dirname, '../vercel.json');
      if (fs.existsSync(vercelConfig)) {
        const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
        
        // Check security headers
        const requiredHeaders = [
          'X-Content-Type-Options',
          'X-Frame-Options',
          'X-XSS-Protection',
          'Strict-Transport-Security',
          'Content-Security-Policy'
        ];
        
        const headers = config.headers?.[0]?.headers || [];
        const headerKeys = headers.map(h => h.key);
        
        for (const requiredHeader of requiredHeaders) {
          if (!headerKeys.includes(requiredHeader)) {
            results.issues.push({
              type: 'missing-security-header',
              severity: 'medium',
              header: requiredHeader
            });
            if (results.status === 'pass') results.status = 'warn';
          }
        }
      }
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async testAuthentication() {
    console.log('🔐 Testing authentication security...');
    
    const results = {
      status: 'pass',
      tests: [],
      recommendations: []
    };

    // This would typically test against a running instance
    // For now, we'll check authentication-related code
    
    try {
      const authFiles = this.getSourceFiles().filter(file => 
        file.includes('auth') || file.includes('login') || file.includes('signup')
      );
      
      for (const file of authFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for proper password handling
        if (content.includes('password') && !content.includes('hash')) {
          results.tests.push({
            test: 'password-handling',
            status: 'warn',
            file: file.replace(path.join(__dirname, '../'), ''),
            message: 'Ensure passwords are properly hashed'
          });
          if (results.status === 'pass') results.status = 'warn';
        }
        
        // Check for session management
        if (content.includes('session') || content.includes('token')) {
          results.tests.push({
            test: 'session-management',
            status: 'pass',
            file: file.replace(path.join(__dirname, '../'), ''),
            message: 'Session/token management found'
          });
        }
      }
      
      results.recommendations.push('Implement proper session timeout');
      results.recommendations.push('Use secure password requirements');
      results.recommendations.push('Enable account lockout after failed attempts');
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async assessApiSecurity() {
    console.log('🌐 Assessing API security...');
    
    const results = {
      status: 'pass',
      endpoints: [],
      recommendations: []
    };

    try {
      // Check for API-related files
      const apiFiles = this.getSourceFiles().filter(file => 
        file.includes('api') || file.includes('service') || file.includes('client')
      );
      
      for (const file of apiFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for proper error handling
        if (content.includes('fetch') || content.includes('axios')) {
          const hasErrorHandling = content.includes('catch') || content.includes('error');
          
          results.endpoints.push({
            file: file.replace(path.join(__dirname, '../'), ''),
            hasErrorHandling,
            status: hasErrorHandling ? 'pass' : 'warn'
          });
          
          if (!hasErrorHandling && results.status === 'pass') {
            results.status = 'warn';
          }
        }
        
        // Check for input validation
        if (content.includes('validate') || content.includes('sanitize')) {
          results.endpoints.push({
            file: file.replace(path.join(__dirname, '../'), ''),
            hasValidation: true,
            status: 'pass'
          });
        }
      }
      
      results.recommendations.push('Implement proper input validation');
      results.recommendations.push('Use HTTPS for all API calls');
      results.recommendations.push('Implement rate limiting');
      results.recommendations.push('Sanitize all user inputs');
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async checkClientSecurity() {
    console.log('💻 Checking client-side security...');
    
    const results = {
      status: 'pass',
      checks: [],
      recommendations: []
    };

    try {
      // Check for XSS vulnerabilities
      const componentFiles = this.getSourceFiles().filter(file => 
        file.endsWith('.tsx') || file.endsWith('.jsx')
      );
      
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for dangerous HTML insertion
        if (content.includes('dangerouslySetInnerHTML')) {
          results.checks.push({
            type: 'xss-risk',
            severity: 'high',
            file: file.replace(path.join(__dirname, '../'), ''),
            message: 'dangerouslySetInnerHTML usage detected'
          });
          results.status = 'fail';
        }
        
        // Check for proper data sanitization
        if (content.includes('sanitize') || content.includes('escape')) {
          results.checks.push({
            type: 'sanitization',
            severity: 'good',
            file: file.replace(path.join(__dirname, '../'), ''),
            message: 'Data sanitization found'
          });
        }
      }
      
      // Check for Content Security Policy
      const indexHtml = path.join(__dirname, '../index.html');
      if (fs.existsSync(indexHtml)) {
        const content = fs.readFileSync(indexHtml, 'utf8');
        
        if (!content.includes('Content-Security-Policy')) {
          results.checks.push({
            type: 'csp-missing',
            severity: 'medium',
            file: 'index.html',
            message: 'Content Security Policy not found in HTML'
          });
          if (results.status === 'pass') results.status = 'warn';
        }
      }
      
      results.recommendations.push('Implement Content Security Policy');
      results.recommendations.push('Sanitize all user-generated content');
      results.recommendations.push('Use HTTPS for all external resources');
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async auditDatabase() {
    console.log('🗄️ Auditing database security...');
    
    const results = {
      status: 'pass',
      checks: [],
      recommendations: []
    };

    try {
      // Check Supabase configuration files
      const supabaseDir = path.join(__dirname, '../supabase');
      
      if (fs.existsSync(supabaseDir)) {
        const migrationFiles = fs.readdirSync(supabaseDir)
          .filter(file => file.endsWith('.sql'));
        
        for (const file of migrationFiles) {
          const content = fs.readFileSync(
            path.join(supabaseDir, file), 'utf8'
          ).toLowerCase();
          
          // Check for RLS policies
          if (content.includes('row level security') || content.includes('enable rls')) {
            results.checks.push({
              type: 'rls-enabled',
              status: 'pass',
              file,
              message: 'Row Level Security policies found'
            });
          }
          
          // Check for proper indexing
          if (content.includes('create index')) {
            results.checks.push({
              type: 'indexing',
              status: 'pass',
              file,
              message: 'Database indexes found'
            });
          }
          
          // Check for dangerous operations
          if (content.includes('drop table') || content.includes('truncate')) {
            results.checks.push({
              type: 'dangerous-operation',
              status: 'warn',
              file,
              message: 'Potentially dangerous database operation'
            });
            if (results.status === 'pass') results.status = 'warn';
          }
        }
      }
      
      results.recommendations.push('Enable Row Level Security on all tables');
      results.recommendations.push('Use parameterized queries to prevent SQL injection');
      results.recommendations.push('Implement proper database backup strategy');
      results.recommendations.push('Monitor database performance and security logs');
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async scanInfrastructure() {
    console.log('🏗️ Scanning infrastructure security...');
    
    const results = {
      status: 'pass',
      scans: [],
      recommendations: []
    };

    try {
      // Check deployment configuration
      const deployFiles = [
        '../.github/workflows/deploy.yml',
        '../vercel.json',
        '../Dockerfile'
      ];
      
      for (const file of deployFiles) {
        const filePath = path.join(__dirname, file);
        
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check for secrets in deployment files
          if (content.includes('password') || content.includes('secret')) {
            const hasSecretRef = content.includes('secrets.') || content.includes('${{');
            
            results.scans.push({
              type: 'secrets-in-config',
              status: hasSecretRef ? 'pass' : 'fail',
              file: file.replace('../', ''),
              message: hasSecretRef ? 
                'Secrets properly referenced' : 
                'Potential hardcoded secrets found'
            });
            
            if (!hasSecretRef) results.status = 'fail';
          }
          
          // Check for HTTPS enforcement
          if (content.includes('http://') && !content.includes('localhost')) {
            results.scans.push({
              type: 'insecure-http',
              status: 'warn',
              file: file.replace('../', ''),
              message: 'HTTP URLs found, ensure HTTPS in production'
            });
            if (results.status === 'pass') results.status = 'warn';
          }
        }
      }
      
      results.recommendations.push('Use HTTPS for all external communications');
      results.recommendations.push('Store secrets in secure environment variables');
      results.recommendations.push('Implement proper access controls');
      results.recommendations.push('Enable security monitoring and alerting');
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  async generateReport(results) {
    console.log('📊 Generating security audit report...');
    
    const reportPath = path.join(
      this.reportDir, 
      `security-audit-${this.timestamp}.json`
    );
    
    // Calculate overall security score
    const totalTests = Object.keys(results.tests).length;
    const passedTests = Object.values(results.tests)
      .filter(test => test.status === 'pass').length;
    const failedTests = Object.values(results.tests)
      .filter(test => test.status === 'fail').length;
    
    results.summary = {
      totalTests,
      passedTests,
      failedTests,
      warningTests: totalTests - passedTests - failedTests,
      securityScore: Math.round((passedTests / totalTests) * 100),
      overallStatus: failedTests > 0 ? 'FAIL' : 
                    (totalTests - passedTests - failedTests > 0 ? 'WARNING' : 'PASS')
    };
    
    // Save detailed JSON report
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    // Generate human-readable report
    const htmlReport = this.generateHtmlReport(results);
    const htmlPath = path.join(
      this.reportDir, 
      `security-audit-${this.timestamp}.html`
    );
    fs.writeFileSync(htmlPath, htmlReport);
    
    console.log(`📋 Security audit report saved to: ${reportPath}`);
    console.log(`🌐 HTML report saved to: ${htmlPath}`);
    
    // Print summary
    console.log('\n📊 Security Audit Summary:');
    console.log(`Overall Status: ${results.summary.overallStatus}`);
    console.log(`Security Score: ${results.summary.securityScore}%`);
    console.log(`Tests Passed: ${results.summary.passedTests}/${totalTests}`);
    
    if (results.summary.overallStatus === 'FAIL') {
      console.log('\n❌ Critical security issues found! Review the report immediately.');
      process.exit(1);
    } else if (results.summary.overallStatus === 'WARNING') {
      console.log('\n⚠️ Security warnings found. Review and address when possible.');
    } else {
      console.log('\n✅ All security checks passed!');
    }
  }

  generateHtmlReport(results) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Security Audit Report - ${results.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .pass { color: #28a745; }
        .warn { color: #ffc107; }
        .fail { color: #dc3545; }
        .test-section { margin: 20px 0; }
        .test-result { padding: 10px; margin: 5px 0; border-radius: 3px; }
        .test-result.pass { background: #d4edda; }
        .test-result.warn { background: #fff3cd; }
        .test-result.fail { background: #f8d7da; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Security Audit Report</h1>
        <p>Generated: ${results.timestamp}</p>
        <p>Environment: ${results.environment}</p>
        <h2 class="${results.summary.overallStatus.toLowerCase()}">
            Overall Status: ${results.summary.overallStatus}
        </h2>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Security Score</h3>
            <div style="font-size: 2em; font-weight: bold;">
                ${results.summary.securityScore}%
            </div>
        </div>
        <div class="metric">
            <h3>Tests Passed</h3>
            <div style="font-size: 2em; font-weight: bold;" class="pass">
                ${results.summary.passedTests}
            </div>
        </div>
        <div class="metric">
            <h3>Warnings</h3>
            <div style="font-size: 2em; font-weight: bold;" class="warn">
                ${results.summary.warningTests}
            </div>
        </div>
        <div class="metric">
            <h3>Failures</h3>
            <div style="font-size: 2em; font-weight: bold;" class="fail">
                ${results.summary.failedTests}
            </div>
        </div>
    </div>
    
    ${Object.entries(results.tests).map(([testName, testResult]) => `
        <div class="test-section">
            <h3>${testName.charAt(0).toUpperCase() + testName.slice(1)}</h3>
            <div class="test-result ${testResult.status}">
                <strong>Status:</strong> ${testResult.status.toUpperCase()}
                ${testResult.error ? `<br><strong>Error:</strong> ${testResult.error}` : ''}
                ${testResult.recommendations ? `
                    <br><strong>Recommendations:</strong>
                    <ul>
                        ${testResult.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        </div>
    `).join('')}
</body>
</html>
    `;
  }

  getSourceFiles() {
    const sourceDir = path.join(__dirname, '../src');
    const files = [];
    
    function walkDir(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
          files.push(fullPath);
        }
      }
    }
    
    if (fs.existsSync(sourceDir)) {
      walkDir(sourceDir);
    }
    
    return files;
  }
}

// CLI interface
async function main() {
  const auditor = new SecurityAuditor();
  
  try {
    await auditor.runFullAudit();
  } catch (error) {
    console.error('Security audit failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SecurityAuditor;