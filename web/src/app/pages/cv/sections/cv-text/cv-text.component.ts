import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CvSectionComponent } from '../cv-section/cv-section.component';

/* Prose section (about, "Me and AI", summary): an optional section title, an optional bold lead-in, paragraphs. */
@Component({
  selector: 'app-cv-text',
  standalone: true,
  imports: [CvSectionComponent],
  template: `
    <app-cv-section [title]="title()">
      @if (lead()) {
        <h3>{{ lead() }}</h3>
      }
      @for (p of paragraphs(); track $index) {
        <p>{{ p }}</p>
      }
    </app-cv-section>
  `,
  styles: `
    :host { display: block; }
    h3 { font-size: 0.95rem; font-weight: 700; color: var(--cv-ink); margin: 0 0 0.25rem; }
    p { margin: 0 0 0.9rem; }
    p:last-child { margin-bottom: 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvTextComponent {
  readonly paragraphs = input.required<string[]>();
  readonly title = input('');
  readonly lead = input('');
}
