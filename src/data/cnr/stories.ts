import type { GlossEntry, Story, StoryLine } from '../stories';

/**
 * Mini stories of the Montenegrin course (same format as data/stories): standard Ijekavian Latin,
 * with Montenegrin vocabulary where it differs from its neighbours (kafa, sjutra). Meanings and notes
 * are in Hebrew and English; inflected words name their dictionary form and the case that changed them.
 */

const g = (he: string, en: string, base?: string, noteHe?: string, noteEn?: string): GlossEntry => ({
  t: { he, en },
  base,
  note: noteHe && noteEn ? { he: noteHe, en: noteEn } : undefined,
});
const L = (speaker: string, text: string, he: string, en: string): StoryLine => ({ speaker, polish: text, t: { he, en } });
const o = (text: string, he: string, en: string, correct = false) => ({ polish: text, t: { he, en }, correct });

/** Words shared by several stories. */
export const CNR_COMMON: Record<string, GlossEntry> = {
  je: g('הוא / היא / זה (נמצא)', 'is', 'biti', 'biti (להיות) → je: הוא / היא / זה.', 'biti (to be) → je: he / she / it is.'),
  i: g('ו־ / וגם', 'and, also'),
  a: g('ו־ / ואילו', 'and, while'),
  u: g('ב־ / ל־', 'in, at, into'),
  na: g('על / ל־', 'on, to'),
  ne: g('לא', 'no, not'),
  da: g('כן', 'yes'),
  li: g('(מילת שאלה)', '(question word)', undefined, 'Je li…? / Mogu li…? – li הופכת את המשפט לשאלת כן או לא.', 'Je li…? / Mogu li…? – li turns the sentence into a yes/no question.'),
  sad: g('עכשיו', 'now'),
  kafa: g('קפה', 'coffee'),
  malo: g('קצת', 'a little'),
  hvala: g('תודה', 'thank you'),
  molim: g('בבקשה', 'please'),
  pa: g('נו / הרי', 'well, but'),
  dobro: g('טוב', 'good, well'),
  sjutra: g('מחר', 'tomorrow', undefined, 'sjutra היא הצורה המונטנגרית (בסרבית: sutra).', 'sjutra is the Montenegrin form (Serbian: sutra).'),
};

