import { ChangeDetectionStrategy, Component, TemplateRef, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/* Two columns the child joins with pencil lines (colour ↔ colour, word ↔ colour, word ↔ picture).
   The page says how to draw item i on each side with two templates (`let-i` gets the row index);
   this component owns the layout, the anchor dots and the optional grey example line. */
@Component({
  selector: 'app-match-block',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @for (i of rowIndexes(); track i) {
      <div class="cell l" [style.grid-row]="i + 1">
        <ng-container *ngTemplateOutlet="left(); context: { $implicit: i }" />
        <span class="anchor"></span>
      </div>
      <div class="cell r" [style.grid-row]="i + 1">
        <span class="anchor"></span>
        <ng-container *ngTemplateOutlet="right(); context: { $implicit: i }" />
      </div>
    }
    <svg class="wires" [attr.viewBox]="'0 0 100 ' + rows() * 10" preserveAspectRatio="none">
      @if (exampleTo() !== null) {
        <!-- the first left item, already joined to its partner -->
        <line x1="2" y1="5" x2="98" [attr.y2]="exampleTo()! * 10 + 5" stroke="#8C97A8" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      }
    </svg>
  `,
  host: {
    '[style.grid-template-columns]': "leftWidth() + ' 1fr ' + rightWidth()",
    '[style.grid-template-rows]': "'repeat(' + rows() + ', 1fr)'",
  },
  styles: `
    :host {
      flex: 1;
      display: grid;
      min-height: 0;
      padding: 4mm 0;
    }
    :host(:not(:first-child)) {
      border-top: 1px dashed #c9d1de;
    }
    .cell {
      display: flex;
      align-items: center;
      gap: 4mm;
    }
    .cell.l {
      grid-column: 1;
      justify-content: flex-end;
    }
    .cell.r {
      grid-column: 3;
      justify-content: flex-start;
    }
    .anchor {
      width: 3.2mm;
      height: 3.2mm;
      border-radius: 50%;
      background: #16243c;
      flex: none;
    }
    .wires {
      grid-column: 2;
      grid-row: 1 / -1;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchBlockComponent {
  readonly rows = input.required<number>();
  readonly left = input.required<TemplateRef<{ $implicit: number }>>();
  readonly right = input.required<TemplateRef<{ $implicit: number }>>();
  readonly leftWidth = input('30mm');
  readonly rightWidth = input('30mm');
  /* row on the right joined to the first left item by a grey example line; null = no example */
  readonly exampleTo = input<number | null>(null);

  readonly rowIndexes = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
}
