import { COURSE } from '../lib/course';

/**
 * Sounds tracked for the "challenging sounds" model. Each item text is scanned for these
 * sounds; every pronunciation, writing and listening outcome updates the per-sound stats.
 * Each course has its own set; progress is stored per course, so the keys never mix.
 */

export type PlSoundKey = 'sz' | 'cz' | 'ż/rz' | 'ś' | 'ć' | 'ź' | 'dź' | 'ń' | 'ł' | 'w' | 'ą' | 'ę' | 'y' | 'ch';
export type CnrSoundKey = 'č' | 'ć' | 'dž' | 'đ' | 'š' | 'ž' | 'lj' | 'nj' | 'h' | 'r' | 'c' | 'ije';
/** English sounds Hebrew speakers find hard: th, w vs v, the American r, ship vs sheep, bad vs bed. */
export type EnSoundKey = 'th' | 'w' | 'v' | 'r' | 'ih' | 'ee' | 'ae';
export type SoundKey = PlSoundKey | CnrSoundKey | EnSoundKey;

export interface SoundInfo {
  key: SoundKey;
  /** Short Hebrew description of the sound. */
  name: string;
  nameEn: string;
  /** Articulation instruction used in tips and in the weak-sounds panel. */
  tip: string;
  tipEn: string;
  /** Related minimal-pair group in the Sound Lab, if any. */
  groupId?: string;
}

export const PL_SOUND_INFO: Record<PlSoundKey, SoundInfo> = {
  sz: { key: 'sz', name: 'ש קשה', tip: 'sz: משכו את קצה הלשון אחורה לחך ועגלו את השפתיים.', nameEn: 'hard sh', tipEn: 'sz: pull the tongue tip back to the palate and round the lips.', groupId: 'sz-s' },
  cz: { key: 'cz', name: 'צ׳ קשה', tip: 'cz: לשון משוכה אחורה, שפתיים בולטות – צ׳ "עבה".', nameEn: 'hard ch', tipEn: 'cz: tongue pulled back, lips pushed forward – a "thick" ch.', groupId: 'cz-c' },
  'ż/rz': { key: 'ż/rz', name: 'ז׳ קשה', tip: 'ż / rz: לשון אחורה כמו ב-sz, עם רטט של מיתרי הקול.', nameEn: 'hard zh', tipEn: 'ż / rz: tongue back as for sz, with the vocal cords vibrating.', groupId: 'z-z' },
  ś: { key: 'ś', name: 'ש רכה', tip: 'ś: קצה הלשון מאחורי השיניים התחתונות, גב הלשון מורם, שפתיים בחיוך.', nameEn: 'soft sh', tipEn: 'ś: tongue tip behind the lower teeth, middle of the tongue raised, smiling lips.', groupId: 'sz-s' },
  ć: { key: 'ć', name: 'צ׳ רכה', tip: 'ć: לשון צמודה קדימה, שפתיים בחיוך – צ׳ דקה.', nameEn: 'soft ch', tipEn: 'ć: tongue pressed forward, smiling lips – a thin ch.', groupId: 'cz-c' },
  ź: { key: 'ź', name: 'ז׳ רכה', tip: 'ź: מיקום של ś (לשון קדימה, חיוך) עם רטט קולי.', nameEn: 'soft zh', tipEn: 'ź: the ś position (tongue forward, smile) with voice.' },
  dź: { key: 'dź', name: 'ג׳ רכה', tip: 'dź: ג׳ עם לשון קדימה וחיוך.', nameEn: 'soft j', tipEn: 'dź: a "j" with the tongue forward and a smile.' },
  ń: { key: 'ń', name: 'n רכה', tip: 'ń: n עם גב לשון מורם – כמו "ני" קצרצרה.', nameEn: 'soft n', tipEn: 'ń: n with the middle of the tongue raised – like a tiny "ny".' },
  ł: { key: 'ł', name: 'w אנגלית', tip: 'ł: שפתיים מעוגלות, הלשון לא נוגעת בשיניים – כמו w ב-water.', nameEn: 'English w', tipEn: 'ł: rounded lips, tongue away from the teeth – like w in "water".', groupId: 'l-l' },
  w: { key: 'w', name: 'v', tip: 'w = v: שיניים עליונות על השפה התחתונה. לפני עיצור אטום – f.', nameEn: 'v', tipEn: 'w = v: upper teeth on the lower lip. Before a voiceless consonant – f.', groupId: 'w-l' },
  ą: { key: 'ą', name: 'o אפית', tip: 'ą: אמרו o ותנו לאוויר לעבור גם דרך האף.', nameEn: 'nasal o', tipEn: 'ą: say o and let air flow through the nose as well.', groupId: 'nasal' },
  ę: { key: 'ę', name: 'e אפית', tip: 'ę: e אפית; בסוף מילה – e רגילה.', nameEn: 'nasal e', tipEn: 'ę: a nasal e; at the end of a word – a plain e.', groupId: 'nasal' },
  y: { key: 'y', name: 'i כהה', tip: 'y: i עם לשון נסוגה מעט אחורה – "כהה" יותר מ-i.', nameEn: 'dark i', tipEn: 'y: i with the tongue pulled slightly back – like "i" in "bit".', groupId: 'y-i' },
  ch: { key: 'ch', name: 'ח', tip: 'ch / h: ח רכה מהגרון.', nameEn: 'throaty h', tipEn: 'ch / h: a soft throaty h as in "loch".' },
};

