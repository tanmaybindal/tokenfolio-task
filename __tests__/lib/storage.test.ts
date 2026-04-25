import { beforeEach, expect, test, vi } from 'vitest';

import type { ServicesData } from '@/types';

const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: vi.fn(() => ({ get: mockGet, set: mockSet })) },
}));

const { readServices, writeServices } = await import('@/lib/storage');

const sample: ServicesData = {
  services: [
    {
      id: 'abc1',
      name: 'Test API',
      url: 'https://example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      status: 'UP',
      latencyMs: 100,
      lastCheckedAt: '2026-01-01T00:00:00.000Z',
      healthScore: 100,
      history: [1.0],
    },
  ],
};

beforeEach(() => {
  mockGet.mockReset();
  mockSet.mockReset();
});

test('readServices returns empty services when Redis has no data', async () => {
  mockGet.mockResolvedValue(null);
  expect(await readServices()).toEqual({ services: [] });
});

test('readServices returns stored data from Redis', async () => {
  mockGet.mockResolvedValue(sample);
  expect(await readServices()).toEqual(sample);
});

test('writeServices calls redis.set with the correct key and data', async () => {
  mockSet.mockResolvedValue('OK');
  await writeServices(sample);
  expect(mockSet).toHaveBeenCalledWith('services', sample);
});
