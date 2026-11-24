import type { Lang, Loc } from '../i18n/lang';
import { COURSE, COURSE_INFO } from '../lib/course';
import { DEFAULT_PROFILE, effectiveGender, hasGenderPair, hasTemplate, otherGender, personalize, type Gender, type LearnerProfile } from '../lib/personalize';
import { toEnglishPhonetic } from '../lib/polishPhonetics';
import { CNR_LEGEND, CNR_SITUATIONS, CNR_UNITS } from './cnr/units';
import { EN_LEGEND, EN_SITUATIONS, EN_UNITS } from './en/units';
import { HE_LEGEND, HE_UNITS } from './he/units';
import { ITEM_EN, UNIT_EN } from './english';
import { SITUATIONS } from './situations';
import { itemText, type CourseUnitId, type ItemLoc, type ItemSource, type LearningItem, type Unit, type UnitId, type UnitSource } from './types';
import { unit1 } from './unit1';
import { unit2 } from './unit2';
import { unit3 } from './unit3';
import { unit4 } from './unit4';
import { EXTRA_SITUATIONS, EXTRA_UNITS } from './unitsExtra';

function withEnglish(src: ItemSource): LearningItem {
  const en = ITEM_EN[src.id];
  return {
    ...src,
    english: en?.en ?? src.hebrew,
    phoneticEnglish: src.phoneticEnglish ?? toEnglishPhonetic(src.polish),
    articulationTipEn: en?.tip ?? src.articulationTip,
    culturalNoteEn: en?.note,
  };
}

function localizeUnit(u: UnitSource): Unit {
  const en = UNIT_EN[u.id];
  return {
    ...u,
    titleEn: en.title,
    subtitleEn: en.subtitle,
    descriptionEn: en.description,
    items: u.items.map(withEnglish),
  };
}

export const PL_UNITS: Unit[] = [...[unit1, unit2, unit3, unit4].map(localizeUnit), ...EXTRA_UNITS];

/** Units of the active course (lib/course). */
export const UNITS: Unit[] = { pl: PL_UNITS, cnr: CNR_UNITS, en: EN_UNITS, he: HE_UNITS }[COURSE];

export const ALL_ITEMS: LearningItem[] = UNITS.flatMap((u) => u.items);

const ITEM_INDEX = new Map<string, LearningItem>(ALL_ITEMS.map((i) => [i.id, i]));

/**
 * Gender- and name-dependent items are authored as templates (see lib/personalize). The original
 * templates are kept here; applyProfile() resolves them in place, so every view that holds an item
 * (UNITS, ALL_ITEMS, getItem) sees the learner's own form.
 */
type TemplateFields = Pick<
  LearningItem,
  'polish' | 'syllablesPolish' | 'hebrew' | 'english' | 'phoneticHebrew' | 'phoneticEnglish' | 'articulationTip' | 'articulationTipEn' | 'culturalNote' | 'culturalNoteEn' | 'backchainingSteps' | 'loc'
>;

const LOC_LANGS = ['pl', 'cnr'] as const;

function locStrings(loc: LearningItem['loc']): (string | undefined)[] {
  return LOC_LANGS.flatMap((l) => (loc?.[l] ? [loc[l].meaning, loc[l].tip, loc[l].note] : []));
}

function isTemplated(i: LearningItem): boolean {
  return [i.polish, i.syllablesPolish, i.hebrew, i.english, i.phoneticHebrew, i.phoneticEnglish, i.articulationTip, i.articulationTipEn, i.culturalNote, i.culturalNoteEn, ...i.backchainingSteps, ...locStrings(i.loc)].some(hasTemplate);
}

/** Polish / Montenegrin texts of an item resolved for a learner (names in Latin letters, as in English). */
function personalizeLoc(loc: LearningItem['loc'], profile: LearnerProfile, gender?: Gender): LearningItem['loc'] {
  if (!loc) return undefined;
  const out: Partial<Record<'pl' | 'cnr', ItemLoc>> = {};
  for (const l of LOC_LANGS) {
    const v = loc[l];
    if (!v) continue;
    out[l] = {
      meaning: personalize(v.meaning, profile, 'en', gender),
      tip: personalize(v.tip, profile, 'en', gender),
      note: v.note === undefined ? undefined : personalize(v.note, profile, 'en', gender),
    };
  }
  return out;
}

