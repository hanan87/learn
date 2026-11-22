/**
 * The language being learned. The app ships two courses – Polish and Montenegrin – that share every
 * screen and exercise type. The active course is read once at start-up, so every data module (units,
 * roleplays, sound groups, phonetics) is built for it; switching stores the choice and reloads.
 * Each course keeps its own progress; the interface language, theme and voice settings are shared.
 */

export type CourseId = 'pl' | 'cnr';

export interface CourseInfo {
  id: CourseId;
  /** The language's name in Hebrew, in English and in the language itself. */
  name: { he: string; en: string; native: string };
  /** Masculine Hebrew adjective ("הדובר הפולני"); the feminine equals name.he. */
  adjHe: string;
  /** "in Polish" – used inside prompts ("How do you say … in Polish?"). */
  inLang: { he: string; en: string };
  /** Course title shown on the welcome screen and the map. */
  title: string;
  titleHe: string;
  titleEn: string;
  /** Value of the HTML lang attribute on target-language text. */
  htmlLang: string;
  /** Speech recognition language (Chrome / Android). */
  sttLang: string;
  /** Speech synthesis language when no matching device voice is picked. */
  ttsLang: string;
  /** Device voice language prefixes, best first. */
  voicePrefixes: string[];
  /** Prefix of the pre-recorded clip voices ('pl' → 'pl-f' / 'pl-m'). */
  clipPrefix: 'pl' | 'cnr';
  /** Names of the neural voices (female teacher, male) and the language they speak. */
  voiceNames: { f: string; m: string; he: string; en: string };
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
    name: { he: 'פולנית', en: 'Polish', native: 'Polski' },
    adjHe: 'פולני',
    inLang: { he: 'בפולנית', en: 'in Polish' },
    title: 'Polski od zera',
    titleHe: 'פולנית מאפס',
    titleEn: 'Polish from Zero',
    htmlLang: 'pl',
    sttLang: 'pl-PL',
    ttsLang: 'pl-PL',
    voicePrefixes: ['pl'],
    clipPrefix: 'pl',
    voiceNames: { f: 'Zofia', m: 'Marek', he: 'פולנית', en: 'Polish' },
    voiceSample: 'Dzień dobry! Miło mi Cię poznać.',
    progressKey: 'polish-learn:progress:v1',
    defaultNames: { m: 'Dawid', f: 'Anna' },
    niceToMeet: 'Miło mi!',
    writePrompt: 'Napisz po polsku…',
  },
  cnr: {
    id: 'cnr',
    name: { he: 'מונטנגרית', en: 'Montenegrin', native: 'Crnogorski' },
    adjHe: 'מונטנגרי',
    inLang: { he: 'במונטנגרית', en: 'in Montenegrin' },
    title: 'Crnogorski od nule',
    titleHe: 'מונטנגרית מאפס',
    titleEn: 'Montenegrin from Zero',
    htmlLang: 'cnr',
    // There is no Montenegrin recognizer or voice; Croatian recognition writes the same Latin
    // Ijekavian spelling (mlijeko, lijepo), and Bosnian / Croatian / Serbian voices read it naturally.
    sttLang: 'hr-HR',
    ttsLang: 'hr-HR',
    voicePrefixes: ['sr-me', 'cnr', 'bs', 'hr', 'sr-latn', 'sr'],
    clipPrefix: 'cnr',
    voiceNames: { f: 'Vesna', m: 'Goran', he: 'בוסנית – הכי קרובה למונטנגרית', en: 'Bosnian – the closest to Montenegrin' },
    voiceSample: 'Dobar dan! Drago mi je.',
    progressKey: 'polish-learn:progress:cnr:v1',
    defaultNames: { m: 'David', f: 'Ana' },
    niceToMeet: 'Drago mi je!',
    writePrompt: 'Napiši na crnogorskom…',
  },
};

export const COURSE_KEY = 'polish-learn:course';

export function isCourseId(v: unknown): v is CourseId {
  return v === 'pl' || v === 'cnr';
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
