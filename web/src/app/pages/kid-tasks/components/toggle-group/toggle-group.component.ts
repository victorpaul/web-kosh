import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { TogglePillDirective } from '../toggle-pill.directive';

export interface ToggleOption {
  value: string;
  /* already translated */
  label: string;
  /* optional colour dot before the label */
  color?: string;
}

/* A set of on/off pills (picture sets, colours, character pairs, operations…).
   Keeps at least `min` options on; turning off one more shows `minMessageKey` (with {n} = min), if given. */
@Component({
  selector: 'app-toggle-group',
  standalone: true,
  imports: [TogglePillDirective],
  template: `
    <div class="toggles">
      @for (option of options(); track option.value) {
        <button wsTogglePill [on]="selected().includes(option.value)" (click)="toggle(option.value)">
          @if (option.color) {
            <span class="dot" [style.background]="option.color"></span>
          }
          {{ option.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupComponent {
  private readonly i18n = inject(I18nService);

  readonly options = input.required<ToggleOption[]>();
  readonly selected = input.required<readonly string[]>();
  readonly min = input(1);
  readonly minMessageKey = input('');
  readonly selectedChange = output<string[]>();

  toggle(value: string): void {
    const selected = this.selected();
    if (selected.includes(value)) {
      if (selected.length <= this.min()) {
        if (this.minMessageKey()) alert(this.i18n.t(this.minMessageKey(), { n: this.min() }));
        return;
      }
      this.selectedChange.emit(selected.filter((v) => v !== value));
    } else {
      this.selectedChange.emit([...selected, value]);
    }
  }
}
