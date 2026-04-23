import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { after } from 'next/server';

import {
  checkHealth,
  computeHealthScore,
  STATUS_WEIGHT,
} from '@/lib/health-checker';
import { readServices, writeServices } from '@/lib/storage';
import { Service } from '@/types';

interface DeleteServicesPayload {
  serviceIds?: string[];
}

export async function GET() {
  const { services } = readServices();
  // Return full Service objects; history[] is needed by the dashboard for spark-lines
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.name !== 'string' || typeof body.url !== 'string') {
    return NextResponse.json(
      { error: 'name and url are required' },
      { status: 400 },
    );
  }

  const name = body.name.trim();
  const url = body.url.trim();

  if (!name || name.length > 100) {
    return NextResponse.json(
      { error: 'name must be 1–100 characters' },
      { status: 400 },
    );
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'url must be a valid http:// or https:// URL' },
      { status: 400 },
    );
  }

  if (
    !url.startsWith('http://') &&
    !url.startsWith('https://') &&
    !url.startsWith('mock://')
  ) {
    return NextResponse.json(
      { error: 'url must start with http:// or https://' },
      { status: 400 },
    );
  }

  const data = readServices();

  const newService: Service = {
    id: crypto.randomBytes(4).toString('hex'),
    name,
    url,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    latencyMs: null,
    lastCheckedAt: null,
    healthScore: null,
    history: [],
  };

  data.services.push(newService);
  writeServices(data);

  // Fire initial health check after the response is sent (after() is the Next.js
  // idiomatic API for non-blocking post-response work — avoids detached promises)
  after(async () => {
    const result = await checkHealth(url);
    const weight = STATUS_WEIGHT[result.status];
    const { history, healthScore } = computeHealthScore([], weight);
    const fresh = readServices();
    fresh.services = fresh.services.map((s) =>
      s.id === newService.id
        ? {
            ...s,
            status: result.status,
            latencyMs: result.latencyMs,
            lastCheckedAt: new Date().toISOString(),
            healthScore,
            history,
          }
        : s,
    );
    writeServices(fresh);
  });

  return NextResponse.json(newService, { status: 201 });
}

export async function DELETE(req: Request) {
  let payload: DeleteServicesPayload = {};
  try {
    payload = (await req.json()) as DeleteServicesPayload;
  } catch {
    payload = {};
  }

  const data = readServices();
  const allServices = data.services;

  const hasServiceIds =
    Array.isArray(payload.serviceIds) && payload.serviceIds.length > 0;

  if (!hasServiceIds) {
    return NextResponse.json(
      { error: 'serviceIds must be a non-empty array' },
      { status: 400 },
    );
  }

  const targetIds = new Set(payload.serviceIds);
  const existingTargetCount = allServices.filter((s) =>
    targetIds.has(s.id),
  ).length;

  if (existingTargetCount === 0) {
    return NextResponse.json({ error: 'Services not found' }, { status: 404 });
  }

  data.services = allServices.filter((s) => !targetIds.has(s.id));
  writeServices(data);

  return NextResponse.json({ deleted: existingTargetCount });
}
