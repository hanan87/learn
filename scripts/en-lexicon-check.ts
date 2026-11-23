/**
 * Lists the words of the English course that have no entry in data/en/lexicon (they would get the
 * rule-based approximation instead of a hand-written transcription). Run:
 *   LEARN_COURSE=en npx tsx scripts/en-lexicon-check.ts
 */
import { enCourseWords } from '../src/data/en/words';
import { inLexicon } from '../src/lib/enPhonetics';

const missing = enCourseWords().filter((w) => !inLexicon(w));
console.log(missing.length ? missing.join('\n') : 'All course words are in the lexicon.');
