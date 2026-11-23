import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { autoBackchain, detectSounds, inLexicon, toHebrewPhonetic, toSyllableNotation } from '../../src/lib/enPhonetics';
import { notationToPlain } from '../../src/lib/syllables';
import { scorePronunciation } from '../../src/lib/pronScore';

/** The English course for Hebrew speakers: the pronunciation lexicon, course data and the course switch. */

// Niqqud order inside a letter is not canonical in hand-typed text; compare normalized forms.
const he = (text: string) => toHebrewPhonetic(text).normalize('NFC');
const nfc = (s: string) => s.normalize('NFC');

describe('English phonetics', () => {
  it('reads words from the lexicon, keeping capitals and punctuation', () => {
    expect(toSyllableNotation('Thank you!')).toBe('[Thank] you!');
    expect(he('Thank you!')).toBe(nfc('[תַ׳נְק] יוּ'));
    expect(toSyllableNotation('Could you speak a little slower, please?')).toBe('Could you [speak] a [lit]·tle [slow]·er, [please]?');
    expect(he('water')).toBe(nfc('[ווָ]·דֶר'));
    expect(toSyllableNotation('check-out')).toBe('[check]-[out]');
  });

  it('derives plurals, past tense and -ing from the base word', () => {
    expect(toSyllableNotation('tickets')).toBe('[tick]·ets');
    expect(he('tickets')).toBe(nfc('[טִ]·קֶטס'));
    expect(he('cards')).toBe(nfc('[קָארְדז]'));
    expect(toSyllableNotation('included')).toBe('in·[clud]·ed');
    expect(he('included')).toBe(nfc('אִן·[קְלוּד]·אִיד'));
    expect(he('delayed')).toBe(nfc('דִי·[לֵייד]'));
    expect(toSyllableNotation('looking')).toBe('[look]·ing');
    expect(inLexicon('onions')).toBe(true);
    expect(he('onions')).toBe(nfc('[אָנְ]·יֶנז'));
  });

  it('approximates words outside the lexicon by rules', () => {
    expect(inLexicon('zebra')).toBe(false);
    expect(notationToPlain(toSyllableNotation('Sandwich'))).toBe('Sandwich');
    expect(toHebrewPhonetic('sandwich')).toMatch(/\[.+\]/);
    expect(toHebrewPhonetic('make')).toContain('ֵיי');
  });

  it('finds the sounds Hebrew speakers find hard', () => {
    expect(detectSounds('think')).toEqual(['th', 'ih']);
    expect(detectSounds('very well')).toEqual(expect.arrayContaining(['w', 'v']));
    expect(detectSounds('sheep')).toEqual(['ee']);
    expect(detectSounds('bad')).toEqual(['ae']);
    expect(detectSounds('Please')).not.toContain('ih');
  });

  it('builds back-chaining steps from the end', () => {
    expect(autoBackchain('Could we see the menu?')).toEqual(['menu', 'the menu', 'Could we see the menu']);
    expect(autoBackchain('Keep the change.')[2]).toBe('Keep the change');
  });
});

describe('English pronunciation score', () => {
  it('marks th said as s, and w said as v', () => {
    const r = scorePronunciation('think', 'sink', 'en');
    expect(r.words[0].sounds?.find((s) => !s.ok)).toMatchObject({ text: 'th', heard: 's' });
    expect(r.score).toBeGreaterThan(40);
    expect(r.score).toBeLessThan(100);
    expect(scorePronunciation('west', 'vest', 'en').words[0].sounds?.[0]).toMatchObject({ text: 'w', ok: false, heard: 'v' });
    expect(scorePronunciation("I'm fine, thanks.", "I’m fine thanks", 'en').score).toBe(100);
  });
});

