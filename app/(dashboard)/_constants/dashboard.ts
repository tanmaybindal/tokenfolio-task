export const DASHBOARD_VIEW = {
  CARD: 'card',
  TABLE: 'table',
} as const;

export type DashboardView =
  (typeof DASHBOARD_VIEW)[keyof typeof DASHBOARD_VIEW];

export const DASHBOARD_DEFAULT_VIEW: DashboardView = DASHBOARD_VIEW.TABLE;

export const DASHBOARD_SERVICE_STATUS = {
  UP: 'UP',
  SLOW: 'SLOW',
  DOWN: 'DOWN',
} as const;

export const DASHBOARD_REFETCH_INTERVAL_MS = 30_000;

export const DASHBOARD_SORT_OPTION = {
  NAME_ASC: 'name-asc',
  NAME_DESC: 'name-desc',
  HEALTH_DESC: 'health-desc',
  LATENCY_ASC: 'latency-asc',
} as const;

export type DashboardSortOption =
  (typeof DASHBOARD_SORT_OPTION)[keyof typeof DASHBOARD_SORT_OPTION];
