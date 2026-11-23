/**
 * Rule-based Montenegrin phonetics (same API as lib/polishPhonetics):
 *   - tokenizer for the Latin alphabet: digraphs dž / lj / nj, the Ijekavian "ije" (one syllable,
 *     said "ye"), and syllabic r (crno, Trg) acting as the vowel of its syllable
 *   - syllabification in the dataset notation "do·[vi]·đe·nja"; stress defaults to the first syllable
 *     (Montenegrin stress is free but never final in native words), with a short list of exceptions
 *   - Hebrew and English transcription rendered FROM the syllable notation, so hand-written
 *     syllables and stress are reflected exactly
 *   - sound detection, backchaining steps and articulation tips for learner-added words
 * Montenegrin is spelled as it is pronounced and has no devoicing in speech beyond what the spelling
 * already shows, which keeps these rules much simpler than the Polish ones.
 */

import { CNR_SOUND_INFO, type CnrSoundKey, type SoundKey } from '../data/sounds';
import type { Lang } from '../i18n/lang';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const DIGRAPHS = ['dž', 'lj', 'nj'];
const SOFT = new Set(['ć', 'đ', 'lj', 'nj', 'ś', 'ź']);
const SONORANTS = new Set(['r', 'l', 'lj', 'm', 'n', 'nj', 'j']);
/** A cluster splits before these (jed·nu, des·no, živ·je·li). */
const SPLIT_BEFORE = new Set(['m', 'n', 'nj', 'j', 'lj']);
const CLITICS = new Set([
  'je', 'sam', 'si', 'smo', 'ste', 'su', 'se', 'mi', 'ti', 'me', 'te', 'ga', 'mu', 'joj', 'im', 'nam', 'vam',
  'li', 'bih', 'bi', 'i', 'a', 'u', 'na', 'od', 'do', 'za', 's', 'sa', 'k', 'ka', 'o', 'po', 'iz', 'bez', 'kod', 'uz', 'ne', 'ni',
]);
/** Words whose stress is not on the first syllable (index of the stressed syllable). */
const STRESS: Record<string, number> = { doviđenja: 1, izvinite: 1, izvolite: 1, espreso: 1, restoran: 1, turista: 1, recepcija: 1, informacije: 2 };

export interface Token {
  /** Lowercase grapheme: "dž", "a", "ije", "r"… */
  g: string;
  orig: string;
  /** Syllable nucleus: a vowel, "ije" or a syllabic r. */
  vowel: boolean;
}

interface Word {
  lead: string;
  trail: string;
  tokens: Token[];
}

function tokenizeCore(word: string): Token[] {
  const lower = word.toLocaleLowerCase('sr-Latn');
  const toks: Token[] = [];
  let i = 0;
  while (i < lower.length) {
    const prev = toks[toks.length - 1];
    // Ijekavian ije after a consonant is one syllable ("lije·po" = lye·po).
    if (lower.startsWith('ije', i) && prev && !prev.vowel) {
      toks.push({ g: 'ije', orig: word.slice(i, i + 3), vowel: true });
      i += 3;
      continue;
    }
    const two = lower.slice(i, i + 2);
    const g = DIGRAPHS.includes(two) ? two : lower[i];
    toks.push({ g, orig: word.slice(i, i + g.length), vowel: VOWELS.has(g) });
    i += g.length;
  }
  // r between consonants (or at a word edge next to a consonant) carries the syllable: crno, Trg, rđa.
  toks.forEach((t, k) => {
    if (t.g !== 'r') return;
    const p = toks[k - 1];
    const n = toks[k + 1];
    if ((!p || !p.vowel) && (!n || !n.vowel) && (p || n)) t.vowel = true;
  });
  return toks;
}

function splitWords(text: string): Word[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^([^\p{L}]*)(.*?)([^\p{L}]*)$/u)!;
      return { lead: m[1], trail: m[3], tokens: tokenizeCore(m[2]) };
    });
}

