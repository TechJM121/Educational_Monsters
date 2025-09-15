describe('Character Progression E2E', () => {
  beforeEach(() => {
    // Set up test data
    cy.task('log', 'Setting up character progression test');
    
    // Mock Supabase responses
    cy.intercept('POST', '**/auth/v1/token*', {
      fixture: 'auth/student-login.json'
    }).as('login');
    
    cy.intercept('GET', '**/rest/v1/characters*', {
      fixture: 'characters/test-character.json'
    }).as('getCharacter');
    
    cy.intercept('GET', '**/rest/v1/questions*', {
      fixture: 'questions/math-questions.json'
    }).as('getQuestions');
  });

  it('completes full learning journey from login to level up', () => {
    // Login as student
    cy.loginAsStudent();
    cy.wait('@login');
    
    // Verify home page loads
    cy.waitForCharacterLoad();
    cy.get('[data-testid="character-name"]').should('contain.text', 'Test Hero');
    cy.get('[data-testid="character-level"]').should('contain.text', 'Level 1');
    
    // Start learning session
    cy.get('[data-testid="start-learning-button"]').click();
    cy.wait('@getQuestions');
    
    // Answer questions correctly
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="question-text"]').should('be.visible');
      cy.answerQuestion(1); // Answer second option (assuming correct)
      
      // Verify XP gain
      cy.get('[data-testid="xp-gained"]').should('be.visible');
      cy.get('[data-testid="continue-button"]').click();
    }
    
    // Verify level up occurs
    cy.get('[data-testid="level-up-modal"]').should('be.visible');
    cy.get('[data-testid="new-level"]').should('contain.text', 'Level 2');
    cy.get('[data-testid="stat-points-available"]').should('contain.text', '3');
    
    // Allocate stat points
    cy.get('[data-testid="allocate-intelligence"]').click();
    cy.get('[data-testid="allocate-intelligence"]').click();
    cy.get('[data-testid="allocate-vitality"]').click();
    
    cy.get('[data-testid="confirm-allocation"]').click();
    
    // Verify character progression
    cy.get('[data-testid="character-level"]').should('contain.text', 'Level 2');
    cy.get('[data-testid="intelligence-stat"]').should('contain.text', '12');
    cy.get('[data-testid="vitality-stat"]').should('contain.text', '11');
  });

  it('handles achievement unlocking', () => {
    cy.loginAsStudent();
    cy.waitForCharacterLoad();
    
    // Mock achievement unlock
    cy.intercept('POST', '**/rest/v1/user_achievements*', {
      statusCode: 201,
      body: { id: 'achievement-1', achievement_id: 'math-novice' }
    }).as('unlockAchievement');
    
    // Complete math questions to trigger achievement
    cy.get('[data-testid="start-learning-button"]').click();
    
    // Answer 3 math questions correctly
    for (let i = 0; i < 3; i++) {
      cy.answerQuestion(1);
      cy.get('[data-testid="continue-button"]').click();
    }
    
    // Verify achievement notification
    cy.get('[data-testid="achievement-notification"]').should('be.visible');
    cy.get('[data-testid="achievement-name"]').should('contain.text', 'Math Novice');
    cy.get('[data-testid="achievement-badge"]').should('be.visible');
    
    // Check achievements page
    cy.get('[data-testid="view-achievements"]').click();
    cy.get('[data-testid="achievement-math-novice"]').should('be.visible');
  });

  it('supports responsive design across devices', () => {
    cy.loginAsStudent();
    
    // Test mobile viewport
    cy.setMobileViewport();
    cy.waitForCharacterLoad();
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    cy.get('[data-testid="character-avatar"]').should('be.visible');
    
    // Test tablet viewport
    cy.setTabletViewport();
    cy.get('[data-testid="character-stats"]').should('be.visible');
    
    // Test desktop viewport
    cy.setDesktopViewport();
    cy.get('[data-testid="sidebar-navigation"]').should('be.visible');
    cy.get('[data-testid="main-content"]').should('be.visible');
  });

  it('maintains accessibility standards', () => {
    cy.loginAsStudent();
    cy.waitForCharacterLoad();
    
    // Check home page accessibility
    cy.checkAccessibility();
    
    // Navigate to learning section
    cy.get('[data-testid="start-learning-button"]').click();
    cy.checkAccessibility();
    
    // Check question interface
    cy.get('[data-testid="question-container"]').should('be.visible');
    cy.checkAccessibility();
    
    // Test keyboard navigation
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'answer-option');
    
    // Test screen reader announcements
    cy.answerQuestion(1);
    cy.get('[aria-live="polite"]').should('contain.text', 'Correct! You earned');
  });

  it('handles offline scenarios gracefully', () => {
    cy.loginAsStudent();
    cy.waitForCharacterLoad();
    
    // Simulate offline mode
    cy.window().then((win) => {
      win.navigator.onLine = false;
      win.dispatchEvent(new Event('offline'));
    });
    
    // Verify offline indicator
    cy.get('[data-testid="offline-indicator"]').should('be.visible');
    
    // Try to answer questions offline
    cy.get('[data-testid="start-learning-button"]').click();
    cy.get('[data-testid="offline-message"]').should('contain.text', 'You are currently offline');
    
    // Simulate coming back online
    cy.window().then((win) => {
      win.navigator.onLine = true;
      win.dispatchEvent(new Event('online'));
    });
    
    // Verify sync occurs
    cy.get('[data-testid="syncing-indicator"]').should('be.visible');
    cy.get('[data-testid="sync-complete"]').should('be.visible');
  });

  it('handles error states appropriately', () => {
    // Mock network errors
    cy.intercept('GET', '**/rest/v1/characters*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('characterError');
    
    cy.loginAsStudent();
    cy.wait('@characterError');
    
    // Verify error handling
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="retry-button"]').should('be.visible');
    
    // Test retry functionality
    cy.intercept('GET', '**/rest/v1/characters*', {
      fixture: 'characters/test-character.json'
    }).as('characterRetry');
    
    cy.get('[data-testid="retry-button"]').click();
    cy.wait('@characterRetry');
    
    cy.waitForCharacterLoad();
  });
});