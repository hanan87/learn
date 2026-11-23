import type { Roleplay, RoleplayOption } from '../dialogues';

/**
 * Hebrew roleplays (same format as data/dialogues). Lines are vocalized and may address the learner
 * by gender ({to a man|to a woman}); translations are in English, Polish and Montenegrin. The
 * Hebrew-interface fields repeat the English text (the course has no Hebrew interface).
 */

type Tri = [en: string, pl: string, cnr: string];

const loc = ([en, pl, cnr]: Tri) => ({ he: en, en, pl, cnr });
const opt = (correct: boolean) => (text: string, t: Tri, fb: Tri): RoleplayOption => ({ polish: text, t: loc(t), correct, feedback: loc(fb) });
const ok = opt(true);
const no = opt(false);
const line = (text: string, t: Tri) => ({ polish: text, t: loc(t) });

export const HE_ROLEPLAYS: Roleplay[] = [
  {
    id: 'tlv-cafe',
    title: loc(['A café in Tel Aviv', 'Kawiarnia w Tel Awiwie', 'Kafić u Tel Avivu']),
    setting: loc([
      'A busy café on Dizengoff Street. The barista is friendly but quick – answer short and clear.',
      'Zatłoczona kawiarnia na ulicy Dizengoffa. Barista jest miły, ale szybki – odpowiadaj krótko i jasno.',
      'Prepun kafić u ulici Dizengof. Barista je ljubazan, ali brz – odgovarajte kratko i jasno.',
    ]),
    partner: loc(['Barista', 'Barista', 'Barista']),
    voice: 'm',
    register: 'neutral',
    turns: [
      {
        line: line('שָׁלוֹם! מָה {תִּרְצֶה|תִּרְצִי}?', ['Hi! What would you like?', 'Cześć! Co podać?', 'Zdravo! Šta ćete?']),
        options: [
          ok('קָפֶה הָפוּךְ, בְּבַקָּשָׁה.', ['A latte, please.', 'Latte, proszę.', 'Kafu s mlijekom, molim.'], ['Perfect – hafukh is the Israeli latte.', 'Świetnie – hafuch to izraelska latte.', 'Odlično – hafuh je izraelski late.']),
          no('לַיְלָה טוֹב!', ['Good night!', 'Dobranoc!', 'Laku noć!'], ['That is "good night" – you are just arriving! Order something.', 'To „dobranoc” – a my dopiero zaczynamy! Zamów coś.', 'To je „laku noć” – tek ste došli! Naručite nešto.']),
        ],
      },
      {
        line: line('גָּדוֹל אוֹ קָטָן?', ['Large or small?', 'Duża czy mała?', 'Velika ili mala?']),
        options: [
          ok('קָטָן, בְּבַקָּשָׁה.', ['Small, please.', 'Mała, proszę.', 'Mala, molim.'], ['Short and clear.', 'Krótko i jasno.', 'Kratko i jasno.']),
          no('כֵּן, בְּבַקָּשָׁה.', ['Yes, please.', 'Tak, proszę.', 'Da, molim.'], ['It is an either-or question: answer gadol (large) or katan (small).', 'To pytanie „albo–albo”: odpowiedz gadol (duża) albo katan (mała).', 'To je pitanje „ili–ili”: odgovorite gadol (velika) ili katan (mala).']),
        ],
      },
      {
        line: line('לָשֶׁבֶת אוֹ לָקַחַת?', ['For here or to go?', 'Na miejscu czy na wynos?', 'Ovdje ili za ponijeti?']),
        options: [
          ok('לָקַחַת, בְּבַקָּשָׁה.', ['To go, please.', 'Na wynos, proszę.', 'Za ponijeti, molim.'], ['Right – lakakhat means "to take away".', 'Dobrze – lakachat znaczy „na wynos”.', 'Tačno – lakahat znači „za ponijeti”.']),
          no('אֲנִי מִפּוֹלִין.', ['I am from Poland.', 'Jestem z Polski.', 'Ja sam iz Poljske.'], ['Nice, but he asked: here (lashevet) or to go (lakakhat)?', 'Miło, ale pytał: na miejscu (laszewet) czy na wynos (lakachat)?', 'Lijepo, ali pitao je: ovdje (laševet) ili za ponijeti (lakahat)?']),
        ],
      },
      {
        line: line('עוֹד מַשֶּׁהוּ?', ['Anything else?', 'Coś jeszcze?', 'Još nešto?']),
        options: [
          ok('לֹא, זֶהוּ. תּוֹדָה!', ['No, that is it. Thanks!', 'Nie, to wszystko. Dzięki!', 'Ne, to je sve. Hvala!'], ['Great – zehu means "that is it".', 'Świetnie – zehu znaczy „to wszystko”.', 'Odlično – zehu znači „to je sve”.']),
          no('בְּתֵאָבוֹן!', ['Enjoy your meal!', 'Smacznego!', 'Prijatno!'], ['You wish that before eating – answer whether you want anything else.', 'Tak się życzy przed jedzeniem – odpowiedz, czy chcesz coś jeszcze.', 'To se kaže prije jela – odgovorite da li želite još nešto.']),
        ],
      },
      {
        line: line('שְׁמוֹנֶה עֶשְׂרֵה שֶׁקֶל.', ['Eighteen shekels.', 'Osiemnaście szekli.', 'Osamnaest šekela.']),
        options: [
          ok('אֶפְשָׁר לְשַׁלֵּם בְּכַרְטִיס?', ['Can I pay by card?', 'Mogę zapłacić kartą?', 'Mogu li platiti karticom?'], ['Right – almost every place in Israel takes cards.', 'Dobrze – prawie wszędzie w Izraelu można płacić kartą.', 'Tačno – skoro svuda u Izraelu se može platiti karticom.']),
          no('זֶה רָחוֹק?', ['Is it far?', 'Czy to daleko?', 'Je li to daleko?'], ['You are asking for directions – it is time to pay.', 'Pytasz o drogę – a czas zapłacić.', 'Pitate za put – a vrijeme je da platite.']),
        ],
      },
    ],
  },
  {
    id: 'carmel-market',
    title: loc(['At the Carmel Market', 'Na targu Karmel', 'Na pijaci Karmel']),
    setting: loc([
      'The Carmel Market in Tel Aviv – loud and colorful, and the seller is in a hurry. Bargain a little!',
      'Targ Karmel w Tel Awiwie – głośno i kolorowo, a sprzedawca się spieszy. Trochę się potarguj!',
      'Pijaca Karmel u Tel Avivu – glasno i šareno, a prodavac žuri. Malo se cjenkajte!',
    ]),
    partner: loc(['Seller', 'Sprzedawca', 'Prodavac']),
    voice: 'm',
    register: 'casual',
    turns: [
      {
        line: line('מַה לָּתֵת {לְךָ|לָךְ}?', ['What can I get you?', 'Co podać?', 'Šta da vam dam?']),
        options: [
          ok('אֲנִי {רוֹצֶה|רוֹצָה} קִילוֹ עַגְבָנִיּוֹת.', ['I would like a kilo of tomatoes.', 'Chcę kilo pomidorów.', 'Hoću kilo paradajza.'], ['Perfect.', 'Doskonale.', 'Odlično.']),
          no('בְּתֵאָבוֹן!', ['Enjoy your meal!', 'Smacznego!', 'Prijatno!'], ['You have not bought anything yet – tell him what you want.', 'Jeszcze nic nie masz – powiedz, czego chcesz.', 'Još ništa nemate – recite šta želite.']),
        ],
      },
      {
        line: line('בְּבַקָּשָׁה. עוֹד מַשֶּׁהוּ?', ['Here you go. Anything else?', 'Proszę. Coś jeszcze?', 'Izvolite. Još nešto?']),
        options: [
          ok('יֵשׁ לָכֶם תּוּתִים?', ['Do you have strawberries?', 'Macie truskawki?', 'Imate li jagode?'], ['Good – yesh lakhem? means "do you have?"', 'Dobrze – jesz lachem? znaczy „macie?”', 'Dobro – ješ lahem? znači „imate li?”']),
          no('לְחַיִּים!', ['Cheers!', 'Na zdrowie!', 'Živjeli!'], ['That is a toast – save it for dinner.', 'To toast – zostaw go na kolację.', 'To je zdravica – sačuvajte je za večeru.']),
        ],
      },
      {
        line: line('יֵשׁ! עֶשְׂרִים שֶׁקֶל לַקּוּפְסָה.', ['We do! Twenty shekels a box.', 'Są! Dwadzieścia szekli za pudełko.', 'Ima! Dvadeset šekela kutija.']),
        options: [
          ok('זֶה יָקָר מִדַּי.', ['That is too expensive.', 'To za drogo.', 'To je preskupo.'], ['At the shuk, bargaining is part of the game.', 'Na szuku targowanie się to część zabawy.', 'Na šuku je cjenkanje dio igre.']),
          no('לַיְלָה טוֹב!', ['Good night!', 'Dobranoc!', 'Laku noć!'], ['It is morning at the market! React to the price.', 'Jest rano na targu! Zareaguj na cenę.', 'Jutro je na pijaci! Reagujte na cijenu.']),
        ],
      },
      {
        line: line('{בִּשְׁבִילְךָ|בִּשְׁבִילֵךְ} – חֲמֵשׁ עֶשְׂרֵה!', ['For you – fifteen!', 'Dla ciebie – piętnaście!', 'Za vas – petnaest!']),
        options: [
          ok('סַבָּבָּה! אֶפְשָׁר לְשַׁלֵּם בְּכַרְטִיס?', ['Cool! Can I pay by card?', 'Spoko! Mogę zapłacić kartą?', 'Važi! Mogu li platiti karticom?'], ['Sababa – deal!', 'Sababa – umowa stoi!', 'Sababa – dogovoreno!']),
          no('יֵשׁ לִי שְׁנֵי יְלָדִים.', ['I have two children.', 'Mam dwoje dzieci.', 'Imam dvoje djece.'], ['Sweet, but he is waiting for a yes on the price.', 'Miło, ale on czeka na zgodę na cenę.', 'Lijepo, ali on čeka da pristanete na cijenu.']),
        ],
      },
      {
        line: line('רַק מְזוּמָן, {אָחִי|אֲחוֹתִי}.', ['Cash only, {bro|sis}.', 'Tylko gotówka, {bracie|siostro}.', 'Samo keš, {brate|sestro}.']),
        options: [
          ok('אֵין בְּעָיָה. הִנֵּה, תּוֹדָה!', ['No problem. Here you go, thanks!', 'Nie ma problemu. Proszę, dziękuję!', 'Nema problema. Izvolite, hvala!'], ['Ein be’aya – no problem. Well done!', 'Ejn beaja – nie ma problemu. Brawo!', 'Ejn beaja – nema problema. Bravo!']),
          no('אֶפְשָׁר הֲנָחָה?', ['Can I get a discount?', 'Można prosić o zniżkę?', 'Može popust?'], ['You already got one – from twenty down to fifteen!', 'Zniżka już była – z dwudziestu na piętnaście!', 'Popust ste već dobili – sa dvadeset na petnaest!']),
        ],
      },
    ],
  },
  {
    id: 'shabbat-dinner',
    title: loc(['Shabbat dinner', 'Kolacja szabatowa', 'Šabatska večera']),
    setting: loc([
      'Friday evening. An Israeli friend invited you to Shabbat dinner with her family, and her mother Rina opens the door.',
      'Piątkowy wieczór. Izraelska przyjaciółka zaprosiła cię na kolację szabatową z rodziną. Drzwi otwiera jej mama, Rina.',
      'Petak uveče. Izraelska prijateljica vas je pozvala na šabatsku večeru sa porodicom. Vrata otvara njena mama Rina.',
    ]),
    partner: loc(['Rina, the host', 'Rina, gospodyni', 'Rina, domaćica']),
    voice: 'f',
    register: 'neutral',
    turns: [
      {
        line: line('שַׁבָּת שָׁלוֹם! {בּוֹא|בּוֹאִי}, {תִּכָּנֵס|תִּכָּנְסִי}!', ['Shabbat shalom! Come, come in!', 'Szabat szalom! Chodź, wejdź!', 'Šabat šalom! Hajde, uđi!']),
        options: [
          ok('שַׁבָּת שָׁלוֹם! תּוֹדָה עַל הַהַזְמָנָה.', ['Shabbat shalom! Thank you for the invitation.', 'Szabat szalom! Dziękuję za zaproszenie.', 'Šabat šalom! Hvala na pozivu.'], ['Lovely – a guest always thanks for the invitation.', 'Pięknie – gość zawsze dziękuje za zaproszenie.', 'Divno – gost uvijek zahvali na pozivu.']),
          no('בּוֹקֶר טוֹב!', ['Good morning!', 'Dzień dobry!', 'Dobro jutro!'], ['It is Friday evening – answer with Shabbat shalom.', 'Jest piątkowy wieczór – odpowiedz „szabat szalom”.', 'Petak je uveče – odgovorite „šabat šalom”.']),
        ],
      },
      {
        line: line('{אַתָּה רָעֵב|אַתְּ רְעֵבָה}?', ['Are you hungry?', 'Jesteś {głodny|głodna}?', 'Jesi li {gladan|gladna}?']),
        options: [
          ok('כֵּן, מְאוֹד!', ['Yes, very!', 'Tak, bardzo!', 'Da, jako!'], ['Good answer – there is a lot of food coming.', 'Dobra odpowiedź – będzie dużo jedzenia.', 'Dobar odgovor – biće puno hrane.']),
          no('אֶפְשָׁר חֶשְׁבּוֹן?', ['Can I have the bill?', 'Mogę prosić rachunek?', 'Može račun?'], ['This is a family dinner, not a restaurant – there is no bill!', 'To rodzinna kolacja, nie restauracja – tu nie ma rachunku!', 'Ovo je porodična večera, a ne restoran – nema računa!']),
        ],
      },
      {
        line: line('בְּתֵאָבוֹן! {רוֹצֶה|רוֹצָה} עוֹד?', ['Enjoy! Would you like some more?', 'Smacznego! Chcesz jeszcze?', 'Prijatno! Hoćeš još?']),
        options: [
          ok('לֹא, תּוֹדָה. אֲנִי {שָׂבֵעַ|שְׂבֵעָה}.', ['No, thank you. I am full.', 'Nie, dziękuję. Jestem {najedzony|najedzona}.', 'Ne, hvala. {Sit|Sita} sam.'], ['Polite – though Israeli mothers rarely take no for an answer.', 'Grzecznie – choć izraelskie mamy rzadko przyjmują odmowę.', 'Pristojno – iako izraelske mame rijetko prihvataju „ne”.']),
          no('זֶה יָקָר מִדַּי.', ['It is too expensive.', 'To za drogo.', 'To je preskupo.'], ['It is home cooking, not a shop! Say yes or no, thank you.', 'To domowe jedzenie, nie sklep! Powiedz tak albo nie, dziękuję.', 'Ovo je domaća hrana, a ne prodavnica! Recite da ili ne, hvala.']),
        ],
      },
      {
        line: line('{אָהַבְתָּ|אָהַבְתְּ} אֶת הָאוֹכֶל?', ['Did you like the food?', 'Smakowało ci?', 'Da li ti se svidjela hrana?']),
        options: [
          ok('כֵּן! זֶה הָיָה טָעִים מְאוֹד!', ['Yes! It was very tasty!', 'Tak! Było bardzo smaczne!', 'Da! Bilo je jako ukusno!'], ['The best compliment for the cook.', 'Najlepszy komplement dla kucharki.', 'Najljepši kompliment za kuvaricu.']),
          no('לַחוֹף, בְּבַקָּשָׁה.', ['To the beach, please.', 'Na plażę, proszę.', 'Na plažu, molim.'], ['You say that to a taxi driver – tell Rina how the food was.', 'To mówi się taksówkarzowi – powiedz Rinie, jak smakowało.', 'To se kaže taksisti – recite Rini kakva je bila hrana.']),
        ],
      },
      {
        line: line('{תָּבוֹא|תָּבוֹאִי} שׁוּב!', ['Come again!', 'Przyjdź znowu!', 'Dođi opet!']),
        options: [
          ok('תּוֹדָה רַבָּה! לַיְלָה טוֹב!', ['Thank you so much! Good night!', 'Bardzo dziękuję! Dobranoc!', 'Hvala puno! Laku noć!'], ['A warm goodbye.', 'Ciepłe pożegnanie.', 'Toplo pozdravljanje.']),
          no('מַזָּל טוֹב!', ['Congratulations!', 'Gratulacje!', 'Čestitam!'], ['Mazal tov is for good news – say thank you and good night.', 'Mazal tow mówi się przy dobrych wieściach – podziękuj i powiedz dobranoc.', 'Mazal tov se kaže za dobre vijesti – zahvalite i recite laku noć.']),
        ],
      },
    ],
  },
];
