import type { Loc } from '../i18n/lang';
import type { CourseUnitId } from './types';

/**
 * "What you can already do" after each unit – the can-do statements shown on the progress page,
 * the way Babbel and Busuu describe progress in real-life tasks rather than points.
 * Each line is an infinitive ("Order a coffee…"), so it reads the same for every learner and needs
 * no gendered form. The Polish and Montenegrin courses are taught in Hebrew and English; the English
 * and Hebrew courses also in Polish and Montenegrin.
 */
export const CAN_DO: Record<CourseUnitId, Loc<string>[]> = {
  // --- Polish ---
  u1: [
    { he: 'להבחין בין הצלילים הקשים sz, cz לרכים ś, ć', en: 'Tell the hard sz, cz from the soft ś, ć' },
    { he: 'להגות ł כמו w באנגלית, ו-w כמו v', en: 'Say ł like an English w, and w like a v' },
    { he: 'לזהות את התנועות האפיות ą ו-ę', en: 'Recognize the nasal vowels ą and ę' },
  ],
  u2: [
    { he: 'לברך, להודות ולהתנצל בכל שעה ביום', en: 'Greet, thank and apologize at any time of day' },
    { he: 'לבחור בין Pan/Pani הרשמי ל-ty היומיומי', en: 'Choose between formal Pan/Pani and casual ty' },
    { he: 'להציג את עצמכם ולשאול מה שלום מישהו', en: 'Introduce yourself and ask how someone is' },
  ],
  u3: [
    { he: 'לספור עד 5 ולומר את ימי השבוע', en: 'Count to 5 and name the days of the week' },
    { he: 'לשאול איפה התחנה ולהבין "ימינה, שמאלה, ישר"', en: 'Ask for the station and follow "right, left, straight ahead"' },
    { he: 'לשאול מה השעה ולדבר על היום ומחר', en: 'Ask the time and talk about today and tomorrow' },
  ],
  u4: [
    { he: 'להזמין קפה ושולחן לשניים', en: 'Order a coffee and a table for two' },
    { he: 'לשאול מה מומלץ ולהזמין מנה', en: 'Ask what is recommended and order a dish' },
    { he: 'לבקש חשבון ולשלם בכרטיס', en: 'Ask for the bill and pay by card' },
  ],
  u5: [
    { he: 'לשאול כמה משהו עולה ולהבין מחיר בזלוטי', en: 'Ask how much something costs and understand a price in złoty' },
    { he: 'לבקש הנחה, לשלם במזומן ולבקש קבלה', en: 'Ask for a discount, pay in cash and ask for the receipt' },
    { he: 'למדוד בגד ולבקש מידה גדולה יותר', en: 'Try clothes on and ask for a bigger size' },
  ],
  u6: [
    { he: 'לקנות כרטיס רכבת, מלא או מוזל', en: 'Buy a train ticket, full price or reduced' },
    { he: 'לשאול מאיזה רציף יוצאת הרכבת ואם צריך להחליף', en: 'Ask which platform the train leaves from and whether to change' },
    { he: 'לנסוע במונית ולומר במלון שיש לכם הזמנה', en: 'Take a taxi and tell the hotel you have a booking' },
  ],
  u7: [
    { he: 'לקרוא לעזרה ולבקש אמבולנס', en: 'Call for help and ask for an ambulance' },
    { he: 'להסביר בבית מרקחת או לרופא מה כואב', en: 'Explain at a pharmacy or to a doctor what hurts' },
    { he: 'לדווח שאבד הדרכון ולבקש משטרה', en: 'Report a lost passport and ask for the police' },
  ],
  u8: [
    { he: 'לספר מאיפה אתם ובמה אתם עובדים', en: 'Say where you are from and what you do' },
    { he: 'לבקש שיחזרו על משהו כשלא הבנתם', en: 'Ask someone to repeat when you did not understand' },
    { he: 'לדבר על מזג האוויר ולהרים כוסית', en: 'Chat about the weather and raise a toast' },
  ],

  // --- Montenegrin ---
  m1: [
    { he: 'להבחין בין č ל-ć ובין dž ל-đ', en: 'Tell č from ć and dž from đ' },
    { he: 'להגות lj, nj ואת ה-r שמשמשת כתנועה', en: 'Say lj, nj and the r that works as a vowel' },
    { he: 'לקרוא ije במילים כמו mlijeko', en: 'Read ije in words like mlijeko' },
  ],
  m2: [
    { he: 'לברך ולהיפרד בכל שעה ביום', en: 'Greet and say goodbye at any time of day' },
    { he: 'לבחור בין Vi המנומס ל-ti היומיומי', en: 'Choose between polite Vi and casual ti' },
    { he: 'להציג את עצמכם ולשאול מה שלום מישהו', en: 'Introduce yourself and ask how someone is' },
  ],
  m3: [
    { he: 'לספור עד 5 ולשאול מה השעה', en: 'Count to 5 and ask the time' },
    { he: 'לשאול איך מגיעים לחוף ולהבין "שמאלה, ימינה, ישר"', en: 'Ask the way to the beach and follow "left, right, straight ahead"' },
    { he: 'לדבר על היום ומחר', en: 'Talk about today and tomorrow' },
  ],
  m4: [
    { he: 'להזמין קפה, כוס מים, בירה או יין', en: 'Order a coffee, a glass of water, beer or wine' },
    { he: 'לומר שאתם רעבים ושהאוכל טעים', en: 'Say you are hungry and that the food is delicious' },
    { he: 'לבקש חשבון ולהרים כוסית', en: 'Ask for the bill and raise a toast' },
  ],
  m5: [
    { he: 'לספור עד 10 ולהבין מחירים', en: 'Count to 10 and understand prices' },
    { he: 'לקנות בשוק לחם וקילו תפוחים', en: 'Buy bread and a kilo of apples at the market' },
    { he: 'להתמקח, לבקש הנחה ולשלם בכרטיס', en: 'Bargain, ask for a discount and pay by card' },
  ],
  m6: [
    { he: 'לקנות כרטיס אוטובוס לבודווה ולשאול מתי הוא יוצא', en: 'Buy a bus ticket to Budva and ask when it leaves' },
    { he: 'לנסוע במונית ולבקש לעצור כאן', en: 'Take a taxi and ask the driver to stop here' },
    { he: 'לשכור מיטת שיזוף ושמשייה בחוף', en: 'Rent a sunbed and a beach umbrella' },
  ],
  m7: [
    { he: 'לקרוא לעזרה ולבקש אמבולנס', en: 'Call for help and ask for an ambulance' },
    { he: 'להסביר לרופא או ברוקחת מה כואב', en: 'Tell a doctor or a pharmacist what hurts' },
    { he: 'לדווח שאבד הדרכון', en: 'Report a lost passport' },
  ],
  m8: [
    { he: 'לספר מאיפה אתם ולהציג את המשפחה', en: 'Say where you are from and introduce your family' },
    { he: 'לבקש שיחזרו על משהו כשלא הבנתם', en: 'Ask someone to repeat when you did not understand' },
    { he: 'לדבר על מזג האוויר', en: 'Talk about the weather' },
  ],

  // --- English (for Hebrew, Polish and Montenegrin speakers) ---
  e1: [
    {
      he: 'להגות th (think, this) בלי להפוך אותו ל-ס או ל-ד',
      en: 'Say th (think, this) without turning it into s or d',
      pl: 'Wymówić th (think, this) tak, żeby nie brzmiało jak s ani d',
      cnr: 'Izgovoriti th (think, this) tako da ne zvuči kao s ili d',
    },
    {
      he: 'להבחין בין w ל-v ולהגות את ה-r האמריקאית',
      en: 'Tell w from v and say the American r',
      pl: 'Odróżnić w od v i wymówić amerykańskie r',
      cnr: 'Razlikovati w od v i izgovoriti američko r',
    },
    {
      he: 'לשמוע את ההבדל בין ship ל-sheep ובין bad ל-bed',
      en: 'Hear the difference between ship and sheep, and bad and bed',
      pl: 'Usłyszeć różnicę między ship a sheep oraz bad a bed',
      cnr: 'Čuti razliku između ship i sheep, i između bad i bed',
    },
  ],
  e2: [
    {
      he: 'להציג את עצמכם ולספר מאיפה אתם ובמה אתם עובדים',
      en: 'Introduce yourself and say where you are from and what you do',
      pl: 'Przedstawić się i powiedzieć, skąd jesteś i czym się zajmujesz',
      cnr: 'Predstaviti se i reći odakle ste i čime se bavite',
    },
    {
      he: 'לנהל שיחת חולין קצרה ולהיפרד יפה',
      en: 'Keep up a short chat and say goodbye nicely',
      pl: 'Poprowadzić krótką pogawędkę i ładnie się pożegnać',
      cnr: 'Voditi kratak razgovor i lijepo se pozdraviti',
    },
    {
      he: 'לבקש שיחזרו על משהו או ידברו לאט יותר',
      en: 'Ask someone to say it again or speak more slowly',
      pl: 'Poprosić, żeby ktoś powtórzył albo mówił wolniej',
      cnr: 'Zamoliti nekoga da ponovi ili da govori sporije',
    },
  ],
  e3: [
    {
      he: 'להזמין קפה, לבקש שולחן ותפריט',
      en: 'Order a coffee, get a table and ask for the menu',
      pl: 'Zamówić kawę, poprosić o stolik i menu',
      cnr: 'Naručiti kafu, tražiti sto i jelovnik',
    },
    {
      he: 'להזמין מנה עם בקשות מיוחדות ("בלי בצל")',
      en: 'Order a dish with special requests ("no onions")',
      pl: 'Zamówić danie ze specjalnymi prośbami („bez cebuli”)',
      cnr: 'Naručiti jelo s posebnim željama („bez luka”)',
    },
    {
      he: 'לבקש חשבון, לשלם בכרטיס ולהשאיר טיפ',
      en: 'Ask for the check, pay by card and leave a tip',
      pl: 'Poprosić o rachunek, zapłacić kartą i zostawić napiwek',
      cnr: 'Tražiti račun, platiti karticom i ostaviti bakšiš',
    },
  ],
  e4: [
    {
      he: 'לשאול איך מגיעים ולהבין הוראות הגעה',
      en: 'Ask the way and follow directions',
      pl: 'Zapytać o drogę i zrozumieć wskazówki',
      cnr: 'Pitati za put i razumjeti uputstva',
    },
    {
      he: 'לקנות כרטיס ולשאול מתי יוצאת הרכבת הבאה',
      en: 'Buy a ticket and ask when the next train leaves',
      pl: 'Kupić bilet i zapytać, kiedy odjeżdża następny pociąg',
      cnr: 'Kupiti kartu i pitati kada polazi sljedeći voz',
    },
    {
      he: 'לומר שהלכתם לאיבוד ולתת לנהג מונית כתובת',
      en: 'Say you are lost and give a taxi driver an address',
      pl: 'Powiedzieć, że nie wiesz, gdzie jesteś, i podać taksówkarzowi adres',
      cnr: 'Reći da ste se izgubili i dati taksisti adresu',
    },
  ],
  e5: [
    {
      he: 'לשאול כמה זה עולה ולבקש משהו זול יותר',
      en: 'Ask how much it is and for something cheaper',
      pl: 'Zapytać o cenę i poprosić o coś tańszego',
      cnr: 'Pitati koliko košta i tražiti nešto jeftinije',
    },
    {
      he: 'לבקש מידה אחרת ולמדוד',
      en: 'Ask for another size and try it on',
      pl: 'Poprosić o inny rozmiar i przymierzyć',
      cnr: 'Tražiti drugu veličinu i probati',
    },
    {
      he: 'לשלם, לבקש שקית ולהחזיר מוצר',
      en: 'Pay, ask for a bag and return an item',
      pl: 'Zapłacić, poprosić o torbę i zwrócić towar',
      cnr: 'Platiti, tražiti kesu i vratiti robu',
    },
  ],
  e6: [
    {
      he: "לעשות צ'ק-אין במלון ולדווח על תקלה בחדר",
      en: 'Check in at a hotel and report a problem in the room',
      pl: 'Zameldować się w hotelu i zgłosić usterkę w pokoju',
      cnr: 'Prijaviti se u hotelu i reći da nešto u sobi ne radi',
    },
    {
      he: 'למצוא את השער ולהסתדר כשהטיסה מתעכבת',
      en: 'Find your gate and cope with a delayed flight',
      pl: 'Znaleźć swoją bramkę i poradzić sobie z opóźnionym lotem',
      cnr: 'Pronaći svoj izlaz i snaći se kad let kasni',
    },
    {
      he: 'לנהל שיחת עבודה בטלפון ולקבוע פגישה',
      en: 'Handle a work call and set up a meeting',
      pl: 'Przeprowadzić rozmowę służbową przez telefon i umówić spotkanie',
      cnr: 'Obaviti poslovni razgovor telefonom i zakazati sastanak',
    },
  ],

  // --- Hebrew (for English, Polish and Montenegrin speakers) ---
  h0: [
    {
      he: 'לקרוא את כל 22 האותיות ואת האותיות הסופיות',
      en: 'Read all 22 letters and their final forms',
      pl: 'Czytać wszystkie 22 litery i ich formy końcowe',
      cnr: 'Čitati sva 22 slova i njihove završne oblike',
    },
    {
      he: 'לקרוא מילים מנוקדות',
      en: 'Sound out words written with vowel signs (niqqud)',
      pl: 'Odczytywać słowa zapisane ze znakami samogłosek (nikud)',
      cnr: 'Čitati riječi napisane sa znacima za samoglasnike (nikud)',
    },
    {
      he: 'לכתוב מילים פשוטות במקלדת עברית',
      en: 'Write simple words on the Hebrew keyboard',
      pl: 'Pisać proste słowa na hebrajskiej klawiaturze',
      cnr: 'Pisati jednostavne riječi na hebrejskoj tastaturi',
    },
  ],
  h1: [
    {
      he: 'לברך בכל שעה ביום',
      en: 'Greet people at any time of day',
      pl: 'Przywitać się o każdej porze dnia',
      cnr: 'Pozdraviti ljude u bilo koje doba dana',
    },
    {
      he: 'לומר בבקשה, תודה וסליחה',
      en: 'Say please, thank you and sorry',
      pl: 'Powiedzieć proszę, dziękuję i przepraszam',
      cnr: 'Reći molim, hvala i izvinite',
    },
    {
      he: 'לענות על "מה נשמע?" כמו ישראלים',
      en: 'Answer "How is it going?" the Israeli way',
      pl: 'Odpowiedzieć na „Co słychać?” po izraelsku',
      cnr: 'Odgovoriti na „Kako je?” kao Izraelci',
    },
  ],
  h2: [
    {
      he: 'להציג את עצמכם ולשאול איך קוראים למישהו',
      en: 'Introduce yourself and ask someone’s name',
      pl: 'Przedstawić się i zapytać kogoś o imię',
      cnr: 'Predstaviti se i pitati nekoga kako se zove',
    },
    {
      he: 'לספר מאיפה אתם ואיפה אתם גרים',
      en: 'Say where you are from and where you live',
      pl: 'Powiedzieć, skąd jesteś i gdzie mieszkasz',
      cnr: 'Reći odakle ste i gdje živite',
    },
    {
      he: 'לפנות נכון לגבר ולאישה',
      en: 'Address a man and a woman correctly',
      pl: 'Poprawnie zwracać się do mężczyzny i do kobiety',
      cnr: 'Pravilno se obratiti muškarcu i ženi',
    },
  ],
  h3: [
    {
      he: 'להזמין קפה ופלאפל בדיוק כמו שאתם אוהבים',
      en: 'Order coffee and falafel just the way you like them',
      pl: 'Zamówić kawę i falafel dokładnie tak, jak lubisz',
      cnr: 'Naručiti kafu i falafel baš onako kako volite',
    },
    {
      he: 'לומר שאתם לא אוכלים בשר או שאתם רעבים',
      en: 'Say you do not eat meat or that you are hungry',
      pl: 'Powiedzieć, że nie jesz mięsa albo że chce ci się jeść',
      cnr: 'Reći da ne jedete meso ili da ste gladni',
    },
    {
      he: 'לשבח את האוכל ולבקש חשבון',
      en: 'Praise the food and ask for the bill',
      pl: 'Pochwalić jedzenie i poprosić o rachunek',
      cnr: 'Pohvaliti hranu i tražiti račun',
    },
  ],
  h4: [
    {
      he: 'לספור עד עשר ולהבין מחירים בשקלים',
      en: 'Count to ten and understand prices in shekels',
      pl: 'Liczyć do dziesięciu i rozumieć ceny w szeklach',
      cnr: 'Brojati do deset i razumjeti cijene u šekelima',
    },
    {
      he: 'לקנות פירות וירקות בשוק',
      en: 'Buy fruit and vegetables at the market',
      pl: 'Kupić owoce i warzywa na targu',
      cnr: 'Kupiti voće i povrće na pijaci',
    },
    {
      he: 'להתמקח ולשלם בכרטיס',
      en: 'Bargain and pay by card',
      pl: 'Potargować się i zapłacić kartą',
      cnr: 'Cjenkati se i platiti karticom',
    },
  ],
  h5: [
    {
      he: 'לשאול איפה התחנה או השירותים',
      en: 'Ask where the station or the restrooms are',
      pl: 'Zapytać, gdzie jest dworzec albo toaleta',
      cnr: 'Pitati gdje je stanica ili toalet',
    },
    {
      he: 'להבין הוראות הגעה ולשאול אם זה רחוק',
      en: 'Follow directions and ask if it is far',
      pl: 'Zrozumieć wskazówki i zapytać, czy to daleko',
      cnr: 'Razumjeti uputstva i pitati da li je daleko',
    },
    {
      he: 'לנסוע באוטובוס, ברכבת או במונית',
      en: 'Take a bus, a train or a taxi',
      pl: 'Pojechać autobusem, pociągiem albo taksówką',
      cnr: 'Putovati autobusom, vozom ili taksijem',
    },
  ],
  h6: [
    {
      he: 'להציג את המשפחה שלכם',
      en: 'Introduce your family',
      pl: 'Przedstawić swoją rodzinę',
      cnr: 'Predstaviti svoju porodicu',
    },
    {
      he: 'לומר איך אתם מרגישים',
      en: 'Say how you feel',
      pl: 'Powiedzieć, jak się czujesz',
      cnr: 'Reći kako se osjećate',
    },
    {
      he: 'לאחל שבת שלום וחג שמח',
      en: 'Wish Shabbat shalom and a happy holiday',
      pl: 'Życzyć szabat szalom i wesołych świąt',
      cnr: 'Poželjeti šabat šalom i srećan praznik',
    },
  ],
};
