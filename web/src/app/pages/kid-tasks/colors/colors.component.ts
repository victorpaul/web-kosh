import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { WorksheetLayoutComponent } from '../components/worksheet-layout/worksheet-layout.component';
import { SavedListComponent } from '../components/saved-list/saved-list.component';
import { TaskRowComponent } from '../components/task-row/task-row.component';
import { MatchBlockComponent } from '../components/match-block/match-block.component';
import { TogglePillDirective } from '../components/toggle-pill.directive';
import { COLORS, ColorKey, SHAPES, ShapeComponent, ShapeKey } from '../components/shape/shape.component';
import { WorksheetStore } from '../kit/worksheet-store';
import {
  COLOR_KEYS, ColorinData, ColorsSheet, DEFAULT_COLORS, GEN, MIN_COLORS, MatchBlock, PageMap, TASKS, TaskKey,
  defaultTasks,
} from './colors.model';

const KEY = 'worksheet-press-colors-v1';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [TranslatePipe, MatchBlockComponent, WorksheetLayoutComponent, SavedListComponent, TaskRowComponent, TogglePillDirective, ShapeComponent],
  templateUrl: './colors.component.html',
  styleUrl: './colors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorsComponent {
  private readonly i18n = inject(I18nService);

  readonly store = new WorksheetStore<ColorsSheet>(KEY);
  state: ColorsSheet = this.hydrate(this.store.load({}));

  readonly tasks = TASKS;
  readonly colorKeys = COLOR_KEYS;
  readonly colors = COLORS;
  readonly nameOf = (s: ColorsSheet) => s.name;

  constructor() {
    this.syncPages();
  }

  /* ---------- words ---------- */
  /* the colour word on its own ("зелений"), or agreeing with a shape ("зелена зірка") */
  colorWord(c: ColorKey, shape?: ShapeKey): string {
    const g = shape ? SHAPES[shape].g : 'm';
    const key = `c.col.${c}` + (g !== 'm' ? `.${g}` : '');
    return this.i18n.has(key) ? this.i18n.t(key) : this.i18n.t(`c.col.${c}`);
  }
  phrase(c: ColorKey, s: ShapeKey): string {
    return `${this.colorWord(c, s)} ${this.i18n.t(`c.shape.${s}`)}`;
  }
  howKey(task: TaskKey): string {
    const levelKey = `c.how.${task}.${this.state.pages[task]?.level}`;
    return this.i18n.has(levelKey) ? levelKey : `c.how.${task}`;
  }

  /* ---------- view helpers ---------- */
  activeTasks(): TaskKey[] {
    return TASKS.filter((k) => this.state.tasks[k].on);
  }
  page<K extends TaskKey>(task: K): PageMap[K] {
    return this.state.pages[task]!;
  }
  matchSize(block: MatchBlock): number {
    return block.left.length > 5 ? 13 : 15;
  }
  /* the first block of a page shows the first pair already joined, when examples are on */
  exampleTo(block: MatchBlock, blockIndex: number): number | null {
    if (!this.state.example || blockIndex !== 0) return null;
    return block.right.findIndex((r) => r.c === block.left[0].c);
  }
  colourOf(data: ColorinData, shape: ShapeKey): ColorKey {
    return data.rules.find((r) => r.s === shape)!.c;
  }

  /* ---------- actions ---------- */
  toggleTask(task: TaskKey): void {
    this.state.tasks[task].on = !this.state.tasks[task].on;
    this.syncPages();
  }
  setLevel(task: TaskKey, level: number): void {
    this.state.tasks[task] = { on: true, level };
    delete this.state.pages[task];
    this.syncPages();
  }
  toggleColor(c: ColorKey): void {
    const active = this.state.colors.includes(c);
    if (active && this.state.colors.length <= MIN_COLORS) {
      alert(this.i18n.t('c.minColors', { n: MIN_COLORS }));
      return;
    }
    this.state.colors = active ? this.state.colors.filter((x) => x !== c) : this.state.colors.concat(c);
    this.state.pages = {};
    this.syncPages();
  }
  setExample(on: boolean): void {
    this.state.example = on;
    this.persist();
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
    this.state.pages = {};
    this.syncPages();
  }
  print(): void {
    window.print();
  }
  save(): void {
    this.store.remember(this.state, this.nameOf);
  }
  open(entry: ColorsSheet): void {
    this.state = this.hydrate(entry);
    this.syncPages();
  }

  /* generates any page that is missing or was made at another level, so the rest keep their tasks */
  private syncPages(): void {
    for (const k of this.activeTasks()) {
      const cfg = this.state.tasks[k];
      if (this.state.pages[k]?.level !== cfg.level) this.generate(k, cfg.level);
    }
    this.persist();
  }
  private generate<K extends TaskKey>(task: K, level: number): void {
    this.state.pages[task] = GEN[task](level, this.state.colors);
  }

  /* per-task settings merge one level deep so a new task type shows up in old saved state */
  private hydrate(raw: Partial<ColorsSheet>): ColorsSheet {
    const s: ColorsSheet = {
      name: this.i18n.t('c.defaultTitle'),
      colors: DEFAULT_COLORS.slice(),
      example: true,
      done: true,
      pages: {},
      ...raw,
      tasks: { ...defaultTasks(), ...(raw.tasks || {}) },
    };
    s.colors = (s.colors || []).filter((c) => COLORS[c]);
    if (s.colors.length < MIN_COLORS) s.colors = DEFAULT_COLORS.slice();
    return s;
  }
  private persist(): void {
    this.store.save(this.state);
  }
}
