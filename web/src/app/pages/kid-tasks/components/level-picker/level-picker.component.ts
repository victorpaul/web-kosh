import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

/* level 1 · 2 · 3 buttons; button titles come from `titlePrefix + n` (e.g. `common.level.2`) */
@Component({
  selector: 'app-level-picker',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="lvl" [attr.data-off]="off()">
      @for (n of levels(); track n) {
        <button type="button" [attr.aria-pressed]="level() === n" [title]="titlePrefix() ? (titlePrefix() + n | t) : ''" (click)="picked.emit(n)">
          {{ n }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelPickerComponent {
  readonly level = input.required<number>();
  readonly levels = input([1, 2, 3]);
  readonly off = input(false);
  readonly titlePrefix = input('');
  readonly picked = output<number>();
}
