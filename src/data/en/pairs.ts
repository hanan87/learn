import { toHebrewPhonetic, toSyllableNotation } from '../../lib/enPhonetics';
import type { ContrastGroup, PairWord } from '../minimalPairs';

/** English minimal pairs: real words that differ in one sound Hebrew speakers merge. */

const w = (text: string, hebrew: string, english: string): PairWord => ({
  polish: text,
  syllablesPolish: toSyllableNotation(text),
  english,
  hebrew,
  phoneticHebrew: toHebrewPhonetic(text),
});

export const EN_CONTRAST_GROUPS: ContrastGroup[] = [
  {
    id: 'en-th',
    title: 'th מול s / t',
    soundA: 'th',
    soundB: 's · t',
    descriptionA: 'th: קצה הלשון בין השיניים, ונושפים. think, three, thank.',
    descriptionB: 's ו-t רגילות: הלשון מאחורי השיניים. אם תגידו "סינק" במקום think – יבינו sink (כיור).',
    descriptionAEn: 'th: the tongue tip between the teeth, and blow. think, three, thank.',
    descriptionBEn: 'Plain s and t: the tongue behind the teeth. Say "sink" for think and you will be heard as sink.',
    pairs: [
      { id: 'en-th-1', a: w('think', 'לחשוב', 'to think'), b: w('sink', 'כיור / לשקוע', 'sink') },
      { id: 'en-th-2', a: w('three', 'שלוש', 'three'), b: w('tree', 'עץ', 'tree') },
      { id: 'en-th-3', a: w('thank', 'להודות', 'to thank'), b: w('tank', 'מיכל / טנק', 'tank') },
      { id: 'en-th-4', a: w('mouth', 'פה', 'mouth'), b: w('mouse', 'עכבר', 'mouse') },
    ],
  },
  {
    id: 'en-wv',
    title: 'w מול v',
    soundA: 'w',
    soundB: 'v',
    descriptionA: 'w: השפתיים בעיגול ונפתחות – כמו "וּ" קצרה. השיניים לא נוגעות.',
    descriptionB: 'v: השיניים העליונות נוגעות בשפה התחתונה, עם קול.',
    descriptionAEn: 'w: the lips round and open – a quick "oo". The teeth do not touch.',
    descriptionBEn: 'v: the upper teeth touch the lower lip, with voice.',
    pairs: [
      { id: 'en-wv-1', a: w('west', 'מערב', 'west'), b: w('vest', 'אפוד / וסט', 'vest') },
      { id: 'en-wv-2', a: w('wine', 'יין', 'wine'), b: w('vine', 'גפן', 'vine') },
      { id: 'en-wv-3', a: w('wet', 'רטוב', 'wet'), b: w('vet', 'וטרינר', 'vet') },
      { id: 'en-wv-4', a: w('worse', 'גרוע יותר', 'worse'), b: w('verse', 'בית בשיר', 'verse') },
    ],
  },
  {
    id: 'en-ih-ee',
    title: 'ship מול sheep',
    soundA: 'i',
    soundB: 'ee',
    descriptionA: 'i קצרה: רפויה וקצרה, כמעט בלי חיוך – בין "אִ" ל"אֶ".',
    descriptionB: 'ee ארוכה: מחייכים ומאריכים – "אִיי".',
    descriptionAEn: 'Short i: relaxed and short, hardly smiling.',
    descriptionBEn: 'Long ee: smile and hold it.',
    pairs: [
      { id: 'en-ih-ee-1', a: w('ship', 'ספינה', 'ship'), b: w('sheep', 'כבשה', 'sheep') },
      { id: 'en-ih-ee-2', a: w('live', 'לגור', 'to live'), b: w('leave', 'לעזוב', 'to leave') },
      { id: 'en-ih-ee-3', a: w('sit', 'לשבת', 'to sit'), b: w('seat', 'מושב', 'seat') },
      { id: 'en-ih-ee-4', a: w('fill', 'למלא', 'to fill'), b: w('feel', 'להרגיש', 'to feel') },
    ],
  },
  {
    id: 'en-ae-e',
    title: 'bad מול bed',
    soundA: 'a',
    soundB: 'e',
    descriptionA: 'a של bad: פותחים את הפה רחב ומורידים את הלסת – בין "אֶ" ל"אַ".',
    descriptionB: 'e של bed: "אֶ" רגילה, כמו בעברית.',
    descriptionAEn: 'The a of bad: open the mouth wide and drop the jaw.',
    descriptionBEn: 'The e of bed: a plain "eh".',
    pairs: [
      { id: 'en-ae-e-1', a: w('bad', 'רע', 'bad'), b: w('bed', 'מיטה', 'bed') },
      { id: 'en-ae-e-2', a: w('man', 'גבר', 'man'), b: w('men', 'גברים', 'men') },
      { id: 'en-ae-e-3', a: w('sad', 'עצוב', 'sad'), b: w('said', 'אמר', 'said') },
      { id: 'en-ae-e-4', a: w('pan', 'מחבת', 'pan'), b: w('pen', 'עט', 'pen') },
    ],
  },
];
