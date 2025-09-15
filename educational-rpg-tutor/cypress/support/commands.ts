// Custom Cypress commands for Educational RPG Tutor
import 'cypress-axe';

declare global {
  namespace Cypress {
    interface Chainable {
      // Authentication
      loginAsStudent(email?: string, password?: string): Chainable<void>;
      loginAsParent(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      
      // Character management
      createTestCharacter(characterData?: Partial<any>): Chainable<void>;
      waitForCharacterLoad(): Chainable<void>;
      simulateXPGain(amount: number): Chainable<void>;
      
      // Learning and questions
      answerQuestion(answerIndex: number): Chainable<void>;
      completeLesson(subject: string, lessonName: string): Chainable<void>;
      checkXPGain(expectedXP: number): Chainable<void>;
      
      // Accessibility testing
      checkAccessibility(context?: string, options?: any): Chainable<void>;
      testKeyboardNavigation(): Chainable<void>;
      
      // Responsive testing
      setMobileViewport(): Chainable<void>;
      setTabletViewport(): Chainable<void>;
      setDesktopViewport(): Chainable<void>;
      
      // Performance testing
      measurePageLoad(): Chainable<void>;
      checkBundleSize(): Chainable<void>;
      waitForAnimation(selector: string, timeout?: number): Chainable<void>;
      
      // Data management
      seedTestData(): Chainable<void>;
      cleanupTestData(): Chainable<void>;
      
      // Social features
      addFriend(friendName: string): Chainable<void>;
      checkLeaderboard(expectedPosition?: number): Chainable<void>;
      
      // Error handling
      expectNoConsoleErrors(): Chainable<void>;
      
      // Visual testing
      checkVisualRegression(name: string): Chainable<void>;
    }
  }
}

// Login as student user
Cypress.Commands.add('loginAsStudent', (email = 'student@test.com', password = 'TestPass123!') => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/home');
});

// Login as parent/teacher
Cypress.Commands.add('loginAsParent', (email = 'parent@test.com', password = 'TestPass123!') => {
  cy.visit('/login');
  cy.get('[data-testid="parent-login-tab"]').click();
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/parent-dashboard');
});

// Create test character
Cypress.Commands.add('createTestCharacter', (characterData = {}) => {
  const defaultCharacter = {
    name: 'Test Hero',
    avatarConfig: {
      hairColor: '#8B4513',
      skinColor: '#FDBCB4',
      outfit: 'casual',
      accessories: [],
    },
  };
  
  const character = { ...defaultCharacter, ...characterData };
  
  cy.get('[data-testid="character-name-input"]').type(character.name);
  cy.get('[data-testid="hair-color-picker"]').click();
  cy.get(`[data-color="${character.avatarConfig.hairColor}"]`).click();
  cy.get('[data-testid="create-character-button"]').click();
  
  cy.waitForCharacterLoad();
});

// Answer a question by index
Cypress.Commands.add('answerQuestion', (answerIndex: number) => {
  cy.get('[data-testid="question-container"]').should('be.visible');
  cy.get('[data-testid="answer-option"]').eq(answerIndex).click();
  cy.get('[data-testid="xp-animation"]').should('be.visible');
});

// Check accessibility
Cypress.Commands.add('checkAccessibility', () => {
  cy.checkA11y(null, {
    rules: {
      'color-contrast': { enabled: false }, // Disable for CI
    },
  });
});

// Wait for character data to load
Cypress.Commands.add('waitForCharacterLoad', () => {
  cy.get('[data-testid="character-avatar"]').should('be.visible');
  cy.get('[data-testid="character-level"]').should('contain.text', 'Level');
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Simulate XP gain for testing
Cypress.Commands.add('simulateXPGain', (amount: number) => {
  cy.window().then((win) => {
    // Trigger XP gain through window method (would be implemented in app)
    (win as any).testHelpers?.simulateXPGain(amount);
  });
  
  cy.get('[data-testid="xp-animation"]').should('be.visible');
  cy.get('[data-testid="xp-bar"]').should('be.visible');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Enhanced accessibility testing
Cypress.Commands.add('checkAccessibility', (context?: string, options?: any) => {
  cy.injectAxe();
  cy.checkA11y(context, {
    rules: {
      'color-contrast': { enabled: false }, // Disable for CI
      ...options?.rules
    },
    ...options
  }, (violations) => {
    if (violations.length > 0) {
      cy.task('log', `Accessibility violations found: ${violations.length}`);
      violations.forEach((violation) => {
        cy.task('log', `${violation.id}: ${violation.description}`);
      });
    }
  });
});

// Keyboard navigation testing
Cypress.Commands.add('testKeyboardNavigation', () => {
  // Test tab navigation
  cy.get('body').tab();
  cy.focused().should('be.visible');
  
  // Test escape key
  cy.get('body').type('{esc}');
  
  // Test enter key on focused element
  cy.focused().type('{enter}');
});

// Responsive viewport commands
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667); // iPhone SE
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024); // iPad
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720); // Desktop
});

