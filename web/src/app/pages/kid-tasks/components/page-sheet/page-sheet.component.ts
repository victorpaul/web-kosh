import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

/* One printed A4 page: the instruction line (+ an optional second line), the task body (projected),
   and the optional "Done!" box. Every page-per-puzzle worksheet is a list of these. */
@Component({
  selector: 'app-page-sheet',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="sheet page">
      <p class="how">
        {{ how() }}
        @if (note()) {
          <br />{{ note() }}
        }
      </p>
      <div class="body"><ng-content /></div>
      @if (done()) {
        <div class="done">{{ 'c.done' | t }}<span class="tick"></span></div>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    /* each sheet is its own printed page (the host is what sits next to its siblings) */
    @media print {
      :host {
        break-after: page;
      }
      :host(:last-of-type) {
        break-after: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSheetComponent {
  /* already translated */
  readonly how = input.required<string>();
  readonly note = input('');
  readonly done = input(false);
}
