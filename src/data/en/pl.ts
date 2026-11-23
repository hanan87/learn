import type { EnLocal } from './local';

/**
 * Everyday English for Polish speakers: meanings, tips and situations in Polish (the learner is
 * addressed with "ty"). Respellings inside tips use the Polish letters of lib/latinRespell
 * (th, dh, ł = w, w = v, y = short i, æ = the open a of "bad", stressed syllable in capitals).
 * Tips focus on what Polish speakers get wrong: th, the open a, short vs long i, the American r,
 * voiced final consonants (bad is not "bet") and English word stress.
 */
export const EN_PL: EnLocal = {
  units: {
    e1: {
      title: 'Dźwięki, których nie ma w polskim',
      subtitle: 'th, w i v, amerykańskie r, ship i sheep, bad i bed',
      description:
        'Polacy zwykle dobrze rozumieją angielski – akcent zdradza kilka dźwięków, których polski nie ma: th (język między zębami), otwarte a z „bad”, krótkie i długie i (ship / sheep), amerykańskie r, które nie drga, i dźwięczne końcówki (bad to nie „bet”). W tym dziale ćwiczysz je na codziennych słowach, razem z akcentem.',
    },
    e2: {
      title: 'Poznawanie ludzi i small talk',
      subtitle: 'Jak się masz, skąd jesteś, czym się zajmujesz',
      description:
        'Pierwsze minuty każdej rozmowy: powitania, przedstawianie się, pytanie, skąd ktoś jest i czym się zajmuje, oraz uprzejma prośba o powtórzenie albo wolniejsze mówienie. Uwaga: „How are you?” to powitanie, a nie pytanie o zdrowie.',
    },
    e3: {
      title: 'Kawiarnia i restauracja',
      subtitle: 'Zamawianie, prośby, pytania i płacenie',
      description:
        'Stolik i kawa, pytanie o polecane danie, prośba „bez cebuli” i na koniec rachunek. W Ameryce prosi się uprzejmie – „Can I get…” i „I’d like…” – i zostawia 15–20% napiwku.',
    },
    e4: {
      title: 'Kierunki i transport',
      subtitle: 'Gdzie to jest, jak dojechać, bilet na pociąg',
      description:
        'Pytanie o dworzec, rozumienie „prosto i w lewo”, kupno biletu, pytanie o następny pociąg – i adres dla taksówkarza. Prawie każde pytanie zaczyna się tu od „Excuse me”.',
    },
    e5: {
      title: 'Zakupy',
      subtitle: 'Ile to kosztuje, rozmiar, przymierzanie i zwroty',
      description:
        'Pytanie o cenę, prośba o inny rozmiar, przymierzanie, delikatne targowanie się – i zwrot towaru. W Ameryce cena na półce nie zawiera podatku, więc przy kasie jest trochę wyższa.',
    },
    e6: {
      title: 'Hotel, lot i telefon',
      subtitle: 'Zameldowanie, opóźniony lot, rozmowa służbowa',
      description:
        'Zameldowanie, pytanie o śniadanie, uprzejma reklamacja, gdy coś nie działa; na lotnisku – bramka, opóźnienie i miejsce przy oknie; a przez telefon – przedstawienie się, prośba o rozmowę z kimś i umówienie spotkania.',
    },
  },

  items: {
    // --- e1: the sounds Polish does not have ---
    'e1-01': {
      m: 'myśleć',
      tip: 'th: czubek języka między zębami i dmuchnij – nie „fynk” ani „synk”. Krótkie i, prawie jak polskie y: „thynk”.',
      sit: 'Ktoś pyta o twoją decyzję, a ty potrzebujesz czasu. Powiedz „myśleć”.',
    },
    'e1-02': {
      m: 'Dziękuję!',
      tip: 'Bezdźwięczne th na początku, a otwarte jak w „bad”: „thænk”. you doklejone: „THÆNK-ju”. Nie „fenk ju”.',
      sit: 'Kelnerka przyniosła ci kawę. Podziękuj.',
    },
    'e1-03': {
      m: 'ten tutaj (to)',
      tip: 'th w this jest dźwięczne – język między zębami, struny głosowe drgają: „dhys”, nie „dis” ani „zis”.',
      sit: 'Pokazujesz ciasto w witrynie. Powiedz „ten tutaj”.',
    },
    'e1-04': {
      m: 'trzy',
      tip: 'three zaczyna się od bezdźwięcznego th, potem r: „thri”. Powiesz „tri” – usłyszą tree (drzewo).',
      sit: 'Pytają, ile biletów potrzebujesz – trzy. Powiedz liczbę.',
    },
    'e1-05': {
      m: 'woda',
      tip: 'w na początku to polskie ł: „ŁA-der”. Po amerykańsku t w środku brzmi prawie jak szybkie d.',
      sit: 'Chce ci się pić w restauracji. Poproś o wodę jednym słowem.',
    },
    'e1-06': {
      m: 'bardzo dobrze',
      tip: 'very zaczyna się od v (polskie w: zęby na wardze), well od w (polskie ł): „WE-ri ŁEL”. Na tym polega cała różnica – powiedz powoli.',
      sit: 'Pytają, jak minęła podróż. Odpowiedz „bardzo dobrze”.',
    },
    'e1-07': {
      m: 'statek',
      tip: 'Krótkie i, prawie jak polskie y: „szyp”. Jeśli je przeciągniesz („szip”), powiesz sheep (owca).',
      sit: 'Jesteś w porcie i pokazujesz statek wycieczkowy. Powiedz „statek”.',
    },
    'e1-08': {
      m: 'owca (owce)',
      tip: 'Długie i – uśmiechnij się i przeciągnij: „szip”, nie „szyp” (to byłby ship).',
      sit: 'Na wycieczce w Anglii dziecko pyta, co to za białe zwierzęta na łące. Odpowiedz „owce”.',
    },
    'e1-09': {
      m: 'mieszkać',
      tip: 'live (mieszkać) ma krótkie i: „lyw”; leave (wyjeżdżać) długie: „liw”. Na końcu dźwięczne v – nie „lyf”.',
      sit: 'Pytają, czy jesteś tu na urlopie, czy tu mieszkasz. Powiedz czasownik „mieszkać”.',
    },
    'e1-10': {
      m: 'zły (źle)',
      tip: 'a w bad jest bardzo otwarte – opuść żuchwę, między a i e: „bæd”. I dźwięczne d na końcu – nie „bet”. bed (łóżko) to zwykłe „bed”.',
      sit: 'Pytają, jaka była pogoda, a była okropna. Powiedz „źle”.',
    },
    'e1-11': {
      m: 'świat',
      tip: 'Jedno z trudniejszych słów: w (ł), potem amerykańskie „er” (język zawinięty), potem l i d: „łerld”. Bez drgającego r.',
      sit: 'Rozmawiacie o podróżach i chcesz powiedzieć „świat”. Powiedz to słowo.',
    },
    'e1-12': {
      m: 'wygodny',
      tip: 'Akcent na pierwszej sylabie, nie na przedostatniej jak po polsku! Środek znika: „KAMF-ter-bel” – trzy sylaby, nie cztery.',
      sit: 'W sklepie pytają, jak leżą buty. Powiedz, że są wygodne.',
    },
    'e1-13': {
      m: 'Czy mogę zadać pytanie?',
      tip: 'Słowa się zlewają: „ke-NAJ æsk e KŁES-czen”. can bez akcentu, question z „kł” i „czen” na końcu.',
      sit: 'Jesteś na końcu wykładu i chcesz o coś zapytać. Poproś o pozwolenie.',
    },

    // --- e2: meeting people and small talk ---
    'e2-01': {
      m: 'Cześć, jak się masz?',
      tip: 'Jednym ciągiem, z lekkim wznoszeniem na końcu: „haj, hał ar ju”. are prawie znika.',
      sit: 'Rano spotykasz na korytarzu kolegę z pracy. Przywitaj się i zapytaj, co słychać.',
      note: 'How are you? to powitanie – odpowiada się krótko (Fine, thanks), bez opowieści o bólu głowy.',
    },
    'e2-02': {
      m: 'Dobrze, dzięki. A ty?',
      tip: 'I’m to jedna sylaba: „ajm”. thanks z th i otwartym a: „thænks”. Przy And you? głos idzie w górę.',
      sit: 'Ktoś pyta, jak się masz. Odpowiedz, że dobrze, podziękuj i zapytaj o to samo.',
    },
    'e2-03': {
      m: 'Miło cię poznać.',
      tip: 'Łącz: „najs te mit ju” – to jest bardzo słabe, a meet you brzmi prawie jak „mi-czu”.',
      sit: 'Kolega przedstawił ci swoją żonę. Powiedz, że miło ją poznać.',
    },
    'e2-04': {
      m: 'Mam na imię {name}.',
      tip: 'name z długim „ej”: „nejm”. Akcent na twoim imieniu na końcu.',
      sit: 'Na konferencji pytają, jak masz na imię. Przedstaw się.',
    },
    'e2-05': {
      m: 'Skąd jesteś?',
      tip: 'where zaczyna się od w: „łer”. from na końcu jest słabe. U Amerykanów: „łer-ju-FRAM”.',
      sit: 'W hostelu poznajesz turystę. Zapytaj, skąd jest.',
    },
    'e2-06': {
      m: 'Jestem z Izraela.',
      tip: 'Po angielsku: „YZ-ri-el”, z akcentem na pierwszej sylabie – nie „iz-ra-EL”.',
      sit: 'Grasz rolę turysty z Izraela. Pytają, skąd jesteś – odpowiedz.',
    },
    'e2-07': {
      m: 'Czym się zajmujesz?',
      tip: 'Mówione szybko: „łat-dje-DU”. Akcent na ostatnim do.',
      sit: 'Na imprezie rozmawiasz z kimś nowym. Zapytaj, czym się zajmuje zawodowo.',
      note: 'What do you do? znaczy „czym się zajmujesz (w pracy)”, a nie „co teraz robisz”.',
    },
    'e2-08': {
      m: 'Pracuję w branży IT.',
      tip: 'work: w (ł), potem amerykańskie „er” – „łerk”, nie „łork”. tech to „tek”.',
      sit: 'Pytają, gdzie pracujesz. Powiedz, że w IT.',
      note: 'Amerykanie mówią in tech o całej branży technologicznej.',
    },
    'e2-09': {
      m: 'Jak długo już tu jesteś?',
      tip: 'have you been się zlewa: „hæw-ju-byn”. Amerykanie mówią been krótko: „byn”.',
      sit: 'W Nowym Jorku spotykasz rodaka. Zapytaj, jak długo już tu jest.',
    },
    'e2-10': {
      m: 'Tylko kilka dni.',
      tip: 'few to „fju”, days z „ej” i dźwięcznym z na końcu: „dejz”, nie „dejs”.',
      sit: 'Pytają, jak długo jesteś w mieście. Odpowiedz, że tylko kilka dni.',
    },
    'e2-11': {
      m: 'Przepraszam, czy może pan / pani to powtórzyć?',
      tip: 'could you brzmi „ku-dżu”. again po amerykańsku: „e-GEN”, akcent na gen.',
      sit: 'Nie było słychać, co powiedział urzędnik. Poproś uprzejmie o powtórzenie.',
    },
    'e2-12': {
      m: 'Czy może pan / pani mówić trochę wolniej?',
      tip: 'little po amerykańsku: t brzmi jak szybkie d – „LY-del”. slower z „ou” i r na końcu.',
      sit: 'Sprzedawca mówi za szybko. Poproś uprzejmie, żeby mówił wolniej.',
    },
    'e2-13': {
      m: 'Do zobaczenia później!',
      tip: 'later po amerykańsku: „LEJ-der”, t miękkie jak d.',
      sit: 'Żegnasz się z kolegą, z którym zobaczysz się wieczorem. Powiedz „do zobaczenia”.',
    },
    'e2-14': {
      m: 'Miłego dnia!',
      tip: 'have a się zlewa: „hæ-we-NAJS-dej”. v w have jest dźwięczne – nie „hæf”.',
      sit: 'Wychodzisz ze sklepu. Życz sprzedawczyni miłego dnia.',
    },

    // --- e3: café and restaurant ---
    'e3-01': {
      m: 'Poproszę kawę.',
      tip: 'Can I get a brzmi „ke-NAJ-ge-de”. coffee po amerykańsku: „KA-fi”, akcent na początku.',
      sit: 'Stoisz przy ladzie w kawiarni w Nowym Jorku. Zamów kawę.',
      note: 'W Ameryce Can I get… to zwykły sposób zamawiania – nie brzmi niegrzecznie.',
    },
    'e3-02': {
      m: 'Poproszę stolik dla dwóch osób.',
      tip: 'I’d to „ajd”. table z „ej”: „TEJ-bel”. for two szybko: „fer-TU”.',
      sit: 'Wchodzisz do restauracji z partnerem albo partnerką. Poproś o stolik dla dwojga.',
    },
    'e3-03': {
      m: 'Czy możemy zobaczyć menu?',
      tip: 'menu to „MEN-ju”, akcent na me. the jest słabe, z dźwięcznym th: „dhe”.',
      sit: 'Siedzicie już przy stoliku, a menu wciąż nie ma. Poproś o kartę.',
    },
    'e3-04': {
      m: 'Co pan poleca?',
      tip: 'recommend – akcent na końcu: „re-ke-MEND”. Amerykańskie r na początku, bez drgania.',
      sit: 'Nie wiesz, co zamówić. Zapytaj kelnera, co poleca.',
    },
    'e3-05': {
      m: 'Poproszę sałatkę z kurczakiem.',
      tip: 'I’ll to „ajl”. chicken: „CZY-ken” z krótkim i. salad z otwartym a: „SÆ-led”.',
      sit: 'Kelner czeka na zamówienie. Zamów sałatkę z kurczakiem.',
      note: 'I’ll have… to naturalny sposób zamawiania w restauracji.',
    },
    'e3-06': {
      m: 'Bez cebuli, proszę.',
      tip: 'onions to „AN-jenz” – zaczyna się jak „a”, nie „o”. s na końcu brzmi jak z.',
      sit: 'Nie jesz cebuli. Poproś o danie bez cebuli.',
    },
    'e3-07': {
      m: 'Mogę prosić o wodę?',
      tip: 'have some się zlewa: „hæw-sam”. water z ł i miękkim t: „ŁA-der”.',
      sit: 'Skończył ci się napój. Poproś o wodę.',
    },
    'e3-08': {
      m: 'Czy to jest ostre?',
      tip: 'Is it się zlewa: „y-zyt”. spicy z „aj”: „SPAJ-si”.',
      sit: 'W menu jest danie z papryczką. Zapytaj, czy jest ostre.',
    },
    'e3-09': {
      m: 'To było pyszne!',
      tip: 'delicious – akcent w środku: „de-LY-szes”. was jest słabe: „łez”.',
      sit: 'Kelnerka pyta, jak smakowało. Powiedz, że było pyszne.',
    },
    'e3-10': {
      m: 'Czy możemy prosić o rachunek?',
      tip: 'check to „czek”. Brytyjczycy mówią the bill, Amerykanie the check.',
      sit: 'Skończyliście jeść i się spieszycie. Poproś o rachunek.',
    },
    'e3-11': {
      m: 'Czy mogę zapłacić kartą?',
      tip: 'pay to „pej”, card z amerykańskim r i dźwięcznym d: „kard”, nie „kart”.',
      sit: 'Nie masz gotówki. Zapytaj, czy można płacić kartą.',
    },
    'e3-12': {
      m: 'Reszty nie trzeba.',
      tip: 'change to „czejndż” – dż na końcu, nie „czejncz”.',
      sit: 'Płacisz gotówką i należy ci się trochę reszty. Powiedz kelnerowi, żeby ją zatrzymał.',
      note: 'W amerykańskiej restauracji napiwek (15–20%) nie jest wliczony w cenę.',
    },

    // --- e4: directions and transport ---
    'e4-01': {
      m: 'Przepraszam, gdzie jest dworzec kolejowy?',
      tip: 'excuse me to „eks-KJUZ-mi”, akcent na cuse. station: „STEJ-szen”.',
      sit: 'Wychodzisz z hotelu i nie wiesz, jak dojść na dworzec. Zapytaj przechodnia.',
    },
    'e4-02': {
      m: 'Czy to daleko stąd?',
      tip: 'far i here kończą się amerykańskim r: „far”, „hir” – r bez drgania.',
      sit: 'Ktoś wytłumaczył ci, gdzie jest muzeum. Zapytaj, czy to daleko.',
    },
    'e4-03': {
      m: 'Proszę iść prosto i skręcić w lewo.',
      tip: 'straight to „strejt”. turn z „er”: „tern”. left z krótkim e.',
      sit: 'Turysta pyta cię, jak dojść na plażę. Wytłumacz: prosto, a potem w lewo.',
    },
    'e4-04': {
      m: 'To po prawej stronie.',
      tip: 'right zaczyna się amerykańskim r – język zawinięty, bez drgania: „rajt”.',
      sit: 'Ktoś szuka banku, a bank jest po prawej. Powiedz mu.',
    },
    'e4-05': {
      m: 'Jak dojechać na lotnisko?',
      tip: 'airport to „ER-port”, akcent na początku. get to się zlewa: „ge-de”.',
      sit: 'Jesteś w hotelu i jutro lecisz. Zapytaj w recepcji, jak dojechać na lotnisko.',
    },
    'e4-06': {
      m: 'Który autobus jedzie do centrum?',
      tip: 'which z ł: „łycz”. bus z „a”: „bas”. downtown – akcent na końcu.',
      sit: 'Stoisz na przystanku. Zapytaj, który autobus jedzie do centrum.',
      note: 'downtown to centrum miasta w Ameryce (w Anglii: the city centre).',
    },
    'e4-07': {
      m: 'Jeden bilet, proszę.',
      tip: 'one brzmi „łan” – z ł, nie „łon”. ticket: „TY-ket” z krótkim i.',
      sit: 'Jesteś przy kasie. Poproś o jeden bilet.',
    },
    'e4-08': {
      m: 'Ile kosztuje bilet?',
      tip: 'much z „a”: „macz”. is a się zlewa: „y-ze”.',
      sit: 'Jesteś w kasie na dworcu. Zapytaj, ile kosztuje bilet.',
    },
    'e4-09': {
      m: 'Kiedy odjeżdża następny pociąg?',
      tip: 'when z ł. leave z długim i i dźwięcznym v: „liw” – to nie live.',
      sit: 'Uciekł ci pociąg. Zapytaj, kiedy odjeżdża następny.',
    },
    'e4-10': {
      m: 'Może mi pan / pani pokazać na mapie?',
      tip: 'show to „szou”. map z otwartym a: „mæp”.',
      sit: 'Wyjaśnienie było niejasne. Poproś, żeby ktoś pokazał ci drogę na mapie.',
    },
    'e4-11': {
      m: '{Zgubiłem|Zgubiłam} się.',
      tip: 'lost to „last”, z otwartym „a”.',
      sit: 'Jesteś w nieznanej dzielnicy i nie wiesz, gdzie jesteś. Powiedz to przechodniowi.',
    },
    'e4-12': {
      m: 'Proszę mnie zawieźć pod ten adres.',
      tip: 'address po amerykańsku: „ÆD-res”, akcent na początku. take me się zlewa.',
      sit: 'Wsiadasz do taksówki i pokazujesz kierowcy kartkę. Poproś, żeby cię tam zawiózł.',
    },

    // --- e5: shopping ---
    'e5-01': {
      m: 'Ile to kosztuje?',
      tip: 'this na końcu – dźwięczne th: „dhys”. is this się zlewa: „yz-dhys”.',
      sit: 'Trzymasz koszulę bez metki. Zapytaj, ile kosztuje.',
    },
    'e5-02': {
      m: 'Tylko się rozglądam, dziękuję.',
      tip: 'looking to „LU-king” – g prawie niesłyszalne, nie „lukink”.',
      sit: 'Sprzedawczyni pyta, czy pomóc, a ty tylko się rozglądasz. Powiedz jej.',
    },
    'e5-03': {
      m: 'Czy jest to w mniejszym rozmiarze?',
      tip: 'size z „aj” i dźwięcznym z: „sajz”, nie „sajs”. smaller z r na końcu.',
      sit: 'Koszula jest za duża. Zapytaj o mniejszy rozmiar.',
    },
    'e5-04': {
      m: 'Czy mogę przymierzyć?',
      tip: 'try it on zlewa się całkowicie: „traj-y-DAN”. try z amerykańskim r.',
      sit: 'Wpadły ci w oko dżinsy. Zapytaj, czy można je przymierzyć.',
    },
    'e5-05': {
      m: 'To jest za drogie.',
      tip: 'expensive – akcent w środku: „eks-PEN-syw”, i dźwięczne v na końcu.',
      sit: 'Płaszcz jest ładny, ale za drogi. Powiedz to.',
    },
    'e5-06': {
      m: 'Czy jest coś tańszego?',
      tip: 'anything z bezdźwięcznym th: „E-ni-thing”. cheaper z długim i: „CZI-per”.',
      sit: 'Cena jest dla ciebie za wysoka. Zapytaj o coś tańszego.',
    },
    'e5-07': {
      m: 'Biorę to.',
      tip: 'take it się zlewa: „TEJ-kyt”.',
      sit: 'Decydujesz się na torbę. Powiedz sprzedawcy.',
    },
    'e5-08': {
      m: 'Gdzie mogę zapłacić?',
      tip: 'where z ł, can jest słabe: „ken”.',
      sit: 'Jesteś w dużym sklepie z towarem w ręku. Zapytaj, gdzie się płaci.',
    },
    'e5-09': {
      m: 'Mogę prosić o torbę?',
      tip: 'bag z otwartym a: „bæg” – nie „beg” i nie „bek”.',
      sit: 'Masz dużo zakupów. Poproś o torbę.',
    },
    'e5-10': {
      m: 'Czy przyjmujecie karty kredytowe?',
      tip: 'credit to „KRE-dyt”, cards z dźwięcznym z: „kardz”.',
      sit: 'Jesteś przy straganie na targu i nie masz gotówki. Zapytaj, czy przyjmują karty.',
    },
    'e5-11': {
      m: 'Czy mogę to zwrócić?',
      tip: 'return – akcent na końcu: „ri-TERN”. return it się zlewa.',
      sit: 'Zanim kupisz, zapytaj, czy można zwrócić towar.',
    },
    'e5-12': {
      m: 'Czy jest jakaś zniżka?',
      tip: 'there z dźwięcznym th: „dher”. discount – akcent na początku: „DYS-kałnt”.',
      sit: 'Kupujesz trzy rzeczy. Zapytaj o zniżkę.',
    },

    // --- e6: hotel, flight and phone ---
    'e6-01': {
      m: 'Mam rezerwację.',
      tip: 'reservation – akcent na va: „re-zer-WEJ-szen”. have a się zlewa: „hæ-we”.',
      sit: 'Podchodzisz do recepcji w hotelu. Powiedz, że masz rezerwację.',
    },
    'e6-02': {
      m: 'O której jest wymeldowanie?',
      tip: 'check-out – akcent na check. what time się zlewa: „łat-TAJM”.',
      sit: 'Wyjeżdżasz jutro. Zapytaj, do której trzeba zwolnić pokój.',
    },
    'e6-03': {
      m: 'Czy śniadanie jest wliczone?',
      tip: 'breakfast to „BREK-fest” – nie „brejk-fast”. included – akcent na clu.',
      sit: 'Meldujesz się w hotelu. Zapytaj, czy śniadanie jest w cenie.',
    },
    'e6-04': {
      m: 'Klimatyzacja nie działa.',
      tip: 'isn’t to „Y-zent”, working z amerykańskim „er”: „ŁER-king”.',
      sit: 'W pokoju jest bardzo gorąco, a klimatyzacja nie działa. Zadzwoń do recepcji i powiedz to.',
    },
    'e6-05': {
      m: 'Czy mogę wymeldować się później?',
      tip: 'late z „ej”: „lejt”. get a się zlewa: „ge-de”.',
      sit: 'Masz lot wieczorem. Poproś o późniejsze wymeldowanie.',
    },
    'e6-06': {
      m: 'Gdzie jest bramka numer dwanaście?',
      tip: 'gate to „gejt”. twelve z ł i dźwięcznym v: „tłelw”.',
      sit: 'Jesteś na lotnisku i szukasz swojej bramki – numer 12. Zapytaj.',
    },
    'e6-07': {
      m: 'Mój lot jest opóźniony.',
      tip: 'flight z „aj”: „flajt”. delayed – akcent na końcu: „di-LEJD”.',
      sit: 'Dzwonisz do znajomego, który na ciebie czeka. Powiedz, że lot jest opóźniony.',
    },
    'e6-08': {
      m: 'Poproszę miejsce przy oknie.',
      tip: 'window z ł: „ŁYN-dou”. seat z długim i – nie sit.',
      sit: 'Jesteś przy odprawie. Poproś o miejsce przy oknie.',
    },
    'e6-09': {
      m: 'Dzień dobry, tu {name}.',
      tip: 'Przez telefon mówi się this is, a nie I am. this z dźwięcznym th.',
      sit: 'Dzwonisz do biura za granicą. Przedstaw się z imienia.',
      note: 'Przez telefon przedstawiasz się słowami This is…, a nie I am…',
    },
    'e6-10': {
      m: 'Czy mogę rozmawiać z Michaelem?',
      tip: 'Michael to „MAJ-kel” – nie „Michał”. speak z długim i.',
      sit: 'Odbiera sekretarka. Poproś o rozmowę z Michaelem.',
    },
    'e6-11': {
      m: 'Czy może pan / pani oddzwonić?',
      tip: 'call to „kol”. back z otwartym a: „bæk”.',
      sit: 'Jesteś w trakcie spotkania. Poproś dzwoniącego, żeby oddzwonił.',
    },
    'e6-12': {
      m: 'Wyślę ci maila.',
      tip: 'email to „I-mejl”, akcent na początku. an email się zlewa: „e-NI-mejl”.',
      sit: 'Kończycie rozmowę, a ty chcesz wysłać szczegóły. Powiedz, że wyślesz maila.',
    },
    'e6-13': {
      m: 'Umówmy się na spotkanie.',
      tip: 'Let’s to „lets”. set up a się zlewa: „se-da-pe”. meeting z długim i.',
      sit: 'Chcesz kontynuować rozmowę z klientem osobiście. Zaproponuj spotkanie.',
    },
    'e6-14': {
      m: 'Przepraszam, spóźnię się.',
      tip: 'running to „RA-ning” z amerykańskim r. late z „ej”.',
      sit: 'Stoisz w korku w drodze na spotkanie. Nagraj wiadomość, że się spóźnisz.',
    },
  },

  roleplays: {
    'nyc-coffee': {
      title: 'Kawiarnia w Nowym Jorku',
      setting: 'Stoisz w kolejce w kawiarni na Manhattanie. Barista mówi szybko i czeka na zamówienie – odpowiadaj krótko i wyraźnie.',
      partner: 'Barista',
      turns: [
        {
          line: 'Cześć! Co podać?',
          options: [
            ['Poproszę kawę.', 'Idealnie – Can I get… to zwykły sposób zamawiania w Ameryce.'],
            ['Daj mi kawę.', 'Give me bez please brzmi po angielsku niegrzecznie. Powiedz Can I get… please.'],
          ],
        },
        {
          line: 'Jasne. Na miejscu czy na wynos?',
          options: [
            ['Na wynos, proszę.', 'Dobrze! To go = na wynos.'],
            ['Tak, proszę.', 'To pytanie „albo–albo”: odpowiada się For here albo To go.'],
          ],
        },
        {
          line: 'Jaki rozmiar?',
          options: [
            ['Mała, proszę.', 'Krótko i jasno.'],
            ['Trzy, proszę.', 'Pytano o rozmiar, nie o liczbę. Powiedz Small, Medium albo Large.'],
          ],
        },
        {
          line: 'Coś jeszcze?',
          options: [
            ['Nie, to wszystko. Dziękuję!', 'Świetnie – That’s it = „to wszystko”.'],
            ['Do zobaczenia później!', 'To pożegnanie, a nie odpowiedź. Powiedz No, that’s it.'],
          ],
        },
        {
          line: 'Cztery pięćdziesiąt.',
          options: [
            ['Czy mogę zapłacić kartą?', 'Dobrze. ($4.50 mówi się four fifty.)'],
            ['To było pyszne!', 'Kawa jeszcze nie wypita… najpierw się płaci.'],
          ],
        },
      ],
    },
    'hotel-check-in': {
      title: 'Zameldowanie w hotelu',
      setting: 'Przyjeżdżasz do hotelu w Chicago po długim locie. Recepcjonistka jest miła – mów uprzejmie.',
      partner: 'Recepcjonistka',
      turns: [
        {
          line: 'Dobry wieczór! Zameldowanie?',
          options: [
            ['Tak, mam rezerwację.', 'Idealnie.'],
            ['Nie, tylko się rozglądam.', 'Tak mówi się w sklepie, nie w recepcji hotelu.'],
          ],
        },
        {
          line: 'Mogę prosić o nazwisko?',
          options: [
            ['Nazywam się {name}.', 'Dobrze.'],
            ['Miło mi.', 'Pytano o twoje nazwisko – powiedz My name is…'],
          ],
        },
        {
          line: 'Dziękuję. Pokój czterysta dwanaście.',
          options: [
            ['Czy śniadanie jest wliczone?', 'Dobre i przydatne pytanie.'],
            ['Czy to ostre?', 'To pytanie do restauracji, nie do recepcji.'],
          ],
        },
        {
          line: 'Tak, od siódmej do dziesiątej.',
          options: [
            ['O której jest wymeldowanie?', 'Świetnie – warto wiedzieć wcześniej.'],
            ['Proszę iść prosto i skręcić w lewo.', 'To wskazówki, jak dojść – tu nie pasują.'],
          ],
        },
        {
          line: 'O jedenastej. Miłego pobytu!',
          options: [
            ['Bardzo dziękuję!', 'Uprzejme pożegnanie.'],
            ['Biorę to.', 'Tak mówi się przy kupowaniu.'],
          ],
        },
      ],
    },
    'street-directions': {
      title: 'Pytanie o drogę',
      setting: 'Jesteś w San Francisco i szukasz apteki. Zaczepiasz kogoś na ulicy – zacznij od Excuse me.',
      partner: 'Przechodzień',
      turns: [
        {
          line: 'Cześć! Mogę jakoś pomóc?',
          options: [
            ['Przepraszam, czy jest tu w pobliżu apteka?', 'Uprzejmie i konkretnie.'],
            ['Wszystko dobrze, dzięki.', 'Zaproponował pomoc – a jej właśnie potrzebujesz. Zapytaj o aptekę.'],
          ],
        },
        {
          line: 'Tak. Proszę iść prosto i na rogu skręcić w prawo.',
          options: [
            ['Czy to daleko stąd?', 'Naturalne pytanie.'],
            ['Czy mogę przymierzyć?', 'Tak pyta się w sklepie z ubraniami.'],
          ],
        },
        {
          line: 'Nie, to pięć minut pieszo.',
          options: [
            ['Może mi pan pokazać na mapie?', 'Świetnie – tak się nie zgubisz.'],
            ['Reszty nie trzeba.', 'Tak mówi się przy płaceniu.'],
          ],
        },
        {
          line: 'Jasne. To tutaj, po lewej.',
          options: [
            ['Bardzo dziękuję! Miłego dnia!', 'Ciepłe i uprzejme pożegnanie.'],
            ['Skąd pan jest?', 'Miłe pytanie, ale on już skończył pomagać – podziękuj mu.'],
          ],
        },
      ],
    },
  },

  pairs: {
    'en-th': {
      a: 'th: czubek języka między zębami i dmuchnij. think, three, thank.',
      b: 'Zwykłe s i t: język za zębami. Powiesz „sink” zamiast think – usłyszą sink (zlew).',
    },
    'en-wv': {
      a: 'w: to polskie ł – usta zaokrąglone, zęby nie dotykają wargi.',
      b: 'v: to polskie w – górne zęby na dolnej wardze, z głosem.',
    },
    'en-ih-ee': {
      a: 'Krótkie i: prawie jak polskie y – krótko i luźno, bez uśmiechu.',
      b: 'Długie i: uśmiechnij się i przeciągnij – „iii”.',
    },
    'en-ae-e': {
      a: 'a w bad: szeroko otwórz usta i opuść żuchwę – dźwięk między a i e.',
      b: 'e w bed: zwykłe polskie e.',
    },
  },

  words: {
    think: 'myśleć',
    sink: 'zlew / tonąć',
    three: 'trzy',
    tree: 'drzewo',
    thank: 'dziękować',
    tank: 'zbiornik / czołg',
    mouth: 'usta',
    mouse: 'mysz',
    west: 'zachód',
    vest: 'kamizelka',
    wine: 'wino',
    vine: 'winorośl',
    wet: 'mokry',
    vet: 'weterynarz',
    worse: 'gorszy',
    verse: 'zwrotka',
    ship: 'statek',
    sheep: 'owca',
    live: 'mieszkać',
    leave: 'wyjeżdżać',
    sit: 'siedzieć',
    seat: 'miejsce (siedzenie)',
    fill: 'napełniać',
    feel: 'czuć',
    bad: 'zły',
    bed: 'łóżko',
    man: 'mężczyzna',
    men: 'mężczyźni',
    sad: 'smutny',
    said: 'powiedział',
    pan: 'patelnia',
    pen: 'długopis',
  },

  legend: {
    'th (think)': { sound: 'th', note: 'język między zębami, bez głosu' },
    'th (this)': { sound: 'dh', note: 'język między zębami, z głosem' },
    w: { sound: 'ł', note: 'jak polskie ł – zaokrąglone usta' },
    v: { sound: 'w', note: 'jak polskie w' },
    b: { sound: 'b', note: 'b' },
    r: { sound: 'r', note: 'amerykańskie r – język zawinięty, bez drgania' },
    'i (ship)': { sound: 'y', note: 'krótkie i – prawie jak polskie y' },
    'ee (sheep)': { sound: 'i', note: 'długie i; s, z, c, n przed nim czytaj twardo' },
    'a (bad)': { sound: 'æ', note: 'otwarte a – żuchwa w dół, między a i e' },
    'e (bed)': { sound: 'e', note: 'zwykłe e, także słabe, nieakcentowane' },
    'u (cup), o (hot)': { sound: 'a', note: 'krótkie a' },
    'er (work)': { sound: 'er', note: 'amerykańskie „er” – bez drgającego r' },
    'o (go)': { sound: 'ou', note: 'o przechodzące w u' },
    oo: { sound: 'u', note: 'u' },
    'ay / ai': { sound: 'ej', note: 'ej' },
    'I / my': { sound: 'aj', note: 'aj' },
    'ch / j': { sound: 'cz / dż', note: 'jak po polsku' },
  },
};
