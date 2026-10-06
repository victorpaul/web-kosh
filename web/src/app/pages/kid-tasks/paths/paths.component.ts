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
import { ToggleGroupComponent, ToggleOption } from '../components/toggle-group/toggle-group.component';
import { SheetActionsComponent } from '../components/sheet-actions/sheet-actions.component';
import { pick } from '../kit/random';
import {
  DEFAULT_OBSTACLES, DEFAULT_STEPS, DIRS, Dir, MAX_OBSTACLES, MAX_STEPS, MIN_STEPS, PAIRS, PAIR_KEYS, PathPuzzle, goalOffset,
  makePuzzle, placeObstacles,
} from './paths.model';

const KEY = 'worksheet-press-paths-v1';
const MAX_SHEETS = 4;

interface PathsSheet {
  name: string;
  /* how many arrows to follow: the only difficulty setting */
  steps: number;
  /* pictures in squares the path never touches: fun to look at, and a miscount bumps into one */
  obstacles: number;
  count: number;
  pairs: string[];
  done: boolean;
  puzzles: PathPuzzle[];
}

/* "Follow the arrows": a list of steps (3 →, 4 ↓ …) and a grid to draw the path on, one puzzle per page */
@Component({
  selector: 'app-paths',
  standalone: true,
  imports: [TranslatePipe, WorksheetLayoutComponent, SavedListComponent, PageSheetComponent, NumberStepperComponent, RailGroupComponent, CheckOptionComponent, ToggleGroupComponent, SheetActionsComponent],
  templateUrl: './paths.component.html',
  styleUrl: './paths.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathsComponent {
  private readonly i18n = inject(I18nService);

  readonly store = new WorksheetStore<PathsSheet>(KEY);
  state: PathsSheet = this.hydrate(this.store.load({}));

  readonly pairOptions: ToggleOption[] = PAIR_KEYS.map((k) => ({ value: k, label: `${PAIRS[k][0]} → ${PAIRS[k][1]}` }));
  readonly pairs = PAIRS;
  readonly minSteps = MIN_STEPS;
  readonly maxSteps = MAX_STEPS;
  readonly maxObstacles = MAX_OBSTACLES;
  readonly nameOf = (s: PathsSheet) => s.name;

  constructor() {
    this.syncPuzzles();
  }

  /* ---------- drawing helpers ---------- */
  /* a margin of one square around the grid holds the pictures */
  viewBox(p: PathPuzzle): string {
    return `-1.3 -1.3 ${p.size + 2.6} ${p.size + 2.6}`;
  }
  /* the grid is square and gets the width an A4 page leaves after the step list (210 − 24 margin − 30 list) */
  sizeMm(): number {
    return 150;
  }
  lines(p: PathPuzzle): number[] {
    return Array.from({ length: p.size + 1 }, (_, i) => i);
  }
  rotate(dir: Dir): string {
    return `rotate(${DIRS[dir].rotate})`;
  }
  goalAt(p: PathPuzzle): { x: number; y: number } {
    const o = goalOffset(p);
    return { x: p.end.x + o.x, y: p.end.y + o.y };
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
  setCount(count: number): void {
    this.state.count = count;
    this.syncPuzzles();
  }
  setPairs(pairs: string[]): void {
    this.state.pairs = pairs;
    this.regenerate();
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
    const keep = s.puzzles.filter((p) => p.steps.length === s.steps && s.pairs.includes(p.pair)).slice(0, s.count);
    while (keep.length < s.count) keep.push(makePuzzle(s.steps, pick(s.pairs)));
    /* a new obstacle count re-places the obstacles but keeps each path */
    for (const p of keep) {
      if (p.obstacles?.length !== s.obstacles) p.obstacles = placeObstacles(p, s.obstacles);
    }
    s.puzzles = keep;
    this.persist();
  }
  private hydrate(raw: Partial<PathsSheet>): PathsSheet {
    const s: PathsSheet = {
      name: this.i18n.t('a.defaultTitle'),
      steps: DEFAULT_STEPS,
      obstacles: DEFAULT_OBSTACLES,
      count: 1,
      pairs: ['dino', 'dog', 'bunny', 'bee'],
      done: true,
      puzzles: [],
      ...raw,
    };
    s.pairs = s.pairs.filter((k) => PAIRS[k]);
    if (!s.pairs.length) s.pairs = ['dino'];
    return s;
  }
  private persist(): void {
    this.store.save(this.state);
  }
}
