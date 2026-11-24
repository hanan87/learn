import type { Lang } from '../../i18n/lang';

/**
 * Alef-Bet: the Hebrew letters and vowel signs, taught before the phrase units of the Hebrew course.
 *
 * The unit has eight lessons. Each lesson introduces a few cards (a letter, a letter form or a vowel
 * sign) and then four real words written only with the cards learned so far (tests/unit/he.test.ts
 * checks this). The words are ordinary items of unit h0 (data/he/units.ts); the cards live here.
 *
 * A card's sound is written in the course's Latin transcription (English-style: sh, kh, ts, v, y);
 * lib/latinRespell turns it into Polish or Montenegrin letters. An empty sound means "silent".
 */

type Tri = { en: string; pl: string; cnr: string };

export interface HeLetter {
  id: string;
  kind: 'letter' | 'vowel';
  /** What the card shows: the letter and its final form, or vowel signs on an alef. */
  glyph: string;
  /** The letter's name, vocalized (spoken by the teacher); vowels have none. */
  nameHe?: string;
  /** Latin sound; '' = silent. */
  sound: string;
  /** Shown instead of the sound when it is not one sound (the shva: none, or a short e). */
  display?: string;
  /** How to read it, in the learner's language. */
  tip: Tri;
  /** A word (vocalized) where the card is heard – the matching letter is highlighted. */
  example: string;
  /** Cluster keys (letter + meaningful dot) or vowel marks this card stands for. */
  keys?: string[];
  marks?: string[];
  /** False when the sound quiz would be unfair (the shva has no fixed sound). */
  quiz?: boolean;
}

const DAGESH = 'ּ';
const SHIN_DOT = 'ׁ';
const SIN_DOT = 'ׂ';
const HOLAM = 'ֹ';
const SHVA = 'ְ';

