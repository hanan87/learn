import { autoBackchain, toEnglishPhonetic, toHebrewPhonetic, toSyllableNotation } from '../../lib/enPhonetics';
import type { Loc } from '../../i18n/lang';
import type { LegendRow } from '..';
import type { CourseUnitId, Formality, LearningItem, Unit, UnitColor } from '../types';
import { EN_CNR } from './cnr';
import { EN_PL } from './pl';

/**
 * Everyday English for Hebrew speakers who already know a little: the sounds Hebrew lacks, then
 * real situations – small talk, café and restaurant, directions, shopping, hotel, flights and the
 * phone. American English (voices Jenny and Guy, recognition en-US).
 *
 * Items are authored as plain English; syllables and the Hebrew-letter transcription come from the
 * hand-written lexicon (data/en/lexicon via lib/enPhonetics), so every word is spelled out the same
 * way everywhere. Tips focus on what Hebrew speakers get wrong: th, w/v, the American r, short vs
 * long i, the open a of "bad", word stress and the way words run together ("Can I" = "ke-NAI").
 * The course is taught in Hebrew, Polish and Montenegrin; the English fields simply repeat the phrase.
 * Polish and Montenegrin texts live in data/en/pl and data/en/cnr, keyed by item id.
 */

interface EnItem {
  id: string;
  text: string;
  /** Meaning in Hebrew (may use the learner templates {masculine|feminine}). */
  he: string;
  /** Pronunciation tip in Hebrew. */
  tip: string;
  /** Situation for the speak-from-memory challenge. */
  sit: string;
  formality: Formality;
  /** Usage or culture note in Hebrew. */
  note?: string;
  steps?: [string, string, string];
}

interface EnUnit {
  id: CourseUnitId;
  order: number;
  color: UnitColor;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  description: string;
  descriptionEn: string;
  items: EnItem[];
}

