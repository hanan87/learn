import type { Lang } from '../i18n/lang';
import { COURSE } from './course';

/**
 * Latin respelling of English for Polish and Montenegrin speakers, written with their own letters
 * (Polish: sz cz ż dż ł w j y; Montenegrin: š č ž dž v j).
 *
 * It is derived from the vocalized Hebrew transcription (data/en/lexicon via lib/enPhonetics), which
 * is hand-written per word and marks exactly the contrasts that matter: th / dh, w vs v, short i vs
 * long ee, the open a of "bad". So every course word gets the same, checked sounds in all three
 * interfaces, and the syllable notation (· and [stress]) carries over unchanged.
 *
 *   Hebrew   Polish   Montenegrin   sound
 *   ת׳       th       th            think (voiceless)
 *   ד׳       dh       dh            this (voiced)
 *   וו       ł        w             w (rounded lips)
 *   ב        w        v             v
 *   ִ        y        i             short i (ship)
 *   ִי       i        ii            long ee (sheep)
 *   ַ        æ        æ             open a (bad)
 *   ָ        a        a             cup / hot
 *   ֶ        e        e             bed, weak "uh"
 *   ֵיי      ej       ej            day
 *   ַי       aj       aj            my
 *   ָאוּ     ał       au            now
 *   וֹ       o / ou   o / ou        call / go (ou at the end of a syllable)
 *   וּ       u        u             food
 *   ש        sz       š
 *   צ׳       cz       č
 *   ג׳       dż       dž
 *   ז׳       ż        ž
 *   י        j        j             yes
 */

export type RespellLang = Exclude<Lang, 'he' | 'en'>;

/**
 * Hebrew course: its transcription is already Latin, written English-style (sh kh ts ch j zh y,
 * ai / ei – lib/hePhonetics). Polish and Montenegrin speakers get it in their own letters:
 *
 *   Latin   Polish   Montenegrin   Hebrew
 *   sh      sz       š             שׁ
 *   kh      ch       h             ח כ
 *   ts      c        c             צ
 *   ch      cz       č             צ׳
 *   j       dż       dž            ג׳
 *   zh      ż        ž             ז׳
 *   y       j        j             י
 *   v       w        v             ב ו
 *   ai, ei  aj, ej   aj, ej        ַי ֵי
 */
const HE_LATIN: Record<RespellLang, Record<string, string>> = {
  pl: { sh: 'sz', kh: 'ch', ts: 'c', ch: 'cz', j: 'dż', zh: 'ż', y: 'j', v: 'w', ai: 'aj', ei: 'ej', oi: 'oj', ui: 'uj' },
  cnr: { sh: 'š', kh: 'h', ts: 'c', ch: 'č', j: 'dž', zh: 'ž', y: 'j', ai: 'aj', ei: 'ej', oi: 'oj', ui: 'uj' },
};

/** The Hebrew course's Latin transcription in Polish / Montenegrin letters ("sha·[lom]" → "sza·[lom]"). */
export function respellHebrewLatin(latin: string, lang: RespellLang): string {
  const map = HE_LATIN[lang];
  return latin.replace(/sh|kh|ts|ch|zh|ai|ei|oi|ui|j|y|v/g, (m) => map[m] ?? m);
}

