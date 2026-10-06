import { rnd } from '../kit/random';

export type OpKey = '+' | '-' | '*' | '/' | '?';
export const OPS: Record<OpKey, { label: string; pictures: boolean; compare?: boolean }> = {
  '+': { label: '+', pictures: true },
  '-': { label: '−', pictures: true },
  '*': { label: '×', pictures: false },
  '/': { label: '÷', pictures: false },
  '?': { label: '< = >', pictures: true, compare: true },
};
export const OP_KEYS = Object.keys(OPS) as OpKey[];

export const PRESET_SETS: Record<string, string[]> = {
  fruit: ['🍎', '🍌', '🍓', '🍊', '🍐', '🍇', '🍉', '🍒', '🥝', '🍍'],
  veggies: ['🥕', '🌽', '🥦', '🍅', '🥔', '🧅', '🌶️', '🥒', '🍄', '🥬'],
  dinos: ['🦕', '🦖', '🐉', '🥚', '🦴', '🌋', '🐊', '🦎'],
  animals: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🦁', '🐷', '🐵', '🐨'],
  farm: ['🐄', '🐑', '🐔', '🐴', '🐓', '🦆', '🐐', '🐖'],
  sea: ['🐟', '🐠', '🐙', '🦀', '🐢', '🐬', '🦈', '🐳', '🦞', '🐚'],
  bugs: ['🐝', '🐞', '🦋', '🐛', '🐜', '🕷️', '🦗', '🐌'],
  sweets: ['🍬', '🍭', '🧁', '🍪', '🍩', '🎂', '🍫', '🍦'],
  vehicles: ['🚗', '🚌', '🚂', '✈️', '🚀', '🚲', '🚜', '⛵', '🚁', '🛴'],
  space: ['⭐', '🌙', '☀️', '🪐', '🌈', '☁️', '❄️', '⚡'],
  toys: ['🤖', '🧸', '🎈', '⚽', '🪁', '🎁', '🎨', '🧩'],
  nature: ['🌳', '🌻', '🌷', '🍁', '🌵', '🌲', '🍀', '🌸'],
};
export const SET_KEYS = Object.keys(PRESET_SETS);

export const MODE_KEYS = ['numbers', 'mixed', 'pictures'] as const;
export type Mode = (typeof MODE_KEYS)[number];

/* picture entries are {type:"emoji"|"img", v:…}; older sheets stored bare data URLs */
export interface Pic {
  type: 'emoji' | 'img';
  v: string;
}
export const normPic = (p: Pic | string): Pic => (typeof p === 'string' ? { type: 'img', v: p } : p);

/* which part is left blank for the child: the answer, an operand, or the comparison sign */
export type Hide = 'r' | 'a' | 'b' | 'op';

export interface MathTask {
  op: OpKey;
  a: number;
  b: number;
  r?: number;
  picture: boolean;
  hide: Hide;
  pic?: Pic;
}

export interface MathSheet {
  title: string;
  ops: OpKey[];
  mode: Mode;
  min: number;
  max: number;
  count: number;
  cols: number;
  missing: boolean;
  preset: boolean;
  sets: string[];
  images: (Pic | string)[];
  tasks: MathTask[];
}

/* counters per group: they wrap into a block, so a group can hold more than one row of them */
export const maxPics = (s: MathSheet): number => (s.cols >= 3 ? 6 : s.cols === 2 ? 10 : 16);

export const activeSets = (s: MathSheet): string[] => (s.preset === false ? [] : s.sets || []);

export const picPool = (s: MathSheet): Pic[] =>
  activeSets(s)
    .flatMap((k) => (PRESET_SETS[k] || []).map((e): Pic => ({ type: 'emoji', v: e })))
    .concat((s.images || []).map(normPic));

