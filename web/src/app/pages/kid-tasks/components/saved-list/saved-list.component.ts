import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { WorksheetStore } from '../../kit/worksheet-store';
import { clone } from '../../kit/random';

/* the "saved sheets" list: ↻ name to open a copy, ✕ to forget it */
@Component({
  selector: 'app-saved-list',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="saved">
      @for (entry of store().library(); track nameOf()(entry)) {
        <div class="item">
          <button type="button" (click)="opened.emit(copy(entry))">↻ {{ nameOf()(entry) }}</button>
          <button type="button" [title]="deleteTitleKey() | t" (click)="store().forget(entry, nameOf())">✕</button>
        </div>
      } @empty {
        <p class="hint">{{ 'common.nothingSaved' | t }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedListComponent<T> {
  readonly store = input.required<WorksheetStore<T>>();
  readonly nameOf = input.required<(entry: T) => string>();
  readonly deleteTitleKey = input('common.delete');
  readonly opened = output<T>();

  copy(entry: T): T {
    return clone(entry);
  }
}
