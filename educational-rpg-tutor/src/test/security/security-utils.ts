// Security testing utilities for Educational RPG Tutor
import { vi } from 'vitest';

export interface SecurityTestConfig {
  maxAttempts: number;
  timeWindow: number; // in milliseconds
  blockDuration: number; // in milliseconds
}

export class SecurityTester {
  private attemptCounts: Map<string, { count: number; firstAttempt: number; blockedUntil?: number }> = new Map();

  // Rate limiting simulation
  checkRateLimit(identifier: string, config: SecurityTestConfig): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const record = this.attemptCounts.get(identifier);

    if (!record) {
      this.attemptCounts.set(identifier, { count: 1, firstAttempt: now });
      return { allowed: true };
    }

    // Check if still blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return { allowed: false, reason: 'Rate limited - blocked' };
    }

    // Reset if time window has passed
    if (now - record.firstAttempt > config.timeWindow) {
      this.attemptCounts.set(identifier, { count: 1, firstAttempt: now });
      return { allowed: true };
    }

    // Increment attempt count
    record.count++;

    // Check if exceeded max attempts
    if (record.count > config.maxAttempts) {
      record.blockedUntil = now + config.blockDuration;
      return { allowed: false, reason: 'Rate limited - too many attempts' };
    }

    return { allowed: true };
  }

  reset(): void {
    this.attemptCounts.clear();
  }
}

// Input validation utilities
export class InputValidator {
  static validateEmail(email: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
      if (email.length > 254) {
        errors.push('Email too long');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
      }
      if (password.length > 128) {
        errors.push('Password too long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain number');
      }
      if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain special character');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static validateAge(age: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (age === null || age === undefined) {
      errors.push('Age is required');
    } else {
      const numAge = Number(age);
      if (isNaN(numAge)) {
        errors.push('Age must be a number');
      } else if (numAge < 3 || numAge > 18) {
        errors.push('Age must be between 3 and 18');
      } else if (!Number.isInteger(numAge)) {
        errors.push('Age must be a whole number');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 1000); // Limit length
  }

  static validateCharacterName(name: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!name) {
      errors.push('Character name is required');
    } else {
      const sanitized = this.sanitizeInput(name);
      if (sanitized !== name) {
        errors.push('Character name contains invalid characters');
      }
      if (sanitized.length < 2) {
        errors.push('Character name must be at least 2 characters');
      }
      if (sanitized.length > 20) {
        errors.push('Character name must be less than 20 characters');
      }
      if (!/^[a-zA-Z0-9\s-_]+$/.test(sanitized)) {
        errors.push('Character name can only contain letters, numbers, spaces, hyphens, and underscores');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// XSS and injection testing
export class SecurityScanner {
  static readonly XSS_PAYLOADS = [
    '<script>alert("xss")</script>',
    '"><script>alert("xss")</script>',
    "javascript:alert('xss')",
    '<img src=x onerror=alert("xss")>',
    '<svg onload=alert("xss")>',
    '${alert("xss")}',
    '{{alert("xss")}}',
    '<iframe src="javascript:alert(\'xss\')"></iframe>'
  ];

  static readonly SQL_INJECTION_PAYLOADS = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "' UNION SELECT * FROM users --",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
    "' OR 1=1 --",
    "admin'--",
    "' OR 'a'='a",
    "'; EXEC xp_cmdshell('dir'); --"
  ];

  static testXSSVulnerability(inputHandler: (input: string) => string): { vulnerable: boolean; vulnerablePayloads: string[] } {
    const vulnerablePayloads: string[] = [];

    for (const payload of this.XSS_PAYLOADS) {
      try {
        const result = inputHandler(payload);
        // Check if payload was not properly sanitized
        if (result.includes('<script>') || result.includes('javascript:') || result.includes('onerror=')) {
          vulnerablePayloads.push(payload);
        }
      } catch (error) {
        // Input handler threw error - this is actually good for security
      }
    }

    return {
      vulnerable: vulnerablePayloads.length > 0,
      vulnerablePayloads
    };
  }

  static testSQLInjection(queryHandler: (input: string) => any): { vulnerable: boolean; vulnerablePayloads: string[] } {
    const vulnerablePayloads: string[] = [];

    for (const payload of this.SQL_INJECTION_PAYLOADS) {
      try {
        const result = queryHandler(payload);
        // This is a simplified check - in real scenarios, you'd check for SQL errors or unexpected results
        if (typeof result === 'object' && result !== null) {
          // If the handler doesn't throw an error, it might be vulnerable
          vulnerablePayloads.push(payload);
        }
      } catch (error) {
        // Query handler threw error - this is good for security
      }
    }

    return {
      vulnerable: vulnerablePayloads.length > 0,
      vulnerablePayloads
    };
  }
}

// Session security testing
export class SessionTester {
  private sessions: Map<string, { userId: string; createdAt: number; lastAccess: number; isValid: boolean }> = new Map();

  createSession(userId: string): string {
    const sessionId = this.generateSecureSessionId();
    const now = Date.now();
    
    this.sessions.set(sessionId, {
      userId,
      createdAt: now,
      lastAccess: now,
      isValid: true
    });

    return sessionId;
  }

  validateSession(sessionId: string, maxAge: number = 3600000): { valid: boolean; reason?: string } {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (!session.isValid) {
      return { valid: false, reason: 'Session invalidated' };
    }

    const now = Date.now();
    
    // Check session age
    if (now - session.createdAt > maxAge) {
      session.isValid = false;
      return { valid: false, reason: 'Session expired' };
    }

    // Check inactivity timeout (30 minutes)
    if (now - session.lastAccess > 1800000) {
      session.isValid = false;
      return { valid: false, reason: 'Session timeout due to inactivity' };
    }

    // Update last access
    session.lastAccess = now;
    return { valid: true };
  }

  invalidateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isValid = false;
    }
  }

  private generateSecureSessionId(): string {
    // Generate a cryptographically secure session ID
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for testing environment
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  getAllSessions(): Array<{ sessionId: string; userId: string; createdAt: number; lastAccess: number; isValid: boolean }> {
    return Array.from(this.sessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      ...session
    }));
  }

  clearAllSessions(): void {
    this.sessions.clear();
  }
}

// Mock authentication service for testing
export const mockAuthService = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  updateProfile: vi.fn(),
  deleteAccount: vi.fn(),
  changePassword: vi.fn(),
  resetPassword: vi.fn()
};

// COPPA compliance testing utilities
export class COPPAComplianceTester {
  static validateParentalConsent(age: number, hasParentalConsent: boolean): { compliant: boolean; reason?: string } {
    if (age < 13) {
      if (!hasParentalConsent) {
        return { compliant: false, reason: 'Parental consent required for users under 13' };
      }
    }
    return { compliant: true };
  }

  static validateDataCollection(age: number, dataTypes: string[]): { compliant: boolean; violations: string[] } {
    const violations: string[] = [];
    
    if (age < 13) {
      const restrictedData = ['location', 'phone', 'email_marketing', 'behavioral_tracking'];
      
      for (const dataType of dataTypes) {
        if (restrictedData.includes(dataType)) {
          violations.push(`Cannot collect ${dataType} from users under 13 without explicit parental consent`);
        }
      }
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }
}