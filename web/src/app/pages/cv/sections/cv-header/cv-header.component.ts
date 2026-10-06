import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-cv-header',
  standalone: true,
  template: `
    <header>
      <div class="topline">
        @if (note()) {
          <strong>{{ note() }}</strong>
        }
        <a class="online" href="https://kosh.top/cv">kosh.top/cv</a>
      </div>
      <h1>{{ name() }}</h1>
      <p class="title">{{ title() }}</p>
    </header>
  `,
  styles: `
    :host { display: block; }
    .topline {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.8rem;
      margin-bottom: 2.75rem;
    }
    .online {
      color: var(--cv-muted);
      font-weight: 400;
      font-size: inherit;
    }
    h1 {
      font-size: 2.6rem;
      font-weight: 800;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--cv-ink);
      margin: 0 0 0.5rem;
      line-height: 1.15;
    }
    .title {
      font-size: 1.25rem;
      font-style: italic;
      letter-spacing: 0.25em;
      color: var(--cv-ink);
    }
    @media print {
      .topline { margin-bottom: 1.75rem; }
    }
    @media screen and (max-width: 640px) {
      h1 { font-size: 1.45rem; letter-spacing: 0.12em; overflow-wrap: anywhere; }
      .title { font-size: 1rem; letter-spacing: 0.15em; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvHeaderComponent {
  readonly name = input.required<string>();
  readonly title = input.required<string>();
  readonly note = input<string>();
}
