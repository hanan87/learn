import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { checkStories } from './storyChecks';
import { autoBackchain, autoTip, detectSounds, inLexicon, lexiconEntries, stripNiqqud, toEnglishPhonetic, toSyllableNotation } from '../../src/lib/hePhonetics';
import { respellHebrewLatin } from '../../src/lib/latinRespell';
import { notationToPlain } from '../../src/lib/syllables';
import { heDigitsToWords, scorePronunciation } from '../../src/lib/pronScore';
import { checkWriting } from '../../src/lib/text';
import { uiText } from '../../src/i18n/strings';

/**
 * The Hebrew course for English, Polish and Montenegrin speakers: the vocalized lexicon and its
 * Latin transcription, the respelling for Polish and Montenegrin, scoring of Hebrew speech
 * recognition, and the course data in every interface language.
 */

const nfc = (s: string) => s.normalize('NFC');
const lat = (text: string) => toEnglishPhonetic(text);

describe('Hebrew phonetics', () => {
  it('splits vocalized words into syllables with stress, keeping punctuation', () => {
    expect(toSyllableNotation('תּוֹדָה רַבָּה!')).toBe(nfc('תּוֹ·[דָה] רַ·[בָּה]!'));
    expect(lat('תּוֹדָה רַבָּה!')).toBe('to·[da] ra·[ba]');
    expect(lat('שָׁלוֹם')).toBe('sha·[lom]');
  });

  it('reads the shva, silent letters and vowel letters from the niqqud', () => {
    // A shva that is a syllable of its own is a short e; inside a syllable it is silent.
    expect(lat('בְּבַקָּשָׁה')).toBe('be·va·ka·[sha]');
    expect(lat('סְלִיחָה')).toBe('sli·[kha]');
    expect(lat('שְׁמוֹנֶה')).toBe('shmo·[ne]');
    expect(lat('מַה נִּשְׁמָע')).toBe('ma nish·[ma]');
    // א ע and a final ה are silent; ַי ֵי are ai / ei.
    expect(lat('מְאוֹד')).toBe('me·[od]');
    expect(lat('לַיְלָה')).toBe('[lai]·la');
    expect(lat('אֵין')).toBe('[ein]');
    // בּ כּ פּ with a dagesh, ב כ פ without it.
    expect(lat('חֶשְׁבּוֹן')).toBe('khesh·[bon]');
    expect(lat('בְּכַרְטִיס')).toBe('be·khar·[tis]');
    expect(lat('סַבָּבָּה')).toBe('sa·[ba]·ba');
    // A patah under a final ח / ע is said before it.
    expect(lat('שָׂמֵחַ')).toBe('sa·[me]·akh');
    expect(lat('נוֹסֵעַ')).toBe('no·[se]·a');
  });

  it('keeps the learner templates', () => {
    expect(toSyllableNotation('אֲנִי {רוֹצֶה|רוֹצָה} עוֹד.')).toBe(nfc('אֲ·[נִי] {רוֹ·[צֶה]|רוֹ·[צָה]} [עוֹד].'));
    expect(lat('{אַתָּה רָעֵב|אַתְּ רְעֵבָה}?')).toBe('{a·[ta] ra·[ev]|[at] re·e·[va]}');
  });

  it('finds words written without niqqud, also behind prefixes, and marks guesses', () => {
    expect(lat('איפה התחנה?')).toBe('[ei]·fo ha·ta·kha·[na]');
    expect(lat('ושלום')).toBe('ve·sha·[lom]');
    expect(lat('תחנת')).toBe('ta·kha·[nat]');
    expect(lat('מסעדה')).toMatch(/^~/);
    expect(stripNiqqud('שָׁלוֹם')).toBe('שלום');
  });

  it('splits vocalized words outside the lexicon by rule', () => {
    expect(inLexicon('מִסְעָדָה')).toBe(false);
    expect(lat('מִסְעָדָה')).toBe('mis·a·[da]');
    // Segolates and -ayim / -ayit stress the syllable before the last.
    expect(lat('כֶּלֶב')).toBe('[ke]·lev');
    expect(lat('וְהַכֶּלֶב')).toBe('ve·ha·[ke]·lev');
    expect(lat('מַחְבֶּרֶת')).toBe('makh·[be]·ret');
    expect(lat('שֶׁמֶשׁ')).toBe('[she]·mesh');
    expect(lat('צָהֳרַיִם')).toMatch(/\[ra\]·yim$/);
    // A final silent ה leaves the syllable open: stress stays at the end.
    expect(lat('מוֹרֶה')).toBe('mo·[re]');
  });

  it('finds the hard sounds and builds tips in the learner’s letters', () => {
    expect(detectSounds('חַג שָׂמֵחַ')).toEqual(['kh']);
    expect(detectSounds('הָרַכֶּבֶת')).toEqual(['r', 'h']);
    expect(detectSounds('צָרִיךְ')).toEqual(['kh', 'r', 'ts']);
    // A final ה is silent.
    expect(detectSounds('תּוֹדָה')).toEqual([]);
    expect(autoTip('בּוֹקֶר טוֹב!', 'pl')).toContain('Akcent na: BO, TOW.');
    expect(autoTip('בּוֹקֶר טוֹב!', 'en')).toContain('not on the last syllable');
    expect(autoTip('שָׁלוֹם', 'cnr')).toBe('Naglasak je na: LOM.');
  });

  it('builds back-chaining steps from the end', () => {
    expect(autoBackchain('תּוֹדָה רַבָּה!')).toEqual(['רַבָּה', 'תּוֹדָה', 'תּוֹדָה רַבָּה']);
    expect(autoBackchain('בְּבַקָּשָׁה.').map(nfc)).toEqual(['שָׁה', 'קָּשָׁה', 'בְּבַקָּשָׁה'].map(nfc));
  });

  it('has a Latin transcription for every lexicon word with the same syllables', () => {
    for (const e of lexiconEntries()) {
      expect(e.lat.split('·').length, e.word).toBe(e.syl.split('·').length);
      expect(e.lat, e.word).toMatch(/^[a-z·[\]]+$/);
      expect(notationToPlain(e.syl)).toBe(e.word);
    }
  });
});

