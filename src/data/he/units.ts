import { autoBackchain, autoTip, toEnglishPhonetic, toHebrewPhonetic, toSyllableNotation } from '../../lib/hePhonetics';
import type { LegendRow } from '..';
import type { CourseUnitId, Formality, LearningItem, Unit, UnitColor } from '../types';

/**
 * Hebrew from zero for English, Polish and Montenegrin speakers: greetings and introductions, café
 * and food, the market, getting around, family and holidays – everyday Israel and a trip there.
 * Israeli Hebrew (voices Hila and Avri, recognition he-IL).
 *
 * Phrases are authored vocalized (niqqud); syllables, stress and the Latin transcription come from
 * the hand-checked lexicon (data/he/lexicon via lib/hePhonetics). Pronunciation tips are built from
 * the sounds of each phrase (kh, r, ts, h) and its stress, in the learner's language. The course has
 * no Hebrew interface: the Hebrew-interface fields simply repeat the English text.
 *
 * Gender: Hebrew verbs and adjectives agree with the speaker – {masculine|feminine} templates are
 * resolved for the learner (lib/personalize). "You" agrees with the listener, so those phrases come
 * in two items, to a man and to a woman.
 */

type Tri = { en: string; pl: string; cnr: string };

interface HeItem {
  id: string;
  /** The phrase, vocalized (may use {masculine|feminine}). */
  text: string;
  /** Meaning in English, Polish and Montenegrin. */
  m: Tri;
  f?: Formality;
  note?: Tri;
}

interface HeUnit {
  id: CourseUnitId;
  order: number;
  color: UnitColor;
  title: Tri;
  subtitle: Tri;
  description: Tri;
  items: HeItem[];
}

