import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService, LANGS, Lang } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-language-switch',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './language-switch.component.html',
  styleUrl: './language-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitchComponent {
  readonly i18n = inject(I18nService);
  readonly langs = Object.entries(LANGS).map(([code, name]) => ({ code: code as Lang, name }));
}
