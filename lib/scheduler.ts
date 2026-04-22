import { readServices, writeServices } from "./storage";
import {
  checkHealth,
  computeHealthScore,
  STATUS_WEIGHT,
} from "./health-checker";
import { applySeedsIfEmpty } from "./seeds";

let started = false;

export function startScheduler(): void {
  // Guard against double-start during Next.js hot reload in dev
  if (started) return;
  started = true;

  applySeedsIfEmpty();
  void runChecks(); // initial check on startup without blocking

  setInterval(() => void runChecks(), 30_000);
}

async function runChecks(): Promise<void> {
  const data = readServices();
  if (data.services.length === 0) return;

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

  writeServices({ services: updated });
}
