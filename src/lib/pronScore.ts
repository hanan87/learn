import { COURSE, type CourseId } from './course';

/**
 * Pronunciation score from a speech-recognition transcript, compared SOUND by sound.
 *
 * The old score compared spelling only: any different word landed at a flat 7–11 % and a near
 * look-alike (szkoda for szkoła) got 90 %, without saying what was wrong. Now:
 *   - both texts are turned into sounds (Polish: sz, cz, rz = ż, ó = u, ch = h, si + vowel = ś…;
 *     Montenegrin: dž, lj, nj…)
 *   - words are aligned to words (a missing word, an extra false start, or a word split in two by the
 *     recognizer are all handled)
 *   - inside each word the sounds are aligned; a close sound (sz/ś, ł/l, č/ć, voiced/voiceless) costs
 *     half a mistake, a different sound a whole one
 *   - every target sound is marked right or wrong, with what was heard in its place, so the learner
 *     sees exactly which letters to fix
 * The score is the share of the phrase's sounds said right (weighted by word length), minus a small
 * penalty for extra words.
 */

export interface SoundMark {
  /** Letters of the target word for this sound ("sz", "ł", "si"…). */
  text: string;
  ok: boolean;
  /** What was heard in its place ('' = left out). */
  heard?: string;
}

export interface WordResult {
  word: string;
  matched: boolean;
  heard?: string;
  similarity: number;
  /** 0–100 for this word. */
  score?: number;
  sounds?: SoundMark[];
}

export interface PronunciationResult {
  score: number;
  transcript: string;
  words: WordResult[];
  /** Heard words that do not belong to the phrase. */
  extra?: string[];
}

/** A word counts as said right from this similarity on. */
export const WORD_PASS = 0.85;
/** Cost of an extra heard word, in sounds. */
const EXTRA_WORD_COST = 1;

interface Phone {
  p: string;
  orig: string;
}

export function cleanText(text: string): string {
  return text
    .normalize('NFC')
    // Hebrew vowel marks and the geresh are not sounds the recognizer writes.
    .replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7׳״]/g, '')
    .toLocaleLowerCase()
    .replace(/[.,!?;:"„”“'’‘«»()\-–—…¿¡]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const PL_DIGRAPHS = ['dż', 'dź', 'dz', 'ch', 'cz', 'rz', 'sz'];
const PL_VOWELS = new Set(['a', 'ą', 'e', 'ę', 'i', 'o', 'ó', 'u', 'y']);
const PL_SOFTEN: Record<string, string> = { s: 'ś', c: 'ć', z: 'ź', n: 'ń', dz: 'dź' };
const CNR_DIGRAPHS = ['dž', 'lj', 'nj'];
/** English letter groups that are one sound (the recognizer spells words correctly, so letters are compared). */
const EN_DIGRAPHS = ['th', 'sh', 'ch', 'ck', 'ng', 'ph', 'wh', 'ee', 'oo'];

function graphemes(word: string, digraphs: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < word.length; ) {
    const two = word.slice(i, i + 2);
    const g = digraphs.includes(two) ? two : word[i];
    out.push(g);
    i += g.length;
  }
  return out;
}

/** Polish sounds of a (lowercase, clean) word. */
function plPhones(word: string): Phone[] {
  const gs = graphemes(word, PL_DIGRAPHS);
  const out: Phone[] = [];
  for (let k = 0; k < gs.length; k++) {
    const g = gs[k];
    const next = gs[k + 1];
    const after = gs[k + 2];
    if (PL_SOFTEN[g] && next === 'i') {
      // si, ci, zi, ni, dzi: a soft consonant; before a vowel the i only marks the softness.
      if (after && PL_VOWELS.has(after)) {
        out.push({ p: PL_SOFTEN[g], orig: g + 'i' });
        k++;
      } else {
        out.push({ p: PL_SOFTEN[g], orig: g });
      }
      continue;
    }
    const prev = gs[k - 1];
    if (g === 'i' && prev && !PL_VOWELS.has(prev) && next && PL_VOWELS.has(next)) {
      // bia, mie, pio…: the i is a y-glide.
      out.push({ p: 'j', orig: g });
      continue;
    }
    const p = g === 'ó' ? 'u' : g === 'rz' ? 'ż' : g === 'ch' ? 'h' : g;
    out.push({ p, orig: g });
  }
  return out;
}

/** Montenegrin sounds: the spelling is phonemic, so letters (with dž, lj, nj) are the sounds. */
function cnrPhones(word: string): Phone[] {
  return graphemes(word, CNR_DIGRAPHS).map((g) => ({ p: g, orig: g }));
}

/** English: letters, with th, sh, ee… as single sounds (ck = k, ph = f, wh = w). */
function enPhones(word: string): Phone[] {
  return graphemes(word, EN_DIGRAPHS).map((g) => ({ p: g === 'ck' ? 'k' : g === 'ph' ? 'f' : g === 'wh' ? 'w' : g, orig: g }));
}

const HE_FINALS: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };

/**
 * Hebrew: letters (the recognizer writes words without niqqud, in the full spelling the course uses),
 * final forms as their base letter and doubled וו / יי as one.
 */
function hePhones(word: string): Phone[] {
  const out: Phone[] = [];
  for (const ch of word) {
    const p = HE_FINALS[ch] ?? ch;
    if ((p === 'ו' || p === 'י') && out.at(-1)?.p === p) {
      out[out.length - 1].orig += ch;
      continue;
    }
    out.push({ p, orig: ch });
  }
  return out;
}

const HE_UNITS = ['', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע'];
const HE_TEENS = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה'];
const HE_TENS = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים'];

/** Hebrew number words for 0–99 (the counting forms), as the course writes prices and numbers. */
function heNumber(n: number): string {
  if (n === 0) return 'אפס';
  if (n < 10) return HE_UNITS[n];
  if (n < 20) return HE_TEENS[n - 10];
  const tens = HE_TENS[Math.floor(n / 10)];
  return n % 10 ? `${tens} ו${HE_UNITS[n % 10]}` : tens;
}

/** The Hebrew recognizer writes numbers as digits ("20 ₪"); the course writes them as words. */
export function heDigitsToWords(text: string): string {
  return text.replace(/₪/g, ' שקל ').replace(/\d+/g, (d) => (Number(d) < 100 ? ` ${heNumber(Number(d))} ` : d)).replace(/\s+/g, ' ').trim();
}

/** Pairs of sounds that are close (half a mistake). */
const SIMILAR: Record<CourseId, string[][]> = {
  pl: [
    ['sz', 'ś', 's'],
    ['cz', 'ć', 'c'],
    ['ż', 'ź', 'z'],
    ['dż', 'dź', 'dz'],
    ['ł', 'l'],
    ['ł', 'u'],
    ['n', 'ń'],
    ['e', 'ę'],
    ['o', 'ą'],
    ['i', 'y'],
    ['i', 'j'],
    ['b', 'p'],
    ['d', 't'],
    ['g', 'k'],
    ['w', 'f'],
    ['ż', 'sz'],
    ['h', 'k'],
  ],
  cnr: [
    ['č', 'ć', 'c'],
    ['dž', 'đ'],
    ['š', 's'],
    ['ž', 'z'],
    ['ž', 'š'],
    ['lj', 'l'],
    ['nj', 'n'],
    ['b', 'p'],
    ['d', 't'],
    ['đ', 'd'],
    ['g', 'k'],
    ['v', 'f'],
    ['z', 's'],
    ['h', 'k'],
    ['i', 'j'],
  ],
  en: [
    ['th', 's', 't', 'f', 'd', 'z'],
    ['w', 'v'],
    ['v', 'b', 'f'],
    ['i', 'ee', 'e'],
    ['a', 'e', 'u'],
    ['b', 'p'],
    ['d', 't'],
    ['g', 'k'],
    ['s', 'z'],
    ['r', 'l'],
    ['n', 'ng'],
  ],
  // Letters that sound the same or close in Israeli Hebrew.
  he: [
    ['ח', 'כ', 'ה'],
    ['א', 'ע', 'ה'],
    ['ט', 'ת'],
    ['ק', 'כ'],
    ['ב', 'ו'],
    ['ב', 'פ'],
    ['ס', 'ש', 'צ'],
    ['ז', 'ס'],
    ['ד', 'ט'],
    ['ג', 'ק'],
  ],
};

function similarSet(course: CourseId): Set<string> {
  const set = new Set<string>();
  for (const group of SIMILAR[course]) for (const a of group) for (const b of group) if (a !== b) set.add(`${a}|${b}`);
  return set;
}
const SIMILAR_SETS: Record<CourseId, Set<string>> = { pl: similarSet('pl'), cnr: similarSet('cnr'), en: similarSet('en'), he: similarSet('he') };

interface Scorer {
  phones: (word: string) => Phone[];
  sub: (a: string, b: string) => number;
}

function scorer(course: CourseId): Scorer {
  const near = SIMILAR_SETS[course];
  return {
    phones: { pl: plPhones, cnr: cnrPhones, en: enPhones, he: hePhones }[course],
    sub: (a, b) => (a === b ? 0 : near.has(`${a}|${b}`) ? 0.5 : 1),
  };
}

/** Align the sounds of one target word with the heard word. */
function alignSounds(t: Phone[], h: Phone[], sub: Scorer['sub']): { cost: number; marks: SoundMark[] } {
  const n = t.length;
  const m = h.length;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      d[i][j] = Math.min(d[i - 1][j - 1] + sub(t[i - 1].p, h[j - 1].p), d[i - 1][j] + 1, d[i][j - 1] + 1);
    }
  }
  // Walk back to mark each target sound.
  const marks: SoundMark[] = [];
  let i = n;
  let j = m;
  let inserted = '';
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + sub(t[i - 1].p, h[j - 1].p)) {
      // A sound followed by an extra heard sound (ma → masz) is marked too.
      const ok = t[i - 1].p === h[j - 1].p && !inserted;
      marks.unshift(ok ? { text: t[i - 1].orig, ok: true } : { text: t[i - 1].orig, ok: false, heard: h[j - 1].orig + inserted });
      inserted = '';
      i--;
      j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      marks.unshift({ text: t[i - 1].orig, ok: false, heard: inserted });
      inserted = '';
      i--;
    } else {
      // An extra heard sound: shown together with the target sound before it.
      inserted = h[j - 1].orig + inserted;
      j--;
    }
  }
  if (inserted && marks.length) marks[0] = { ...marks[0], ok: false, heard: inserted + (marks[0].heard ?? marks[0].text) };
  return { cost: d[n][m], marks };
}