const SOURCES: HeUnit[] = [
  {
    id: 'h1',
    order: 1,
    color: 'sky',
    title: { en: 'First Words', pl: 'Pierwsze słowa', cnr: 'Prve riječi' },
    subtitle: { en: 'Greetings and basics', pl: 'Powitania i podstawy', cnr: 'Pozdravi i osnove' },
    description: {
      en: 'Hello, thank you, please, yes and no – the words you will use every day.',
      pl: 'Cześć, dziękuję, proszę, tak i nie – słowa na każdy dzień.',
      cnr: 'Zdravo, hvala, molim, da i ne – riječi za svaki dan.',
    },
    items: [
      {
        id: 'h1-01',
        text: 'שָׁלוֹם!',
        m: { en: 'Hello! / Goodbye!', pl: 'Cześć! / Do widzenia!', cnr: 'Zdravo! / Doviđenja!' },
        note: {
          en: 'Shalom means "peace" – it is both hello and goodbye.',
          pl: 'Szalom znaczy „pokój” – to i „cześć”, i „do widzenia”.',
          cnr: 'Šalom znači „mir” – to je i „zdravo” i „doviđenja”.',
        },
      },
      { id: 'h1-02', text: 'תּוֹדָה!', m: { en: 'Thank you!', pl: 'Dziękuję!', cnr: 'Hvala!' } },
      { id: 'h1-03', text: 'תּוֹדָה רַבָּה!', m: { en: 'Thank you very much!', pl: 'Dziękuję bardzo!', cnr: 'Hvala puno!' } },
      {
        id: 'h1-04',
        text: 'בְּבַקָּשָׁה.',
        m: { en: 'Please. / You are welcome.', pl: 'Proszę. / Nie ma za co.', cnr: 'Molim. / Nema na čemu.' },
        note: {
          en: 'Bevakasha is "please", "you are welcome" and "here you go" – all in one.',
          pl: 'Bewakasza to „proszę” w każdym znaczeniu: prośba, „nie ma za co” i „proszę bardzo”.',
          cnr: 'Bevakaša znači i „molim”, i „nema na čemu”, i „izvolite”.',
        },
      },
      { id: 'h1-05', text: 'כֵּן.', m: { en: 'Yes.', pl: 'Tak.', cnr: 'Da.' } },
      { id: 'h1-06', text: 'לֹא.', m: { en: 'No.', pl: 'Nie.', cnr: 'Ne.' } },
      { id: 'h1-07', text: 'סְלִיחָה!', m: { en: 'Excuse me! / Sorry!', pl: 'Przepraszam!', cnr: 'Izvinite!' } },
      { id: 'h1-08', text: 'בּוֹקֶר טוֹב!', m: { en: 'Good morning!', pl: 'Dzień dobry! (rano)', cnr: 'Dobro jutro!' } },
      { id: 'h1-09', text: 'עֶרֶב טוֹב!', m: { en: 'Good evening!', pl: 'Dobry wieczór!', cnr: 'Dobro veče!' } },
      { id: 'h1-10', text: 'לַיְלָה טוֹב!', m: { en: 'Good night!', pl: 'Dobranoc!', cnr: 'Laku noć!' } },
      {
        id: 'h1-11',
        text: 'מַה נִּשְׁמָע?',
        m: { en: 'How is it going?', pl: 'Co słychać?', cnr: 'Šta ima?' },
        f: 'casual',
        note: {
          en: 'Literally "what is heard?" – the everyday "how are things".',
          pl: 'Dosłownie „co słychać?” – tak samo jak po polsku!',
          cnr: 'Doslovno „šta se čuje?” – svakodnevno „šta ima?”.',
        },
      },
      { id: 'h1-12', text: 'הַכֹּל בְּסֵדֶר.', m: { en: 'Everything is fine.', pl: 'Wszystko w porządku.', cnr: 'Sve je u redu.' } },
      { id: 'h1-13', text: 'לְהִתְרָאוֹת!', m: { en: 'See you!', pl: 'Do zobaczenia!', cnr: 'Vidimo se!' } },
      {
        id: 'h1-14',
        text: 'סַבָּבָּה!',
        m: { en: 'Cool! / OK!', pl: 'Spoko! / OK!', cnr: 'Važi! / OK!' },
        f: 'casual',
        note: {
          en: 'Israeli slang from Arabic: OK, cool, great.',
          pl: 'Izraelski slang z arabskiego: OK, spoko, super.',
          cnr: 'Izraelski sleng iz arapskog: OK, važi, super.',
        },
      },
    ],
  },
  {
    id: 'h2',
    order: 2,
    color: 'violet',
    title: { en: 'About Me', pl: 'O sobie', cnr: 'O sebi' },
    subtitle: { en: 'Introductions', pl: 'Przedstawianie się', cnr: 'Upoznavanje' },
    description: {
      en: 'Your name, where you are from, and what to say when you do not understand.',
      pl: 'Imię, skąd jesteś i co powiedzieć, gdy nie rozumiesz.',
      cnr: 'Ime, odakle ste i šta reći kad ne razumijete.',
    },
    items: [
      {
        id: 'h2-01',
        text: 'אֵיךְ קוֹרְאִים לְךָ?',
        m: { en: 'What is your name? (to a man)', pl: 'Jak masz na imię? (do mężczyzny)', cnr: 'Kako se zoveš? (muškarcu)' },
        note: {
          en: 'Hebrew "you" depends on who you talk to: lekha to a man, lakh to a woman.',
          pl: '„Ty” po hebrajsku zależy od rozmówcy: lecha do mężczyzny, lach do kobiety.',
          cnr: '„Ti” na hebrejskom zavisi od sagovornika: leha muškarcu, lah ženi.',
        },
      },
      { id: 'h2-02', text: 'אֵיךְ קוֹרְאִים לָךְ?', m: { en: 'What is your name? (to a woman)', pl: 'Jak masz na imię? (do kobiety)', cnr: 'Kako se zoveš? (ženi)' } },
      {
        id: 'h2-03',
        text: 'קוֹרְאִים לִי {דָּנִי|דָּנָה}.',
        m: { en: 'My name is {Dani|Dana}.', pl: 'Mam na imię {Dani|Dana}.', cnr: 'Zovem se {Dani|Dana}.' },
        note: {
          en: 'Literally "they call me…" – put your own name at the end.',
          pl: 'Dosłownie „nazywają mnie…” – na końcu wstaw swoje imię.',
          cnr: 'Doslovno „zovu me…” – na kraju recite svoje ime.',
        },
      },
      { id: 'h2-04', text: 'נָעִים מְאוֹד!', m: { en: 'Nice to meet you!', pl: 'Miło mi!', cnr: 'Drago mi je!' } },
      { id: 'h2-05', text: 'מֵאֵיפֹה אַתָּה?', m: { en: 'Where are you from? (to a man)', pl: 'Skąd jesteś? (do mężczyzny)', cnr: 'Odakle si? (muškarcu)' } },
      { id: 'h2-06', text: 'מֵאֵיפֹה אַתְּ?', m: { en: 'Where are you from? (to a woman)', pl: 'Skąd jesteś? (do kobiety)', cnr: 'Odakle si? (ženi)' } },
      {
        id: 'h2-07',
        text: 'אֲנִי מִפּוֹלִין.',
        m: { en: 'I am from Poland.', pl: 'Jestem z Polski.', cnr: 'Ja sam iz Poljske.' },
        note: {
          en: 'Polin is Poland in Hebrew; mi- in front of a word means "from".',
          pl: 'Polin to po hebrajsku Polska; mi- przed wyrazem znaczy „z”.',
          cnr: 'Polin je Poljska na hebrejskom; mi- ispred riječi znači „iz”.',
        },
      },
      { id: 'h2-08', text: 'אֲנִי מִמּוֹנְטֶנֶגְרוֹ.', m: { en: 'I am from Montenegro.', pl: 'Jestem z Czarnogóry.', cnr: 'Ja sam iz Crne Gore.' } },
      { id: 'h2-09', text: 'אֲנִי {גָּר|גָּרָה} בְּתֵל אָבִיב.', m: { en: 'I live in Tel Aviv.', pl: 'Mieszkam w Tel Awiwie.', cnr: 'Živim u Tel Avivu.' } },
      { id: 'h2-10', text: 'אֲנִי {מְדַבֵּר|מְדַבֶּרֶת} קְצָת עִבְרִית.', m: { en: 'I speak a little Hebrew.', pl: 'Mówię trochę po hebrajsku.', cnr: 'Govorim malo hebrejski.' } },
      { id: 'h2-11', text: 'אֲנִי לֹא {מֵבִין|מְבִינָה}.', m: { en: 'I do not understand.', pl: 'Nie rozumiem.', cnr: 'Ne razumijem.' } },
      { id: 'h2-12', text: 'אֶפְשָׁר לְאַט יוֹתֵר?', m: { en: 'Slower, please?', pl: 'Można wolniej?', cnr: 'Može li sporije?' } },
      { id: 'h2-13', text: 'אֵיךְ אוֹמְרִים אֶת זֶה בְּעִבְרִית?', m: { en: 'How do you say this in Hebrew?', pl: 'Jak to się mówi po hebrajsku?', cnr: 'Kako se ovo kaže na hebrejskom?' } },
      { id: 'h2-14', text: 'מַה שְּׁלוֹמְךָ?', m: { en: 'How are you? (to a man)', pl: 'Jak się masz? (do mężczyzny)', cnr: 'Kako si? (muškarcu)' } },
      { id: 'h2-15', text: 'מַה שְּׁלוֹמֵךְ?', m: { en: 'How are you? (to a woman)', pl: 'Jak się masz? (do kobiety)', cnr: 'Kako si? (ženi)' } },
      { id: 'h2-16', text: 'בְּסֵדֶר, תּוֹדָה!', m: { en: 'Fine, thanks!', pl: 'Dobrze, dziękuję!', cnr: 'Dobro, hvala!' } },
    ],
  },
  {
    id: 'h3',
    order: 3,
    color: 'amber',
    title: { en: 'Café & Food', pl: 'Kawiarnia i jedzenie', cnr: 'Kafić i hrana' },
    subtitle: { en: 'Ordering', pl: 'Zamawianie', cnr: 'Naručivanje' },
    description: {
      en: 'Order coffee the Israeli way, falafel with everything, and ask for the bill.',
      pl: 'Zamów kawę po izraelsku, falafel ze wszystkim i poproś o rachunek.',
      cnr: 'Naručite kafu na izraelski način, falafel sa svime i tražite račun.',
    },
    items: [
      {
        id: 'h3-01',
        text: 'אֶפְשָׁר קָפֶה הָפוּךְ?',
        m: { en: 'Can I have a latte?', pl: 'Mogę prosić latte?', cnr: 'Može kafa s mlijekom?' },
        note: {
          en: 'Hafukh – "upside down" – is the Israeli latte: milk first, coffee on top.',
          pl: 'Hafuch („do góry nogami”) to izraelska latte: najpierw mleko, kawa na wierzch.',
          cnr: 'Hafuh („naopako”) je izraelski late: prvo mlijeko, pa kafa odozgo.',
        },
      },
      { id: 'h3-02', text: 'בְּלִי סוּכָּר, בְּבַקָּשָׁה.', m: { en: 'Without sugar, please.', pl: 'Bez cukru, proszę.', cnr: 'Bez šećera, molim.' } },
      { id: 'h3-03', text: 'אֶפְשָׁר מַיִם?', m: { en: 'Can I have some water?', pl: 'Mogę prosić wodę?', cnr: 'Može voda?' } },
      { id: 'h3-04', text: 'אֶפְשָׁר אֶת הַתַּפְרִיט?', m: { en: 'Can I have the menu?', pl: 'Mogę prosić menu?', cnr: 'Može jelovnik?' } },
      { id: 'h3-05', text: 'אֲנִי {צִמְחוֹנִי|צִמְחוֹנִית}.', m: { en: 'I am vegetarian.', pl: 'Jestem {wegetarianinem|wegetarianką}.', cnr: '{Vegetarijanac|Vegetarijanka} sam.' } },
      {
        id: 'h3-06',
        text: 'חֲצִי פָלָאפֶל, בְּבַקָּשָׁה.',
        m: { en: 'Half a falafel, please.', pl: 'Pół falafela, proszę.', cnr: 'Pola falafela, molim.' },
        note: {
          en: 'Half a falafel is falafel in half a pita – the classic portion.',
          pl: 'Pół falafela to falafel w połówce pity – klasyczna porcja.',
          cnr: 'Pola falafela je falafel u pola pite – klasična porcija.',
        },
      },
      {
        id: 'h3-07',
        text: 'עִם הַכֹּל.',
        m: { en: 'With everything.', pl: 'Ze wszystkim.', cnr: 'Sa svime.' },
        note: {
          en: 'At a falafel stand: all the salads, tahini and pickles.',
          pl: 'W budce z falafelem: wszystkie sałatki, tahini i pikle.',
          cnr: 'Na štandu sa falafelom: sve salate, tahini i turšija.',
        },
      },
      { id: 'h3-08', text: 'זֶה טָעִים מְאוֹד!', m: { en: 'It is very tasty!', pl: 'To jest bardzo smaczne!', cnr: 'Ovo je jako ukusno!' } },
      { id: 'h3-09', text: 'בְּתֵאָבוֹן!', m: { en: 'Enjoy your meal!', pl: 'Smacznego!', cnr: 'Prijatno!' } },
      {
        id: 'h3-10',
        text: 'לְחַיִּים!',
        m: { en: 'Cheers!', pl: 'Na zdrowie!', cnr: 'Živjeli!' },
        note: { en: 'Literally "to life!"', pl: 'Dosłownie „za życie!”', cnr: 'Doslovno „za život!”' },
      },
      { id: 'h3-11', text: 'אֶפְשָׁר חֶשְׁבּוֹן?', m: { en: 'Can I have the bill?', pl: 'Mogę prosić rachunek?', cnr: 'Može račun?' } },
      { id: 'h3-12', text: 'אֲנִי {רָעֵב|רְעֵבָה}.', m: { en: 'I am hungry.', pl: 'Jestem {głodny|głodna}.', cnr: '{Gladan|Gladna} sam.' } },
      { id: 'h3-13', text: 'אֲנִי {רוֹצֶה|רוֹצָה} עוֹד.', m: { en: 'I want more.', pl: 'Chcę jeszcze.', cnr: 'Hoću još.' } },
    ],
  },
  {
    id: 'h4',
    order: 4,
    color: 'emerald',
    title: { en: 'At the Market', pl: 'Na targu', cnr: 'Na pijaci' },
    subtitle: { en: 'Prices and numbers', pl: 'Ceny i liczby', cnr: 'Cijene i brojevi' },
    description: {
      en: 'Numbers, prices and a little bargaining at the shuk.',
      pl: 'Liczby, ceny i trochę targowania się na szuku.',
      cnr: 'Brojevi, cijene i malo cjenkanja na šuku.',
    },
    items: [
      { id: 'h4-01', text: 'כַּמָּה זֶה עוֹלֶה?', m: { en: 'How much does it cost?', pl: 'Ile to kosztuje?', cnr: 'Koliko ovo košta?' } },
      {
        id: 'h4-02',
        text: 'אַחַת, שְׁתַּיִם, שָׁלוֹשׁ.',
        m: { en: 'One, two, three.', pl: 'Jeden, dwa, trzy.', cnr: 'Jedan, dva, tri.' },
        note: {
          en: 'This is how Israelis count out loud and say prices.',
          pl: 'Tak Izraelczycy liczą na głos i podają ceny.',
          cnr: 'Ovako Izraelci broje naglas i govore cijene.',
        },
      },
      { id: 'h4-03', text: 'אַרְבַּע, חָמֵשׁ, שֵׁשׁ.', m: { en: 'Four, five, six.', pl: 'Cztery, pięć, sześć.', cnr: 'Četiri, pet, šest.' } },
      { id: 'h4-04', text: 'שֶׁבַע, שְׁמוֹנֶה, תֵּשַׁע, עֶשֶׂר.', m: { en: 'Seven, eight, nine, ten.', pl: 'Siedem, osiem, dziewięć, dziesięć.', cnr: 'Sedam, osam, devet, deset.' } },
      {
        id: 'h4-05',
        text: 'עֶשְׂרִים שֶׁקֶל.',
        m: { en: 'Twenty shekels.', pl: 'Dwadzieścia szekli.', cnr: 'Dvadeset šekela.' },
        note: { en: 'The shekel (₪) is the Israeli currency.', pl: 'Szekel (₪) to izraelska waluta.', cnr: 'Šekel (₪) je izraelska valuta.' },
      },
      { id: 'h4-06', text: 'זֶה יָקָר מִדַּי.', m: { en: 'It is too expensive.', pl: 'To za drogo.', cnr: 'To je preskupo.' } },
      { id: 'h4-07', text: 'אֶפְשָׁר הֲנָחָה?', m: { en: 'Can I get a discount?', pl: 'Można prosić o zniżkę?', cnr: 'Može popust?' } },
      { id: 'h4-08', text: 'אֲנִי {רוֹצֶה|רוֹצָה} קִילוֹ עַגְבָנִיּוֹת.', m: { en: 'I would like a kilo of tomatoes.', pl: 'Chcę kilo pomidorów.', cnr: 'Hoću kilo paradajza.' } },
      { id: 'h4-09', text: 'יֵשׁ לָכֶם תּוּתִים?', m: { en: 'Do you have strawberries?', pl: 'Macie truskawki?', cnr: 'Imate li jagode?' } },
      { id: 'h4-10', text: 'אֶפְשָׁר לְשַׁלֵּם בְּכַרְטִיס?', m: { en: 'Can I pay by card?', pl: 'Mogę zapłacić kartą?', cnr: 'Mogu li platiti karticom?' } },
      { id: 'h4-11', text: 'שַׂקִּית, בְּבַקָּשָׁה.', m: { en: 'A bag, please.', pl: 'Reklamówkę, proszę.', cnr: 'Kesu, molim.' } },
      { id: 'h4-12', text: 'זֶהוּ, תּוֹדָה.', m: { en: 'That is it, thanks.', pl: 'To wszystko, dziękuję.', cnr: 'To je sve, hvala.' } },
    ],
  },
  {
    id: 'h5',
    order: 5,
    color: 'teal',
    title: { en: 'Getting Around', pl: 'W drodze', cnr: 'Na putu' },
    subtitle: { en: 'Directions and transport', pl: 'Kierunki i transport', cnr: 'Pravci i prevoz' },
    description: {
      en: 'Buses, taxis, trains – and asking the way.',
      pl: 'Autobusy, taksówki, pociągi – i pytanie o drogę.',
      cnr: 'Autobusi, taksiji, vozovi – i pitanje za put.',
    },
    items: [
      {
        id: 'h5-01',
        text: 'אֵיפֹה הַשֵּׁרוּתִים?',
        m: { en: 'Where are the restrooms?', pl: 'Gdzie jest toaleta?', cnr: 'Gdje je toalet?' },
        note: { en: 'Sherutim is the polite word for restrooms.', pl: 'Szerutim to grzeczne słowo na toaletę.', cnr: 'Šerutim je pristojna riječ za toalet.' },
      },
      { id: 'h5-02', text: 'אֵיפֹה הַתַּחֲנָה?', m: { en: 'Where is the station?', pl: 'Gdzie jest przystanek?', cnr: 'Gdje je stanica?' } },
      {
        id: 'h5-03',
        text: 'הָאוֹטוֹבּוּס הַזֶּה נוֹסֵעַ לִירוּשָׁלַיִם?',
        m: { en: 'Does this bus go to Jerusalem?', pl: 'Czy ten autobus jedzie do Jerozolimy?', cnr: 'Da li ovaj autobus ide za Jerusalim?' },
      },
      { id: 'h5-04', text: 'יָשָׁר, וְאָז יָמִינָה.', m: { en: 'Straight on, and then right.', pl: 'Prosto, a potem w prawo.', cnr: 'Pravo, pa desno.' } },
      { id: 'h5-05', text: 'שְׂמֹאלָה.', m: { en: 'To the left.', pl: 'W lewo.', cnr: 'Lijevo.' } },
      { id: 'h5-06', text: 'זֶה רָחוֹק?', m: { en: 'Is it far?', pl: 'Czy to daleko?', cnr: 'Je li to daleko?' } },
      { id: 'h5-07', text: 'לֹא, זֶה קָרוֹב.', m: { en: 'No, it is close.', pl: 'Nie, to blisko.', cnr: 'Ne, blizu je.' } },
      { id: 'h5-08', text: 'לַחוֹף, בְּבַקָּשָׁה.', m: { en: 'To the beach, please.', pl: 'Na plażę, proszę.', cnr: 'Na plažu, molim.' } },
      { id: 'h5-09', text: 'כַּמָּה זְמַן זֶה לוֹקֵחַ?', m: { en: 'How long does it take?', pl: 'Ile to trwa?', cnr: 'Koliko to traje?' } },
      { id: 'h5-10', text: 'אֶפְשָׁר לַעֲצוֹר כָּאן?', m: { en: 'Can you stop here?', pl: 'Można się tu zatrzymać?', cnr: 'Može li stati ovdje?' } },
      { id: 'h5-11', text: 'אֲנִי {מְחַפֵּשׂ|מְחַפֶּשֶׂת} אֶת הַמָּלוֹן.', m: { en: 'I am looking for the hotel.', pl: 'Szukam hotelu.', cnr: 'Tražim hotel.' } },
      { id: 'h5-12', text: 'מָתַי הָרַכֶּבֶת לְחֵיפָה?', m: { en: 'When is the train to Haifa?', pl: 'Kiedy jest pociąg do Hajfy?', cnr: 'Kada je voz za Haifu?' } },
    ],
  },
  {
    id: 'h6',
    order: 6,
    color: 'orange',
    title: { en: 'Family & Home', pl: 'Rodzina i dom', cnr: 'Porodica i dom' },
    subtitle: { en: 'People and greetings', pl: 'Ludzie i życzenia', cnr: 'Ljudi i čestitke' },
    description: {
      en: 'Family, how you feel, Shabbat and holiday greetings.',
      pl: 'Rodzina, samopoczucie, szabat i życzenia świąteczne.',
      cnr: 'Porodica, raspoloženje, šabat i praznične čestitke.',
    },
    items: [
      { id: 'h6-01', text: 'זֹאת אִמָּא שֶׁלִּי.', m: { en: 'This is my mom.', pl: 'To moja mama.', cnr: 'Ovo je moja mama.' } },
      { id: 'h6-02', text: 'זֶה אַבָּא שֶׁלִּי.', m: { en: 'This is my dad.', pl: 'To mój tata.', cnr: 'Ovo je moj tata.' } },
      { id: 'h6-03', text: 'יֵשׁ לִי אָח וְאָחוֹת.', m: { en: 'I have a brother and a sister.', pl: 'Mam brata i siostrę.', cnr: 'Imam brata i sestru.' } },
      { id: 'h6-04', text: 'יֵשׁ לִי שְׁנֵי יְלָדִים.', m: { en: 'I have two children.', pl: 'Mam dwoje dzieci.', cnr: 'Imam dvoje djece.' } },
      { id: 'h6-05', text: 'אֲנִי {נָשׂוּי|נְשׂוּאָה}.', m: { en: 'I am married.', pl: 'Jestem {żonaty|mężatką}.', cnr: '{Oženjen|Udata} sam.' } },
      { id: 'h6-06', text: 'אֲנִי {עָיֵף|עֲיֵפָה}.', m: { en: 'I am tired.', pl: 'Jestem {zmęczony|zmęczona}.', cnr: '{Umoran|Umorna} sam.' } },
      { id: 'h6-07', text: 'בּוֹאוּ לֶאֱכוֹל!', m: { en: 'Come and eat!', pl: 'Chodźcie jeść!', cnr: 'Dođite da jedete!' } },
      {
        id: 'h6-08',
        text: 'שַׁבָּת שָׁלוֹם!',
        m: { en: 'Shabbat shalom!', pl: 'Szabat szalom!', cnr: 'Šabat šalom!' },
        note: {
          en: 'The greeting from Friday afternoon until Saturday evening.',
          pl: 'Pozdrowienie od piątkowego popołudnia do sobotniego wieczoru.',
          cnr: 'Pozdrav od petka popodne do subote uveče.',
        },
      },
      {
        id: 'h6-09',
        text: 'חַג שָׂמֵחַ!',
        m: { en: 'Happy holiday!', pl: 'Wesołych świąt!', cnr: 'Srećan praznik!' },
        note: {
          en: 'For any Jewish holiday: Passover, Sukkot, Hanukkah…',
          pl: 'Na każde święto żydowskie: Pesach, Sukot, Chanukę…',
          cnr: 'Za svaki jevrejski praznik: Pesah, Sukot, Hanuku…',
        },
      },
      {
        id: 'h6-10',
        text: 'מַזָּל טוֹב!',
        m: { en: 'Congratulations!', pl: 'Gratulacje!', cnr: 'Čestitam!' },
        note: {
          en: 'For birthdays, weddings and any good news.',
          pl: 'Na urodziny, wesela i każdą dobrą wiadomość.',
          cnr: 'Za rođendane, vjenčanja i svaku dobru vijest.',
        },
      },
      { id: 'h6-11', text: 'אֲנִי {אוֹהֵב|אוֹהֶבֶת} אֶת יִשְׂרָאֵל.', m: { en: 'I love Israel.', pl: 'Kocham Izrael.', cnr: 'Volim Izrael.' } },
      { id: 'h6-12', text: 'בְּרוּכִים הַבָּאִים!', m: { en: 'Welcome!', pl: 'Witamy!', cnr: 'Dobro došli!' } },
    ],
  },
];