export const CNR_SOUND_INFO: Record<CnrSoundKey, SoundInfo> = {
  č: { key: 'č', name: 'צ׳ קשה', tip: 'č: קצה הלשון משוך אחורה והשפתיים בולטות קדימה – צ׳ "עבה", כמו ב-church.', nameEn: 'hard ch', tipEn: 'č: tongue tip pulled back, lips pushed forward – a "thick" ch, as in "church".', groupId: 'cnr-ch' },
  ć: { key: 'ć', name: 'צ׳ רכה', tip: 'ć: קצה הלשון מאחורי השיניים התחתונות, גב הלשון צמוד לחך, שפתיים בחיוך – צ׳ דקה, כמעט "טְי".', nameEn: 'soft ch', tipEn: 'ć: tongue tip behind the lower teeth, middle of the tongue against the palate, smiling lips – a thin ch, almost "ty".', groupId: 'cnr-ch' },
  dž: { key: 'dž', name: 'ג׳ קשה', tip: 'dž: כמו č אבל עם קול – ג׳ עבה כמו ב-jungle.', nameEn: 'hard j', tipEn: 'dž: like č but voiced – a thick j as in "jungle".', groupId: 'cnr-ch' },
  đ: { key: 'đ', name: 'ג׳ רכה', tip: 'đ: כמו ć אבל עם קול – לשון קדימה וחיוך, כמעט "דְי".', nameEn: 'soft j', tipEn: 'đ: like ć but voiced – tongue forward and a smile, almost "dy".', groupId: 'cnr-ch' },
  š: { key: 'š', name: 'ש', tip: 'š: ש עם שפתיים מעט מעוגלות. בלי הסימן s היא ס – וזה משנה מילים: šuma (יער) מול suma (סכום).', nameEn: 'sh', tipEn: 'š: sh with slightly rounded lips. Without the mark s is a plain s – and that changes words: šuma (forest) vs suma (sum).', groupId: 'cnr-sh' },
  ž: { key: 'ž', name: 'ז׳', tip: 'ž: ז׳ כמו ב"ז׳קט" – מיקום הלשון של š, עם קול.', nameEn: 'zh', tipEn: 'ž: zh as in "measure" – the š position, with voice.', groupId: 'cnr-zh' },
  lj: { key: 'lj', name: 'ל רכה', tip: 'lj: צליל אחד ולא שניים – ל עם גב הלשון צמוד לחך, כמו "לְי" מהירה.', nameEn: 'soft l', tipEn: 'lj: one sound, not two – an l with the middle of the tongue on the palate, a quick "ly".', groupId: 'cnr-soft' },
  nj: { key: 'nj', name: 'נ רכה', tip: 'nj: צליל אחד – כמו ñ בספרדית, "נְי" מהירה.', nameEn: 'soft n', tipEn: 'nj: one sound – like Spanish ñ or the "ny" in "canyon".', groupId: 'cnr-soft' },
  h: { key: 'h', name: 'ח', tip: 'h: ח רכה מהגרון, קלה יותר מ-ח עברית.', nameEn: 'throaty h', tipEn: 'h: a soft throaty h, as in Scottish "loch".' },
  r: { key: 'r', name: 'r כתנועה', tip: 'r יכולה לשמש תנועה: ב-crno וב-Trg אין תנועה כתובה – מגלגלים r קצרה ומטעימים אותה.', nameEn: 'vowel r', tipEn: 'r can be the vowel: crno and Trg have no written vowel – roll a short r and stress it.' },
  c: { key: 'c', name: 'צ', tip: 'c היא תמיד צ – לעולם לא ק ולא ס.', nameEn: 'ts', tipEn: 'c is always "ts" – never k and never s.' },
  ije: { key: 'ije', name: 'ije', tip: 'ije נהגית כהברה אחת: "יֶה" (lijepo = לְיֶה·פּוֹ). זו ה"ייקאבית" – סימן ההיכר של מונטנגרית.', nameEn: 'ije', tipEn: 'ije is said as one syllable, "yeh" (lijepo = LYEH-poh). This Ijekavian ije is a hallmark of Montenegrin.' },
};

