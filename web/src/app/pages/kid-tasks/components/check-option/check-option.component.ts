import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

/* A checkbox with its label (and an optional small note after it), e.g. "“Done!” box at the bottom". */
@Component({
  selector: 'app-check-option',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <label class="check">
      <input #box type="checkbox" [checked]="checked()" (change)="checkedChange.emit(box.checked)" />
      <span>{{ labelKey() | t }}</span>
      @if (noteKey()) {
        <span class="cap">{{ noteKey() | t }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckOptionComponent {
  readonly checked = input(false);
  readonly labelKey = input.required<string>();
  readonly noteKey = input('');
  readonly checkedChange = output<boolean>();
}
