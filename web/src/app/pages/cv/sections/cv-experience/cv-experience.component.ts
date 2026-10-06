import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CvExperience } from '../../../../core/models/cv.model';
import { CvSectionComponent } from '../cv-section/cv-section.component';
import { formatDuration, formatPeriod, monthsWorked } from '../../cv-period';

@Component({
  selector: 'app-cv-experience',
  standalone: true,
  imports: [CvSectionComponent],
  template: `
    <app-cv-section [title]="title()">
      @for (job of entries(); track job.company + job.start) {
        <article>
          <p class="head">
            @if (job.url) {
              <a class="company" [href]="job.url" target="_blank" rel="noopener">{{ job.company }}</a>
            } @else {
              <span class="company">{{ job.company }}</span>
            }
            <span class="period">{{ period(job) }}</span>
            @if (duration(job); as d) {
              <span class="duration">{{ d }}</span>
            }
          </p>
          <p><strong>{{ job.roles.length > 1 ? 'Roles' : 'Role' }}:</strong> {{ job.roles.join(', ') }}</p>
          @for (link of job.links ?? []; track link.url) {
            <p>{{ link.label }}: <a [href]="link.url" target="_blank" rel="noopener">{{ shortUrl(link.url) }}</a></p>
          }
          @if (job.responsibilities.length) {
            <p><strong>Responsibilities:</strong></p>
            <ul>
              @for (r of job.responsibilities; track $index) {
                <li>{{ r }}</li>
              }
            </ul>
          }
          @if (job.stack.length) {
            <p class="stack">
              @for (s of job.stack; track s) {
                <span class="tag">{{ s }}</span>
              }
            </p>
          }
        </article>
      }
    </app-cv-section>
  `,
  styles: `
    :host { display: block; }
    article { margin-bottom: 1.6rem; break-inside: avoid; }
    article:last-child { margin-bottom: 0; }
    p { margin-bottom: 0.15rem; }
    .head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 0.6rem; }
    .company { font-weight: 700; color: var(--cv-ink); font-size: 1rem; }
    .period, .duration { color: var(--cv-muted); font-weight: 300; }
    .duration::before { content: '· '; }
    ul { padding-left: 1.4rem; margin-top: 0.1rem; }
    li { margin-bottom: 0.1rem; }
    .stack { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem; }
    .tag {
      font-size: 0.75rem;
      padding: 0.05rem 0.5rem;
      border: 1px solid var(--cv-rule);
      border-radius: 999px;
      color: var(--cv-muted);
    }
    a { color: inherit; font-size: inherit; font-weight: inherit; }
    a:not(.company) { text-decoration: underline; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvExperienceComponent {
  readonly entries = input.required<CvExperience[]>();
  readonly title = input('Commercial experience');

  period(job: CvExperience): string {
    return formatPeriod(job.start, job.end);
  }
  duration(job: CvExperience): string {
    return formatDuration(monthsWorked(job.start, job.end));
  }
  shortUrl(url: string): string {
    return url.replace(/^https?:\/\//, '');
  }
}
