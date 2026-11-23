import type { Roleplay, RoleplayOption } from '../dialogues';

/**
 * English roleplay scenarios (same format as data/dialogues). The course is taught in Hebrew only,
 * so the English translation fields repeat the English line.
 */

const ok = (text: string, he: string, fb: string): RoleplayOption => ({ polish: text, t: { he, en: text }, correct: true, feedback: { he: fb, en: fb } });
const no = (text: string, he: string, fb: string): RoleplayOption => ({ polish: text, t: { he, en: text }, correct: false, feedback: { he: fb, en: fb } });
const line = (text: string, he: string) => ({ polish: text, t: { he, en: text } });

export const EN_ROLEPLAYS: Roleplay[] = [
  {
    id: 'nyc-coffee',
    title: { he: 'בית קפה בניו יורק', en: 'A coffee shop in New York' },
    setting: {
      he: 'אתם בתור בבית קפה במנהטן. הבריסטה מדבר מהר ומחכה להזמנה – תענו קצר וברור.',
      en: 'You are in line at a coffee shop in Manhattan. The barista talks fast and waits for your order – answer short and clear.',
    },
    partner: { he: 'הבריסטה', en: 'Barista' },
    voice: 'm',
    register: 'neutral',
    turns: [
      {
        line: line('Hi there! What can I get you?', 'היי! מה אפשר להביא לך?'),
        options: [
          ok('Can I get a coffee, please?', 'אפשר לקבל קפה, בבקשה?', 'מושלם – Can I get… היא הדרך הרגילה להזמין באמריקה.'),
          no('Give me coffee.', 'תן לי קפה.', 'Give me בלי please נשמע גס באנגלית. אמרו Can I get… please.'),
        ],
      },
      {
        line: line('Sure. For here or to go?', 'בטח. לשבת או לקחת?'),
        options: [
          ok('To go, please.', 'לקחת, בבקשה.', 'נכון! To go = טייק-אוויי.'),
          no('Yes, please.', 'כן, בבקשה.', 'זו שאלת "או-או": עונים For here או To go.'),
        ],
      },
      {
        line: line('What size?', 'איזה גודל?'),
        options: [
          ok('Small, please.', 'קטן, בבקשה.', 'קצר וברור.'),
          no('Three, please.', 'שלוש, בבקשה.', 'נשאלתם על גודל, לא על כמות. אמרו Small, Medium או Large.'),
        ],
      },
      {
        line: line('Anything else?', 'עוד משהו?'),
        options: [
          ok("No, that's it. Thank you!", 'לא, זה הכל. תודה!', 'מצוין – That’s it = "זהו, זה הכל".'),
          no('See you later!', 'נתראה אחר כך!', 'זו פרידה, לא תשובה. אמרו No, that’s it.'),
        ],
      },
      {
        line: line("That's four fifty.", 'זה ארבעה וחמישים.', ),
        options: [
          ok('Can I pay by card?', 'אפשר לשלם בכרטיס?', 'נכון. ($4.50 אומרים four fifty.)'),
          no('It was delicious!', 'זה היה טעים מאוד!', 'עוד לא שתיתם... קודם משלמים.'),
        ],
      },
    ],
  },
  {
    id: 'hotel-check-in',
    title: { he: 'צ׳ק-אין במלון', en: 'Hotel check-in' },
    setting: {
      he: 'הגעתם למלון בשיקגו אחרי טיסה ארוכה. פקידת הקבלה אדיבה – דברו בנימוס.',
      en: 'You arrive at a hotel in Chicago after a long flight. The receptionist is friendly – be polite.',
    },
    partner: { he: 'פקידת הקבלה', en: 'Receptionist' },
    voice: 'f',
    register: 'formal',
    turns: [
      {
        line: line('Good evening! Checking in?', 'ערב טוב! צ׳ק-אין?'),
        options: [
          ok('Yes, I have a reservation.', 'כן, יש לי הזמנה.', 'מושלם.'),
          no("No, I'm just looking.", 'לא, אני רק מסתכל.', 'את זה אומרים בחנות, לא בקבלה של מלון.'),
        ],
      },
      {
        line: line('Can I have your name, please?', 'אפשר את שמך, בבקשה?'),
        options: [
          ok('My name is {name}.', 'קוראים לי {name}.', 'נכון.'),
          no('Nice to meet you.', 'נעים להכיר.', 'ביקשו את השם שלכם – אמרו My name is…'),
        ],
      },
      {
        line: line("Thank you. You're in room four twelve.", 'תודה. אתם בחדר ארבע-מאות-ושתים-עשרה.'),
        options: [
          ok('Is breakfast included?', 'ארוחת הבוקר כלולה?', 'שאלה טובה ושימושית.'),
          no('Is it spicy?', 'זה חריף?', 'שאלה של מסעדה, לא של קבלה.'),
        ],
      },
      {
        line: line('Yes, from seven to ten.', 'כן, משבע עד עשר.'),
        options: [
          ok('What time is check-out?', 'באיזו שעה הצ׳ק-אאוט?', 'מצוין – כדאי לדעת מראש.'),
          no('Go straight and turn left.', 'לך ישר ופנה שמאלה.', 'אתם נותנים הוראות דרך – לא מתאים כאן.'),
        ],
      },
      {
        line: line('Eleven. Enjoy your stay!', 'באחת-עשרה. תיהנו מהשהייה!'),
        options: [
          ok('Thank you very much!', 'תודה רבה!', 'פרידה מנומסת.'),
          no("I'll take it.", 'אני אקח את זה.', 'את זה אומרים כשקונים משהו.'),
        ],
      },
    ],
  },
  {
    id: 'street-directions',
    title: { he: 'שואלים את הדרך', en: 'Asking the way' },
    setting: {
      he: 'אתם בסן פרנסיסקו ומחפשים בית מרקחת. עוצרים אדם ברחוב – פותחים ב-Excuse me.',
      en: 'You are in San Francisco looking for a pharmacy. You stop someone in the street – start with Excuse me.',
    },
    partner: { he: 'עובר אורח', en: 'Passer-by' },
    voice: 'm',
    register: 'formal',
    turns: [
      {
        line: line('Hi! Can I help you?', 'היי! אפשר לעזור לך?'),
        options: [
          ok('Excuse me, is there a pharmacy near here?', 'סליחה, יש בית מרקחת קרוב לכאן?', 'מנומס ומדויק.'),
          no("I'm fine, thanks.", 'אני בסדר, תודה.', 'הוא הציע עזרה – וזה בדיוק מה שאתם צריכים. שאלו על בית המרקחת.'),
        ],
      },
      {
        line: line('Yes. Go straight and turn right at the corner.', 'כן. לך ישר ופנה ימינה בפינה.'),
        options: [
          ok('Is it far from here?', 'זה רחוק מכאן?', 'שאלה טבעית.'),
          no('Can I try it on?', 'אפשר למדוד?', 'את זה שואלים בחנות בגדים.'),
        ],
      },
      {
        line: line("No, it's a five minute walk.", 'לא, זה חמש דקות הליכה.'),
        options: [
          ok('Could you show me on the map?', 'תוכל להראות לי על המפה?', 'מצוין – ככה לא תלכו לאיבוד.'),
          no('Keep the change.', 'תשאיר את העודף.', 'את זה אומרים כשמשלמים.'),
        ],
      },
      {
        line: line("Sure. It's right here, on the left.", 'בטח. זה כאן, בצד שמאל.'),
        options: [
          ok('Thank you so much! Have a nice day!', 'תודה רבה! שיהיה לך יום נעים!', 'פרידה חמה ומנומסת.'),
          no('Where are you from?', 'מאיפה אתה?', 'שאלה נחמדה, אבל הוא סיים לעזור – הודו לו.'),
        ],
      },
    ],
  },
];
