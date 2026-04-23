export const SERVICE_STATUSES = ['UP', 'SLOW', 'DOWN', 'PENDING'] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

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
}

export interface ServicesData {
  services: Service[];
}

export interface CheckResult {
  status: Exclude<ServiceStatus, 'PENDING'>;
  latencyMs: number;
}

// ServiceResponse = Service; history[] is included so the dashboard can build
// the histories map without a second fetch
export type ServiceResponse = Service;