const ITEM_TEMPLATES = new Map<string, TemplateFields>(
  ALL_ITEMS.filter(isTemplated).map((i) => [
    i.id,
    {
      polish: i.polish,
      syllablesPolish: i.syllablesPolish,
      hebrew: i.hebrew,
      english: i.english,
      phoneticHebrew: i.phoneticHebrew,
      phoneticEnglish: i.phoneticEnglish,
      articulationTip: i.articulationTip,
      articulationTipEn: i.articulationTipEn,
      culturalNote: i.culturalNote,
      culturalNoteEn: i.culturalNoteEn,
      backchainingSteps: [...i.backchainingSteps] as [string, string, string],
      loc: i.loc,
    },
  ]),
);

let currentProfile: LearnerProfile = DEFAULT_PROFILE;

export function getProfile(): LearnerProfile {
  return currentProfile;
}

/** Ids of items whose Polish text depends on the speaker's gender. */
export const GENDERED_ITEM_IDS: string[] = [...ITEM_TEMPLATES].filter(([, t]) => hasGenderPair(t.polish)).map(([id]) => id);

/** Re-resolve every templated item for the learner's gender and name. */
export function applyProfile(profile: LearnerProfile): void {
  currentProfile = profile;
  const g = effectiveGender(profile);
  const o = otherGender(g);
  for (const [id, t] of ITEM_TEMPLATES) {
    const item = ITEM_INDEX.get(id);
    if (!item) continue;
    const opt = (v: string | undefined, field: 'he' | 'en') => (v === undefined ? undefined : personalize(v, profile, field));
    Object.assign(item, {
      polish: personalize(t.polish, profile),
      syllablesPolish: personalize(t.syllablesPolish, profile, 'syllables'),
      hebrew: personalize(t.hebrew, profile, 'he'),
      english: personalize(t.english, profile, 'en'),
      phoneticHebrew: personalize(t.phoneticHebrew, profile, 'phoneticHe'),
      phoneticEnglish: personalize(t.phoneticEnglish, profile, 'phoneticEn'),
      articulationTip: personalize(t.articulationTip, profile, 'he'),
      articulationTipEn: personalize(t.articulationTipEn, profile, 'en'),
      culturalNote: opt(t.culturalNote, 'he'),
      culturalNoteEn: opt(t.culturalNoteEn, 'en'),
      backchainingSteps: t.backchainingSteps.map((s) => personalize(s, profile)) as [string, string, string],
      loc: personalizeLoc(t.loc, profile),
      genderAlt: hasGenderPair(t.polish)
        ? {
            gender: o,
            polish: personalize(t.polish, profile, 'polish', o),
            hebrew: personalize(t.hebrew, profile, 'he', o),
            english: personalize(t.english, profile, 'en', o),
            loc: Object.fromEntries(LOC_LANGS.filter((l) => t.loc?.[l]).map((l) => [l, personalizeLoc(t.loc, profile, o)![l]!.meaning])),
          }
        : undefined,
    });
  }
}

applyProfile(DEFAULT_PROFILE);
const ITEM_UNIT = new Map<string, UnitId>(UNITS.flatMap((u) => u.items.map((i) => [i.id, u.id] as const)));

/** Learner-added items live in progress storage; the provider registers them here so lookups work everywhere. */
let customItems = new Map<string, LearningItem>();

export function registerCustomItems(items: LearningItem[]): void {
  customItems = new Map(items.map((i) => [i.id, i]));
}

export function getCustomItems(): LearningItem[] {
  return [...customItems.values()];
}

export function getItem(id: string): LearningItem | undefined {
  return ITEM_INDEX.get(id) ?? customItems.get(id);
}

export function getUnitOfItem(id: string): UnitId | undefined {
  return ITEM_UNIT.get(id) ?? (customItems.has(id) ? 'custom' : undefined);
}

export function getUnit(id: CourseUnitId): Unit {
  const unit = UNITS.find((u) => u.id === id);
  if (!unit) throw new Error(`Unknown unit: ${id}`);
  return unit;
}

/** Situational prompt for the active-recall speaking challenge. */
export function getSituation(item: LearningItem, lang: Lang): string {
  const situations: Record<string, Loc<string>> = { pl: EXTRA_SITUATIONS, cnr: CNR_SITUATIONS, en: EN_SITUATIONS, he: {} }[COURSE];
  const extra = situations[item.id];
  const plain = COURSE === 'pl' ? SITUATIONS[item.id] : undefined;
  if (lang === 'he') return personalize(extra?.he ?? plain ?? `איך אומרים ${COURSE_INFO.inLang.he}: "${item.hebrew}"?`, currentProfile, 'he');
  if (lang === 'pl' || lang === 'cnr') {
    const meaning = itemText(item, lang).meaning;
    const ask = lang === 'pl' ? `Jak powiesz ${COURSE_INFO.inLang.pl}: „${meaning}”?` : `Kako se kaže ${COURSE_INFO.inLang.cnr}: „${meaning}”?`;
    return personalize(extra?.[lang] ?? ask, currentProfile, 'en');
  }
  return personalize(extra?.en ?? `How do you say "${item.english}" ${COURSE_INFO.inLang.en}?`, currentProfile, 'en');
}

