import { SERVICE_STATUS } from '@/types';

export const STATUS_WEIGHT = {
  [SERVICE_STATUS.UP]: 1.0,
  [SERVICE_STATUS.SLOW]: 0.5,
  [SERVICE_STATUS.DOWN]: 0.0,
  [SERVICE_STATUS.RATE_LIMITED]: 0.0,
} as const;

export type StatusWeight = (typeof STATUS_WEIGHT)[keyof typeof STATUS_WEIGHT];