function syllabify(toks: Token[]): Token[][] {
  const nuclei = toks.map((t, i) => (t.vowel ? i : -1)).filter((i) => i >= 0);
  if (nuclei.length === 0) return toks.length ? [toks] : [];
  const lower = toks.map((t) => t.g).join('');
  const sylls: Token[][] = [];
  let start = 0;
  for (let n = 0; n < nuclei.length; n++) {
    const v = nuclei[n];
    const nextV = nuclei[n + 1];
    if (nextV === undefined) {
      sylls.push(toks.slice(start));
      break;
    }
    const consonants = nextV - v - 1;
    // The prefix iz- stays whole before a consonant: iz·vi·ni·te.
    const prefix = n === 0 && v === 0 && lower.startsWith('iz') && consonants >= 2;
    const splitAfterFirst = consonants >= 2 && (prefix || SONORANTS.has(toks[v + 1].g) || SPLIT_BEFORE.has(toks[v + 2].g));
    const cut = splitAfterFirst ? v + 2 : v + 1;
    sylls.push(toks.slice(start, cut));
    start = cut;
  }
  return sylls;
}

function stressIndex(sylls: Token[][], wordLower: string): number {
  if (sylls.length === 0) return -1;
  if (sylls.length === 1) return CLITICS.has(wordLower) ? -1 : 0;
  return Math.min(STRESS[wordLower] ?? 0, sylls.length - 1);
}

function analyze(text: string) {
  return splitWords(text).map((word) => {
    const sylls = syllabify(word.tokens);
    const lower = word.tokens.map((t) => t.g).join('');
    return { word, sylls, stress: stressIndex(sylls, lower) };
  });
}

/** Syllable notation with the stressed syllable in brackets: "do·[vi]·đe·nja". */
export function toSyllableNotation(text: string): string {
  return analyze(text)
    .map(({ word, sylls, stress }) => {
      const parts = sylls.map((s, i) => {
        const t = s.map((tok) => tok.orig).join('');
        return i === stress ? `[${t}]` : t;
      });
      return word.lead + parts.join('·') + word.trail;
    })
    .join(' ');
}

// ---------- Rendering from the notation ----------

const SHVA = 'ְ';
const HE: Record<string, [string, string]> = {
  b: ['בּ', ''],
  c: ['צ', ''],
  č: ['צ', '׳'],
  ć: ['צ', '׳'],
  d: ['ד', ''],
  dž: ['ג', '׳'],
  đ: ['ג', '׳'],
  f: ['פ', ''],
  g: ['ג', ''],
  h: ['ח', ''],
  j: ['י', ''],
  k: ['ק', ''],
  l: ['ל', ''],
  lj: ['ל', ''],
  m: ['מ', ''],
  n: ['נ', ''],
  nj: ['נ', ''],
  p: ['פּ', ''],
  r: ['ר', ''],
  s: ['ס', ''],
  ś: ['שׁ', ''],
  š: ['שׁ', ''],
  t: ['ט', ''],
  v: ['ב', ''],
  w: ['ב', ''],
  z: ['ז', ''],
  ź: ['ז', '׳'],
  ž: ['ז', '׳'],
  x: ['קס', ''],
  q: ['ק', ''],
  y: ['י', ''],
};
const FINAL_FORMS: Record<string, string> = { מ: 'ם', נ: 'ן', צ: 'ץ', פ: 'ף' };

const heParts = (t: Token): [string, string] => HE[t.g] ?? [t.g, ''];

function finalForm([base, suffix]: [string, string]): string {
  const last = base.slice(-1);
  return (FINAL_FORMS[last] ? base.slice(0, -1) + FINAL_FORMS[last] : base) + suffix;
}

function heVowel(v: string, c: [string, string] | null, syllFinal: boolean, wordFinal: boolean): string {
  const [base, suffix] = c ?? ['א', ''];
  switch (v) {
    case 'a':
      return base + 'ָ' + suffix + (wordFinal ? 'ה' : 'א');
    case 'e':
      return base + 'ֶ' + suffix + (syllFinal ? 'ה' : '');
    case 'i':
      return base + 'ִ' + suffix + 'י';
    case 'o':
      return base + suffix + 'וֹ';
    case 'u':
      return base + suffix + 'וּ';
    case 'ije':
      // "ye": the consonant with shva, then a yod glide carrying the e.
      return (c ? base + SHVA + suffix : '') + 'יֶ' + (syllFinal ? 'ה' : '');
    case 'r':
      // Syllabic r: a short e-like vowel before it (crno = צֶר·נוֹ, Trg = טֶרג).
      return base + 'ֶ' + suffix + 'ר';
    default:
      return base + suffix;
  }
}

