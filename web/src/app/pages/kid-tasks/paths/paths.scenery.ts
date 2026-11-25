import type { ItemKind, PathPuzzle, Point } from './paths.model';

/* The look of an arrow-path sheet: a grass field with a forest around it and stones as obstacles, drawn
   with sprites from the Tiny Swords pack. Pure layout in grid squares; the path lives on (0,0)…(size,size). */

const ART = '/img/kid-tasks/paths';
export const GRASS_SRC = `${ART}/grass.png`;
/* the knight walks the path to his castle */
export const HERO_SRC = `${ART}/knight.png`;
export const GOAL_SRC = `${ART}/castle.png`;
export const ITEM_SRC: Record<ItemKind, string> = { coin: `${ART}/coin.png`, meat: `${ART}/meat.png` };
/* an item sits centred on its grid point and covers the dot there */
export const ITEM_SIZE = 0.8;
const HERO_SIZE = 1.1;
const GRASS_TILE_PX = 64;

/* the knight sits this far outside the border, on the grass */
const HERO_GAP = 0.6;

/* the castle: 312 × 208 px, wide enough to be the big moment of the sheet but still inside the drawing
   when it stands right of the field; it keeps this gap from the end dot's centre so the dot stays clear */
const CASTLE_WIDTH = 2.35;
const CASTLE_HEIGHT = (CASTLE_WIDTH * 208) / 312;
const CASTLE_GAP = 0.25;

/* a picture's box, top-left corner first */
export interface Picture {
  x: number;
  y: number;
  width: number;
  height: number;
}

function pictureAt(centre: Point, size: number): Picture {
  return { x: centre.x - size / 2, y: centre.y - size / 2, width: size, height: size };
}

function heroCentre(p: PathPuzzle): Point {
  return { x: p.start.x - HERO_GAP, y: p.start.y };
}

/* just outside the border the path ends on */
function castleAt(p: PathPuzzle): Picture {
  const box = { width: CASTLE_WIDTH, height: CASTLE_HEIGHT };
  if (p.end.y === 0) return { ...box, x: p.end.x - CASTLE_WIDTH / 2, y: -CASTLE_GAP - CASTLE_HEIGHT };
  if (p.end.y === p.size) return { ...box, x: p.end.x - CASTLE_WIDTH / 2, y: p.size + CASTLE_GAP };
  return { ...box, x: p.size + CASTLE_GAP, y: p.end.y - CASTLE_HEIGHT / 2 };
}

/* the field reaches one square past the grid, so border dots and the pictures next to them stand on grass */
function viewBoxFor(size: number): string {
  return `-2.6 -2.75 ${size + 5.2} ${size + 5.2}`;
}

/* one square of grass: `viewBox` picks the corner, edge or middle tile of the 3×3 tiles in grass.png */
export interface GrassTile {
  x: number;
  y: number;
  viewBox: string;
}

function grassTiles(size: number): GrassTile[] {
  const part = (i: number) => (i === -1 ? 0 : i === size ? 2 : 1);
  const tiles: GrassTile[] = [];
  for (let y = -1; y <= size; y++) {
    for (let x = -1; x <= size; x++) {
      tiles.push({ x, y, viewBox: `${part(x) * GRASS_TILE_PX} ${part(y) * GRASS_TILE_PX} ${GRASS_TILE_PX} ${GRASS_TILE_PX}` });
    }
  }
  return tiles;
}

interface TreeSprite {
  src: string;
  width: number;
  height: number;
}
/* drawn at 128 px per square, so the trees keep their sizes relative to each other */
const TREE_PX = 128;
const sprite = (name: string, widthPx: number, heightPx: number): TreeSprite => ({
  src: `${ART}/${name}.png`,
  width: widthPx / TREE_PX,
  height: heightPx / TREE_PX,
});
const ALL_TREES = [sprite('tree1', 119, 190), sprite('tree3', 90, 146), sprite('tree2', 106, 244), sprite('tree4', 80, 122)];
/* below the field only the short trees fit, or their crowns would cover the bottom row of dots */
const SHORT_TREES = [ALL_TREES[1], ALL_TREES[3]];

/* a tree's box, top-left corner first */
export interface Tree extends TreeSprite {
  x: number;
  y: number;
}

/* A ring of trees around the field, the same every time for one grid size, with a clearing wherever a
   tree would hide the start or goal picture. Sorted top to bottom, so nearer trees overlap farther ones. */
function forestAround(size: number, pictures: Picture[]): Tree[] {
  const trees = [
    ...rowOfTrees(-2, size + 2, -0.75, ALL_TREES),
    ...rowOfTrees(-2, size + 2, size + 1.95, SHORT_TREES),
    ...columnOfTrees(-1.55, size),
    ...columnOfTrees(size + 1.55, size),
  ];
  return trees.filter((tree) => !pictures.some((picture) => covers(tree, picture))).sort((a, b) => a.y + a.height - (b.y + b.height));
}

function rowOfTrees(fromX: number, toX: number, footY: number, sprites: TreeSprite[]): Tree[] {
  const trees: Tree[] = [];
  for (let i = 0, x = fromX; x <= toX; i++, x += 0.75) trees.push(plant(sprites[i % sprites.length], x, footY + wobble(i)));
  return trees;
}

function columnOfTrees(footX: number, size: number): Tree[] {
  const trees: Tree[] = [];
  for (let i = 0, y = 0.6; y <= size + 1.2; i++, y += 1.1) trees.push(plant(ALL_TREES[(i * 3 + 1) % ALL_TREES.length], footX, y));
  return trees;
}

/* a small fixed up-and-down shift, so a row of trees doesn't look ruled */
function wobble(i: number): number {
  return (((i * 37) % 7) - 3) * 0.05;
}

function plant(tree: TreeSprite, footX: number, footY: number): Tree {
  return { ...tree, x: footX - tree.width / 2, y: footY - tree.height };
}

function covers(tree: Tree, picture: Picture): boolean {
  return (
    tree.x < picture.x + picture.width &&
    tree.x + tree.width > picture.x &&
    tree.y < picture.y + picture.height &&
    tree.y + tree.height > picture.y
  );
}

const STONES = [1, 2, 3, 4].map((n) => `${ART}/rock${n}.png`);
const ENEMIES = ['torch-goblin', 'gnoll', 'snake', 'spider', 'bear', 'gnome', 'skull'].map((name) => `${ART}/enemy-${name}.png`);

/* the stone in an obstacle square, picked by its position so it stays the same on every redraw */
export function stoneFor(square: Point): string {
  return STONES[(square.x * 3 + square.y * 5) % STONES.length];
}

/* everything drawn around the path of one puzzle */
export interface Scene {
  viewBox: string;
  grass: GrassTile[];
  trees: Tree[];
  hero: Picture;
  goal: Picture;
}

export function sceneFor(p: PathPuzzle): Scene {
  const hero = pictureAt(heroCentre(p), HERO_SIZE);
  const goal = castleAt(p);
  return { viewBox: viewBoxFor(p.size), grass: grassTiles(p.size), trees: forestAround(p.size, [hero, goal]), hero, goal };
}

/* the enemy in a square, picked by its position like the stones */
export function enemyFor(square: Point): string {
  return ENEMIES[(square.x * 5 + square.y * 3) % ENEMIES.length];
}
