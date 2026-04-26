import { describe, expect, test } from 'vitest';

import { isInRateLimitWindow } from '@/lib/rate-limit-window';

describe('isInRateLimitWindow', () => {
  test('returns true when rateLimitedUntil is in the future', () => {
    const now = new Date('2026-01-01T00:00:00.000Z').getTime();
    const rateLimitedUntil = '2026-01-01T00:01:00.000Z';

    expect(isInRateLimitWindow(rateLimitedUntil, now)).toBe(true);
  });

  test('returns false when rateLimitedUntil is in the past', () => {
    const now = new Date('2026-01-01T00:01:00.000Z').getTime();
    const rateLimitedUntil = '2026-01-01T00:00:00.000Z';

    expect(isInRateLimitWindow(rateLimitedUntil, now)).toBe(false);
  });

  test('returns false when rateLimitedUntil is invalid', () => {
    expect(isInRateLimitWindow('not-a-date')).toBe(false);
  });

  test('returns false when rateLimitedUntil is empty', () => {
    expect(isInRateLimitWindow(null)).toBe(false);
  });
});
