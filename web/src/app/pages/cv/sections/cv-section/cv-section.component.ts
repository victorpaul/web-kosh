import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/* Shell for every CV section: the spaced-out heading plus the section body.
   The heading size comes from `--cv-heading-size`, set per layout area, so a section looks
   like a sidebar block in one place and like a page title in another. */
@Component({
  selector: 'app-cv-section',
  standalone: true,
  template: `
    <section class="cv-section">
      @if (title()) {
        <h2>{{ title() }}</h2>
      }
      <ng-content />
    </section>
  `,
  styles: `
    :host { display: block; }
    h2 {
      font-size: var(--cv-heading-size, 1.05rem);
      font-weight: 700;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--cv-ink);
      margin: 0 0 var(--cv-heading-gap, 0.6rem);
      line-height: 1.2;
      break-after: avoid;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvSectionComponent {
  readonly title = input('');
}
