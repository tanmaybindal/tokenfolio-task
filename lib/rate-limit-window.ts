export function isInRateLimitWindow(
  rateLimitedUntil?: string | null,
  now = Date.now(),
): boolean {
  if (!rateLimitedUntil) return false;

  const rateLimitedUntilMs = new Date(rateLimitedUntil).getTime();
  if (Number.isNaN(rateLimitedUntilMs)) return false;

  return rateLimitedUntilMs > now;
}