export const HE_LETTERS: HeLetter[] = [
  // Lesson 1
  {
    id: 'alef',
    kind: 'letter',
    glyph: 'א',
    nameHe: 'אָלֶף',
    sound: '',
    keys: ['א'],
    example: 'אַבָּא',
    tip: {
      en: 'Alef is silent: it only carries a vowel sign.',
      pl: 'Alef jest nieme: niesie tylko znak samogłoski.',
      cnr: 'Alef se ne čuje: nosi samo znak samoglasnika.',
    },
  },
  {
    id: 'bet',
    kind: 'letter',
    glyph: 'בּ',
    nameHe: 'בֵּית',
    sound: 'b',
    keys: ['בּ'],
    example: 'אַבָּא',
    tip: {
      en: 'Bet with a dot inside is b. In most other letters, like דּ, the dot changes nothing.',
      pl: 'Bet z kropką w środku to b. W większości innych liter, jak דּ, kropka niczego nie zmienia.',
      cnr: 'Bet sa tačkom unutra je b. U većini drugih slova, kao דּ, tačka ništa ne mijenja.',
    },
  },
  {
    id: 'gimel',
    kind: 'letter',
    glyph: 'ג',
    nameHe: 'גִּימֶל',
    sound: 'g',
    keys: ['ג'],
    example: 'גַּג',
    tip: {
      en: 'Always a hard g, as in "go".',
      pl: 'Zawsze twarde g, jak w „góra”.',
      cnr: 'Uvijek g, kao u „grad”.',
    },
  },
  {
    id: 'dalet',
    kind: 'letter',
    glyph: 'ד',
    nameHe: 'דָּלֶת',
    sound: 'd',
    keys: ['ד'],
    example: 'דָּג',
    tip: {
      en: 'd, as in "dog". Its top has a sharp corner.',
      pl: 'd. U góry ma ostry róg.',
      cnr: 'd. Gore ima oštar ugao.',
    },
  },
  {
    id: 'vowel-a',
    kind: 'vowel',
    glyph: 'אַ אָ',
    sound: 'a',
    marks: ['ַ', 'ָ'],
    example: 'דָּג',
    tip: {
      en: 'A line (אַ) or a small T (אָ) under a letter: both say a, as in "father".',
      pl: 'Kreska (אַ) albo małe T (אָ) pod literą: obie to a.',
      cnr: 'Crtica (אַ) ili malo T (אָ) ispod slova: oboje je a.',
    },
  },
  // Lesson 2
  {
    id: 'he',
    kind: 'letter',
    glyph: 'ה',
    nameHe: 'הֵא',
    sound: 'h',
    keys: ['ה'],
    example: 'הַגָּדָה',
    tip: {
      en: 'h at the start of a word, a light breath. At the end of a word it is silent.',
      pl: 'h na początku wyrazu, lekki wydech. Na końcu wyrazu jest nieme.',
      cnr: 'h na početku riječi, lagan izdah. Na kraju riječi se ne čuje.',
    },
  },
  {
    id: 'lamed',
    kind: 'letter',
    glyph: 'ל',
    nameHe: 'לָמֶד',
    sound: 'l',
    keys: ['ל'],
    example: 'גַּל',
    tip: {
      en: 'l – the tallest letter, it rises above the line.',
      pl: 'l – najwyższa litera, wystaje ponad linię.',
      cnr: 'l – najviše slovo, izlazi iznad reda.',
    },
  },
  {
    id: 'mem',
    kind: 'letter',
    glyph: 'מ ם',
    nameHe: 'מֵם',
    sound: 'm',
    keys: ['מ', 'ם'],
    example: 'גַּם',
    tip: {
      en: 'm. At the end of a word it takes a closed, square form: ם.',
      pl: 'm. Na końcu wyrazu ma zamkniętą, kwadratową formę: ם.',
      cnr: 'm. Na kraju riječi ima zatvoren, četvrtast oblik: ם.',
    },
  },
  // Lesson 3
  {
    id: 'vowel-i',
    kind: 'vowel',
    glyph: 'אִ',
    sound: 'i',
    marks: ['ִ'],
    example: 'אִמָּא',
    tip: {
      en: 'A dot under a letter is i, as in "ski". Often a י follows it, with the same sound: אִי.',
      pl: 'Kropka pod literą to i. Często stoi po niej י, z tym samym dźwiękiem: אִי.',
      cnr: 'Tačka ispod slova je i. Često iza nje stoji י, s istim glasom: אִי.',
    },
  },
  {
    id: 'nun',
    kind: 'letter',
    glyph: 'נ ן',
    nameHe: 'נוּן',
    sound: 'n',
    keys: ['נ', 'ן'],
    example: 'גַּן',
    tip: {
      en: 'n. At the end of a word it is a long line going down: ן.',
      pl: 'n. Na końcu wyrazu to długa kreska w dół: ן.',
      cnr: 'n. Na kraju riječi je duga crta nadolje: ן.',
    },
  },
  {
    id: 'shin',
    kind: 'letter',
    glyph: 'שׁ',
    nameHe: 'שִׁין',
    sound: 'sh',
    keys: ['שׁ'],
    example: 'שָׁנָה',
    tip: {
      en: 'With the dot on the right, שׁ is sh, as in "shop".',
      pl: 'Z kropką po prawej שׁ to sz.',
      cnr: 'Sa tačkom desno שׁ je š.',
    },
  },
  {
    id: 'yud',
    kind: 'letter',
    glyph: 'י',
    nameHe: 'יוּד',
    sound: 'y',
    keys: ['י'],
    example: 'יָם',
    tip: {
      en: 'The smallest letter: y, as in "yes". After a vowel it helps make i, ei or ai.',
      pl: 'Najmniejsza litera: j. Po samogłosce pomaga tworzyć i, ej lub aj.',
      cnr: 'Najmanje slovo: j. Poslije samoglasnika pomaže da se dobije i, ej ili aj.',
    },
  },
  // Lesson 4
  {
    id: 'vowel-o',
    kind: 'vowel',
    glyph: 'אוֹ אֹ',
    sound: 'o',
    keys: ['וֹ'],
    marks: [HOLAM],
    example: 'אוֹר',
    tip: {
      en: 'A dot on top is o: usually on a vav (וֹ), sometimes on its own (אֹ).',
      pl: 'Kropka na górze to o: zwykle na waw (וֹ), czasem sama (אֹ).',
      cnr: 'Tačka gore je o: obično na vav (וֹ), ponekad sama (אֹ).',
    },
  },
  {
    id: 'vav',
    kind: 'letter',
    glyph: 'ו',
    nameHe: 'וָו',
    sound: 'v',
    keys: ['ו'],
    example: 'וָרֹד',
    tip: {
      en: 'Vav is v. With a dot on top (וֹ) it is o, with a dot in the middle (וּ) it is u.',
      pl: 'Waw to w. Z kropką na górze (וֹ) to o, z kropką w środku (וּ) to u.',
      cnr: 'Vav je v. Sa tačkom gore (וֹ) je o, sa tačkom u sredini (וּ) je u.',
    },
  },
  {
    id: 'tav',
    kind: 'letter',
    glyph: 'ת',
    nameHe: 'תָּו',
    sound: 't',
    keys: ['ת'],
    example: 'בַּת',
    tip: {
      en: 't, as in "top".',
      pl: 't.',
      cnr: 't.',
    },
  },
  {
    id: 'resh',
    kind: 'letter',
    glyph: 'ר',
    nameHe: 'רֵישׁ',
    sound: 'r',
    keys: ['ר'],
    example: 'מוֹרָה',
    tip: {
      en: 'r from the throat, like the French r. Its top is rounded – ד has a sharp corner.',
      pl: 'r gardłowe, jak francuskie. Góra jest zaokrąglona – ד ma ostry róg.',
      cnr: 'r iz grla, kao francusko. Gore je zaobljeno – ד ima oštar ugao.',
    },
  },
  // Lesson 5
  {
    id: 'vowel-e',
    kind: 'vowel',
    glyph: 'אֶ אֵ',
    sound: 'e',
    marks: ['ֶ', 'ֵ'],
    example: 'לֵב',
    tip: {
      en: 'Three dots (אֶ) or two dots side by side (אֵ) under a letter: both say e, as in "bed".',
      pl: 'Trzy kropki (אֶ) albo dwie obok siebie (אֵ) pod literą: obie to e.',
      cnr: 'Tri tačke (אֶ) ili dvije jedna do druge (אֵ) ispod slova: oboje je e.',
    },
  },
  {
    id: 'vet',
    kind: 'letter',
    glyph: 'ב',
    nameHe: 'וֵית',
    sound: 'v',
    keys: ['ב'],
    example: 'לֵב',
    tip: {
      en: 'Bet without the dot is v: בּ = b, ב = v.',
      pl: 'Bet bez kropki to w: בּ = b, ב = w.',
      cnr: 'Bet bez tačke je v: בּ = b, ב = v.',
    },
  },
  {
    id: 'kuf',
    kind: 'letter',
    glyph: 'ק',
    nameHe: 'קוּף',
    sound: 'k',
    keys: ['ק'],
    example: 'קָטָן',
    tip: {
      en: 'k. Its leg goes down below the line.',
      pl: 'k. Jego noga schodzi pod linię.',
      cnr: 'k. Njegova noga ide ispod reda.',
    },
  },
  {
    id: 'tet',
    kind: 'letter',
    glyph: 'ט',
    nameHe: 'טֵית',
    sound: 't',
    keys: ['ט'],
    example: 'טוֹב',
    tip: {
      en: 'Also t – it sounds exactly like ת.',
      pl: 'Też t – brzmi dokładnie jak ת.',
      cnr: 'Isto t – zvuči isto kao ת.',
    },
  },
  // Lesson 6
  {
    id: 'vowel-u',
    kind: 'vowel',
    glyph: 'וּ אֻ',
    sound: 'u',
    keys: ['וּ'],
    marks: ['ֻ'],
    example: 'כַּדּוּר',
    tip: {
      en: 'A vav with a dot in the middle (וּ) is u, as in "put". Less often, three slanted dots under a letter (אֻ) are u too.',
      pl: 'Waw z kropką w środku (וּ) to u. Rzadziej u to trzy ukośne kropki pod literą (אֻ).',
      cnr: 'Vav sa tačkom u sredini (וּ) je u. Rjeđe su u i tri kose tačke ispod slova (אֻ).',
    },
  },
  {
    id: 'kaf',
    kind: 'letter',
    glyph: 'כּ',
    nameHe: 'כַּף',
    sound: 'k',
    keys: ['כּ'],
    example: 'כַּדּוּר',
    tip: {
      en: 'Kaf with a dot is k – the same sound as ק.',
      pl: 'Kaf z kropką to k – ten sam dźwięk co ק.',
      cnr: 'Kaf sa tačkom je k – isti glas kao ק.',
    },
  },
  {
    id: 'khaf',
    kind: 'letter',
    glyph: 'כ ך',
    nameHe: 'כָף',
    sound: 'kh',
    keys: ['כ', 'ך'],
    example: 'אֹכֶל',
    tip: {
      en: 'Without the dot it is kh, a throaty sound like ch in Bach. At the end of a word: ך.',
      pl: 'Bez kropki to ch, głębokie, gardłowe. Na końcu wyrazu: ך.',
      cnr: 'Bez tačke je h, duboko iz grla. Na kraju riječi: ך.',
    },
  },
  {
    id: 'het',
    kind: 'letter',
    glyph: 'ח',
    nameHe: 'חֵית',
    sound: 'kh',
    keys: ['ח'],
    example: 'לֶחֶם',
    tip: {
      en: 'Also kh, the same throaty sound as כ. Do not mix it up with ה (h), which has a gap on top.',
      pl: 'Też ch, ten sam gardłowy dźwięk co כ. Nie myl z ה (h), które ma przerwę u góry.',
      cnr: 'Isto h iz grla, kao כ. Ne miješajte ga sa ה (h), koje ima procjep gore.',
    },
  },
  // Lesson 7
  {
    id: 'samekh',
    kind: 'letter',
    glyph: 'ס',
    nameHe: 'סָמֶךְ',
    sound: 's',
    keys: ['ס'],
    example: 'כֶּסֶף',
    tip: {
      en: 's – a round, closed letter.',
      pl: 's – okrągła, zamknięta litera.',
      cnr: 's – okruglo, zatvoreno slovo.',
    },
  },
  {
    id: 'zayin',
    kind: 'letter',
    glyph: 'ז',
    nameHe: 'זַיִן',
    sound: 'z',
    keys: ['ז'],
    example: 'זֶה',
    tip: {
      en: 'z, as in "zoo".',
      pl: 'z.',
      cnr: 'z.',
    },
  },
  {
    id: 'pe',
    kind: 'letter',
    glyph: 'פּ',
    nameHe: 'פֵּא',
    sound: 'p',
    keys: ['פּ'],
    example: 'פִּיתָה',
    tip: {
      en: 'Pe with a dot is p.',
      pl: 'Pe z kropką to p.',
      cnr: 'Pe sa tačkom je p.',
    },
  },
  {
    id: 'fe',
    kind: 'letter',
    glyph: 'פ ף',
    nameHe: 'פֵא',
    sound: 'f',
    keys: ['פ', 'ף'],
    example: 'יָפֶה',
    tip: {
      en: 'Without the dot it is f. At the end of a word: ף.',
      pl: 'Bez kropki to f. Na końcu wyrazu: ף.',
      cnr: 'Bez tačke je f. Na kraju riječi: ף.',
    },
  },
  // Lesson 8
  {
    id: 'ayin',
    kind: 'letter',
    glyph: 'ע',
    nameHe: 'עַיִן',
    sound: '',
    keys: ['ע'],
    example: 'עֵץ',
    tip: {
      en: 'Ayin is silent, like א: it only carries a vowel.',
      pl: 'Ajin jest nieme, jak א: niesie tylko samogłoskę.',
      cnr: 'Ajin se ne čuje, kao א: nosi samo samoglasnik.',
    },
  },
  {
    id: 'tsadi',
    kind: 'letter',
    glyph: 'צ ץ',
    nameHe: 'צָדִי',
    sound: 'ts',
    keys: ['צ', 'ץ'],
    example: 'עֵץ',
    tip: {
      en: 'ts, as in "cats". At the end of a word: ץ.',
      pl: 'c. Na końcu wyrazu: ץ.',
      cnr: 'c. Na kraju riječi: ץ.',
    },
  },
  {
    id: 'sin',
    kind: 'letter',
    glyph: 'שׂ',
    nameHe: 'שִׂין',
    sound: 's',
    keys: ['שׂ'],
    example: 'שִׂמְחָה',
    tip: {
      en: 'With the dot on the left, שׂ is s – the same sound as ס.',
      pl: 'Z kropką po lewej שׂ to s – jak ס.',
      cnr: 'Sa tačkom lijevo שׂ je s – kao ס.',
    },
  },
  {
    id: 'shva',
    kind: 'vowel',
    glyph: 'אְ',
    sound: '',
    marks: [SHVA],
    example: 'בְּסֵדֶר',
    display: '– / e',
    quiz: false,
    tip: {
      en: 'Two dots one above the other (אְ) mean no vowel – or a very short e. The transcription always shows which: בְּסֵדֶר = be·se·der, עִבְרִית = iv·rit.',
      pl: 'Dwie kropki jedna nad drugą (אְ) to brak samogłoski albo bardzo krótkie e. Transkrypcja zawsze to pokazuje: בְּסֵדֶר = be·se·der, עִבְרִית = iw·rit.',
      cnr: 'Dvije tačke jedna iznad druge (אְ) znače da nema samoglasnika ili vrlo kratko e. Transkripcija uvijek pokazuje: בְּסֵדֶר = be·se·der, עִבְרִית = iv·rit.',
    },
  },
];

