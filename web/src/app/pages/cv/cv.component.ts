import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { CvService } from '../../core/cv/cv.service';
import { Cv } from '../../core/models/cv.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CLASSIC, CvLayout } from './cv-layouts';
import { CvHeaderComponent } from './sections/cv-header/cv-header.component';
import { CvContactsComponent } from './sections/cv-contacts/cv-contacts.component';
import { CvTextComponent } from './sections/cv-text/cv-text.component';
import { CvExperienceComponent } from './sections/cv-experience/cv-experience.component';
import { CvProjectsComponent } from './sections/cv-projects/cv-projects.component';
import { CvSkillsComponent } from './sections/cv-skills/cv-skills.component';
import { CvListComponent } from './sections/cv-list/cv-list.component';

type CvState = { status: 'loading' } | { status: 'ready'; cv: Cv } | { status: 'error'; message: string };

/* The CV page: loads the data and renders it in a layout. The CV content is English only;
   only the page chrome around it (loading/error) follows the site language. */
@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [
    TranslatePipe,
    CvHeaderComponent,
    CvContactsComponent,
    CvTextComponent,
    CvExperienceComponent,
    CvProjectsComponent,
    CvSkillsComponent,
    CvListComponent,
  ],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvComponent {
  readonly layout: CvLayout = CLASSIC;

  readonly state = toSignal(
    inject(CvService)
      .getCv()
      .pipe(
        map((cv): CvState => ({ status: 'ready', cv })),
        catchError((err) => of<CvState>({ status: 'error', message: err.message })),
        startWith<CvState>({ status: 'loading' }),
      ),
    { requireSync: true },
  );

  readonly cv = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? state.cv : null;
  });

  languageItems(cv: Cv): string[] {
    return cv.languages.map((l) => `${l.name} (${l.level})`);
  }
}
