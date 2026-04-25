# API Reliability Dashboard

An internal dashboard for monitoring the health and reliability of public APIs, built with Next.js App Router.

> Note: There is a separate `server-side-architecture` branch exploring a server-side architecture approach. It is still a work in progress (WIP) and not complete yet.

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

- **Real-time health monitoring** — services are re-checked every 30 seconds via TanStack Query polling
- **Status classification** — UP / SLOW / DOWN / RATE_LIMITED based on response and latency thresholds
- **Health score** — rolling average of last 10 checks (UP=100%, SLOW=50%, DOWN=0%)
- **Card and table views** — toggle between layouts, preference/state synced in URL query params (`nuqs`)
- **Sortable table** — click any column header to sort; Status uses a meaningful sort order (UP → SLOW → DOWN)
- **Spark-line trends** — coloured bar chart of last 10 checks per service
- **Bulk actions** — select multiple rows to refresh or delete at once
- **Duplicate URL guard** — add/edit validation prevents monitoring the same endpoint twice
- **Human-friendly error UX** — cards and table display readable error states (e.g. Forbidden, Rate limited) instead of raw technical noise
- **Light/dark mode** — system default, toggle-able
- **Configurable seeding** — pre-load services from `config/seeds.json`

## Architecture & Key Decisions

### Why client-side polling?

For this implementation, checks run in the dashboard client via TanStack Query polling (`refetchInterval`), with manual refresh available for ad-hoc checks. This keeps iteration simple and makes state transitions very visible during development.

### Why in-memory query state?

The runtime state is maintained in TanStack Query cache for this dashboard flow (seeded from `config/seeds.json` when empty). This avoids backend complexity while still supporting sorting, filtering, pagination, and bulk actions cleanly in the UI.

### Why user-friendly status mapping?

Raw HTTP/status details can be noisy for end users. The UI keeps core statuses compact while surfacing readable context for failures (for example, Forbidden or Rate limited) in card/table displays.

### Why TanStack Query instead of router.refresh()?

TanStack Query gives us `refetchInterval`, `isFetching`, mutation states, and cache orchestration out of the box. The refresh countdown is derived from real query timing (`dataUpdatedAt`), and components can coordinate loading/fetching without manual global state wiring.

### Health score formula

```
weight = UP→1.0, SLOW→0.5, DOWN→0.0
history = last 10 checks (ring buffer)
healthScore = Math.round(average(history) × 100)
```

A service always UP scores 100. Always DOWN scores 0. Always SLOW scores 50. A single DOWN in 10 checks drops the score by 10 points.

## Scale Trade-offs

**"What if you had 500 services?"**
Client-side checking would become a bottleneck (browser/network constraints, noisy UI updates, and limited control over retries/concurrency). The fix would be moving checks to a server-side worker with queue-based concurrency control.

**"What would production look like?"**
Authentication, a durable database, alerting (webhooks/Slack when DOWN), server-side health-check workers, and an audit log of status changes.

**"What's the biggest weakness?"**
Checks currently run from the client context, which is not ideal for always-on monitoring. In production, checks should run in dedicated backend workers.

**"How does this scale for users?"**
This is an internal tool — user scale is bounded. The key scale axis is number of monitored services, and production scaling should prioritize backend check infrastructure over client-side polling.

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
