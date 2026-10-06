import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { WorksheetLayoutComponent } from '../components/worksheet-layout/worksheet-layout.component';
import { SavedListComponent } from '../components/saved-list/saved-list.component';
import { RailGroupComponent } from '../components/rail-group/rail-group.component';
import { CheckOptionComponent } from '../components/check-option/check-option.component';
import { SheetActionsComponent } from '../components/sheet-actions/sheet-actions.component';
import { WorksheetStore } from '../kit/worksheet-store';
import { DETAIL_FIELDS, DetailField, PapersSheet, TEMPLATES, defaultPaper, formatDate, todayISO } from './papers.model';

const KEY = 'worksheet-press-papers-v1';

@Component({
  selector: 'app-papers',
  standalone: true,
  imports: [TranslatePipe, WorksheetLayoutComponent, SavedListComponent, RailGroupComponent, CheckOptionComponent, SheetActionsComponent],
  templateUrl: './papers.component.html',
  styleUrl: './papers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PapersComponent {
  private readonly i18n = inject(I18nService);

  readonly store = new WorksheetStore<PapersSheet>(KEY);
  state: PapersSheet = this.withToday({ ...defaultPaper(), ...this.store.load({}) });

  readonly templates = TEMPLATES;
  readonly detailFields = DETAIL_FIELDS;
  readonly nameOf = (s: PapersSheet) => s.name;
  /* an empty slot still prints as a ruled blank */
  readonly nbsp = '\u00a0';

  printedDate(): string {
    return this.state.blankDate ? '' : formatDate(this.state.date);
  }

  setDetail(key: DetailField, value: string): void {
    this.state[key] = value;
    this.persist();
  }
  setName(name: string): void {
    this.state.name = name;
    this.persist();
  }
  setDate(date: string): void {
    this.state.date = date;
    this.persist();
  }
  setUseToday(on: boolean): void {
    this.state.useToday = on;
    this.state = this.withToday(this.state);
    this.persist();
  }
  setBlankDate(on: boolean): void {
    this.state.blankDate = on;
    this.persist();
  }
  save(): void {
    this.state.name = (this.state.name || '').trim() || this.state.children || this.i18n.t('p.untitled');
    this.store.remember(this.state, this.nameOf, 20);
    this.persist();
  }
  open(entry: PapersSheet): void {
    this.state = this.withToday({ ...defaultPaper(), ...entry });
    this.persist();
  }
  clear(): void {
    if (!confirm(this.i18n.t('p.clearConfirm'))) return;
    this.state = { ...defaultPaper(), school: '', template: this.state.template };
    this.persist();
  }

  private withToday(s: PapersSheet): PapersSheet {
    if (s.useToday) s.date = todayISO();
    return s;
  }
  private persist(): void {
    this.store.save(this.state);
  }
}
