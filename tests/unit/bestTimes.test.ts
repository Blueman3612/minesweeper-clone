import { describe, expect, it } from "vitest";
import {
  BEST_TIMES_KEY,
  loadBestTimes,
  recordBestTime,
  recordTime,
  saveBestTimes,
  type StorageLike,
} from "@/lib/bestTimes";
import { clockSeconds, formatCounter, formatDuration } from "@/lib/format";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

describe("recordTime", () => {
  it("records a first time and keeps the minimum afterwards", () => {
    const a = recordTime({}, "beginner", 12_300);
    expect(a).toEqual({ times: { beginner: 12_300 }, improved: true, previous: undefined });
    const b = recordTime(a.times, "beginner", 15_000);
    expect(b.improved).toBe(false);
    expect(b.times.beginner).toBe(12_300);
    const c = recordTime(b.times, "beginner", 9_000);
    expect(c).toEqual({ times: { beginner: 9_000 }, improved: true, previous: 12_300 });
  });

  it("keeps difficulties independent", () => {
    const t = recordTime(recordTime({}, "beginner", 5_000).times, "expert", 90_000).times;
    expect(t).toEqual({ beginner: 5_000, expert: 90_000 });
  });

  it("ignores garbage durations", () => {
    expect(recordTime({ beginner: 1 }, "beginner", NaN).improved).toBe(false);
    expect(recordTime({}, "beginner", -5).times).toEqual({});
  });
});

describe("storage round trip", () => {
  it("persists and reloads", () => {
    const storage = memoryStorage();
    saveBestTimes(storage, { intermediate: 42_000 });
    expect(JSON.parse(storage.data[BEST_TIMES_KEY])).toEqual({ intermediate: 42_000 });
    expect(loadBestTimes(storage)).toEqual({ intermediate: 42_000 });
  });

  it("survives corrupt or hostile stored values", () => {
    expect(loadBestTimes(memoryStorage({ [BEST_TIMES_KEY]: "not json" }))).toEqual({});
    expect(loadBestTimes(memoryStorage({ [BEST_TIMES_KEY]: "[1,2]" }))).toEqual({});
    expect(
      loadBestTimes(
        memoryStorage({
          [BEST_TIMES_KEY]: JSON.stringify({ beginner: "12", expert: -1, bogus: 5, intermediate: 7 }),
        }),
      ),
    ).toEqual({ intermediate: 7 });
    const throwing: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadBestTimes(throwing)).toEqual({});
    expect(() => saveBestTimes(throwing, { beginner: 1 })).not.toThrow();
  });

  it("recordBestTime only writes on improvement", () => {
    const storage = memoryStorage({ [BEST_TIMES_KEY]: JSON.stringify({ beginner: 10_000 }) });
    const slower = recordBestTime(storage, "beginner", 20_000);
    expect(slower.improved).toBe(false);
    expect(JSON.parse(storage.data[BEST_TIMES_KEY])).toEqual({ beginner: 10_000 });
    const faster = recordBestTime(storage, "beginner", 8_000);
    expect(faster).toMatchObject({ improved: true, previous: 10_000 });
    expect(JSON.parse(storage.data[BEST_TIMES_KEY])).toEqual({ beginner: 8_000 });
  });
});

describe("formatting", () => {
  it("formats durations", () => {
    expect(formatDuration(0)).toBe("0.0s");
    expect(formatDuration(12_340)).toBe("12.3s");
    expect(formatDuration(59_999)).toBe("59.9s");
    expect(formatDuration(60_000)).toBe("1:00.0");
    expect(formatDuration(83_450)).toBe("1:23.4");
  });

  it("formats the LED counters", () => {
    expect(formatCounter(0)).toBe("000");
    expect(formatCounter(7)).toBe("007");
    expect(formatCounter(99)).toBe("099");
    expect(formatCounter(1234)).toBe("999");
    expect(formatCounter(-3)).toBe("-03");
    expect(formatCounter(-150)).toBe("-99");
  });

  it("caps the clock at 999 seconds", () => {
    expect(clockSeconds(0)).toBe(0);
    expect(clockSeconds(1_999)).toBe(1);
    expect(clockSeconds(5_000_000)).toBe(999);
  });
});
