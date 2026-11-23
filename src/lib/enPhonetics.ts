/**
 * English phonetics for Hebrew speakers (same API as lib/polishPhonetics and lib/cnrPhonetics).
 *
 * English spelling does not show how a word sounds, so every word of the course has a hand-written
 * entry in data/en/lexicon: its spelling split into syllables and its sound in vocalized Hebrew
 * letters, both in the dataset notation (stressed syllable in brackets, function words without).
 * Inflected forms of lexicon words (tickets, wanted, going) are derived from their base word.
 * Anything else – the learner's own words, free-typed "How do I say…?" phrases – gets a rule-based
 * approximation, which is good enough to read but not hand-checked.
 *
 * Transcription conventions (see EN_LEGEND):
 *   ת׳ = th in "think", ד׳ = th in "this", וו = w, ב = v, בּ = b, ר = American r (tongue curled, not
 *   throaty), ִ (hiriq without yod) = short i in "ship", ִי = long ee in "sheep", ַ (patah) = the
 *   open a of "bad", ֶ = e in "bed", ָ = u in "cup" / o in "hot", וֹ = o in "go", וּ = oo, ֵיי = ay,
 *   ַאי = I / my, ָאוּ = now.
 */

import { EN_LEXICON } from '../data/en/lexicon';
import { EN_SOUND_INFO, soundText, type EnSoundKey, type SoundKey } from '../data/sounds';
import type { Lang } from '../i18n/lang';

interface Entry {
  syl: string;
  he: string;
}

/** Plain text of a notation: "[wa]·ter" → "water". */
const plain = (notation: string) => notation.replace(/[·[\]]/g, '');
const key = (word: string) => word.toLowerCase().replace(/[’‘]/g, "'");

const LEXICON = new Map<string, Entry>();
for (const line of EN_LEXICON.trim().split('\n')) {
  const [syl, he] = line.trim().split(/\s+/);
  if (syl && he) LEXICON.set(key(plain(syl)), { syl, he });
}

/** True when the word has a hand-written entry, directly or as an inflected form (used by the data tests). */
export function inLexicon(word: string): boolean {
  return LEXICON.has(key(word)) || inflect(word) !== null;
}

// --- Hebrew helpers ---------------------------------------------------------------------------

const FINAL: Record<string, string> = { מ: 'ם', נ: 'ן', פ: 'ף', צ: 'ץ', כ: 'ך' };
const UNFINAL: Record<string, string> = { ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ', ך: 'כ' };
const HEB_LETTER = /[א-ת]/;

/** Use the final letter form at the end of a word (נ → ן), unless it carries a dagesh or geresh. */
function finalize(he: string): string {
  const m = he.match(/([מנפצכ])([ְ-ֻ]*)([^א-ת]*)$/);
  if (!m || m[2] || /[ּ׳]/.test(m[3]) || m[3].replace(/[\]·]/g, '')) return he;
  return he.slice(0, m.index) + FINAL[m[1]] + m[3];
}

function unfinalize(he: string): string {
  return he.replace(/[םןףץך](?=[^א-ת]*$)/, (c) => UNFINAL[c]);
}

/** Last sound of a Hebrew transcription, as a letter (niqqud and brackets dropped). */
function lastLetter(he: string): string {
  const letters = he.replace(/[^א-ת׳]/g, '');
  return letters.endsWith('׳') ? letters.slice(-2) : letters.slice(-1);
}

const VOICELESS = new Set(['פ', 'ף', 'ק', 'ט', 'ס', 'ש', 'צ׳', 'ת׳', 'ה']);
const SIBILANT = new Set(['ס', 'ז', 'ש', 'צ׳', 'ג׳', 'ז׳']);

/** Append a sound to the last syllable of a notation ("[טִי]·קֶט" + "ס" → "[טִי]·קֶטס"). */
function appendToLast(he: string, add: string): string {
  const m = he.match(/^(.*?)(\]?)$/)!;
  return finalize(unfinalize(m[1]) + add) + m[2];
}

// --- Inflected forms of lexicon words -----------------------------------------------------------

