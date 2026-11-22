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
const MISTAKES = COURSE === 'cnr' ? CNR_MISTAKES : PL_MISTAKES;

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
