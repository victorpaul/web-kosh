import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService, LocalizedText } from './i18n.service';

/* `{{ item.title | localize }}` — content text with inline translations. Impure for the same reason as `t`. */
@Pipe({ name: 'localize', standalone: true, pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(text: LocalizedText): string {
    return this.i18n.localize(text);
  }
}