/** Spelling notation of an inflected word: the base word's syllables fitted to the stem, then the ending. */
function inflectSyl(baseSyl: string, stem: string, ending: string, newSyllable: boolean): string {
  const base = plain(baseSyl);
  let notation = baseSyl;
  if (stem.length > base.length && stem.startsWith(base)) {
    // run → runn(ing): the extra letter joins the last syllable.
    notation = baseSyl.replace(/(\]?)$/, `${stem.slice(base.length)}$1`);
  } else if (stem.length < base.length && base.startsWith(stem)) {
    // make → mak(ing): drop the final e.
    for (let drop = base.length - stem.length; drop > 0; drop--) notation = notation.replace(/[^·[\]](\]?)$/, '$1');
  }
  return newSyllable ? `${notation}·${ending}` : notation.replace(/(\]?)$/, `${ending}$1`);
}

function inflect(word: string): Entry | null {
  const w = key(word);
  // Plural, third person and possessive: -'s, -es, -s.
  for (const ending of ["'s", 'es', 's']) {
    if (!w.endsWith(ending) || w.length <= ending.length + 1) continue;
    const stem = w.slice(0, -ending.length);
    const base = LEXICON.get(stem);
    if (!base) continue;
    const last = lastLetter(base.he);
    if (SIBILANT.has(last)) return { syl: inflectSyl(base.syl, stem, ending, ending === 'es'), he: `${unfinalize(base.he)}·אִיז` };
    return { syl: inflectSyl(base.syl, stem, ending, false), he: appendToLast(base.he, VOICELESS.has(last) ? 'ס' : 'ז') };
  }
  // Past tense: -ed (wanted), -d after a final e (closed), doubled consonant (stopped).
  if (w.endsWith('ed') && w.length > 3) {
    const options: [string, string][] = [
      [w.slice(0, -2), 'ed'],
      [w.slice(0, -1), 'd'],
      [w.slice(0, -3), 'ed'],
    ];
    for (const [b, ending] of options) {
      const base = LEXICON.get(b);
      if (!base) continue;
      const last = lastLetter(base.he);
      // wanted, included: a new syllable "id" (in·clud·ed); otherwise the ending joins the last syllable.
      if (last === 'ט' || last === 'ד') return { syl: inflectSyl(base.syl, w.slice(0, -2), 'ed', true), he: `${unfinalize(base.he)}·אִיד` };
      return { syl: inflectSyl(base.syl, w.slice(0, -ending.length), ending, false), he: appendToLast(base.he, VOICELESS.has(last) ? 'ט' : 'ד') };
    }
  }
  // -ing: go → going, make → making, run → running.
  if (w.endsWith('ing') && w.length > 4) {
    const stem = w.slice(0, -3);
    const base = LEXICON.get(stem) ?? LEXICON.get(`${stem}e`) ?? (stem.at(-1) === stem.at(-2) ? LEXICON.get(stem.slice(0, -1)) : undefined);
    if (base) return { syl: inflectSyl(base.syl, stem, 'ing', true), he: `${unfinalize(base.he)}·אִינְג` };
  }
  return null;
}

// --- Rule-based approximation for words outside the lexicon -------------------------------------

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
/** Unstressed little words when they are not in the lexicon. */
const FUNCTION_WORDS = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'or', 'but', 'at', 'in', 'on', 'for', 'with', 'from', 'by', 'as', 'is', 'are', 'am', 'was', 'be', 'do', 'it', 'me', 'my', 'your', 'can', 'could', 'would', 'some']);

function isVowelAt(w: string, i: number): boolean {
  const c = w[i];
  if (c === 'y') return i > 0 && !VOWELS.has(w[i - 1]);
  return VOWELS.has(c);
}

