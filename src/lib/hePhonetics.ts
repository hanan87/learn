/**
 * Hebrew phonetics for English, Polish and Montenegrin speakers (same API as lib/enPhonetics).
 *
 * Course words are listed in data/he/lexicon, vocalized and split into syllables by hand. The Latin
 * transcription is read off the niqqud syllable by syllable, in a neutral English-style spelling:
 *   sh kh ts ch j zh y + a e i o u, with ai / ei for ַי / ֵי – "sha·[lom]", "to·[da] ra·[ba]".
 * English speakers see it as is (stressed syllable in capitals); Polish and Montenegrin speakers see
 * it in their own letters (lib/latinRespell: sz ch c w j / š h c v j).
 *
 * The course has no Hebrew interface, so the "Hebrew" transcription field (toHebrewPhonetic) holds
 * the same Latin transcription; the respelling for Polish and Montenegrin is made from it.
 *
 * Text without niqqud (speech recognition, free-typed "How do I say…?" results) is matched to the
 * lexicon without its vowel marks, also behind the prefixes ו ה ב ל מ ש כ. A word that is not found
 * gets a rough guess marked with "~"; vocalized words outside the lexicon are split by rule.
 */

import { HE_LEXICON } from '../data/he/lexicon';
import { HE_SOUND_INFO, soundText, type HeSoundKey, type SoundKey } from '../data/sounds';
import type { Lang } from '../i18n/lang';
import { respellHebrewLatin } from './latinRespell';

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
const SHIN_DOT = 'ׁ';
const SIN_DOT = 'ׂ';

const VOWEL: Record<string, string> = {
  [HIRIQ]: 'i',
  [TSERE]: 'e',
  [SEGOL]: 'e',
  [PATAH]: 'a',
  [QAMATS]: 'a',
  [HOLAM]: 'o',
  [HOLAM_VAV]: 'o',
  [QUBUTS]: 'u',
  [HATAF_PATAH]: 'a',
  [HATAF_SEGOL]: 'e',
  [HATAF_QAMATS]: 'o',
};

const FINAL_BASE: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };
const HEB = /[א-ת]/;
const MARKS = /[֑-ׇֽֿׁׂׅׄ]/g;

/** Hebrew text without vowel marks and cantillation (maqaf and punctuation stay). */
export function stripNiqqud(text: string): string {
  return text.normalize('NFC').replace(MARKS, '');
}

const hasNiqqud = (text: string) => /[ְ-ּׁׂ]/.test(text);

/** One letter with its marks. */
interface U {
  l: string;
  raw: string;
  dagesh: boolean;
  sin: boolean;
  geresh: boolean;
  /** Vowel mark (shva included), '' when none. */
  v: string;
}

function parse(word: string): U[] {
  const out: U[] = [];
  for (const ch of word.normalize('NFD')) {
    const last = out.at(-1);
    if (HEB.test(ch)) {
      out.push({ l: ch, raw: ch, dagesh: false, sin: false, geresh: false, v: '' });
      continue;
    }
    if (!last) continue;
    if (ch === DAGESH) last.dagesh = true;
    else if (ch === SIN_DOT) last.sin = true;
    else if (ch === '׳' || ch === "'" || ch === '’') last.geresh = true;
    else if (/[ְ-ֻ]/.test(ch)) last.v = ch;
    else if (ch !== SHIN_DOT) continue;
    last.raw += ch;
  }
  return out;
}

const fullVowel = (u: U | undefined) => !!u && !!u.v && u.v !== SHVA;
/** וֹ and וּ are vowels (o, u), not the consonant v. */
const isVowelVav = (u: U | undefined) => !!u && u.l === 'ו' && (u.v === HOLAM || u.v === HOLAM_VAV || (u.dagesh && !u.v));

