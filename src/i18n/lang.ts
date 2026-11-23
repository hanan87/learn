import { uiText } from './strings';

/**
 * Interface + learning language.
 *  - 'he': Hebrew speakers (RTL, Hebrew translations, vocalized Hebrew transcription) – every course
 *  - 'en': English speakers (LTR, English respelling) – the Polish and Montenegrin courses
 *  - 'pl' / 'cnr': Polish and Montenegrin speakers – the English course, with a Latin respelling
 *    written for their own spelling (lib/latinRespell)
 *
 * Strings are written inline as tr(he, en). Polish and Montenegrin are looked up by the English text
 * in the string table (i18n/strings); anything missing there falls back to English.
 */
export type Lang = 'he' | 'en' | 'pl' | 'cnr';

/** Interface languages that read left to right with a Latin respelling (all but Hebrew). */
export type LatinLang = Exclude<Lang, 'he'>;

/** A value per interface language. Polish and Montenegrin are optional: missing ones use English. */
export interface Loc<T> {
  he: T;
  en: T;
  pl?: T;
  cnr?: T;
}

export const LANGS: Lang[] = ['he', 'en', 'pl', 'cnr'];

export function isLang(v: unknown): v is Lang {
  return v === 'he' || v === 'en' || v === 'pl' || v === 'cnr';
}

/** BCP 47 locale of each interface language (dates, numbers, the lang attribute). */
export const LOCALES: Record<Lang, string> = { he: 'he-IL', en: 'en-GB', pl: 'pl-PL', cnr: 'sr-Latn-ME' };

/** The value for a language; strings missing in Polish / Montenegrin go through the string table. */
export function localize<T>(v: Loc<T>, lang: Lang): T {
  if (lang === 'he' || lang === 'en') return v[lang];
  const own = v[lang];
  if (own !== undefined) return own;
  return (typeof v.en === 'string' ? uiText(v.en, lang) : v.en) as T;
}

/** Localized string used by data modules (Polish / Montenegrin optional). */
export type Bi = Loc<string>;