interface WordCompare {
  sim: number;
  marks: SoundMark[];
}

function compareWords(target: string, heard: string, s: Scorer): WordCompare {
  const t = s.phones(target);
  const h = s.phones(heard);
  if (!t.length) return { sim: 1, marks: [] };
  const { cost, marks } = alignSounds(t, h, s.sub);
  return { sim: Math.max(0, 1 - cost / Math.max(t.length, h.length)), marks };
}

type Step =
  | { kind: 'pair'; t: number; h: number }
  | { kind: 'split'; t: number; h: [number, number] }
  | { kind: 'merge'; t: [number, number]; h: number }
  | { kind: 'missing'; t: number }
  | { kind: 'extra'; h: number };

/** Score a recognized transcript against the target phrase. */
export function scorePronunciation(target: string, transcript: string, course: CourseId = COURSE): PronunciationResult {
  const s = scorer(course);
  if (course === 'he') transcript = heDigitsToWords(transcript);
  const display = target.split(/\s+/).filter(Boolean);
  const tWords = display.map(cleanText);
  const heardRaw = transcript.split(/\s+/).filter((w) => cleanText(w));
  const hWords = heardRaw.map(cleanText);
  const weights = tWords.map((w) => Math.max(1, s.phones(w).length));
  const total = weights.reduce((a, b) => a + b, 0);

  if (!hWords.length) {
    return {
      score: 0,
      transcript,
      words: display.map((word, k) => ({ word, matched: false, similarity: 0, score: 0, sounds: s.phones(tWords[k]).map((p) => ({ text: p.orig, ok: false, heard: '' })) })),
    };
  }

  const n = tWords.length;
  const m = hWords.length;
  const memo = new Map<string, WordCompare>();
  const cmp = (t: string, h: string) => {
    const key = `${t}\u0000${h}`;
    let r = memo.get(key);
    if (!r) memo.set(key, (r = compareWords(t, h, s)));
    return r;
  };

  // Word alignment (dynamic programming over target × heard words).
  const cost: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(Infinity));
  const back: (Step | null)[][] = Array.from({ length: n + 1 }, () => Array<Step | null>(m + 1).fill(null));
  cost[0][0] = 0;
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      const here = cost[i][j];
      if (!Number.isFinite(here)) continue;
      const relax = (ni: number, nj: number, c: number, step: Step) => {
        if (here + c < cost[ni][nj] - 1e-9) {
          cost[ni][nj] = here + c;
          back[ni][nj] = step;
        }
      };
      if (i < n && j < m) relax(i + 1, j + 1, weights[i] * (1 - cmp(tWords[i], hWords[j]).sim), { kind: 'pair', t: i, h: j });
      if (i < n && j + 1 < m) relax(i + 1, j + 2, weights[i] * (1 - cmp(tWords[i], hWords[j] + hWords[j + 1]).sim) + 0.25, { kind: 'split', t: i, h: [j, j + 1] });
      if (i + 1 < n && j < m)
        relax(i + 2, j + 1, (weights[i] + weights[i + 1]) * (1 - cmp(tWords[i] + tWords[i + 1], hWords[j]).sim) + 0.25, { kind: 'merge', t: [i, i + 1], h: j });
      if (i < n) relax(i + 1, j, weights[i], { kind: 'missing', t: i });
      if (j < m) relax(i, j + 1, EXTRA_WORD_COST, { kind: 'extra', h: j });
    }
  }

  const steps: Step[] = [];
  for (let i = n, j = m; i > 0 || j > 0; ) {
    const st = back[i][j]!;
    steps.unshift(st);
    if (st.kind === 'pair') (i--, j--);
    else if (st.kind === 'split') (i--, (j -= 2));
    else if (st.kind === 'merge') ((i -= 2), j--);
    else if (st.kind === 'missing') i--;
    else j--;
  }

  const words: WordResult[] = display.map((word) => ({ word, matched: false, similarity: 0, score: 0 }));
  const extra: string[] = [];
  const fill = (ti: number, heard: string, c: WordCompare) => {
    const sim = Math.round(c.sim * 100) / 100;
    words[ti] = { word: display[ti], matched: c.sim >= WORD_PASS, heard, similarity: sim, score: Math.round(c.sim * 100), sounds: c.marks };
  };
  for (const st of steps) {
    if (st.kind === 'pair') fill(st.t, heardRaw[st.h], cmp(tWords[st.t], hWords[st.h]));
    else if (st.kind === 'split') fill(st.t, `${heardRaw[st.h[0]]} ${heardRaw[st.h[1]]}`, cmp(tWords[st.t], hWords[st.h[0]] + hWords[st.h[1]]));
    else if (st.kind === 'merge') {
      // Two target words heard as one: judge each against the matching part of the heard word.
      const whole = cmp(tWords[st.t[0]] + tWords[st.t[1]], hWords[st.h]);
      const cut = s.phones(tWords[st.t[0]]).length;
      const first: WordCompare = { sim: whole.sim, marks: whole.marks.slice(0, cut) };
      const second: WordCompare = { sim: whole.sim, marks: whole.marks.slice(cut) };
      fill(st.t[0], heardRaw[st.h], first);
      fill(st.t[1], heardRaw[st.h], second);
    } else if (st.kind === 'missing') {
      words[st.t] = { word: display[st.t], matched: false, similarity: 0, score: 0, sounds: s.phones(tWords[st.t]).map((p) => ({ text: p.orig, ok: false, heard: '' })) };
    } else extra.push(heardRaw[st.h]);
  }

  const score = Math.round(Math.max(0, 1 - cost[n][m] / total) * 100);
  return { score, transcript, words, extra: extra.length ? extra : undefined };
}