function consonant(u: U): string {
  switch (FINAL_BASE[u.l] ?? u.l) {
    case 'א':
    case 'ע':
      return '';
    case 'ב':
      return u.dagesh ? 'b' : 'v';
    case 'ג':
      return u.geresh ? 'j' : 'g';
    case 'ד':
      return 'd';
    case 'ה':
      return 'h';
    case 'ו':
      return 'v';
    case 'ז':
      return u.geresh ? 'zh' : 'z';
    case 'ח':
      return 'kh';
    case 'ט':
    case 'ת':
      return 't';
    case 'י':
      return 'y';
    case 'כ':
      return u.dagesh ? 'k' : 'kh';
    case 'ל':
      return 'l';
    case 'מ':
      return 'm';
    case 'נ':
      return 'n';
    case 'ס':
      return 's';
    case 'פ':
      return u.dagesh ? 'p' : 'f';
    case 'צ':
      return u.geresh ? 'ch' : 'ts';
    case 'ק':
      return 'k';
    case 'ר':
      return 'r';
    case 'ש':
      return u.sin ? 's' : 'sh';
    default:
      return '';
  }
}

/** Latin transcription of one vocalized syllable. `last`: the word's final syllable. */
function syllableLatin(syl: string, last: boolean): string {
  const us = parse(syl);
  if (!us.length) return syl.toLowerCase();
  // Patah under a final ח / ע / ה is said before the letter: רוּחַ = ru·akh, נוֹסֵעַ = no·se·a.
  if (last && us.length === 1 && 'חעה'.includes(us[0].l) && us[0].v === PATAH) return 'a' + consonant(us[0]);
  const full = us.some((u) => fullVowel(u) || isVowelVav(u));
  let out = '';
  let shvaVoiced = false;
  for (let i = 0; i < us.length; i++) {
    const u = us[i];
    const prev = us[i - 1];
    const next = us[i + 1];
    if (isVowelVav(u) && (i === 0 || !fullVowel(prev))) {
      out += u.v ? 'o' : 'u';
      continue;
    }
    // A yod without its own vowel after a vowel: ִי = i, ֵי = ei, ַי = ai, ָיו = av.
    if (u.l === 'י' && !u.dagesh && !fullVowel(u) && i > 0 && (fullVowel(prev) || isVowelVav(prev))) {
      if (prev.v === HIRIQ) continue;
      if ((prev.v === QAMATS || prev.v === PATAH) && next?.l === 'ו' && !next.v && !next.dagesh && i + 2 === us.length) {
        out += 'v';
        i++;
        continue;
      }
      out += 'i';
      continue;
    }
    // A final ה without a vowel is silent (תּוֹדָה = to·da).
    if (u.l === 'ה' && !fullVowel(u) && i === us.length - 1 && i > 0) continue;
    let vowel = fullVowel(u) ? (VOWEL[u.v] ?? '') : '';
    // A syllable with no other vowel: its shva is a short e (בְּ = be). Otherwise the shva is silent.
    if (u.v === SHVA && !full && !shvaVoiced) {
      vowel = 'e';
      shvaVoiced = true;
    }
    out += consonant(u) + vowel;
  }
  return out;
}

/** Latin transcription of a word in the syllable notation ("שָׁ·[לוֹם]" → "sha·[lom]"). */
function latinOf(notation: string): string {
  const parts = notation.split('·');
  return parts
    .map((p, k) => {
      const m = p.match(/^\[(.*)\]$/);
      const lat = syllableLatin(m ? m[1] : p, k === parts.length - 1);
      return m ? `[${lat}]` : lat;
    })
    .join('·');
}

interface Entry {
  /** Hebrew syllables with stress. */
  syl: string;
  /** Latin transcription with the same syllables and stress. */
  lat: string;
}

const plain = (notation: string) => notation.replace(/[·[\]]/g, '');

const LEXICON = new Map<string, Entry>();
/** The same words without niqqud (the first entry wins: רוצה → רוֹצֶה). */
const BARE = new Map<string, Entry>();
/** Words that read differently with different vowels (אוכל: o·KHEL "eats", O·khel "food"). */
const AMBIGUOUS = new Set<string>();
for (const line of HE_LEXICON.trim().split('\n')) {
  const [heb, override] = line.split('=').map((s) => s.trim());
  if (!heb) continue;
  const syl = heb.normalize('NFC');
  const entry: Entry = { syl, lat: override || latinOf(syl) };
  const key = plain(syl);
  LEXICON.set(key, entry);
  const bare = stripNiqqud(key);
  const first = BARE.get(bare);
  if (!first) BARE.set(bare, entry);
  else if (first.lat !== entry.lat) AMBIGUOUS.add(bare);
}

