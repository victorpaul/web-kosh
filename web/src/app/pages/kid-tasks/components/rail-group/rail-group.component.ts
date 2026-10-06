import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { I18nParams } from '../../../../core/i18n/i18n.service';

/* One block of the settings rail: an optional small-caps title, the controls, an optional hint underneath.
   Hints that are computed or conditional go inside the block as <p class="hint">. */
@Component({
  selector: 'app-rail-group',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (titleKey()) {
      <span class="lbl">{{ titleKey() | t }}</span>
    }
    <ng-content />
    @if (hintKey()) {
      <p class="hint">{{ hintKey() | t: hintParams() }}</p>
    }
  `,
  host: { class: 'grp' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RailGroupComponent {
  readonly titleKey = input('');
  readonly hintKey = input('');
  readonly hintParams = input<I18nParams | undefined>(undefined);
}
