import { NextResponse } from 'next/server';

import {
  STATUS_WEIGHT,
  checkHealth,
  computeHealthScore,
} from '@/lib/health-checker';
import { readServices, writeServices } from '@/lib/storage';

interface RefreshServicesPayload {
  serviceIds?: string[];
}

export async function POST(req: Request) {
  let payload: RefreshServicesPayload = {};
  try {
    payload = (await req.json()) as RefreshServicesPayload;
  } catch {
    payload = {};
  }

  const data = readServices();
  if (data.services.length === 0) {
    return NextResponse.json([]);
  }

  const shouldRefreshSubset =
    Array.isArray(payload.serviceIds) && payload.serviceIds.length > 0;
  const targetIds = new Set(payload.serviceIds ?? []);

  const updatedServices = await Promise.all(
    data.services.map(async (service) => {
      if (shouldRefreshSubset && !targetIds.has(service.id)) {
        return service;
      }

      const result = await checkHealth(service.url);
      const weight = STATUS_WEIGHT[result.status];
      const { history, healthScore } = computeHealthScore(service.history, weight);

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

  writeServices({ services: updatedServices });

  if (!shouldRefreshSubset) {
    return NextResponse.json(updatedServices);
  }

  return NextResponse.json(
    updatedServices.filter((service) => targetIds.has(service.id)),
  );
}
