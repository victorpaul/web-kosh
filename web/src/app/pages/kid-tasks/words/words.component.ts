import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, untracked } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { WorksheetLayoutComponent } from '../components/worksheet-layout/worksheet-layout.component';
import { SavedListComponent } from '../components/saved-list/saved-list.component';
import { MatchBlockComponent } from '../components/match-block/match-block.component';
import { WorksheetStore } from '../kit/worksheet-store';
import { clampField } from '../kit/files';
import { VOCABULARY, VOCABULARY_SETS } from './vocabulary';
import { TogglePillDirective } from '../components/toggle-pill.directive';
import {
  DEFAULT_WORDS, MAX_LENGTH, MAX_WORDS, MIN_LENGTH, MIN_WORDS, WordsPage, candidates, makePage,
} from './words.model';

const KEY = 'worksheet-press-words-v1';
const MAX_SHEETS = 4;
const PICS = new Map(VOCABULARY.map((v) => [v.key, v.pic]));

interface WordsSheet {
  name: string;
  /* words to join on each sheet */
  count: number;
  minLength: number;
  maxLength: number;
  /* picture sets to draw words from (same names as the math picture sets) */
  sets: string[];
  caps: boolean;
  sheets: number;
  done: boolean;
  pages: WordsPage[];
}

/* Word ↔ picture matching: read the word, draw a line to its picture. */
@Component({
  selector: 'app-words',
  standalone: true,
  imports: [TranslatePipe, WorksheetLayoutComponent, SavedListComponent, MatchBlockComponent, TogglePillDirective],
  templateUrl: './words.component.html',
  styleUrl: './words.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordsComponent {
  private readonly i18n = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly store = new WorksheetStore<WordsSheet>(KEY);
  state: WordsSheet = this.hydrate(this.store.load({}));

  readonly limits = { minWords: MIN_WORDS, maxWords: MAX_WORDS, minLength: MIN_LENGTH, maxLength: MAX_LENGTH };
  readonly nameOf = (s: WordsSheet) => s.name;
  readonly sets = VOCABULARY_SETS;
  /* each set's pill shows its first picture */
  readonly setIcon = new Map(VOCABULARY_SETS.map((set) => [set, VOCABULARY.find((v) => v.set === set)!.pic]));

  constructor() {
    /* word lengths depend on the language: after a switch, only pages whose words no longer fit are remade */
    effect(() => {
      this.i18n.lang();
      untracked(() => {
        this.syncPages();
        this.cdr.markForCheck();
      });
    });
  }

  word(key: string): string {
    return this.i18n.t(`v.${key}`);
  }
  pic(key: string): string {
    return PICS.get(key) ?? '';
  }
  /* how many words the current settings can draw from */
  available(): number {
    return this.pool().length;
  }

  /* ---------- actions ---------- */
  setCount(field: HTMLInputElement): void {
    this.state.count = clampField(field, MIN_WORDS, MAX_WORDS, DEFAULT_WORDS);
    this.syncPages();
  }
  setMinLength(field: HTMLInputElement): void {
    this.state.minLength = clampField(field, MIN_LENGTH, MAX_LENGTH);
    if (this.state.maxLength < this.state.minLength) this.state.maxLength = this.state.minLength;
    this.syncPages();
  }
  setMaxLength(field: HTMLInputElement): void {
    this.state.maxLength = clampField(field, MIN_LENGTH, MAX_LENGTH, MAX_LENGTH);
    if (this.state.minLength > this.state.maxLength) this.state.minLength = this.state.maxLength;
    this.syncPages();
  }
  setSheets(field: HTMLInputElement): void {
    this.state.sheets = clampField(field, 1, MAX_SHEETS);
    this.syncPages();
  }
  toggleSet(set: string): void {
    const on = this.state.sets.includes(set);
    if (on && this.state.sets.length === 1) {
      alert(this.i18n.t('wp.minSets'));
      return;
    }
    this.state.sets = on ? this.state.sets.filter((s) => s !== set) : this.state.sets.concat(set);
    this.syncPages();
  }
  setCaps(on: boolean): void {
    this.state.caps = on;
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
    this.state.pages = [];
    this.syncPages();
  }
  print(): void {
    window.print();
  }
  save(): void {
    this.store.remember(this.state, this.nameOf);
  }
  open(entry: WordsSheet): void {
    this.state = this.hydrate(entry);
    this.syncPages();
  }

  private pool(): string[] {
    return candidates((k) => this.word(k), this.state.minLength, this.state.maxLength, this.state.sets);
  }
  /* keeps pages that still fit the settings (count and word lengths), makes the missing ones */
  private syncPages(): void {
    const s = this.state;
    const pool = this.pool();
    const want = Math.min(s.count, pool.length);
    const fits = (p: WordsPage) =>
      p.words.length === want &&
      p.words.every((k) => PICS.has(k) && pool.includes(k));
    const keep = s.pages.filter(fits).slice(0, s.sheets);
    while (keep.length < s.sheets) keep.push(makePage(pool, want));
    s.pages = keep;
    this.persist();
  }
  private hydrate(raw: Partial<WordsSheet>): WordsSheet {
    const s: WordsSheet = {
      name: this.i18n.t('wp.defaultTitle'),
      count: DEFAULT_WORDS,
      minLength: 3,
      maxLength: 6,
      caps: false,
      sheets: 1,
      done: true,
      sets: [...VOCABULARY_SETS],
      pages: [],
      ...raw,
    };
    /* sheets saved before picture sets existed (or with a set that is gone) get every set */
    s.sets = (s.sets ?? []).filter((set) => (VOCABULARY_SETS as readonly string[]).includes(set));
    if (!s.sets.length) s.sets = [...VOCABULARY_SETS];
    return s;
  }
  private persist(): void {
    this.store.save(this.state);
  }

}