const SOURCES: EnUnit[] = [
  {
    id: 'e1',
    order: 1,
    color: 'violet',
    title: 'הצלילים שאין בעברית',
    titleEn: 'The sounds Hebrew does not have',
    subtitle: 'th, w מול v, r אמריקאית, ship מול sheep, bad מול bed',
    subtitleEn: 'th, w vs v, the American r, ship vs sheep, bad vs bed',
    description:
      'רוב הדוברים הישראלים מבינים אנגלית – מה שמסגיר את המבטא הם כמה צלילים שאין בעברית: th (לשון בין השיניים), w שאינה v, r שלא יוצאת מהגרון, i קצרה מול ee ארוכה (ship / sheep), ו-a הפתוחה של bad. ביחידה הזו מתרגלים אותם על מילים יומיומיות, ולומדים איפה ההטעמה.',
    descriptionEn:
      'Most Israelis understand English – what gives the accent away are a few sounds Hebrew lacks: th (tongue between the teeth), a w that is not a v, an r that does not come from the throat, short i vs long ee (ship / sheep) and the open a of "bad". This unit practises them on everyday words, together with word stress.',
    items: [
      {
        id: 'e1-01',
        text: 'think',
        he: 'לחשוב',
        tip: 'th: קצה הלשון בין השיניים ונושפים – לא "סינק" ולא "טינק". ה-i קצרה, כמעט "אֶ".',
        sit: 'מישהו שואל אם אתם בטוחים, ואתם רוצים לומר שאתם צריכים לחשוב על זה. אמרו "לחשוב".',
        formality: 'neutral',
        steps: ['in', 'ink', 'think'],
      },
      {
        id: 'e1-02',
        text: 'Thank you!',
        he: 'תודה!',
        tip: 'th בלי קול בתחילת thank, וה-a פתוחה כמו ב-bad: "תַ׳נְק". you מחובר: "תַ׳נְקְיוּ".',
        sit: 'המלצרית הביאה לכם את הקפה. הודו לה.',
        formality: 'neutral',
        steps: ['you', 'Thank', 'Thank you!'],
      },
      {
        id: 'e1-03',
        text: 'this one',
        he: 'את זה (הזה)',
        tip: 'th של this היא עם קול – לשון בין השיניים והמיתרים רוטטים: "דִ׳ס", לא "זיס" ולא "דיס".',
        sit: 'אתם מצביעים על עוגה בוויטרינה. אמרו "את זה".',
        formality: 'neutral',
        steps: ['one', 'this', 'this one'],
      },
      {
        id: 'e1-04',
        text: 'three',
        he: 'שלוש',
        tip: 'three מתחילה ב-th בלי קול ואחריה r: "ת׳רִי". אם תגידו "טרי" זה יישמע כמו tree (עץ).',
        sit: 'שואלים כמה כרטיסים אתם צריכים – שלושה. אמרו את המספר.',
        formality: 'neutral',
        steps: ['ee', 'ree', 'three'],
      },
      {
        id: 'e1-05',
        text: 'water',
        he: 'מים',
        tip: 'w בתחילה – שפתיים בעיגול, בלי שיניים. באמריקאית ה-t באמצע נשמעת כמעט כמו d מהירה: "ווָ-דֶר".',
        sit: 'אתם צמאים במסעדה. בקשו "מים" במילה אחת.',
        formality: 'neutral',
        steps: ['ter', 'wa', 'water'],
      },
      {
        id: 'e1-06',
        text: 'very well',
        he: 'טוב מאוד',
        tip: 'very מתחילה ב-v (שיניים על השפה), well ב-w (שפתיים בעיגול). זה ההבדל כולו – נסו לאט.',
        sit: 'שואלים איך הייתה הנסיעה. ענו "טוב מאוד".',
        formality: 'neutral',
        steps: ['well', 'very', 'very well'],
      },
      {
        id: 'e1-07',
        text: 'ship',
        he: 'ספינה',
        tip: 'i קצרה ורפויה – "שִׁפּ", כמעט בלי חיוך. אם תאריכו ל-"שיפ" תגידו sheep (כבשה).',
        sit: 'אתם בנמל ומצביעים על ספינת הקרוז. אמרו "ספינה".',
        formality: 'neutral',
        steps: ['it', 'hip', 'ship'],
      },
      {
        id: 'e1-08',
        text: 'sheep',
        he: 'כבשה (כבשים)',
        tip: 'ee ארוכה – מחייכים ומאריכים: "שִׁיייפּ". השוו ל-ship הקצרה.',
        sit: 'בטיול באנגליה הילד שואל מה החיות הלבנות בשדה. ענו "כבשים".',
        formality: 'neutral',
        steps: ['see', 'she', 'sheep'],
      },
      {
        id: 'e1-09',
        text: 'live',
        he: 'לגור',
        tip: 'live (לגור) עם i קצרה: "לִב". leave (לעזוב) עם ee ארוכה: "לִיב". וה-v בסוף עם קול, לא f.',
        sit: 'שואלים אתכם אם אתם תיירים או גרים כאן. אמרו את הפועל "לגור".',
        formality: 'neutral',
        steps: ['it', 'lit', 'live'],
      },
      {
        id: 'e1-10',
        text: 'bad',
        he: 'רע',
        tip: 'a של bad פתוחה מאוד – מורידים את הלסת: בין "בֶּד" ל"בַּד". bed (מיטה) היא "בֶּד" רגילה.',
        sit: 'שואלים איך היה מזג האוויר, והוא היה נורא. אמרו "רע".',
        formality: 'neutral',
        steps: ['add', 'bat', 'bad'],
      },
      {
        id: 'e1-11',
        text: 'world',
        he: 'עולם',
        tip: 'אחת המילים הקשות: w בעיגול שפתיים, אחריה "אֶר" אמריקאית (לשון מסולסלת), ואז l ו-d: "ווֶרְלְד".',
        sit: 'מדברים על טיולים ואתם רוצים לומר "העולם". אמרו את המילה.',
        formality: 'neutral',
        steps: ['were', 'whirl', 'world'],
      },
      {
        id: 'e1-12',
        text: 'comfortable',
        he: 'נוח',
        tip: 'ההטעמה על ההברה הראשונה, והאמצע נבלע: "קָאמְפְ-טֶר-בֶּל" – שלוש הברות, לא ארבע.',
        sit: 'בחנות שואלים אתכם איך הנעליים. אמרו שהן נוחות.',
        formality: 'neutral',
        steps: ['ble', 'terble', 'comfortable'],
      },
      {
        id: 'e1-13',
        text: 'Can I ask a question?',
        he: 'אפשר לשאול שאלה?',
        tip: 'מחברים מילים: "קֶנַאי אֶסְקְ אֶ קְוֶוסְצ׳ֶן". can לא מוטעם, ו-question עם "קוו" ו"צ׳ן" בסוף.',
        sit: 'אתם בסוף הרצאה ורוצים לשאול משהו. בקשו רשות לשאול שאלה.',
        formality: 'neutral',
      },
    ],
  },
  {
    id: 'e2',
    order: 2,
    color: 'sky',
    title: 'היכרות ושיחת חולין',
    titleEn: 'Meeting people and small talk',
    subtitle: 'מה שלומך, מאיפה אתה, במה אתה עובד',
    subtitleEn: 'How are you, where are you from, what do you do',
    description:
      'הדקות הראשונות של כל שיחה: ברכות, להציג את עצמכם, לשאול ולענות "מאיפה אתם" ו"במה אתם עובדים", ולבקש בנימוס שיחזרו או ידברו לאט. שימו לב: How are you? הוא ברכה, לא שאלה על הבריאות.',
    descriptionEn:
      'The first minutes of every conversation: greetings, introducing yourself, asking where people are from and what they do, and politely asking someone to repeat or slow down. Note: "How are you?" is a greeting, not a health question.',
    items: [
      {
        id: 'e2-01',
        text: 'Hi, how are you?',
        he: 'היי, מה שלומך?',
        tip: 'אומרים ברצף אחד, עם עלייה קלה בסוף: "הַאי, הָאוּ אַר יוּ". are כמעט נבלע.',
        sit: 'פגשתם עמית לעבודה במסדרון בבוקר. ברכו אותו ושאלו מה שלומו.',
        formality: 'casual',
        note: 'How are you? היא ברכה – עונים בקצרה (Fine, thanks) ולא מספרים על כאב הראש.',
      },
      {
        id: 'e2-02',
        text: "I'm fine, thanks. And you?",
        he: 'אני בסדר, תודה. ואתה?',
        tip: "I'm = \"אַיְם\" בהברה אחת. thanks עם th ו-a פתוחה. ב-And you? הקול עולה.",
        sit: 'שאלו אתכם מה שלומכם. ענו שאתם בסדר, הודו ושאלו בחזרה.',
        formality: 'neutral',
      },
      {
        id: 'e2-03',
        text: 'Nice to meet you.',
        he: 'נעים להכיר.',
        tip: 'מחברים: "נַאיס טֶ מִיט יוּ" – to חלש מאוד, ו-meet you נשמע כמעט "מִיצ׳וּ".',
        sit: 'חבר הכיר לכם את אשתו. אמרו שנעים להכיר.',
        formality: 'neutral',
      },
      {
        id: 'e2-04',
        text: 'My name is {name}.',
        he: 'קוראים לי {name}.',
        tip: 'name עם "ֵיי" ארוכה: "נֵיים". ההטעמה על השם שלכם בסוף.',
        sit: 'בכנס שואלים אתכם איך קוראים לכם. הציגו את עצמכם.',
        formality: 'neutral',
      },
      {
        id: 'e2-05',
        text: 'Where are you from?',
        he: 'מאיפה אתה?',
        tip: 'where מתחילה ב-w: "וֶוֶר". from בסוף חלש. אצל אמריקאים: "וֶוֶרְ-יוּ-פְרָם".',
        sit: 'פגשתם תייר בהוסטל. שאלו מאיפה הוא.',
        formality: 'neutral',
      },
      {
        id: 'e2-06',
        text: "I'm from Israel.",
        he: 'אני מישראל.',
        tip: 'באנגלית אומרים "אִיז-רִיאֶל", עם ההטעמה על ההברה הראשונה – לא "יִסְרָאֵל".',
        sit: 'שואלים מאיפה אתם. ענו.',
        formality: 'neutral',
      },
      {
        id: 'e2-07',
        text: 'What do you do?',
        he: 'במה אתה עובד?',
        tip: 'נאמר מהר: "וָואדְיֶה-דוּ". ההטעמה על do האחרונה.',
        sit: 'במסיבה אתם מדברים עם מישהי חדשה. שאלו במה היא עובדת.',
        formality: 'neutral',
        note: 'What do you do? פירושו "במה אתה עובד", לא "מה אתה עושה עכשיו".',
      },
      {
        id: 'e2-08',
        text: 'I work in tech.',
        he: 'אני {עובד|עובדת} בהייטק.',
        tip: 'work: w ואחריה "אֶר" אמריקאית – "ווֶרְק", לא "ווֹרְק". tech = "טֶק".',
        sit: 'שואלים במה אתם עובדים. אמרו שבהייטק.',
        formality: 'neutral',
        note: 'אמריקאים אומרים in tech – המילה high-tech כמעט לא בשימוש שם.',
      },
      {
        id: 'e2-09',
        text: 'How long have you been here?',
        he: 'כמה זמן אתה כבר כאן?',
        tip: 'have you been מתחבר: "הַבְיוּ-בִּן". אמריקאים אומרים been קצר: "בִּן".',
        sit: 'פגשתם ישראלי בניו יורק. שאלו כמה זמן הוא כבר כאן.',
        formality: 'neutral',
      },
      {
        id: 'e2-10',
        text: 'Just a few days.',
        he: 'רק כמה ימים.',
        tip: 'few = "פְיוּ", days עם "ֵיי" ו-z בסוף: "דֵייז".',
        sit: 'שואלים כמה זמן אתם בעיר. ענו שרק כמה ימים.',
        formality: 'neutral',
      },
      {
        id: 'e2-11',
        text: 'Sorry, could you say that again?',
        he: 'סליחה, אתה יכול לחזור על זה?',
        tip: 'could you נשמע "קוּ-ג׳וּ". again באמריקאית: "אֶ-גֶן", ההטעמה על gen.',
        sit: 'לא שמעתם מה אמר הפקיד. בקשו ממנו בנימוס לחזור.',
        formality: 'formal',
      },
      {
        id: 'e2-12',
        text: 'Could you speak a little slower, please?',
        he: 'תוכל לדבר קצת יותר לאט, בבקשה?',
        tip: 'little באמריקאית: ה-t נשמעת כמו d מהירה – "לִידֶל". slower עם "וֹ" ו-r בסוף.',
        sit: 'המוכר מדבר מהר מדי. בקשו בנימוס שידבר לאט יותר.',
        formality: 'formal',
      },
      {
        id: 'e2-13',
        text: 'See you later!',
        he: 'נתראה אחר כך!',
        tip: 'later באמריקאית: "לֵיידֶר", ה-t רכה כמו d.',
        sit: 'אתם נפרדים מחבר שתפגשו שוב בערב. אמרו "נתראה".',
        formality: 'casual',
      },
      {
        id: 'e2-14',
        text: 'Have a nice day!',
        he: 'שיהיה לך יום נעים!',
        tip: 'have a מתחבר: "הֶבֶ-נַאיס-דֵיי". ה-v של have עם קול.',
        sit: 'אתם יוצאים מהחנות. אחלו למוכרת יום טוב.',
        formality: 'neutral',
      },
    ],
  },
  {
    id: 'e3',
    order: 3,
    color: 'amber',
    title: 'בית קפה ומסעדה',
    titleEn: 'Café and restaurant',
    subtitle: 'להזמין, לבקש, לשאול ולשלם',
    subtitleEn: 'Ordering, asking and paying',
    description:
      'להזמין שולחן וקפה, לשאול מה מומלץ, לבקש בלי בצל, ולסיים עם החשבון. באמריקה מבקשים בנימוס – Can I get… ו-I’d like… – ומשאירים טיפ של 15–20%.',
    descriptionEn:
      'Getting a table and a coffee, asking what is good, ordering without onions and asking for the check. In America you ask politely – "Can I get…" and "I’d like…" – and leave a 15–20% tip.',
    items: [
      {
        id: 'e3-01',
        text: 'Can I get a coffee, please?',
        he: 'אפשר לקבל קפה, בבקשה?',
        tip: 'Can I get a נשמע "קֶנַאי-גֶדֶ". coffee באמריקאית: "קָאפִי", ההטעמה בהתחלה.',
        sit: 'אתם בדלפק של בית קפה בניו יורק. הזמינו קפה בנימוס.',
        formality: 'neutral',
        note: 'באמריקה Can I get… היא הדרך הרגילה להזמין – לא נשמעת חצופה.',
      },
      {
        id: 'e3-02',
        text: "I'd like a table for two.",
        he: 'הייתי רוצה שולחן לשניים.',
        tip: "I'd = \"אַיְד\". table עם \"ֵיי\": \"טֵייבֶּל\". for two מהיר: \"פֶר-טוּ\".",
        sit: 'נכנסתם למסעדה עם בן או בת הזוג. בקשו שולחן לשניים.',
        formality: 'formal',
      },
      {
        id: 'e3-03',
        text: 'Could we see the menu?',
        he: 'נוכל לראות את התפריט?',
        tip: 'menu = "מֶנְיוּ", ההטעמה על me. the חלש עם th קולי: "דֶ׳ה".',
        sit: 'התיישבתם ועוד לא קיבלתם תפריט. בקשו לראות אותו.',
        formality: 'formal',
      },
      {
        id: 'e3-04',
        text: 'What do you recommend?',
        he: 'מה אתה ממליץ?',
        tip: 'recommend – ההטעמה בסוף: "רֶקֶ-מֶנְד". מתחילים ב-r אמריקאית, לא מהגרון.',
        sit: 'אתם לא יודעים מה להזמין. שאלו את המלצר מה הוא ממליץ.',
        formality: 'neutral',
      },
      {
        id: 'e3-05',
        text: "I'll have the chicken salad.",
        he: 'אני אקח את סלט העוף.',
        tip: "I'll = \"אַיְל\". chicken = \"צ׳ִיקֶן\" עם i קצרה. salad עם a פתוחה: \"סַלֶד\".",
        sit: 'המלצר מחכה להזמנה. הזמינו סלט עוף.',
        formality: 'neutral',
        note: "I'll have… היא דרך טבעית להזמין במסעדה.",
      },
      {
        id: 'e3-06',
        text: 'No onions, please.',
        he: 'בלי בצל, בבקשה.',
        tip: 'onions = "אָנְיֶנְז" – מתחיל כמו "אָ", לא "אוֹ". ה-s בסוף נשמעת z.',
        sit: 'אתם לא אוכלים בצל. בקשו את המנה בלי בצל.',
        formality: 'neutral',
      },
      {
        id: 'e3-07',
        text: 'Can I have some water?',
        he: 'אפשר קצת מים?',
        tip: 'have some מתחבר: "הֶבְסָם". water עם w ו-t רכה: "ווָדֶר".',
        sit: 'סיימתם את השתייה. בקשו מים.',
        formality: 'neutral',
      },
      {
        id: 'e3-08',
        text: 'Is it spicy?',
        he: 'זה חריף?',
        tip: 'Is it מתחבר: "אִיזִט". spicy עם "ַאי": "סְפַּאיסִי".',
        sit: 'בתפריט יש מנה עם פלפל. שאלו אם היא חריפה.',
        formality: 'neutral',
      },
      {
        id: 'e3-09',
        text: 'It was delicious!',
        he: 'זה היה טעים מאוד!',
        tip: 'delicious – ההטעמה באמצע: "דֶ-לִי-שֶס". was חלש: "וְוֶז".',
        sit: 'המלצרית שואלת איך היה האוכל. אמרו שהיה טעים מאוד.',
        formality: 'neutral',
      },
      {
        id: 'e3-10',
        text: 'Could we have the check, please?',
        he: 'אפשר לקבל את החשבון, בבקשה?',
        tip: 'check = "צ׳ֶק". אצל בריטים אומרים the bill, אצל אמריקאים the check.',
        sit: 'סיימתם לאכול וממהרים. בקשו את החשבון.',
        formality: 'formal',
      },
      {
        id: 'e3-11',
        text: 'Can I pay by card?',
        he: 'אפשר לשלם בכרטיס?',
        tip: 'pay = "פֵּיי", card עם r אמריקאית: "קָארְד".',
        sit: 'אין לכם מזומן. שאלו אם אפשר לשלם בכרטיס.',
        formality: 'neutral',
      },
      {
        id: 'e3-12',
        text: 'Keep the change.',
        he: 'תשאיר את העודף.',
        tip: 'change = "צ׳ֵיינְג׳" – ג׳ בסוף, לא "צ׳ֵינְג".',
        sit: 'שילמתם במזומן ומגיע לכם עודף קטן. אמרו למלצר שישאיר אותו.',
        formality: 'neutral',
        note: 'במסעדה באמריקה הטיפ (15–20%) לא כלול במחיר.',
      },
    ],
  },
  {
    id: 'e4',
    order: 4,
    color: 'emerald',
    title: 'כיוונים ותחבורה',
    titleEn: 'Directions and transport',
    subtitle: 'איפה זה, איך מגיעים, כרטיס לרכבת',
    subtitleEn: 'Where is it, how do I get there, a train ticket',
    description:
      'לשאול איפה התחנה, להבין "ישר ושמאלה", לקנות כרטיס, לשאול מתי הרכבת הבאה – ולהגיד לנהג המונית לאן. כמעט כל שאלה כאן מתחילה ב-Excuse me.',
    descriptionEn:
      'Asking where the station is, understanding "straight and left", buying a ticket, asking when the next train leaves – and telling the taxi driver where to go. Almost every question here starts with "Excuse me".',
    items: [
      {
        id: 'e4-01',
        text: 'Excuse me, where is the train station?',
        he: 'סליחה, איפה תחנת הרכבת?',
        tip: 'excuse me = "אֶקְסְקְיוּז-מִי", ההטעמה על cuse. station = "סְטֵיישֶן".',
        sit: 'יצאתם מהמלון ולא יודעים איך להגיע לרכבת. שאלו עוברת אורח.',
        formality: 'formal',
      },
      {
        id: 'e4-02',
        text: 'Is it far from here?',
        he: 'זה רחוק מכאן?',
        tip: 'far ו-here מסתיימות ב-r אמריקאית: "פָאר", "הִיר".',
        sit: 'הסבירו לכם איפה המוזיאון. שאלו אם זה רחוק.',
        formality: 'neutral',
      },
      {
        id: 'e4-03',
        text: 'Go straight and turn left.',
        he: 'לך ישר ופנה שמאלה.',
        tip: 'straight = "סְטְרֵייט". turn עם "אֶר": "טֶרְן". left עם e קצרה.',
        sit: 'תייר שואל אתכם איך מגיעים לחוף. הסבירו: ישר ואז שמאלה.',
        formality: 'neutral',
      },
      {
        id: 'e4-04',
        text: "It's on the right.",
        he: 'זה בצד ימין.',
        tip: 'right מתחילה ב-r אמריקאית – לשון מסולסלת, בלי חיכוך בגרון: "רַאיט".',
        sit: 'מישהו מחפש את הבנק, והוא מימין. אמרו לו.',
        formality: 'neutral',
      },
      {
        id: 'e4-05',
        text: 'How do I get to the airport?',
        he: 'איך אני מגיע לשדה התעופה?',
        tip: 'airport = "אֶר-פּוֹרְט", ההטעמה בהתחלה. get to מתחבר: "גֶדֶה".',
        sit: 'אתם במלון וטסים מחר. שאלו בקבלה איך מגיעים לשדה התעופה.',
        formality: 'neutral',
      },
      {
        id: 'e4-06',
        text: 'Which bus goes downtown?',
        he: 'איזה אוטובוס נוסע למרכז העיר?',
        tip: 'which עם w: "וִויצ׳". bus עם "ָ": "בָּס". downtown – ההטעמה בסוף.',
        sit: 'אתם בתחנת אוטובוס. שאלו איזה קו נוסע למרכז.',
        formality: 'neutral',
        note: 'downtown = מרכז העיר באמריקה (באנגליה: the city centre).',
      },
      {
        id: 'e4-07',
        text: 'One ticket, please.',
        he: 'כרטיס אחד, בבקשה.',
        tip: 'one נשמע "וָואן" – עם w, לא "אוֹנֶה". ticket = "טִיקֶט" עם i קצרה.',
        sit: 'אתם בקופה. בקשו כרטיס אחד.',
        formality: 'neutral',
      },
      {
        id: 'e4-08',
        text: 'How much is a ticket?',
        he: 'כמה עולה כרטיס?',
        tip: 'much עם "ָ": "מָאצ׳". is a מתחבר: "אִיזֶה".',
        sit: 'אתם בקופה של הרכבת. שאלו כמה עולה כרטיס.',
        formality: 'neutral',
      },
      {
        id: 'e4-09',
        text: 'When does the next train leave?',
        he: 'מתי יוצאת הרכבת הבאה?',
        tip: 'when עם w. leave עם ee ארוכה ו-v בסוף: "לִיב" – לא live.',
        sit: 'פספסתם את הרכבת. שאלו מתי יוצאת הבאה.',
        formality: 'neutral',
      },
      {
        id: 'e4-10',
        text: 'Can you show me on the map?',
        he: 'אתה יכול להראות לי על המפה?',
        tip: 'show = "שׁוֹ". map עם a פתוחה: "מַפּ".',
        sit: 'לא הבנתם את ההסבר. בקשו שיראו לכם על המפה.',
        formality: 'neutral',
      },
      {
        id: 'e4-11',
        text: "I'm lost.",
        he: 'הלכתי לאיבוד.',
        tip: 'lost = "לָאסְט", עם "ָ" פתוחה.',
        sit: 'אתם בשכונה לא מוכרת ולא יודעים איפה אתם. אמרו את זה לעוברת אורח.',
        formality: 'neutral',
      },
      {
        id: 'e4-12',
        text: 'Please take me to this address.',
        he: 'בבקשה קח אותי לכתובת הזאת.',
        tip: 'address באמריקאית: "אַדְ-רֶס" עם ההטעמה בהתחלה. take me מתחבר.',
        sit: 'נכנסתם למונית ומראים לנהג פתק. בקשו שייקח אתכם לכתובת.',
        formality: 'neutral',
      },
    ],
  },
  {
    id: 'e5',
    order: 5,
    color: 'rose',
    title: 'קניות',
    titleEn: 'Shopping',
    subtitle: 'כמה זה עולה, מידה, למדוד ולהחזיר',
    subtitleEn: 'How much, sizes, trying on and returns',
    description:
      'לשאול מחיר, לבקש מידה אחרת, למדוד, להתמקח בעדינות – ולהחזיר מוצר. באמריקה המחיר על המדף לא כולל מס, אז בקופה הוא עולה מעט.',
    descriptionEn:
      'Asking the price, asking for another size, trying things on, gently bargaining – and returning things. In America the shelf price does not include sales tax, so it goes up a little at the register.',
    items: [
      {
        id: 'e5-01',
        text: 'How much is this?',
        he: 'כמה זה עולה?',
        tip: 'this בסוף – th עם קול: "דִ׳ס". is this מתחבר: "אִיזְדִ׳ס".',
        sit: 'אתם מחזיקים חולצה בלי תווית מחיר. שאלו כמה היא עולה.',
        formality: 'neutral',
      },
      {
        id: 'e5-02',
        text: "I'm just looking, thanks.",
        he: 'אני רק {מסתכל|מסתכלת}, תודה.',
        tip: 'looking = "לוּקִינְג", ה-g כמעט לא נשמעת.',
        sit: 'מוכרת שואלת אם אפשר לעזור, ואתם רק מסתכלים. אמרו לה.',
        formality: 'neutral',
      },
      {
        id: 'e5-03',
        text: 'Do you have this in a smaller size?',
        he: 'יש לכם את זה במידה קטנה יותר?',
        tip: 'size עם "ַאי" ו-z בסוף: "סַאיז". smaller עם r בסוף.',
        sit: 'החולצה גדולה עליכם. שאלו אם יש מידה קטנה יותר.',
        formality: 'neutral',
      },
      {
        id: 'e5-04',
        text: 'Can I try it on?',
        he: 'אפשר למדוד?',
        tip: 'try it on מתחבר לגמרי: "טְרַאי-אִי-דָאן". try עם r אמריקאית.',
        sit: 'מצאתם ג׳ינס שאהבתם. שאלו אם אפשר למדוד.',
        formality: 'neutral',
      },
      {
        id: 'e5-05',
        text: "It's too expensive.",
        he: 'זה יקר מדי.',
        tip: 'expensive – ההטעמה באמצע: "אֶקְס-פֶּן-סִיב", ו-v בסוף.',
        sit: 'המעיל יפה אבל המחיר גבוה מדי. אמרו את זה.',
        formality: 'neutral',
      },
      {
        id: 'e5-06',
        text: 'Do you have anything cheaper?',
        he: 'יש לכם משהו זול יותר?',
        tip: 'anything עם th בלי קול: "אֶנִי-ת׳ִינְג". cheaper עם ee ארוכה.',
        sit: 'המחיר גבוה לכם. שאלו אם יש משהו זול יותר.',
        formality: 'neutral',
      },
      {
        id: 'e5-07',
        text: "I'll take it.",
        he: 'אני אקח את זה.',
        tip: 'take it מתחבר: "טֵייקִט".',
        sit: 'החלטתם לקנות את התיק. אמרו למוכר.',
        formality: 'neutral',
      },
      {
        id: 'e5-08',
        text: 'Where can I pay?',
        he: 'איפה אפשר לשלם?',
        tip: 'where עם w, can חלש: "קֶן".',
        sit: 'אתם בחנות גדולה עם המוצרים ביד. שאלו איפה משלמים.',
        formality: 'neutral',
      },
      {
        id: 'e5-09',
        text: 'Can I get a bag?',
        he: 'אפשר לקבל שקית?',
        tip: 'bag עם a פתוחה: "בַּג" – לא "בֶּג".',
        sit: 'קניתם הרבה דברים. בקשו שקית.',
        formality: 'neutral',
      },
      {
        id: 'e5-10',
        text: 'Do you take credit cards?',
        he: 'אתם מקבלים כרטיסי אשראי?',
        tip: 'credit = "קְרֶדִט", cards עם z בסוף: "קָארְדְז".',
        sit: 'אתם בדוכן בשוק ואין לכם מזומן. שאלו אם מקבלים אשראי.',
        formality: 'neutral',
      },
      {
        id: 'e5-11',
        text: 'Can I return it?',
        he: 'אפשר להחזיר את זה?',
        tip: 'return – ההטעמה בסוף: "רִי-טֶרְן". return it מתחבר.',
        sit: 'לפני שאתם קונים, שאלו אם אפשר להחזיר את המוצר.',
        formality: 'neutral',
      },
      {
        id: 'e5-12',
        text: 'Is there a discount?',
        he: 'יש הנחה?',
        tip: 'there עם th קולי: "דֶ׳ר". discount – ההטעמה בהתחלה.',
        sit: 'אתם קונים שלושה פריטים. שאלו אם יש הנחה.',
        formality: 'neutral',
      },
    ],
  },
  {
    id: 'e6',
    order: 6,
    color: 'teal',
    title: 'מלון, טיסה וטלפון',
    titleEn: 'Hotel, flight and phone',
    subtitle: 'צ׳ק-אין, עיכוב בטיסה, שיחת עבודה',
    subtitleEn: 'Check-in, a delayed flight, a work call',
    description:
      'הצ׳ק-אין במלון, לשאול על ארוחת הבוקר, להתלונן בנימוס כשמשהו לא עובד; בשדה התעופה – שער, עיכוב ומושב ליד החלון; ובטלפון – להציג את עצמכם, לבקש לדבר עם מישהו ולקבוע פגישה.',
    descriptionEn:
      'Checking in, asking about breakfast, complaining politely when something does not work; at the airport – the gate, a delay and a window seat; and on the phone – introducing yourself, asking for someone and setting up a meeting.',
    items: [
      {
        id: 'e6-01',
        text: 'I have a reservation.',
        he: 'יש לי הזמנה.',
        tip: 'reservation – ההטעמה על va: "רֶ-זֶר-בֵיי-שֶן". have a מתחבר: "הֶבֶ".',
        sit: 'הגעתם לדלפק הקבלה במלון. אמרו שיש לכם הזמנה.',
        formality: 'neutral',
      },
      {
        id: 'e6-02',
        text: 'What time is check-out?',
        he: 'באיזו שעה הצ׳ק-אאוט?',
        tip: 'check-out – ההטעמה על check. what time מתחבר: "וָוט-טַאים".',
        sit: 'אתם עוזבים מחר. שאלו מתי צריך לפנות את החדר.',
        formality: 'neutral',
      },
      {
        id: 'e6-03',
        text: 'Is breakfast included?',
        he: 'ארוחת הבוקר כלולה?',
        tip: 'breakfast = "בְּרֶקְ-פֶסְט" – לא "בְּרֵיק-פַאסְט". included – ההטעמה על clu.',
        sit: 'אתם עושים צ׳ק-אין. שאלו אם ארוחת הבוקר כלולה.',
        formality: 'neutral',
      },
      {
        id: 'e6-04',
        text: "The air conditioner isn't working.",
        he: 'המזגן לא עובד.',
        tip: "isn't = \"אִיזֶנְט\", working עם \"אֶר\" אמריקאית: \"ווֶרְקִינְג\".",
        sit: 'חם מאוד בחדר והמזגן לא עובד. התקשרו לקבלה ואמרו.',
        formality: 'neutral',
      },
      {
        id: 'e6-05',
        text: 'Could I get a late check-out?',
        he: 'אפשר לקבל צ׳ק-אאוט מאוחר?',
        tip: 'late עם "ֵיי": "לֵייט". get a מתחבר: "גֶדֶ".',
        sit: 'הטיסה שלכם בערב. בקשו לעזוב את החדר מאוחר יותר.',
        formality: 'formal',
      },
      {
        id: 'e6-06',
        text: 'Where is gate twelve?',
        he: 'איפה שער שתים-עשרה?',
        tip: 'gate = "גֵייט". twelve עם w ו-v בסוף: "טְוֶולְב".',
        sit: 'אתם בשדה התעופה ומחפשים את השער שלכם, 12. שאלו.',
        formality: 'neutral',
      },
      {
        id: 'e6-07',
        text: 'My flight is delayed.',
        he: 'הטיסה שלי מתעכבת.',
        tip: 'flight עם "ַאי": "פְלַאיט". delayed – ההטעמה בסוף: "דִי-לֵייד".',
        sit: 'אתם מתקשרים לחבר שמחכה לכם. אמרו שהטיסה מתעכבת.',
        formality: 'neutral',
      },
      {
        id: 'e6-08',
        text: "I'd like a window seat.",
        he: 'הייתי רוצה מושב ליד החלון.',
        tip: 'window עם w בשתי ההברות: "וִוינְ-דוֹ". seat עם ee ארוכה – לא sit.',
        sit: 'אתם בדלפק הצ׳ק-אין. בקשו מושב ליד החלון.',
        formality: 'formal',
      },
      {
        id: 'e6-09',
        text: 'Hello, this is {name}.',
        he: 'שלום, מדבר {name}.',
        tip: 'בטלפון אומרים this is ולא I am. this עם th קולי.',
        sit: 'אתם מתקשרים למשרד בחו״ל. הציגו את עצמכם בשמכם.',
        formality: 'neutral',
        note: 'בטלפון מציגים את עצמכם ב-This is…, לא ב-I am…',
      },
      {
        id: 'e6-10',
        text: 'Can I speak to Michael, please?',
        he: 'אפשר לדבר עם מייקל, בבקשה?',
        tip: 'Michael = "מַאיקֶל" – לא "מיכאל". speak עם ee ארוכה.',
        sit: 'עונה לכם מזכירה. בקשו לדבר עם מייקל.',
        formality: 'formal',
      },
      {
        id: 'e6-11',
        text: 'Could you call me back?',
        he: 'תוכל לחזור אליי?',
        tip: 'call = "קוֹל". back עם a פתוחה: "בַּק".',
        sit: 'אתם באמצע פגישה. בקשו מהמתקשר לחזור אליכם.',
        formality: 'formal',
      },
      {
        id: 'e6-12',
        text: "I'll send you an email.",
        he: 'אשלח לך מייל.',
        tip: 'email = "אִי-מֵייל", ההטעמה בהתחלה. an email מתחבר: "אֶנִי-מֵייל".',
        sit: 'סיכמתם שיחה ואתם רוצים לשלוח את הפרטים. אמרו שתשלחו מייל.',
        formality: 'neutral',
      },
      {
        id: 'e6-13',
        text: "Let's set up a meeting.",
        he: 'בוא נקבע פגישה.',
        tip: "Let's = \"לֶטְס\". set up a מתחבר: \"סֶדָאפֶּ\". meeting עם ee ארוכה.",
        sit: 'אתם רוצים להמשיך את השיחה עם לקוח פנים מול פנים. הציעו לקבוע פגישה.',
        formality: 'neutral',
      },
      {
        id: 'e6-14',
        text: "Sorry, I'm running late.",
        he: 'סליחה, אני {מאחר|מאחרת}.',
        tip: 'running = "רָאנִינְג" עם r אמריקאית. late עם "ֵיי".',
        sit: 'אתם בפקק בדרך לפגישה. שלחו הודעה קולית שאתם מאחרים.',
        formality: 'neutral',
      },
    ],
  },
];