export const CNR_STORIES: Story[] = [
  {
    id: 'polako',
    title: { he: 'לאט, לאט', en: 'Slowly, slowly' },
    titlePl: 'Polako, polako',
    blurb: { he: 'במונטנגרו צוחקים על עצמם: העיקר לא למהר.', en: 'Montenegrins joke about themselves: the main thing is never to hurry.' },
    lines: [
      L('Ana', 'Marko, kad počinje posao?', 'מרקו, מתי מתחילה העבודה?', 'Marko, when does work start?'),
      L('Marko', 'U devet.', 'בתשע.', 'At nine.'),
      L('Ana', 'Sad je deset!', 'עכשיו עשר!', 'It is ten now!'),
      L('Marko', 'Polako, polako. Prvo kafa.', 'לאט, לאט. קודם קפה.', 'Slowly, slowly. Coffee first.'),
      L('Ana', 'A poslije kafe?', 'ואחרי הקפה?', 'And after the coffee?'),
      L('Marko', 'Poslije kafe je ručak.', 'אחרי הקפה – ארוחת צהריים.', 'After coffee comes lunch.'),
      L('Ana', 'A kad radiš?', 'ומתי אתה עובד?', 'And when do you work?'),
      L('Marko', 'Sjutra. Možda.', 'מחר. אולי.', 'Tomorrow. Maybe.'),
    ],
    glossary: {
      marko: g('מרקו (שם)', 'Marko (a name)'),
      kad: g('מתי', 'when'),
      počinje: g('מתחיל/ה', 'starts', 'počinjati', 'počinjati (להתחיל) → počinje: הוא / היא / זה מתחיל.', 'počinjati (to start) → počinje: he / she / it starts.'),
      posao: g('עבודה', 'work, job'),
      devet: g('תשע', 'nine', undefined, 'U devet = בתשע (בשעה תשע).', 'U devet = at nine (o’clock).'),
      deset: g('עשר', 'ten'),
      polako: g('לאט', 'slowly', undefined, 'Polako היא כמעט סיסמה במונטנגרו: לאט, בלי לחץ.', 'Polako is almost a motto in Montenegro: slowly, no stress.'),
      prvo: g('קודם', 'first'),
      poslije: g('אחרי', 'after'),
      kafe: g('קפה', 'coffee', 'kafa', 'kafa → kafe: אחרי poslije ("אחרי") באה יחסת קניין: ‎-a הופכת ל-‎-e.', 'kafa → kafe: poslije ("after") takes the genitive: -a becomes -e.'),
      ručak: g('ארוחת צהריים', 'lunch'),
      radiš: g('אתה עובד', 'you work', 'raditi', 'raditi (לעבוד) → radiš: אתה עובד – הסיומת ‎-š מסמנת "אתה".', 'raditi (to work) → radiš: you work – the ending -š marks "you".'),
      možda: g('אולי', 'maybe'),
    },
    questions: [
      {
        q: 'Kad počinje posao?',
        t: { he: 'מתי מתחילה העבודה?', en: 'When does work start?' },
        options: [o('U devet.', 'בתשע.', 'At nine.', true), o('U deset.', 'בעשר.', 'At ten.'), o('Sjutra.', 'מחר.', 'Tomorrow.')],
      },
      {
        q: 'Šta Marko radi prvo?',
        t: { he: 'מה מרקו עושה קודם?', en: 'What does Marko do first?' },
        options: [o('Pije kafu.', 'שותה קפה.', 'He drinks coffee.', true), o('Radi.', 'עובד.', 'He works.'), o('Jede ručak.', 'אוכל ארוחת צהריים.', 'He eats lunch.')],
      },
    ],
  },
  {
    id: 'hladno-more',
    title: { he: 'הים רק קצת קר', en: 'The sea is only a little cold' },
    titlePl: 'More je malo hladno',
    blurb: { he: 'יוני בבודווה. נינה מבטיחה שהמים חמימים.', en: 'June in Budva. Nina promises the water is warm.' },
    lines: [
      L('Nina', 'Hajde u more!', 'יאללה, לים!', 'Come on, into the sea!'),
      L('Luka', 'Je li voda hladna?', 'המים קרים?', 'Is the water cold?'),
      L('Nina', 'Ne, topla je!', 'לא, הם חמימים!', 'No, it is warm!'),
      L('Luka', 'Sigurno?', 'בטוח?', 'Are you sure?'),
      L('Nina', 'Sigurno! Hajde!', 'בטוח! יאללה!', 'Sure! Come on!'),
      L('Luka', 'Joj! Ledena je!', 'אוי! הם קפואים!', 'Ouch! It is ice-cold!'),
      L('Nina', 'Pa, malo je hladna.', 'נו, הם קצת קרים.', 'Well, it is a little cold.'),
      L('Luka', 'Malo?! Idem na kafu.', 'קצת?! אני הולך לשתות קפה.', 'A little?! I am going for a coffee.'),
    ],
    glossary: {
      hajde: g('יאללה / בוא', 'come on'),
      more: g('ים', 'sea', undefined, 'u more = לתוך הים. כשמדברים על כיוון, u בא עם יחסת מושא, ו-more נשאר אותו דבר.', 'u more = into the sea. For a direction u takes the accusative, and more stays the same.'),
      voda: g('מים', 'water', undefined, 'voda היא נקבה, ולכן hladna, topla, ledena – כולם בסיומת ‎-a.', 'voda is feminine, so hladna, topla and ledena all end in -a.'),
      hladna: g('קרה', 'cold', 'hladan', 'hladan → hladna: נקבה, מתאים ל-voda.', 'hladan → hladna: feminine, agrees with voda.'),
      topla: g('חמימה', 'warm', 'topao', 'topao → topla: נקבה, וה-l חוזרת.', 'topao → topla: feminine, and the l comes back.'),
      sigurno: g('בטוח', 'sure'),
      joj: g('אוי!', 'ouch! oh no!'),
      ledena: g('קפואה', 'ice-cold', 'leden', 'leden (קפוא, מ-led = קרח) → ledena: נקבה.', 'leden (icy, from led = ice) → ledena: feminine.'),
      idem: g('אני הולך', 'I go, I am going', 'ići', 'ići (ללכת) → idem: אני הולך.', 'ići (to go) → idem: I go.'),
      kafu: g('קפה', 'coffee', 'kafa', 'kafa → kafu: אחרי na (לאן?) באה יחסת מושא: ‎-a הופכת ל-‎-u. Idem na kafu = אני הולך לשתות קפה.', 'kafa → kafu: na (where to?) takes the accusative: -a becomes -u. Idem na kafu = I am going for a coffee.'),
    },
    questions: [
      {
        q: 'Kakva je voda?',
        t: { he: 'איך המים?', en: 'What is the water like?' },
        options: [o('Ledena.', 'קפואים.', 'Ice-cold.', true), o('Topla.', 'חמימים.', 'Warm.'), o('Vruća.', 'רותחים.', 'Hot.')],
      },
      {
        q: 'Gdje ide Luka na kraju?',
        t: { he: 'לאן לוקה הולך בסוף?', en: 'Where does Luka go at the end?' },
        options: [o('Na kafu.', 'לשתות קפה.', 'For a coffee.', true), o('U more.', 'לים.', 'Into the sea.'), o('Kući.', 'הביתה.', 'Home.')],
      },
    ],
  },
  {
    id: 'rakija-za-dorucak',
    title: { he: 'ראקיה לארוחת בוקר', en: 'Rakija for breakfast' },
    titlePl: 'Rakija za doručak',
    blurb: { he: 'במונטנגרו האורח הוא מלך. גם בתשע בבוקר.', en: 'In Montenegro the guest is king. Even at nine in the morning.' },
    lines: [
      L('Vuko', 'Dobro jutro! Izvolite, rakija!', 'בוקר טוב! בבקשה, ראקיה!', 'Good morning! Here you go, rakija!'),
      L('Ema', 'Rakija? Sad? Pa jutro je!', 'ראקיה? עכשיו? הרי עכשיו בוקר!', 'Rakija? Now? But it is morning!'),
      L('Vuko', 'Domaća je! Za zdravlje!', 'היא תוצרת בית! לבריאות!', 'It is homemade! To your health!'),
      L('Ema', 'Ne, hvala. Može kafa?', 'לא, תודה. אפשר קפה?', 'No, thanks. Can I have a coffee?'),
      L('Vuko', 'Može! Kafa i rakija.', 'אפשר! קפה וראקיה.', 'Sure! Coffee and rakija.'),
      L('Ema', 'Samo kafa, molim.', 'רק קפה, בבקשה.', 'Just coffee, please.'),
      L('Vuko', 'Dobro, dobro. Živjeli!', 'טוב, טוב. לחיים!', 'OK, OK. Cheers!'),
      L('Ema', 'Ali to je opet rakija!', 'אבל זו שוב ראקיה!', 'But that is rakija again!'),
    ],
    glossary: {
      jutro: g('בוקר', 'morning', undefined, 'Dobro jutro = בוקר טוב.', 'Dobro jutro = good morning.'),
      izvolite: g('בבקשה (הנה)', 'here you are'),
      rakija: g('ראקיה', 'rakija', undefined, 'ראקיה היא משקה חריף מפירות. מגישים אותה לאורחים בכל שעה.', 'Rakija is a strong fruit brandy, offered to guests at any hour.'),
      domaća: g('תוצרת בית', 'homemade', 'domaći', 'domaći → domaća: נקבה, מתאים ל-rakija.', 'domaći → domaća: feminine, agrees with rakija.'),
      za: g('בשביל / ל־', 'for'),
      zdravlje: g('בריאות', 'health', undefined, 'Za zdravlje! = לבריאות!', 'Za zdravlje! = to your health!'),
      može: g('אפשר', 'can, may', 'moći', 'Može kafa? = אפשר קפה? והתשובה: Može! = אפשר!', 'Može kafa? = can I have a coffee? And the answer: Može! = sure!'),
      samo: g('רק', 'just, only'),
      živjeli: g('לחיים!', 'cheers!'),
      ali: g('אבל', 'but'),
      to: g('זה', 'that, it'),
      opet: g('שוב', 'again'),
    },
    questions: [
      {
        q: 'Šta Ema hoće?',
        t: { he: 'מה אמה רוצה?', en: 'What does Ema want?' },
        options: [o('Samo kafu.', 'רק קפה.', 'Just coffee.', true), o('Rakiju.', 'ראקיה.', 'Rakija.'), o('Čašu vode.', 'כוס מים.', 'A glass of water.')],
      },
      {
        q: 'Kakva je rakija?',
        t: { he: 'איזו ראקיה זו?', en: 'What kind of rakija is it?' },
        options: [o('Domaća.', 'תוצרת בית.', 'Homemade.', true), o('Iz prodavnice.', 'מהחנות.', 'From the shop.'), o('Hladna.', 'קרה.', 'Cold.')],
      },
    ],
  },
  {
    id: 'macke-u-kotoru',
    title: { he: 'החתולות של קוטור', en: 'The cats of Kotor' },
    titlePl: 'Mačke u Kotoru',
    blurb: { he: 'בקוטור יש יותר חתולים מתיירים. כמעט.', en: 'Kotor has more cats than tourists. Almost.' },
    lines: [
      L('Tom', 'Gle, mačka!', 'תראי, חתולה!', 'Look, a cat!'),
      L('Jelena', 'Ovo je Kotor. Ovdje ima mnogo mačaka.', 'זו קוטור. יש כאן הרבה חתולים.', 'This is Kotor. There are lots of cats here.'),
      L('Tom', 'Gle, još jedna! I još jedna!', 'תראי, עוד אחת! ועוד אחת!', 'Look, another one! And another one!'),
      L('Jelena', 'Da, da. Mačke su ovdje kraljice.', 'כן, כן. החתולות הן המלכות כאן.', 'Yes, yes. Cats are the queens here.'),
      L('Tom', 'Kako se zovu?', 'איך קוראים להן?', 'What are their names?'),
      L('Jelena', 'Ova je Maca. I ova je Maca. Sve su Maca!', 'זאת Maca. וגם זאת Maca. כולן Maca!', 'This one is Maca. And this one is Maca. They are all Maca!'),
      L('Tom', 'Mogu li uzeti jednu?', 'אפשר לקחת אחת?', 'Can I take one?'),
      L('Jelena', 'Ne možeš. Mačka bira tebe!', 'אי אפשר. החתולה בוחרת בך!', 'You can’t. The cat chooses you!'),
    ],
    glossary: {
      gle: g('תראה!', 'look!', undefined, 'Gle! הוא קיצור של Gledaj! ("תסתכל!").', 'Gle! is short for Gledaj! ("look!").'),
      mačka: g('חתולה', 'cat', undefined, 'mačka (נקבה) היא המילה הרגילה לחתול.', 'mačka (feminine) is the everyday word for a cat.'),
      ovo: g('זה', 'this'),
      kotor: g('קוטור', 'Kotor', undefined, 'קוטור – עיר עתיקה על מפרץ, מפורסמת בחתולים שלה.', 'Kotor is an old town on a bay, famous for its cats.'),
      ovdje: g('כאן', 'here'),
      ima: g('יש', 'there is, there are', 'imati', 'imati (שיש ל־) → ima: יש.', 'imati (to have) → ima: there is, there are.'),
      mnogo: g('הרבה', 'a lot, many'),
      mačaka: g('חתולים', 'cats', 'mačka', 'mačka → mačaka: אחרי mnogo ("הרבה") באה יחסת קניין ברבים, ונוספת a.', 'mačka → mačaka: mnogo ("many") takes the genitive plural, and an a is added.'),
      još: g('עוד', 'another, more'),
      jedna: g('אחת', 'one'),
      mačke: g('חתולות', 'cats', 'mačka', 'mačka → mačke: רבים – ‎-a הופכת ל-‎-e.', 'mačka → mačke: plural – -a becomes -e.'),
      su: g('הן (נמצאות)', 'are', 'biti', 'biti → su: הם / הן.', 'biti → su: they are.'),
      kraljice: g('מלכות', 'queens', 'kraljica', 'kraljica → kraljice: רבים.', 'kraljica → kraljice: plural.'),
      kako: g('איך', 'how'),
      se: g('(את) עצמו', '(oneself)', undefined, 'zovu se = נקראות (מילולית: "קוראות לעצמן").', 'zovu se = they are called (literally "they call themselves").'),
      zovu: g('קוראים', 'call', 'zvati', 'zvati → zovu: הם קוראים. Kako se zovu? = איך קוראים להן?', 'zvati → zovu: they call. Kako se zovu? = what are they called?'),
      ova: g('זאת', 'this one'),
      maca: g('Maca (חתלתולה)', 'Maca (kitty)', undefined, 'Maca = "חתלתולה" – השם שכולם נותנים לחתולה.', 'Maca means "kitty" – the name everybody gives a cat.'),
      sve: g('כולן', 'all'),
      mogu: g('אני יכול', 'I can', 'moći', 'moći (יכול) → mogu: אני יכול. Mogu li…? = אפשר…?', 'moći (can) → mogu: I can. Mogu li…? = can I…?'),
      jednu: g('אחת', 'one', 'jedna', 'jedna → jednu: מושא ישיר – ‎-a הופכת ל-‎-u.', 'jedna → jednu: direct object – -a becomes -u.'),
      uzeti: g('לקחת', 'to take'),
      možeš: g('אתה יכול', 'you can', 'moći', 'moći → možeš: אתה יכול. Ne možeš = אי אפשר.', 'moći → možeš: you can. Ne možeš = you can’t.'),
      bira: g('בוחרת', 'chooses', 'birati', 'birati (לבחור) → bira: הוא / היא בוחר/ת.', 'birati (to choose) → bira: he / she chooses.'),
      tebe: g('אותך', 'you', 'ti', 'ti (אתה) → tebe: אותך.', 'ti (you) → tebe: you (as the object).'),
    },
    questions: [
      {
        q: 'Čega ima mnogo u Kotoru?',
        t: { he: 'ממה יש הרבה בקוטור?', en: 'What is there a lot of in Kotor?' },
        options: [o('Mačaka.', 'חתולים.', 'Cats.', true), o('Pasa.', 'כלבים.', 'Dogs.'), o('Autobusa.', 'אוטובוסים.', 'Buses.')],
      },
      {
        q: 'Kako se zovu mačke?',
        t: { he: 'איך קוראים לחתולות?', en: 'What are the cats called?' },
        options: [o('Sve su Maca.', 'כולן Maca.', 'They are all Maca.', true), o('Ana i Marko.', 'אנה ומרקו.', 'Ana and Marko.'), o('Nemaju ime.', 'אין להן שם.', 'They have no name.')],
      },
    ],
  },
];

/** Voice of each character: Goran reads the men, Vesna the women. */
export const CNR_VOICES: Record<string, 'f' | 'm'> = {
  Ana: 'f',
  Marko: 'm',
  Nina: 'f',
  Luka: 'm',
  Vuko: 'm',
  Ema: 'f',
  Tom: 'm',
  Jelena: 'f',
};
