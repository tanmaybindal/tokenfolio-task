import type { Service } from '@/types';

/** True while we are still inside the “wait until” window after a 429 (no new request yet). */
export function isRateLimitActive(service: Service): boolean {
  if (!service.rateLimitedUntil) return false;
  return new Date(service.rateLimitedUntil).getTime() > Date.now();
}