/** Cards introduced in each Alef-Bet lesson (lesson n = index n - 1); each lesson then reads four words. */
export const ALEFBET_PLAN: string[][] = [
  ['alef', 'bet', 'gimel', 'dalet', 'vowel-a'],
  ['he', 'lamed', 'mem'],
  ['vowel-i', 'nun', 'shin', 'yud'],
  ['vowel-o', 'vav', 'tav', 'resh'],
  ['vowel-e', 'vet', 'kuf', 'tet'],
  ['vowel-u', 'kaf', 'khaf', 'het'],
  ['samekh', 'zayin', 'pe', 'fe'],
  ['ayin', 'tsadi', 'sin', 'shva'],
];

export const ALEFBET_UNIT = 'h0';

const BY_ID = new Map(HE_LETTERS.map((l) => [l.id, l]));

export function getLetter(id: string): HeLetter | undefined {
  return BY_ID.get(id);
}

/** A written letter with its marks, and the key that tells its sound (dots that change it). */
export interface Cluster {
  text: string;
  base: string;
  key: string;
  marks: string;
}

/** Split a vocalized word into letters with their marks; the key keeps only sound-changing dots. */
export function clusters(word: string): Cluster[] {
  const out: Cluster[] = [];
  for (const ch of word.normalize('NFC')) {
    if (/[א-ת]/.test(ch)) out.push({ text: ch, base: ch, key: ch, marks: '' });
    else if (out.length && /[֑-ׇ]/.test(ch)) {
      const c = out[out.length - 1];
      c.text += ch;
      c.marks += ch;
    } else out.push({ text: ch, base: '', key: '', marks: '' });
  }
  for (const c of out) {
    if (!c.base) continue;
    const dagesh = c.marks.includes(DAGESH);
    const vowel = /[ְ-ָֻ]/.test(c.marks);
    if (c.base === 'ו') c.key = c.marks.includes(HOLAM) ? 'ו' + HOLAM : dagesh && !vowel ? 'ו' + DAGESH : 'ו';
    else if ('בכפ'.includes(c.base)) c.key = dagesh ? c.base + DAGESH : c.base;
    else if (c.base === 'ש') c.key = 'ש' + (c.marks.includes(SIN_DOT) ? SIN_DOT : SHIN_DOT);
  }
  return out;
}