/** True when the vocalized word has a hand-written entry (used by the data tests). */
export function inLexicon(word: string): boolean {
  return LEXICON.has(word.normalize('NFC'));
}

/**
 * True when a word's reading is certain: listed in the lexicon (also without niqqud, unless it reads
 * two ways) or written with vowel signs. Other words are guessed – split into prefixes and a lexicon
 * word (which can be wrong: כלב is "dog", not כְּ + לֵב) or given a "~" reading – and are worth
 * vocalizing in context.
 */
export function isKnownWord(core: string): boolean {
  if (!core || !HEB.test(core)) return true;
  const key = core.normalize('NFC');
  return LEXICON.has(key) || hasNiqqud(key) || (BARE.has(key) && !AMBIGUOUS.has(key));
}

/** Every lexicon entry (for the data tests). */
export function lexiconEntries(): { word: string; syl: string; lat: string }[] {
  return [...LEXICON].map(([word, e]) => ({ word, ...e }));
}

// --- Words outside the lexicon ----------------------------------------------------------------------

/** Vocalized word: one syllable per vowel, a lone consonant between vowels opens the next one. */
function ruleVocalized(word: string): Entry {
  const us = parse(word);
  // A vowel vav after a consonant is that consonant's vowel; only a word-initial וּ is a syllable of its own.
  const nucleus = us.map((u, i) => (isVowelVav(u) ? i === 0 : fullVowel(u) || isVowelVav(us[i + 1])));
  const starts: number[] = [];
  us.forEach((u, i) => {
    if (!nucleus[i]) return;
    // A vowel vav belongs to the consonant before it.
    if (isVowelVav(u) && i > 0) return;
    starts.push(starts.length ? i : 0);
  });
  if (!starts.length) starts.push(0);
  // A prefix letter with a shva (בְּ, לְ, מְ, וְ, כְּ) is a syllable of its own.
  if (us[0]?.v === SHVA && 'ובכלמ'.includes(us[0].l) && starts.length && us.length > 1) {
    const firstNucleus = nucleus.findIndex(Boolean);
    if (firstNucleus > 0) starts.splice(1, 0, 1);
  }
  const groups = starts.map((s, k) => us.slice(s, starts[k + 1] ?? us.length));
  const stress = stressIndex(groups);
  const marked = groups.map((g, k) => (k === stress ? `[${g.map((u) => u.raw).join('')}]` : g.map((u) => u.raw).join(''))).join('·');
  return { syl: marked.normalize('NFC'), lat: latinOf(marked.normalize('NFC')) };
}

/**
 * Hebrew stresses the last syllable, except segolates – a closed last syllable with segol (יֶ·לֶד,
 * מֶ·לֶךְ, מַחְ·בֶּ·רֶת) – and -ayim / -ayit endings (בַּ·יִת): those stress the one before.
 */
function stressIndex(groups: U[][]): number {
  const n = groups.length;
  if (n < 2) return n - 1;
  const last = groups[n - 1];
  const prev = groups[n - 2];
  if (!prev.some((u) => fullVowel(u) || isVowelVav(u))) return n - 1;
  const vi = last.findIndex((u) => fullVowel(u));
  if (vi >= 0 && last[vi].v === SEGOL) {
    // A silent ה or א at the end does not close the syllable (יָ·פֶה stays final).
    const after = last.slice(vi + 1).filter((u, k, a) => !(k === a.length - 1 && !u.v && (u.l === 'ה' || u.l === 'א')));
    if (after.length) return n - 2;
  }
  if (last[0]?.l === 'י' && last[0].v === HIRIQ && prev.some((u) => u.v === PATAH || u.v === QAMATS)) return n - 2;
  return n - 1;
}

