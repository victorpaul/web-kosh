import { Injectable, effect, signal } from '@angular/core';
import { readString, writeString } from '../storage/local-storage';
import { EN } from './strings/en';
import { UK } from './strings/uk';

export type Lang = 'uk' | 'en';

export const LANGS: Record<Lang, string> = { uk: 'Українська', en: 'English' };

const STRINGS: Record<Lang, Record<string, string>> = { uk: UK, en: EN };
const STORAGE_KEY = 'lang';

export type I18nParams = Record<string, string | number>;

/* Text that comes with its own translations (content data such as the timeline):
   a plain string is the same in every language. */
export type LocalizedText = string | Partial<Record<Lang, string>>;

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.readInitialLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      document.documentElement.lang = lang;
      writeString(STORAGE_KEY, lang);
    });
  }

  /* Reading `lang()` here makes every template or computed that translates re-run on a language switch. */
  t(key: string, params?: I18nParams): string {
    const dict = STRINGS[this.lang()];
    let s = dict[key] ?? EN[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) s = s.split(`{${name}}`).join(String(value));
    }
    return s;
  }

  /* picks this language's variant of content text, falling back to English */
  localize(text: LocalizedText): string {
    if (typeof text === 'string') return text;
    return text[this.lang()] ?? text.en ?? Object.values(text)[0] ?? '';
  }

  /* true when the key has a translation (in this language or the English fallback) */
  has(key: string): boolean {
    return this.t(key) !== key;
  }

  private readInitialLang(): Lang {
    const saved = readString(STORAGE_KEY);
    if (saved === 'uk' || saved === 'en') return saved;
    return /^(uk|ru)\b/i.test(navigator.language) ? 'uk' : 'en';
  }
}
