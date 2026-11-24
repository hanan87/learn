import type { GlossEntry, Story, StoryLine } from '../stories';

/**
 * Mini stories of the Hebrew course (same format as data/stories). The Hebrew is vocalized and
 * spelled like the rest of the course (full vowel letters); every word is in data/he/lexicon.
 * Meanings and notes are in English, Polish and Montenegrin; the Hebrew-interface fields repeat the
 * English text (the course has no Hebrew interface). Glossary keys are the words without vowel signs
 * (data/stories wordKey). Hebrew joins little words to the next one (וְ and, הַ the, בְּ in, לְ to),
 * so many notes explain a prefix rather than an ending.
 */

type Tri = [en: string, pl: string, cnr: string];

const tri = ([en, pl, cnr]: Tri) => ({ he: en, en, pl, cnr });
const g = (t: Tri, base?: string, note?: Tri): GlossEntry => ({ t: tri(t), base, note: note ? tri(note) : undefined });
const L = (speaker: string, text: string, t: Tri): StoryLine => ({ speaker, polish: text, t: tri(t) });
const o = (text: string, t: Tri, correct = false) => ({ polish: text, t: tri(t), correct });
const q = (text: string, t: Tri, options: ReturnType<typeof o>[]) => ({ q: text, t: tri(t), options });

/** Words shared by several stories. */
export const HE_COMMON: Record<string, GlossEntry> = {
  שלום: g(['hello (peace)', 'cześć (pokój)', 'zdravo (mir)'], undefined, [
    'Shalom means "peace" – it is both hello and goodbye.',
    'Szalom znaczy „pokój” – to i „cześć”, i „do widzenia”.',
    'Šalom znači „mir” – to je i „zdravo” i „doviđenja”.',
  ]),
  בבקשה: g(['please / here you are', 'proszę', 'molim / izvolite']),
  תודה: g(['thank you', 'dziękuję', 'hvala']),
  כן: g(['yes', 'tak', 'da']),
  לא: g(['no, not', 'nie', 'ne']),
  אני: g(['I', 'ja', 'ja']),
  אתה: g(['you (to a man)', 'ty (do mężczyzny)', 'ti (muškarcu)'], undefined, [
    'Hebrew has two words for "you": אַתָּה to a man, אַתְּ to a woman.',
    'Hebrajski ma dwa słowa na „ty”: אַתָּה do mężczyzny, אַתְּ do kobiety.',
    'Hebrejski ima dvije riječi za „ti”: אַתָּה muškarcu, אַתְּ ženi.',
  ]),
  מה: g(['what', 'co', 'šta']),
  טוב: g(['good, well', 'dobry, dobrze', 'dobar, dobro']),
  עוד: g(['more, another', 'jeszcze', 'još']),
  זה: g(['this, it', 'to', 'to']),
  יש: g(['there is', 'jest', 'ima'], undefined, [
    'יֵשׁ = there is. With לְ it means "have": יֵשׁ לְךָ = you have ("there is to you").',
    'יֵשׁ = jest, istnieje. Z לְ znaczy „mieć”: יֵשׁ לְךָ = masz („jest tobie”).',
    'יֵשׁ = ima, postoji. Sa לְ znači „imati”: יֵשׁ לְךָ = imaš („ima tebi”).',
  ]),
  אז: g(['so, then', 'to, więc', 'onda, pa']),
  היום: g(['today', 'dzisiaj', 'danas'], 'יוֹם', [
    'יוֹם = day. הַ ("the") is written together with the word: הַיּוֹם, "the day" = today.',
    'יוֹם = dzień. הַ (rodzajnik) pisze się razem ze słowem: הַיּוֹם, „ten dzień” = dzisiaj.',
    'יוֹם = dan. הַ (član) piše se zajedno sa riječi: הַיּוֹם, „taj dan” = danas.',
  ]),
  לים: g(['to the sea, to the beach', 'nad morze', 'na more'], 'יָם', [
    'לְ ("to") + הַ ("the") merge into לַ: לַיָּם = to the sea.',
    'לְ („do”) + הַ (rodzajnik) łączą się w לַ: לַיָּם = nad morze.',
    'לְ („u, do”) + הַ (član) spajaju se u לַ: לַיָּם = na more.',
  ]),
};

