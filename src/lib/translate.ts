import { ALL_ITEMS, getCustomItems } from '../data';
import { itemText, type LearningItem } from '../data/types';
import type { Lang } from '../i18n/lang';
import { COURSE, type CourseId } from './course';

/**
 * "How do I say…?" – translation between the learner's language (Hebrew, English, Polish or
 * Montenegrin) and the course language. Order of sources:
 *   1. the course itself: a phrase whose meaning matches exactly comes with hand-checked syllables,
 *      transcription and tips
 *   2. MyMemory (free, no key, allows browser calls). Its machine translation of the exact input is
 *      preferred; a fuzzy translation-memory hit is never used, since it may belong to a different
 *      sentence (it once dropped "with milk")
 *   3. the browser's on-device Translator API (Chrome) when offline or the free daily quota is used up
 * Montenegrin has no translation engine of its own: it goes through Bosnian (Ijekavian, kafa, hljeb)
 * and then gets the Montenegrin forms (sutra → sjutra, kava → kafa…).
 */

export type NativeLang = Lang;

/** Engine language of each interface language (Montenegrin goes through Bosnian, like the course). */
const NATIVE_ENGINE: Record<Lang, string> = { he: 'he', en: 'en', pl: 'pl', cnr: 'bs' };
export type TranslateSource = 'course' | 'online' | 'device';

export interface TranslateResult {
  text: string;
  source: TranslateSource;
  /** Set when the phrase comes from the course. */
  itemId?: string;
}

export type TranslateFailure = 'empty' | 'offline' | 'quota' | 'failed';

export class TranslateError extends Error {
  constructor(public reason: TranslateFailure) {
    super(reason);
  }
}

/** Language codes of each course for the translation engines (Bosnian first for Montenegrin). */
export const ENGINE_LANGS: Record<CourseId, string[]> = { pl: ['pl'], cnr: ['bs', 'hr'], en: ['en'], he: ['he'] };

const MYMEMORY = 'https://api.mymemory.translated.net/get';