export const EN_SOUND_INFO: Record<EnSoundKey, SoundInfo> = {
  th: { key: 'th', name: 'th', tip: 'th: הוציאו את קצה הלשון מעט בין השיניים ונשפו – בלי ס ובלי ט. think = תִ׳נְק, this = דִ׳ס (עם קול).', nameEn: 'th', tipEn: 'th: put the tongue tip lightly between the teeth and blow – no s and no t. think is voiceless, this is voiced.', groupId: 'en-th' },
  w: { key: 'w', name: 'w', tip: 'w: עגלו את השפתיים כמו לשריקה ושחררו – "וּ" קצרה. השיניים לא נוגעות בשפה.', nameEn: 'w', tipEn: 'w: round the lips as if to whistle and open them – a quick "oo". The teeth do not touch the lip.', groupId: 'en-wv' },
  v: { key: 'v', name: 'v', tip: 'v: השיניים העליונות נוגעות בשפה התחתונה, עם קול – כמו ב בלי דגש.', nameEn: 'v', tipEn: 'v: the upper teeth touch the lower lip, with voice.', groupId: 'en-wv' },
  r: { key: 'r', name: 'r אמריקאית', tip: 'r אמריקאית: לא מהגרון! מסלסלים את קצה הלשון מעט אחורה, בלי שייגע בחך, והשפתיים מעט מעוגלות.', nameEn: 'American r', tipEn: 'American r: not from the throat. Curl the tongue tip slightly back without touching the palate, lips a little rounded.' },
  ih: { key: 'ih', name: 'i קצרה', tip: 'i קצרה (ship, sit, live): קצרה ורפויה, הפה כמעט לא מחייך – בין "אִ" ל"אֶ".', nameEn: 'short i', tipEn: 'Short i (ship, sit, live): short and relaxed, hardly smiling – between "ih" and "eh".', groupId: 'en-ih-ee' },
  ee: { key: 'ee', name: 'ee ארוכה', tip: 'ee ארוכה (sheep, seat, leave): מחייכים ומאריכים – "אִיי".', nameEn: 'long ee', tipEn: 'Long ee (sheep, seat, leave): smile and hold it – "eee".', groupId: 'en-ih-ee' },
  ae: { key: 'ae', name: 'a פתוחה (bad)', tip: 'a של bad, man, have: פותחים את הפה רחב ומורידים את הלסת – בין "אֶ" ל"אַ". bed היא "אֶ" רגילה.', nameEn: 'open a (bad)', tipEn: 'The a of bad, man, have: open the mouth wide and drop the jaw – between "eh" and "ah". bed is a plain "eh".', groupId: 'en-ae-e' },
};

/** Sound table of the active course (only its own keys occur in its data and progress). */
export const SOUND_INFO = ({ pl: PL_SOUND_INFO, cnr: CNR_SOUND_INFO, en: EN_SOUND_INFO } as Record<string, Record<string, SoundInfo>>)[COURSE] as Record<SoundKey, SoundInfo>;

/** Thresholds for marking a sound as needing reinforcement. */
export const WEAK_SOUND_MIN_ATTEMPTS = 3;
export const WEAK_SOUND_ERROR_RATE = 0.35;
export const WEAK_SOUND_MIN_AVG = 75;

/** Sounds exercised by each Sound Lab contrast group. */
const PL_GROUP_SOUNDS: Record<string, SoundKey[]> = {
  'sz-s': ['sz', 'ś'],
  'cz-c': ['cz', 'ć'],
  'w-l': ['w', 'ł'],
  'l-l': ['ł'],
  'z-z': ['ż/rz'],
  nasal: ['ą', 'ę'],
  'y-i': ['y'],
};

const CNR_GROUP_SOUNDS: Record<string, SoundKey[]> = {
  'cnr-ch': ['č', 'ć', 'dž', 'đ'],
  'cnr-sh': ['š'],
  'cnr-zh': ['ž'],
  'cnr-soft': ['lj', 'nj'],
};

const EN_GROUP_SOUNDS: Record<string, SoundKey[]> = {
  'en-th': ['th'],
  'en-wv': ['w', 'v'],
  'en-ih-ee': ['ih', 'ee'],
  'en-ae-e': ['ae'],
};

export const GROUP_SOUNDS: Record<string, SoundKey[]> = { pl: PL_GROUP_SOUNDS, cnr: CNR_GROUP_SOUNDS, en: EN_GROUP_SOUNDS }[COURSE];