function heSyllable(syll: Token[], isLastSyll: boolean): string {
  let out = '';
  const nucleus = syll.findIndex((t) => t.vowel);
  for (let i = 0; i < syll.length; i++) {
    const t = syll[i];
    const syllFinal = i === syll.length - 1;
    if (t.vowel) {
      if (i > 0 && !syll[i - 1].vowel) continue; // rendered with its consonant
      out += heVowel(t.g, null, syllFinal, isLastSyll && syllFinal);
      continue;
    }
    const next = syll[i + 1];
    const parts = heParts(t);
    if (next?.vowel) {
      const nFinal = i + 1 === syll.length - 1;
      const wordFinal = isLastSyll && nFinal;
      if (SOFT.has(t.g) && next.g !== 'i' && next.g !== 'ije' && next.g !== 'r') {
        // Soft consonant before a vowel: a yod glide marks the softness (ća = צְ׳יָא, lju = לְיוּ).
        out += parts[0] + SHVA + parts[1] + heVowel(next.g, ['י', ''], nFinal, wordFinal);
      } else {
        out += heVowel(next.g, parts, nFinal, wordFinal);
      }
    } else if (nucleus === -1 || i < nucleus) {
      out += parts[0] + SHVA + parts[1];
    } else if (t.g === 'lj' || t.g === 'nj') {
      // Soft l / n closing a syllable keeps its glide: konj = קוֹנְי.
      out += parts[0] + SHVA + 'י';
    } else {
      out += isLastSyll && syllFinal ? finalForm(parts) : parts[0] + parts[1];
    }
  }
  return out;
}

const EN_CONS: Record<string, string> = {
  b: 'b', c: 'ts', č: 'ch', ć: 'ch', d: 'd', dž: 'j', đ: 'dj', f: 'f', g: 'g', h: 'kh', j: 'y', k: 'k', l: 'l', lj: 'ly',
  m: 'm', n: 'n', nj: 'ny', p: 'p', r: 'r', s: 's', ś: 'sh', š: 'sh', t: 't', v: 'v', w: 'v', z: 'z', ź: 'zh', ž: 'zh', x: 'ks', q: 'k', y: 'y',
};
const EN_VOWEL: Record<string, string> = { a: 'ah', e: 'eh', i: 'ee', o: 'oh', u: 'oo', ije: 'yeh', r: 'ur' };

function enSyllable(syll: Token[]): string {
  let out = '';
  for (const t of syll) out += t.vowel ? EN_VOWEL[t.g] ?? t.g : EN_CONS[t.g] ?? t.g;
  // Syllable-final j after a vowel reads as an English diphthong: čaj -> "chai", moj -> "moy".
  return out.replace(/ahy$/, 'ai').replace(/ehy$/, 'ey').replace(/ohy$/, 'oy');
}

/** Render a plain (template-free) notation string. */
function renderPlain(notation: string, target: 'he' | 'en'): string {
  const lead = notation.match(/^\s*/)![0];
  const tail = notation.match(/\s*$/)![0];
  const body = notation.trim();
  if (!body) return notation;
  const words = body.split(/\s+/).map((raw) => {
    const m = raw.match(/^([^\p{L}[\]·]*)(.*?)([^\p{L}[\]·]*)$/u)!;
    const sylls = m[2].split('·').map((s) => ({ stressed: /^\[.*\]$/.test(s), text: s.replace(/[[\]]/g, '') }));
    const rendered = sylls.map((s, i) => {
      const toks = tokenizeCore(s.text);
      const r = target === 'he' ? heSyllable(toks, i === sylls.length - 1) : enSyllable(toks);
      return s.stressed ? `[${r}]` : r;
    });
    return rendered.join('·') + m[3].replace(/[^?!]/g, '');
  });
  return lead + words.join(' ') + tail;
}

/**
 * Hebrew or English transcription of a syllable notation. Learner templates survive: each side of
 * {masculine|feminine} is rendered on its own and {name} is left for lib/personalize.
 */
export function renderNotation(notation: string, target: 'he' | 'en'): string {
  return notation
    .split(/(\{[^{}]*\})/)
    .map((part) => {
      if (!part.startsWith('{')) return renderPlain(part, target);
      if (part === '{name}') return part;
      return '{' + part.slice(1, -1).split('|').map((p) => renderPlain(p, target)).join('|') + '}';
    })
    .join('');
}

