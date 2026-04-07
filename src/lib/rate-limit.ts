/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window counter per key (IP + route prefix).
 * Pragmatic for Cloud Run: each instance maintains its own counters.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 60_000).unref?.();
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetTime: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.max - 1,
      limit: config.max,
      resetTime: now + config.windowMs,
    };
  }

  entry.count += 1;

  if (entry.count > config.max) {
    return {
      allowed: false,
      remaining: 0,
      limit: config.max,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: config.max - entry.count,
    limit: config.max,
    resetTime: entry.resetTime,
  };
}

export const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  '/api/ai': { windowMs: 60_000, max: 20 },
  '/api/boat-rentals': { windowMs: 60_000, max: 60 },
  '/api/sales': { windowMs: 60_000, max: 80 },
  '/api/': { windowMs: 60_000, max: 100 },
};

export function getRateLimitConfig(pathname: string): RateLimitConfig | null {
  const sortedPrefixes = Object.keys(RATE_LIMIT_TIERS).sort((a, b) => b.length - a.length);

  for (const prefix of sortedPrefixes) {
    if (pathname.startsWith(prefix)) {
      return RATE_LIMIT_TIERS[prefix];
    }
  }

  return null;
}

export function getRateLimitKey(ip: string, pathname: string): string {
  const sortedPrefixes = Object.keys(RATE_LIMIT_TIERS).sort((a, b) => b.length - a.length);
  const matchedPrefix = sortedPrefixes.find(prefix => pathname.startsWith(prefix)) || '/api/';
  return `${ip}:${matchedPrefix}`;
}
