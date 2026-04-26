# API Reliability Dashboard

An internal dashboard for monitoring the health and reliability of public APIs, built with Next.js App Router.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**To start with no pre-seeded services:**

```bash
SEED_ON_STARTUP=false pnpm dev
```

## Features

- **Real-time health monitoring** — services checked every 60 seconds by a server-side scheduler
- **Status classification** — UP / SLOW / DOWN / RATE_LIMITED / PENDING based on latency and HTTP status
- **Rate limit awareness** — 429 responses detected, `Retry-After` header parsed (seconds or HTTP-date), countdown shown in UI
- **Health score** — rolling average of last 10 checks (UP=100%, SLOW=50%, DOWN/RATE_LIMITED=0%)
- **Card and table views** — toggle between layouts; state persisted in URL via `nuqs`
- **Sortable, paginated table** — column sorting, URL-backed pagination, filler rows for stable height
- **Spark-line trends** — coloured bar chart of last 10 checks per service
- **Bulk actions** — select multiple rows to refresh or delete at once
- **Status filters** — filter by UP / SLOW / DOWN / RATE_LIMITED / PENDING via toolbar or metric cards
- **Light/dark mode** — system default, toggle-able
- **Configurable seeding** — pre-load services from `config/seeds.json`
- **Duplicate URL guard** — enforced at both API and client levels

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js instrumentation.ts (server startup)            │
│    └── lib/scheduler.ts — setInterval every 60s         │
│           └── lib/health-checker.ts — checkHealth()     │
│                  └── lib/apply-check-result.ts           │
│                         └── lib/storage.ts              │
│                                └── Upstash Redis        │
└─────────────────────────────────────────────────────────┘
         ↑ writes                       ↓ reads