export const HE_STORIES: Story[] = [
  {
    id: 'more-hummus',
    title: tri(['More hummus?', 'Jeszcze hummusu?', 'Još humusa?']),
    titlePl: 'עוֹד חוּמוּס?',
    blurb: tri([
      'At an Israeli hummus place, "no, thanks" is only the beginning.',
      'W izraelskiej hummusiarni „nie, dziękuję” to dopiero początek.',
      'U izraelskom restoranu za humus „ne, hvala” je tek početak.',
    ]),
    lines: [
      L('Avi', 'שָׁלוֹם! מָה תִּרְצִי?', ['Hi! What would you like?', 'Cześć! Co podać?', 'Zdravo! Šta ćete?']),
      L('Noa', 'חוּמוּס, בְּבַקָּשָׁה.', ['Hummus, please.', 'Hummus, proszę.', 'Humus, molim.']),
      L('Avi', 'עִם פִּיתָה?', ['With pita?', 'Z pitą?', 'Sa pitom?']),
      L('Noa', 'כֵּן, וְסָלָט.', ['Yes, and a salad.', 'Tak, i sałatkę.', 'Da, i salatu.']),
      L('Avi', 'עוֹד פִּיתָה?', ['Another pita?', 'Jeszcze jedną pitę?', 'Još jednu pitu?']),
      L('Noa', 'לֹא, תּוֹדָה. אֲנִי שְׂבֵעָה.', ['No, thanks. I am full.', 'Nie, dziękuję. Jestem najedzona.', 'Ne, hvala. Sita sam.']),
      L('Avi', 'אָז עוֹד קְצָת חוּמוּס?', ['So a little more hummus?', 'To może jeszcze trochę hummusu?', 'Onda još malo humusa?']),
      L('Noa', 'מָה, אַתָּה סַבְתָּא שֶׁלִּי?!', ['What, are you my grandma?!', 'Co, jesteś moją babcią?!', 'Šta, jesi li ti moja baka?!']),
    ],
    glossary: {
      תרצי: g(['you would like (to a woman)', 'chcesz (do kobiety)', 'želite (ženi)'], 'תִּרְצֶה', [
        'תִּרְצֶה is said to a man, תִּרְצִי to a woman: the ending -i (י) marks "you, a woman".',
        'תִּרְצֶה mówi się do mężczyzny, תִּרְצִי do kobiety: końcówka -i (י) oznacza „ty, kobieta”.',
        'תִּרְצֶה se kaže muškarcu, תִּרְצִי ženi: nastavak -i (י) označava „ti, žena”.',
      ]),
      חומוס: g(['hummus', 'hummus', 'humus']),
      עם: g(['with', 'z', 'sa']),
      פיתה: g(['pita (flat bread)', 'pita (płaski chlebek)', 'pita (lepinja)']),
      וסלט: g(['and a salad', 'i sałatka', 'i salata'], 'סָלָט', [
        'וְ ("and") is written together with the next word: וְ + סָלָט = וְסָלָט.',
        'וְ („i”) pisze się razem z następnym słowem: וְ + סָלָט = וְסָלָט.',
        'וְ („i”) piše se zajedno sa sljedećom riječi: וְ + סָלָט = וְסָלָט.',
      ]),
      שבעה: g(['full (after eating)', 'najedzona', 'sita'], 'שָׂבֵעַ', [
        'A man says שָׂבֵעַ, a woman שְׂבֵעָה – the ending -a (ה) marks the feminine.',
        'Mężczyzna mówi שָׂבֵעַ, kobieta שְׂבֵעָה – końcówka -a (ה) oznacza rodzaj żeński.',
        'Muškarac kaže שָׂבֵעַ, žena שְׂבֵעָה – nastavak -a (ה) označava ženski rod.',
      ]),
      קצת: g(['a little', 'trochę', 'malo']),
      סבתא: g(['grandma', 'babcia', 'baka']),
      שלי: g(['my, mine', 'mój, moja', 'moj, moja'], undefined, [
        'שֶׁלִּי comes after the noun: סַבְתָּא שֶׁלִּי = my grandma.',
        'שֶׁלִּי stoi po rzeczowniku: סַבְתָּא שֶׁלִּי = moja babcia.',
        'שֶׁלִּי dolazi poslije imenice: סַבְתָּא שֶׁלִּי = moja baka.',
      ]),
    },
    questions: [
      q('מָה נוֹעָה אוֹכֶלֶת?', ['What is Noa eating?', 'Co je Noa?', 'Šta Noa jede?'], [
        o('חוּמוּס וְסָלָט.', ['Hummus and a salad.', 'Hummus i sałatkę.', 'Humus i salatu.'], true),
        o('פָלָאפֶל.', ['Falafel.', 'Falafel.', 'Falafel.']),
        o('לֶחֶם וְדָג.', ['Bread and fish.', 'Chleb i rybę.', 'Hljeb i ribu.']),
      ]),
      q('נוֹעָה רוֹצָה עוֹד פִּיתָה?', ['Does Noa want another pita?', 'Czy Noa chce jeszcze pitę?', 'Da li Noa hoće još jednu pitu?'], [
        o('לֹא, הִיא שְׂבֵעָה.', ['No, she is full.', 'Nie, jest najedzona.', 'Ne, sita je.'], true),
        o('כֵּן, שְׁתַּיִם.', ['Yes, two.', 'Tak, dwie.', 'Da, dvije.']),
        o('כֵּן, הִיא רְעֵבָה.', ['Yes, she is hungry.', 'Tak, jest głodna.', 'Da, gladna je.']),
      ]),
    ],
  },
  {
    id: 'shabbat-bus',
    title: tri(['No bus today', 'Dziś bez autobusu', 'Danas nema autobusa']),
    titlePl: 'הַיּוֹם שַׁבָּת',
    blurb: tri([
      'Tom wants to go to Jerusalem on a Saturday. In Israel, that is a problem.',
      'Tom chce jechać do Jerozolimy w sobotę. W Izraelu to problem.',
      'Tom hoće da ide u Jerusalim u subotu. U Izraelu je to problem.',
    ]),
    lines: [
      L('Tom', 'סְלִיחָה, מָתַי הָאוֹטוֹבּוּס לִירוּשָׁלַיִם?', ['Excuse me, when is the bus to Jerusalem?', 'Przepraszam, kiedy jest autobus do Jerozolimy?', 'Izvinite, kad ide autobus za Jerusalim?']),
      L('Shira', 'הַיּוֹם? הַיּוֹם שַׁבָּת!', ['Today? Today is Shabbat!', 'Dzisiaj? Dzisiaj jest szabat!', 'Danas? Danas je šabat!']),
      L('Tom', 'אָז מָתַי יֵשׁ אוֹטוֹבּוּס?', ['So when is there a bus?', 'To kiedy jest autobus?', 'Pa kad ima autobus?']),
      L('Shira', 'מָחָר בַּבּוֹקֶר.', ['Tomorrow morning.', 'Jutro rano.', 'Sjutra ujutru.']),
      L('Tom', 'מָחָר?! וּמָה אֲנִי עוֹשֶׂה הַיּוֹם?', ['Tomorrow?! And what do I do today?', 'Jutro?! A co mam robić dzisiaj?', 'Sjutra?! A šta ću ja danas?']),
      L('Shira', 'הַיּוֹם הוֹלְכִים לַיָּם!', ['Today we go to the beach!', 'Dzisiaj idziemy nad morze!', 'Danas idemo na more!']),
      L('Tom', 'יֵשׁ אוֹטוֹבּוּס לַיָּם?', ['Is there a bus to the beach?', 'Jest autobus nad morze?', 'Ima li autobus do mora?']),
      L('Shira', 'לֹא. הוֹלְכִים בָּרֶגֶל!', ['No. We walk!', 'Nie. Idziemy pieszo!', 'Ne. Idemo pješke!']),
    ],
    glossary: {
      סליחה: g(['excuse me, sorry', 'przepraszam', 'izvinite']),
      מתי: g(['when', 'kiedy', 'kad']),
      האוטובוס: g(['the bus', 'autobus (ten)', 'autobus (taj)'], 'אוֹטוֹבּוּס', [
        'הָ / הַ = "the", written together with the word: הָאוֹטוֹבּוּס = the bus.',
        'הָ / הַ = rodzajnik określony, pisany razem ze słowem: הָאוֹטוֹבּוּס = (ten) autobus.',
        'הָ / הַ = određeni član, piše se zajedno sa riječi: הָאוֹטוֹבּוּס = (taj) autobus.',
      ]),
      לירושלים: g(['to Jerusalem', 'do Jerozolimy', 'u Jerusalim'], 'יְרוּשָׁלַיִם', [
        'לְ = "to": לְ + יְרוּשָׁלַיִם = לִירוּשָׁלַיִם (the two short vowels merge into li).',
        'לְ = „do”: לְ + יְרוּשָׁלַיִם = לִירוּשָׁלַיִם (dwie krótkie samogłoski łączą się w li).',
        'לְ = „u, do”: לְ + יְרוּשָׁלַיִם = לִירוּשָׁלַיִם (dva kratka samoglasnika spajaju se u li).',
      ]),
      שבת: g(['Shabbat (Saturday)', 'szabat (sobota)', 'šabat (subota)'], undefined, [
        'From Friday evening to Saturday evening most buses and trains in Israel do not run.',
        'Od piątkowego do sobotniego wieczoru większość autobusów i pociągów w Izraelu nie jeździ.',
        'Od petka uveče do subote uveče većina autobusa i vozova u Izraelu ne saobraća.',
      ]),
      אוטובוס: g(['bus', 'autobus', 'autobus']),
      מחר: g(['tomorrow', 'jutro', 'sjutra']),
      בבוקר: g(['in the morning', 'rano', 'ujutru'], 'בּוֹקֶר', [
        'בְּ ("in") + הַ ("the") merge into בַּ: בַּבּוֹקֶר = in the morning.',
        'בְּ („w”) + הַ (rodzajnik) łączą się w בַּ: בַּבּוֹקֶר = rano („o poranku”).',
        'בְּ („u”) + הַ (član) spajaju se u בַּ: בַּבּוֹקֶר = ujutru.',
      ]),
      ומה: g(['and what', 'a co', 'a šta'], 'מָה', [
        'וְ ("and") becomes וּ before ב, מ and פ: וּמָה = and what.',
        'וְ („i, a”) zmienia się w וּ przed ב, מ i פ: וּמָה = a co.',
        'וְ („i, a”) prelazi u וּ ispred ב, מ i פ: וּמָה = a šta.',
      ]),
      עושה: g(['do, am doing', 'robię', 'radim'], undefined, [
        'עוֹשֶׂה = I do / he does, said by or of a man; a woman says עוֹשָׂה.',
        'עוֹשֶׂה = robię / robi – o mężczyźnie; kobieta mówi עוֹשָׂה.',
        'עוֹשֶׂה = radim / radi – za muškarca; žena kaže עוֹשָׂה.',
      ]),
      הולכים: g(['we go, people go', 'idziemy', 'idemo'], 'הוֹלֵךְ', [
        'הוֹלֵךְ (goes) → הוֹלְכִים: the plural ending -im (ים). Without a pronoun it means "we go / people go".',
        'הוֹלֵךְ (idzie) → הוֹלְכִים: końcówka liczby mnogiej -im (ים). Bez zaimka znaczy „idziemy / idzie się”.',
        'הוֹלֵךְ (ide) → הוֹלְכִים: nastavak za množinu -im (ים). Bez zamjenice znači „idemo / ide se”.',
      ]),
      ברגל: g(['on foot', 'pieszo', 'pješke'], 'רֶגֶל', [
        'רֶגֶל = leg, foot; בָּרֶגֶל = "on the foot" = walking.',
        'רֶגֶל = noga; בָּרֶגֶל = „na nogach” = pieszo.',
        'רֶגֶל = noga; בָּרֶגֶל = „na nogama” = pješke.',
      ]),
    },
    questions: [
      q('מָתַי הָאוֹטוֹבּוּס לִירוּשָׁלַיִם?', ['When is the bus to Jerusalem?', 'Kiedy jest autobus do Jerozolimy?', 'Kad ide autobus za Jerusalim?'], [
        o('מָחָר בַּבּוֹקֶר.', ['Tomorrow morning.', 'Jutro rano.', 'Sjutra ujutru.'], true),
        o('הַיּוֹם בָּעֶרֶב.', ['This evening.', 'Dziś wieczorem.', 'Večeras.']),
        o('עַכְשָׁיו.', ['Now.', 'Teraz.', 'Sad.']),
      ]),
      q('לְאָן הֵם הוֹלְכִים הַיּוֹם?', ['Where are they going today?', 'Dokąd idą dzisiaj?', 'Kuda idu danas?'], [
        o('לַיָּם.', ['To the beach.', 'Nad morze.', 'Na more.'], true),
        o('לִירוּשָׁלַיִם.', ['To Jerusalem.', 'Do Jerozolimy.', 'U Jerusalim.']),
        o('לַשּׁוּק.', ['To the market.', 'Na targ.', 'Na pijacu.']),
      ]),
    ],
  },
  {
    id: 'mom-calling',
    title: tri(['Mom is calling', 'Mama dzwoni', 'Mama zove']),
    titlePl: 'אִמָּא בַּטֶּלֶפוֹן',
    blurb: tri([
      'Dani is thirty. For his mother, that changes nothing.',
      'Dani ma trzydzieści lat. Dla jego mamy to nic nie zmienia.',
      'Dani ima trideset godina. Za njegovu mamu to ništa ne mijenja.',
    ]),
    lines: [
      L('Rina', 'הַלּוֹ? דָּנִי?', ['Hello? Dani?', 'Halo? Dani?', 'Halo? Dani?']),
      L('Dani', 'כֵּן, אִמָּא.', ['Yes, Mom.', 'Tak, mamo.', 'Da, mama.']),
      L('Rina', 'אַתָּה אוֹכֵל טוֹב?', ['Are you eating well?', 'Dobrze jesz?', 'Jedeš li dobro?']),
      L('Dani', 'כֵּן, אִמָּא.', ['Yes, Mom.', 'Tak, mamo.', 'Da, mama.']),
      L('Rina', 'וְאַתָּה יָשֵׁן טוֹב?', ['And are you sleeping well?', 'A dobrze śpisz?', 'A spavaš li dobro?']),
      L('Dani', 'כֵּן, אִמָּא. אֲנִי בֶּן שְׁלוֹשִׁים!', ['Yes, Mom. I am thirty!', 'Tak, mamo. Mam trzydzieści lat!', 'Da, mama. Imam trideset godina!']),
      L('Rina', 'טוֹב, טוֹב. קַר הַיּוֹם. יֵשׁ לְךָ סְוֶודֶר?', ['OK, OK. It is cold today. Do you have a sweater?', 'Dobrze, dobrze. Dzisiaj jest zimno. Masz sweter?', 'Dobro, dobro. Danas je hladno. Imaš li džemper?']),
      L('Dani', 'אִמָּא, אֲנִי בְּאֵילַת!', ['Mom, I am in Eilat!', 'Mamo, jestem w Ejlacie!', 'Mama, ja sam u Ejlatu!']),
    ],
    glossary: {
      הלו: g(['hello (on the phone)', 'halo', 'halo']),
      דני: g(['Dani (a name)', 'Dani (imię)', 'Dani (ime)']),
      אמא: g(['Mom', 'mama', 'mama']),
      אוכל: g(['eat, are eating (a man)', 'jesz (mężczyzna)', 'jedeš (muškarac)'], undefined, [
        'אוֹכֵל is said of a man; a woman: אוֹכֶלֶת. The Hebrew present tense changes with gender and number, not with the person.',
        'אוֹכֵל mówi się o mężczyźnie; o kobiecie: אוֹכֶלֶת. Hebrajski czas teraźniejszy zmienia się według rodzaju i liczby, nie osoby.',
        'אוֹכֵל se kaže za muškarca; za ženu: אוֹכֶלֶת. Hebrejsko sadašnje vrijeme mijenja se po rodu i broju, a ne po licu.',
      ]),
      ואתה: g(['and you', 'a ty', 'a ti'], 'אַתָּה', [
        'וְ ("and") is written together with the next word: וְ + אַתָּה = וְאַתָּה.',
        'וְ („i, a”) pisze się razem z następnym słowem: וְ + אַתָּה = וְאַתָּה.',
        'וְ („i, a”) piše se zajedno sa sljedećom riječi: וְ + אַתָּה = וְאַתָּה.',
      ]),
      ישן: g(['sleep, are sleeping (a man)', 'śpisz (mężczyzna)', 'spavaš (muškarac)'], undefined, [
        'Of a woman: יְשֵׁנָה.',
        'O kobiecie: יְשֵׁנָה.',
        'Za ženu: יְשֵׁנָה.',
      ]),
      בן: g(['son; aged', 'syn; w wieku', 'sin; star'], undefined, [
        'בֶּן = son. Age is said with it: אֲנִי בֶּן שְׁלוֹשִׁים = "I am a son of thirty" = I am thirty. A woman says בַּת (daughter).',
        'בֶּן = syn. Tak podaje się wiek: אֲנִי בֶּן שְׁלוֹשִׁים = „jestem synem trzydziestu” = mam trzydzieści lat. Kobieta mówi בַּת (córka).',
        'בֶּן = sin. Tako se kaže starost: אֲנִי בֶּן שְׁלוֹשִׁים = doslovno „sin trideset (godina)” = imam trideset godina. Žena kaže בַּת (kćerka).',
      ]),
      שלושים: g(['thirty', 'trzydzieści', 'trideset']),
      קר: g(['cold', 'zimno', 'hladno']),
      לך: g(['to you (a man)', 'tobie (do mężczyzny)', 'tebi (muškarcu)'], undefined, [
        'יֵשׁ לְךָ = you have ("there is to you"). To a woman: יֵשׁ לָךְ.',
        'יֵשׁ לְךָ = masz („jest tobie”). Do kobiety: יֵשׁ לָךְ.',
        'יֵשׁ לְךָ = imaš („ima tebi”). Ženi: יֵשׁ לָךְ.',
      ]),
      סוודר: g(['sweater', 'sweter', 'džemper']),
      באילת: g(['in Eilat', 'w Ejlacie', 'u Ejlatu'], 'אֵילַת', [
        'בְּ = "in". Eilat is on the Red Sea – the hottest city in Israel.',
        'בְּ = „w”. Ejlat leży nad Morzem Czerwonym – to najgorętsze miasto Izraela.',
        'בְּ = „u”. Ejlat je na Crvenom moru – najtopliji grad u Izraelu.',
      ]),
    },
    questions: [
      q('אֵיפֹה דָּנִי?', ['Where is Dani?', 'Gdzie jest Dani?', 'Gdje je Dani?'], [
        o('בְּאֵילַת.', ['In Eilat.', 'W Ejlacie.', 'U Ejlatu.'], true),
        o('בְּתֵל אָבִיב.', ['In Tel Aviv.', 'W Tel Awiwie.', 'U Tel Avivu.']),
        o('בַּבַּיִת.', ['At home.', 'W domu.', 'Kod kuće.']),
      ]),
      q('בֶּן כַּמָּה דָּנִי?', ['How old is Dani?', 'Ile lat ma Dani?', 'Koliko godina ima Dani?'], [
        o('שְׁלוֹשִׁים.', ['Thirty.', 'Trzydzieści.', 'Trideset.'], true),
        o('עֶשְׂרִים.', ['Twenty.', 'Dwadzieścia.', 'Dvadeset.']),
        o('אַרְבָּעִים.', ['Forty.', 'Czterdzieści.', 'Četrdeset.']),
      ]),
    ],
  },
  {
    id: 'tel-aviv-taxi',
    title: tri(['One minute, fifty shekels', 'Minuta za pięćdziesiąt szekli', 'Minut za pedeset šekela']),
    titlePl: 'מוֹנִית בְּתֵל אָבִיב',
    blurb: tri([
      'Lea takes a taxi in Tel Aviv. The driver is fast – and so is the meter.',
      'Lea jedzie taksówką w Tel Awiwie. Kierowca jest szybki – licznik też.',
      'Lea ide taksijem u Tel Avivu. Vozač je brz – a taksimetar još brži.',
    ]),
    lines: [
      L('Moshe', 'עֶרֶב טוֹב! לְאָן?', ['Good evening! Where to?', 'Dobry wieczór! Dokąd?', 'Dobro veče! Kuda?']),
      L('Lea', 'לַיָּם, בְּבַקָּשָׁה.', ['To the beach, please.', 'Nad morze, proszę.', 'Na more, molim.']),
      L('Moshe', 'יַאלְלָה!', ['Yalla – let’s go!', 'Jalla – jedziemy!', 'Jala – idemo!']),
      L('Lea', 'לְאַט, בְּבַקָּשָׁה! לְאַט!', ['Slowly, please! Slowly!', 'Wolniej, proszę! Wolniej!', 'Polako, molim! Polako!']),
      L('Moshe', 'אֵין בְּעָיָה. הִנֵּה, הִגַּעְנוּ!', ['No problem. Here we are!', 'Nie ma problemu. No i jesteśmy!', 'Nema problema. Evo, stigli smo!']),
      L('Lea', 'כְּבָר? זֶה הָיָה דַּקָּה!', ['Already? That was one minute!', 'Już? To była minuta!', 'Već? To je bio jedan minut!']),
      L('Moshe', 'נָכוֹן. חֲמִשִּׁים שֶׁקֶל, בְּבַקָּשָׁה.', ['Right. Fifty shekels, please.', 'Zgadza się. Pięćdziesiąt szekli, proszę.', 'Tačno. Pedeset šekela, molim.']),
      L('Lea', 'חֲמִשִּׁים?! עַל דַּקָּה?!', ['Fifty?! For one minute?!', 'Pięćdziesiąt?! Za minutę?!', 'Pedeset?! Za jedan minut?!']),
    ],
    glossary: {
      ערב: g(['evening', 'wieczór', 'veče'], undefined, ['עֶרֶב טוֹב = good evening.', 'עֶרֶב טוֹב = dobry wieczór.', 'עֶרֶב טוֹב = dobro veče.']),
      לאן: g(['where to', 'dokąd', 'kuda']),
      יאללה: g(['come on, let’s go', 'dalej, jedziemy', 'hajde, idemo'], undefined, [
        'Yalla comes from Arabic – Israelis say it all day long.',
        'Jalla pochodzi z arabskiego – Izraelczycy mówią to cały dzień.',
        'Jala dolazi iz arapskog – Izraelci to govore cijeli dan.',
      ]),
      לאט: g(['slowly', 'powoli', 'polako']),
      אין: g(['there is no', 'nie ma', 'nema']),
      בעיה: g(['problem', 'problem', 'problem'], undefined, ['אֵין בְּעָיָה = no problem.', 'אֵין בְּעָיָה = nie ma problemu.', 'אֵין בְּעָיָה = nema problema.']),
      הנה: g(['here (it is)', 'oto', 'evo']),
      הגענו: g(['we have arrived', 'dojechaliśmy', 'stigli smo'], 'הִגִּיעַ', [
        'הִגִּיעַ (he arrived) → הִגַּעְנוּ: the past-tense ending -nu (נוּ) means "we".',
        'הִגִּיעַ (przyjechał) → הִגַּעְנוּ: końcówka czasu przeszłego -nu (נוּ) znaczy „my”.',
        'הִגִּיעַ (stigao je) → הִגַּעְנוּ: nastavak prošlog vremena -nu (נוּ) znači „mi”.',
      ]),
      כבר: g(['already', 'już', 'već']),
      היה: g(['was', 'był, było', 'bio je, bilo je'], undefined, [
        'הָיָה = was (the past of "to be"), said of a man or of "it".',
        'הָיָה = był / było (czas przeszły od „być”) – o mężczyźnie albo o „tym”.',
        'הָיָה = bio je / bilo je (prošlo vrijeme od „biti”) – za muškarca ili za „to”.',
      ]),
      דקה: g(['a minute', 'minuta', 'minut']),
      נכון: g(['right, true', 'zgadza się', 'tačno']),
      חמשים: g(['fifty', 'pięćdziesiąt', 'pedeset']),
      שקל: g(['shekel', 'szekel', 'šekel'], undefined, [
        'With prices Israelis usually keep שֶׁקֶל in the singular: חֲמִשִּׁים שֶׁקֶל.',
        'Przy cenach Izraelczycy zwykle mówią שֶׁקֶל w liczbie pojedynczej: חֲמִשִּׁים שֶׁקֶל.',
        'Kod cijena Izraelci obično kažu שֶׁקֶל u jednini: חֲמִשִּׁים שֶׁקֶל.',
      ]),
      על: g(['on; for', 'na; za', 'na; za'], undefined, [
        'עַל = on; here "for": עַל דַּקָּה = for one minute.',
        'עַל = na; tutaj „za”: עַל דַּקָּה = za minutę.',
        'עַל = na; ovdje „za”: עַל דַּקָּה = za jedan minut.',
      ]),
    },
    questions: [
      q('לְאָן לֵאָה נוֹסַעַת?', ['Where is Lea going?', 'Dokąd jedzie Lea?', 'Kuda ide Lea?'], [
        o('לַיָּם.', ['To the beach.', 'Nad morze.', 'Na more.'], true),
        o('לַמָּלוֹן.', ['To the hotel.', 'Do hotelu.', 'U hotel.']),
        o('לַשּׁוּק.', ['To the market.', 'Na targ.', 'Na pijacu.']),
      ]),
      q('כַּמָּה עוֹלָה הַנְּסִיעָה?', ['How much is the ride?', 'Ile kosztuje kurs?', 'Koliko košta vožnja?'], [
        o('חֲמִשִּׁים שֶׁקֶל.', ['Fifty shekels.', 'Pięćdziesiąt szekli.', 'Pedeset šekela.'], true),
        o('עֶשְׂרִים שֶׁקֶל.', ['Twenty shekels.', 'Dwadzieścia szekli.', 'Dvadeset šekela.']),
        o('מֵאָה שֶׁקֶל.', ['A hundred shekels.', 'Sto szekli.', 'Sto šekela.']),
      ]),
    ],
  },
];

/** Voice of each character: Avri reads the men, Hila the women. */
export const HE_VOICES: Record<string, 'f' | 'm'> = {
  Avi: 'm',
  Noa: 'f',
  Tom: 'm',
  Shira: 'f',
  Rina: 'f',
  Dani: 'm',
  Moshe: 'm',
  Lea: 'f',
};
