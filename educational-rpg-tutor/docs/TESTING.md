# Testing Guide for Educational RPG Tutor

## Overview

This document provides comprehensive guidelines for testing the Educational RPG Tutor application. Our testing strategy covers unit tests, integration tests, end-to-end tests, accessibility testing, performance testing, security testing, and load testing.

## Testing Stack

- **Unit/Integration Testing**: Vitest + React Testing Library
- **End-to-End Testing**: Cypress with custom commands
- **Accessibility Testing**: axe-core + cypress-axe + custom accessibility utilities
- **Performance Testing**: Lighthouse + Custom performance monitoring
- **Security Testing**: Custom security validation utilities
- **Load Testing**: Custom load testing framework

## Test Structure

```
src/
├── components/
│   └── **/__tests__/          # Component unit tests
├── hooks/
│   └── __tests__/             # Hook unit tests
├── services/
│   └── __tests__/             # Service unit tests
├── utils/
│   └── __tests__/             # Utility unit tests
└── test/
    ├── accessibility/         # Accessibility tests and utilities
    ├── integration/           # Integration tests
    ├── performance/           # Performance tests and utilities
    ├── security/              # Security tests and utilities
    ├── load/                  # Load testing scenarios
    ├── load-testing.ts        # Load testing framework
    ├── setup.ts              # Test setup configuration
    └── utils.tsx             # Test utilities and helpers

cypress/
├── e2e/                      # End-to-end tests
├── fixtures/                 # Test data fixtures (auth, characters, questions)
└── support/                  # Cypress support files and custom commands
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test src/components/character/__tests__/CharacterAvatar.test.tsx
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test src/test/integration/character-progression.test.tsx
```

### End-to-End Tests
```bash
# Run E2E tests headlessly
npm run test:e2e

# Open Cypress UI
npm run test:e2e:open

# Run specific E2E test
npx cypress run --spec "cypress/e2e/character-progression.cy.ts"
```

### Accessibility Tests
```bash
# Run accessibility tests
npm run test:accessibility

# Run accessibility tests for specific component
npm run test src/test/accessibility/character-avatar.a11y.test.tsx
```

### Performance Tests
```bash
# Run performance tests
npm run test src/test/performance/component-rendering.test.tsx

# Run Lighthouse performance audit
npm run test:performance
```

### Security Tests
```bash
# Run security tests
npm run test:security

# Run specific security test
npm run test src/test/security/auth-validation.test.ts
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Load Testing
```bash
# Run load testing scenarios
npm run test src/test/load/**/*.test.ts

# Run specific load test
npm run test src/test/load/load-test-scenarios.test.ts
```

### All Tests
```bash
# Run all test suites
npm run test:all

# Run CI test suite
npm run test:ci
```

## Writing Tests

### Unit Test Guidelines

1. **Test File Naming**: Use `.test.tsx` or `.test.ts` suffix
2. **Test Structure**: Follow Arrange-Act-Assert pattern
3. **Mock External Dependencies**: Mock Supabase, external APIs, etc.
4. **Use Test Utilities**: Leverage `src/test/utils.tsx` for common test helpers

Example unit test:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createMockCharacter } from '../../../test/utils';
import { CharacterAvatar } from '../CharacterAvatar';

describe('CharacterAvatar', () => {
  it('renders character name correctly', () => {
    const mockCharacter = createMockCharacter({ name: 'Test Hero' });
    
    renderWithProviders(<CharacterAvatar character={mockCharacter} />);
    
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
  });
});
```

### Integration Test Guidelines

1. **Test Real User Flows**: Test complete user journeys
2. **Mock External Services**: Use realistic mock data
3. **Test State Management**: Verify data flows between components
4. **Test Error Scenarios**: Include error handling tests

### E2E Test Guidelines

1. **Use Page Object Pattern**: Create reusable page objects
2. **Test Critical Paths**: Focus on core user journeys
3. **Use Custom Commands**: Leverage Cypress custom commands
4. **Test Across Devices**: Include responsive testing

Example E2E test:
```typescript
describe('Character Progression', () => {
  it('completes learning journey', () => {
    cy.loginAsStudent();
    cy.waitForCharacterLoad();
    
    cy.get('[data-testid="start-learning-button"]').click();
    cy.answerQuestion(1);
    
    cy.get('[data-testid="xp-gained"]').should('be.visible');
  });
});
```

### Accessibility Test Guidelines