function build(c: HeItem): LearningItem {
  const text = c.text.normalize('NFC');
  const tip = autoTip(text, 'en');
  return {
    id: c.id,
    polish: text,
    syllablesPolish: toSyllableNotation(text),
    hebrew: c.m.en,
    english: c.m.en,
    phoneticHebrew: toHebrewPhonetic(text),
    phoneticEnglish: toEnglishPhonetic(text),
    articulationTip: tip,
    articulationTipEn: tip,
    backchainingSteps: autoBackchain(text),
    formality: c.f ?? 'neutral',
    culturalNote: c.note?.en,
    culturalNoteEn: c.note?.en,
    loc: {
      pl: { meaning: c.m.pl, tip: autoTip(text, 'pl'), note: c.note?.pl },
      cnr: { meaning: c.m.cnr, tip: autoTip(text, 'cnr'), note: c.note?.cnr },
    },
  };
}

export const HE_UNITS: Unit[] = SOURCES.map(({ items, title, subtitle, description, ...u }) => ({
  ...u,
  title: title.en,
  subtitle: subtitle.en,
  description: description.en,
  titleEn: title.en,
  subtitleEn: subtitle.en,
  descriptionEn: description.en,
  loc: {
    pl: { title: title.pl, subtitle: subtitle.pl, description: description.pl },
    cnr: { title: title.cnr, subtitle: subtitle.cnr, description: description.cnr },
  },
  items: items.map(build),
}));