/** Vocalized Hebrew transcription: "דוֹ·[בִי]·גְ׳יֶה·נְיָה". */
export function toHebrewPhonetic(text: string): string {
  return renderNotation(toSyllableNotation(text), 'he');
}

/** English-speaker respelling: "doh·[vee]·djeh·nyah". The UI upper-cases the stressed syllable. */
export function toEnglishPhonetic(text: string): string {
  return renderNotation(toSyllableNotation(text), 'en');
}

// ---------- Sounds ----------

function tokenSound(t: Token): SoundKey | null {
  switch (t.g) {
    case 'č':
    case 'ć':
    case 'dž':
    case 'đ':
    case 'š':
    case 'ž':
    case 'lj':
    case 'nj':
    case 'h':
    case 'c':
    case 'ije':
      return t.g as SoundKey;
    case 'r':
      return t.vowel ? 'r' : null;
    default:
      return null;
  }
}

/** Distinctive sounds present in a Montenegrin text (unique). */
export function detectSounds(text: string): SoundKey[] {
  const set = new Set<SoundKey>();
  for (const word of splitWords(text)) for (const t of word.tokens) {
    const s = tokenSound(t);
    if (s) set.add(s);
  }
  return [...set];
}

/** Map a single letter (from a diacritic mistake) to its sound key. */
export function letterSound(letter: string): SoundKey | null {
  const map: Record<string, SoundKey> = { č: 'č', ć: 'ć', đ: 'đ', š: 'š', ž: 'ž' };
  return map[letter.toLocaleLowerCase('sr-Latn')] ?? null;
}

// ---------- Generated helpers for learner-added items ----------

/** Three backchaining steps from the end of the phrase to the full phrase. */
export function autoBackchain(text: string): [string, string, string] {
  const clean = text.trim().replace(/[.,!?]+$/, '');
  const words = clean.split(/\s+/);
  if (words.length >= 3) return [words[words.length - 1], words.slice(-2).join(' '), clean];
  const analyzed = analyze(clean);
  const sylls = analyzed.flatMap((w, wi) => w.sylls.map((s, si) => (si === 0 && wi > 0 ? ' ' : '') + s.map((t) => t.orig).join('')));
  if (sylls.length >= 3) {
    const half = Math.max(2, Math.ceil(sylls.length / 2));
    return [sylls[sylls.length - 1].trim(), sylls.slice(-half).join('').trim(), clean];
  }
  if (sylls.length === 2) {
    const firstVowel = clean.search(/[aeiou]/i);
    const step2 = firstVowel > 0 ? clean.slice(firstVowel) : clean.slice(1);
    return [sylls[1].trim(), step2 === sylls[1].trim() ? clean.slice(1) : step2, clean];
  }
  const toks = analyzed[0]?.word.tokens ?? [];
  const nucleus = toks.findIndex((t) => t.vowel);
  const rime = nucleus >= 0 ? toks.slice(nucleus).map((t) => t.orig).join('') : clean.slice(-1);
  const tail = toks.slice(1).map((t) => t.orig).join('') || clean;
  return [rime, tail === rime ? clean.slice(Math.max(0, clean.length - rime.length - 1)) : tail, clean];
}

/** Articulation tip assembled from the sounds in the text, plus the stress. */
export function autoTip(text: string, uiLang: Lang = 'he'): string {
  // This course is taught in Hebrew and English only.
  const lang = uiLang === 'he' ? 'he' : 'en';
  const parts = detectSounds(text)
    .slice(0, 3)
    .map((s) => (lang === 'he' ? CNR_SOUND_INFO[s as CnrSoundKey]?.tip : CNR_SOUND_INFO[s as CnrSoundKey]?.tipEn))
    .filter(Boolean) as string[];
  const stressed = [...toSyllableNotation(text).matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  if (stressed.length) parts.push(lang === 'he' ? `ההטעמה על: ${stressed.join(', ')}.` : `Stress on: ${stressed.join(', ')}.`);
  return parts.join(' ') || (lang === 'he' ? 'הקשיבו לדובר וחזרו לאט, הברה אחר הברה.' : 'Listen to the speaker and repeat slowly, syllable by syllable.');
}
