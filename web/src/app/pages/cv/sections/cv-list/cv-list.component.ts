import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CvSectionComponent } from '../cv-section/cv-section.component';

/* Titled bullet list: soft skills, languages, hobbies, domains. */
@Component({
  selector: 'app-cv-list',
  standalone: true,
  imports: [CvSectionComponent],
  template: `
    <app-cv-section [title]="title()">
      <ul [style.columns]="columns()">
        @for (item of items(); track item) {
          <li>{{ item }}</li>
        }
      </ul>
    </app-cv-section>
  `,
  styles: `
    :host { display: block; }
    ul { padding-left: 1.2rem; }
    ul[style*='columns'] { column-gap: 2rem; }
    li { margin-bottom: 0.15rem; break-inside: avoid; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvListComponent {
  readonly title = input.required<string>();
  readonly items = input.required<string[]>();
  /* lay a long list out in columns (e.g. 3); default is a single column */
  readonly columns = input<number | null>(null);
}
