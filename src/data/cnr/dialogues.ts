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
  {
    id: 'green-market',
    title: { he: 'בשוק בפודגוריצה', en: 'At the market in Podgorica' },
    setting: {
      he: 'בוקר בשוק הירוק של פודגוריצה. המוכרת בדוכן הפירות לא מכירה אתכם – פונים אליה ב-Vi, ואפשר גם להתמקח קצת.',
      en: 'Morning at Podgorica’s green market. The woman at the fruit stall does not know you – address her with Vi, and feel free to bargain a little.',
    },
    partner: { he: 'המוכרת', en: 'Stallholder' },
    voice: 'f',
    register: 'formal',
    turns: [
      {
        line: line('Dobar dan! Izvolite?', 'יום טוב! במה אפשר לעזור?', 'Good morning! What would you like?'),
        options: [
          ok('Dobar dan. Kilo jabuka, molim.', 'יום טוב. קילו תפוחים, בבקשה.', 'Good morning. A kilo of apples, please.', 'מצוין: ברכה, כמות ו-molim בסוף.', 'Excellent: a greeting, the amount and molim at the end.'),
          no('Laku noć!', 'לילה טוב!', 'Good night!', 'זו ברכה לפני השינה – בשוק של בוקר אומרים Dobar dan.', 'That is a bedtime wish – at a morning market you say Dobar dan.'),
          no('Boli me glava.', 'כואב לי הראש.', 'I have a headache.', 'עם זה הולכים לבית מרקחת, לא לדוכן תפוחים.', 'That is for a pharmacy, not an apple stall.'),
        ],
      },
      {
        line: line('Izvolite. Kilo je tri eura.', 'בבקשה. קילו עולה שלושה יורו.', 'Here you are. A kilo is three euros.'),
        options: [
          ok('Skupo je! Može popust?', 'יקר! אפשר הנחה?', 'That’s expensive! Can I get a discount?', 'בשוק מותר להתמקח קצת – בחיוך.', 'At the market a little bargaining is fine – with a smile.'),
          no('Vidimo se!', 'נתראה!', 'See you!', 'הולכים בלי התפוחים? קודם מסיימים את הקנייה.', 'Leaving without the apples? Finish the purchase first.'),
        ],
      },
      {
        line: line('Dobro, dva eura – samo za Vas!', 'טוב, שני יורו – רק בשבילכם!', 'All right, two euros – just for you!'),
        options: [
          ok('Hvala lijepa!', 'תודה רבה!', 'Thank you very much!', 'יורו שלם הנחה – מגיעה לה תודה גדולה.', 'A whole euro off – she deserves a big thank-you.'),
          no('Upomoć!', 'הצילו!', 'Help!', 'Upomoć! צועקים בשעת סכנה, לא כשמקבלים הנחה.', 'You shout Upomoć! in danger, not when you get a discount.'),
        ],
      },
      {
        line: line('Još nešto? Imam i lijepo voće.', 'עוד משהו? יש לי גם פירות יפים.', 'Anything else? I have lovely fruit too.'),
        options: [
          ok('Ne, hvala. To je sve.', 'לא, תודה. זה הכול.', 'No, thanks. That’s all.', 'To je sve – "זה הכול". סיום מנומס של קנייה.', 'To je sve – "that’s all". A polite way to finish shopping.'),
          no('Jednu kartu za Budvu.', 'כרטיס אחד לבודבה.', 'One ticket to Budva.', 'כרטיסים קונים בתחנת האוטובוס, לא בדוכן הפירות.', 'Tickets are sold at the bus station, not at the fruit stall.'),
        ],
      },
      {
        line: line('Prijatan dan! Doviđenja.', 'יום נעים! להתראות.', 'Have a nice day! Goodbye.'),
        options: [
          ok('Hvala, doviđenja!', 'תודה, להתראות!', 'Thanks, goodbye!', 'פרידה מושלמת.', 'A perfect goodbye.'),
          no('Dobro jutro!', 'בוקר טוב!', 'Good morning!', 'זו ברכה כשמגיעים – עכשיו אתם נפרדים.', 'That is a greeting for arriving – now you are leaving.'),
        ],
      },
    ],
  },
  {
    id: 'bus-to-budva',
    title: { he: 'כרטיס לבודבה', en: 'A ticket to Budva' },
    setting: {
      he: 'אתם בקופה של תחנת האוטובוסים בקוטור ורוצים להגיע לבודבה. הקופאי לא מכיר אתכם – מדברים ברשמיות, עם Vi.',
      en: 'You are at the ticket window of Kotor bus station and want to get to Budva. The clerk does not know you – keep it formal, with Vi.',
    },
    partner: { he: 'הקופאי', en: 'Ticket clerk' },
    voice: 'm',
    register: 'formal',
    turns: [
      {
        line: line('Dobar dan. Izvolite?', 'יום טוב. במה אפשר לעזור?', 'Good afternoon. Can I help you?'),
        options: [
          ok('Jednu kartu za Budvu, molim.', 'כרטיס אחד לבודבה, בבקשה.', 'One ticket to Budva, please.', 'נכון: karta → kartu ו-Budva → Budvu.', 'Right: karta → kartu and Budva → Budvu.'),
          no('Račun, molim.', 'חשבון, בבקשה.', 'The bill, please.', 'račun מבקשים במסעדה, אחרי האוכל.', 'You ask for the račun at a restaurant, after the meal.'),
        ],
      },
      {
        line: line('Za danas ili za sjutra?', 'להיום או למחר?', 'For today or tomorrow?'),
        options: [
          ok('Za danas, molim.', 'להיום, בבקשה.', 'For today, please.', 'קצר וברור.', 'Short and clear.'),
          no('Dobro jutro.', 'בוקר טוב.', 'Good morning.', 'שאלו אתכם על יום הנסיעה – danas (היום) או sjutra (מחר).', 'You were asked about the day – danas (today) or sjutra (tomorrow).'),
        ],
      },
      {
        line: line('To je šest eura.', 'זה שישה יורו.', 'That is six euros.'),
        options: [
          ok('Mogu li platiti karticom?', 'אפשר לשלם בכרטיס?', 'Can I pay by card?', 'שאלה שימושית – לא בכל מקום מקבלים כרטיס.', 'A useful question – not every place takes cards.'),
          no('Vruće je!', 'חם!', 'It’s hot!', 'נכון, אבל הקופאי מחכה לתשלום.', 'True, but the clerk is waiting to be paid.'),
        ],
      },
      {
        line: line('Može. Izvolite kartu.', 'אפשר. הנה הכרטיס.', 'Sure. Here is your ticket.'),
        options: [
          ok('Hvala. Kada polazi autobus?', 'תודה. מתי יוצא האוטובוס?', 'Thanks. When does the bus leave?', 'מצוין – עכשיו תדעו מתי להיות ברציף.', 'Excellent – now you will know when to be at the platform.'),
          no('Živjeli!', 'לחיים!', 'Cheers!', 'Živjeli אומרים עם כוס ביד, לא עם כרטיס.', 'You say Živjeli with a glass in hand, not a ticket.'),
        ],
      },
      {
        line: line('U osam. Peron tri.', 'בשמונה. רציף שלוש.', 'At eight. Platform three.'),
        options: [
          ok('Hvala lijepa! Doviđenja.', 'תודה רבה! להתראות.', 'Thank you very much! Goodbye.', 'פרידה מנומסת – ויש לכם עוד זמן לקפה.', 'A polite goodbye – and you still have time for a coffee.'),
          no('Osam eura?', 'שמונה יורו?', 'Eight euros?', 'U osam פירושו "בשמונה" – זו השעה, לא המחיר.', 'U osam means "at eight" – that is the time, not the price.'),
        ],
      },
    ],
  },
  {
    id: 'apoteka',
    title: { he: 'בבית המרקחת בבודבה', en: 'At the pharmacy in Budva' },
    setting: {
      he: 'ביליתם יום שלם בחוף בלי כובע, ועכשיו לא טוב לכם. נכנסתם לבית מרקחת בבודבה. הרוקחת לא מכירה אתכם – מדברים ב-Vi.',
      en: 'You spent a whole day on the beach without a hat, and now you do not feel well. You walk into a pharmacy in Budva. The pharmacist does not know you – use Vi.',
    },
    partner: { he: 'הרוקחת', en: 'Pharmacist' },
    voice: 'f',
    register: 'formal',
    turns: [
      {
        line: line('Dobar dan, izvolite?', 'יום טוב, במה אפשר לעזור?', 'Good afternoon, how can I help?'),
        options: [
          ok('Dobar dan. Nije mi dobro.', 'יום טוב. לא טוב לי.', 'Good afternoon. I don’t feel well.', 'פתיחה ברורה – עכשיו היא תשאל מה כואב.', 'A clear start – now she will ask what hurts.'),
          no('Jednu kafu, molim.', 'קפה אחד, בבקשה.', 'One coffee, please.', 'זה בית מרקחת, לא בית קפה.', 'This is a pharmacy, not a café.'),
        ],
      },
      {
        line: line('Šta Vas boli?', 'מה כואב לכם?', 'What hurts?'),
        options: [
          ok('Boli me glava.', 'כואב לי הראש.', 'I have a headache.', 'מצוין – מילה במילה "כואב אותי הראש".', 'Excellent – word for word "hurts me the head".'),
          no('Volim Crnu Goru.', 'אני {אוהב|אוהבת} את מונטנגרו.', 'I love Montenegro.', 'יפה מאוד, אבל היא שאלה מה כואב לכם.', 'Lovely, but she asked what hurts.'),
        ],
      },
      {
        line: line('Jeste li bili na suncu?', 'הייתם בשמש?', 'Have you been in the sun?'),
        options: [
          ok('Da, cijeli dan na plaži.', 'כן, כל היום בחוף.', 'Yes, all day on the beach.', 'נכון: plaža → na plaži, "בחוף". cijeli = "כל, שלם".', 'Right: plaža → na plaži, "on the beach". cijeli means "whole".'),
          no('Skupo je!', 'יקר!', 'That’s expensive!', 'היא עוד לא אמרה מחיר – היא שאלה אם הייתם בשמש.', 'She has not named a price yet – she asked whether you were in the sun.'),
        ],
      },
      {
        line: line('Izvolite ovaj lijek. I pijte mnogo vode!', 'הנה התרופה הזאת. ותשתו הרבה מים!', 'Here is this medicine. And drink plenty of water!'),
        options: [
          ok('Hvala! Koliko košta?', 'תודה! כמה זה עולה?', 'Thank you! How much is it?', 'תודה ומיד שאלת המחיר – בדיוק כך.', 'A thank-you and then the price – exactly right.'),
          no('Upomoć!', 'הצילו!', 'Help!', 'אתם כבר מקבלים עזרה – אין צורך לצעוק.', 'You are already getting help – no need to shout.'),
        ],
      },
      {
        line: line('Pet eura. Brzo ozdravite!', 'חמישה יורו. החלמה מהירה!', 'Five euros. Get well soon!'),
        options: [
          ok('Hvala lijepa! Doviđenja.', 'תודה רבה! להתראות.', 'Thank you very much! Goodbye.', 'פרידה מנומסת. ובפעם הבאה – כובע!', 'A polite goodbye. And next time – a hat!'),
          no('Može popust?', 'אפשר הנחה?', 'Can I get a discount?', 'בבית מרקחת המחירים קבועים – מתמקחים רק בשוק.', 'Pharmacy prices are fixed – you bargain only at the market.'),
        ],
      },
    ],
  },
];
