import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, expect, test, vi } from 'vitest';

import type { ServicesData } from '@/types';

const sample: ServicesData = {
  services: [
    {
      id: 'fallback1',
      name: 'Fallback API',
      url: 'https://example.com/health',
      createdAt: '2026-01-01T00:00:00.000Z',
      status: 'UP',
      latencyMs: 120,
      lastCheckedAt: '2026-01-01T00:00:00.000Z',
      healthScore: 100,
      history: [1],
    },
  ],
};

const brokenParent = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-broken-'));
const invalidDataDir = path.join(brokenParent, 'not-a-dir');

// Create a file where a directory is expected, so writes to DATA_DIR fail.
fs.writeFileSync(invalidDataDir, 'x');

afterAll(() => {
  fs.rmSync(brokenParent, { recursive: true, force: true });
  delete process.env.DATA_DIR;
});

test('falls back to temp directory when DATA_DIR is not writable', async () => {
  process.env.DATA_DIR = invalidDataDir;
  vi.resetModules();

  const { writeServices, readServices } = await import('@/lib/storage');

  expect(() => writeServices(sample)).not.toThrow();
  expect(readServices()).toEqual(sample);
});