/* ---------- task generation ---------- */
export function makeTask(s: MathSheet, op: OpKey, picture: boolean): MathTask {
  const min = Math.min(s.min, s.max);
  const max = Math.max(s.min, s.max);
  const cap = picture ? maxPics(s) : Infinity;

  if (op === '?') {
    const lo = picture ? Math.max(1, min) : min;
    const hi = Math.max(lo, Math.min(max, cap));
    return { op, a: rnd(lo, hi), b: rnd(lo, hi), picture, hide: 'op' };
  }

  /* a picture answer can only be as big as the counters allow: a+b for sums, a alone for takeaways */
  let ceiling = max;
  if (picture) ceiling = Math.min(max, op === '+' ? cap * 2 : cap);
  const floor = Math.min(min, ceiling);

  for (let attempt = 0; attempt < 200; attempt++) {
    const r = rnd(floor, ceiling);
    let a: number;
    let b: number;
    if (op === '+') {
      a = rnd(0, r);
      b = r - a;
    } else if (op === '-') {
      b = rnd(0, Math.min(max, cap));
      a = r + b;
    } else if (op === '*') {
      const divisors: number[] = [];
      for (let d = 1; d <= 12; d++) if (r % d === 0 && r / d <= 12) divisors.push(d);
      if (!divisors.length) continue;
      a = divisors[rnd(0, divisors.length - 1)];
      b = r / a;
    } else {
      b = rnd(1, 10);
      a = r * b;
    }
    if (a > cap || b > cap) continue;
    if (picture && (a < 1 || b < 1)) continue; /* a pile of nothing reads badly */
    if (op === '/' && a > 144) continue;
    /* sometimes blank an operand instead of the answer: 4 + ☐ = 7 */
    let hide: Hide = 'r';
    if (s.missing && !picture && Math.random() < 0.4) hide = Math.random() < 0.5 ? 'a' : 'b';
    return { op, a, b, r, picture, hide };
  }
  return { op: '+', a: min, b: 0, r: min, hide: 'r', picture: false }; /* range has no valid task for this op */
}

export function generateTasks(s: MathSheet): MathTask[] {
  const usable = s.ops.filter((o) => OPS[o]);
  const ops = usable.length ? usable : (['+'] as OpKey[]);
  const pics = picPool(s);
  const hasImages = pics.length > 0;
  const tasks: MathTask[] = [];
  const seen = new Set<string>();
  /* 2+1 and 1+2 are different exercises; the same task twice is not */
  const keyOf = (t: MathTask) => [t.op, t.a, t.b, t.hide || 'r', t.picture ? 'p' : 'n'].join('|');
  let stale = 0;

  for (let i = 0; i < s.count; i++) {
    let picture = s.mode === 'pictures' || (s.mode === 'mixed' && i % 2 === 1);
    if (picture && !hasImages) picture = false;
    let pool = picture ? ops.filter((o) => OPS[o].pictures) : ops;
    if (!pool.length) pool = picture ? ['+'] : ops;
    /* keep drawing until this task is one we haven't used yet */
    let task: MathTask | null = null;
    for (let attempt = 0; attempt < 80; attempt++) {
      const candidate = makeTask(s, pool[rnd(0, pool.length - 1)], picture);
      if (!seen.has(keyOf(candidate))) {
        task = candidate;
        break;
      }
    }
    if (!task) {
      if (++stale > 2) break; /* the rules can't fill this many */
      continue;
    }
    stale = 0;
    seen.add(keyOf(task));
    if (task.picture) task.pic = pics[rnd(0, pics.length - 1)];
    tasks.push(task);
  }
  /* mixed sheets read better when the two kinds are dealt out at random */
  for (let i = tasks.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
  }
  return tasks;
}

/* counters shrink with both the count and how many tasks share the row */
export function counterSizeMm(s: MathSheet, t: MathTask): number {
  const most = Math.max(t.a, t.b);
  const base = s.cols === 1 ? 11 : s.cols === 2 ? 8 : 6;
  return most > 9 ? base - 3 : most > 6 ? base - 2 : most > 3 ? base - 1 : base;
}
