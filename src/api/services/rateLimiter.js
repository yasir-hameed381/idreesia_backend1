const logger = require("../../config/logger");

// In-memory rate limiter (for production, consider using Redis)
const rateLimitStore = new Map();

/**
 * Rate limiter utility matching Laravel's RateLimiter behavior
 */
class RateLimiter {
  /**
   * Get the throttle key for rate limiting
   * @param {string} email - User email
   * @param {string} ip - User IP address
   * @returns {string} Throttle key
   */
  static throttleKey(email, ip) {
    return `login:${email.toLowerCase()}|${ip}`;
  }

  /**
   * Check if too many attempts have been made
   * @param {string} key - Throttle key
   * @param {number} maxAttempts - Maximum attempts allowed (default: 5)
   * @returns {boolean} True if too many attempts
   */
  static tooManyAttempts(key, maxAttempts = 5) {
    const attempts = rateLimitStore.get(key);
    if (!attempts) {
      return false;
    }

    return attempts.count >= maxAttempts;
  }

  /**
   * Get the number of seconds until the rate limiter is available again
   * @param {string} key - Throttle key
   * @param {number} decayMinutes - Minutes until decay (default: 1)
   * @returns {number} Seconds until available
   */
  static availableIn(key, decayMinutes = 1) {
    const attempts = rateLimitStore.get(key);
    if (!attempts) {
      return 0;
    }

    const now = Date.now();
    const decayTime = decayMinutes * 60 * 1000; // Convert to milliseconds
    const elapsed = now - attempts.firstAttempt;
    const remaining = decayTime - elapsed;

    return Math.max(0, Math.ceil(remaining / 1000)); // Return in seconds
  }

  /**
   * Increment the attempt count for the given key
   * @param {string} key - Throttle key
   * @param {number} decayMinutes - Minutes until decay (default: 1)
   */
  static hit(key, decayMinutes = 1) {
    const attempts = rateLimitStore.get(key);
    const now = Date.now();

    if (!attempts) {
      rateLimitStore.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    } else {
      attempts.count += 1;
      attempts.lastAttempt = now;
    }

    // Set expiration for cleanup
    const decayTime = decayMinutes * 60 * 1000;
    setTimeout(() => {
      rateLimitStore.delete(key);
    }, decayTime);
  }

  /**
   * Clear the rate limiter for the given key
   * @param {string} key - Throttle key
   */
  static clear(key) {
    rateLimitStore.delete(key);
  }

  /**
   * Get attempt count for debugging
   * @param {string} key - Throttle key
   * @returns {number} Attempt count
   */
  static attempts(key) {
    const attempts = rateLimitStore.get(key);
    return attempts ? attempts.count : 0;
  }
}

module.exports = RateLimiter;

