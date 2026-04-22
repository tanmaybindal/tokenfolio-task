import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import {
  checkHealth,
  computeHealthScore,
  STATUS_WEIGHT,
} from "@/lib/health-checker";

// ── computeHealthScore ──────────────────────────────────────────────────────

describe("computeHealthScore", () => {
  test("single UP check scores 100", () => {
    const { healthScore } = computeHealthScore([], STATUS_WEIGHT.UP);
    expect(healthScore).toBe(100);
  });

  test("single DOWN check scores 0", () => {
    const { healthScore } = computeHealthScore([], STATUS_WEIGHT.DOWN);
    expect(healthScore).toBe(0);
  });

  test("single SLOW check scores 50", () => {
    const { healthScore } = computeHealthScore([], STATUS_WEIGHT.SLOW);
    expect(healthScore).toBe(50);
  });

  test("ring buffer caps at 10 entries", () => {
    const history = Array(10).fill(STATUS_WEIGHT.UP);
    const { history: updated } = computeHealthScore(
      history,
      STATUS_WEIGHT.DOWN,
    );
    expect(updated).toHaveLength(10);
    expect(updated[9]).toBe(STATUS_WEIGHT.DOWN);
  });

  test("evicts oldest entry when buffer is full", () => {
    const history = Array(10).fill(STATUS_WEIGHT.UP); // all UP
    const { history: updated } = computeHealthScore(
      history,
      STATUS_WEIGHT.DOWN,
    );
    // 9 UP (1.0) + 1 DOWN (0.0) = 90
    expect((updated.reduce((a, b) => a + b, 0) / updated.length) * 100).toBe(
      90,
    );
  });

  test("mixed history averages correctly", () => {
    // 5 UP (1.0) + 5 DOWN (0.0) = 50
    const history = [...Array(5).fill(1.0), ...Array(4).fill(0.0)];
    const { healthScore } = computeHealthScore(history, 0.0);
    expect(healthScore).toBe(50);
  });
});

// ── checkHealth ─────────────────────────────────────────────────────────────

describe("checkHealth", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns UP for 2xx response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);
    const result = await checkHealth("https://example.com");
    expect(result.status).toBe("UP");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  test("returns DOWN for non-2xx response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);
    const result = await checkHealth("https://example.com");
    expect(result.status).toBe("DOWN");
  });

  test("returns DOWN for network failure", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const result = await checkHealth("https://example.com");
    expect(result.status).toBe("DOWN");
  });

  test("returns DOWN for timeout (AbortError)", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(
      Object.assign(new Error("The operation was aborted"), {
        name: "AbortError",
      }),
    );
    const result = await checkHealth("https://example.com");
    expect(result.status).toBe("DOWN");
  });

  // ── mock:// URL scheme ────────────────────────────────────────────────────

  test("mock://down returns DOWN without a real fetch", async () => {
    const result = await checkHealth("mock://down");
    expect(result.status).toBe("DOWN");
    expect(vi.mocked(global.fetch)).not.toHaveBeenCalled();
  });

  test("mock://slow returns SLOW without a real fetch", async () => {
    const result = await checkHealth("mock://slow");
    expect(result.status).toBe("SLOW");
  });

  test("mock://up returns UP without a real fetch", async () => {
    const result = await checkHealth("mock://up");
    expect(result.status).toBe("UP");
  });
});