/** Polish and Montenegrin text of an item (data/en/pl, data/en/cnr). */
function itemLoc(id: string): LearningItem['loc'] {
  const loc: LearningItem['loc'] = {};
  for (const [lang, src] of [['pl', EN_PL], ['cnr', EN_CNR]] as const) {
    const t = src.items[id];
    if (t) loc[lang] = { meaning: t.m, tip: t.tip, note: t.note };
  }
  return loc;
}

function build(c: EnItem): LearningItem {
  return {
    id: c.id,
    polish: c.text,
    syllablesPolish: toSyllableNotation(c.text),
    hebrew: c.he,
    english: c.text,
    phoneticHebrew: toHebrewPhonetic(c.text),
    phoneticEnglish: toEnglishPhonetic(c.text),
    articulationTip: c.tip,
    articulationTipEn: c.tip,
    backchainingSteps: c.steps ?? autoBackchain(c.text),
    formality: c.formality,
    culturalNote: c.note,
    culturalNoteEn: c.note,
    loc: itemLoc(c.id),
  };
}

export const EN_UNITS: Unit[] = SOURCES.map(({ items, ...u }) => ({
  ...u,
  loc: { pl: EN_PL.units[u.id], cnr: EN_CNR.units[u.id] },
  items: items.map(build),
}));