describe('Respelling for Polish and Montenegrin speakers', () => {
  it('writes Hebrew sounds with each language’s own letters', () => {
    expect(respellHebrewLatin('sha·[lom]', 'pl')).toBe('sza·[lom]');
    expect(respellHebrewLatin('sha·[lom]', 'cnr')).toBe('ša·[lom]');
    expect(respellHebrewLatin(lat('לְחַיִּים'), 'pl')).toBe('le·[cha]·jim');
    expect(respellHebrewLatin(lat('לְחַיִּים'), 'cnr')).toBe('le·[ha]·jim');
    expect(respellHebrewLatin(lat('בְּבַקָּשָׁה'), 'pl')).toBe('be·wa·ka·[sza]');
    expect(respellHebrewLatin(lat('צִמְחוֹנִי'), 'pl')).toBe('cim·cho·[ni]');
    expect(respellHebrewLatin(lat('לַיְלָה'), 'cnr')).toBe('[laj]·la');
  });
});

describe('Polish and Montenegrin interface strings of the Hebrew course', () => {
  it('reuses the English course’s translations with the language name swapped', () => {
    expect(uiText('Build the sentence in Hebrew', 'pl')).toBe('Ułóż zdanie po hebrajsku');
    expect(uiText('Build the sentence in Hebrew', 'cnr')).toBe('Složite rečenicu na hebrejskom');
    expect(uiText('Hebrew – slowly', 'pl')).toBe('Hebrajski – wolno');
    expect(uiText('Search in English or Hebrew', 'cnr')).toBe('Tražite na crnogorskom ili hebrejskom');
    expect(uiText('Something only in Hebrew', 'pl')).toBe('Something only in Hebrew');
  });
});

