import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CvContact } from '../../../../core/models/cv.model';
import { CvSectionComponent } from '../cv-section/cv-section.component';

@Component({
  selector: 'app-cv-contacts',
  standalone: true,
  imports: [CvSectionComponent],
  template: `
    <app-cv-section [title]="title()">
      <ul>
        @for (c of contacts(); track c.kind) {
          <li>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              @switch (c.kind) {
                @case ('telegram') {
                  <path d="M21.5 3.5 2.8 10.8c-1 .4-1 1.8 0 2.1l4.6 1.5 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.4 4.7 3.5c.6.4 1.4.1 1.6-.6l3.3-15.6c.2-1-.7-1.8-1.5-1.3ZM9.6 14.6l-.5 3.6-1.2-4.2 9.6-6.3-7.9 6.9Z" />
                }
                @case ('email') {
                  <path d="M3 5h18c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1Zm9 7.2L4.4 7H4v.6l8 5.6 8-5.6V7h-.4L12 12.2Z" />
                }
                @case ('location') {
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                }
                @case ('linkedin') {
                  <path d="M4 3h16c.6 0 1 .4 1 1v16c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V4c0-.6.4-1 1-1Zm3.3 15.3V9.8H4.7v8.5h2.6ZM6 8.6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm12.3 9.7v-4.7c0-2.3-.5-4-3.2-4-1.3 0-2.1.7-2.5 1.4V9.8H10v8.5h2.6v-4.2c0-1.1.2-2.2 1.6-2.2 1.4 0 1.4 1.3 1.4 2.3v4.1h2.7Z" />
                }
                @default {
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15.7 15.7 0 0 0-1.4-4A8 8 0 0 1 18.9 8ZM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4ZM4.3 14a8 8 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3Zm.8 2h3a15.7 15.7 0 0 0 1.4 4A8 8 0 0 1 5.1 16ZM8 8H5.1a8 8 0 0 1 4.4-4c-.6 1.2-1.1 2.6-1.4 4Zm4 12c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4Zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4Zm.2 6c.6-1.2 1.1-2.6 1.4-4h3a8 8 0 0 1-4.4 4Zm1.8-6a16.5 16.5 0 0 0 0-4h3.4a8 8 0 0 1 0 4h-3.4Z" />
                }
              }
            </svg>
            @if (c.url) {
              <a [href]="c.url" target="_blank" rel="noopener">{{ c.label }}</a>
            } @else {
              <span>{{ c.label }}</span>
            }
          </li>
        }
      </ul>
    </app-cv-section>
  `,
  styles: `
    :host { display: block; }
    ul { list-style: none; display: flex; flex-direction: column; gap: 0.45rem; }
    li { display: flex; align-items: center; gap: 0.6rem; font-weight: 700; font-size: 0.9rem; }
    svg { width: 1.1rem; height: 1.1rem; flex: none; fill: var(--cv-ink); }
    a { color: var(--cv-ink); font-size: inherit; font-weight: inherit; }
    @media print { ul { gap: 0.2rem; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvContactsComponent {
  readonly contacts = input.required<CvContact[]>();
  readonly title = input('Contact');
}
