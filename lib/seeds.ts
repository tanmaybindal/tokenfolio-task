import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { Service } from '@/types';

import { readServices, writeServices } from './storage';

interface SeedEntry {
  name: string;
  url: string;
}

export async function applySeedsIfEmpty(): Promise<void> {
  // SEED_ON_STARTUP=false disables seeding entirely (e.g. for clean-slate demos)
  if (process.env.SEED_ON_STARTUP === 'false') return;

  const data = await readServices();
  if (data.services.length > 0) return;

  const seedsPath = path.join(process.cwd(), 'config', 'seeds.json');
  if (!fs.existsSync(seedsPath)) return;

  const seeds: SeedEntry[] = JSON.parse(fs.readFileSync(seedsPath, 'utf-8'));
  if (seeds.length === 0) return;

  const services: Service[] = seeds.map((seed) => ({
    id: crypto.randomBytes(4).toString('hex'),
    name: seed.name,
    url: seed.url,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    latencyMs: null,
    lastCheckedAt: null,
    healthScore: null,
    history: [],
  }));

  await writeServices({ services });
}