describe('Hebrew pronunciation score', () => {
  it('compares letters without niqqud, final forms and the recognizer’s full spelling', () => {
    expect(scorePronunciation('שָׁלוֹם!', 'שלום', 'he').score).toBe(100);
    expect(scorePronunciation('אַחַת, שְׁתַּיִם, שָׁלוֹשׁ.', 'אחת שתיים שלוש', 'he').score).toBe(100);
    expect(scorePronunciation('לֹא, זֶה קָרוֹב.', 'לא זה קרוב', 'he').score).toBe(100);
  });

  it('reads digits as number words', () => {
    expect(heDigitsToWords('20 ₪')).toBe('עשרים שקל');
    expect(heDigitsToWords('18')).toBe('שמונה עשרה');
    expect(scorePronunciation('עֶשְׂרִים שֶׁקֶל.', '20 שקל', 'he').score).toBe(100);
    expect(scorePronunciation('אַחַת, שְׁתַּיִם, שָׁלוֹשׁ.', '1 2 3', 'he').score).toBe(100);
  });

  it('marks kh said as k and h as half mistakes', () => {
    const r = scorePronunciation('חֵן', 'כן', 'he');
    expect(r.score).toBeLessThan(100);
    expect(r.words[0].sounds?.[0]).toMatchObject({ ok: false, heard: 'כ' });
  });
});

describe('Hebrew writing check', () => {
  it('accepts the phrase typed without niqqud, with plain final letters or an apostrophe geresh', () => {
    expect(checkWriting('שָׁלוֹם!', 'שלום').kind).toBe('correct');
    expect(checkWriting('שָׁלוֹם!', 'שלומ').kind).toBe('correct');
    expect(checkWriting('תּוֹדָה רַבָּה!', 'תודה רבה').kind).toBe('correct');
    expect(checkWriting('תּוֹדָה רַבָּה!', 'תודה').kind).toBe('wrong');
  });
});

