import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../../core/theme/theme.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  private readonly i18n = inject(I18nService);

  readonly icon = computed(() => (this.themeService.theme() === 'dark' ? '☀️' : '🌙'));
  readonly title = computed(() => this.i18n.t(this.themeService.theme() === 'dark' ? 'theme.toLight' : 'theme.toDark'));

  toggle(): void {
    this.themeService.toggle();
  }
}
