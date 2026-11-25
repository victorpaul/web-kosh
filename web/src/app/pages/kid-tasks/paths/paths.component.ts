import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { WorksheetLayoutComponent } from '../components/worksheet-layout/worksheet-layout.component';
import { SavedListComponent } from '../components/saved-list/saved-list.component';
import { WorksheetStore } from '../kit/worksheet-store';
import { NumberStepperComponent } from '../components/number-stepper/number-stepper.component';
import { PageSheetComponent } from '../components/page-sheet/page-sheet.component';
import { RailGroupComponent } from '../components/rail-group/rail-group.component';
import { CheckOptionComponent } from '../components/check-option/check-option.component';
import { SheetActionsComponent } from '../components/sheet-actions/sheet-actions.component';
import {
  DEFAULT_ENEMIES, DEFAULT_ITEMS, DEFAULT_OBSTACLES, DEFAULT_STEPS, DIRS, Dir, ITEM_KINDS, ItemKind, MAX_ENEMIES, MAX_ITEMS, MAX_OBSTACLES, MAX_STEPS, MIN_STEPS,
  PathPuzzle, makePuzzle, placeItems, placeObstacles, roomForItems,
} from './paths.model';
import { GOAL_SRC, GRASS_SRC, HERO_SRC, ITEM_SIZE, ITEM_SRC, Scene, enemyFor, sceneFor, stoneFor } from './paths.scenery';

/* one row of the "found" list under the field: the item's picture and a box per item to tick */
interface FoundRow {
  kind: ItemKind;
  boxes: number[];
}

const KEY = 'worksheet-press-paths-v1';
const MAX_SHEETS = 4;

interface PathsSheet {
  name: string;
  /* how many arrows to follow: the only difficulty setting */
  steps: number;
  /* pictures in squares the path never touches: fun to look at, and a miscount bumps into one */
  obstacles: number;
  /* enemies: placed like the stones, in squares the path never touches */
  enemies: number;
  /* coins and meat lying on the right path, ticked off under the field */
  items: number;
  count: number;
  done: boolean;
  puzzles: PathPuzzle[];
}

/* "Follow the arrows": a list of steps (3 →, 4 ↓ …) and a grid to draw the path on, one puzzle per page */
@Component({
  selector: 'app-paths',
  standalone: true,
  imports: [TranslatePipe, WorksheetLayoutComponent, SavedListComponent, PageSheetComponent, NumberStepperComponent, RailGroupComponent, CheckOptionComponent, SheetActionsComponent],
  templateUrl: './paths.component.html',
  styleUrl: './paths.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathsComponent {
  private readonly i18n = inject(I18nService);

  readonly store = new WorksheetStore<PathsSheet>(KEY);
  state: PathsSheet = this.hydrate(this.store.load({}));

  readonly minSteps = MIN_STEPS;
  readonly maxSteps = MAX_STEPS;
  readonly maxObstacles = MAX_OBSTACLES;
  readonly maxEnemies = MAX_ENEMIES;
  readonly maxItems = MAX_ITEMS;
  readonly itemSrc = ITEM_SRC;
  readonly itemSize = ITEM_SIZE;
  readonly nameOf = (s: PathsSheet) => s.name;
  readonly grassSrc = GRASS_SRC;
  readonly heroSrc = HERO_SRC;
  readonly goalSrc = GOAL_SRC;
  readonly stoneFor = stoneFor;
  readonly enemyFor = enemyFor;
  /* a puzzle object never changes once made, so its scene is worked out once */
  private readonly scenes = new WeakMap<PathPuzzle, Scene>();

  constructor() {
    this.syncPuzzles();
  }

  /* ---------- drawing helpers ---------- */
  /* the second instruction line: what the stones and the items on this page mean */
  note(p: PathPuzzle): string {
    const lines = [];
    if (p.obstacles?.length || p.enemies?.length) lines.push(this.i18n.t('a.howObstacles'));
    if (p.items?.length) lines.push(this.i18n.t('a.howItems'));
    return lines.join(' ');
  }
  foundRows(p: PathPuzzle): FoundRow[] {
    return ITEM_KINDS.map((kind) => ({ kind, boxes: (p.items ?? []).filter((item) => item.kind === kind).map((_, i) => i) })).filter(
      (row) => row.boxes.length,
    );
  }
  sceneOf(p: PathPuzzle): Scene {
    let scene = this.scenes.get(p);
    if (!scene) {
      scene = sceneFor(p);
      this.scenes.set(p, scene);
    }
    return scene;
  }
  /* the grid is square and gets the width an A4 page leaves after the step list (210 − 24 margin − 30 list) */
  sizeMm(): number {
    return 150;
  }
  /* 0…size: the row and column numbers of the dots */
  dotIndexes(p: PathPuzzle): number[] {
    return Array.from({ length: p.size + 1 }, (_, i) => i);
  }
  rotate(dir: Dir): string {
    return `rotate(${DIRS[dir].rotate})`;
  }

  /* ---------- actions ---------- */
  setSteps(steps: number): void {
    this.state.steps = steps;
    this.syncPuzzles();
  }
  setObstacles(obstacles: number): void {
    this.state.obstacles = obstacles;
    this.syncPuzzles();
  }
  setEnemies(enemies: number): void {
    this.state.enemies = enemies;
    this.syncPuzzles();
  }
  setItems(items: number): void {
    this.state.items = items;
    this.syncPuzzles();
  }
  setCount(count: number): void {
    this.state.count = count;
    this.syncPuzzles();
  }
  setDone(on: boolean): void {
    this.state.done = on;
    this.persist();
  }
  setName(name: string): void {
    this.state.name = name;
    this.persist();
  }
  regenerate(): void {
    this.state.puzzles = [];
    this.syncPuzzles();
  }
  save(): void {
    this.store.remember(this.state, this.nameOf);
  }
  open(entry: PathsSheet): void {
    this.state = this.hydrate(entry);
    this.syncPuzzles();
  }

  /* keeps the puzzles that still fit the settings, makes the missing ones */
  private syncPuzzles(): void {
    const s = this.state;
    const keep = s.puzzles.filter((p) => p.steps.length === s.steps).slice(0, s.count);
    while (keep.length < s.count) keep.push(makePuzzle(s.steps));
    /* a new obstacle count re-places the obstacles but keeps each path */
    for (const p of keep) {
      if (p.obstacles?.length !== s.obstacles) p.obstacles = placeObstacles(p, s.obstacles, p.enemies);
      if (p.enemies?.length !== s.enemies) p.enemies = placeObstacles(p, s.enemies, p.obstacles);
      if (p.items?.length !== Math.min(s.items, roomForItems(p))) p.items = placeItems(p, s.items);
    }
    s.puzzles = keep;
    this.persist();
  }
  private hydrate(raw: Partial<PathsSheet>): PathsSheet {
    const s: PathsSheet = {
      name: this.i18n.t('a.defaultTitle'),
      steps: DEFAULT_STEPS,
      obstacles: DEFAULT_OBSTACLES,
      enemies: DEFAULT_ENEMIES,
      items: DEFAULT_ITEMS,
      count: 1,
      done: true,
      puzzles: [],
      ...raw,
    };
    return s;
  }
  private persist(): void {
    this.store.save(this.state);
  }
}
