import { NextResponse } from 'next/server';

import { readServices, writeServices } from '@/lib/storage';

// Next.js 15+: params is a Promise — must be awaited before accessing id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }
  try {
    if (
      !url.startsWith('http://') &&
      !url.startsWith('https://') &&
      !url.startsWith('mock://')
    ) {
      throw new Error('invalid protocol');
    }
    // URL constructor doesn't support custom schemes like mock:// consistently,
    // so validate standard URLs only.
    if (!url.startsWith('mock://')) new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'url must be a valid http://, https://, or mock:// URL' },
      { status: 400 },
    );
  }

  const data = await readServices();
  const index = data.services.findIndex((s) => s.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const normalizedUrl = url.toLowerCase();
  const duplicate = data.services.find(
    (s) => s.id !== id && s.url.toLowerCase() === normalizedUrl,
  );
  if (duplicate) {
    return NextResponse.json(
      { error: 'A service with this URL already exists' },
      { status: 409 },
    );
  }

  data.services[index] = {
    ...data.services[index],
    name,
    url,
    // URL changes should trigger a fresh health check
    status: 'PENDING',
    latencyMs: null,
    lastCheckedAt: null,
    healthScore: null,
    history: [],
    lastHttpStatus: null,
    lastErrorKind: null,
    rateLimitedUntil: null,
  };
  await writeServices(data);

  return NextResponse.json(data.services[index]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await readServices();
  const exists = data.services.some((s) => s.id === id);

  if (!exists) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  data.services = data.services.filter((s) => s.id !== id);
  await writeServices(data);

  return new NextResponse(null, { status: 204 });
}
