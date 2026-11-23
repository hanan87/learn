import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
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

  beforeAll(async () => {
    vi.stubEnv('LEARN_COURSE', 'he');
    vi.resetModules();
    [data, roleplays, pairs, stories, sounds, course, catalog, lessons, types, phonetics, respell] = await Promise.all([
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
    return texts.flatMap(forms).filter(Boolean);
  }

  it('loads the Hebrew course, taught in English, Polish and Montenegrin', () => {
    expect(course.COURSE).toBe('he');
    expect(course.COURSE_INFO.sttLang).toBe('he-IL');
    expect(course.COURSE_INFO.dir).toBe('rtl');
    expect(course.COURSE_INFO.uiLangs).toEqual(['en', 'pl', 'cnr']);
    expect(course.COURSE_ORDER).toContain('he');
    expect(data.UNITS.map((u) => u.id)).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    expect(data.ALL_ITEMS.length).toBeGreaterThanOrEqual(75);
    expect(lessons.LESSONS[0].id).toBe('h1-L1');
    expect(stories.STORIES).toEqual([]);
    expect(Object.keys(sounds.SOUND_INFO).sort()).toEqual(['h', 'kh', 'r', 'ts']);
    expect(phonetics.toEnglishPhonetic('שָׁלוֹם')).toBe('sha·[lom]');
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
      expect(types.unitText(data.UNITS[0], 'cnr').title).toBe('Prve riječi');
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
});
