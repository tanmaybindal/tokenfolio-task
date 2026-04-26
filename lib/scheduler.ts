import { applyCheckResult } from './apply-check-result';
import {
  checkHealth,
  computeHealthScore,
  STATUS_WEIGHT,
} from './health-checker';
import { isInRateLimitWindow } from './rate-limit-window';
import { applySeedsIfEmpty } from './seeds';
import { readServices, writeServices } from './storage';

let started = false;

export function startScheduler(): void {
  // Guard against double-start during Next.js hot reload in dev
  if (started) return;
  started = true;

  void applySeedsIfEmpty();
  void runChecks(); // initial check on startup without blocking

  setInterval(() => void runChecks(), 30_000);
}

async function runChecks(): Promise<void> {
  const data = await readServices();
  if (data.services.length === 0) return;

  const updated = await Promise.all(
    data.services.map(async (service) => {
      if (isInRateLimitWindow(service.rateLimitedUntil)) {
        return service;
      }

      const result = await checkHealth(service.url);
      const weight = STATUS_WEIGHT[result.status];
      const { history, healthScore } = computeHealthScore(
        service.history,
        weight,
      );
      return applyCheckResult(service, result, history, healthScore);
    }),
  );

  await writeServices({ services: updated });
}
