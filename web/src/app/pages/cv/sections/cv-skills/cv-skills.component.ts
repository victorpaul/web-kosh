import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CvSkillGroup } from '../../../../core/models/cv.model';
import { CvSectionComponent } from '../cv-section/cv-section.component';

export type CvSkillsVariant = 'core' | 'all';

/* Skills grouped by area. `core`: one short line per group (sidebar); `all`: every skill, two columns. */
@Component({
  selector: 'app-cv-skills',
  standalone: true,
  imports: [CvSectionComponent],
  template: `
    <app-cv-section [title]="title()">
      <ul [class.columns]="variant() === 'all'">
        @for (group of groups(); track group.name) {
          <li>
            <strong>{{ group.name }}:</strong> {{ group.skills.join(', ') }}
          </li>
        }
      </ul>
    </app-cv-section>
  `,
  styles: `
    :host { display: block; }
    ul { padding-left: 1.2rem; }
    ul.columns { columns: 2; column-gap: 2.5rem; }
    li { margin-bottom: 0.3rem; break-inside: avoid; }
    strong { color: var(--cv-ink); }
    @media screen and (max-width: 640px) { ul.columns { columns: 1; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvSkillsComponent {
  readonly skillGroups = input.required<CvSkillGroup[]>();
  readonly variant = input<CvSkillsVariant>('all');
  readonly title = input('Skills');

  readonly groups = computed(() => {
    const core = this.variant() === 'core';
    return this.skillGroups()
      .map((g) => ({ name: g.name, skills: g.skills.filter((s) => !core || s.core).map((s) => s.name) }))
      .filter((g) => g.skills.length);
  });
}
