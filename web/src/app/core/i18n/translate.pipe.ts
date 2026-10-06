import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nParams, I18nService } from './i18n.service';

/* Impure on purpose: `t()` reads the language signal, so the view re-renders when the language changes,
   even inside OnPush components. The lookup is a plain map read, so running it every check is cheap. */
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: I18nParams): string {
    return this.i18n.t(key, params);
  }
}
