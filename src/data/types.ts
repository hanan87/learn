/**
 * Core data model for the course.
 *
 * Syllable notation (used by `syllablesPolish`, `phoneticHebrew` and `phoneticEnglish`):
 *   - "·" (U+00B7 middle dot) separates syllables inside a word.
 *   - A space separates words.
 *   - Square brackets mark the stressed syllable: "prze·[pra]·szam".
 *   - Words without brackets are unstressed clitics (e.g. "się", "w", "nie").
 * The UI parses this notation and paints the stressed syllable in an accent color
 * (and upper-cases it in the English respelling, e.g. "jen·KOO·yeh").
 */

import { localize, type Bi, type Lang } from '../i18n/lang';
import { COURSE } from '../lib/course';
import { respell } from '../lib/latinRespell';
import type { Gender } from '../lib/personalize';

export type Formality = 'formal' | 'casual' | 'neutral';

export type CourseUnitId = 'u1' | 'u2' | 'u3' | 'u4' | 'u5' | 'u6' | 'u7' | 'u8' | 'm1' | 'm2' | 'm3' | 'm4' | 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type UnitId = CourseUnitId | 'custom';

/** Sound features used to group items in the Sound Lab. */
export type SoundTag =
  | 'hard-sibilant'
  | 'soft-sibilant'
  | 'l-vs-ł'
  | 'w'
  | 'nasal'
  | 'devoicing'
  | 'cluster'
  | 'y-vowel';

/** Item as authored in the Hebrew-first unit files (units 1–4). English is merged in from english.ts. */
export interface ItemSource {
  id: string;
  polish: string;
  syllablesPolish: string;
  hebrew: string;
  phoneticHebrew: string;
  articulationTip: string;
  backchainingSteps: [string, string, string];
  formality: Formality;
  soundTags?: SoundTag[];
  culturalNote?: string;
  /** Hand-written English respelling (otherwise generated from the Polish text). */
  phoneticEnglish?: string;
}

/** Item text in Polish or Montenegrin (English course only). */
export interface ItemLoc {
  meaning: string;
  tip: string;
  note?: string;
}

/** Complete bilingual item used by the app. */
export interface LearningItem extends ItemSource {
  english: string;
  phoneticEnglish: string;
  articulationTipEn: string;
  culturalNoteEn?: string;
  /** True for words the learner added to the personal dictionary. */
  custom?: boolean;
  /** Meaning, tip and note for Polish and Montenegrin speakers (English course). */
  loc?: Partial<Record<'pl' | 'cnr', ItemLoc>>;
  /** Set on gender-dependent items: how a speaker of the other gender says the same thing. */
  genderAlt?: { gender: Gender; polish: string; hebrew: string; english: string; loc?: Partial<Record<'pl' | 'cnr', string>> };
}

export type UnitColor = 'rose' | 'amber' | 'sky' | 'emerald' | 'violet' | 'orange' | 'red' | 'teal';

export interface UnitSource {
  id: CourseUnitId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  color: UnitColor;
  items: ItemSource[];
}

export interface UnitLoc {
  title: string;
  subtitle: string;
  description: string;
}

export interface Unit extends Omit<UnitSource, 'items'> {
  titleEn: string;
  subtitleEn: string;
  descriptionEn: string;
  /** Unit texts for Polish and Montenegrin speakers (English course). */
  loc?: Partial<Record<'pl' | 'cnr', UnitLoc>>;
  items: LearningItem[];
}

export const FORMALITY_LABELS: Record<Formality, Bi> = {
  pl: {
    formal: { he: 'רשמי (Pan/Pani)', en: 'Formal (Pan/Pani)' },
    casual: { he: 'יומיומי (ty)', en: 'Casual (ty)' },
    neutral: { he: 'ניטרלי', en: 'Neutral' },
  },
  cnr: {
    formal: { he: 'רשמי (Vi)', en: 'Formal (Vi)' },
    casual: { he: 'יומיומי (ti)', en: 'Casual (ti)' },
    neutral: { he: 'ניטרלי', en: 'Neutral' },
  },
  en: {
    formal: { he: 'מנומס (Could you…)', en: 'Polite (Could you…)' },
    casual: { he: 'יומיומי', en: 'Casual' },
    neutral: { he: 'ניטרלי', en: 'Neutral' },
  },
  // Hebrew has no formal "you": slang and everyday phrases are marked casual.
  he: {
    formal: { he: 'מנומס', en: 'Polite', pl: 'Uprzejmie', cnr: 'Učtivo' },
    casual: { he: 'סלנג', en: 'Casual / slang', pl: 'Potocznie / slang', cnr: 'Kolokvijalno / sleng' },
    neutral: { he: 'ניטרלי', en: 'Neutral', pl: 'Neutralnie', cnr: 'Neutralno' },
  },
}[COURSE];

/** Localized view of an item for the active language. Polish / Montenegrin fall back to English. */
export function itemText(item: LearningItem, lang: Lang) {
  if (lang === 'he') return { meaning: item.hebrew, phonetic: item.phoneticHebrew, tip: item.articulationTip, note: item.culturalNote };
  if (lang === 'en') return { meaning: item.english, phonetic: item.phoneticEnglish, tip: item.articulationTipEn, note: item.culturalNoteEn };
  const own = item.loc?.[lang];
  return {
    meaning: own?.meaning ?? item.english,
    phonetic: respell(item.phoneticHebrew, lang),
    tip: own?.tip ?? item.articulationTipEn,
    note: own ? own.note : item.culturalNoteEn,
  };
}

/** Meaning of a gender-dependent item's other form in the active language. */
export function genderAltMeaning(alt: NonNullable<LearningItem['genderAlt']>, lang: Lang): string {
  return localize({ he: alt.hebrew, en: alt.english, ...alt.loc }, lang);
}

export function unitText(unit: Unit, lang: Lang) {
  if (lang === 'he') return { title: unit.title, subtitle: unit.subtitle, description: unit.description };
  const own = lang === 'en' ? undefined : unit.loc?.[lang];
  return own ?? { title: unit.titleEn, subtitle: unit.subtitleEn, description: unit.descriptionEn };
}
