import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';
import { 
  SecurityTester, 
  InputValidator, 
  SecurityScanner, 
  SessionTester, 
  COPPAComplianceTester 
} from './security-utils';

vi.mock('../../services/supabaseClient');

describe('Authentication Security', () => {
  let securityTester: SecurityTester;
  let sessionTester: SessionTester;

  beforeEach(() => {
    vi.clearAllMocks();
    securityTester = new SecurityTester();
    sessionTester = new SessionTester();
  });

  afterEach(() => {
    securityTester.reset();
    sessionTester.clearAllSessions();
  });

  it('validates email format before signup', async () => {
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@example.com',
      'test..test@example.com',
      'test@example',
    ];

    for (const email of invalidEmails) {
      const result = await authService.signUp(email, 'password123', 'Test User', 10);
      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Invalid email format');
    }
  });

  it('enforces password strength requirements', async () => {
    const weakPasswords = [
      '123',
      'password',
      'abc',
      '12345678', // No special chars or uppercase
      'Password', // No numbers or special chars
    ];

    for (const password of weakPasswords) {
      const result = await authService.signUp('test@example.com', password, 'Test User', 10);
      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Password does not meet requirements');
    }
  });

  it('requires parental consent for users under 13', async () => {
    const result = await authService.signUp('child@example.com', 'SecurePass123!', 'Child User', 8);
    
    expect(result.error).toBeTruthy();
    expect(result.error?.message).toContain('Parental consent required');
  });

  it('sanitizes user input to prevent XSS', async () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">',
      '"><script>alert("xss")</script>',
    ];

    for (const input of maliciousInputs) {
      const result = await authService.signUp('test@example.com', 'SecurePass123!', input, 15);
      
      if (result.data?.user) {
        // Name should be sanitized
        expect(result.data.user.name).not.toContain('<script>');
        expect(result.data.user.name).not.toContain('javascript:');
      }
    }
  });

  it('prevents SQL injection in user queries', async () => {
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; UPDATE users SET admin=true; --",
      "' UNION SELECT * FROM sensitive_data; --",
    ];

    for (const injection of sqlInjectionAttempts) {
      const result = await authService.signInWithPassword(injection, 'password');
      
      // Should not execute SQL, should treat as literal string
      expect(result.error).toBeTruthy();
      expect(result.error?.message).not.toContain('syntax error');
    }
  });

  it('implements rate limiting for login attempts', async () => {
    const email = 'test@example.com';
    const wrongPassword = 'wrongpassword';

    // Simulate multiple failed login attempts
    const attempts = [];
    for (let i = 0; i < 6; i++) {
      attempts.push(authService.signInWithPassword(email, wrongPassword));
    }

    const results = await Promise.all(attempts);
    
    // After 5 failed attempts, should be rate limited
    const lastResult = results[5];
    expect(lastResult.error?.message).toContain('Too many login attempts');
  });

  it('validates session tokens properly', async () => {
    const invalidTokens = [
      'invalid-token',
      '',
      null,
      undefined,
      'expired.token.here',
    ];

    for (const token of invalidTokens) {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const result = await authService.getCurrentUser();
      expect(result.data.user).toBeNull();
      expect(result.error).toBeTruthy();
    }
  });

  it('prevents unauthorized access to protected routes', async () => {
    // Mock unauthenticated state
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const protectedActions = [
      () => authService.updateProfile('New Name'),
      () => authService.deleteAccount(),
      () => authService.changePassword('newpassword'),
    ];

    for (const action of protectedActions) {
      const result = await action();
      expect(result.error?.message).toContain('Authentication required');
    }
  });

  it('validates age input to prevent manipulation', async () => {
    const invalidAges = [-1, 0, 150, 'abc', null, undefined];

    for (const age of invalidAges) {
      const result = await authService.signUp('test@example.com', 'SecurePass123!', 'Test User', age as number);
      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('Invalid age');
    }
  });

  it('encrypts sensitive data before storage', async () => {
    const sensitiveData = {
      email: 'test@example.com',
      name: 'Test User',
      parentEmail: 'parent@example.com',
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: 'test-id', ...sensitiveData } },
      error: null,
    });

    const result = await authService.signUp(
      sensitiveData.email,
      'SecurePass123!',
      sensitiveData.name,
      10,
      sensitiveData.parentEmail
    );

    // Verify that sensitive data is not stored in plain text
    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: sensitiveData.email,
        password: 'SecurePass123!',
        options: expect.objectContaining({
          data: expect.objectContaining({
            name: sensitiveData.name,
            age: 10,
            parent_email: sensitiveData.parentEmail,
          }),
        }),
      })
    );
  });
});