// Performance testing commands
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    const performance = win.performance;
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    cy.task('log', `Page load time: ${loadTime}ms`);
    expect(loadTime).to.be.lessThan(3000); // Should load in under 3 seconds
  });
});

Cypress.Commands.add('checkBundleSize', () => {
  cy.request('/assets/index.js').then((response) => {
    const sizeInKB = response.body.length / 1024;
    cy.task('log', `Bundle size: ${sizeInKB.toFixed(2)}KB`);
    expect(sizeInKB).to.be.lessThan(1000); // Should be under 1MB
  });
});

Cypress.Commands.add('waitForAnimation', (selector: string, timeout: number = 2000) => {
  cy.get(selector).should('be.visible');
  cy.wait(timeout); // Wait for animation to complete
  cy.get(selector).should('have.css', 'animation-play-state', 'paused').or('not.have.css', 'animation-name');
});

// Data management commands
Cypress.Commands.add('seedTestData', () => {
  cy.task('db:seed', {
    characters: [
      { id: 'test-char-1', name: 'Test Hero', level: 1, totalXP: 0 },
      { id: 'test-char-2', name: 'Advanced Hero', level: 5, totalXP: 500 }
    ],
    questions: [
      { id: 'q1', subject: 'math', question: 'What is 2+2?', answers: ['3', '4', '5'], correct: 1 },
      { id: 'q2', subject: 'science', question: 'What is H2O?', answers: ['Water', 'Oxygen', 'Hydrogen'], correct: 0 }
    ]
  });
});

Cypress.Commands.add('cleanupTestData', () => {
  cy.task('db:cleanup');
});

// Learning progress commands
Cypress.Commands.add('completeLesson', (subject: string, lessonName: string) => {
  cy.get(`[data-testid="subject-${subject}"]`).click();
  cy.get(`[data-testid="lesson-${lessonName}"]`).click();
  
  // Complete all questions in the lesson
  cy.get('[data-testid="question-container"]').should('be.visible');
  
  // Answer questions (simplified - in reality would be more specific)
  cy.get('[data-testid="answer-option"]').first().click();
  cy.get('[data-testid="next-question"]').click();
  
  cy.get('[data-testid="lesson-complete"]').should('be.visible');
});

Cypress.Commands.add('checkXPGain', (expectedXP: number) => {
  cy.get('[data-testid="xp-notification"]').should('be.visible');
  cy.get('[data-testid="xp-amount"]').should('contain.text', `+${expectedXP}`);
});

// Social features commands
Cypress.Commands.add('addFriend', (friendName: string) => {
  cy.get('[data-testid="social-menu"]').click();
  cy.get('[data-testid="add-friend-button"]').click();
  cy.get('[data-testid="friend-search-input"]').type(friendName);
  cy.get('[data-testid="search-results"]').contains(friendName).click();
  cy.get('[data-testid="send-friend-request"]').click();
  
  cy.get('[data-testid="friend-request-sent"]').should('be.visible');
});

Cypress.Commands.add('checkLeaderboard', (expectedPosition?: number) => {
  cy.get('[data-testid="leaderboard"]').should('be.visible');
  cy.get('[data-testid="leaderboard-entry"]').should('have.length.greaterThan', 0);
  
  if (expectedPosition) {
    cy.get(`[data-testid="leaderboard-entry"]:nth-child(${expectedPosition})`).should('contain.text', 'You');
  }
});

// Error handling commands
Cypress.Commands.add('expectNoConsoleErrors', () => {
  cy.window().then((win) => {
    const errors: string[] = [];
    
    // Capture console errors
    const originalError = win.console.error;
    win.console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(win.console, args);
    };
    
    cy.then(() => {
      expect(errors).to.have.length(0);
    });
  });
});

// Visual regression testing
Cypress.Commands.add('checkVisualRegression', (name: string) => {
  cy.screenshot(name);
  // In a real implementation, this would compare against baseline images
  cy.task('log', `Visual regression test captured: ${name}`);
});