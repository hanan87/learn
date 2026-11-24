import type { GlossEntry, Story, StoryLine } from '../stories';

/**
 * Mini stories of the English course (same format as data/stories). Meanings and notes are in
 * Hebrew, Polish and Montenegrin, the course's interface languages; the English fields repeat the
 * English text (the course has no English interface). Words are spelled in lib/enPhonetics' lexicon.
 */

type Tri = [he: string, pl: string, cnr: string];

const tri = (en: string, [he, pl, cnr]: Tri) => ({ he, en, pl, cnr });
const g = (en: string, t: Tri, base?: string, note?: Tri): GlossEntry => ({ t: tri(en, t), base, note: note ? tri(en, note) : undefined });
const L = (speaker: string, text: string, t: Tri): StoryLine => ({ speaker, polish: text, t: tri(text, t) });
const o = (text: string, t: Tri, correct = false) => ({ polish: text, t: tri(text, t), correct });
const q = (text: string, t: Tri, options: ReturnType<typeof o>[]) => ({ q: text, t: tri(text, t), options });

/** Words shared by several stories. */
export const EN_COMMON: Record<string, GlossEntry> = {
  a: g('a', ['(מילית לפני שם עצם)', 'rodzajnik (jakiś, jeden)', 'član (neki, jedan)'], undefined, [
    'לפני שם עצם ביחיד, כשמדברים עליו בפעם הראשונה: a coffee = קפה (אחד).',
    'Przed rzeczownikiem w liczbie pojedynczej, o którym mówimy pierwszy raz: a coffee = (jakaś) kawa.',
    'Ispred imenice u jednini o kojoj se govori prvi put: a coffee = (neka) kafa.',
  ]),
  the: g('the', ['ה־ (הידיעה)', 'rodzajnik określony (ten)', 'određeni član (taj)']),
  i: g('I', ['אני', 'ja', 'ja'], undefined, ['I נכתבת תמיד באות גדולה.', 'I zawsze piszemy wielką literą.', 'I se uvijek piše velikim slovom.']),
  you: g('you', ['אתה / את / אתם', 'ty / wy / pan, pani', 'ti / vi']),
  me: g('me', ['אותי / אני', 'mnie / ja', 'mene / ja']),
  my: g('my', ['שלי', 'mój', 'moj']),
  your: g('your', ['שלך', 'twój', 'tvoj / vaš']),
  is: g('is', ['הוא / היא / זה (נמצא)', 'jest', 'je'], 'be', ['be (להיות) → is: הוא / היא / זה.', 'be (być) → is: on / ona / to jest.', 'be (biti) → is: on / ona / to je.']),
  are: g('are', ['אתה / אתם (להיות)', 'jesteś / jesteście', 'si / ste'], 'be', ['be → are: אחרי you, we, they.', 'be → are: po you, we, they.', 'be → are: poslije you, we, they.']),
  "it's": g("it's", ['זה', 'to (jest)', 'to je'], undefined, ['It’s = It is (קיצור).', 'It’s = It is (skrót).', 'It’s = It is (skraćeno).']),
  "i'm": g("I'm", ['אני', 'jestem', 'ja sam'], undefined, ['I’m = I am (קיצור).', 'I’m = I am (skrót).', 'I’m = I am (skraćeno).']),
  "that's": g("that's", ['זה', 'to (jest)', 'to je'], undefined, ['That’s = That is (קיצור).', 'That’s = That is (skrót).', 'That’s = That is (skraćeno).']),
  "what's": g("what's", ['מה (זה)', 'co / jak (jest)', 'šta / kako (je)'], undefined, ['What’s = What is (קיצור).', 'What’s = What is (skrót).', 'What’s = What is (skraćeno).']),
  what: g('what', ['מה', 'co', 'šta']),
  how: g('how', ['איך', 'jak', 'kako']),
  please: g('please', ['בבקשה', 'proszę', 'molim']),
  sorry: g('sorry', ['סליחה / מצטער', 'przepraszam / przykro mi', 'izvinite / žao mi je']),
  hi: g('hi', ['היי', 'cześć', 'zdravo']),
  yes: g('yes', ['כן', 'tak', 'da']),
  no: g('no', ['לא', 'nie', 'ne']),
  not: g('not', ['לא (שלילה)', 'nie', 'ne']),
  oh: g('oh', ['אוי / אה', 'och', 'oh']),
  and: g('and', ['ו־', 'i / a', 'i / a']),
  for: g('for', ['בשביל / עבור', 'dla / za', 'za']),
  to: g('to', ['ל־ / אל', 'do / żeby', 'u / do / da']),
  in: g('in', ['ב־ (בתוך)', 'w', 'u']),
  it: g('it', ['זה / הוא', 'to / on', 'to / on']),
  this: g('this', ['זה', 'to / ten', 'ovo / ovaj']),
  very: g('very', ['מאוד', 'bardzo', 'vrlo / jako']),
  so: g('so', ['כל כך', 'tak / tak bardzo', 'tako / baš']),
  great: g('great', ['מעולה', 'świetnie', 'super / odlično']),
  just: g('just', ['רק / פשוט', 'tylko / po prostu', 'samo']),
  little: g('little', ['קטן / קצת', 'mały / trochę', 'mali / malo'], undefined, ['a little = קצת.', 'a little = trochę.', 'a little = malo.']),
  do: g('do', ['(פועל עזר לשאלה)', '(czasownik posiłkowy w pytaniu)', '(pomoćni glagol u pitanju)'], undefined, [
    'בשאלה בהווה מוסיפים do לפני הנושא: Do I go…? / Do you want…?',
    'W pytaniu w czasie teraźniejszym dodajemy do przed podmiotem: Do I go…? / Do you want…?',
    'U pitanju u sadašnjem vremenu dodaje se do ispred subjekta: Do I go…? / Do you want…?',
  ]),
};

