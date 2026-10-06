import { pick, rnd, shuffle } from '../kit/random';
import { COLORS, ColorKey, SHAPE_KEYS, ShapeKey } from '../components/shape/shape.component';

export const DEFAULT_COLORS: ColorKey[] = ['red', 'yellow', 'green', 'blue'];
export const MIN_COLORS = 3;
export const COLOR_KEYS = Object.keys(COLORS) as ColorKey[];

export const TASKS = ['match', 'words', 'find', 'colorin', 'sudoku', 'stroop'] as const;
export type TaskKey = (typeof TASKS)[number];

export interface MatchItem {
  c: ColorKey;
  s?: ShapeKey;
}
export interface MatchBlock {
  left: MatchItem[];
  right: MatchItem[];
}
export interface MatchData {
  level: number;
  blocks: MatchBlock[];
}
export interface FindRow {
  c: ColorKey;
  s: ShapeKey;
  items: { c: ColorKey; s: ShapeKey }[];
  answer: number;
}
export interface FindData {
  level: number;
  rows: FindRow[];
}
export interface ColorinData {
  level: number;
  cols: number;
  rules: { s: ShapeKey; c: ColorKey }[];
  cells: ShapeKey[];
}
export interface SudokuPuzzle {
  solution: number[];
  /* -1 marks a blank cell to colour in */
  grid: number[];
}
export interface SudokuData {
  level: number;
  colors: ColorKey[];
  boxes: boolean;
  puzzles: SudokuPuzzle[];
}
export interface StroopRow {
  ink: ColorKey;
  word: ColorKey;
  options: ColorKey[];
}
export interface StroopData {
  level: number;
  rows: StroopRow[];
}

export interface PageMap {
  match: MatchData;
  words: MatchData;
  find: FindData;
  colorin: ColorinData;
  sudoku: SudokuData;
  stroop: StroopData;
}

export interface ColorsSheet {
  name: string;
  tasks: Record<TaskKey, { on: boolean; level: number }>;
  colors: ColorKey[];
  example: boolean;
  done: boolean;
  pages: Partial<PageMap>;
}

export const defaultTasks = (): ColorsSheet['tasks'] => ({
  match: { on: true, level: 1 },
  words: { on: true, level: 1 },
  find: { on: true, level: 1 },
  colorin: { on: false, level: 1 },
  sudoku: { on: false, level: 1 },
  stroop: { on: false, level: 1 },
});

/* a shuffle that moves at least one thing, so a matching task never lines up straight across */
function derange<T>(list: T[]): T[] {
  if (list.length < 2) return list.slice();
  for (let i = 0; i < 20; i++) {
    const a = shuffle(list);
    if (a.some((x, k) => x !== list[k])) return a;
  }
  return list.slice(1).concat(list[0]);
}

