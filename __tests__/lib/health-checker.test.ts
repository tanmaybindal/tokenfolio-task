import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  checkHealth,
  computeHealthScore,
  STATUS_WEIGHT,
} from '@/lib/health-checker';
import { DEFAULT_RATE_LIMIT_COOLDOWN_MS } from '@/lib/rate-limit';

// ── computeHealthScore ──────────────────────────────────────────────────────

describe('computeHealthScore', () => {
  test('single UP check scores 100', () => {
    const { healthScore } = computeHealthScore([], STATUS_WEIGHT.UP);
    expect(healthScore).toBe(100);
  });

  test('single DOWN check scores 0', () => {
    const { healthScore } = computeHealthScore([], STATUS_WEIGHT.DOWN);
    expect(healthScore).toBe(0);
  });

  test('single SLOW check scores 50', () => {
    const { healthScore } = computeHealthScore([], STATUS_WEIGHT.SLOW);
    expect(healthScore).toBe(50);
  });

  test('ring buffer caps at 10 entries', () => {
    const history = Array(10).fill(STATUS_WEIGHT.UP);
    const { history: updated } = computeHealthScore(
      history,
      STATUS_WEIGHT.DOWN,
    );
    expect(updated).toHaveLength(10);
    expect(updated[9]).toBe(STATUS_WEIGHT.DOWN);
  });

  test('evicts oldest entry when buffer is full', () => {
    const history = Array(10).fill(STATUS_WEIGHT.UP); // all UP
    const { history: updated } = computeHealthScore(
      history,
      STATUS_WEIGHT.DOWN,
    );
    // 9 UP (1.0) + 1 DOWN (0.0) = 90
    expect((updated.reduce((a, b) => a + b, 0) / updated.length) * 100).toBe(
      90,
    );
  });

  test('mixed history averages correctly', () => {
    // 5 UP (1.0) + 5 DOWN (0.0) = 50
    const history = [...Array(5).fill(1.0), ...Array(4).fill(0.0)];
    const { healthScore } = computeHealthScore(history, 0.0);
    expect(healthScore).toBe(50);
  });
});

// ── checkHealth ─────────────────────────────────────────────────────────────

describe('checkHealth', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns UP for 2xx response', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('UP');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  test('returns DOWN for non-2xx response with errorKind HTTP', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('DOWN');
    expect(result.httpStatus).toBe(500);
    expect(result.errorKind).toBe('HTTP');
  });

  test('returns DOWN for 403 response with httpStatus 403', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('DOWN');
    expect(result.httpStatus).toBe(403);
    expect(result.errorKind).toBe('HTTP');
  });

  test('returns RATE_LIMITED for 429 with Retry-After seconds', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: { get: (h: string) => (h === 'retry-after' ? '120' : null) },
    } as unknown as Response);
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('RATE_LIMITED');
    expect(result.retryAfterMs).toBe(120_000);
    expect(result.httpStatus).toBe(429);
    expect(result.errorKind).toBe('HTTP');
  });

  test('returns RATE_LIMITED for 429 with Retry-After HTTP-date', async () => {
    const future = new Date(Date.now() + 60_000).toUTCString();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: { get: (h: string) => (h === 'retry-after' ? future : null) },
    } as unknown as Response);
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('RATE_LIMITED');
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
  });

  test('returns RATE_LIMITED for 429 with no Retry-After — uses default cooldown', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: { get: () => null },
    } as unknown as Response);
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('RATE_LIMITED');
    expect(result.retryAfterMs).toBe(DEFAULT_RATE_LIMIT_COOLDOWN_MS);
  });

  test('returns DOWN for network failure with errorKind NETWORK', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('DOWN');
    expect(result.errorKind).toBe('NETWORK');
    expect(result.httpStatus).toBeNull();
  });

  test('returns DOWN for timeout with errorKind TIMEOUT', async () => {
    const timeoutErr = new DOMException('The operation was aborted', 'TimeoutError');
    vi.mocked(global.fetch).mockRejectedValueOnce(timeoutErr);
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('DOWN');
    expect(result.errorKind).toBe('TIMEOUT');
    expect(result.httpStatus).toBeNull();
  });

  test('returns DOWN for AbortError (non-timeout) with errorKind NETWORK', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(
      Object.assign(new Error('The operation was aborted'), {
        name: 'AbortError',
      }),
    );
    const result = await checkHealth('https://example.com');
    expect(result.status).toBe('DOWN');
    expect(result.errorKind).toBe('NETWORK');
  });

  // ── mock:// URL scheme ────────────────────────────────────────────────────

  test('mock://down returns DOWN without a real fetch', async () => {
    const result = await checkHealth('mock://down');
    expect(result.status).toBe('DOWN');
    expect(vi.mocked(global.fetch)).not.toHaveBeenCalled();
  });

  test('mock://slow returns SLOW without a real fetch', async () => {
    const result = await checkHealth('mock://slow');
    expect(result.status).toBe('SLOW');
  });

  test('mock://up returns UP without a real fetch', async () => {
    const result = await checkHealth('mock://up');
    expect(result.status).toBe('UP');
  });
});
