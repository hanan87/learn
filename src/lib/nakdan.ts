import { COURSE } from './course';
import { isKnownWord, stripNiqqud } from './hePhonetics';

/**
 * Automatic niqqud for Hebrew the course does not know (Hebrew course, "How do I say…?").
 *
 * Unvocalized words outside the lexicon are guessed (a rough "~" reading, or a split into prefixes and a
 * lexicon word), and words that read two ways (אוכל) need context. Dicta's Nakdan (the Israel
 * Center for Text Analysis – free, no account or key, and it answers browsers directly) adds the vowel
 * signs in context; the vocalized words are then split into syllables and transcribed by rule
 * (lib/hePhonetics). Only words whose reading is not certain are replaced, and only when Dicta kept their
 * letters, so the text never changes – it gains vowel signs. Without a network, or if Dicta fails,
 * the text stays as it was (with the "~" transcription), and Dicta is left alone for two minutes.
 */

export const NAKDAN_URL = 'https://nakdan-2-0.loadbalancer.dicta.org.il/api';

const CACHE_KEY = 'polish-learn:nakdan:v1';
const CACHE_SIZE = 100;
const TIMEOUT_MS = 8000;
const PAUSE_MS = 2 * 60 * 1000;

let pausedUntil = 0;
let memory: Record<string, string> | null = null;

/** Hebrew words of a text with their position (letters, vowel signs, geresh and gershayim). */
const WORD = /[א-ת֑-ׇ'"׳״]+/g;

/** True when the active course is Hebrew and the reading of some word would be a guess. */
export function needsNiqqud(text: string): boolean {
  if (COURSE !== 'he') return false;
  return (text.normalize('NFC').match(WORD) ?? []).some((w) => !isKnownWord(w.replace(/^['"]+|['"]+$/g, '')));
}

/** One token of Dicta's answer: a word with its vowelled options (best first), or a separator. */
export interface NakdanToken {
  word: string;
  sep: boolean;
  options?: unknown[];
}

/** Dicta's best reading of a word: the first option, without its prefix bars (וְהַ|כֶּלֶב). */
function bestOption(t: NakdanToken): string | null {
  const first = t.options?.[0];
  const text = Array.isArray(first) ? first[0] : first;
  return typeof text === 'string' ? text.replace(/\|/g, '').normalize('NFC') : null;
}

/**
 * Put Dicta's vowel signs on the words whose reading is not certain; everything else stays exactly as
 * typed. Returns null when nothing could be vocalized.
 */
export function applyNakdan(text: string, tokens: NakdanToken[]): string | null {
  const vowelled = new Map<string, string>();
  for (const t of tokens) {
    if (t.sep || !t.word) continue;
    const best = bestOption(t);
    // Dicta must keep the letters: it adds vowel signs, never spelling changes.
    if (best && stripNiqqud(best) === stripNiqqud(t.word) && best !== t.word.normalize('NFC')) vowelled.set(t.word.normalize('NFC'), best);
  }
  let changed = false;
  const out = text.normalize('NFC').replace(WORD, (w) => {
    // Quotation marks around a word are not part of it (gershayim inside one are: ש"ח).
    const [, lead, core, trail] = w.match(/^(['"]*)(.*?)(['"]*)$/s)!;
    if (isKnownWord(core)) return w;
    const v = vowelled.get(core);
    if (!v) return w;
    changed = true;
    return lead + v + trail;
  });
  return changed ? out : null;
}

function readCache(): Record<string, string> {
  if (memory) return memory;
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
    memory = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    memory = {};
  }
  return memory!;
}

function writeCache(key: string, value: string): void {
  const cache = readCache();
  delete cache[key];
  cache[key] = value;
  const keys = Object.keys(cache);
  for (const k of keys.slice(0, Math.max(0, keys.length - CACHE_SIZE))) delete cache[k];
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage disabled: the cache lasts for this session only.
  }
}

/**
 * The text with vowel signs on the words whose reading is not certain, or null when there is nothing
 * to add or Dicta cannot be reached.
 */
export async function addNiqqud(text: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  if (!needsNiqqud(text)) return null;
  const key = text.normalize('NFC').trim();
  const cached = readCache()[key];
  if (cached) return cached;
  if (Date.now() < pausedUntil) return null;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // A plain-text body keeps this a simple request (no CORS preflight).
    const res = await fetchImpl(NAKDAN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ task: 'nakdan', data: key, genre: 'modern', addmorph: true, keepqq: false, nodageshdefmem: false, patachma: false, keepmetagim: true }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`nakdan ${res.status}`);
    const tokens = (await res.json()) as NakdanToken[];
    if (!Array.isArray(tokens)) throw new Error('nakdan: unexpected answer');
    const out = applyNakdan(key, tokens);
    if (out) writeCache(key, out);
    return out;
  } catch {
    pausedUntil = Date.now() + PAUSE_MS;
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Tests: forget the pause and the in-memory cache. */
export function resetNakdan(): void {
  pausedUntil = 0;
  memory = null;
}
