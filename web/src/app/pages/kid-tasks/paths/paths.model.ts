import { pick, rnd, shuffle } from '../kit/random';

export type Dir = 'R' | 'D' | 'U' | 'L';

export const DIRS: Record<Dir, { dx: number; dy: number; rotate: number }> = {
  R: { dx: 1, dy: 0, rotate: 0 },
  D: { dx: 0, dy: 1, rotate: 90 },
  L: { dx: -1, dy: 0, rotate: 180 },
  U: { dx: 0, dy: -1, rotate: 270 },
};
const OPPOSITE: Record<Dir, Dir> = { R: 'L', L: 'R', U: 'D', D: 'U' };

export interface Point {
  x: number;
  y: number;
}
export interface Step {
  dir: Dir;
  len: number;
}
/* a picture sitting in the square whose top-left corner is (x, y) */
export interface Obstacle {
  x: number;
  y: number;
  pic: string;
}

/* One puzzle = one printed page. The path lives on the grid's corner points: (0,0)…(size,size). */
export interface PathPuzzle {
  size: number;
  start: Point;
  steps: Step[];
  end: Point;
  pair: string;
  obstacles?: Obstacle[];
}

/* difficulty is just the number of steps; the grid and the longest step grow with it */
export const MIN_STEPS = 3;
export const MAX_STEPS = 14;
export const DEFAULT_STEPS = 6;
const ALL_DIRS: Dir[] = ['R', 'D', 'U', 'L'];

export function gridFor(steps: number): { size: number; maxLen: number } {
  if (steps <= 5) return { size: 9, maxLen: 4 };
  if (steps <= 9) return { size: 11, maxLen: 5 };
  return { size: 13, maxLen: 6 };
}

/* who walks (start) and where to (goal) */
export const PAIRS: Record<string, [string, string]> = {
  dino: ['🦕', '🥚'],
  dog: ['🐶', '🦴'],
  bunny: ['🐰', '🥕'],
  bee: ['🐝', '🌻'],
  mouse: ['🐭', '🧀'],
  car: ['🚗', '🏠'],
  rocket: ['🚀', '🪐'],
  boat: ['⛵', '🏝️'],
};
export const PAIR_KEYS = Object.keys(PAIRS);

/* what stands in the way, themed to match each pair */
export const OBSTACLES: Record<string, string[]> = {
  dino: ['🌋', '🪨', '🌴'],
  dog: ['🐈', '🌳', '🛁'],
  bunny: ['🦊', '🌳', '🪨'],
  bee: ['🕸️', '🌧️', '🌵'],
  mouse: ['🐈', '🪤', '🧹'],
  car: ['🚧', '🌳', '🚦'],
  rocket: ['☄️', '🌑', '🛸'],
  boat: ['🦈', '🪨', '🐙'],
};
export const MAX_OBSTACLES = 12;
export const DEFAULT_OBSTACLES = 4;

const key = (p: Point) => `${p.x},${p.y}`;
const onBorder = (p: Point, size: number) => p.x === 0 || p.y === 0 || p.x === size || p.y === size;

/* Builds a path that (1) starts on the left edge, (2) never touches a point twice, so the drawn path
   is unambiguous, (3) never repeats or reverses the previous direction, and (4) ends on the top,
   right or bottom border, where the goal picture can sit outside the grid. */
export function makePuzzle(count: number, pair: string): PathPuzzle {
  const { size, maxLen } = gridFor(count);

  for (let attempt = 0; attempt < 5000; attempt++) {
    const start = { x: 0, y: rnd(1, size - 1) };
    const visited = new Set([key(start)]);
    const steps: Step[] = [];
    let at = start;
    let prev: Dir | null = null;

    for (let i = 0; i < count; i++) {
      const last = i === count - 1;
      const options: Step[] = [];
      /* the first step leaves the left edge, so the start dot is clearly the beginning */
      const dirs = i === 0 ? (['R'] as Dir[]) : ALL_DIRS.filter((d) => d !== prev && d !== OPPOSITE[prev!]);
      for (const dir of dirs) {
        const { dx, dy } = DIRS[dir];
        for (let len = 1; len <= maxLen; len++) {
          const p = { x: at.x + dx * len, y: at.y + dy * len };
          if (p.x < 0 || p.y < 0 || p.x > size || p.y > size || visited.has(key(p))) break;
          if (last && !(onBorder(p, size) && p.x !== 0)) continue;
          options.push({ dir, len });
        }
      }
      if (!options.length) break;
      /* longer steps read better than a run of 1s */
      const step = pick(shuffle(options).sort((a, b) => b.len - a.len).slice(0, Math.max(2, Math.ceil(options.length / 2))));
      const { dx, dy } = DIRS[step.dir];
      for (let k = 1; k <= step.len; k++) visited.add(key({ x: at.x + dx * k, y: at.y + dy * k }));
      at = { x: at.x + dx * step.len, y: at.y + dy * step.len };
      steps.push(step);
      prev = step.dir;
    }
    if (steps.length === count) return { size, start, steps, end: at, pair };
  }
  throw new Error(`no arrow path found with ${count} steps`);
}

/* where the goal picture goes: just outside the border the path ends on */
export function goalOffset(p: PathPuzzle): Point {
  if (p.end.y === 0) return { x: 0, y: -0.8 };
  if (p.end.y === p.size) return { x: 0, y: 0.8 };
  return { x: 0.8, y: 0 };
}

/* every grid corner the path runs through, start and end included */
function pathCorners(p: PathPuzzle): Set<string> {
  const corners = new Set([key(p.start)]);
  let at = p.start;
  for (const { dir, len } of p.steps) {
    for (let k = 0; k < len; k++) {
      at = { x: at.x + DIRS[dir].dx, y: at.y + DIRS[dir].dy };
      corners.add(key(at));
    }
  }
  return corners;
}

/* Puts obstacles only in squares that share not even a corner with the path, so the right path never
   touches one and a miscount bumps into it. Most go right next to the path, where a wrong count lands. */
export function placeObstacles(p: PathPuzzle, count: number): Obstacle[] {
  const corners = pathCorners(p);
  const near: Point[] = [];
  const far: Point[] = [];
  for (let x = 0; x < p.size; x++) {
    for (let y = 0; y < p.size; y++) {
      const own = [key({ x, y }), key({ x: x + 1, y }), key({ x, y: y + 1 }), key({ x: x + 1, y: y + 1 })];
      if (own.some((c) => corners.has(c))) continue;
      /* "near": a corner of this square is one step away from the path */
      const close = [x - 1, x, x + 1, x + 2].some((cx) => [y - 1, y, y + 1, y + 2].some((cy) => corners.has(key({ x: cx, y: cy }))));
      (close ? near : far).push({ x, y });
    }
  }
  /* about three in four next to the path; if one kind runs out, the other fills in */
  const nearShuffled = shuffle(near);
  const nearCount = Math.min(nearShuffled.length, Math.round(count * 0.75));
  const cells = nearShuffled.slice(0, nearCount).concat(shuffle(far), nearShuffled.slice(nearCount)).slice(0, count);
  const pics = OBSTACLES[p.pair] ?? OBSTACLES['dino'];
  return cells.map((c) => ({ ...c, pic: pick(pics) }));
}
