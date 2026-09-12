export type Rng = () => number;

/** mulberry32: small deterministic 32-bit PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MAX_SEED = 0xffffffff;

export function randomSeed(): number {
  return Math.floor(Math.random() * (MAX_SEED + 1));
}

/** Parse a seed from a URL query value. Returns null for anything that is not a 32-bit unsigned integer. */
export function parseSeed(raw: string | null | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  if (!/^\d+$/.test(raw.trim())) return null;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX_SEED) return null;
  return n;
}
