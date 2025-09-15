/**
 * Client-side rate limiting and request throttling
 * Works in conjunction with server-side protection
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
  blocked?: boolean;
  blockUntil?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitConfig> = new Map();
  private requests: Map<string, RequestRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Default rate limits
    this.setLimit('api', { maxRequests: 100, windowMs: 60000 }); // 100 requests per minute
    this.setLimit('auth', { maxRequests: 5, windowMs: 300000, blockDurationMs: 900000 }); // 5 auth attempts per 5 min, block for 15 min
    this.setLimit('questions', { maxRequests: 30, windowMs: 60000 }); // 30 questions per minute
    this.setLimit('xp', { maxRequests: 50, windowMs: 60000 }); // 50 XP updates per minute
    
    // Cleanup expired records every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
  }

  setLimit(endpoint: string, config: RateLimitConfig): void {
    this.limits.set(endpoint, config);
  }

  async checkLimit(endpoint: string, identifier: string = 'default'): Promise<boolean> {
    const key = `${endpoint}:${identifier}`;
    const config = this.limits.get(endpoint);
    
    if (!config) {
      return true; // No limit configured, allow request
    }

    const now = Date.now();
    const record = this.requests.get(key) || { count: 0, resetTime: now + config.windowMs };

    // Check if currently blocked
    if (record.blocked && record.blockUntil && now < record.blockUntil) {
      return false;
    }

    // Reset window if expired
    if (now >= record.resetTime) {
      record.count = 0;
      record.resetTime = now + config.windowMs;
      record.blocked = false;
      record.blockUntil = undefined;
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      if (config.blockDurationMs) {
        record.blocked = true;
        record.blockUntil = now + config.blockDurationMs;
      }
      return false;
    }

    // Increment counter and allow request
    record.count++;
    this.requests.set(key, record);
    return true;
  }

  getRemainingRequests(endpoint: string, identifier: string = 'default'): number {
    const key = `${endpoint}:${identifier}`;
    const config = this.limits.get(endpoint);
    const record = this.requests.get(key);
    
    if (!config || !record) {
      return config?.maxRequests || Infinity;
    }

    return Math.max(0, config.maxRequests - record.count);
  }

  getResetTime(endpoint: string, identifier: string = 'default'): number {
    const key = `${endpoint}:${identifier}`;
    const record = this.requests.get(key);
    return record?.resetTime || Date.now();
  }

  isBlocked(endpoint: string, identifier: string = 'default'): boolean {
    const key = `${endpoint}:${identifier}`;
    const record = this.requests.get(key);
    
    if (!record?.blocked || !record.blockUntil) {
      return false;
    }

    return Date.now() < record.blockUntil;
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, record] of this.requests.entries()) {
      // Remove expired records
      if (now >= record.resetTime && !record.blocked) {
        this.requests.delete(key);
      }
      // Remove expired blocks
      else if (record.blocked && record.blockUntil && now >= record.blockUntil) {
        record.blocked = false;
        record.blockUntil = undefined;
        record.count = 0;
        record.resetTime = now + (this.limits.get(key.split(':')[0])?.windowMs || 60000);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Request queue for handling rate-limited requests
class RequestQueue {
  private queue: Array<{
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    endpoint: string;
    identifier: string;
  }> = [];
  
  private processing = false;
  private rateLimiter: RateLimiter;

  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  async enqueue<T>(
    request: () => Promise<T>,
    endpoint: string,
    identifier: string = 'default'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject, endpoint, identifier });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      // Check rate limit
      const allowed = await this.rateLimiter.checkLimit(item.endpoint, item.identifier);
      
      if (!allowed) {
        // Wait before retrying
        const resetTime = this.rateLimiter.getResetTime(item.endpoint, item.identifier);
        const waitTime = Math.min(resetTime - Date.now(), 60000); // Max 1 minute wait
        
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      // Remove from queue and execute
      this.queue.shift();
      
      try {
        const result = await item.request();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }

    this.processing = false;
  }
}

// Exponential backoff for failed requests
class ExponentialBackoff {
  private attempts: Map<string, number> = new Map();
  private maxAttempts = 5;
  private baseDelay = 1000; // 1 second
  private maxDelay = 30000; // 30 seconds

  async execute<T>(
    key: string,
    request: () => Promise<T>,
    shouldRetry: (error: any) => boolean = () => true
  ): Promise<T> {
    const attempts = this.attempts.get(key) || 0;
    
    try {
      const result = await request();
      this.attempts.delete(key); // Reset on success
      return result;
    } catch (error) {
      if (attempts >= this.maxAttempts || !shouldRetry(error)) {
        this.attempts.delete(key);
        throw error;
      }

      // Calculate delay with jitter
      const delay = Math.min(
        this.baseDelay * Math.pow(2, attempts) + Math.random() * 1000,
        this.maxDelay
      );

      this.attempts.set(key, attempts + 1);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.execute(key, request, shouldRetry);
    }
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getAttempts(key: string): number {
    return this.attempts.get(key) || 0;
  }
}

// Export singleton instances
export const rateLimiter = new RateLimiter();
export const requestQueue = new RequestQueue(rateLimiter);
export const backoff = new ExponentialBackoff();

// React hook for rate limiting
export const useRateLimit = () => {
  return {
    checkLimit: rateLimiter.checkLimit.bind(rateLimiter),
    getRemainingRequests: rateLimiter.getRemainingRequests.bind(rateLimiter),
    isBlocked: rateLimiter.isBlocked.bind(rateLimiter),
    enqueueRequest: requestQueue.enqueue.bind(requestQueue),
    executeWithBackoff: backoff.execute.bind(backoff)
  };
};