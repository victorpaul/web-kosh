import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TogglePillDirective } from '../toggle-pill.directive';
import { LevelPickerComponent } from '../level-picker/level-picker.component';

/* one configurable task: on/off pill + level picker + a one-line hint */
@Component({
  selector: 'app-task-row',
  standalone: true,
  imports: [TogglePillDirective, LevelPickerComponent],
  template: `
    <div class="taskrow">
      <div class="top">
        <button wsTogglePill [on]="on()" (click)="toggled.emit()">{{ label() }}</button>
        <app-level-picker [level]="level()" [off]="!on()" [titlePrefix]="titlePrefix()" (picked)="levelPicked.emit($event)" />
      </div>
      @if (hint()) {
        <p class="hint">{{ hint() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskRowComponent {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly on = input(false);
  readonly level = input(1);
  readonly titlePrefix = input('');
  readonly toggled = output<void>();
  readonly levelPicked = output<number>();
}
