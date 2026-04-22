import { Line, LineChart } from 'recharts';

const LINE_COLORS: Record<string, string> = {
  UP: '#22c55e',
  SLOW: '#f59e0b',
  DOWN: 'var(--color-destructive)',
  PENDING: '#6b7280',
};

export interface HealthHistoryLineProps {
  /** Encoded samples: 1.0 = UP, 0.5 = SLOW, 0.0 = DOWN */
  history: number[];
  status: string;
  className?: string;
}

/** Compact line chart of encoded health history; stroke follows aggregate `status`. */
export function HealthHistoryLine({
  history,
  status,
  className,
}: HealthHistoryLineProps) {
  if (history.length < 2) {
    return <div className={`h-7 w-20 ${className ?? ''}`} />;
  }

  const data = history.map((v, i) => ({ i, v }));
  const color = LINE_COLORS[status] ?? LINE_COLORS.PENDING;

  return (
    <div className={className}>
      <LineChart
        width={80}
        height={28}
        data={data}
        margin={{ top: 3, right: 3, bottom: 3, left: 3 }}
      >
        <Line
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          type="monotone"
          strokeDasharray={status === 'DOWN' ? '4 2' : undefined}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
}