┌─────────────────────────────────────────────────────────┐
│  API routes (/api/services/*)                           │
│    GET   — list all (includes history[] for sparklines) │
│    POST  — add; fires initial check via after()         │
│    PATCH — rename/re-URL; resets status to PENDING      │
│    DELETE — single or bulk                              │
│    POST /refresh — out-of-cycle immediate check         │
└─────────────────────────────────────────────────────────┘
         ↑ fetch every 60s              ↓ data
┌─────────────────────────────────────────────────────────┐
│  Browser — TanStack Query polls /api/services           │
│    DashboardStateProvider — nuqs URL state              │
│    ServiceDialog (handles pattern) — add / edit         │
│    ServiceDeleteDialog — delete single / bulk           │
└─────────────────────────────────────────────────────────┘
```

### Data flow

1. **Local dev** — `instrumentation.ts` registers a Next.js startup hook; `startScheduler()` runs `checkHealth()` every 60s via `setInterval` in the long-lived Node.js process.
2. **Vercel (production)** — `setInterval` in `instrumentation.ts` never fires (each request is a fresh Lambda). Instead, [cron-job.org](https://cron-job.org) calls `GET /api/cron/health-check` every 1 minute. The route is secured with `Authorization: Bearer CRON_SECRET`.
3. Both paths persist results via `applyCheckResult()` → `writeServices()` → Upstash Redis. API routes are **pure readers** otherwise — no live HTTP calls inside GET.
4. The browser polls `/api/services` every 60 seconds via TanStack Query `refetchInterval`. `HydrationBoundary` pre-populates the cache from server-side storage so the dashboard is never blank on load.
5. Manual refresh triggers `POST /api/services/refresh` — an immediate out-of-cycle check.

## Key Decisions

### Server-side health checks over client-side

Health checks run server-side, not in the browser. Benefits:
- No CORS restrictions on internal or non-public URLs
- Data stays current even when no browser tab is open
- Single writer prevents race conditions
- The client is a pure reader — it never performs HTTP checks

**Two-environment scheduler design:**

| Environment | Trigger | Interval |
|-------------|---------|----------|
| Local dev | `instrumentation.ts` → `setInterval` | 60s |
| Vercel (production) | [cron-job.org](https://cron-job.org) → `GET /api/cron/health-check` | 1 min |

Vercel's serverless model gives each request a fresh Lambda instance — `setInterval` never persists. Vercel's native cron feature is limited to once-daily on the Hobby plan. An external cron service is the practical fix for free-tier deployments.

### Upstash Redis for storage

Service state is stored in Upstash Redis under a single `services` key. Reads and writes are single `GET`/`SET` calls via the Upstash HTTP REST API — no persistent connection, works in any serverless/Lambda environment.

`config/seeds.json` is read at startup only to populate an empty store on first deploy. It is not used at runtime.

### Health score formula

```
weight: UP=1.0, SLOW=0.5, DOWN=0.0, RATE_LIMITED=0.0
history: last 10 checks (ring buffer, newest appended, oldest evicted)
healthScore = Math.round(average(weights) × 100)   → integer 0–100
```

A service always UP scores 100. Always DOWN scores 0. One DOWN in 10 checks = −10 points.

### Rate limit handling

When a service returns HTTP 429:
- Status set to `RATE_LIMITED`, weight `0.0` (same as DOWN for score purposes)
- `Retry-After` header parsed — handles both integer seconds and HTTP-date strings
- Falls back to 5-minute cooldown if header absent
- `rateLimitedUntil` stored on the service; client renders a live countdown
- Status badge shows "Rate Limited" (orange); 403 shows "Forbidden"

### URL-backed dashboard state (nuqs)

All dashboard state (view, search, status filters, sort, pagination) is stored in the URL via `nuqs`. This means:
- Shareable URLs — paste a filtered view to a colleague and they see the same thing
- Browser back/forward works correctly
- No state loss on page refresh
- Table pagination is also URL-backed (`tablePageIndex`, `tablePageSize`)

### Dialog handles (Base UI)

Add/edit/delete dialogs use `DialogPrimitive.createHandle()` / `AlertDialogPrimitive.createHandle()`. This removes prop-drilling of open-state through the component tree. Any component can open a dialog by calling `handle.open(payload)` without being a descendant of the dialog.

### Duplicate URL enforcement

Duplicate URLs are blocked at two levels:
1. **API** — `POST /api/services` and `PATCH /api/services/[id]` compare normalised URLs against existing services and return `409 Conflict`
2. **Client** — `ServiceDialog` checks the TanStack Query cache before submitting, providing immediate feedback without a round-trip

## Status Thresholds

| Condition | Status |
|-----------|--------|
| HTTP 2xx, latency < 500ms | UP |
| HTTP 2xx, latency 500–1999ms | SLOW |
| HTTP 2xx, latency ≥ 2000ms | DOWN |
| Non-2xx (except 429) | DOWN |
| HTTP 429 | RATE_LIMITED |
| Timeout (AbortSignal, 2s) | DOWN (errorKind: TIMEOUT) |
| Network failure | DOWN (errorKind: NETWORK) |
| Not yet checked | PENDING |

## Known Issues & Limitations

**`setInterval` scheduler does not run on Vercel.** Vercel's serverless model creates a fresh Lambda per request — `instrumentation.ts` runs but `setInterval` is never persistent. Production health checks rely entirely on [cron-job.org](https://cron-job.org) calling `GET /api/cron/health-check` every minute. If the external cron is misconfigured or paused, no checks run. For local dev, `setInterval` works normally in the long-lived Node.js process.

**Concurrent write race at scale.** The scheduler fires all health checks in parallel. Each check reads the full service list, updates one entry, and writes the full list back. Two checks finishing simultaneously can clobber each other's result. The fix is per-service read/write (`HGET`/`HSET` on the service's own Redis Hash field) so updates are field-scoped and independent. At the current scale (≤50 services, 60 s interval, checks completing within ~2 s), the race window is narrow and the practical impact is negligible — a result is occasionally overwritten and corrected on the next tick.

**No check during rate-limit window.** When a service is `RATE_LIMITED` the scheduler still calls `checkHealth()` on it every 60s — the 429 will keep resetting the cooldown timer. Production fix: skip the check if `rateLimitedUntil` is in the future.

**mock:// URLs are development-only.** The `mock://up`, `mock://slow`, `mock://down` URL scheme bypasses real network checks. They are useful for local dev and tests but should not appear in production seeds.

**No persistent alerting.** The dashboard shows current status only — there is no webhook, email, or Slack notification when a service transitions to DOWN. This is a deliberate scope decision; adding it would require a status-change diff on each scheduler tick.

**In-memory query cache only.** The browser cache is not persisted (no `localStorage` or `IndexedDB`). A hard refresh always refetches from the server. This is intentional for a server-side architecture — the server is the source of truth.

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `SEED_ON_STARTUP` | `true` | Seed services from `config/seeds.json` on first run |
| `DATA_DIR` | `./data` | Directory for the `services.json` runtime file |

Edit `config/seeds.json` to configure which services are pre-loaded. Set the array to `[]` to start empty.

## Deployment (Vercel + cron-job.org)

### Environment variables

| Env var | Description |
|---------|-------------|
| `CRON_SECRET` | Random hex string — cron-job.org sends this as `Authorization: Bearer <secret>` |
| `SEED_ON_STARTUP` | `true` / `false` |

### cron-job.org setup

1. Create a free account at [cron-job.org](https://cron-job.org)
2. Add a new cron job:
   - **URL:** `https://<your-production-domain>/api/cron/health-check`
   - **Schedule:** every 1 minute (minimum supported interval)
   - **Headers (Advanced tab):** `Authorization: Bearer <your CRON_SECRET>`
3. Use the **production** Vercel URL, not a preview URL — Vercel preview deployments have SSO protection enabled by default, which blocks external HTTP callers

### Why not Vercel's built-in cron?

Vercel's native cron is limited to once-daily on the Hobby plan. `* * * * *` (every minute) is blocked. An external cron service is the free-tier workaround.

## Running Tests

```bash
pnpm test           # run all tests once
pnpm test:watch     # watch mode

# single file
pnpm vitest run __tests__/lib/health-checker.test.ts
```

Tests cover `checkHealth` (UP/SLOW/DOWN/RATE_LIMITED, all error kinds, mock:// scheme, Retry-After variants) and `computeHealthScore` (ring buffer, eviction, averaging).

## Tech Stack

- **Next.js 16 App Router** — server components, route handlers, `instrumentation.ts` startup hook, `after()` for post-response work
- **TanStack Query** — client polling, `HydrationBoundary` for SSR prefetch
- **TanStack Table** — sortable, selectable, paginated data table
- **nuqs** — URL-backed state (view, search, filters, sort, pagination)
- **Base UI / Shadcn UI** — accessible component primitives; dialog handle pattern
- **next-themes** — system-aware dark/light mode
- **Sonner** — toast notifications
- **Vitest** — unit tests for health checker and storage modules
