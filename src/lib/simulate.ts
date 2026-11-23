/**
 * Synthetic transcripts for the recording simulation panel and for spelling distractors.
 * Substitutions mirror typical mistakes of Hebrew and English speakers.
 */
import { COURSE } from './course';

const PL_MISTAKES: [RegExp, string][] = [
  [/ł/, 'l'],
  [/sz/, 's'],
  [/ś/, 'sz'],
  [/cz/, 'c'],
  [/ć/, 'cz'],
  [/rz/, 'r'],
  [/ż/, 'z'],
  [/ą/, 'a'],
  [/ę/, 'en'],
  [/w/, 'ł'],
  [/y/, 'i'],
];

const CNR_MISTAKES: [RegExp, string][] = [
  [/č/, 'ć'],
  [/ć/, 'č'],
  [/š/, 's'],
  [/ž/, 'z'],
  [/đ/, 'dž'],
  [/dž/, 'đ'],
  [/lj/, 'l'],
  [/nj/, 'n'],
  [/ije/, 'e'],
  [/h/, 'k'],
];
const EN_MISTAKES: [RegExp, string][] = [
  [/th/, 's'],
  [/w/, 'v'],
  [/ee/, 'i'],
  [/v/, 'w'],
  [/a/, 'e'],
  [/r/, 'l'],
];
const HE_MISTAKES: [RegExp, string][] = [
  [/ח/, 'ה'],
  [/צ/, 'ס'],
  [/כ/, 'ק'],
  [/ר/, 'ל'],
];
const MISTAKES = { pl: PL_MISTAKES, cnr: CNR_MISTAKES, en: EN_MISTAKES, he: HE_MISTAKES }[COURSE];

export function mispronounce(target: string): string {
  let out = target.toLocaleLowerCase('pl-PL');
  let applied = 0;
  for (const [pattern, replacement] of MISTAKES) {
    if (pattern.test(out)) {
      out = out.replace(pattern, replacement);
      applied++;
      if (applied >= 2) break;
    }
  }
  if (applied === 0) out = out.slice(0, Math.max(1, out.length - 2));
  return out;
}

export function truncate(target: string): string {
  const words = target.split(/\s+/);
  if (words.length > 1) return words.slice(0, Math.ceil(words.length / 2)).join(' ');
  return target.slice(0, Math.ceil(target.length / 2));
}
