import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

/* Builder page shell: settings rail on the left (project `ngProjectAs="[rail]"`), live A4 sheet(s) on the right.
   Print hides the rail. Language and theme live in the site header, not here. */
@Component({
  selector: 'app-worksheet-layout',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="ws wrap">
      <aside class="rail">
        <div class="brand">
          <a routerLink="/kid-tasks" class="back">{{ 'app.back' | t }}</a>
          <h1>{{ titleKey() | t }}</h1>
          <p>{{ taglineKey() | t }}</p>
        </div>
        <ng-content select="[rail]" />
        <p class="hint">{{ storageKey() | t }}</p>
      </aside>
      <main class="stage" [class.stacked]="stacked()" [class.phone-hidden]="!previewOnPhones()">
        <ng-content />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorksheetLayoutComponent {
  readonly titleKey = input.required<string>();
  readonly taglineKey = input.required<string>();
  /* several sheets stacked vertically instead of one centred sheet */
  readonly stacked = input(false);
  /* On phones the sheet preview is hidden (it is still printed). Pages where you edit inside the sheet keep it. */
  readonly previewOnPhones = input(false);
  /* the "everything stays in this browser" note at the bottom of the rail */
  readonly storageKey = input('common.storage');
}
