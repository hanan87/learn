import type { Lang, Loc } from '../i18n/lang';

/**
 * The language being learned. The app ships three courses – Polish, Montenegrin and English (for
 * Hebrew, Polish and Montenegrin speakers) – that share every screen and exercise type. The active course is read once at start-up, so every data module (units,
 * roleplays, sound groups, phonetics) is built for it; switching stores the choice and reloads.
 * Each course keeps its own progress; the interface language, theme and voice settings are shared.
 */

export type CourseId = 'pl' | 'cnr' | 'en';

export interface CourseInfo {
  id: CourseId;
  /** The language's name in each interface language and in the language itself. */
  name: Required<Loc<string>> & { native: string };
  /** Masculine Hebrew adjective ("הדובר הפולני"); the feminine equals name.he. */
  adjHe: string;
  /** "in Polish" – used inside prompts ("How do you say … in Polish?"). */
  inLang: Required<Loc<string>>;
  /** Course title shown on the welcome screen and the map. */
  title: string;
  titleHe: string;
  titleEn: string;
  /** Course title in every interface language that teaches it. */
  titles: Loc<string>;
  /** Value of the HTML lang attribute on target-language text. */
  htmlLang: string;
  /** Speech recognition language (Chrome / Android). */
  sttLang: string;
  /** Speech synthesis language when no matching device voice is picked. */
  ttsLang: string;
  /** Device voice language prefixes, best first. */
  voicePrefixes: string[];
  /** Prefix of the pre-recorded clip voices ('pl' → 'pl-f' / 'pl-m'). */
  clipPrefix: CourseId;
  /** Interface languages the course is taught in (English: Hebrew, Polish and Montenegrin speakers). */
  uiLangs: Lang[];
  /** Flag colours (CSS background) shown next to the course name. */
  flag: string;
  /** Names of the neural voices (female teacher, male) and the language they speak. */
  voiceNames: { f: string; m: string } & Loc<string>;
  /** Phrase played to preview a voice in Settings. */
  voiceSample: string;
  /** localStorage key of this course's progress. */
  progressKey: string;
  /** Names used in phrases until the learner types their own. */
  defaultNames: { m: string; f: string };
  /** "Nice to meet you!" in the language (welcome screen). */
  niceToMeet: string;
  /** Placeholder of the writing exercise ("Write in Polish…" in the language itself). */
  writePrompt: string;
}

