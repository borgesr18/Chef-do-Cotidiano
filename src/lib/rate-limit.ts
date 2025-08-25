import { NextRequest } from 'next/server';
import { createRateLimit, rateLimitConfigs, withRateLimit } from '../../lib/rate-limit';

export { rateLimitConfigs, withRateLimit };

export async function checkRateLimit(
  request: NextRequest,
  configKey: keyof typeof rateLimitConfigs
) {
  const config = rateLimitConfigs[configKey];
  const limiter = createRateLimit(config);
  const result = await limiter(request);

  const allowed = result === null;
  const retryAfterHeader = result?.headers.get('Retry-After');
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;

  return {
    allowed,
    limit: config.maxRequests,
    remaining: allowed ? config.maxRequests - 1 : 0,
    reset: retryAfter ?? Math.ceil(config.windowMs / 1000),
    retryAfter,
    window: config.windowMs,
  };
}