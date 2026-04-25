import { NextRequest, NextResponse } from 'next/server';

import {
  checkHealth,
  computeHealthScore,
  STATUS_WEIGHT,
} from '@/lib/health-checker';
import { applySeedsIfEmpty } from '@/lib/seeds';
import { readServices, writeServices } from '@/lib/storage';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await applySeedsIfEmpty();

  const data = await readServices();
  if (data.services.length === 0) {
    return NextResponse.json({ checked: 0 });
  }

  const updated = await Promise.all(
    data.services.map(async (service) => {
      const result = await checkHealth(service.url);
      const weight = STATUS_WEIGHT[result.status];
      const { history, healthScore } = computeHealthScore(
        service.history,
        weight,
      );
      return {
        ...service,
        status: result.status,
        latencyMs: result.latencyMs,
        lastCheckedAt: new Date().toISOString(),
        healthScore,
        history,
      };
    }),
  );

  await writeServices({ services: updated });
  return NextResponse.json({ checked: updated.length });
}
