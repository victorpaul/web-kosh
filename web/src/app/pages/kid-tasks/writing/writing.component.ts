import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { WorksheetLayoutComponent } from '../components/worksheet-layout/worksheet-layout.component';
import { SavedListComponent } from '../components/saved-list/saved-list.component';
import { WorksheetStore } from '../kit/worksheet-store';
import { chooseFiles, clampField, readAsDataUrl } from '../kit/files';
import {
  Block, BlockKind, Cell, FONT_KEYS, FontKey, ImageBlock, RATIOS, RATIO_KEYS, RatioKey, STYLE_KEYS, TextBlock, TextStyleKey,
  WritingSheet, blankSheet, newBlock, textBlockStyle,
} from './writing.model';

const KEY = 'worksheet-press-v2';

@Component({
  selector: 'app-writing',
  standalone: true,
  imports: [TranslatePipe, WorksheetLayoutComponent, SavedListComponent],
  templateUrl: './writing.component.html',
  styleUrl: './writing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WritingComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(I18nService);

  readonly store = new WorksheetStore<WritingSheet>(KEY, { current: `${KEY}:current` });
  state: WritingSheet = (this.store.load(null) as WritingSheet | null) ?? this.blankSheet();

  readonly fontKeys = FONT_KEYS;
  readonly styleKeys = STYLE_KEYS;
  readonly ratioKeys = RATIO_KEYS;
  readonly ratios = RATIOS;
  readonly textStyle = textBlockStyle;
  readonly nameOf = (s: WritingSheet) => s.title;

  constructor() {
    this.fitCells();
  }

  /* ---------- sheet ---------- */
  setTitle(title: string): void {
    this.state.title = title;
    this.persist();
  }
  setCols(field: HTMLInputElement): void {
    this.state.cols = clampField(field, 1, 4, 1);
    this.commit();
  }
  setRows(field: HTMLInputElement): void {
    this.state.rows = clampField(field, 1, 6, 1);
    this.commit();
  }
  setSize(size: string): void {
    this.state.size = size === 'letter' ? 'letter' : 'a4';
    this.commit();
  }
  print(): void {
    window.print();
  }
  newSheet(): void {
    this.state = this.blankSheet();
    this.commit();
  }
  save(): void {
    this.store.remember(this.state, this.nameOf);
  }
  open(entry: WritingSheet): void {
    this.state = entry;
    this.commit();
  }

  /* ---------- cards ---------- */
  addBlock(cell: Cell, kind: BlockKind): void {
    cell.blocks.push(newBlock(kind));
    this.commit();
  }
  toggleWide(cell: Cell): void {
    cell.wide = !cell.wide;
    this.commit();
  }
  clearCard(index: number): void {
    this.state.cells[index] = { wide: false, blocks: [] };
    this.commit();
  }

  /* ---------- blocks ---------- */
  moveBlock(cell: Cell, index: number, dir: number): void {
    const to = index + dir;
    if (to < 0 || to >= cell.blocks.length) return;
    const [block] = cell.blocks.splice(index, 1);
    cell.blocks.splice(to, 0, block);
    this.commit();
  }
  removeBlock(cell: Cell, index: number): void {
    cell.blocks.splice(index, 1);
    this.commit();
  }
  setText(block: TextBlock, text: string): void {
    block.text = text;
    this.persist();
  }
  setFont(block: TextBlock, font: string): void {
    block.font = font as FontKey;
    this.commit();
  }
  setFontSize(block: TextBlock, field: HTMLInputElement): void {
    block.size = clampField(field, 8, 96, 24);
    this.commit();
  }
  toggleBold(block: TextBlock): void {
    block.bold = !block.bold;
    this.commit();
  }
  setStyle(block: TextBlock, style: string): void {
    block.style = style as TextStyleKey;
    this.commit();
  }
  fadePercent(block: TextBlock): number {
    return Math.round((block.fade ?? 0.2) * 100);
  }
  setFade(block: TextBlock, field: HTMLInputElement): void {
    block.fade = clampField(field, 5, 100, 20) / 100;
    this.commit();
  }
  setRatio(block: ImageBlock, ratio: string): void {
    block.ratio = ratio as RatioKey;
    this.commit();
  }
  setLineCount(block: Block & { kind: 'lines' }, field: HTMLInputElement): void {
    block.count = clampField(field, 1, 12, 1);
    this.commit();
  }
  async pickImage(block: ImageBlock): Promise<void> {
    const [file] = await chooseFiles({ accept: 'image/*' });
    if (!file) return;
    block.img = await readAsDataUrl(file);
    this.commit();
    this.cdr.markForCheck();
  }

  lines(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  private blankSheet(): WritingSheet {
    return blankSheet((key) => this.i18n.t(key));
  }
  private fitCells(): void {
    const want = this.state.cols * this.state.rows;
    while (this.state.cells.length < want) this.state.cells.push({ wide: false, blocks: [] });
    this.state.cells.length = want;
  }
  private persist(): void {
    this.store.save(this.state);
  }
  private commit(): void {
    this.fitCells();
    this.persist();
  }
}