export const EN_SITUATIONS: Record<string, Loc<string>> = Object.fromEntries(
  SOURCES.flatMap((u) => u.items.map((i) => [i.id, { he: i.sit, en: i.sit, pl: EN_PL.items[i.id]?.sit, cnr: EN_CNR.items[i.id]?.sit }])),
);

/** Legend for the Hebrew-letter transcription of English (shown in the Sound Lab); Polish and Montenegrin rows are merged in below. */
const LEGEND: LegendRow[] = [
  { pl: 'th (think)', he: 'ת׳', en: 'th', noteHe: 'לשון בין השיניים, בלי קול', noteEn: 'tongue between the teeth, voiceless' },
  { pl: 'th (this)', he: 'ד׳', en: 'th', noteHe: 'לשון בין השיניים, עם קול', noteEn: 'tongue between the teeth, voiced' },
  { pl: 'w', he: 'וו', en: 'w', noteHe: 'שפתיים בעיגול, בלי שיניים', noteEn: 'rounded lips, no teeth' },
  { pl: 'v', he: 'ב', en: 'v', noteHe: 'שיניים על השפה התחתונה', noteEn: 'upper teeth on the lower lip' },
  { pl: 'b', he: 'בּ', en: 'b', noteHe: 'ב עם דגש', noteEn: 'b' },
  { pl: 'r', he: 'ר', en: 'r', noteHe: 'r אמריקאית – לשון מסולסלת, לא מהגרון', noteEn: 'American r – curled tongue, not from the throat' },
  { pl: 'i (ship)', he: 'ִ', en: 'i', noteHe: 'i קצרה – חיריק בלי יוד', noteEn: 'short i' },
  { pl: 'ee (sheep)', he: 'ִי', en: 'ee', noteHe: 'ee ארוכה – חיריק עם יוד', noteEn: 'long ee' },
  { pl: 'a (bad)', he: 'ַ', en: 'a', noteHe: 'a פתוחה – פתח: לסת למטה, בין א ל-אֶ', noteEn: 'open a – jaw down' },
  { pl: 'e (bed)', he: 'ֶ', en: 'e', noteHe: 'e רגילה – סגול', noteEn: 'plain e' },
  { pl: 'u (cup), o (hot)', he: 'ָ', en: 'uh / ah', noteHe: 'א קצרה – קמץ', noteEn: 'short ah' },
  { pl: 'er (work)', he: 'ֶר', en: 'er', noteHe: 'אֶר אמריקאית', noteEn: 'American er' },
  { pl: 'o (go)', he: 'וֹ', en: 'oh', noteHe: 'חולם', noteEn: 'oh' },
  { pl: 'oo', he: 'וּ', en: 'oo', noteHe: 'שורוק', noteEn: 'oo' },
  { pl: 'ay / ai', he: 'ֵיי', en: 'ay', noteHe: 'אֵיי', noteEn: 'ay' },
  { pl: 'I / my', he: 'ַאי', en: 'eye', noteHe: 'אַאי', noteEn: 'eye' },
  { pl: 'ch / j', he: 'צ׳ / ג׳', en: 'ch / j', noteHe: 'כמו בעברית', noteEn: 'as in Hebrew' },
];

export const EN_LEGEND: LegendRow[] = LEGEND.map((row) => ({ ...row, loc: { pl: EN_PL.legend[row.pl], cnr: EN_CNR.legend[row.pl] } }));
