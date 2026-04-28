export const SERVICE_STATUS = {
  UP: 'UP',
  SLOW: 'SLOW',
  DOWN: 'DOWN',
  RATE_LIMITED: 'RATE_LIMITED',
  PENDING: 'PENDING',
} as const;
export type ServiceStatus =
  (typeof SERVICE_STATUS)[keyof typeof SERVICE_STATUS];
export const SERVICE_STATUSES = Object.values(
  SERVICE_STATUS,
) as ServiceStatus[];

export const SERVICE_ERROR_KIND = {
  HTTP: 'HTTP',
  TIMEOUT: 'TIMEOUT',
  NETWORK: 'NETWORK',
} as const;
export type ServiceErrorKind =
  (typeof SERVICE_ERROR_KIND)[keyof typeof SERVICE_ERROR_KIND];

export interface Service {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  status: ServiceStatus;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  healthScore: number | null;
  history: number[]; // ring buffer: 1.0=UP, 0.5=SLOW, 0.0=DOWN, max 10
  rateLimitedUntil?: string | null;
  lastHttpStatus?: number | null;
  lastErrorKind?: ServiceErrorKind | null;
}

export interface CheckResult {
  status: Exclude<ServiceStatus, 'PENDING'>;
  latencyMs: number;
  retryAfterMs?: number;
  httpStatus?: number | null;
  errorKind?: ServiceErrorKind | null;
}

// ServiceResponse = Service; history[] is included so the dashboard can build
// the histories map without a second fetch
export type ServiceResponse = Service;
