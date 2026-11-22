import type { ContrastGroup } from '../minimalPairs';

/** Montenegrin minimal pairs: real words that differ in one sound Hebrew and English speakers merge. */
export const CNR_CONTRAST_GROUPS: ContrastGroup[] = [
  {
    id: 'cnr-ch',
    title: 'č · dž מול ć · đ',
    soundA: 'č · dž',
    soundB: 'ć · đ',
    descriptionA: 'קשות: קצה הלשון משוך אחורה, השפתיים בולטות קדימה. צליל עבה, כמו ch ב-church.',
    descriptionB: 'רכות: קצה הלשון מאחורי השיניים התחתונות, גב הלשון מורם, חיוך. צליל דק – כמעט "טְי" ו"דְי".',
    descriptionAEn: 'Hard: tongue tip pulled back, lips pushed forward. A thick sound, like ch in "church".',
    descriptionBEn: 'Soft: tongue tip behind the lower teeth, middle of the tongue raised, a smile. A thin sound – almost "ty" and "dy".',
    pairs: [
      {
        id: 'cnr-ch-1',
        a: { polish: 'čuti', syllablesPolish: '[ču]·ti', english: 'to hear', hebrew: 'לשמוע', phoneticHebrew: '[צ׳וּ]·טִי' },
        b: { polish: 'ćuti', syllablesPolish: '[ću]·ti', english: 'be quiet!', hebrew: 'שקט! (תשתוק)', phoneticHebrew: '[צְ׳יוּ]·טִי' },
      },
      {
        id: 'cnr-ch-2',
        a: { polish: 'kuče', syllablesPolish: '[ku]·če', english: 'puppy', hebrew: 'כלבלב', phoneticHebrew: '[קוּ]·צ׳ֶה' },
        b: { polish: 'kuće', syllablesPolish: '[ku]·će', english: 'houses', hebrew: 'בתים', phoneticHebrew: '[קוּ]·צְ׳יֶה' },
      },
      {
        id: 'cnr-ch-3',
        a: { polish: 'čar', syllablesPolish: '[čar]', english: 'charm', hebrew: 'קסם', phoneticHebrew: '[צ׳ָאר]' },
        b: { polish: 'ćar', syllablesPolish: '[ćar]', english: 'profit', hebrew: 'רווח', phoneticHebrew: '[צְ׳יָאר]' },
      },
      {
        id: 'cnr-ch-4',
        a: { polish: 'džak', syllablesPolish: '[džak]', english: 'sack', hebrew: 'שק', phoneticHebrew: '[גָ׳אק]' },
        b: { polish: 'đak', syllablesPolish: '[đak]', english: 'pupil', hebrew: 'תלמיד', phoneticHebrew: '[גְ׳יָאק]' },
      },
    ],
  },
  {
    id: 'cnr-sh',
    title: 'š מול s',
    soundA: 'š',
    soundB: 's',
    descriptionA: 'š: ש – הלשון מעט אחורה, השפתיים מעוגלות.',
    descriptionB: 's: ס רגילה – הלשון מאחורי השיניים העליונות, שפתיים רפויות.',
    descriptionAEn: 'š: sh – tongue slightly back, lips rounded.',
    descriptionBEn: 's: a plain s – tongue behind the upper teeth, relaxed lips.',
    pairs: [
      {
        id: 'cnr-sh-1',
        a: { polish: 'šuma', syllablesPolish: '[šu]·ma', english: 'forest', hebrew: 'יער', phoneticHebrew: '[שׁוּ]·מָה' },
        b: { polish: 'suma', syllablesPolish: '[su]·ma', english: 'sum', hebrew: 'סכום', phoneticHebrew: '[סוּ]·מָה' },
      },
      {
        id: 'cnr-sh-2',
        a: { polish: 'šala', syllablesPolish: '[ša]·la', english: 'joke', hebrew: 'בדיחה', phoneticHebrew: '[שָׁא]·לָה' },
        b: { polish: 'sala', syllablesPolish: '[sa]·la', english: 'hall', hebrew: 'אולם', phoneticHebrew: '[סָא]·לָה' },
      },
      {
        id: 'cnr-sh-3',
        a: { polish: 'šok', syllablesPolish: '[šok]', english: 'shock', hebrew: 'הלם', phoneticHebrew: '[שׁוֹק]' },
        b: { polish: 'sok', syllablesPolish: '[sok]', english: 'juice', hebrew: 'מיץ', phoneticHebrew: '[סוֹק]' },
      },
    ],
  },
  {
    id: 'cnr-zh',
    title: 'ž מול z',
    soundA: 'ž',
    soundB: 'z',
    descriptionA: 'ž: ז׳ – המיקום של š, עם קול.',
    descriptionB: 'z: ז רגילה – המיקום של s, עם קול.',
    descriptionAEn: 'ž: zh – the š position, with voice.',
    descriptionBEn: 'z: a plain z – the s position, with voice.',
    pairs: [
      {
        id: 'cnr-zh-1',
        a: { polish: 'koža', syllablesPolish: '[ko]·ža', english: 'skin', hebrew: 'עור', phoneticHebrew: '[קוֹ]·ז׳ָה' },
        b: { polish: 'koza', syllablesPolish: '[ko]·za', english: 'goat', hebrew: 'עז', phoneticHebrew: '[קוֹ]·זָה' },
      },
      {
        id: 'cnr-zh-2',
        a: { polish: 'žar', syllablesPolish: '[žar]', english: 'embers', hebrew: 'גחלים', phoneticHebrew: '[ז׳ָאר]' },
        b: { polish: 'zar', syllablesPolish: '[zar]', english: 'really? (question word)', hebrew: 'האם באמת?', phoneticHebrew: '[זָאר]' },
      },
    ],
  },
  {
    id: 'cnr-soft',
    title: 'l · n מול lj · nj',
    soundA: 'l · n',
    soundB: 'lj · nj',
    descriptionA: 'l, n רגילות: רק קצה הלשון נוגע מאחורי השיניים.',
    descriptionB: 'lj, nj: צליל אחד רך – גב הלשון כולו נצמד לחך, כמו "לְי" ו"נְי" מהירות.',
    descriptionAEn: 'Plain l, n: only the tongue tip touches behind the teeth.',
    descriptionBEn: 'lj, nj: one soft sound – the whole middle of the tongue presses on the palate, a quick "ly" / "ny".',
    pairs: [
      {
        id: 'cnr-soft-1',
        a: { polish: 'bole', syllablesPolish: '[bo]·le', english: '(they) hurt', hebrew: 'כואבים', phoneticHebrew: '[בּוֹ]·לֶה' },
        b: { polish: 'bolje', syllablesPolish: '[bo]·lje', english: 'better', hebrew: 'יותר טוב', phoneticHebrew: '[בּוֹ]·לְיֶה' },
      },
      {
        id: 'cnr-soft-2',
        a: { polish: 'mane', syllablesPolish: '[ma]·ne', english: 'flaws', hebrew: 'פגמים', phoneticHebrew: '[מָא]·נֶה' },
        b: { polish: 'manje', syllablesPolish: '[ma]·nje', english: 'less', hebrew: 'פחות', phoneticHebrew: '[מָא]·נְיֶה' },
      },
    ],
  },
];
