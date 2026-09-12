"use client";

import { useMemo, useSyncExternalStore } from "react";
import { BEST_TIMES_KEY, loadBestTimes, type BestTimes } from "@/lib/bestTimes";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(BEST_TIMES_KEY);
  } catch {
    return null;
  }
}

/**
 * Best times from localStorage, kept in sync with other tabs. Returns an empty table during
 * server rendering and the first client paint so the menu hydrates without a mismatch.
 */
export function useBestTimes(): BestTimes {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(
    () => (raw == null ? {} : loadBestTimes({ getItem: () => raw, setItem: () => {} })),
    [raw],
  );
}