/** Lowercase, no niqqud, no punctuation, single spaces – for comparing meanings. */
export function normalizeMeaning(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[֑-ׇ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .toLocaleLowerCase()
    .replace(/[.,!?;:"'„”“«»()\-–—…׳״]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** All the ways an item's meaning is written ("Please / You're welcome / Pardon?" → three). */
function meaningVariants(item: LearningItem, lang: NativeLang): string[] {
  const meaning = itemText(item, lang).meaning;
  return [meaning, ...meaning.split(/\s+\/\s+/)].map(normalizeMeaning).filter(Boolean);
}

/** A course or personal-dictionary item whose meaning is exactly the input. */
export function courseMatch(input: string, lang: NativeLang): LearningItem | undefined {
  const q = normalizeMeaning(input);
  if (!q) return undefined;
  return [...ALL_ITEMS, ...getCustomItems()].find((item) => meaningVariants(item, lang).includes(q));
}

/** A course item written exactly like the input (when the learner types the course language). */
export function courseItemByText(input: string): LearningItem | undefined {
  const q = normalizeMeaning(input);
  return q ? [...ALL_ITEMS, ...getCustomItems()].find((item) => normalizeMeaning(item.polish) === q) : undefined;
}

/** Croatian / Bosnian forms that Montenegrin says differently. */
const MONTENEGRIN_FORMS: Record<string, string> = {
  sutra: 'sjutra',
  prekosutra: 'prekosjutra',
  kava: 'kafa',
  kave: 'kafe',
  kavu: 'kafu',
  kavom: 'kafom',
  kahva: 'kafa',
  kahve: 'kafe',
  kahvu: 'kafu',
  kahvom: 'kafom',
  kruh: 'hljeb',
  kruha: 'hljeba',
  kruhom: 'hljebom',
  tisuća: 'hiljada',
  tisuću: 'hiljadu',
  tisuće: 'hiljade',
  vlak: 'voz',
  vlaka: 'voza',
  vlakom: 'vozom',
  točno: 'tačno',
  glazba: 'muzika',
  glazbu: 'muziku',
  kolodvor: 'stanica',
  historija: 'istorija',
  lahko: 'lako',
  tko: 'ko',
  sretan: 'srećan',
  sretna: 'srećna',
  sretno: 'srećno',
  kazalište: 'pozorište',
  juha: 'supa',
  juhu: 'supu',
  krumpir: 'krompir',
  zrakoplov: 'avion',
  tjedan: 'sedmica',
};

/** Give a Bosnian / Croatian translation its Montenegrin forms, keeping capitals. */
export function toMontenegrin(text: string): string {
  return text.replace(/\p{L}+/gu, (word) => {
    const lower = word.toLocaleLowerCase('hr');
    const m = MONTENEGRIN_FORMS[lower];
    if (!m) return word;
    if (word === word.toLocaleUpperCase('hr') && word.length > 1) return m.toLocaleUpperCase('hr');
    return word[0] !== lower[0] ? m[0].toLocaleUpperCase('hr') + m.slice(1) : m;
  });
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

interface MyMemoryMatch {
  segment?: string;
  translation?: string;
  match?: number | string;
  'created-by'?: string;
}

interface MyMemoryResponse {
  responseStatus?: number | string;
  responseData?: { translatedText?: string; match?: number | string };
  matches?: MyMemoryMatch[];
}

/** Pick the right translation out of a MyMemory response (exported for tests). */
export function pickMyMemory(query: string, data: MyMemoryResponse): string {
  const status = Number(data.responseStatus ?? 200);
  const top = data.responseData?.translatedText ?? '';
  if (status === 429 || /MYMEMORY WARNING|QUOTA/i.test(top)) throw new TranslateError('quota');
  if (status !== 200) throw new TranslateError('failed');
  const q = normalizeMeaning(query);
  const matches = data.matches ?? [];
  const exact = matches.find((m) => Number(m.match) >= 0.99 && normalizeMeaning(m.segment ?? '') === q && m.translation);
  const machine = matches.find((m) => m['created-by'] === 'MT!' && m.translation);
  const text = exact?.translation ?? machine?.translation ?? (Number(data.responseData?.match) >= 0.99 || !matches.length ? top : '');
  if (!text.trim()) throw new TranslateError('failed');
  return decodeEntities(text).trim();
}

async function viaMyMemory(text: string, from: string, to: string): Promise<string> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new TranslateError('offline');
  let res: Response;
  try {
    res = await fetch(`${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
  } catch {
    throw new TranslateError(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'failed');
  }
  if (res.status === 429) throw new TranslateError('quota');
  if (!res.ok) throw new TranslateError('failed');
  return pickMyMemory(text, (await res.json()) as MyMemoryResponse);
}

interface BrowserTranslator {
  availability(o: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
  create(o: { sourceLanguage: string; targetLanguage: string }): Promise<{ translate(text: string): Promise<string> }>;
}

const DEVICE_TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
}

/**
 * Chrome's on-device Translator API – only with a language model that is already installed (a model
 * download can take minutes, and the learner would be left waiting), and never longer than 8 s.
 */
async function viaDevice(text: string, from: string, targets: string[]): Promise<{ text: string; lang: string } | null> {
  const T = (globalThis as unknown as { Translator?: BrowserTranslator }).Translator;
  if (!T?.availability) return null;
  for (const to of targets) {
    try {
      const pair = { sourceLanguage: from, targetLanguage: to };
      if ((await withTimeout(T.availability(pair), DEVICE_TIMEOUT_MS)) !== 'available') continue;
      const translator = await withTimeout(T.create(pair), DEVICE_TIMEOUT_MS);
      const out = (await withTimeout(translator.translate(text), DEVICE_TIMEOUT_MS)).trim();
      if (out) return { text: out, lang: to };
    } catch {
      // Not usable on this device right now: try the next language, then give up.
    }
  }
  return null;
}

/** Translate from the learner's language into the active course language. */
export async function translateToCourse(input: string, from: NativeLang, course: CourseId = COURSE): Promise<TranslateResult> {
  const text = input.trim();
  if (!text) throw new TranslateError('empty');
  if (course === COURSE) {
    const item = courseMatch(text, from);
    if (item) return { text: item.polish, source: 'course', itemId: item.id };
  }
  const targets = ENGINE_LANGS[course];
  const finish = (out: string) => (course === 'cnr' ? toMontenegrin(out) : out);
  try {
    return { text: finish(await viaMyMemory(text, NATIVE_ENGINE[from], targets[0])), source: 'online' };
  } catch (e) {
    const device = await viaDevice(text, NATIVE_ENGINE[from], targets);
    if (device) return { text: finish(device.text), source: 'device' };
    throw e instanceof TranslateError ? e : new TranslateError('failed');
  }
}

/** Meaning of a course-language phrase in the learner's language (when the learner typed the phrase itself). */
export async function translateFromCourse(input: string, to: NativeLang, course: CourseId = COURSE): Promise<TranslateResult> {
  const text = input.trim();
  if (!text) throw new TranslateError('empty');
  if (course === COURSE) {
    const item = courseItemByText(text);
    if (item) return { text: itemText(item, to).meaning, source: 'course', itemId: item.id };
  }
  const from = ENGINE_LANGS[course][0];
  const into = NATIVE_ENGINE[to];
  const finish = (out: string) => (to === 'cnr' ? toMontenegrin(out) : out);
  try {
    return { text: finish(await viaMyMemory(text, from, into)), source: 'online' };
  } catch (e) {
    const device = await viaDevice(text, from, [into]);
    if (device) return { text: finish(device.text), source: 'device' };
    throw e instanceof TranslateError ? e : new TranslateError('failed');
  }
}
