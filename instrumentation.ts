export async function register() {
  // NEXT_RUNTIME guard: only run in Node.js, not Edge runtime or client builds
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("./lib/scheduler");
    startScheduler();
  }
}