const SHVA = 'ְ';
const HATAF_SEGOL = 'ֱ';
const HATAF_PATAH = 'ֲ';
const HATAF_QAMATS = 'ֳ';
const HIRIQ = 'ִ';
const TSERE = 'ֵ';
const SEGOL = 'ֶ';
const PATAH = 'ַ';
const QAMATS = 'ָ';
const HOLAM = 'ֹ';
const HOLAM_VAV = 'ֺ';
const QUBUTS = 'ֻ';
const DAGESH = 'ּ';
const GERESH = /[׳'׳]/;

interface Unit {
  letter: string;
  dagesh: boolean;
  geresh: boolean;
  vowel: string;
}

/** Split Hebrew text into letters with their marks; anything else (· [ ] space -) is passed through as is. */
function parse(he: string): (Unit | string)[] {
  const out: (Unit | string)[] = [];
  for (const ch of he.normalize('NFD')) {
    const last = out.at(-1);
    if (/[א-ת]/.test(ch)) out.push({ letter: ch, dagesh: false, geresh: false, vowel: '' });
    else if (typeof last === 'object' && ch === DAGESH) last.dagesh = true;
    else if (typeof last === 'object' && GERESH.test(ch)) last.geresh = true;
    // A shva only marks a consonant without a vowel.
    else if (typeof last === 'object' && ch === SHVA) continue;
    else if (typeof last === 'object' && /[ֱ-ֻ]/.test(ch)) last.vowel = ch;
    else if (typeof last === 'object' && /[ׁׂ]/.test(ch)) continue;
    else out.push(ch);
  }
  return out;
}

const FINALS: Record<string, string> = { ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ', ך: 'כ' };

interface Letters {
  th: string;
  dh: string;
  w: string;
  v: string;
  sh: string;
  ch: string;
  j: string;
  zh: string;
  shortI: string;
  longI: string;
  now: string;
}

const LETTERS: Record<RespellLang, Letters> = {
  pl: { th: 'th', dh: 'dh', w: 'ł', v: 'w', sh: 'sz', ch: 'cz', j: 'dż', zh: 'ż', shortI: 'y', longI: 'i', now: 'ał' },
  cnr: { th: 'th', dh: 'dh', w: 'w', v: 'v', sh: 'š', ch: 'č', j: 'dž', zh: 'ž', shortI: 'i', longI: 'ii', now: 'au' },
};

function consonant(u: Unit, L: Letters): string {
  const letter = FINALS[u.letter] ?? u.letter;
  switch (letter) {
    case 'ת':
      return u.geresh ? L.th : 't';
    case 'ד':
      return u.geresh ? L.dh : 'd';
    case 'ב':
      return u.dagesh ? 'b' : L.v;
    case 'ג':
      return u.geresh ? L.j : 'g';
    case 'ז':
      return u.geresh ? L.zh : 'z';
    case 'צ':
      return u.geresh ? L.ch : 'c';
    case 'ש':
      return L.sh;
    case 'פ':
      return u.dagesh ? 'p' : 'f';
    case 'כ':
    case 'ק':
      return 'k';
    case 'ח':
      return 'h';
    case 'ה':
      return 'h';
    case 'ט':
      return 't';
    case 'ל':
      return 'l';
    case 'מ':
      return 'm';
    case 'נ':
      return 'n';
    case 'ס':
      return 's';
    case 'ר':
      return 'r';
    case 'י':
      return 'j';
    case 'א':
    case 'ע':
      return '';
    default:
      return '';
  }
}

function vowel(mark: string, L: Letters): string {
  switch (mark) {
    case HIRIQ:
      return L.shortI;
    case TSERE:
    case SEGOL:
    case HATAF_SEGOL:
      return 'e';
    case PATAH:
    case HATAF_PATAH:
      return 'æ';
    case QAMATS:
    case HATAF_QAMATS:
      return 'a';
    case HOLAM:
    case HOLAM_VAV:
      return 'o';
    case QUBUTS:
      return 'u';
    default:
      return '';
  }
}

/** True when the unit sits at the end of its syllable (next is a boundary or nothing). */
function syllableEnd(units: (Unit | string)[], i: number): boolean {
  const next = units[i + 1];
  return next === undefined || (typeof next === 'string' && /[·\]\s-]/.test(next));
}

/**
 * וֹ is "o" in call / corner and "ou" in go / hello / slow·er: the long "ou" is written where the
 * syllable is open – at the end of the word, or before a syllable that starts with a vowel.
 */
function openO(units: (Unit | string)[], i: number): boolean {
  let j = i + 1;
  while (units[j] === ']') j++;
  const next = units[j];
  if (next === undefined || (typeof next === 'string' && /[\s-]/.test(next))) return true;
  if (next !== '·') return false;
  const after = units[j + 1] === '[' ? units[j + 2] : units[j + 1];
  return typeof after === 'object' && after.letter === 'א';
}

/**
 * Latin respelling of a Hebrew transcription in the dataset notation ("[ת׳ֶנְק] יוּ" → "[thenk] ju"
 * in Polish). Square brackets and "·" are kept, so the stressed syllable is still marked.
 */
export function respell(he: string, lang: RespellLang): string {
  if (COURSE === 'he') return respellHebrewLatin(he, lang);
  const L = LETTERS[lang];
  const units = parse(he);
  let out = '';
  let stressed = false;
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (typeof u === 'string') {
      if (u === '[') stressed = true;
      if (u === ']') stressed = false;
      out += u;
      continue;
    }
    const next = units[i + 1];
    const nextUnit = typeof next === 'object' ? next : null;

    if (u.letter === 'ו') {
      // וּ = u, וֹ = o (ou at the end of a syllable, as in "go"), וו = w.
      if (u.dagesh) {
        out += 'u';
        continue;
      }
      if (u.vowel === HOLAM || u.vowel === HOLAM_VAV) {
        out += openO(units, i) ? 'ou' : 'o';
        continue;
      }
      if (nextUnit?.letter === 'ו' && !nextUnit.dagesh && nextUnit.vowel !== HOLAM && nextUnit.vowel !== HOLAM_VAV) {
        out += L.w + vowel(nextUnit.vowel, L);
        i++;
        continue;
      }
      out += L.w + vowel(u.vowel, L);
      continue;
    }

    if (u.letter === 'י' && !u.vowel && !u.dagesh) {
      // A yod without a vowel lengthens the vowel before it: ִי = ee, ֵיי = ay, ַי = eye.
      const prev = units[i - 1];
      const prevVowel = typeof prev === 'object' ? prev.vowel : '';
      if (prevVowel === HIRIQ) {
        // Montenegrin marks the long ee only where it matters, in the stressed syllable (ship / sheep).
        out = out.slice(0, -L.shortI.length) + (lang === 'cnr' && !stressed ? 'i' : L.longI);
        continue;
      }
      if (prevVowel === TSERE) {
        out += 'j';
        if (nextUnit?.letter === 'י' && !nextUnit.vowel) i++;
        continue;
      }
      if (prevVowel === PATAH || prevVowel === QAMATS) {
        // ַי = "aj" (my): the open-a mark becomes a plain a before the glide.
        if (prevVowel === PATAH) out = out.replace(/æ$/, 'a');
        out += 'j';
        continue;
      }
      if (prev === undefined || typeof prev === 'string') {
        // Word-initial yod with the vowel on the following alef-less letter: treat as j.
        out += 'j';
        continue;
      }
      out += 'j';
      continue;
    }

    if (u.letter === 'א' && !u.vowel) {
      // Alef carrying a following וּ / י: just a vowel holder.
      continue;
    }
    if (u.letter === 'ה' && !u.vowel && syllableEnd(units, i)) {
      // A final he after a vowel is silent ("the" = דֶ׳ה).
      continue;
    }

    // ָאוּ = "now": qamats + alef + shuruq.
    if (u.vowel === QAMATS && nextUnit?.letter === 'א' && !nextUnit.vowel) {
      const after = units[i + 2];
      if (typeof after === 'object' && after.letter === 'ו' && after.dagesh) {
        out += consonant(u, L) + L.now;
        i += 2;
        continue;
      }
    }
    // ַאי = "I": patah + alef + yod.
    if (u.vowel === PATAH && nextUnit?.letter === 'א' && !nextUnit.vowel) {
      const after = units[i + 2];
      if (typeof after === 'object' && after.letter === 'י' && !after.vowel) {
        out += consonant(u, L) + 'aj';
        i += 2;
        continue;
      }
    }

    out += consonant(u, L) + vowel(u.vowel, L);
  }
  return out.normalize('NFC');
}
