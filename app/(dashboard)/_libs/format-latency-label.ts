import { formatLatencyParts } from './format-latency-parts';

export function formatLatencyLabel(ms: number): string {
  const { value, unit } = formatLatencyParts(ms);
  return `${value}${unit}`;
}