export const COURSES: Record<CourseId, CourseInfo> = {
  pl: {
    id: 'pl',
    name: { he: 'פולנית', en: 'Polish', pl: 'polski', cnr: 'poljski', native: 'Polski' },
    adjHe: 'פולני',
    inLang: { he: 'בפולנית', en: 'in Polish', pl: 'po polsku', cnr: 'na poljskom' },
    title: 'Polski od zera',
    titleHe: 'פולנית מאפס',
    titleEn: 'Polish from Zero',
    titles: { he: 'פולנית מאפס', en: 'Polish from Zero' },
    htmlLang: 'pl',
    sttLang: 'pl-PL',
    ttsLang: 'pl-PL',
    voicePrefixes: ['pl'],
    clipPrefix: 'pl',
    uiLangs: ['he', 'en'],
    flag: 'linear-gradient(180deg, #ffffff 50%, #dc143c 50%)',
    voiceNames: { f: 'Zofia', m: 'Marek', he: 'פולנית', en: 'Polish' },
    voiceSample: 'Dzień dobry! Miło mi Cię poznać.',
    progressKey: 'polish-learn:progress:v1',
    defaultNames: { m: 'Dawid', f: 'Anna' },
    niceToMeet: 'Miło mi!',
    writePrompt: 'Napisz po polsku…',
  },
  cnr: {
    id: 'cnr',
    name: { he: 'מונטנגרית', en: 'Montenegrin', pl: 'czarnogórski', cnr: 'crnogorski', native: 'Crnogorski' },
    adjHe: 'מונטנגרי',
    inLang: { he: 'במונטנגרית', en: 'in Montenegrin', pl: 'po czarnogórsku', cnr: 'na crnogorskom' },
    title: 'Crnogorski od nule',
    titleHe: 'מונטנגרית מאפס',
    titleEn: 'Montenegrin from Zero',
    titles: { he: 'מונטנגרית מאפס', en: 'Montenegrin from Zero' },
    htmlLang: 'cnr',
    // There is no Montenegrin recognizer or voice; Croatian recognition writes the same Latin
    // Ijekavian spelling (mlijeko, lijepo), and Bosnian / Croatian / Serbian voices read it naturally.
    sttLang: 'hr-HR',
    ttsLang: 'hr-HR',
    voicePrefixes: ['sr-me', 'cnr', 'bs', 'hr', 'sr-latn', 'sr'],
    clipPrefix: 'cnr',
    uiLangs: ['he', 'en'],
    flag: 'radial-gradient(circle, #d4af37 0 25%, #c40308 28%)',
    voiceNames: { f: 'Vesna', m: 'Goran', he: 'בוסנית – הכי קרובה למונטנגרית', en: 'Bosnian – the closest to Montenegrin' },
    voiceSample: 'Dobar dan! Drago mi je.',
    progressKey: 'polish-learn:progress:cnr:v1',
    defaultNames: { m: 'David', f: 'Ana' },
    niceToMeet: 'Drago mi je!',
    writePrompt: 'Napiši na crnogorskom…',
  },
  en: {
    id: 'en',
    name: { he: 'אנגלית', en: 'English', pl: 'angielski', cnr: 'engleski', native: 'English' },
    adjHe: 'אמריקאי',
    inLang: { he: 'באנגלית', en: 'in English', pl: 'po angielsku', cnr: 'na engleskom' },
    title: 'Everyday English',
    titleHe: 'אנגלית מדוברת',
    titleEn: 'Everyday English',
    titles: { he: 'אנגלית מדוברת', en: 'Everyday English', pl: 'Angielski na co dzień', cnr: 'Engleski za svaki dan' },
    htmlLang: 'en',
    sttLang: 'en-US',
    ttsLang: 'en-US',
    voicePrefixes: ['en-us', 'en'],
    clipPrefix: 'en',
    uiLangs: ['he', 'pl', 'cnr'],
    flag: 'linear-gradient(90deg, #3c3b6e 0 42%, transparent 42%), repeating-linear-gradient(180deg, #b22234 0 15%, #ffffff 15% 30%)',
    voiceNames: { f: 'Jenny', m: 'Guy', he: 'אנגלית אמריקאית', en: 'American English', pl: 'amerykański angielski', cnr: 'američki engleski' },
    voiceSample: 'Hi! Nice to meet you.',
    progressKey: 'polish-learn:progress:en:v1',
    defaultNames: { m: 'Daniel', f: 'Maya' },
    niceToMeet: 'Nice to meet you!',
    writePrompt: 'Write in English…',
  },
};

/** Order of the courses in pickers. */
export const COURSE_ORDER: CourseId[] = ['pl', 'cnr', 'en'];

export const COURSE_KEY = 'polish-learn:course';

export function isCourseId(v: unknown): v is CourseId {
  return v === 'pl' || v === 'cnr' || v === 'en';
}

function readCourse(): CourseId {
  // Node scripts (voice generator) pick the course through an environment variable.
  const env = typeof process !== 'undefined' ? process.env?.LEARN_COURSE : undefined;
  if (isCourseId(env)) return env;
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(COURSE_KEY) : null;
    if (isCourseId(v)) return v;
  } catch {
    // Storage disabled: default course.
  }
  return 'pl';
}

/** The active course for this page load. */
export const COURSE: CourseId = readCourse();
export const COURSE_INFO: CourseInfo = COURSES[COURSE];

/** True once the learner chose a course (new learners pick one on the welcome screen). */
export function courseChosen(): boolean {
  try {
    return isCourseId(localStorage.getItem(COURSE_KEY));
  } catch {
    return false;
  }
}

/** Store the course; the page reloads into it unless it is already active. */
export function setCourse(id: CourseId, reload = true): void {
  try {
    localStorage.setItem(COURSE_KEY, id);
  } catch {
    // Storage disabled: the switch lasts for this page only.
  }
  if (reload && id !== COURSE && typeof location !== 'undefined') location.reload();
}
