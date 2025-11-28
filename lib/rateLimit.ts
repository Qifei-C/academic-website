const windowMs = 60 * 1000; // 1 minute
const maxRequests = 60;
const buckets = new Map<string, { count: number; expires: number }>();

export function rateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.expires < now) {
    buckets.set(key, { count: 1, expires: now + windowMs });
    return { allowed: true };
  }
  if (bucket.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.max(0, bucket.expires - now) / 1000 };
  }
  bucket.count += 1;
  return { allowed: true };
}
