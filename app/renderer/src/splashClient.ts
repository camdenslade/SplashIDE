import type { SplashIPC } from "./types/splash";

// Safe access to window.splash without any
function getSplash(): SplashIPC | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { splash?: SplashIPC };
  return w.splash ?? null;
}

export const splash: SplashIPC = new Proxy({} as SplashIPC, {
  get(_target, prop: keyof SplashIPC) {
    const api = getSplash();

    // Preload not ready → return async no-op function
    if (!api) {
      console.warn(`[DEBUG] splash not ready: attempted access to ${String(prop)}`);
      const fallback = async () => null;
      return fallback as SplashIPC[keyof SplashIPC];
    }

    const value = api[prop];

    // Function wrapping WITHOUT SPREAD → fixes TS2556
    if (typeof value === "function") {
      const wrapped = (...args: unknown[]) => {
        try {
          return (value as (...arguments_: unknown[]) => unknown).apply(api, args);
        } catch (err) {
          console.error(`[DEBUG] splash.${String(prop)} threw:`, err);
          throw err;
        }
      };
      return wrapped as SplashIPC[keyof SplashIPC];
    }

    // Non-function → return as-is
    return value;
  },
});
