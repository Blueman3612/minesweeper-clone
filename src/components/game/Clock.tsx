"use client";

import { useEffect, useState } from "react";
import { clockSeconds } from "@/lib/format";
import { LedCounter } from "./LedCounter";

interface Props {
  startedAt: number | null;
  endedAt: number | null;
}

/** Whole-second timer. Ticks only while a round is in progress, so the board never re-renders on ticks. */
export function Clock({ startedAt, endedAt }: Props) {
  const running = startedAt != null && endedAt == null;
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [running]);

  const ms = startedAt == null ? 0 : Math.max(0, (endedAt ?? now) - startedAt);
  return <LedCounter value={clockSeconds(ms)} label="Seconds elapsed" testId="timer" />;
}