/* ---------- generators: each returns plain data (colour/shape keys, never text) ---------- */
export const GEN: { [K in TaskKey]: (level: number, colors: ColorKey[]) => PageMap[K] } = {
  /* colour ↔ colour, no words: can the child see the difference at all? */
  match(level, colors) {
    const n = Math.min([4, 5, 6][level - 1], colors.length);
    const blocks = n <= 4 ? 3 : 2;
    return {
      level,
      blocks: Array.from({ length: blocks }, () => {
        const cs = shuffle(colors).slice(0, n);
        const [s1, s2] = shuffle(SHAPE_KEYS);
        const left = cs.map((c) => ({ c, s: level === 3 ? pick(SHAPE_KEYS) : s1 }));
        const right = derange(cs).map((c) => ({ c, s: level === 1 ? s1 : level === 2 ? s2 : pick(SHAPE_KEYS) }));
        return { left, right };
      }),
    };
  },

  /* colour word (printed in black) ↔ colour: does the child know the names? */
  words(level, colors) {
    const n = Math.min([3, 5, 6][level - 1], colors.length);
    const blocks = n <= 4 ? 3 : 2;
    return {
      level,
      blocks: Array.from({ length: blocks }, () => {
        const cs = shuffle(colors).slice(0, n);
        const left = cs.map((c) => ({ c }));
        const right = derange(cs).map((c) => ({ c, s: level === 3 ? pick(SHAPE_KEYS) : ('circle' as ShapeKey) }));
        return { left, right };
      }),
    };
  },

  /* "green square" among look-alikes: same shape in another colour, same colour on another shape */
  find(level, colors) {
    const size = [4, 6, 8][level - 1];
    const sameShape = [1, 2, 3][level - 1];
    const sameColour = [0, 1, 2][level - 1];
    const rows: FindRow[] = [];
    for (let r = 0; r < 7; r++) {
      const c = pick(colors);
      const s = pick(SHAPE_KEYS);
      const others = colors.filter((x) => x !== c);
      const otherShapes = SHAPE_KEYS.filter((x) => x !== s);
      const items = [{ c, s }];
      for (let i = 0; i < sameShape; i++) items.push({ c: pick(others), s });
      for (let i = 0; i < sameColour; i++) items.push({ c, s: pick(otherShapes) });
      while (items.length < size) items.push({ c: pick(others), s: pick(otherShapes) });
      const order = shuffle(items);
      rows.push({ c, s, items: order, answer: order.indexOf(items[0]) });
    }
    return { level, rows };
  },

  /* outlines + a shape → colour rule; the child picks the pencil, so no pointing-and-guessing */
  colorin(level, colors) {
    const rules = Math.min([2, 3, 4][level - 1], colors.length);
    const shapes = shuffle(SHAPE_KEYS).slice(0, rules);
    const cs = shuffle(colors).slice(0, rules);
    const [cols, rowsN] = [[4, 3], [5, 4], [6, 5]][level - 1];
    const total = cols * rowsN;
    /* every rule shows up at least twice */
    const cells = shuffle(shapes.concat(shapes, Array.from({ length: total - rules * 2 }, () => pick(shapes))));
    return { level, cols, rules: shapes.map((s, i) => ({ s, c: cs[i] })), cells };
  },

  /* 4×4 latin square of coloured circles; level 3 adds the 2×2 box rule */
  sudoku(level, colors) {
    const pool = shuffle(colors);
    const extra = shuffle(COLOR_KEYS.filter((c) => !pool.includes(c)));
    const cs = pool.concat(extra).slice(0, 4);
    const boxes = level === 3;
    const blanks = [4, 6, 9][level - 1];
    const puzzles = Array.from({ length: 4 }, () => makeSudoku(blanks, boxes, level === 1));
    return { level, colors: cs, boxes, puzzles };
  },

  /* the word says one colour, the ink is another: circle the ink */
  stroop(level, colors) {
    const n = Math.min(level === 3 ? 4 : 3, colors.length);
    const rows: StroopRow[] = [];
    for (let r = 0; r < 9; r++) {
      const ink = pick(colors);
      const same = level === 1 && Math.random() < 0.4;
      const word = same ? ink : pick(colors.filter((c) => c !== ink));
      const opts = new Set([ink, word]);
      shuffle(colors).forEach((c) => {
        if (opts.size < n) opts.add(c);
      });
      rows.push({ ink, word, options: shuffle([...opts]) });
    }
    return { level, rows };
  },
};

/* ---------- sudoku helpers ---------- */
function solvedGrid(): number[] {
  /* a valid 4×4 sudoku; relabel and shuffle rows/columns within bands to vary it */
  let g = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
  const sym = shuffle([0, 1, 2, 3]);
  g = g.map((r) => r.map((v) => sym[v]));
  const order = () => shuffle([[0, 1], [2, 3]]).flatMap((p) => shuffle(p));
  const ro = order();
  const co = order();
  g = ro.map((r) => co.map((c) => g[r][c]));
  if (Math.random() < 0.5) g = g[0].map((_, c) => g.map((r) => r[c]));
  return g.flat();
}

function countSolutions(g: number[], boxes: boolean): number {
  const i = g.indexOf(-1);
  if (i < 0) return 1;
  const r = i >> 2;
  const c = i & 3;
  let n = 0;
  for (let v = 0; v < 4 && n < 2; v++) {
    let ok = true;
    for (let k = 0; k < 4 && ok; k++) {
      if (g[r * 4 + k] === v || g[k * 4 + c] === v) ok = false;
    }
    if (ok && boxes) {
      const br = r - (r % 2);
      const bc = c - (c % 2);
      for (let dr = 0; dr < 2; dr++) for (let dc = 0; dc < 2; dc++) if (g[(br + dr) * 4 + bc + dc] === v) ok = false;
    }
    if (!ok) continue;
    g[i] = v;
    n += countSolutions(g, boxes);
    g[i] = -1;
  }
  return n;
}

/* blank cells one by one, keeping exactly one solution */
function makeSudoku(blanks: number, boxes: boolean, onePerRow: boolean): SudokuPuzzle {
  for (let attempt = 0; attempt < 50; attempt++) {
    const solution = solvedGrid();
    const grid = solution.slice();
    if (onePerRow) {
      for (let r = 0; r < 4; r++) grid[r * 4 + rnd(0, 3)] = -1;
      return { solution, grid };
    }
    let removed = 0;
    for (const i of shuffle([...Array(16).keys()])) {
      if (removed === blanks) break;
      const keep = grid[i];
      grid[i] = -1;
      if (countSolutions(grid.slice(), boxes) === 1) removed++;
      else grid[i] = keep;
    }
    if (removed === blanks) return { solution, grid };
  }
  const solution = solvedGrid();
  return { solution, grid: solution.map((v, i) => (i % 5 === 0 ? -1 : v)) };
}
