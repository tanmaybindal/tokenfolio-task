import seeds from '@/config/seeds.json';
import { Service } from '@/types';

const KEY = 'tokenfolio:services';
const isBrowser = typeof window !== 'undefined';
let serverServicesCache: Service[] | null = null;

function makeService(seed: { name: string; url: string }): Service {
  return {
    id: crypto.randomUUID().slice(0, 8),
    name: seed.name,
    url: seed.url,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    latencyMs: null,
    lastCheckedAt: null,
    healthScore: null,
    history: [],
  };
}

export function readServices(): Service[] {
  if (!isBrowser) {
    if (!serverServicesCache) {
      serverServicesCache = seeds.map(makeService);
    }
    return serverServicesCache;
  }

  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw) as Service[];
  const seeded = seeds.map(makeService);
  writeServices(seeded);
  return seeded;
}

export function writeServices(services: Service[]): void {
  if (!isBrowser) {
    serverServicesCache = services;
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(services));
}