1. **Test with axe-core**: Use automated accessibility testing
2. **Test Keyboard Navigation**: Verify tab order and focus management
3. **Test Screen Reader Support**: Include ARIA labels and announcements
4. **Test Color Contrast**: Ensure sufficient contrast ratios

### Performance Test Guidelines

1. **Measure Render Times**: Test component rendering performance
2. **Test Memory Usage**: Monitor memory leaks
3. **Test Animation Performance**: Verify smooth animations
4. **Test Bundle Size**: Monitor bundle size impact

### Security Test Guidelines

1. **Test Input Validation**: Verify XSS and injection prevention
2. **Test Authentication**: Verify auth flows and session management
3. **Test Authorization**: Verify access controls
4. **Test Data Sanitization**: Verify user input sanitization
5. **Test Rate Limiting**: Verify protection against brute force attacks
6. **Test COPPA Compliance**: Verify parental consent and data collection rules
7. **Test Session Security**: Verify secure session management

### Load Test Guidelines

1. **Test Concurrent Users**: Verify system handles multiple simultaneous users
2. **Test Database Performance**: Verify efficient database operations under load
3. **Test Memory Usage**: Monitor memory consumption and detect leaks
4. **Test Response Times**: Ensure acceptable performance under various loads
5. **Test Stress Scenarios**: Verify system stability under extreme conditions

## Test Data Management

### Mock Data Factories

Use the mock data factories in `src/test/utils.tsx`:

```typescript
// Create mock character
const mockCharacter = createMockCharacter({
  name: 'Custom Hero',
  level: 5,
});

// Create mock question
const mockQuestion = createMockQuestion({
  questionText: 'Custom question?',
  correctAnswer: 'Custom answer',
});

// Create mock achievement
const mockAchievement = createMockAchievement({
  name: 'Custom Achievement',
  description: 'Custom description',
});
```

### Cypress Fixtures

Store test data in `cypress/fixtures/`:

```json
// cypress/fixtures/characters/test-character.json
{
  "id": "test-character-id",
  "name": "Test Hero",
  "level": 1,
  "total_xp": 85
}
```

## Continuous Integration

### GitHub Actions Workflow

Our CI pipeline runs:

1. **Linting**: ESLint code quality checks
2. **Unit Tests**: All unit and integration tests
3. **Accessibility Tests**: Automated a11y testing
4. **Security Tests**: Security validation tests
5. **E2E Tests**: Full user journey testing
6. **Performance Tests**: Lighthouse audits
7. **Coverage Reports**: Code coverage analysis

### Coverage Requirements

- **Minimum Coverage**: 80% for lines, functions, branches, statements
- **Critical Components**: 90%+ coverage for core character and learning systems
- **New Code**: 100% coverage for new features

## Best Practices

### General Testing

1. **Write Tests First**: Follow TDD when possible
2. **Test Behavior, Not Implementation**: Focus on user-facing behavior
3. **Keep Tests Simple**: One assertion per test when possible
4. **Use Descriptive Names**: Test names should explain what is being tested
5. **Clean Up**: Properly clean up after tests

### Performance Considerations

1. **Parallel Testing**: Run tests in parallel when possible
2. **Mock Heavy Operations**: Mock expensive operations in unit tests
3. **Optimize Test Data**: Use minimal test data sets
4. **Cache Dependencies**: Cache node_modules in CI

### Debugging Tests

1. **Use Test UI**: `npm run test:ui` for interactive debugging
2. **Debug Mode**: Use `--debug` flag for detailed output
3. **Screenshots**: Cypress automatically captures screenshots on failure
4. **Console Logs**: Use `cy.task('log', message)` in Cypress tests

## Troubleshooting

### Common Issues

1. **Flaky Tests**: Add proper waits and assertions
2. **Memory Leaks**: Ensure proper cleanup in tests
3. **Timing Issues**: Use `waitFor` and proper async handling
4. **Mock Issues**: Verify mocks are properly reset between tests

### Getting Help

1. Check the test output for detailed error messages
2. Review the test documentation for specific testing patterns
3. Use the debugging tools provided by each testing framework
4. Consult the team's testing guidelines and conventions

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep testing libraries up to date
2. **Review Coverage**: Monitor and improve test coverage
3. **Clean Up**: Remove obsolete tests and test data
4. **Performance**: Monitor test execution times

### Test Review Process

1. **Code Reviews**: Include test reviews in PR process
2. **Coverage Reports**: Review coverage changes in PRs
3. **Performance Impact**: Monitor test suite performance
4. **Documentation**: Keep testing docs up to date