describe('Hebrew course data (LEARN_COURSE=he)', () => {
  let data: typeof import('../../src/data');
  let roleplays: typeof import('../../src/data/dialogues');
  let pairs: typeof import('../../src/data/minimalPairs');
  let stories: typeof import('../../src/data/stories');
  let sounds: typeof import('../../src/data/sounds');
  let course: typeof import('../../src/lib/course');
  let catalog: typeof import('../../src/lib/clipCatalog');
  let lessons: typeof import('../../src/data/lessons');
  let types: typeof import('../../src/data/types');
  let phonetics: typeof import('../../src/lib/phonetics');
  let respell: typeof import('../../src/lib/latinRespell');
  let alefbet: typeof import('../../src/data/he/alphabet');
  let builder: typeof import('../../src/lesson/buildLesson');
  let nakdan: typeof import('../../src/lib/nakdan');

  beforeAll(async () => {
    vi.stubEnv('LEARN_COURSE', 'he');
    vi.resetModules();
    [data, roleplays, pairs, stories, sounds, course, catalog, lessons, types, phonetics, respell, alefbet, builder, nakdan] = await Promise.all([
      import('../../src/data'),
      import('../../src/data/dialogues'),
      import('../../src/data/minimalPairs'),
      import('../../src/data/stories'),
      import('../../src/data/sounds'),
      import('../../src/lib/course'),
      import('../../src/lib/clipCatalog'),
      import('../../src/data/lessons'),
      import('../../src/data/types'),
      import('../../src/lib/phonetics'),
      import('../../src/lib/latinRespell'),
      import('../../src/data/he/alphabet'),
      import('../../src/lesson/buildLesson'),
      import('../../src/lib/nakdan'),
    ]);
  });
  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  /** Both forms of a template text ({masculine|feminine}). */
  const forms = (text: string) => [text.replace(/\{([^{}|]*)\|[^{}]*\}/g, '$1'), text.replace(/\{[^{}|]*\|([^{}]*)\}/g, '$1')];

  /** Every Hebrew text of the course: phrases, roleplay lines and options, Sound Lab words. */
  function courseTexts(): string[] {
    const texts = data.ALL_ITEMS.flatMap((i) => [i.polish, i.genderAlt?.polish ?? '']);
    for (const r of roleplays.ROLEPLAYS) for (const t of r.turns) texts.push(t.line.polish, ...t.options.map((o) => o.polish));
    for (const g of pairs.CONTRAST_GROUPS) for (const p of g.pairs) texts.push(p.a.polish, p.b.polish);
    for (const s of stories.STORIES) {
      texts.push(s.titlePl, ...s.lines.map((l) => l.polish));
      for (const q of s.questions) texts.push(q.q, ...q.options.map((o) => o.polish));
    }
    return texts.flatMap(forms).filter(Boolean);
  }

  it('loads the Hebrew course, taught in English, Polish and Montenegrin', () => {
    expect(course.COURSE).toBe('he');
    expect(course.COURSE_INFO.sttLang).toBe('he-IL');
    expect(course.COURSE_INFO.dir).toBe('rtl');
    expect(course.COURSE_INFO.uiLangs).toEqual(['en', 'pl', 'cnr']);
    expect(course.COURSE_ORDER).toContain('he');
    expect(data.UNITS.map((u) => u.id)).toEqual(['h0', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    expect(data.UNITS.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(data.ALL_ITEMS.length).toBeGreaterThanOrEqual(75);
    expect(lessons.LESSONS[0].id).toBe('h0-L1');
    expect(stories.STORIES.map((s) => s.id)).toEqual(['more-hummus', 'shabbat-bus', 'mom-calling', 'tel-aviv-taxi']);
    expect(Object.keys(sounds.SOUND_INFO).sort()).toEqual(['h', 'kh', 'r', 'ts']);
    expect(phonetics.toEnglishPhonetic('שָׁלוֹם')).toBe('sha·[lom]');
  });

  it('has 4 Hebrew stories, explained in English, Polish and Montenegrin, read by Hila and Avri', () => {
    checkStories(stories, ['en', 'pl', 'cnr']);
    const keys = new Set(catalog.buildClipCatalog().map((c) => c.key));
    expect(keys.has('he-m|n|שָׁלוֹם! מָה תִּרְצִי?')).toBe(true);
    expect(keys.has('he-f|n|חוּמוּס, בְּבַקָּשָׁה.')).toBe(true);
    // Words keep their vowel signs, also at the end (לְךָ).
    expect(keys.has('he-f|n|לְךָ')).toBe(true);
    // Glossary keys are the letters without vowel signs; punctuation is dropped.
    expect(stories.wordKey('בַּבּוֹקֶר.')).toBe('בבוקר');
    expect(stories.cleanWord('לְךָ?')).toBe('לְךָ');
    const bus = stories.getStory('shabbat-bus')!;
    expect(stories.lookupWord(bus, 'בַּבּוֹקֶר.')).toMatchObject({ base: 'בּוֹקֶר' });
    expect(stories.wordParts('בּוֹקֶר', 'בַּבּוֹקֶר')).toEqual({ base: ['', '', 'בּוֹקֶר'], form: ['', 'בַּ', 'בּוֹקֶר'] });
    // Every story word has an exact transcription (no "~" guesses).
    for (const s of stories.STORIES) for (const l of s.lines) expect(phonetics.toEnglishPhonetic(l.polish), l.polish).not.toMatch(/~/);
  });

  it('has a hand-checked entry for every word of the course', () => {
    const missing = new Set<string>();
    for (const text of courseTexts()) {
      for (const w of text.split(/\s+/)) {
        const core = w.replace(/^[^\p{L}\p{M}]+|[^\p{L}\p{M}]+$/gu, '');
        if (core && !inLexicon(core)) missing.add(core);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('has complete items whose notation matches the text', () => {
    const ids = new Set<string>();
    for (const item of data.ALL_ITEMS) {
      expect(ids.has(item.id), item.id).toBe(false);
      ids.add(item.id);
      expect(nfc(notationToPlain(item.syllablesPolish)), item.id).toBe(nfc(item.polish));
      expect(item.phoneticEnglish, item.id).not.toMatch(/~|[א-ת]/);
      expect(item.english, item.id).toBeTruthy();
      expect(item.backchainingSteps.every(Boolean), item.id).toBe(true);
    }
  });

  it('teaches every phrase in English, Polish and Montenegrin', () => {
    const hebrew = /[֐-׿]/;
    for (const item of data.ALL_ITEMS) {
      for (const l of ['en', 'pl', 'cnr'] as const) {
        const t = types.itemText(item, l);
        expect(t.meaning, `${item.id} ${l}`).toBeTruthy();
        expect(t.meaning, `${item.id} ${l}`).not.toMatch(hebrew);
        expect(t.tip, `${item.id} ${l}`).toBeTruthy();
        expect(t.phonetic, `${item.id} ${l}`).not.toMatch(hebrew);
      }
      expect(types.itemText(item, 'pl').meaning).not.toBe(item.english);
      expect(types.unitText(data.UNITS[1], 'cnr').title).toBe('Prve riječi');
      expect(types.unitText(data.UNITS[0], 'pl').title).toBe('Alef-bet');
    }
    // Polish and Montenegrin transcriptions are in their own letters.
    const shalom = data.ALL_ITEMS.find((i) => i.id === 'h1-01')!;
    expect(types.itemText(shalom, 'pl').phonetic).toBe('sza·[lom]');
    expect(types.itemText(shalom, 'cnr').phonetic).toBe('ša·[lom]');
    expect(respell.respell(shalom.phoneticHebrew, 'pl')).toBe('sza·[lom]');
  });

  it('puts the learner into phrases and meanings', () => {
    data.applyProfile({ gender: 'f', name: '' });
    const want = data.ALL_ITEMS.find((i) => i.id === 'h3-13')!;
    expect(want.polish).toBe(nfc('אֲנִי רוֹצָה עוֹד.'));
    expect(want.phoneticEnglish).toBe('a·[ni] ro·[tsa] [od]');
    expect(want.genderAlt?.polish).toBe(nfc('אֲנִי רוֹצֶה עוֹד.'));
    const hungry = data.ALL_ITEMS.find((i) => i.id === 'h3-12')!;
    expect(types.itemText(hungry, 'pl').meaning).toBe('Jestem głodna.');
    expect(types.itemText(hungry, 'cnr').meaning).toBe('Gladna sam.');
    data.applyProfile({ gender: 'm', name: '' });
    expect(types.itemText(hungry, 'pl').meaning).toBe('Jestem głodny.');
  });

  it('has roleplays, Sound Lab groups and a legend in every interface language', () => {
    expect(roleplays.ROLEPLAYS.map((r) => r.id)).toEqual(['tlv-cafe', 'carmel-market', 'shabbat-dinner']);
    for (const r of roleplays.ROLEPLAYS) {
      for (const v of [r.title, r.setting, r.partner]) expect(v.pl && v.cnr && v.en).toBeTruthy();
      for (const t of r.turns) {
        expect(t.line.t.pl && t.line.t.cnr).toBeTruthy();
        expect(t.options.filter((o) => o.correct)).toHaveLength(1);
        for (const o of t.options) expect(o.t.pl && o.t.cnr && o.feedback.pl && o.feedback.cnr).toBeTruthy();
      }
    }
    expect(pairs.CONTRAST_GROUPS.map((g) => g.id)).toEqual(['he-kh-h', 'he-kh-k', 'he-ts-s']);
    for (const g of pairs.CONTRAST_GROUPS) {
      expect(g.loc?.pl?.descriptionA && g.loc?.cnr?.descriptionB).toBeTruthy();
      for (const p of g.pairs) {
        expect(p.a.loc?.pl && p.b.loc?.cnr).toBeTruthy();
        expect(stripNiqqud(p.a.polish)).not.toBe(stripNiqqud(p.b.polish));
      }
    }
    for (const row of data.PHONETIC_LEGEND) expect(row.loc?.pl?.sound && row.loc?.cnr?.note).toBeTruthy();
  });

  it('records the course with Hila and Avri, meanings in English, Polish and Montenegrin', () => {
    const list = catalog.buildClipCatalog();
    const keys = new Set(list.map((c) => c.key));
    expect(keys.has(nfc('he-f|s|שָׁלוֹם!'))).toBe(true);
    expect(keys.has(nfc('he-m|n|שָׁלוֹם! מָה תִּרְצֶה?'))).toBe(true);
    expect(keys.has(nfc('he-m|n|שָׁלוֹם! מָה תִּרְצִי?'))).toBe(true);
    // Single words keep their final vowel mark (לְךָ, not לְך).
    expect(keys.has(nfc('he-f|n|לְךָ'))).toBe(true);
    expect(keys.has(nfc('he-f|n|לְך'))).toBe(false);
    expect(keys.has('en|n|Thank you!')).toBe(true);
    expect(keys.has('pl-f|n|Dziękuję!')).toBe(true);
    expect(keys.has('cnr-f|n|Hvala!')).toBe(true);
    // No Hebrew interface: nothing is read by the Hebrew meaning voice.
    expect(list.some((c) => c.voice === 'he')).toBe(false);
    expect(list.some((c) => c.voice === 'pl-m' || c.voice === 'cnr-m')).toBe(false);
  });

  describe('Automatic niqqud (Dicta Nakdan)', () => {
    /** Dicta's answer for a phrase: words with their best option first, separators in between. */
    const answer = (...parts: (string | [string, string])[]): import('../../src/lib/nakdan').NakdanToken[] =>
      parts.map((p) => (typeof p === 'string' ? { word: p, sep: true, options: [] } : { word: p[0], sep: false, options: [[p[1], []], ['x', []]] }));

    it('asks only when a word would be guessed', () => {
      expect(nakdan.needsNiqqud('שלום')).toBe(false);
      expect(nakdan.needsNiqqud('איפה תחנה?')).toBe(false);
      // A split into prefixes is a guess too: כלב is "dog", not כְּ + לֵב.
      expect(nakdan.needsNiqqud('כלב')).toBe(true);
      expect(nakdan.needsNiqqud('איפה הכלב?')).toBe(true);
      // So is a word that reads two ways: אוכל is "eats" (o·KHEL) or "food" (O·khel).
      expect(nakdan.needsNiqqud('אוכל')).toBe(true);
      expect(nakdan.needsNiqqud('שָׁלוֹם כֶּלֶב')).toBe(false);
      expect(nakdan.needsNiqqud('הכלב שלי')).toBe(true);
      expect(nakdan.needsNiqqud('Hello')).toBe(false);
    });

    it('puts vowel signs on unknown words only, keeping letters, punctuation and known words', () => {
      const tokens = answer(['הכלב', 'הַ|כֶּלֶב'], ' ', ['שלום', 'שָׁלוֹם'], ', ', ['אוכל', 'אוֹכֵל'], ' ', ['גלידה', 'גְּלִידָה'], '!');
      const out = nakdan.applyNakdan('הכלב שלום, אוכל גלידה!', tokens);
      // אוכל reads two ways (eats / food): Dicta's reading in context wins; שלום is certain and stays.
      expect(out).toBe(nfc('הַכֶּלֶב שלום, אוֹכֵל גְּלִידָה!'));
      expect(lat(out!)).toBe('ha·[ke]·lev sha·[lom] o·[khel] gli·[da]');
      // A "vocalization" that changes letters is ignored.
      expect(nakdan.applyNakdan('מסעדה', answer(['מסעדה', 'מִסְעָדוֹת']))).toBeNull();
      expect(nakdan.applyNakdan('שלום', answer(['שלום', 'שָׁלוֹם']))).toBeNull();
      // Quotation marks around a word stay outside it.
      expect(nakdan.applyNakdan('"גלידה"', answer('"', ['גלידה', 'גְּלִידָה'], '"'))).toBe(nfc('"גְּלִידָה"'));
    });

    it('calls Dicta once per phrase, caches the answer and pauses after a failure', async () => {
      nakdan.resetNakdan();
      const ok = vi.fn(async (_url: unknown, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body));
        expect(body.task).toBe('nakdan');
        expect(body.data).toBe('הכלב רץ');
        return new Response(JSON.stringify(answer(['הכלב', 'הַ|כֶּלֶב'], ' ', ['רץ', 'רָץ'])), { status: 200 });
      });
      expect(await nakdan.addNiqqud('הכלב רץ', ok as unknown as typeof fetch)).toBe(nfc('הַכֶּלֶב רָץ'));
      expect(await nakdan.addNiqqud('הכלב רץ', ok as unknown as typeof fetch)).toBe(nfc('הַכֶּלֶב רָץ'));
      expect(ok).toHaveBeenCalledTimes(1);
      expect(await nakdan.addNiqqud('שלום', ok as unknown as typeof fetch)).toBeNull();
      expect(ok).toHaveBeenCalledTimes(1);

      const down = vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      });
      expect(await nakdan.addNiqqud('החתול ישן', down as unknown as typeof fetch)).toBeNull();
      expect(await nakdan.addNiqqud('הציפור שרה', down as unknown as typeof fetch)).toBeNull();
      expect(down).toHaveBeenCalledTimes(1);
      nakdan.resetNakdan();
    });
  });

  describe('Alef-Bet', () => {
    it('teaches every letter, final form and vowel sign once, each with a word that shows it', () => {
      const ids = alefbet.HE_LETTERS.map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(alefbet.ALEFBET_PLAN.flat().sort()).toEqual([...ids].sort());
      const glyphs = alefbet.HE_LETTERS.filter((l) => l.kind === 'letter').map((l) => l.glyph).join('');
      for (const ch of 'אבגדהוזחטיכךלמםנןסעפףצץקרשת') expect(glyphs).toContain(ch);
      const h0 = data.UNITS[0].items.map((i) => i.polish.replace(/[^\p{L}\p{M}]/gu, ''));
      for (const l of alefbet.HE_LETTERS) {
        expect(h0, l.id).toContain(l.example.normalize('NFC'));
        expect(alefbet.clusters(l.example).some((c) => alefbet.clusterShows(l, c)), l.id).toBe(true);
      }
    });

    it('tells dotted letters, vowel vavs and vowel signs apart', () => {
      const show = (id: string, word: string) => alefbet.clusters(word).filter((c) => alefbet.clusterShows(alefbet.getLetter(id)!, c)).map((c) => c.base);
      expect(show('bet', 'בְּסֵדֶר')).toEqual(['ב']);
      expect(show('vet', 'טוֹב')).toEqual(['ב']);
      expect(show('vet', 'אַבָּא')).toEqual([]);
      expect(show('vowel-o', 'אוֹר')).toEqual(['ו']);
      expect(show('vav', 'אוֹר')).toEqual([]);
      expect(show('vav', 'וָרֹד')).toEqual(['ו']);
      expect(show('vowel-u', 'כַּדּוּר')).toEqual(['ו']);
      expect(show('khaf', 'מֶלֶךְ')).toEqual(['ך']);
      expect(show('sin', 'שִׂמְחָה')).toEqual(['ש']);
      expect(show('shin', 'שִׂמְחָה')).toEqual([]);
      expect([...alefbet.cardsOfWord('פִּיתָה')].sort()).toEqual(['he', 'pe', 'tav', 'vowel-a', 'vowel-i']);
      expect([...alefbet.cardsOfWord('מֶלֶךְ')].sort()).toEqual(['khaf', 'lamed', 'mem', 'vowel-e']);
    });

    it('has eight lessons of four words, each read with the letters taught so far', () => {
      const ab = lessons.lessonsOfUnit('h0');
      expect(ab.map((l) => l.letters)).toEqual(alefbet.ALEFBET_PLAN);
      expect(ab.every((l) => l.itemIds.length === 4)).toBe(true);
      const known = new Set<string>();
      for (const l of ab) {
        l.letters!.forEach((id) => known.add(id));
        for (const id of l.itemIds) {
          const word = data.getItem(id)!.polish;
          const missing = [...alefbet.cardsOfWord(word)].filter((c) => !known.has(c));
          expect(missing, `${l.id} ${word}`).toEqual([]);
        }
      }
      // Only Alef-Bet lessons carry letters.
      expect(lessons.LESSONS.filter((l) => l.letters).every((l) => l.unitId === 'h0')).toBe(true);
    });

    it('uses words of its own, not phrases of the other units', () => {
      const plain = (t: string) => stripNiqqud(t).replace(/[^\p{L}]/gu, '');
      const others = new Set(data.UNITS.slice(1).flatMap((u) => u.items.map((i) => plain(i.polish))));
      for (const item of data.UNITS[0].items) expect(others.has(plain(item.polish)), item.polish).toBe(false);
    });

    it('builds lessons: letter cards, sound quiz, then reading, hearing and writing the words', () => {
      for (const lesson of lessons.lessonsOfUnit('h0')) {
        const steps = builder.buildLesson(lesson);
        const kinds = steps.map((s) => s.kind);
        expect(kinds.slice(0, lesson.letters!.length)).toEqual(lesson.letters!.map(() => 'letter-learn'));
        expect(kinds).not.toContain('recall');
        expect(kinds.filter((k) => k === 'read-word')).toHaveLength(4);
        expect(kinds.filter((k) => k === 'write')).toHaveLength(2);
        expect(steps.length).toBeLessThanOrEqual(21);
        for (const s of steps) {
          if (s.kind === 'letter-sound') {
            const target = alefbet.getLetter(s.letterId)!;
            const sounds = s.optionIds.map((id) => alefbet.getLetter(id)!.sound);
            expect(s.optionIds).toHaveLength(4);
            expect(new Set(sounds).size).toBe(4);
            for (const l of ['pl', 'cnr'] as const) expect(new Set(sounds.map((x) => respellHebrewLatin(x, l))).size).toBe(4);
            expect(sounds.filter((x) => x === target.sound)).toHaveLength(1);
            expect(s.optionIds.every((id) => alefbet.getLetter(id)!.kind === target.kind)).toBe(true);
          }
          if (s.kind === 'read-word') {
            const right = data.getItem(s.itemId)!.phoneticHebrew;
            expect(s.options).toHaveLength(4);
            expect(s.options.filter((o) => o === right)).toHaveLength(1);
            for (const l of ['pl', 'cnr'] as const) expect(new Set(s.options.map((o) => respellHebrewLatin(o.replace(/[·[\]]/g, ''), l))).size).toBe(4);
          }
          if (s.kind === 'hear-word') {
            expect(s.optionIds).toContain(s.itemId);
            expect(new Set(s.optionIds).size).toBe(4);
          }
        }
      }
      expect(builder.misreadings('[dag]')).toEqual(expect.arrayContaining(['[tag]', '[dog]', '[dak]']));
      expect(builder.misreadings('[tov]')).toContain('[tob]');
    });

    it('names letters and their sounds in the learner\u2019s letters', () => {
      const name = (id: string) => toEnglishPhonetic(alefbet.getLetter(id)!.nameHe!).replace(/[·[\]]/g, '');
      expect(name('alef')).toBe('alef');
      expect(name('bet')).toBe('bet');
      expect(name('shin')).toBe('shin');
      expect(respellHebrewLatin(name('shin'), 'pl')).toBe('szin');
      expect(respellHebrewLatin(name('tsadi'), 'cnr')).toBe('cadi');
      expect(respellHebrewLatin(name('vav'), 'pl')).toBe('waw');
      const label = (id: string, lang: 'en' | 'pl' | 'cnr') =>
        alefbet.soundLabel(alefbet.getLetter(id)!.sound, lang, (t, l) => (l === 'pl' || l === 'cnr' ? respellHebrewLatin(t, l) : t));
      expect(label('alef', 'en')).toBe('silent');
      expect(label('khaf', 'pl')).toBe('ch');
      expect(label('khaf', 'cnr')).toBe('h');
      expect(label('yud', 'pl')).toBe('j');
      for (const l of alefbet.HE_LETTERS) for (const lang of ['en', 'pl', 'cnr'] as const) expect(l.tip[lang].length, l.id).toBeGreaterThan(1);
    });

    it('records the letter names', () => {
      const keys = new Set(catalog.buildClipCatalog().map((c) => c.key));
      for (const l of alefbet.HE_LETTERS) if (l.nameHe) expect(keys.has(nfc(`he-f|n|${l.nameHe}`)), l.id).toBe(true);
      expect(keys.has(nfc('he-f|s|אַבָּא'))).toBe(true);
    });
  });
});