/** Split a spelling into syllables by its vowel groups (a silent final e is not a syllable). */
function syllabify(word: string): string[] {
  const w = word.toLowerCase();
  const nuclei: [number, number][] = [];
  for (let i = 0; i < w.length; ) {
    if (isVowelAt(w, i)) {
      let j = i + 1;
      while (j < w.length && isVowelAt(w, j) && w[j] !== 'y') j++;
      nuclei.push([i, j]);
      i = j;
    } else i++;
  }
  // Silent final e (make, like) – but "le" after a consonant is a syllable (table).
  const last = nuclei.at(-1);
  if (nuclei.length > 1 && last && last[0] === w.length - 1 && w.endsWith('e') && !/[^aeiou]le$/.test(w)) nuclei.pop();
  if (nuclei.length <= 1) return [word];
  const cuts: number[] = [];
  for (let k = 0; k < nuclei.length - 1; k++) {
    const start = nuclei[k][1];
    const end = nuclei[k + 1][0];
    const cluster = w.slice(start, end);
    let cut: number;
    if (cluster.length <= 1) cut = start;
    else if (['th', 'sh', 'ch', 'ph', 'wh', 'ck', 'ng', 'gh'].includes(cluster.slice(-2)) && cluster.length === 2) cut = cluster === 'ck' || cluster === 'ng' ? end : start;
    else cut = start + Math.floor(cluster.length / 2);
    cuts.push(cut);
  }
  const out: string[] = [];
  let prev = 0;
  for (const c of cuts) {
    out.push(word.slice(prev, c));
    prev = c;
  }
  out.push(word.slice(prev));
  return out.filter(Boolean);
}

const CONSONANTS: [string, string][] = [
  ['tch', 'צ׳'],
  ['th', 'ת׳'],
  ['sh', 'ש'],
  ['ch', 'צ׳'],
  ['ph', 'פ'],
  ['wh', 'וו'],
  ['wr', 'ר'],
  ['kn', 'נ'],
  ['ck', 'ק'],
  ['ng', 'נְג'],
  ['qu', 'קוו'],
  ['gh', ''],
  ['b', 'בּ'],
  ['d', 'ד'],
  ['f', 'פ'],
  ['h', 'ה'],
  ['j', 'ג׳'],
  ['k', 'ק'],
  ['l', 'ל'],
  ['m', 'מ'],
  ['n', 'נ'],
  ['p', 'פּ'],
  ['q', 'ק'],
  ['r', 'ר'],
  ['s', 'ס'],
  ['t', 'ט'],
  ['v', 'ב'],
  ['w', 'וו'],
  ['x', 'קס'],
  ['z', 'ז'],
];

const VOWEL_GROUPS: [string, string][] = [
  ['igh', 'ַאי'],
  ['eigh', 'ֵיי'],
  ['ee', 'ִי'],
  ['ea', 'ִי'],
  ['oo', 'וּ'],
  ['ou', 'ָאוּ'],
  ['ow', 'וֹ'],
  ['ai', 'ֵיי'],
  ['ay', 'ֵיי'],
  ['ey', 'ֵיי'],
  ['oa', 'וֹ'],
  ['oi', 'וֹי'],
  ['oy', 'וֹי'],
  ['au', 'וֹ'],
  ['aw', 'וֹ'],
  ['ew', 'יוּ'],
  ['ie', 'ִי'],
];

const SHORT: Record<string, string> = { a: 'ַ', e: 'ֶ', i: 'ִ', o: 'ָ', u: 'ָ', y: 'ִ' };
const LONG: Record<string, string> = { a: 'ֵיי', e: 'ִי', i: 'ַאי', o: 'וֹ', u: 'יוּ', y: 'ַאי' };

/** Attach a vowel sign to the consonant before it (niqqud goes between a letter and its geresh). */
function attach(out: string[], mark: string): void {
  const prev = out.at(-1);
  if (prev === undefined || prev === '' || !HEB_LETTER.test(prev) || /[ְ-ֻ]/.test(prev.replace(/[ּ]/g, '')) || prev.endsWith('וּ') || prev.endsWith('וֹ')) {
    out.push(mark.startsWith('ו') || mark.startsWith('י') ? `א${mark}` : `א${mark}`);
    return;
  }
  if (prev.endsWith('׳') && /^[ְ-ֻ]/.test(mark)) {
    out[out.length - 1] = prev.slice(0, -1) + mark[0] + '׳' + mark.slice(1);
    return;
  }
  if (prev === 'נְג') {
    out.push(`א${mark}`);
    return;
  }
  out[out.length - 1] = prev + mark;
}

