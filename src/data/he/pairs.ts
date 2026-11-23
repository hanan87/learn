import { toHebrewPhonetic, toSyllableNotation } from '../../lib/hePhonetics';
import type { ContrastGroup, PairWord } from '../minimalPairs';

/** Hebrew minimal pairs: real words that differ only in a sound English, Polish or Montenegrin speakers blur. */

const w = (text: string, en: string, pl: string, cnr: string): PairWord => ({
  polish: text.normalize('NFC'),
  syllablesPolish: toSyllableNotation(text),
  english: en,
  hebrew: en,
  phoneticHebrew: toHebrewPhonetic(text),
  loc: { pl, cnr },
});

/** Descriptions per side: [English, Polish, Montenegrin]. The Hebrew-interface fields repeat the English. */
function group(
  id: string,
  title: string,
  soundA: string,
  soundB: string,
  a: [string, string, string],
  b: [string, string, string],
  pairs: ContrastGroup['pairs'],
): ContrastGroup {
  return {
    id,
    title,
    soundA,
    soundB,
    descriptionA: a[0],
    descriptionB: b[0],
    descriptionAEn: a[0],
    descriptionBEn: b[0],
    loc: { pl: { descriptionA: a[1], descriptionB: b[1] }, cnr: { descriptionA: a[2], descriptionB: b[2] } },
    pairs,
  };
}

export const HE_CONTRAST_GROUPS: ContrastGroup[] = [
  group(
    'he-kh-h',
    'ח / ה',
    'ח',
    'ה',
    [
      'ח (kh): a rough sound from the back of the throat, like the ch in Bach.',
      'ח (ch): jak polskie ch, tylko głębiej w gardle.',
      'ח (h): kao naše h, samo dublje u grlu.',
    ],
    [
      'ה (h): just a light breath, as in "hello". Say khorim for horim and "parents" turn into "holes"!',
      'ה (h): tylko lekki wydech, jak w angielskim „hello”. Powiesz chorim zamiast horim – i „rodzice” zmienią się w „dziury”!',
      'ה (h): samo lagan izdah, kao u engleskom „hello”. Ako horim kažete grleno, „roditelji” postaju „rupe”!',
    ],
    [
      { id: 'he-kh-h-1', a: w('חוֹרִים', 'holes', 'dziury', 'rupe'), b: w('הוֹרִים', 'parents', 'rodzice', 'roditelji') },
      { id: 'he-kh-h-2', a: w('חֵן', 'charm', 'urok', 'šarm'), b: w('הֵן', 'they (women)', 'one (kobiety)', 'one (žene)') },
      { id: 'he-kh-h-3', a: w('חוֹד', 'sharp tip', 'czubek', 'šiljak'), b: w('הוֹד', 'glory', 'majestat', 'sjaj') },
      { id: 'he-kh-h-4', a: w('חֶבֶל', 'rope', 'lina', 'konopac'), b: w('הֶבֶל', 'nonsense', 'bzdura', 'besmislica') },
    ],
  ),
  group(
    'he-kh-k',
    'ח / כּ · ק',
    'ח',
    'כּ · ק',
    [
      'ח / כ (kh): the air rubs in the throat and the sound keeps going.',
      'ח / כ (ch): powietrze trze w gardle, a dźwięk trwa.',
      'ח / כ (h): vazduh struji kroz grlo i glas traje.',
    ],
    [
      'כּ / ק (k): a short stop with no air after it. kol is "voice", khol is "sand".',
      'כּ / ק (k): krótkie zamknięcie, bez tarcia. kol to „głos”, a chol to „piasek”.',
      'כּ / ק (k): kratak prekid, bez trenja. kol je „glas”, a hol je „pijesak”.',
    ],
    [
      { id: 'he-kh-k-1', a: w('חוֹל', 'sand', 'piasek', 'pijesak'), b: w('קוֹל', 'voice', 'głos', 'glas') },
      { id: 'he-kh-k-2', a: w('חַף', 'innocent', 'niewinny', 'nevin'), b: w('כַּף', 'spoon', 'łyżka', 'kašika') },
      { id: 'he-kh-k-3', a: w('חַם', 'hot', 'gorący', 'vruć'), b: w('קָם', 'got up', 'wstał', 'ustao') },
      { id: 'he-kh-k-4', a: w('חֵן', 'charm', 'urok', 'šarm'), b: w('כֵּן', 'yes', 'tak', 'da') },
    ],
  ),
  group(
    'he-ts-s',
    'צ / ס',
    'צ',
    'ס · שׂ',
    [
      'צ (ts): t and s glued together, as in "cats" – also at the start of a word.',
      'צ (c): dokładnie jak polskie c.',
      'צ (c): tačno kao naše c.',
    ],
    [
      'ס / שׂ (s): a plain s. Drop the t and tsir (hinge) becomes sir (pot)!',
      'ס / שׂ (s): zwykłe s. Bez „t” cir (zawias) zmienia się w sir (garnek)!',
      'ס / שׂ (s): obično s. Bez „t” cir (šarka) postaje sir (lonac)!',
    ],
    [
      { id: 'he-ts-s-1', a: w('צִיר', 'hinge', 'zawias', 'šarka'), b: w('סִיר', 'pot', 'garnek', 'lonac') },
      { id: 'he-ts-s-2', a: w('צַר', 'narrow', 'wąski', 'uzak'), b: w('שַׂר', 'minister', 'minister', 'ministar') },
      { id: 'he-ts-s-3', a: w('צָם', 'fasts', 'pości', 'posti'), b: w('סַם', 'drug', 'narkotyk', 'droga') },
      { id: 'he-ts-s-4', a: w('צוֹף', 'nectar', 'nektar', 'nektar'), b: w('סוֹף', 'end', 'koniec', 'kraj') },
    ],
  ),
];