/** True when a written letter shows the card (its letter form, or its vowel mark). */
export function clusterShows(letter: HeLetter, c: Cluster): boolean {
  if (!c.base) return false;
  if (letter.keys?.includes(c.key)) return true;
  // A vav that is a vowel (וֹ / וּ) carries its own sound, not "v"; vowel marks only count for vowels.
  if (letter.kind !== 'vowel' || !letter.marks) return false;
  if (c.key === 'ו' + HOLAM || c.key === 'ו' + DAGESH) return false;
  return letter.marks.some((m) => c.marks.includes(m));
}

/**
 * The cards a vocalized word needs: every letter, every vowel sign. A י with no vowel of its own after
 * an i is part of that i (פִּיתָה), and the two dots inside a final ך are not read.
 */
export function cardsOfWord(word: string): Set<string> {
  const need = new Set<string>();
  const cs = clusters(word).filter((c) => c.base);
  cs.forEach((c, i) => {
    const prev = cs[i - 1];
    const vowelYud = c.base === 'י' && !/[ְ-ֻ]/.test(c.marks) && !!prev && prev.marks.includes('ִ');
    if (!vowelYud) {
      const letter = HE_LETTERS.find((l) => l.kind === 'letter' && l.keys?.includes(c.key));
      const vowelVav = HE_LETTERS.find((l) => l.kind === 'vowel' && l.keys?.includes(c.key));
      if (vowelVav) need.add(vowelVav.id);
      else if (letter) need.add(letter.id);
    }
    if (c.key === 'ו' + HOLAM || c.key === 'ו' + DAGESH) return;
    for (const v of HE_LETTERS) {
      if (v.kind !== 'vowel' || !v.marks) continue;
      if (v.id === 'shva' && c.base === 'ך') continue;
      if (v.marks.some((m) => c.marks.includes(m))) need.add(v.id);
    }
  });
  return need;
}

const SILENT: Record<Lang, string> = { he: 'שקטה', en: 'silent', pl: 'nieme', cnr: 'ne čuje se' };

/** The sound as shown to the learner ("silent" for alef and ayin). */
export function soundLabel(sound: string, lang: Lang, respellFn: (latin: string, lang: Lang) => string): string {
  if (!sound) return SILENT[lang];
  return respellFn(sound, lang);
}