/** Hebrew letters for one spelling syllable (rule-based). */
function syllableToHebrew(syl: string, opts: { open: boolean; magicE: boolean; single: boolean; stressed: boolean }): string {
  const s = syl.toLowerCase().replace(/'/g, '');
  const out: string[] = [];
  let i = 0;
  let vowelDone = false;
  while (i < s.length) {
    const rest = s.slice(i);
    // Silent final e of a magic-e syllable.
    if (rest === 'e' && opts.magicE && vowelDone) break;
    const group = VOWEL_GROUPS.find(([g]) => rest.startsWith(g));
    if (group && (s[i] !== 'y' || i > 0)) {
      attach(out, group[1]);
      vowelDone = true;
      i += group[0].length;
      continue;
    }
    const c = s[i];
    if (VOWELS.has(c) && (c !== 'y' || (i > 0 && !VOWELS.has(s[i - 1])))) {
      const r = s[i + 1] === 'r' && !VOWELS.has(s[i + 2] ?? '');
      let mark: string;
      if (r) mark = c === 'a' ? 'ָ' : c === 'o' ? 'וֹ' : 'ֶ';
      else if (c === 'y' && i === s.length - 1) mark = opts.single ? 'ַאי' : 'ִי';
      else if (opts.magicE || (opts.open && i === s.length - 1 && opts.stressed)) mark = LONG[c];
      else if (!opts.stressed && !opts.single) mark = c === 'i' || c === 'y' ? 'ִ' : 'ֶ';
      else mark = SHORT[c];
      attach(out, mark);
      vowelDone = true;
      i++;
      continue;
    }
    let cons = CONSONANTS.find(([g]) => rest.startsWith(g));
    if (c === 'c') cons = /^c[eiy]/.test(rest) ? ['c', 'ס'] : ['c', 'ק'];
    if (c === 'g' && /^ge$/.test(rest)) cons = ['g', 'ג׳'];
    else if (c === 'g') cons = ['g', 'ג'];
    if (c === 'y') cons = ['y', 'י'];
    if (!cons) {
      i++;
      continue;
    }
    // A doubled consonant is one sound (letter, coffee).
    if (cons[0].length === 1 && s[i + 1] === c) i++;
    if (cons[1]) out.push(cons[1]);
    i += cons[0].length;
  }
  if (!vowelDone && out.length) out[0] = out[0] + 'ֶ';
  return out.join('');
}

function ruleEntry(word: string): Entry {
  const w = word.toLowerCase();
  const sylls = syllabify(word);
  const magicE = /[aeiou][^aeiouwy]e$/.test(w) && !/[^aeiou]le$/.test(w);
  const prefixed = sylls.length > 1 && /^(a|be|re|de|ex|un|com|con|for)$/.test(sylls[0].toLowerCase());
  const stressAt = sylls.length === 1 ? (FUNCTION_WORDS.has(w) ? -1 : 0) : prefixed ? 1 : 0;
  const he = sylls.map((s, k) => {
    const last = k === sylls.length - 1;
    const open = !last && VOWELS.has(s.at(-1)!.toLowerCase());
    return syllableToHebrew(s, { open: open || (last && sylls.length === 1 && /[aeiou]$/.test(w) && w.length <= 3), magicE: last && magicE, single: sylls.length === 1, stressed: k === stressAt });
  });
  const mark = (parts: string[]) => parts.map((p, k) => (k === stressAt ? `[${p}]` : p)).join('·');
  return { syl: mark(sylls), he: finalize(mark(he)) };
}

// --- Phrases -----------------------------------------------------------------------------------

interface Token {
  lead: string;
  core: string;
  trail: string;
}

function splitTokens(text: string): Token[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^([^\p{L}{]*)(.*?)([^\p{L}}]*)$/u)!;
      return { lead: m[1], core: m[2], trail: m[3] };
    });
}

/** Put the word's own capitals back onto the lexicon notation ("hello" notation for "Hello"). */
function applyCase(notation: string, word: string): string {
  let j = 0;
  return notation.replace(/[^·[\]]/g, (ch) => word[j++] ?? ch);
}