/** One legend row: the Hebrew letters, their Latin sound and a note per interface language. */
const row = (letters: string, en: string, noteEn: string, pl: [string, string], cnr: [string, string]): LegendRow => ({
  pl: letters,
  he: en,
  en,
  noteHe: noteEn,
  noteEn,
  loc: { pl: { sound: pl[0], note: pl[1] }, cnr: { sound: cnr[0], note: cnr[1] } },
});

/** How the Latin transcription spells Hebrew letters and vowels (shown in the Sound Lab). */
export const HE_LEGEND: LegendRow[] = [
  row('ח · כ · ך', 'kh', 'throaty, like ch in Bach', ['ch', 'jak polskie ch, tylko głębiej'], ['h', 'kao naše h, samo dublje']),
  row('ה', 'h', 'a light breath; silent at the end of a word', ['h', 'lekki wydech; na końcu wyrazu nieme'], ['h', 'lagan izdah; na kraju riječi se ne čuje']),
  row('ר', 'r', 'from the throat, like the French r', ['r', 'gardłowe, jak francuskie r'], ['r', 'grleno, kao francusko r']),
  row('צ · ץ', 'ts', 'as in "cats"', ['c', 'jak polskie c'], ['c', 'kao naše c']),
  row('שׁ', 'sh', 'as in "shop"', ['sz', 'jak polskie sz'], ['š', 'kao naše š']),
  row('שׂ · ס', 's', 'a plain s', ['s', 'zwykłe s'], ['s', 'obično s']),
  row('בּ / ב', 'b / v', 'with the dot b, without it v', ['b / w', 'z kropką b, bez niej w'], ['b / v', 'sa tačkom b, bez nje v']),
  row('כּ · ק', 'k', 'with the dot כּ is a plain k', ['k', 'z kropką כּ to zwykłe k'], ['k', 'sa tačkom כּ je obično k']),
  row('פּ / פ', 'p / f', 'with the dot p, without it f', ['p / f', 'z kropką p, bez niej f'], ['p / f', 'sa tačkom p, bez nje f']),
  row('ו', 'v · o · u', 'ו is v; וֹ is o and וּ is u', ['w · o · u', 'ו to w; וֹ to o, a וּ to u'], ['v · o · u', 'ו je v; וֹ je o, a וּ je u']),
  row('י', 'y · i', 'י is y; after a vowel it makes i, ei, ai', ['j · i', 'י to j; po samogłosce daje i, ej, aj'], ['j · i', 'י je j; poslije samoglasnika daje i, ej, aj']),
  row('א · ע', '–', 'silent: they only carry a vowel', ['–', 'nieme: niosą tylko samogłoskę'], ['–', 'ne čuju se: nose samo samoglasnik']),
  row('אַ · אָ', 'a', 'a as in "father"', ['a', 'a'], ['a', 'a']),
  row('אֶ · אֵ', 'e', 'e as in "bed"', ['e', 'e'], ['e', 'e']),
  row('אִ', 'i', 'i as in "ski"', ['i', 'i'], ['i', 'i']),
  row('אֹ · אוֹ', 'o', 'a short, pure o', ['o', 'o'], ['o', 'o']),
  row('אֻ · אוּ', 'u', 'u as in "put"', ['u', 'u'], ['u', 'u']),
  row('אְ', 'e / –', 'a short e at the start of a word, otherwise silent', ['e / –', 'krótkie e na początku wyrazu, poza tym nieme'], ['e / –', 'kratko e na početku riječi, inače se ne čuje']),
];
