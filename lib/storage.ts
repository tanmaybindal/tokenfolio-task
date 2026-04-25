import { Redis } from '@upstash/redis';

import { ServicesData } from '@/types';

const redis = Redis.fromEnv();
const REDIS_KEY = 'services';

export async function readServices(): Promise<ServicesData> {
  return (await redis.get<ServicesData>(REDIS_KEY)) ?? { services: [] };
}

export async function writeServices(data: ServicesData): Promise<void> {
  await redis.set(REDIS_KEY, data);
}