function wordEntry(core: string): Entry {
  if (!core || core.startsWith('{')) return { syl: core, he: core };
  // Compounds written with a hyphen (check-out, Wi-Fi): each part on its own.
  if (core.includes('-')) {
    const parts = core.split('-').map((p) => wordEntry(p));
    return { syl: parts.map((p) => p.syl).join('-'), he: parts.map((p) => p.he).join('-') };
  }
  const found = LEXICON.get(key(core)) ?? inflect(core) ?? ruleEntry(core.replace(/[’']/g, ''));
  const syl = plain(found.syl).length === core.length ? applyCase(found.syl, core) : found.syl;
  return { syl, he: found.he };
}

/** Syllable notation of an English phrase: "Thank you" → "[Thank] you". */
export function toSyllableNotation(text: string): string {
  return splitTokens(text)
    .map((t) => t.lead + wordEntry(t.core).syl + t.trail)
    .join(' ');
}

/** Vocalized Hebrew transcription with stress: "Thank you" → "[ת׳ֶנְק] יוּ". */
export function toHebrewPhonetic(text: string): string {
  return splitTokens(text)
    .map((t) => wordEntry(t.core).he)
    .filter(Boolean)
    .join(' ');
}

/** English respelling (shown only in an English interface, which this course does not offer). */
export function toEnglishPhonetic(text: string): string {
  return toSyllableNotation(text).replace(/[.,!?]/g, '');
}

// --- Sounds, backchaining and tips ---------------------------------------------------------------

const SOUND_PATTERNS: [EnSoundKey, RegExp][] = [
  ['th', /[תד][ְ-ֻ]*׳/],
  ['w', /ו(?![ְ-ֹּ])ו/],
  ['v', /ב(?![ְ-ֻ]*ּ)/],
  ['r', /ר/],
  ['ih', /ִ(?!י)/],
  ['ee', /ִי/],
  ['ae', /ַ(?!א?י)/],
];

/** Hard-for-Hebrew-speakers sounds in a phrase, read from its Hebrew transcription. */
export function detectSounds(text: string): SoundKey[] {
  const he = toHebrewPhonetic(text).normalize('NFC');
  // Vowel signs are read without the dagesh, which may sit between a hiriq and its yod (בִּי).
  const vowels = he.replace(/ּ/g, '');
  return SOUND_PATTERNS.filter(([k, re]) => re.test(k === 'ih' || k === 'ee' || k === 'ae' ? vowels : he)).map(([k]) => k);
}

/** English has no special letters (used for the diacritics hint of the writing exercise). */
export function letterSound(_letter: string): SoundKey | null {
  return null;
}

/** Three steps from the end of the phrase to all of it (back-chaining). */
export function autoBackchain(text: string): [string, string, string] {
  const clean = text.trim().replace(/[.,!?]+$/, '');
  const words = clean.split(/\s+/);
  if (words.length >= 3) return [words[words.length - 1], words.slice(-2).join(' '), clean];
  if (words.length === 2) return [words[1], words[0], clean];
  const sylls = plain(toSyllableNotation(clean).replace(/·/g, '|')).split('|');
  if (sylls.length >= 3) return [sylls[sylls.length - 1], sylls.slice(-2).join(''), clean];
  if (sylls.length === 2) return [sylls[1], sylls[0], clean];
  const nucleus = clean.search(/[aeiouy]/i);
  const rime = nucleus > 0 ? clean.slice(nucleus) : clean.slice(-2);
  const tail = clean.length > rime.length + 1 ? clean.slice(1) : clean;
  return [rime, tail, clean];
}

const STRESS_ON: Record<Lang, string> = { he: 'ההטעמה על:', en: 'Stress on:', pl: 'Akcent na:', cnr: 'Naglasak je na:' };
const LISTEN: Record<Lang, string> = {
  he: 'הקשיבו לדוברת וחזרו לאט, הברה אחר הברה.',
  en: 'Listen to the speaker and repeat slowly, syllable by syllable.',
  pl: 'Posłuchaj lektorki i powtarzaj powoli, sylaba po sylabie.',
  cnr: 'Poslušajte govornicu i ponavljajte polako, slog po slog.',
};

/** Pronunciation tip for a learner-added phrase: its hard sounds, then where the stress is. */
export function autoTip(text: string, lang: Lang = 'he'): string {
  const parts = detectSounds(text)
    .slice(0, 3)
    .map((s) => EN_SOUND_INFO[s as EnSoundKey])
    .filter(Boolean)
    .map((info) => soundText(info, lang).tip);
  const stressed = [...toSyllableNotation(text).matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  if (stressed.length) parts.push(`${STRESS_ON[lang]} ${stressed.join(', ')}.`);
  return parts.join(' ') || LISTEN[lang];
}