describe('English course data (LEARN_COURSE=en)', () => {
  type DataModule = typeof import('../../src/data');
  let data: DataModule;
  let roleplays: typeof import('../../src/data/dialogues');
  let pairs: typeof import('../../src/data/minimalPairs');
  let stories: typeof import('../../src/data/stories');
  let sounds: typeof import('../../src/data/sounds');
  let course: typeof import('../../src/lib/course');
  let catalog: typeof import('../../src/lib/clipCatalog');
  let lessons: typeof import('../../src/data/lessons');
  let words: typeof import('../../src/data/en/words');
  let phonetics: typeof import('../../src/lib/phonetics');

  beforeAll(async () => {
    vi.stubEnv('LEARN_COURSE', 'en');
    vi.resetModules();
    [data, roleplays, pairs, stories, sounds, course, catalog, lessons, words, phonetics] = await Promise.all([
      import('../../src/data'),
      import('../../src/data/dialogues'),
      import('../../src/data/minimalPairs'),
      import('../../src/data/stories'),
      import('../../src/data/sounds'),
      import('../../src/lib/course'),
      import('../../src/lib/clipCatalog'),
      import('../../src/data/lessons'),
      import('../../src/data/en/words'),
      import('../../src/lib/phonetics'),
    ]);
  });
  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('loads the English course, taught in Hebrew only', () => {
    expect(course.COURSE).toBe('en');
    expect(course.COURSE_INFO.sttLang).toBe('en-US');
    expect(course.COURSE_INFO.uiLangs).toEqual(['he']);
    expect(data.UNITS.map((u) => u.id)).toEqual(['e1', 'e2', 'e3', 'e4', 'e5', 'e6']);
    expect(data.ALL_ITEMS.length).toBeGreaterThanOrEqual(75);
    expect(lessons.LESSONS[0].id).toBe('e1-L1');
    expect(phonetics.toHebrewPhonetic('think')).toBe(toHebrewPhonetic('think'));
  });

  it('has a hand-written pronunciation for every word of the course', () => {
    expect(words.enCourseWords().filter((w) => !inLexicon(w))).toEqual([]);
  });

  it('has complete items whose notation matches the text', () => {
    for (const g of ['m', 'f'] as const) {
      data.applyProfile({ gender: g, name: '' });
      for (const item of data.ALL_ITEMS) {
        expect(notationToPlain(item.syllablesPolish), item.id).toBe(item.polish);
        expect(item.polish, item.id).not.toMatch(/[֐-׿]/);
        expect(item.hebrew, item.id).toMatch(/[֐-׿]/);
        expect(item.articulationTip, item.id).toMatch(/[֐-׿]/);
        expect(item.phoneticHebrew, item.id).toMatch(/\[.+\]/);
        expect(item.backchainingSteps, item.id).toHaveLength(3);
        expect(item.backchainingSteps[2].replace(/[.,!?]+$/, ''), item.id).toBe(item.polish.replace(/[.,!?]+$/, ''));
        expect(data.getSituation(item, 'he'), item.id).not.toContain('איך אומרים');
      }
    }
    data.applyProfile({ gender: null, name: '' });
  });

  it('puts the learner into phrases and Hebrew meanings', () => {
    data.applyProfile({ gender: 'f', name: 'Noa' });
    expect(data.getItem('e2-04')!.polish).toBe('My name is Noa.');
    expect(data.getItem('e2-08')!.hebrew).toBe('אני עובדת בהייטק.');
    data.applyProfile({ gender: 'm', name: '' });
    expect(data.getItem('e2-04')!.polish).toBe('My name is Daniel.');
    expect(data.getItem('e2-08')!.hebrew).toBe('אני עובד בהייטק.');
    // English itself does not change with the speaker's gender.
    expect(data.GENDERED_ITEM_IDS).toEqual([]);
    data.applyProfile({ gender: null, name: '' });
  });

  it('swaps roleplays, sound groups, stories and sounds', () => {
    expect(roleplays.ROLEPLAYS.map((r) => r.id)).toEqual(['nyc-coffee', 'hotel-check-in', 'street-directions']);
    for (const r of roleplays.ROLEPLAYS) for (const t of r.turns) expect(t.options.filter((o) => o.correct)).toHaveLength(1);
    expect(pairs.CONTRAST_GROUPS.map((g) => g.id)).toEqual(['en-th', 'en-wv', 'en-ih-ee', 'en-ae-e']);
    for (const g of pairs.CONTRAST_GROUPS) for (const p of g.pairs) {
      expect(notationToPlain(p.a.syllablesPolish)).toBe(p.a.polish);
      expect(notationToPlain(p.b.syllablesPolish)).toBe(p.b.polish);
      expect(p.a.phoneticHebrew).not.toBe(p.b.phoneticHebrew);
    }
    expect(stories.STORIES).toEqual([]);
    expect(Object.keys(sounds.SOUND_INFO)).toEqual(['th', 'w', 'v', 'r', 'ih', 'ee', 'ae']);
    expect(data.PHONETIC_LEGEND[0].he).toBe('ת׳');
  });

  it('records the course with Jenny and Guy, and Hebrew meanings only', () => {
    const list = catalog.buildClipCatalog();
    const keys = new Set(list.map((c) => c.key));
    expect(keys.has('en-f|s|Thank you!')).toBe(true);
    expect(keys.has('en-m|n|Hi there! What can I get you?')).toBe(true);
    expect(keys.has('he|n|תודה!')).toBe(true);
    expect(list.some((c) => c.voice === 'en')).toBe(false);
    expect(list.some((c) => c.voice.startsWith('pl-') || c.voice.startsWith('cnr-'))).toBe(false);
  });
});
