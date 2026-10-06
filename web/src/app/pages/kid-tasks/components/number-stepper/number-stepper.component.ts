import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

/* A number field with big − / + buttons beside it (finger-friendly on phones).
   It keeps the value inside [min, max] itself and emits the clamped number; typing still works.
   The visible caption lives outside (a <span>), and `label` names the field for screen readers. */
@Component({
  selector: 'app-number-stepper',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (captionKey()) {
      <span class="cap">{{ captionKey() | t }}</span>
    }
    <div class="stepper" [class.small]="size() === 'small'">
      <input
        type="number"
        inputmode="numeric"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [value]="value()"
        [attr.aria-label]="(label() || (captionKey() ? (captionKey() | t) : '')) || null"
        [title]="label()"
        (change)="typed($any($event.target))"
      />
      <button type="button" [disabled]="value() <= min()" [attr.aria-label]="'common.decrease' | t" (click)="bump(-1)">−</button>
      <button type="button" [disabled]="value() >= max()" [attr.aria-label]="'common.increase' | t" (click)="bump(1)">+</button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    /* one control: a single frame holding the number and both buttons, split by thin dividers */
    .stepper {
      --size: 36px;
      display: flex;
      align-items: stretch;
      height: var(--size);
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      overflow: hidden;
      transition: border-color 0.12s, box-shadow 0.12s;
    }
    .stepper:hover {
      border-color: color-mix(in srgb, var(--blue) 50%, var(--line));
    }
    /* keyboard focus anywhere inside lights up the whole control */
    .stepper:focus-within {
      border-color: var(--blue);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 25%, transparent);
    }
    .stepper.small {
      --size: 26px;
      border-radius: 6px;
    }
    /* touch screens get the recommended 44px targets */
    @media (pointer: coarse) {
      .stepper {
        --size: 44px;
      }
      .stepper.small {
        --size: 36px;
      }
    }
    input {
      flex: 1;
      min-width: 2.5em;
      width: 0;
      height: 100%;
      padding: 0 8px;
      border: 0;
      background: transparent;
      color: var(--ink);
      font: inherit;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      /* the browser's own tiny arrows are replaced by the buttons */
      appearance: textfield;
      -moz-appearance: textfield;
    }
    input:focus {
      outline: none;
    }
    input::-webkit-inner-spin-button,
    input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .small input {
      font-size: 12px;
      padding: 0 4px;
    }
    button {
      flex: none;
      width: var(--size);
      height: 100%;
      padding: 0;
      border: 0;
      border-left: 1px solid var(--line);
      background: transparent;
      color: var(--ink);
      font-size: 20px;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
      touch-action: manipulation;
      transition: background-color 0.12s, color 0.12s;
    }
    .small button {
      font-size: 15px;
    }
    button:hover:not(:disabled) {
      background: var(--blue-soft);
      color: var(--blue);
    }
    button:active:not(:disabled) {
      background: color-mix(in srgb, var(--blue) 22%, transparent);
    }
    button:focus-visible {
      outline: none;
      background: var(--blue-soft);
    }
    button:disabled {
      color: var(--pencil);
      opacity: 0.45;
      cursor: default;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberStepperComponent {
  readonly value = input.required<number>();
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  /* visible caption above the field (also its accessible name) */
  readonly captionKey = input('');
  /* accessible name when there is no visible caption (e.g. in the sheet toolbars) */
  readonly label = input('');
  readonly size = input<'normal' | 'small'>('normal');
  readonly valueChange = output<number>();

  bump(direction: 1 | -1): void {
    this.emit(this.value() + direction * this.step());
  }

  /* a typed value is kept inside the limits, and the field shows what was actually applied */
  typed(field: HTMLInputElement): void {
    const typed = Number(field.value);
    const value = this.clamp(Number.isFinite(typed) && field.value !== '' ? typed : this.value());
    field.value = String(value);
    this.emit(value);
  }

  private emit(value: number): void {
    const clamped = this.clamp(value);
    if (clamped !== this.value()) this.valueChange.emit(clamped);
  }

  private clamp(value: number): number {
    return Math.max(this.min(), Math.min(this.max(), Math.round(value)));
  }
}
