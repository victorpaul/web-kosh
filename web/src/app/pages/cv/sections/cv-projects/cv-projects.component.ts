import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Cv } from '../../../../core/models/cv.model';
import { CvSectionComponent } from '../cv-section/cv-section.component';

@Component({
  selector: 'app-cv-projects',
  standalone: true,
  imports: [CvSectionComponent],
  template: `
    <app-cv-section [title]="title()">
      <p>{{ projects().intro }}</p>
      @for (item of projects().items; track item.title) {
        <article>
          <h3>{{ item.title }}</h3>
          <!-- paragraphs may hold <strong> emphasis from the CV data -->
          @for (p of item.paragraphs; track $index) {
            <p [innerHTML]="p"></p>
          }
          @for (link of item.links ?? []; track link.url) {
            <p>{{ link.label }}: <a [href]="link.url" target="_blank" rel="noopener">{{ shortUrl(link.url) }}</a></p>
          }
        </article>
      }
      @if (projects().languages.length) {
        <p class="langs">
          Non-commercial experience with the following languages on my own pet projects:
          <strong>{{ projects().languages.join(', ') }}</strong>
        </p>
      }
    </app-cv-section>
  `,
  styles: `
    :host { display: block; }
    p { margin-bottom: 0.2rem; }
    article { margin-top: 1.4rem; break-inside: avoid; }
    h3 { font-size: 1rem; font-weight: 700; color: var(--cv-ink); margin: 0 0 0.2rem; }
    .langs { margin-top: 1.4rem; }
    a { color: inherit; font-size: inherit; font-weight: 700; text-decoration: underline; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvProjectsComponent {
  readonly projects = input.required<Cv['projects']>();
  readonly title = input('Non-commercial experience');

  shortUrl(url: string): string {
    return url.replace(/^https?:\/\//, '');
  }
}