/** Rough transcription of an unvocalized word that is not in the lexicon, marked with "~". */
function guessBare(word: string): Entry {
  const us = parse(word);
  let lat = '';
  // The last letter written is a consonant (or a silent א / ע) still waiting for its vowel.
  let open = false;
  us.forEach((u, i) => {
    const base = FINAL_BASE[u.l] ?? u.l;
    const last = i === us.length - 1;
    if (base === 'ו' && i > 0 && open) {
      lat += 'o';
      open = false;
      return;
    }
    if (base === 'י' && i > 0 && open) {
      lat += 'i';
      open = false;
      return;
    }
    if ((base === 'ה' || base === 'א') && last && i > 0) {
      if (open) lat += 'a';
      return;
    }
    if (base === 'א' || base === 'ע') {
      if (open) lat += 'a';
      open = true;
      return;
    }
    if (open) lat += 'a';
    lat += consonant({ ...u, dagesh: i === 0 });
    open = true;
  });
  return { syl: word, lat: `~${lat}` };
}

/** Vowel and stress of the prefixes ו ה ב ל מ ש כ written before a lexicon word. */
const PREFIX: Record<string, { he: string; lat: string }> = {
  ו: { he: 'וְ', lat: 've' },
  ה: { he: 'הַ', lat: 'ha' },
  ב: { he: 'בְּ', lat: 'be' },
  ל: { he: 'לְ', lat: 'le' },
  מ: { he: 'מִ', lat: 'mi' },
  ש: { he: 'שֶׁ', lat: 'she' },
  כ: { he: 'כְּ', lat: 'ke' },
};

/** An unvocalized lexicon word behind one or two prefixes ("ובתחנה" → ו + ב + תחנה). */
function prefixed(bare: string): Entry | null {
  for (let n = 1; n <= 2 && n < bare.length - 1; n++) {
    const pre = [...bare.slice(0, n)];
    if (!pre.every((p) => PREFIX[p])) continue;
    const found = BARE.get(bare.slice(n));
    if (!found) continue;
    return {
      syl: [...pre.map((p) => PREFIX[p].he), found.syl].join('·').normalize('NFC'),
      lat: [...pre.map((p) => PREFIX[p].lat), found.lat].join('·'),
    };
  }
  return null;
}

function wordEntry(core: string): Entry {
  if (!core || !HEB.test(core)) return { syl: core, lat: core.toLowerCase() };
  const key = core.normalize('NFC');
  const found = LEXICON.get(key);
  if (found) return found;
  if (hasNiqqud(key)) return ruleVocalized(key);
  return BARE.get(key) ?? prefixed(key) ?? guessBare(key);
}

// --- Phrases ---------------------------------------------------------------------------------------

/**
 * Apply `fn` to every word of a phrase, keeping the learner templates ({masculine|feminine}, {name})
 * and, when asked, the punctuation around each word.
 */
function mapPhrase(text: string, fn: (core: string) => string, keepPunct: boolean): string {
  const groups: string[] = [];
  const masked = text.normalize('NFC').replace(/\{([^{}]*)\}/g, (_m, inner: string) => {
    groups.push(inner);
    return `\u0000${groups.length - 1}\u0000`;
  });
  return masked
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const [, lead, core, trail] = raw.match(/^([^\p{L}\p{M}\u0000]*)(.*?)([^\p{L}\p{M}\u0000]*)$/u)!;
      const g = core.match(/^\u0000(\d+)\u0000$/);
      const body = g
        ? `{${groups[Number(g[1])]
            .split('|')
            .map((alt) => (HEB.test(alt) ? mapPhrase(alt, fn, keepPunct) : alt))
            .join('|')}}`
        : fn(core);
      return keepPunct ? lead + body + trail : body;
    })
    .filter(Boolean)
    .join(' ');
}

/** Hebrew syllables with stress: "תּוֹדָה רַבָּה!" → "תּוֹ·[דָה] רַ·[בָּה]!". */
export function toSyllableNotation(text: string): string {
  return mapPhrase(text, (core) => wordEntry(core).syl, true);
}

/** Latin transcription with stress: "תּוֹדָה רַבָּה!" → "to·[da] ra·[ba]". */
export function toEnglishPhonetic(text: string): string {
  return mapPhrase(text, (core) => wordEntry(core).lat, false);
}

/**
 * The transcription the Polish and Montenegrin respelling is made from (lib/latinRespell). There is
 * no Hebrew interface in this course, so it is the same Latin transcription.
 */
