import { Directive, input } from '@angular/core';

/* On/off pill: `<button wsTogglePill [on]="…" (click)="…">label</button>`. */
@Directive({
  selector: 'button[wsTogglePill]',
  standalone: true,
  host: { class: 'tog', type: 'button', '[attr.aria-pressed]': 'on()' },
})
export class TogglePillDirective {
  readonly on = input(false);
}
