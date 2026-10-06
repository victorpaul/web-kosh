import { ChangeDetectionStrategy, Component, Injector, afterNextRender, inject, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { PHONE_LAYOUT_QUERY } from '../../kit/layout';

/* The rail's action block: [Generate new tasks] [Print] "Save this sheet as …" [Save], plus a hint.
   Extra buttons (e.g. "New") can be projected; they appear after Save.
   On phones (no preview) the Generate button is hidden and Print generates fresh tasks before printing. */
@Component({
  selector: 'app-sheet-actions',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (titleKey()) {
      <span class="lbl">{{ titleKey() | t }}</span>
    }
    @if (showGenerate()) {
      <!-- on phones there is no preview to refresh: Print makes fresh tasks itself -->
      <button class="btn primary desktop-only" type="button" (click)="generate.emit()">{{ 'm.generate' | t }}</button>
    }
    <button class="btn" [class.primary]="!showGenerate()" [class.phone-primary]="showGenerate()" type="button" (click)="print()">
      {{ printKey() | t }}
    </button>
    @if (showGenerate()) {
      <p class="hint phone-only">{{ 'common.printFresh' | t }}</p>
    }
    <label>
      <span class="cap">{{ saveAsKey() | t }}</span>
      <input
        #field
        class="field"
        type="text"
        [value]="name()"
        [placeholder]="namePlaceholderKey() ? (namePlaceholderKey() | t) : ''"
        (input)="nameChange.emit(field.value)"
      />
    </label>
    <button class="btn" type="button" (click)="save.emit()">{{ saveKey() | t }}</button>
    <ng-content />
    @if (hintKey()) {
      <p class="hint">{{ hintKey() | t }}</p>
    }
  `,
  host: { class: 'grp' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetActionsComponent {
  readonly name = input.required<string>();
  readonly titleKey = input('');
  /* pages that generate their tasks show "Generate new tasks" first */
  readonly showGenerate = input(false);
  readonly printKey = input('c.print');
  readonly saveAsKey = input('common.saveAs');
  readonly saveKey = input('m.saveSheet');
  readonly namePlaceholderKey = input('');
  readonly hintKey = input('');

  readonly generate = output<void>();
  readonly save = output<void>();
  readonly nameChange = output<string>();

  private readonly injector = inject(Injector);

  print(): void {
    if (this.showGenerate() && matchMedia(PHONE_LAYOUT_QUERY).matches) {
      this.generate.emit();
      /* print once the fresh tasks are on the page */
      afterNextRender(() => window.print(), { injector: this.injector });
      return;
    }
    window.print();
  }
}
