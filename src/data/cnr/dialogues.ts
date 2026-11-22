import type { Roleplay, RoleplayOption } from '../dialogues';

/** Montenegrin roleplay scenarios (same format as data/dialogues). */

const ok = (polish: string, he: string, en: string, fbHe: string, fbEn: string): RoleplayOption => ({ polish, t: { he, en }, correct: true, feedback: { he: fbHe, en: fbEn } });
const no = (polish: string, he: string, en: string, fbHe: string, fbEn: string): RoleplayOption => ({ polish, t: { he, en }, correct: false, feedback: { he: fbHe, en: fbEn } });
const line = (polish: string, he: string, en: string) => ({ polish, t: { he, en } });

export const CNR_ROLEPLAYS: Roleplay[] = [
  {
    id: 'kotor-cafe',
    title: { he: 'בית קפה בקוטור', en: 'A café in Kotor' },
    setting: {
      he: 'התיישבתם בבית קפה בעיר העתיקה של קוטור, מול החומות. המלצר לא מכיר אתכם – לכן מדברים ברשמיות, עם Vi.',
      en: 'You sit down at a café in Kotor’s Old Town, facing the city walls. The waiter does not know you – so keep it formal, with Vi.',
    },
    partner: { he: 'המלצר', en: 'Waiter' },
    voice: 'm',
    register: 'formal',
    turns: [
      {
        line: line('Dobar dan! Izvolite?', 'יום טוב! במה אפשר לעזור?', 'Good afternoon! What can I get you?'),
        options: [
          ok('Dobar dan. Jednu kafu, molim.', 'יום טוב. קפה אחד, בבקשה.', 'Good afternoon. One coffee, please.', 'מושלם: ברכה, הזמנה ו-molim בסוף.', 'Perfect: a greeting, your order and molim at the end.'),
          no('Ćao! Daj mi kafu.', 'היי! תן לי קפה.', 'Hi! Give me a coffee.', 'Ćao ו-daj ("תן") מתאימים לחברים – מול מלצר זר זה נשמע גס.', 'Ćao and daj ("give") are for friends – to a waiter you do not know it sounds rude.'),
        ],
      },
      {
        line: line('Domaću ili espreso?', 'קפה ביתי או אספרסו?', 'Turkish-style or espresso?'),
        options: [
          ok('Domaću, molim.', 'ביתי, בבקשה.', 'Turkish-style, please.', 'נכון! domaća הופכת ל-domaću, כמו kafa → kafu.', 'Right! domaća becomes domaću, just like kafa → kafu.'),
          no('Laku noć.', 'לילה טוב.', 'Good night.', 'זו ברכת לילה, לא תשובה לשאלה.', 'That is a goodnight wish, not an answer.'),
          no('Četiri.', 'ארבע.', 'Four.', 'נשאלתם איזה קפה, לא כמה.', 'You were asked which coffee, not how many.'),
        ],
      },
      {
        line: line('Sa mlijekom?', 'עם חלב?', 'With milk?'),
        options: [
          ok('Ne, hvala.', 'לא, תודה.', 'No, thank you.', 'קצר ומנומס.', 'Short and polite.'),
          no('Desno, molim.', 'ימינה, בבקשה.', 'To the right, please.', 'desno זה כיוון – לא מתאים כאן.', 'desno is a direction – not what was asked.'),
        ],
      },
      {
        line: line('Još nešto?', 'עוד משהו?', 'Anything else?'),
        options: [
          ok('Čašu vode, molim.', 'כוס מים, בבקשה.', 'A glass of water, please.', 'מצוין – גם כאן čaša הופכת ל-čašu, כי אתם מבקשים אותה.', 'Excellent – here too čaša becomes čašu, because you are asking for it.'),
          no('Prijatno!', 'בתיאבון!', 'Enjoy your meal!', 'Prijatno אומרים למי שאוכל – לא כשמזמינים.', 'Prijatno is said to someone eating – not when ordering.'),
        ],
      },
      {
        line: line('Izvolite. To je dva eura.', 'בבקשה. זה שני יורו.', 'Here you are. That is two euros.'),
        options: [
          ok('Hvala lijepa! Doviđenja.', 'תודה רבה! להתראות.', 'Thank you very much! Goodbye.', 'פרידה מנומסת ומושלמת. (במונטנגרו משלמים ביורו.)', 'A perfect polite goodbye. (Montenegro uses the euro.)'),
          no('Ćao, druže!', 'ביי, אחי!', 'Bye, mate!', 'druže ("חבר") ו-Ćao קלילים מדי למלצר שאתם לא מכירים. אמרו Doviđenja.', 'druže ("mate") and Ćao are too casual for a waiter you do not know. Say Doviđenja.'),
        ],
      },
    ],
  },
];