export function toHebrewPhonetic(text: string): string {
  return toEnglishPhonetic(text);
}

// --- Sounds, backchaining and tips ------------------------------------------------------------------

const SOUND_ORDER: HeSoundKey[] = ['kh', 'r', 'ts', 'h'];

/** Hard sounds in the text: ח / כ (kh), ר, צ (ts) and a ה that is pronounced. */
export function detectSounds(text: string): SoundKey[] {
  const found = new Set<HeSoundKey>();
  for (const word of text.split(/\s+/)) {
    const us = parse(word);
    const vocalized = hasNiqqud(word);
    us.forEach((u, i) => {
      const base = FINAL_BASE[u.l] ?? u.l;
      if (base === 'ח' || (base === 'כ' && !u.dagesh && (vocalized || u.l === 'ך'))) found.add('kh');
      if (base === 'ר') found.add('r');
      if (base === 'צ' && !u.geresh) found.add('ts');
      if (u.l === 'ה' && i < us.length - 1) found.add('h');
    });
  }
  return SOUND_ORDER.filter((k) => found.has(k));
}

export function letterSound(_letter: string): SoundKey | null {
  return null;
}

/** Words of a phrase; a template group ({…|…}) stays one word. */
function words(text: string): string[] {
  const groups: string[] = [];
  const masked = text.replace(/\{[^{}]*\}/g, (m) => {
    groups.push(m);
    return `\u0000${groups.length - 1}\u0000`;
  });
  return masked
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/\u0000(\d+)\u0000/g, (_m, n: string) => groups[Number(n)]));
}

/** Back-chaining steps: the end of the phrase first, then more, then all of it. */
export function autoBackchain(text: string): [string, string, string] {
  const clean = text.trim().replace(/[.,!?]+$/, '');
  const ws = words(clean).map((w) => w.replace(/[.,!?]+$/, ''));
  if (ws.length >= 3) return [ws[ws.length - 1], ws.slice(-2).join(' '), clean];
  if (ws.length === 2) return [ws[1], ws[0], clean];
  const sylls = plain(toSyllableNotation(clean).replace(/·/g, '|')).split('|');
  if (sylls.length >= 3) return [sylls[sylls.length - 1], sylls.slice(-2).join(''), clean];
  if (sylls.length === 2) return [sylls[1], sylls[0], clean];
  return [clean, clean, clean];
}

type TipLang = Exclude<Lang, 'he'>;
const STRESS_ON: Record<TipLang, string> = { en: 'Stress on:', pl: 'Akcent na:', cnr: 'Naglasak je na:' };
const NOT_LAST: Record<TipLang, string> = {
  en: 'Careful: here the stress is not on the last syllable.',
  pl: 'Uwaga: tutaj akcent nie pada na ostatnią sylabę.',
  cnr: 'Pažnja: ovdje naglasak nije na posljednjem slogu.',
};
const LISTEN: Record<TipLang, string> = {
  en: 'Listen to the speaker and repeat slowly, syllable by syllable.',
  pl: 'Posłuchaj lektorki i powtarzaj powoli, sylaba po sylabie.',
  cnr: 'Poslušajte govornicu i ponavljajte polako, slog po slog.',
};

/** Pronunciation tip: the phrase's hard sounds, then where the stress is (in the learner's own letters). */
export function autoTip(text: string, lang: Lang = 'en'): string {
  const l: TipLang = lang === 'he' ? 'en' : lang;
  const resolved = text.replace(/\{([^{}|]*)\|[^{}]*\}/g, '$1');
  const parts = detectSounds(resolved)
    .slice(0, 2)
    .map((s) => soundText(HE_SOUND_INFO[s as HeSoundKey], l).tip);
  const lat = toEnglishPhonetic(resolved);
  const shown = l === 'en' ? lat : respellHebrewLatin(lat, l);
  const stressed = [...shown.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].toUpperCase());
  if (stressed.length) parts.push(`${STRESS_ON[l]} ${stressed.join(', ')}.`);
  if (/\]·/.test(lat)) parts.push(NOT_LAST[l]);
  return parts.join(' ') || LISTEN[l];
}