/** One row of the transcription legend: the spelling, its transcription and a note per interface language. */
export interface LegendRow {
  pl: string;
  he: string;
  en: string;
  noteHe: string;
  noteEn: string;
  /** Respelling and note for Polish and Montenegrin speakers (English course). */
  loc?: Partial<Record<'pl' | 'cnr', { sound: string; note: string }>>;
}

export function legendSound(row: LegendRow, lang: Lang): string {
  if (lang === 'he') return row.he;
  return (lang === 'en' ? undefined : row.loc?.[lang]?.sound) ?? row.en;
}

export function legendNote(row: LegendRow, lang: Lang): string {
  if (lang === 'he') return row.noteHe;
  return (lang === 'en' ? undefined : row.loc?.[lang]?.note) ?? row.noteEn;
}

/** Legend explaining the phonetic transcription conventions (Hebrew niqqud / English respelling). */
const PL_LEGEND: LegendRow[] = [
  { pl: 'sz', he: 'שׁ', en: 'sh', noteHe: 'ש קשה – לשון אחורה, שפתיים מעוגלות', noteEn: 'hard sh – tongue back, lips rounded' },
  { pl: 'ś / si', he: 'שְׁי', en: 'sh(y)', noteHe: 'ש רכה – לשון קדימה, חיוך (ה-י מסמנת רכות)', noteEn: 'soft sh – tongue forward, smile (y marks softness)' },
  { pl: 'cz', he: 'צ׳', en: 'ch', noteHe: 'צ׳ קשה – לשון אחורה', noteEn: 'hard ch – tongue back' },
  { pl: 'ć / ci', he: 'צְ׳י', en: 'ch(y)', noteHe: 'צ׳ רכה – לשון קדימה, חיוך', noteEn: 'soft ch – tongue forward, smile' },
  { pl: 'ż / rz', he: 'ז׳', en: 'zh', noteHe: 'ז׳ קשה (rz = ż בדיוק)', noteEn: 'hard zh as in "measure" (rz = ż exactly)' },
  { pl: 'ź / zi', he: 'ז׳ִי', en: 'zh(y)', noteHe: 'ז׳ רכה – לשון קדימה', noteEn: 'soft zh – tongue forward' },
  { pl: 'dź / dzi', he: 'ג׳', en: 'j', noteHe: 'ג׳ רכה', noteEn: 'soft j' },
  { pl: 'ł', he: 'וו', en: 'w', noteHe: 'כמו w באנגלית', noteEn: 'English w' },
  { pl: 'w', he: 'ב', en: 'v', noteHe: 'v – ב בלי דגש', noteEn: 'always v' },
  { pl: 'b', he: 'בּ', en: 'b', noteHe: 'b – ב עם דגש', noteEn: 'b' },
  { pl: 'c', he: 'צ', en: 'ts', noteHe: 'תמיד צ, לעולם לא ק', noteEn: 'always ts, never k' },
  { pl: 'ch / h', he: 'ח', en: 'kh', noteHe: 'ח רכה', noteEn: 'throaty h as in "loch"' },
  { pl: 'j', he: 'י', en: 'y', noteHe: 'י', noteEn: 'English y' },
  { pl: 'ą', he: 'וֹנ', en: 'on', noteHe: 'o אפית', noteEn: 'nasal o' },
  { pl: 'ę', he: 'ֶנ / ֶה', en: 'en / eh', noteHe: 'e אפית; בסוף מילה – e רגילה', noteEn: 'nasal e; plain e at the end of a word' },
  { pl: 'ó / u', he: 'וּ', en: 'oo', noteHe: 'u', noteEn: 'oo as in "food"' },
  { pl: 'y', he: 'ִ', en: 'ih', noteHe: 'i "כהה" – חיריק בלי יוד', noteEn: 'dark i as in "bit"' },
  { pl: 'i', he: 'ִי', en: 'ee', noteHe: 'i רגילה – חיריק עם יוד', noteEn: 'ee as in "see"' },
];

export const PHONETIC_LEGEND: LegendRow[] = { pl: PL_LEGEND, cnr: CNR_LEGEND, en: EN_LEGEND, he: HE_LEGEND }[COURSE];
