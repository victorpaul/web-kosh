import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { WorksheetLayoutComponent } from '../components/worksheet-layout/worksheet-layout.component';
import { SavedListComponent } from '../components/saved-list/saved-list.component';
import { TogglePillDirective } from '../components/toggle-pill.directive';
import { WorksheetStore } from '../kit/worksheet-store';
import { chooseFiles, clampField, downscaleImage, readAsDataUrl } from '../kit/files';
import {
  MODE_KEYS, MathSheet, MathTask, Mode, OPS, OP_KEYS, OpKey, PRESET_SETS, SET_KEYS, activeSets, counterSizeMm,
  generateTasks, maxPics, normPic, picPool,
} from './math.model';

const KEY = 'worksheet-press-math-v1';

@Component({
  selector: 'app-math',
  standalone: true,
  imports: [NgTemplateOutlet, TranslatePipe, WorksheetLayoutComponent, SavedListComponent, TogglePillDirective],
  templateUrl: './math.component.html',
  styleUrl: './math.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MathComponent {
  private readonly i18n = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly store = new WorksheetStore<MathSheet>(KEY);
  state: MathSheet = { ...this.defaults(), ...this.store.load({}) };

  readonly ops = OPS;
  readonly opKeys = OP_KEYS;
  readonly modeKeys = MODE_KEYS;
  readonly setKeys = SET_KEYS;
  readonly presetSets = PRESET_SETS;
  readonly normPic = normPic;
  readonly nameOf = (s: MathSheet) => s.title;

  constructor() {
    if (!this.state.tasks.length) this.generate();
  }

  /* ---------- derived view data ---------- */
  activeSets(): string[] {
    return activeSets(this.state);
  }
  builtinPics(): string[] {
    return this.activeSets().flatMap((k) => PRESET_SETS[k] || []);
  }
  rangeNote(): string {
    const cap = maxPics(this.state);
    const reach = cap * 2;
    return this.state.mode !== 'numbers' && this.state.max > reach
      ? this.i18n.t('m.rangeCapped', { max: this.state.max, reach, cap, cols: this.state.cols })
      : this.i18n.t('m.rangeNote');
  }
  missingTasks(): number {
    return this.state.count - this.state.tasks.length;
  }
  needsPictures(): boolean {
    return this.state.mode !== 'numbers' && !picPool(this.state).length;
  }
  hasCompare(): boolean {
    return this.state.tasks.some((t) => t.op === '?');
  }
  /* the instruction with the three signs pulled out, so they can be printed bold in the kid font */
  compareHowParts(): { text: string; sign: boolean }[] {
    const marked = this.i18n.t('m.compareHow', { lt: '\u0001<\u0001', gt: '\u0001>\u0001', eq: '\u0001=\u0001' });
    return marked.split('\u0001').map((text, i) => ({ text, sign: i % 2 === 1 }));
  }
  counterSize(t: MathTask): string {
    return `${counterSizeMm(this.state, t)}mm`;
  }
  counters(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
  /* faint dashed rules between tasks: right of every task except at a row end, below every row but the last */
  hasDivider(i: number): boolean {
    const { cols } = this.state;
    return cols > 1 && (i + 1) % cols !== 0 && i !== this.state.tasks.length - 1;
  }
  hasRowLine(i: number): boolean {
    const { cols } = this.state;
    return Math.floor(i / cols) < Math.floor((this.state.tasks.length - 1) / cols);
  }

  /* ---------- actions ---------- */
  generate(): void {
    this.state.tasks = generateTasks(this.state);
    this.persist();
  }
  toggleOp(op: OpKey): void {
    const { ops } = this.state;
    this.state.ops = ops.includes(op) ? ops.filter((o) => o !== op) : ops.concat(op);
    if (!this.state.ops.length) this.state.ops = [op];
    this.generate();
  }
  setMode(mode: Mode): void {
    this.state.mode = mode;
    this.generate();
  }
  setMissing(on: boolean): void {
    this.state.missing = on;
    this.generate();
  }
  setNumber(key: 'min' | 'max' | 'count' | 'cols', field: HTMLInputElement, lo: number, hi: number): void {
    this.state[key] = clampField(field, lo, hi);
    this.generate();
  }
  toggleSet(key: string): void {
    const on = this.activeSets();
    this.state.sets = on.includes(key) ? on.filter((x) => x !== key) : on.concat(key);
    this.state.preset = true;
    this.generate();
  }
  removeImage(index: number): void {
    this.state.images.splice(index, 1);
    this.generate();
  }
  async addImages(): Promise<void> {
    const files = await chooseFiles({ accept: 'image/*', multiple: true });
    if (!files.length) return;
    for (const file of files) {
      /* downscaled so storage survives */
      const small = await downscaleImage(await readAsDataUrl(file), 128);
      if (small) this.state.images.push({ type: 'img', v: small });
    }
    this.generate();
    this.cdr.markForCheck();
  }
  setTitle(title: string): void {
    this.state.title = title;
    this.persist();
  }
  print(): void {
    window.print();
  }
  save(): void {
    if (!this.store.remember(this.state, this.nameOf)) alert(this.i18n.t('m.storageTooBig'));
  }
  open(entry: MathSheet): void {
    this.state = { ...this.defaults(), ...entry };
    this.persist();
  }

  private defaults(): MathSheet {
    return {
      title: this.i18n.t('m.defaultTitle'),
      ops: ['+'],
      mode: 'numbers',
      min: 2,
      max: 10,
      count: 12,
      cols: 2,
      missing: false,
      preset: true,
      sets: ['fruit', 'dinos', 'animals'],
      images: [],
      tasks: [],
    };
  }
  /* uploaded pictures can outgrow browser storage, so say so instead of failing quietly */
  private persist(): void {
    if (!this.store.save(this.state)) alert(this.i18n.t('m.storageTooBig'));
  }
}
