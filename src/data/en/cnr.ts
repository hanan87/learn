import type { EnLocal } from './local';

/**
 * Everyday English for Montenegrin speakers: meanings, tips and situations in Montenegrin
 * (standard Ijekavian Latin – gdje, sjutra, kafa; the learner is addressed with the polite "vi").
 * Respellings inside tips use the letters of lib/latinRespell (th, dh, w, v, š, č, dž, ii = long ee
 * in a stressed syllable, æ = the open a of "bad", stressed syllable in capitals).
 * Tips focus on what Montenegrin speakers get wrong: th, w (which our language lacks), the open a,
 * short vs long i, the American r and English word stress.
 *
 * REVIEW: not yet checked by a native speaker.
 */
export const EN_CNR: EnLocal = {
  units: {
    e1: {
      title: 'Glasovi kojih nema u našem jeziku',
      subtitle: 'th, w i v, američko r, ship i sheep, bad i bed',
      description:
        'Većina nas razumije engleski – akcenat odaju glasovi kojih nema u crnogorskom: th (jezik između zuba), w koje nije v, američko r koje ne treperi, kratko i i dugo ii (ship / sheep) i otvoreno a iz „bad”. U ovoj cjelini vježbate ih na svakodnevnim riječima, zajedno sa naglaskom.',
    },
    e2: {
      title: 'Upoznavanje i ćaskanje',
      subtitle: 'Kako ste, odakle ste, čime se bavite',
      description:
        'Prvi minuti svakog razgovora: pozdravi, predstavljanje, pitanje odakle je neko i čime se bavi, i učtiva molba da ponovi ili govori sporije. Pažnja: „How are you?” je pozdrav, a ne pitanje o zdravlju.',
    },
    e3: {
      title: 'Kafić i restoran',
      subtitle: 'Naručivanje, molbe, pitanja i plaćanje',
      description:
        'Sto i kafa, pitanje šta preporučuju, molba „bez luka” i na kraju račun. U Americi se učtivo traži – „Can I get…” i „I’d like…” – i ostavlja 15–20% bakšiša.',
    },
    e4: {
      title: 'Pravci i prevoz',
      subtitle: 'Gdje je, kako se stiže, karta za voz',
      description:
        'Pitanje gdje je stanica, razumijevanje „pravo pa lijevo”, kupovina karte, pitanje kad ide sljedeći voz – i adresa za taksistu. Skoro svako pitanje ovdje počinje sa „Excuse me”.',
    },
    e5: {
      title: 'Kupovina',
      subtitle: 'Koliko košta, veličina, probanje i vraćanje',
      description:
        'Pitanje za cijenu, molba za drugu veličinu, probanje, blago cjenkanje – i vraćanje robe. U Americi cijena na polici ne uključuje porez, pa je na kasi malo veća.',
    },
    e6: {
      title: 'Hotel, let i telefon',
      subtitle: 'Prijava u hotel, kašnjenje leta, poslovni poziv',
      description:
        'Prijava u hotel, pitanje o doručku, učtiva žalba kad nešto ne radi; na aerodromu – izlaz, kašnjenje i mjesto do prozora; a telefonom – predstavljanje, molba da razgovarate sa nekim i dogovor za sastanak.',
    },
  },

  items: {
    // --- e1: the sounds our language does not have ---
    'e1-01': {
      m: 'misliti',
      tip: 'th: vrh jezika između zuba i dunite – ne „sink” ni „tink”. Kratko i: „think”.',
      sit: 'Neko vas pita za odluku, a vama treba vremena. Recite „misliti”.',
    },
    'e1-02': {
      m: 'Hvala!',
      tip: 'Bezvučno th na početku, a otvoreno kao u „bad”: „thænk”. you se spaja: „THÆNK-ju”. Ne „tenk ju”.',
      sit: 'Konobarica vam je donijela kafu. Zahvalite joj.',
    },
    'e1-03': {
      m: 'ovaj (ovo ovdje)',
      tip: 'th u this je zvučno – jezik između zuba, glasne žice trepere: „dhis”, ne „dis” ni „zis”.',
      sit: 'Pokazujete kolač u vitrini. Recite „ovaj”.',
    },
    'e1-04': {
      m: 'tri',
      tip: 'three počinje bezvučnim th, pa r: „thrii”. Ako kažete „tri”, čuće tree (drvo).',
      sit: 'Pitaju koliko vam karata treba – tri. Recite broj.',
    },
    'e1-05': {
      m: 'voda',
      tip: 'w na početku: usne zaokružene, zubi ne dodiruju usnu – ne „voter”. Američko t u sredini zvuči skoro kao brzo d: „WA-der”.',
      sit: 'Žedni ste u restoranu. Zatražite vodu jednom riječju.',
    },
    'e1-06': {
      m: 'vrlo dobro',
      tip: 'very počinje sa v (zubi na usni), well sa w (zaokružene usne): „VE-ri WEL”. U tome je cijela razlika – recite polako.',
      sit: 'Pitaju kako je bilo putovanje. Odgovorite „vrlo dobro”.',
    },
    'e1-07': {
      m: 'brod',
      tip: 'Kratko i, opušteno: „šip”. Ako ga produžite („šiip”), rekli ste sheep (ovca).',
      sit: 'U luci ste i pokazujete kruzer. Recite „brod”.',
    },
    'e1-08': {
      m: 'ovca (ovce)',
      tip: 'Dugo i – nasmiješite se i produžite: „šiip”. Uporedite sa kratkim ship („šip”).',
      sit: 'Na izletu u Engleskoj dijete pita kakve su to bijele životinje na livadi. Odgovorite „ovce”.',
    },
    'e1-09': {
      m: 'živjeti',
      tip: 'live (živjeti) ima kratko i: „liv”; leave (otići) dugo: „liiv”. Na kraju zvučno v – ne „lif”.',
      sit: 'Pitaju vas da li ste ovdje na odmoru ili ovdje živite. Recite glagol „živjeti”.',
    },
    'e1-10': {
      m: 'loš (loše)',
      tip: 'a u bad je vrlo otvoreno – spustite vilicu, između a i e: „bæd”. bed (krevet) je obično „bed”.',
      sit: 'Pitaju kakvo je bilo vrijeme, a bilo je užasno. Recite „loše”.',
    },
    'e1-11': {
      m: 'svijet',
      tip: 'Jedna od težih riječi: w (zaokružene usne), pa američko „er” (savijen jezik), pa l i d: „werld”. Bez treperavog r.',
      sit: 'Pričate o putovanjima i želite da kažete „svijet”. Recite tu riječ.',
    },
    'e1-12': {
      m: 'udoban',
      tip: 'Naglasak je na prvom slogu, a sredina se guta: „KAMF-ter-bel” – tri sloga, ne četiri.',
      sit: 'U prodavnici vas pitaju kako vam stoje cipele. Recite da su udobne.',
    },
    'e1-13': {
      m: 'Mogu li da postavim pitanje?',
      tip: 'Riječi se spajaju: „ke-NAJ æsk e KWES-čen”. can je nenaglašeno, question sa „kw” i „čen” na kraju.',
      sit: 'Na kraju ste predavanja i želite nešto da pitate. Zamolite za dozvolu.',
    },

    // --- e2: meeting people and small talk ---
    'e2-01': {
      m: 'Zdravo, kako si?',
      tip: 'U jednom dahu, sa blagim podizanjem na kraju: „haj, hau ar ju”. are skoro nestaje.',
      sit: 'Ujutru srećete kolegu u hodniku. Pozdravite ga i pitajte kako je.',
      note: 'How are you? je pozdrav – odgovara se kratko (Fine, thanks), bez priče o glavobolji.',
    },
    'e2-02': {
      m: 'Dobro sam, hvala. A ti?',
      tip: 'I’m je jedan slog: „ajm”. thanks sa th i otvorenim a: „thænks”. Na And you? glas ide gore.',
      sit: 'Pitaju vas kako ste. Odgovorite da ste dobro, zahvalite i pitajte isto.',
    },
    'e2-03': {
      m: 'Drago mi je.',
      tip: 'Spajajte: „najs te miit ju” – to je vrlo slabo, a meet you zvuči skoro kao „mii-ču”.',
      sit: 'Prijatelj vas je upoznao sa svojom ženom. Recite da vam je drago.',
    },
    'e2-04': {
      m: 'Zovem se {name}.',
      tip: 'name sa dugim „ej”: „nejm”. Naglasak je na vašem imenu na kraju.',
      sit: 'Na konferenciji vas pitaju kako se zovete. Predstavite se.',
    },
    'e2-05': {
      m: 'Odakle si?',
      tip: 'where počinje sa w: „wer” – ne „ver”. from na kraju je slabo: „wer-ju-FRAM”.',
      sit: 'U hostelu ste upoznali turistu. Pitajte ga odakle je.',
    },
    'e2-06': {
      m: 'Ja sam iz Izraela.',
      tip: 'Na engleskom: „IZ-ri-el”, sa naglaskom na prvom slogu – ne „iz-ra-EL”.',
      sit: 'Igrate ulogu turiste iz Izraela. Pitaju odakle ste – odgovorite.',
    },
    'e2-07': {
      m: 'Čime se baviš?',
      tip: 'Izgovara se brzo: „wat-dje-DU”. Naglasak je na posljednjem do.',
      sit: 'Na žurci razgovarate sa nekim novim. Pitajte čime se bavi.',
      note: 'What do you do? znači „čime se baviš (koji ti je posao)”, a ne „šta sad radiš”.',
    },
    'e2-08': {
      m: 'Radim u IT sektoru.',
      tip: 'work: w, pa američko „er” – „werk”, ne „vork”. tech je „tek”.',
      sit: 'Pitaju vas gdje radite. Recite da radite u IT-u.',
      note: 'Amerikanci kažu in tech za cijelu tehnološku industriju.',
    },
    'e2-09': {
      m: 'Koliko si već ovdje?',
      tip: 'have you been se spaja: „hæv-ju-bin”. Amerikanci kažu been kratko: „bin”.',
      sit: 'U Njujorku srećete zemljaka. Pitajte koliko je već tu.',
    },
    'e2-10': {
      m: 'Samo nekoliko dana.',
      tip: 'few je „fju”, days sa „ej” i zvučnim z na kraju: „dejz”.',
      sit: 'Pitaju koliko ste u gradu. Odgovorite da ste samo nekoliko dana.',
    },
    'e2-11': {
      m: 'Izvinite, možete li to ponoviti?',
      tip: 'could you zvuči „ku-džu”. again na američkom: „e-GEN”, naglasak na gen.',
      sit: 'Nijeste čuli šta je službenik rekao. Učtivo ga zamolite da ponovi.',
    },
    'e2-12': {
      m: 'Možete li govoriti malo sporije, molim vas?',
      tip: 'little na američkom: t zvuči kao brzo d – „LI-del”. slower sa „ou” i r na kraju.',
      sit: 'Prodavac govori prebrzo. Učtivo ga zamolite da govori sporije.',
    },
    'e2-13': {
      m: 'Vidimo se kasnije!',
      tip: 'later na američkom: „LEJ-der”, t meko kao d.',
      sit: 'Pozdravljate se sa prijateljem kojeg ćete vidjeti uveče. Recite „vidimo se”.',
    },
    'e2-14': {
      m: 'Prijatan dan!',
      tip: 'have a se spaja: „hæ-ve-NAJS-dej”. v u have je zvučno.',
      sit: 'Izlazite iz prodavnice. Poželite prodavačici prijatan dan.',
    },

    // --- e3: café and restaurant ---
    'e3-01': {
      m: 'Mogu li dobiti kafu, molim vas?',
      tip: 'Can I get a zvuči „ke-NAJ-ge-de”. coffee na američkom: „KA-fi”, naglasak na početku.',
      sit: 'Na šanku ste u kafiću u Njujorku. Naručite kafu.',
      note: 'U Americi je Can I get… uobičajen način naručivanja – ne zvuči nepristojno.',
    },
    'e3-02': {
      m: '{Želio|Željela} bih sto za dvoje.',
      tip: 'I’d je „ajd”. table sa „ej”: „TEJ-bel”. for two brzo: „fer-TU”.',
      sit: 'Ulazite u restoran sa partnerom ili partnerkom. Zatražite sto za dvoje.',
    },
    'e3-03': {
      m: 'Možemo li da vidimo meni?',
      tip: 'menu je „MEN-ju”, naglasak na me. the je slabo, sa zvučnim th: „dhe”.',
      sit: 'Sjeli ste, a jelovnik još nijeste dobili. Zatražite ga.',
    },
    'e3-04': {
      m: 'Šta preporučujete?',
      tip: 'recommend – naglasak na kraju: „re-ke-MEND”. Američko r na početku, bez treperenja.',
      sit: 'Ne znate šta da naručite. Pitajte konobara šta preporučuje.',
    },
    'e3-05': {
      m: 'Uzeću salatu s piletinom.',
      tip: 'I’ll je „ajl”. chicken: „ČI-ken” sa kratkim i. salad sa otvorenim a: „SÆ-led”.',
      sit: 'Konobar čeka narudžbu. Naručite salatu s piletinom.',
      note: 'I’ll have… je prirodan način naručivanja u restoranu.',
    },
    'e3-06': {
      m: 'Bez luka, molim.',
      tip: 'onions je „AN-jenz” – počinje kao „a”, ne „o”. s na kraju zvuči kao z.',
      sit: 'Ne jedete luk. Zatražite jelo bez luka.',
    },
    'e3-07': {
      m: 'Mogu li dobiti malo vode?',
      tip: 'have some se spaja: „hæv-sam”. water sa w i mekim t: „WA-der”.',
      sit: 'Popili ste piće. Zatražite vode.',
    },
    'e3-08': {
      m: 'Da li je ljuto?',
      tip: 'Is it se spaja: „i-zit”. spicy sa „aj”: „SPAJ-si”.',
      sit: 'U jelovniku je jelo sa feferonom. Pitajte da li je ljuto.',
    },
    'e3-09': {
      m: 'Bilo je ukusno!',
      tip: 'delicious – naglasak u sredini: „de-LI-šes”. was je slabo: „wez”.',
      sit: 'Konobarica pita kako je bilo jelo. Recite da je bilo ukusno.',
    },
    'e3-10': {
      m: 'Možemo li dobiti račun, molim vas?',
      tip: 'check je „ček”. Britanci kažu the bill, Amerikanci the check.',
      sit: 'Završili ste jelo i žurite. Zatražite račun.',
    },
    'e3-11': {
      m: 'Mogu li platiti karticom?',
      tip: 'pay je „pej”, card sa američkim r: „kard”.',
      sit: 'Nemate gotovine. Pitajte da li može karticom.',
    },
    'e3-12': {
      m: 'Zadržite kusur.',
      tip: 'change je „čejndž” – dž na kraju.',
      sit: 'Platili ste gotovinom i slijedi vam malo kusura. Recite konobaru da ga zadrži.',
      note: 'U američkom restoranu bakšiš (15–20%) nije uračunat u cijenu.',
    },

    // --- e4: directions and transport ---
    'e4-01': {
      m: 'Izvinite, gdje je željeznička stanica?',
      tip: 'excuse me je „eks-KJUZ-mi”, naglasak na cuse. station: „STEJ-šen”.',
      sit: 'Izašli ste iz hotela i ne znate kako do stanice. Pitajte prolaznicu.',
    },
    'e4-02': {
      m: 'Da li je daleko odavde?',
      tip: 'far i here završavaju se američkim r: „far”, „hiir” – r bez treperenja.',
      sit: 'Objasnili su vam gdje je muzej. Pitajte da li je daleko.',
    },
    'e4-03': {
      m: 'Idite pravo pa skrenite lijevo.',
      tip: 'straight je „strejt”. turn sa „er”: „tern”. left sa kratkim e.',
      sit: 'Turista vas pita kako do plaže. Objasnite: pravo, pa lijevo.',
    },
    'e4-04': {
      m: 'Desno je.',
      tip: 'right počinje američkim r – savijen jezik, bez treperenja: „rajt”.',
      sit: 'Neko traži banku, a ona je desno. Recite mu.',
    },
    'e4-05': {
      m: 'Kako da stignem do aerodroma?',
      tip: 'airport je „ER-port”, naglasak na početku. get to se spaja: „ge-de”.',
      sit: 'U hotelu ste, a sjutra letite. Pitajte na recepciji kako do aerodroma.',
    },
    'e4-06': {
      m: 'Koji autobus ide u centar?',
      tip: 'which sa w: „wič”. bus sa „a”: „bas”. downtown – naglasak na kraju.',
      sit: 'Na autobuskoj ste stanici. Pitajte koji autobus ide u centar.',
      note: 'downtown je centar grada u Americi (u Engleskoj: the city centre).',
    },
    'e4-07': {
      m: 'Jednu kartu, molim.',
      tip: 'one zvuči „wan” – sa w, ne „van”. ticket: „TI-ket” sa kratkim i.',
      sit: 'Na blagajni ste. Zatražite jednu kartu.',
    },
    'e4-08': {
      m: 'Koliko košta karta?',
      tip: 'much sa „a”: „mač”. is a se spaja: „i-ze”.',
      sit: 'Na blagajni ste na stanici. Pitajte koliko košta karta.',
    },
    'e4-09': {
      m: 'Kad polazi sljedeći voz?',
      tip: 'when sa w. leave sa dugim i i v na kraju: „liiv” – nije live.',
      sit: 'Propustili ste voz. Pitajte kad polazi sljedeći.',
    },
    'e4-10': {
      m: 'Možete li mi pokazati na mapi?',
      tip: 'show je „šou”. map sa otvorenim a: „mæp”.',
      sit: 'Nijeste razumjeli objašnjenje. Zamolite da vam pokažu na mapi.',
    },
    'e4-11': {
      m: '{Izgubio|Izgubila} sam se.',
      tip: 'lost je „last”, sa otvorenim „a”.',
      sit: 'U nepoznatom ste kraju i ne znate gdje ste. Recite to prolaznici.',
    },
    'e4-12': {
      m: 'Molim vas, odvezite me na ovu adresu.',
      tip: 'address na američkom: „ÆD-res”, naglasak na početku. take me se spaja.',
      sit: 'Ušli ste u taksi i pokazujete vozaču papirić. Zamolite da vas odveze na adresu.',
    },

    // --- e5: shopping ---
    'e5-01': {
      m: 'Koliko ovo košta?',
      tip: 'this na kraju – zvučno th: „dhis”. is this se spaja: „iz-dhis”.',
      sit: 'Držite košulju bez cijene. Pitajte koliko košta.',
    },
    'e5-02': {
      m: 'Samo razgledam, hvala.',
      tip: 'looking je „LU-king” – g se skoro ne čuje.',
      sit: 'Prodavačica pita može li pomoći, a vi samo razgledate. Recite joj.',
    },
    'e5-03': {
      m: 'Imate li ovo u manjoj veličini?',
      tip: 'size sa „aj” i z na kraju: „sajz”. smaller sa r na kraju.',
      sit: 'Košulja vam je velika. Pitajte imaju li manju veličinu.',
    },
    'e5-04': {
      m: 'Mogu li da probam?',
      tip: 'try it on se potpuno spaja: „traj-i-DAN”. try sa američkim r.',
      sit: 'Našli ste farmerke koje vam se sviđaju. Pitajte možete li da ih probate.',
    },
    'e5-05': {
      m: 'Preskupo je.',
      tip: 'expensive – naglasak u sredini: „eks-PEN-siv”, i v na kraju.',
      sit: 'Kaput je lijep, ali preskup. Recite to.',
    },
    'e5-06': {
      m: 'Imate li nešto jeftinije?',
      tip: 'anything sa bezvučnim th: „E-ni-thing”. cheaper sa dugim i: „ČII-per”.',
      sit: 'Cijena vam je visoka. Pitajte imaju li nešto jeftinije.',
    },
    'e5-07': {
      m: 'Uzeću to.',
      tip: 'take it se spaja: „TEJ-kit”.',
      sit: 'Odlučili ste da kupite torbu. Recite prodavcu.',
    },
    'e5-08': {
      m: 'Gdje mogu da platim?',
      tip: 'where sa w, can je slabo: „ken”.',
      sit: 'U velikoj ste prodavnici sa robom u rukama. Pitajte gdje se plaća.',
    },
    'e5-09': {
      m: 'Mogu li dobiti kesu?',
      tip: 'bag sa otvorenim a: „bæg” – ne „beg”.',
      sit: 'Kupili ste mnogo stvari. Zatražite kesu.',
    },
    'e5-10': {
      m: 'Primate li kreditne kartice?',
      tip: 'credit je „KRE-dit”, cards sa z na kraju: „kardz”.',
      sit: 'Kod tezge ste na pijaci i nemate gotovine. Pitajte primaju li kartice.',
    },
    'e5-11': {
      m: 'Mogu li to vratiti?',
      tip: 'return – naglasak na kraju: „ri-TERN”. return it se spaja.',
      sit: 'Prije kupovine pitajte može li se roba vratiti.',
    },
    'e5-12': {
      m: 'Ima li popusta?',
      tip: 'there sa zvučnim th: „dher”. discount – naglasak na početku: „DIS-kaunt”.',
      sit: 'Kupujete tri stvari. Pitajte ima li popusta.',
    },

    // --- e6: hotel, flight and phone ---
    'e6-01': {
      m: 'Imam rezervaciju.',
      tip: 'reservation – naglasak na va: „re-zer-VEJ-šen”. have a se spaja: „hæ-ve”.',
      sit: 'Na recepciji ste hotela. Recite da imate rezervaciju.',
    },
    'e6-02': {
      m: 'U koliko je odjava?',
      tip: 'check-out – naglasak na check. what time se spaja: „wat-TAJM”.',
      sit: 'Odlazite sjutra. Pitajte do kad treba osloboditi sobu.',
    },
    'e6-03': {
      m: 'Da li je doručak uključen?',
      tip: 'breakfast je „BREK-fest” – ne „brejk-fast”. included – naglasak na clu.',
      sit: 'Prijavljujete se u hotel. Pitajte da li je doručak uključen.',
    },
    'e6-04': {
      m: 'Klima ne radi.',
      tip: 'isn’t je „I-zent”, working sa američkim „er”: „WER-king”.',
      sit: 'U sobi je vrlo vruće, a klima ne radi. Pozovite recepciju i recite to.',
    },
    'e6-05': {
      m: 'Mogu li se odjaviti kasnije?',
      tip: 'late sa „ej”: „lejt”. get a se spaja: „ge-de”.',
      sit: 'Let vam je uveče. Zatražite da sobu napustite kasnije.',
    },
    'e6-06': {
      m: 'Gdje je izlaz broj dvanaest?',
      tip: 'gate je „gejt”. twelve sa w i v na kraju: „twelv”.',
      sit: 'Na aerodromu ste i tražite svoj izlaz, broj 12. Pitajte.',
    },
    'e6-07': {
      m: 'Moj let kasni.',
      tip: 'flight sa „aj”: „flajt”. delayed – naglasak na kraju: „di-LEJD”.',
      sit: 'Zovete prijatelja koji vas čeka. Recite da vam let kasni.',
    },
    'e6-08': {
      m: '{Želio|Željela} bih mjesto do prozora.',
      tip: 'window sa w: „WIN-dou”. seat sa dugim i – ne sit.',
      sit: 'Na šalteru za čekiranje ste. Zatražite mjesto do prozora.',
    },
    'e6-09': {
      m: 'Dobar dan, ovdje {name}.',
      tip: 'Telefonom se kaže this is, a ne I am. this sa zvučnim th.',
      sit: 'Zovete kancelariju u inostranstvu. Predstavite se imenom.',
      note: 'Telefonom se predstavljate sa This is…, a ne sa I am…',
    },
    'e6-10': {
      m: 'Mogu li razgovarati sa Majklom?',
      tip: 'Michael je „MAJ-kel” – ne „Mihael”. speak sa dugim i.',
      sit: 'Javlja se sekretarica. Zamolite da razgovarate sa Majklom.',
    },
    'e6-11': {
      m: 'Možete li me pozvati kasnije?',
      tip: 'call je „kol”. back sa otvorenim a: „bæk”.',
      sit: 'Usred sastanka ste. Zamolite osobu da vas pozove kasnije.',
    },
    'e6-12': {
      m: 'Poslaću vam mejl.',
      tip: 'email je „II-mejl”, naglasak na početku. an email se spaja: „e-NII-mejl”.',
      sit: 'Završavate razgovor i želite da pošaljete detalje. Recite da ćete poslati mejl.',
    },
    'e6-13': {
      m: 'Hajde da zakažemo sastanak.',
      tip: 'Let’s je „lets”. set up a se spaja: „se-da-pe”. meeting sa dugim i.',
      sit: 'Želite da nastavite razgovor sa klijentom uživo. Predložite sastanak.',
    },
    'e6-14': {
      m: 'Izvinite, kasnim.',
      tip: 'running je „RA-ning” sa američkim r. late sa „ej”.',
      sit: 'U gužvi ste na putu do sastanka. Pošaljite glasovnu poruku da kasnite.',
    },
  },

  roleplays: {
    'nyc-coffee': {
      title: 'Kafić u Njujorku',
      setting: 'Čekate u redu u kafiću na Menhetnu. Barista govori brzo i čeka narudžbu – odgovarajte kratko i jasno.',
      partner: 'Barista',
      turns: [
        {
          line: 'Zdravo! Šta da vam spremim?',
          options: [
            ['Mogu li dobiti kafu, molim vas?', 'Savršeno – Can I get… je uobičajen način naručivanja u Americi.'],
            ['Daj mi kafu.', 'Give me bez please na engleskom zvuči grubo. Recite Can I get… please.'],
          ],
        },
        {
          line: 'Naravno. Ovdje ili za ponijeti?',
          options: [
            ['Za ponijeti, molim.', 'Tačno! To go = za ponijeti.'],
            ['Da, molim.', 'To je pitanje „ili–ili”: odgovara se For here ili To go.'],
          ],
        },
        {
          line: 'Koja veličina?',
          options: [
            ['Mala, molim.', 'Kratko i jasno.'],
            ['Tri, molim.', 'Pitali su za veličinu, ne za broj. Recite Small, Medium ili Large.'],
          ],
        },
        {
          line: 'Još nešto?',
          options: [
            ['Ne, to je sve. Hvala!', 'Odlično – That’s it = „to je sve”.'],
            ['Vidimo se kasnije!', 'To je pozdrav, a ne odgovor. Recite No, that’s it.'],
          ],
        },
        {
          line: 'Četiri i pedeset.',
          options: [
            ['Mogu li platiti karticom?', 'Tačno. ($4.50 se kaže four fifty.)'],
            ['Bilo je ukusno!', 'Još je nijeste ni popili… prvo se plaća.'],
          ],
        },
      ],
    },
    'hotel-check-in': {
      title: 'Prijava u hotel',
      setting: 'Stigli ste u hotel u Čikagu nakon dugog leta. Recepcionerka je ljubazna – govorite učtivo.',
      partner: 'Recepcionerka',
      turns: [
        {
          line: 'Dobro veče! Prijava?',
          options: [
            ['Da, imam rezervaciju.', 'Savršeno.'],
            ['Ne, samo razgledam.', 'To se kaže u prodavnici, ne na recepciji hotela.'],
          ],
        },
        {
          line: 'Vaše ime, molim?',
          options: [
            ['Zovem se {name}.', 'Tačno.'],
            ['Drago mi je.', 'Pitali su za vaše ime – recite My name is…'],
          ],
        },
        {
          line: 'Hvala. Vaša soba je četiristo dvanaest.',
          options: [
            ['Da li je doručak uključen?', 'Dobro i korisno pitanje.'],
            ['Da li je ljuto?', 'To je pitanje za restoran, ne za recepciju.'],
          ],
        },
        {
          line: 'Da, od sedam do deset.',
          options: [
            ['U koliko je odjava?', 'Odlično – dobro je znati unaprijed.'],
            ['Idite pravo pa skrenite lijevo.', 'To su uputstva za put – ovdje ne pašu.'],
          ],
        },
        {
          line: 'U jedanaest. Uživajte u boravku!',
          options: [
            ['Hvala vam puno!', 'Učtiv pozdrav.'],
            ['Uzeću to.', 'To se kaže kad nešto kupujete.'],
          ],
        },
      ],
    },
    'street-directions': {
      title: 'Pitanje za put',
      setting: 'U San Francisku ste i tražite apoteku. Zaustavljate nekoga na ulici – počnite sa Excuse me.',
      partner: 'Prolaznik',
      turns: [
        {
          line: 'Zdravo! Mogu li da vam pomognem?',
          options: [
            ['Izvinite, ima li apoteka u blizini?', 'Učtivo i precizno.'],
            ['Dobro sam, hvala.', 'Ponudio je pomoć – a to vam baš treba. Pitajte za apoteku.'],
          ],
        },
        {
          line: 'Ima. Idite pravo pa na ćošku skrenite desno.',
          options: [
            ['Da li je daleko odavde?', 'Prirodno pitanje.'],
            ['Mogu li da probam?', 'To se pita u prodavnici odjeće.'],
          ],
        },
        {
          line: 'Nije, pet minuta pješke.',
          options: [
            ['Možete li mi pokazati na mapi?', 'Odlično – tako se nećete izgubiti.'],
            ['Zadržite kusur.', 'To se kaže pri plaćanju.'],
          ],
        },
        {
          line: 'Naravno. Evo ovdje, s lijeve strane.',
          options: [
            ['Hvala vam mnogo! Prijatan dan!', 'Topao i učtiv pozdrav.'],
            ['Odakle ste?', 'Lijepo pitanje, ali on je već pomogao – zahvalite mu.'],
          ],
        },
      ],
    },
  },

  pairs: {
    'en-th': {
      a: 'th: vrh jezika između zuba i dunite. think, three, thank.',
      b: 'Obično s i t: jezik iza zuba. Ako kažete „sink” umjesto think – čuće sink (sudopera).',
    },
    'en-wv': {
      a: 'w: usne se zaokruže kao za kratko „u” i otvore – zubi ne dodiruju usnu.',
      b: 'v: kao naše v – gornji zubi dodiruju donju usnu, sa glasom.',
    },
    'en-ih-ee': {
      a: 'Kratko i: kratko i opušteno, skoro bez osmijeha.',
      b: 'Dugo i: nasmiješite se i produžite – „iii”.',
    },
    'en-ae-e': {
      a: 'a u bad: široko otvorite usta i spustite vilicu – glas između a i e.',
      b: 'e u bed: obično naše e.',
    },
  },

  words: {
    think: 'misliti',
    sink: 'sudopera / tonuti',
    three: 'tri',
    tree: 'drvo',
    thank: 'zahvaliti',
    tank: 'rezervoar / tenk',
    mouth: 'usta',
    mouse: 'miš',
    west: 'zapad',
    vest: 'prsluk',
    wine: 'vino',
    vine: 'vinova loza',
    wet: 'mokar',
    vet: 'veterinar',
    worse: 'gori',
    verse: 'strofa',
    ship: 'brod',
    sheep: 'ovca',
    live: 'živjeti',
    leave: 'otići',
    sit: 'sjedjeti',
    seat: 'sjedište',
    fill: 'napuniti',
    feel: 'osjećati',
    bad: 'loš',
    bed: 'krevet',
    man: 'muškarac',
    men: 'muškarci',
    sad: 'tužan',
    said: 'rekao',
    pan: 'tiganj',
    pen: 'hemijska olovka',
  },

  legend: {
    'th (think)': { sound: 'th', note: 'jezik između zuba, bezvučno' },
    'th (this)': { sound: 'dh', note: 'jezik između zuba, zvučno' },
    w: { sound: 'w', note: 'zaokružene usne, zubi ne dodiruju usnu' },
    v: { sound: 'v', note: 'kao naše v' },
    b: { sound: 'b', note: 'b' },
    r: { sound: 'r', note: 'američko r – savijen jezik, bez treperenja' },
    'i (ship)': { sound: 'i', note: 'kratko i' },
    'ee (sheep)': { sound: 'ii', note: 'dugo i (piše se u naglašenom slogu)' },
    'a (bad)': { sound: 'æ', note: 'otvoreno a – vilica dolje, između a i e' },
    'e (bed)': { sound: 'e', note: 'obično e, i slabo nenaglašeno' },
    'u (cup), o (hot)': { sound: 'a', note: 'kratko a' },
    'er (work)': { sound: 'er', note: 'američko „er” – bez treperavog r' },
    'o (go)': { sound: 'ou', note: 'o koje prelazi u u' },
    oo: { sound: 'u', note: 'u' },
    'ay / ai': { sound: 'ej', note: 'ej' },
    'I / my': { sound: 'aj', note: 'aj' },
    'ch / j': { sound: 'č / dž', note: 'kao kod nas' },
  },
};