export const EN_STORIES: Story[] = [
  {
    id: 'coffee-for-tim',
    title: tri('Coffee for Tim', ['קפה בשביל טים', 'Kawa dla Tima', 'Kafa za Tima']),
    titlePl: 'Coffee for Tim',
    blurb: tri('Coffee for Tim', [
      'בבית קפה אמריקאי כותבים את השם שלך על הכוס… בערך.',
      'W amerykańskiej kawiarni piszą twoje imię na kubku… mniej więcej.',
      'U američkom kafiću pišu vaše ime na šolji… otprilike.',
    ]),
    lines: [
      L('Barista', 'Hi! What can I get you?', ['היי! מה אפשר להביא לך?', 'Cześć! Co podać?', 'Zdravo! Šta da vam donesem?']),
      L('Tom', 'A small coffee, please.', ['קפה קטן, בבקשה.', 'Małą kawę, proszę.', 'Malu kafu, molim.']),
      L('Barista', "Sure! What's your name?", ['בטח! מה השם שלך?', 'Jasne! Jak masz na imię?', 'Naravno! Kako se zovete?']),
      L('Tom', "It's Tom.", ['טום.', 'Tom.', 'Tom.']),
      L('Barista', 'One small coffee for Tim!', ['קפה קטן אחד בשביל טים!', 'Jedna mała kawa dla Tima!', 'Jedna mala kafa za Tima!']),
      L('Tom', 'Sorry, my name is Tom, not Tim.', ['סליחה, קוראים לי טום, לא טים.', 'Przepraszam, mam na imię Tom, nie Tim.', 'Izvinite, zovem se Tom, ne Tim.']),
      L('Barista', "Oh no! I'm so sorry, Tim.", ['אוי לא! אני כל כך מצטערת, טים.', 'O nie! Bardzo przepraszam, Tim.', 'Uh, ne! Baš mi je žao, Tim.']),
      L('Tom', 'You know what? Tim is fine.', ['את יודעת מה? טים זה בסדר.', 'Wiesz co? Tim może być.', 'Znate šta? Može i Tim.']),
    ],
    glossary: {
      can: g('can', ['יכול / אפשר', 'móc', 'moći'], undefined, [
        'What can I get you? = מה אפשר להביא לך? (מילולית: מה אני יכולה להביא לך?)',
        'What can I get you? = Co podać? (dosłownie: co mogę ci przynieść?)',
        'What can I get you? = Šta da vam donesem? (doslovno: šta mogu da vam donesem?)',
      ]),
      get: g('get', ['להביא / לקבל', 'przynieść / dostać', 'donijeti / dobiti'], undefined, [
        'get היא מילה שימושית מאוד: לקבל, להביא, להשיג.',
        'get to bardzo przydatne słowo: dostać, przynieść, zdobyć.',
        'get je vrlo korisna riječ: dobiti, donijeti, nabaviti.',
      ]),
      small: g('small', ['קטן', 'mały', 'mali']),
      coffee: g('coffee', ['קפה', 'kawa', 'kafa']),
      sure: g('sure', ['בטח', 'jasne', 'naravno']),
      name: g('name', ['שם', 'imię', 'ime']),
      tom: g('Tom', ['טום (שם)', 'Tom (imię)', 'Tom (ime)']),
      tim: g('Tim', ['טים (שם)', 'Tim (imię)', 'Tim (ime)']),
      one: g('one', ['אחד', 'jeden', 'jedan']),
      know: g('know', ['לדעת', 'wiedzieć', 'znati'], undefined, ['You know what? = יודע/ת מה?', 'You know what? = Wiesz co?', 'You know what? = Znate šta?']),
      fine: g('fine', ['בסדר', 'w porządku', 'u redu']),
    },
    questions: [
      q('What does Tom order?', ['מה טום מזמין?', 'Co zamawia Tom?', 'Šta Tom naručuje?'], [
        o('A small coffee.', ['קפה קטן.', 'Małą kawę.', 'Malu kafu.'], true),
        o('A large tea.', ['תה גדול.', 'Dużą herbatę.', 'Veliki čaj.']),
        o('Two coffees.', ['שני קפה.', 'Dwie kawy.', 'Dvije kafe.']),
      ]),
      q('What does the barista call him?', ['איך הבריסטה קוראת לו?', 'Jak nazywa go barista?', 'Kako ga barista zove?'], [
        o('Tim.', ['טים.', 'Tim.', 'Tim.'], true),
        o('Tom.', ['טום.', 'Tom.', 'Tom.']),
        o('Sam.', ['סם.', 'Sam.', 'Sem.']),
      ]),
    ],
  },
  {
    id: 'right-behind-you',
    title: tri('Right behind you', ['ממש מאחורייך', 'Tuż za tobą', 'Tik iza vas']),
    titlePl: 'Right behind you',
    blurb: tri('Right behind you', [
      'אנה מחפשת את תחנת הרכבת בניו יורק – והיא קרובה יותר ממה שהיא חושבת.',
      'Anna szuka dworca w Nowym Jorku – a jest bliżej, niż myśli.',
      'Ana traži željezničku stanicu u Njujorku – a bliža je nego što misli.',
    ]),
    lines: [
      L('Anna', 'Excuse me, where is the train station?', ['סליחה, איפה תחנת הרכבת?', 'Przepraszam, gdzie jest dworzec kolejowy?', 'Izvinite, gdje je željeznička stanica?']),
      L('Joe', "The train station? It's very close.", ['תחנת הרכבת? היא קרובה מאוד.', 'Dworzec? Jest bardzo blisko.', 'Željeznička stanica? Vrlo je blizu.']),
      L('Anna', 'Great! Do I go left or right?', ['מעולה! אני הולכת שמאלה או ימינה?', 'Super! Mam iść w lewo czy w prawo?', 'Super! Da idem lijevo ili desno?']),
      L('Joe', "Don't go left or right.", ['אל תלכי לא שמאלה ולא ימינה.', 'Nie idź ani w lewo, ani w prawo.', 'Ne idite ni lijevo ni desno.']),
      L('Anna', 'Straight, then?', ['אז ישר?', 'To prosto?', 'Onda pravo?']),
      L('Joe', 'No. Just turn around.', ['לא. פשוט תסתובבי.', 'Nie. Po prostu się odwróć.', 'Ne. Samo se okrenite.']),
      L('Anna', 'Oh! The station is right behind me!', ['אה! התחנה ממש מאחוריי!', 'Och! Dworzec jest tuż za mną!', 'Oh! Stanica je tik iza mene!']),
      L('Joe', 'Welcome to New York!', ['ברוכה הבאה לניו יורק!', 'Witamy w Nowym Jorku!', 'Dobro došli u Njujork!']),
    ],
    glossary: {
      excuse: g('excuse', ['לסלוח', 'wybaczyć', 'oprostiti'], undefined, [
        'Excuse me = סליחה – כך פונים לאדם זר ברחוב.',
        'Excuse me = przepraszam – tak zaczepia się nieznajomego na ulicy.',
        'Excuse me = izvinite – tako se na ulici obraća nepoznatoj osobi.',
      ]),
      where: g('where', ['איפה', 'gdzie', 'gdje']),
      train: g('train', ['רכבת', 'pociąg', 'voz']),
      station: g('station', ['תחנה', 'stacja / dworzec', 'stanica'], undefined, [
        'train station = תחנת רכבת. באנגלית המילה המתארת באה קודם: train ואחריה station.',
        'train station = dworzec kolejowy. Po angielsku określenie stoi przed rzeczownikiem: najpierw train, potem station.',
        'train station = željeznička stanica. Na engleskom odrednica stoji ispred imenice: prvo train, pa station.',
      ]),
      close: g('close', ['קרוב', 'blisko', 'blizu']),
      go: g('go', ['ללכת', 'iść', 'ići']),
      left: g('left', ['שמאלה', 'w lewo', 'lijevo']),
      or: g('or', ['או', 'czy / albo', 'ili']),
      right: g('right', ['ימינה / ממש', 'w prawo / tuż', 'desno / tik'], undefined, [
        'right = ימינה, אבל גם "ממש": right behind me = ממש מאחוריי.',
        'right = w prawo, ale też „tuż”: right behind me = tuż za mną.',
        'right = desno, ali i „tik”: right behind me = tik iza mene.',
      ]),
      "don't": g("don't", ['אל / לא', 'nie (rób)', 'ne (radi)'], undefined, [
        'Don’t = Do not. בציווי: Don’t go = אל תלך.',
        'Don’t = Do not. W poleceniu: Don’t go = nie idź.',
        'Don’t = Do not. U zapovijesti: Don’t go = ne idi.',
      ]),
      straight: g('straight', ['ישר', 'prosto', 'pravo']),
      then: g('then', ['אז', 'to / w takim razie', 'onda']),
      turn: g('turn', ['לפנות / להסתובב', 'skręcić / obrócić się', 'skrenuti / okrenuti se'], undefined, [
        'turn around = להסתובב לאחור.',
        'turn around = odwrócić się.',
        'turn around = okrenuti se.',
      ]),
      around: g('around', ['מסביב / לאחור', 'dookoła', 'okolo']),
      behind: g('behind', ['מאחורי', 'za', 'iza']),
      welcome: g('welcome', ['ברוכים הבאים', 'witamy', 'dobro došli']),
      new: g('new', ['חדש', 'nowy', 'novi'], undefined, ['New York = ניו יורק ("יורק החדשה").', 'New York = Nowy Jork.', 'New York = Njujork („novi Jork”).']),
      york: g('York', ['יורק', 'Jork', 'Jork']),
    },
    questions: [
      q('What is Anna looking for?', ['מה אנה מחפשת?', 'Czego szuka Anna?', 'Šta Ana traži?'], [
        o('The train station.', ['את תחנת הרכבת.', 'Dworca.', 'Željezničku stanicu.'], true),
        o('A hotel.', ['מלון.', 'Hotelu.', 'Hotel.']),
        o('A taxi.', ['מונית.', 'Taksówki.', 'Taksi.']),
      ]),
      q('Where is the station?', ['איפה התחנה?', 'Gdzie jest dworzec?', 'Gdje je stanica?'], [
        o('Right behind her.', ['ממש מאחוריה.', 'Tuż za nią.', 'Tik iza nje.'], true),
        o('Very far.', ['רחוק מאוד.', 'Bardzo daleko.', 'Jako daleko.']),
        o('On the left.', ['בצד שמאל.', 'Po lewej.', 'Lijevo.']),
      ]),
    ],
  },
  {
    id: 'a-little-spicy',
    title: tri('Just a little spicy', ['רק קצת חריף', 'Tylko trochę ostre', 'Samo malo ljuto']),
    titlePl: 'Just a little spicy',
    blurb: tri('Just a little spicy', [
      'ליסה אוהבת אוכל חריף. בטקסס זה סיפור אחר.',
      'Lisa uwielbia ostre jedzenie. W Teksasie to coś zupełnie innego.',
      'Lisa voli ljutu hranu. U Teksasu je to sasvim druga priča.',
    ]),
    lines: [
      L('Waiter', 'Are you ready to order?', ['את מוכנה להזמין?', 'Możesz już zamówić?', 'Jeste li spremni da naručite?']),
      L('Lisa', 'Yes. The chicken, please. Is it spicy?', ['כן. את העוף, בבקשה. הוא חריף?', 'Tak. Kurczaka, proszę. Jest ostry?', 'Da. Piletinu, molim. Je li ljuta?']),
      L('Waiter', 'Just a little.', ['רק קצת.', 'Tylko trochę.', 'Samo malo.']),
      L('Lisa', 'Great. I love spicy food.', ['מעולה. אני אוהבת אוכל חריף.', 'Świetnie. Uwielbiam ostre jedzenie.', 'Super. Volim ljutu hranu.']),
      L('Lisa', 'Water! Water, please!', ['מים! מים, בבקשה!', 'Wody! Wody, proszę!', 'Vode! Vode, molim!']),
      L('Waiter', 'Is everything okay?', ['הכול בסדר?', 'Wszystko w porządku?', 'Je li sve u redu?']),
      L('Lisa', 'A little?! My mouth is on fire!', ['קצת?! הפה שלי בוער!', 'Trochę?! Pali mi się w ustach!', 'Malo?! Usta mi gore!']),
      L('Waiter', 'Sorry. In Texas, this is a little.', ['סליחה. בטקסס, זה קצת.', 'Przepraszam. W Teksasie to jest trochę.', 'Izvinite. U Teksasu je ovo malo.']),
    ],
    glossary: {
      ready: g('ready', ['מוכן', 'gotowy', 'spreman']),
      order: g('order', ['להזמין', 'zamówić', 'naručiti'], undefined, [
        'Are you ready to order? = מוכנים להזמין? – כך שואל המלצר.',
        'Are you ready to order? = Czy możesz już zamówić? – tak pyta kelner.',
        'Are you ready to order? = Jeste li spremni da naručite? – tako pita konobar.',
      ]),
      chicken: g('chicken', ['עוף', 'kurczak', 'piletina']),
      spicy: g('spicy', ['חריף', 'ostry', 'ljut']),
      love: g('love', ['לאהוב (מאוד)', 'uwielbiać / kochać', 'voljeti']),
      food: g('food', ['אוכל', 'jedzenie', 'hrana']),
      water: g('water', ['מים', 'woda', 'voda']),
      everything: g('everything', ['הכול', 'wszystko', 'sve'], undefined, [
        'Is everything okay? = הכול בסדר? – מלצרים בארה״ב שואלים את זה כל הזמן.',
        'Is everything okay? = Wszystko w porządku? – kelnerzy w USA pytają o to bez przerwy.',
        'Is everything okay? = Je li sve u redu? – konobari u SAD to stalno pitaju.',
      ]),
      okay: g('okay', ['בסדר', 'w porządku', 'u redu']),
      mouth: g('mouth', ['פה', 'usta', 'usta']),
      on: g('on', ['על', 'na', 'na'], undefined, ['on fire = בוער (מילולית: "על אש").', 'on fire = płonie (dosłownie: „w ogniu”).', 'on fire = gori (doslovno: „u vatri”).']),
      fire: g('fire', ['אש', 'ogień', 'vatra']),
      texas: g('Texas', ['טקסס', 'Teksas', 'Teksas'], undefined, [
        'טקסס מפורסמת באוכל חריף מאוד.',
        'Teksas słynie z bardzo ostrego jedzenia.',
        'Teksas je poznat po veoma ljutoj hrani.',
      ]),
    },
    questions: [
      q('What does Lisa order?', ['מה ליסה מזמינה?', 'Co zamawia Lisa?', 'Šta Lisa naručuje?'], [
        o('The chicken.', ['את העוף.', 'Kurczaka.', 'Piletinu.'], true),
        o('The fish.', ['את הדג.', 'Rybę.', 'Ribu.']),
        o('A salad.', ['סלט.', 'Sałatkę.', 'Salatu.']),
      ]),
      q('Is the chicken spicy?', ['העוף חריף?', 'Czy kurczak jest ostry?', 'Je li piletina ljuta?'], [
        o('Yes, very spicy.', ['כן, חריף מאוד.', 'Tak, bardzo ostry.', 'Da, vrlo ljuta.'], true),
        o('No, not at all.', ['לא, בכלל לא.', 'Nie, wcale.', 'Ne, nimalo.']),
        o("It's sweet.", ['הוא מתוק.', 'Jest słodki.', 'Slatka je.']),
      ]),
    ],
  },
  {
    id: 'how-are-you',
    title: tri('How are you?', ['"מה שלומך?"', '„Jak się masz?”', '„Kako ste?”']),
    titlePl: 'How are you?',
    blurb: tri('How are you?', [
      'באמריקה "How are you?" זה בסך הכול "שלום". דן לא יודע את זה.',
      'W Ameryce „How are you?” to po prostu „cześć”. Dan o tym nie wie.',
      'U Americi je „How are you?” samo „zdravo”. Dan to ne zna.',
    ]),
    lines: [
      L('Cashier', 'Hi! How are you today?', ['היי! מה שלומך היום?', 'Cześć! Jak się dziś masz?', 'Zdravo! Kako ste danas?']),
      L('Dan', 'Not great. My back hurts, and my cat is sick.', ['לא משהו. הגב שלי כואב, והחתול שלי חולה.', 'Nie najlepiej. Bolą mnie plecy, a mój kot jest chory.', 'Ne baš dobro. Bole me leđa, a mačka mi je bolesna.']),
      L('Cashier', "Oh… I'm sorry to hear that.", ['אוי… צר לי לשמוע.', 'Och… Przykro mi to słyszeć.', 'Oh… Žao mi je što to čujem.']),
      L('Dan', 'And yesterday I lost my phone.', ['ואתמול איבדתי את הטלפון שלי.', 'A wczoraj zgubiłem telefon.', 'A juče sam izgubio telefon.']),
      L('Cashier', "Oh no. That's twelve dollars.", ['אוי לא. זה שנים עשר דולר.', 'O nie. To będzie dwanaście dolarów.', 'Uh, ne. To je dvanaest dolara.']),
      L('Dan', 'Thanks for asking. You are very kind.', ['תודה ששאלת. את נחמדה מאוד.', 'Dzięki, że pytasz. Jesteś bardzo miła.', 'Hvala što pitate. Baš ste ljubazni.']),
      L('Dan', 'Do you want to hear about my weekend?', ['רוצה לשמוע על סוף השבוע שלי?', 'Chcesz posłuchać o moim weekendzie?', 'Hoćete li da čujete kako mi je prošao vikend?']),
      L('Cashier', 'Next, please!', ['הבא בתור, בבקשה!', 'Następny, proszę!', 'Sljedeći, molim!']),
    ],
    glossary: {
      today: g('today', ['היום', 'dzisiaj', 'danas']),
      back: g('back', ['גב', 'plecy', 'leđa']),
      hurts: g('hurts', ['כואב', 'boli', 'boli'], 'hurt', [
        'hurt → hurts: בהווה, אחרי he / she / it (וגם my back) מוסיפים s.',
        'hurt → hurts: w czasie teraźniejszym po he / she / it (i my back) dodajemy -s.',
        'hurt → hurts: u sadašnjem vremenu poslije he / she / it (i my back) dodaje se -s.',
      ]),
      cat: g('cat', ['חתול', 'kot', 'mačka']),
      sick: g('sick', ['חולה', 'chory', 'bolestan']),
      hear: g('hear', ['לשמוע', 'słyszeć / posłuchać', 'čuti'], undefined, [
        'I’m sorry to hear that = צר לי לשמוע – התגובה המנומסת לחדשות רעות.',
        'I’m sorry to hear that = przykro mi to słyszeć – uprzejma reakcja na złe wieści.',
        'I’m sorry to hear that = žao mi je što to čujem – uljudan odgovor na loše vijesti.',
      ]),
      that: g('that', ['את זה / זה', 'to', 'to']),
      yesterday: g('yesterday', ['אתמול', 'wczoraj', 'juče']),
      lost: g('lost', ['איבדתי', 'zgubiłem', 'izgubio sam'], 'lose', [
        'lose → lost: זמן עבר לא סדיר (בלי ed).',
        'lose → lost: nieregularny czas przeszły (bez -ed).',
        'lose → lost: nepravilno prošlo vrijeme (bez -ed).',
      ]),
      phone: g('phone', ['טלפון', 'telefon', 'telefon']),
      twelve: g('twelve', ['שתים עשרה', 'dwanaście', 'dvanaest']),
      dollars: g('dollars', ['דולרים', 'dolary', 'dolari'], 'dollar', [
        'dollar → dollars: ברבים מוסיפים s.',
        'dollar → dollars: w liczbie mnogiej dodajemy -s.',
        'dollar → dollars: u množini se dodaje -s.',
      ]),
      thanks: g('thanks', ['תודה', 'dzięki', 'hvala'], undefined, [
        'Thanks = תודה, קליל יותר מ-Thank you.',
        'Thanks = dzięki, swobodniej niż Thank you.',
        'Thanks = hvala, opuštenije od Thank you.',
      ]),
      asking: g('asking', ['לשאול', 'pytanie', 'pitanje'], 'ask', [
        'ask → asking: אחרי for הפועל מקבל ing. Thanks for asking = תודה ששאלת.',
        'ask → asking: po for czasownik dostaje -ing. Thanks for asking = dzięki, że pytasz.',
        'ask → asking: poslije for glagol dobija -ing. Thanks for asking = hvala što pitate.',
      ]),
      kind: g('kind', ['נחמד / אדיב', 'miły', 'ljubazan']),
      want: g('want', ['לרצות', 'chcieć', 'htjeti']),
      about: g('about', ['על (בנושא)', 'o', 'o']),
      weekend: g('weekend', ['סוף שבוע', 'weekend', 'vikend']),
      next: g('next', ['הבא', 'następny', 'sljedeći'], undefined, ['Next, please! = הבא בתור, בבקשה!', 'Next, please! = Następny, proszę!', 'Next, please! = Sljedeći, molim!']),
    },
    questions: [
      q("What is wrong with Dan's cat?", ['מה קרה לחתול של דן?', 'Co jest z kotem Dana?', 'Šta je sa Danovom mačkom?'], [
        o("It's sick.", ['הוא חולה.', 'Jest chory.', 'Bolesna je.'], true),
        o("It's hungry.", ['הוא רעב.', 'Jest głodny.', 'Gladna je.']),
        o("It's lost.", ['הוא הלך לאיבוד.', 'Zgubił się.', 'Izgubila se.']),
      ]),
      q('How much does Dan pay?', ['כמה דן משלם?', 'Ile płaci Dan?', 'Koliko Dan plaća?'], [
        o('Twelve dollars.', ['שנים עשר דולר.', 'Dwanaście dolarów.', 'Dvanaest dolara.'], true),
        o('Twenty dollars.', ['עשרים דולר.', 'Dwadzieścia dolarów.', 'Dvadeset dolara.']),
        o('Two dollars.', ['שני דולר.', 'Dwa dolary.', 'Dva dolara.']),
      ]),
    ],
  },
];

/** Voice of each character: Guy reads the men, Jenny the women. */
export const EN_VOICES: Record<string, 'f' | 'm'> = {
  Barista: 'f',
  Tom: 'm',
  Anna: 'f',
  Joe: 'm',
  Waiter: 'm',
  Lisa: 'f',
  Cashier: 'f',
  Dan: 'm',
};
