/**
 * Visual Regression Test Runner
 * Orchestrates comprehensive visual testing across all configurations
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestConfiguration {
  name: string;
  theme: string;
  viewport: string;
  browser: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
}

interface TestResult {
  configuration: TestConfiguration;
  passed: boolean;
  errors: string[];
  snapshots: string[];
  duration: number;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  summary: {
    byTheme: Record<string, { passed: number; failed: number }>;
    byViewport: Record<string, { passed: number; failed: number }>;
    byBrowser: Record<string, { passed: number; failed: number }>;
  };
}

export class VisualRegressionRunner {
  private outputDir: string;
  private snapshotDir: string;
  private reportDir: string;

  constructor() {
    this.outputDir = join(process.cwd(), 'test-results', 'visual-regression');
    this.snapshotDir = join(this.outputDir, 'snapshots');
    this.reportDir = join(this.outputDir, 'reports');
    
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.outputDir, this.snapshotDir, this.reportDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  async runAllTests(): Promise<TestReport> {
    console.log('🎨 Starting comprehensive visual regression tests...\n');
    
    const configurations = this.generateTestConfigurations();
    const results: TestResult[] = [];
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    for (const config of configurations) {
      console.log(`Testing: ${config.name}`);
      
      const startTime = Date.now();
      const result = await this.runTestConfiguration(config);
      const duration = Date.now() - startTime;
      
      result.duration = duration;
      results.push(result);
      
      totalTests++;
      if (result.passed) {
        passedTests++;
        console.log(`✅ ${config.name} (${duration}ms)`);
      } else {
        failedTests++;
        console.log(`❌ ${config.name} (${duration}ms)`);
        result.errors.forEach(error => console.log(`   Error: ${error}`));
      }
    }

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests,
      results,
      summary: this.generateSummary(results)
    };

    await this.generateReport(report);
    this.printSummary(report);

    return report;
  }

  private generateTestConfigurations(): TestConfiguration[] {
    const themes = ['light', 'dark', 'highContrast'];
    const viewports = ['mobile', 'tablet', 'desktop', 'wide'];
    const browsers = ['chrome', 'firefox', 'safari', 'edge'];
    
    const configurations: TestConfiguration[] = [];

    // Standard configurations
    themes.forEach(theme => {
      viewports.forEach(viewport => {
        browsers.forEach(browser => {
          configurations.push({
            name: `${theme}-${viewport}-${browser}`,
            theme,
            viewport,
            browser
          });
        });
      });
    });

    // Accessibility configurations
    configurations.push(
      {
        name: 'reduced-motion-light-desktop-chrome',
        theme: 'light',
        viewport: 'desktop',
        browser: 'chrome',
        reducedMotion: true
      },
      {
        name: 'high-contrast-desktop-chrome',
        theme: 'highContrast',
        viewport: 'desktop',
        browser: 'chrome',
        highContrast: true
      }
    );

    return configurations;
  }

  private async runTestConfiguration(config: TestConfiguration): Promise<TestResult> {
    try {
      // Set environment variables for the test
      const env = {
        ...process.env,
        VITEST_THEME: config.theme,
        VITEST_VIEWPORT: config.viewport,
        VITEST_BROWSER: config.browser,
        VITEST_REDUCED_MOTION: config.reducedMotion ? 'true' : 'false',
        VITEST_HIGH_CONTRAST: config.highContrast ? 'true' : 'false'
      };

      // Run the visual regression tests
      const command = 'npm run test -- src/test/visual-regression/components.test.tsx --run --reporter=json';
      const output = execSync(command, { 
        env, 
        encoding: 'utf8',
        cwd: join(process.cwd(), 'educational-rpg-tutor')
      });

      const testOutput = JSON.parse(output);
      
      return {
        configuration: config,
        passed: testOutput.success,
        errors: testOutput.errors || [],
        snapshots: this.extractSnapshots(testOutput),
        duration: 0 // Will be set by caller
      };
    } catch (error) {
      return {
        configuration: config,
        passed: false,
        errors: [error instanceof Error ? error.message : String(error)],
        snapshots: [],
        duration: 0
      };
    }
  }

  private extractSnapshots(testOutput: any): string[] {
    // Extract snapshot information from test output
    const snapshots: string[] = [];
    
    if (testOutput.testResults) {
      testOutput.testResults.forEach((result: any) => {
        if (result.assertionResults) {
          result.assertionResults.forEach((assertion: any) => {
            if (assertion.title.includes('snapshot')) {
              snapshots.push(assertion.title);
            }
          });
        }
      });
    }
    
    return snapshots;
  }

  private generateSummary(results: TestResult[]) {
    const summary = {
      byTheme: {} as Record<string, { passed: number; failed: number }>,
      byViewport: {} as Record<string, { passed: number; failed: number }>,
      byBrowser: {} as Record<string, { passed: number; failed: number }>
    };

    results.forEach(result => {
      const { theme, viewport, browser } = result.configuration;
      
      // Initialize counters
      if (!summary.byTheme[theme]) {
        summary.byTheme[theme] = { passed: 0, failed: 0 };
      }
      if (!summary.byViewport[viewport]) {
        summary.byViewport[viewport] = { passed: 0, failed: 0 };
      }
      if (!summary.byBrowser[browser]) {
        summary.byBrowser[browser] = { passed: 0, failed: 0 };
      }

      // Update counters
      const status = result.passed ? 'passed' : 'failed';
      summary.byTheme[theme][status]++;
      summary.byViewport[viewport][status]++;
      summary.byBrowser[browser][status]++;
    });

    return summary;
  }

  private async generateReport(report: TestReport): Promise<void> {
    // Generate JSON report
    const jsonReport = join(this.reportDir, `visual-regression-${Date.now()}.json`);
    writeFileSync(jsonReport, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlReportPath = join(this.reportDir, `visual-regression-${Date.now()}.html`);
    writeFileSync(htmlReportPath, htmlReport);

    console.log(`\n📊 Reports generated:`);
    console.log(`   JSON: ${jsonReport}`);
    console.log(`   HTML: ${htmlReportPath}`);
  }

  private generateHTMLReport(report: TestReport): string {
    const passRate = ((report.passedTests / report.totalTests) * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Regression Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .header .timestamp { color: #666; font-size: 14px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .stat-card h3 { margin: 0 0 10px 0; color: #333; }
        .stat-card .number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #007bff; }
        .pass-rate { color: #17a2b8; }
        .summary-section { margin-bottom: 40px; }
        .summary-section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 6px; }
        .summary-card h3 { margin-top: 0; color: #333; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px; background: white; border-radius: 4px; }
        .results-section { margin-bottom: 40px; }
        .result-item { background: #f8f9fa; margin-bottom: 10px; padding: 15px; border-radius: 6px; border-left: 4px solid #ddd; }
        .result-item.passed { border-left-color: #28a745; }
        .result-item.failed { border-left-color: #dc3545; }
        .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .result-name { font-weight: bold; color: #333; }
        .result-duration { color: #666; font-size: 14px; }
        .result-errors { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px; padding: 10px; margin-top: 10px; }
        .result-errors h4 { margin: 0 0 10px 0; color: #c53030; }
        .error-item { background: white; padding: 8px; margin-bottom: 5px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Visual Regression Test Report</h1>
            <div class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</div>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>Total Tests</h3>
                <div class="number total">${report.totalTests}</div>
            </div>
            <div class="stat-card">
                <h3>Passed</h3>
                <div class="number passed">${report.passedTests}</div>
            </div>
            <div class="stat-card">
                <h3>Failed</h3>
                <div class="number failed">${report.failedTests}</div>
            </div>
            <div class="stat-card">
                <h3>Pass Rate</h3>
                <div class="number pass-rate">${passRate}%</div>
            </div>
        </div>

        <div class="summary-section">
            <h2>Summary by Category</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>By Theme</h3>
                    ${Object.entries(report.summary.byTheme).map(([theme, stats]) => `
                        <div class="summary-item">
                            <span>${theme}</span>
                            <span><span class="passed">${stats.passed}</span> / <span class="failed">${stats.failed}</span></span>
                        </div>
                    `).join('')}
                </div>
                <div class="summary-card">
                    <h3>By Viewport</h3>
                    ${Object.entries(report.summary.byViewport).map(([viewport, stats]) => `
                        <div class="summary-item">
                            <span>${viewport}</span>
                            <span><span class="passed">${stats.passed}</span> / <span class="failed">${stats.failed}</span></span>
                        </div>
                    `).join('')}
                </div>
                <div class="summary-card">
                    <h3>By Browser</h3>
                    ${Object.entries(report.summary.byBrowser).map(([browser, stats]) => `
                        <div class="summary-item">
                            <span>${browser}</span>
                            <span><span class="passed">${stats.passed}</span> / <span class="failed">${stats.failed}</span></span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="results-section">
            <h2>Detailed Results</h2>
            ${report.results.map(result => `
                <div class="result-item ${result.passed ? 'passed' : 'failed'}">
                    <div class="result-header">
                        <div class="result-name">${result.configuration.name}</div>
                        <div class="result-duration">${result.duration}ms</div>
                    </div>
                    <div>
                        Theme: ${result.configuration.theme} | 
                        Viewport: ${result.configuration.viewport} | 
                        Browser: ${result.configuration.browser}
                        ${result.configuration.reducedMotion ? ' | Reduced Motion' : ''}
                        ${result.configuration.highContrast ? ' | High Contrast' : ''}
                    </div>
                    ${result.errors.length > 0 ? `
                        <div class="result-errors">
                            <h4>Errors:</h4>
                            ${result.errors.map(error => `<div class="error-item">${error}</div>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  private printSummary(report: TestReport): void {
    const passRate = ((report.passedTests / report.totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎨 VISUAL REGRESSION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.passedTests}`);
    console.log(`❌ Failed: ${report.failedTests}`);
    console.log(`📊 Pass Rate: ${passRate}%`);
    console.log('='.repeat(60));

    if (report.failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      report.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`   • ${result.configuration.name}`);
          result.errors.forEach(error => {
            console.log(`     Error: ${error}`);
          });
        });
    }

    console.log('\n📊 Summary by Category:');
    console.log('\nBy Theme:');
    Object.entries(report.summary.byTheme).forEach(([theme, stats]) => {
      console.log(`   ${theme}: ${stats.passed} passed, ${stats.failed} failed`);
    });

    console.log('\nBy Viewport:');
    Object.entries(report.summary.byViewport).forEach(([viewport, stats]) => {
      console.log(`   ${viewport}: ${stats.passed} passed, ${stats.failed} failed`);
    });

    console.log('\nBy Browser:');
    Object.entries(report.summary.byBrowser).forEach(([browser, stats]) => {
      console.log(`   ${browser}: ${stats.passed} passed, ${stats.failed} failed`);
    });
  }

  async runSingleTest(configName: string): Promise<TestResult | null> {
    const configurations = this.generateTestConfigurations();
    const config = configurations.find(c => c.name === configName);
    
    if (!config) {
      console.error(`Configuration "${configName}" not found`);
      return null;
    }

    console.log(`Running single test: ${configName}`);
    const startTime = Date.now();
    const result = await this.runTestConfiguration(config);
    result.duration = Date.now() - startTime;

    if (result.passed) {
      console.log(`✅ ${configName} passed (${result.duration}ms)`);
    } else {
      console.log(`❌ ${configName} failed (${result.duration}ms)`);
      result.errors.forEach(error => console.log(`   Error: ${error}`));
    }

    return result;
  }

  listConfigurations(): void {
    const configurations = this.generateTestConfigurations();
    
    console.log('Available test configurations:');
    configurations.forEach(config => {
      console.log(`   • ${config.name}`);
    });
  }
}

// CLI interface
if (require.main === module) {
  const runner = new VisualRegressionRunner();
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'run':
      if (arg) {
        runner.runSingleTest(arg);
      } else {
        runner.runAllTests();
      }
      break;
    case 'list':
      runner.listConfigurations();
      break;
    default:
      console.log('Usage:');
      console.log('  npm run visual-regression run [config-name]  # Run all tests or specific config');
      console.log('  npm run visual-regression list               # List available configurations');
  }
}