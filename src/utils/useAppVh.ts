// utils/useAppVh.ts
import { useEffect, useLayoutEffect } from "react";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useAppVh() {
  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const vv = window.visualViewport;
    const STABILIZE_MS = 600;       // <-- key: avoid first-paint growth
    const JITTER_PX = 4;            // ignore tiny oscillations
    const start = performance.now();

    const clamp = (n: number) => Math.max(200, Math.floor(n));
    const readSmallest = () =>
      clamp(Math.min(window.innerHeight, vv?.height ?? window.innerHeight));

    // Start at the smallest to avoid underlapping the URL bar
    let minSeen = readSmallest();
    let current = minSeen;
    root.style.setProperty("--app-vh", current + "px");

    let raf: number | null = null;

    const apply = () => {
      raf = null;
      const now = performance.now();
      const h = readSmallest();

      // During stabilization, never increase beyond the smallest we've seen.
      if (now - start < STABILIZE_MS) {
        minSeen = Math.min(minSeen, h);
        if (Math.abs(minSeen - current) >= JITTER_PX) {
          current = minSeen;
          root.style.setProperty("--app-vh", current + "px");
        }
        return;
      }

      // After stabilization: follow both grow & shrink
      if (Math.abs(h - current) >= JITTER_PX) {
        current = h;
        root.style.setProperty("--app-vh", current + "px");
      }
    };

    const schedule = () => {
      if (raf != null) return;
      raf = requestAnimationFrame(apply);
    };

    // One post-paint correction, then listen
    const post = requestAnimationFrame(apply);
    vv?.addEventListener("resize", schedule as any, { passive: true } as any);
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(post);
      if (raf != null) cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", schedule as any);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);
}
