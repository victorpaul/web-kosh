export const rnd = (lo: number, hi: number): number => lo + Math.floor(Math.random() * (hi - lo + 1));

export const pick = <T>(list: readonly T[]): T => list[rnd(0, list.length - 1)];

export function shuffle<T>(list: readonly T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
