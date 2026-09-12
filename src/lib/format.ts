/** "12.3s" under a minute, "1:02.3" from a minute up. */
export function formatDuration(ms: number): string {
  const tenths = Math.floor(Math.max(0, ms) / 100);
  const totalSeconds = Math.floor(tenths / 10);
  const tenth = tenths % 10;
  if (totalSeconds < 60) return `${totalSeconds}.${tenth}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${tenth}`;
}

/** Three-character LED readout: 000 to 999, or -01 to -99 for negatives. */
export function formatCounter(value: number): string {
  const n = Math.trunc(value);
  if (n < 0) return `-${String(Math.min(99, -n)).padStart(2, "0")}`;
  return String(Math.min(999, n)).padStart(3, "0");
}

/** Whole seconds shown on the in-game clock, capped like the classic 3-digit display. */
export function clockSeconds(ms: number): number {
  return Math.min(999, Math.floor(Math.max(0, ms) / 1000));
}
