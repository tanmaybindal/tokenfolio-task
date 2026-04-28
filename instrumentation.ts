export async function register() {
  // Guard is load-bearing: instrumentation.ts runs in BOTH Node.js and Edge runtimes on Vercel.
  // Edge runtime (V8 isolate) has no setInterval, no fs, no native Node modules — startScheduler()
  // would crash Edge cold starts without this check.
  //
  // Note: even with this guard, setInterval is dead on Vercel serverless — each request spins a
  // fresh Lambda instance, so the interval never persists. For Vercel, use a cron job instead
  // (vercel.json + /api/cron/health-check route). This file keeps local dev working correctly.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScheduler } = await import('./lib/scheduler');
    startScheduler();
  }
}
