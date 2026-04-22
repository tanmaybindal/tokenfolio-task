/** Latency under 1000ms as `Nms`, otherwise seconds with up to one decimal (e.g. `1s`, `1.2s`). */
export function formatLatencyParts(ms: number): {
  value: string;
  unit: "ms" | "s";
} {
  if (ms < 1000) {
    return { value: String(ms), unit: "ms" };
  }
  const sec = ms / 1000;
  const rounded = Math.round(sec * 10) / 10;
  const value = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
  return { value, unit: "s" };
}
