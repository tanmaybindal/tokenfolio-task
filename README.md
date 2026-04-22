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

- **Real-time health monitoring** — services checked every 30 seconds by a background scheduler
- **Status classification** — UP / SLOW / DOWN based on latency thresholds
- **Health score** — rolling average of last 10 checks (UP=100%, SLOW=50%, DOWN=0%)
- **Card and table views** — toggle between layouts, preference saved in localStorage
- **Sortable table** — click any column header to sort; Status uses a meaningful sort order (UP → SLOW → DOWN)
- **Spark-line trends** — coloured bar chart of last 10 checks per service
- **Bulk actions** — select multiple rows to refresh or delete at once
- **Light/dark mode** — system default, toggle-able
- **Configurable seeding** — pre-load services from `config/seeds.json`

## Architecture & Key Decisions

### Why server-side health checks?

Health checks run in a Node.js scheduler, not the browser. This avoids CORS restrictions on non-public URLs and enables persistent JSON file storage. The browser only reads — it never performs HTTP checks directly.

### Why JSON file instead of SQLite or Postgres?

The data model is a flat list of services with their latest check result. There are no relational queries, no joins, no need for transactions. JSON with atomic writes is appropriate for this scale — a good engineer picks the right tool, not the most impressive one.

**Atomic write pattern:** We write to a `.tmp` file then `fs.renameSync` to the real path. This prevents corrupt JSON if the process dies mid-write.

### Why a background scheduler instead of on-demand checks?

A monitoring dashboard should keep data current even when no one is looking. The scheduler runs every 30s via `setInterval` started in `instrumentation.ts` (Next.js's official server startup hook). The client polls the read API every 30s — it never triggers checks.

Manual refresh triggers an immediate out-of-cycle check without affecting the scheduler's interval.

### Why TanStack Query instead of router.refresh()?

TanStack Query gives us `refetchInterval`, `isFetching`, `dataUpdatedAt`, and `refetchOnWindowFocus` for free. The countdown timer is derived from `dataUpdatedAt` — accurate to the real last fetch, not a cosmetic timer. `HydrationBoundary` prefetches on the server so the dashboard is never blank on load.

### Health score formula

```
weight = UP→1.0, SLOW→0.5, DOWN→0.0
history = last 10 checks (ring buffer)
healthScore = Math.round(average(history) × 100)
```

A service always UP scores 100. Always DOWN scores 0. Always SLOW scores 50. A single DOWN in 10 checks drops the score by 10 points.

## Scale Trade-offs

**"What if you had 500 services?"**
The JSON file becomes a write bottleneck — the scheduler checking 500 services in parallel would need locking or a queue. The fix: move to SQLite or Postgres, replace `setInterval` with BullMQ for parallel checks with concurrency limits.

**"What would production look like?"**
Authentication, a real database, alerting (webhooks/Slack when DOWN), the scheduler as a separate worker process (so it survives Next.js restarts), and an audit log of status changes.

**"What's the biggest weakness?"**
The scheduler is in-process with the Next.js server. If the server restarts, health checks pause. In production, the checker would be a standalone worker.

**"How does this scale for users?"**
This is an internal tool — user scale is bounded. The meaningful scale axis is number of services, not concurrent users. Bottlenecks are the scheduler and the JSON file, not HTTP throughput.

## Configuration

| Env var           | Default  | Description                                         |
| ----------------- | -------- | --------------------------------------------------- |
| `SEED_ON_STARTUP` | `true`   | Seed services from `config/seeds.json` on first run |
| `DATA_DIR`        | `./data` | Directory for the `services.json` runtime file      |

Edit `config/seeds.json` to configure which services are pre-loaded. Set the array to `[]` to start empty.

## Running Tests

```bash
pnpm test           # run all tests once
pnpm test:watch     # watch mode
```

## Tech Stack

- **Next.js App Router** — server components, route handlers, `instrumentation.ts` startup hook
- **TanStack Query** — client polling with `HydrationBoundary` for SSR prefetch
- **TanStack Table** — sortable, selectable data table
- **Shadcn UI / Base UI** — accessible, unstyled component primitives
- **Recharts** — spark-line bar charts via `ChartContainer`
- **next-themes** — system-aware dark/light mode
- **Sonner** — toast notifications
- **Vitest** — unit tests for storage and health checker modules
