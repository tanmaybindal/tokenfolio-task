import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, beforeEach, expect, test } from 'vitest';

import type { ServicesData } from '@/types';

// Create a unique temp dir for this test run and point storage at it
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'storage-test-'));
process.env.DATA_DIR = tmpDir;

// Import storage AFTER setting DATA_DIR so the module picks up the env var
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

function dataFile() {
  return path.join(tmpDir, 'services.json');
}

beforeEach(() => {
  if (fs.existsSync(dataFile())) fs.unlinkSync(dataFile());
});

afterAll(() => {
  // Clean up the temp dir
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.DATA_DIR;
});

test('readServices returns empty services when file does not exist', () => {
  expect(readServices()).toEqual({ services: [] });
});

test('writeServices then readServices roundtrips data correctly', () => {
  writeServices(sample);
  expect(readServices()).toEqual(sample);
});

test('writeServices uses atomic rename (no .tmp file left behind)', () => {
  writeServices(sample);
  const tmp = path.join(tmpDir, 'services.json.tmp');
  expect(fs.existsSync(tmp)).toBe(false);
});
