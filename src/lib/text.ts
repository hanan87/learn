/**
 * Text comparison utilities: normalization, Levenshtein distance and diacritic diagnostics
 * (the pronunciation score is in lib/pronScore).
 */
import type { Lang } from '../i18n/lang';
import { COURSE } from './course';

const PL_DIACRITICS: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
};
const CNR_DIACRITICS: Record<string, string> = { č: 'c', ć: 'c', đ: 'd', š: 's', ž: 'z', ś: 's', ź: 'z' };
const DIACRITIC_MAP: Record<string, string> = { pl: PL_DIACRITICS, cnr: CNR_DIACRITICS, en: {}, he: {} }[COURSE];

const HE_FINALS: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };

/**
 * Lowercase, strip punctuation, collapse whitespace. Hebrew loses its vowel marks (learners type
 * without niqqud), a geresh typed as an apostrophe (צ'יפס) and final letter forms.
 */
export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7׳״]/g, '')
    .replace(/([א-ת])['’]/g, '$1')
    .replace(/[ךםןףץ]/g, (c) => HE_FINALS[c])
    .toLocaleLowerCase('pl-PL')
    .replace(/[.,!?;:"„”'’‘«»()\-–—…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripDiacritics(text: string): string {
  return [...text].map((ch) => DIACRITIC_MAP[ch] ?? ch).join('');
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Similarity in [0, 1] based on Levenshtein distance. */
export function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

/** Pronunciation scoring lives in lib/pronScore (sound by sound); re-exported for existing imports. */
export { scorePronunciation, type PronunciationResult, type SoundMark, type WordResult } from './pronScore';

const PL_EXPLANATIONS: Record<string, { he: string; en: string }> = {
  ą: { he: 'ą היא o אפית ("וֹן") – בלי הסימן, a היא סתם "אָ".', en: 'ą is a nasal o ("on") – without the tail, a is just "ah".' },
  ć: { he: 'ć היא צ׳ רכה (לשון קדימה, חיוך) – בלי הסימן, c היא "צ" רגילה.', en: 'ć is a soft "ch" (tongue forward, smile) – without the accent, c is "ts".' },
  ę: { he: 'ę היא e אפית ("ֶן"; בסוף מילה – e) – בלי הסימן, e רגילה.', en: 'ę is a nasal e ("en"; plain e at the end of a word) – without the tail, a plain e.' },
  ł: { he: 'ł נהגית כמו w באנגלית – בלי הקו, l היא ל׳ רגילה. זה משנה את המילה לגמרי!', en: 'ł sounds like English w – without the stroke, l is a plain l. It changes the word completely!' },
  ń: { he: 'ń היא n רכה ("נְי") – בלי הסימן, n רגילה.', en: 'ń is a soft n ("ny") – without the accent, a plain n.' },
  ó: { he: 'ó נהגית בדיוק כמו u ("וּ") – בלי הסימן, o היא "וֹ".', en: 'ó sounds exactly like u ("oo") – without the accent, o is "oh".' },
  ś: { he: 'ś היא ש׳ רכה (לשון קדימה, חיוך) – בלי הסימן, s היא "ס".', en: 'ś is a soft "sh" (tongue forward, smile) – without the accent, s is a plain s.' },
  ź: { he: 'ź היא ז׳ רכה (לשון קדימה) – בלי הסימן, z היא "ז" רגילה.', en: 'ź is a soft "zh" (tongue forward) – without the accent, z is a plain z.' },
  ż: { he: 'ż היא ז׳ קשה (לשון אחורה, שפתיים מעוגלות) – בלי הנקודה, z היא "ז" רגילה.', en: 'ż is a hard "zh" as in "measure" (tongue back, lips rounded) – without the dot, z is a plain z.' },
};

const CNR_EXPLANATIONS: Record<string, { he: string; en: string }> = {
  č: { he: 'č היא צ׳ קשה (לשון אחורה, שפתיים קדימה) – בלי הסימן, c היא "צ".', en: 'č is a hard "ch" (tongue back, lips forward) – without the mark, c is "ts".' },
  ć: { he: 'ć היא צ׳ רכה (לשון קדימה, חיוך) – לא č הקשה, ובלי הסימן c היא "צ".', en: 'ć is a soft "ch" (tongue forward, smile) – not the hard č; without the accent, c is "ts".' },
  š: { he: 'š היא "ש" – בלי הסימן, s היא "ס". šuma (יער) ≠ suma (סכום).', en: 'š is "sh" – without the mark, s is a plain s. šuma (forest) ≠ suma (sum).' },
  ž: { he: 'ž היא ז׳ – בלי הסימן, z היא "ז". koža (עור) ≠ koza (עז).', en: 'ž is "zh" – without the mark, z is a plain z. koža (skin) ≠ koza (goat).' },
  đ: { he: 'đ היא ג׳ רכה (כמעט "דְי") – עם הקו, היא לא d רגילה.', en: 'đ is a soft "j" (almost "dy") – with the stroke, it is not a plain d.' },
};

/** Explanations of the active course's special letters. */
export const DIACRITIC_EXPLANATIONS: Record<string, { he: string; en: string }> = { pl: PL_EXPLANATIONS, cnr: CNR_EXPLANATIONS, en: {}, he: {} }[COURSE];

export interface DiacriticIssue {
  expected: string;
  typed: string;
}

export type WritingVerdict =
  | { kind: 'correct' }
  | { kind: 'diacritics'; issues: DiacriticIssue[] }
  | { kind: 'wrong'; distance: number };

/** Explanation of a single diacritic mistake in the active language. */
export function explainDiacritic(issue: DiacriticIssue, uiLang: Lang): string {
  // Only the Polish and Montenegrin courses have special letters, and they are taught in Hebrew / English.
  const lang = uiLang === 'he' ? 'he' : 'en';
  const exp = DIACRITIC_EXPLANATIONS[issue.expected]?.[lang];
  if (exp) return exp;
  const typedExp = DIACRITIC_EXPLANATIONS[issue.typed]?.[lang] ?? '';
  return lang === 'he'
    ? `כתבתם ${issue.typed} – אבל כאן צריך ${issue.expected} בלי סימן מיוחד. ${typedExp}`
    : `You typed ${issue.typed} – but here it is a plain ${issue.expected}. ${typedExp}`;
}

/** Compare a typed answer with the expected Polish text. */
export function checkWriting(expected: string, typed: string): WritingVerdict {
  const e = normalize(expected);
  const t = normalize(typed);
  if (e === t) return { kind: 'correct' };

  if (e.length === t.length && stripDiacritics(e) === stripDiacritics(t)) {
    const issues: DiacriticIssue[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < e.length; i++) {
      if (e[i] === t[i]) continue;
      const key = `${e[i]}>${t[i]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({ expected: e[i], typed: t[i] });
    }
    return { kind: 'diacritics', issues };
  }

  return { kind: 'wrong', distance: levenshtein(e, t) };
}
