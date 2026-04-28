import { Bar, BarChart } from 'recharts';
import type { BarShapeProps } from 'recharts';

import { STATUS_WEIGHT } from '@/constants/status-weight';

const chartConfig = {
  up: { color: 'var(--color-green-600)' },
  slow: { color: 'var(--color-amber-500)' },
  down: { color: 'var(--color-destructive)' },
  pending: { color: 'var(--color-muted)' },
};

function statusColor(value: number | null): string {
  if (value == null) return chartConfig.pending.color;
  if (value === STATUS_WEIGHT.UP) return chartConfig.up.color;
  if (value === STATUS_WEIGHT.SLOW) return chartConfig.slow.color;
  return chartConfig.down.color;
}

export interface HealthHistoryBarsProps {
  /** Encoded samples: 1.0 = UP, 0.5 = SLOW, 0.0 = DOWN */
  history: number[];
  className?: string;
}

/** Last health checks as a fixed-width bar strip (10 slots, padded with placeholders). */
export function HealthHistoryBars({
  history,
  className,
}: HealthHistoryBarsProps) {
  if (history.length === 0) {
    return (
      <div
        className={`flex items-center text-xs text-muted-foreground ${className ?? ''}`}
      >
        No data yet
      </div>
    );
  }

  // Always render 10 bars. New services start with gray placeholders.
  const raw = history.slice(-10);
  const paddedHistory: Array<number | null> = [
    ...Array(10 - raw.length).fill(null),
    ...raw,
  ];

  // Keep statusValue for colour lookup; bar is always 1 so every bar is full-height.
  const data = paddedHistory.map((statusValue, i) => ({
    i,
    bar: 1,
    statusValue,
  }));

  return (
    <div className={className}>
      {/* Fixed dimensions avoid ResponsiveContainer zero-size warnings */}
      <BarChart width={128} height={28} data={data} barCategoryGap="6%">
        <Bar
          dataKey="bar"
          isAnimationActive={false}
          shape={(props: BarShapeProps) => {
            const { x, y, width, height } = props;
            const sv =
              (props as unknown as Record<string, Record<string, number>>)
                .payload?.statusValue ?? 0;
            return (
              <rect
                x={x}
                y={y}
                width={width ?? 0}
                height={Math.max(0, height ?? 0)}
                rx={2}
                ry={2}
                fill={statusColor(sv)}
              />
            );
          }}
        />
      </BarChart>
    </div>
  );
}
