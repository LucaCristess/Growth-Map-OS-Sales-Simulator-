const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, value] of entries) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimit(
  ip: string,
  path: string,
  limit: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetMs: number } {
  cleanup();

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetMs: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetMs: entry.resetTime - now };
}

export function getRateLimitHeaders(
  result: ReturnType<typeof checkRateLimit>
): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetMs / 1000)),
    ...(result.allowed ? {} : { 'Retry-After': String(Math.ceil(result.resetMs / 1000)) }),
  };
}
