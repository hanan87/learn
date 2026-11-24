import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { checkStories } from './storyChecks';
import {
  detectSounds,
  renderNotation,
  toEnglishPhonetic,
  toHebrewPhonetic,
  toSyllableNotation,
} from '../../src/lib/cnrPhonetics';
import { notationToPlain } from '../../src/lib/syllables';

/** The Montenegrin course: phonetics engine, course data and the course switch. */

// Niqqud order inside a letter is not canonical in the generated text; compare normalized forms.
const he = (text: string) => toHebrewPhonetic(text).normalize('NFC');
const nfc = (s: string) => s.normalize('NFC');

describe('Montenegrin phonetics', () => {
  it('splits syllables with first-syllable stress and the known exceptions', () => {
    expect(toSyllableNotation('Dobar dan')).toBe('[Do]·bar [dan]');
    expect(toSyllableNotation('Doviđenja')).toBe('Do·[vi]·đe·nja');
    expect(toSyllableNotation('Izvinite')).toBe('Iz·[vi]·ni·te');
    expect(toSyllableNotation('Kako ste?')).toBe('[Ka]·ko ste?');
    expect(toSyllableNotation('jednu')).toBe('[jed]·nu');
    expect(toSyllableNotation('sjutra')).toBe('[sju]·tra');
  });

  it('treats ije as one syllable and r between consonants as a vowel', () => {
    expect(toSyllableNotation('mlijeko')).toBe('[mlije]·ko');
    expect(toSyllableNotation('crno vino')).toBe('[cr]·no [vi]·no');
    expect(toSyllableNotation('Trg')).toBe('[Trg]');
    expect(toEnglishPhonetic('Crna Gora')).toBe('[tsur]·nah [goh]·rah');
    expect(he('crno')).toBe(nfc('[צֶר]·נוֹ'));
    expect(toEnglishPhonetic('lijepo')).toBe('[lyeh]·poh');
  });

  it('splits clusters that cannot open a word, i + je in nije, and stresses "Je li"', () => {
    expect(toSyllableNotation('taksi')).toBe('[tak]·si');
    expect(toSyllableNotation('doktor')).toBe('[dok]·tor');
    expect(toSyllableNotation('Boli me ovdje')).toBe('[Bo]·li me [ov]·dje');
    expect(toSyllableNotation('Budva')).toBe('[Bu]·dva');
    expect(toSyllableNotation('nešto')).toBe('[ne]·što');
    expect(toSyllableNotation('Nije mi dobro')).toBe('[Ni]·je mi [do]·bro');
    expect(toSyllableNotation('pijem')).toBe('[pi]·jem');
    expect(toSyllableNotation('pijesak')).toBe('[pije]·sak');
    expect(toSyllableNotation('Je li ovo mjesto slobodno?')).toBe('[Je] li [o]·vo [mje]·sto [slo]·bod·no?');
    expect(toSyllableNotation('Ne razumijem')).toBe('Ne ra·[zu]·mijem');
    expect(toSyllableNotation('apoteka')).toBe('a·[po]·te·ka');
    expect(toSyllableNotation('crnogorski')).toBe('cr·no·[gor]·ski');
  });

  it('marks soft ć, đ, lj, nj in Hebrew and keeps hard č, dž plain', () => {
    expect(he('kuća')).toBe(nfc('[קוּ]·צְ׳יָה'));
    expect(he('kuče')).toBe(nfc('[קוּ]·צֶ׳ה'));
    expect(he('đak')).toBe(nfc('[גְ׳יָאק]'));
    expect(he('džak')).toBe(nfc('[גָ׳אק]'));
    expect(he('ljubav')).toBe(nfc('[לְיוּ]·בָּאב'));
    expect(he('konj')).toBe(nfc('[קוֹנְי]'));
    expect(toEnglishPhonetic('čaj')).toBe('[chai]');
    expect(toEnglishPhonetic('Doviđenja')).toBe('doh·[vee]·djeh·nyah');
  });

  it('renders hand-written notation and keeps learner templates', () => {
    expect(renderNotation('{[Gla]·dan|[Glad]·na} sam', 'en')).toBe('{[glah]·dahn|[glahd]·nah} sahm');
    expect(nfc(renderNotation('[Zo]·vem se {name}', 'he'))).toBe(nfc('[זוֹ]·בֶם סֶה {name}'));
  });

  it('detects the distinctive sounds', () => {
    expect(detectSounds('Crna Gora').sort()).toEqual(['c', 'r']);
    expect(detectSounds('Doviđenja').sort()).toEqual(['nj', 'đ'].sort());
    expect(detectSounds('Hvala lijepa')).toEqual(['h', 'ije']);
  });
});

describe('Montenegrin course data (LEARN_COURSE=cnr)', () => {
  type DataModule = typeof import('../../src/data');
  let data: DataModule;
  let roleplays: typeof import('../../src/data/dialogues');
  let pairs: typeof import('../../src/data/minimalPairs');
  let stories: typeof import('../../src/data/stories');
  let sounds: typeof import('../../src/data/sounds');
  let text: typeof import('../../src/lib/text');
  let course: typeof import('../../src/lib/course');
  let catalog: typeof import('../../src/lib/clipCatalog');
  let lessons: typeof import('../../src/data/lessons');

  beforeAll(async () => {
    vi.stubEnv('LEARN_COURSE', 'cnr');
    vi.resetModules();
    [data, roleplays, pairs, stories, sounds, text, course, catalog, lessons] = await Promise.all([
      import('../../src/data'),
      import('../../src/data/dialogues'),
      import('../../src/data/minimalPairs'),
      import('../../src/data/stories'),
      import('../../src/data/sounds'),
      import('../../src/lib/text'),
      import('../../src/lib/course'),
      import('../../src/lib/clipCatalog'),
      import('../../src/data/lessons'),
    ]);
  });
  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('loads the Montenegrin course', () => {
    expect(course.COURSE).toBe('cnr');
    expect(course.COURSE_INFO.sttLang).toBe('hr-HR');
    expect(data.UNITS.map((u) => u.id)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']);
    expect(data.ALL_ITEMS).toHaveLength(100);
    expect(lessons.LESSONS[0].id).toBe('m1-L1');
    for (const id of ['m5', 'm6', 'm7', 'm8'] as const) expect(lessons.lessonsOfUnit(id), id).toHaveLength(3);
    expect(new Set(data.ALL_ITEMS.map((i) => i.polish.toLowerCase())).size).toBe(100);
  });

  it('shows the same syllables and stress in the units as the rules give in dialogues and stories', () => {
    for (const g of ['m', 'f'] as const) {
      data.applyProfile({ gender: g, name: '' });
      for (const item of data.ALL_ITEMS) expect(toSyllableNotation(item.polish), item.id).toBe(item.syllablesPolish);
    }
    data.applyProfile({ gender: null, name: '' });
  });

  it('has complete bilingual items whose notation matches the text', () => {
    for (const g of ['m', 'f'] as const) {
      data.applyProfile({ gender: g, name: '' });
      for (const item of data.ALL_ITEMS) {
        expect(notationToPlain(item.syllablesPolish), item.id).toBe(item.polish);
        expect(item.hebrew, item.id).toMatch(/[֐-׿]/);
        expect(item.english, item.id).not.toMatch(/[֐-׿]/);
        expect(item.articulationTip, item.id).toMatch(/[֐-׿]/);
        expect(item.articulationTipEn, item.id).not.toMatch(/[֐-׿]/);
        expect(item.phoneticHebrew, item.id).toMatch(/\[.+\]/);
        expect(item.backchainingSteps, item.id).toHaveLength(3);
        expect(item.backchainingSteps[2], item.id).toBe(item.polish);
        expect(item.polish, item.id).not.toMatch(/[ąęłóńżź]/i);
        expect(data.getSituation(item, 'he'), item.id).not.toContain('איך אומרים');
        expect(data.getSituation(item, 'en'), item.id).not.toContain('How do you say');
      }
    }
    data.applyProfile({ gender: null, name: '' });
  });

  it('adapts gendered phrases to the learner', () => {
    expect(data.GENDERED_ITEM_IDS.sort()).toEqual(['m4-11', 'm4-12', 'm7-08', 'm8-08']);
    data.applyProfile({ gender: 'f', name: 'maja' });
    expect(data.getItem('m4-11')!.polish).toBe('Gladna sam');
    expect(data.getItem('m4-12')!.polish).toBe('Htjela bih kafu');
    expect(data.getItem('m4-12')!.genderAlt?.polish).toBe('Htio bih kafu');
    expect(data.getItem('m7-08')!.polish).toBe('Izgubila sam pasoš');
    expect(data.getItem('m8-08')!.polish).toBe('Udata sam');
    expect(data.getItem('m8-08')!.genderAlt?.polish).toBe('Oženjen sam');
    expect(data.getItem('m8-08')!.hebrew).toBe('אני נשואה');
    expect(data.getItem('m2-14')!.polish).toBe('Zovem se Maja');
    data.applyProfile({ gender: 'm', name: '' });
    expect(data.getItem('m2-14')!.polish).toBe('Zovem se David');
    data.applyProfile({ gender: null, name: '' });
  });

  it('swaps roleplays, sound groups, stories and sounds', () => {
    expect(roleplays.ROLEPLAYS.map((r) => r.id)).toEqual(['kotor-cafe', 'green-market', 'bus-to-budva', 'apoteka']);
    for (const r of roleplays.ROLEPLAYS) {
      expect(r.turns, r.id).toHaveLength(5);
      for (const t of r.turns) expect(t.options.filter((o) => o.correct), t.line.polish).toHaveLength(1);
    }
    expect(pairs.CONTRAST_GROUPS.map((g) => g.id)).toEqual(['cnr-ch', 'cnr-sh', 'cnr-zh', 'cnr-soft']);
    for (const g of pairs.CONTRAST_GROUPS) for (const p of g.pairs) {
      expect(notationToPlain(p.a.syllablesPolish)).toBe(p.a.polish);
      expect(notationToPlain(p.b.syllablesPolish)).toBe(p.b.polish);
    }
    expect(stories.STORIES.map((s) => s.id)).toEqual(['polako', 'hladno-more', 'rakija-za-dorucak', 'macke-u-kotoru']);
    expect(Object.keys(sounds.SOUND_INFO)).toContain('č');
    expect(Object.keys(sounds.SOUND_INFO)).not.toContain('ł');
    expect(data.PHONETIC_LEGEND[0].pl).toBe('č');
  });

  it('has 4 Montenegrin stories, explained in Hebrew and English, read in both voices', () => {
    checkStories(stories, ['he', 'en']);
    const keys = new Set(catalog.buildClipCatalog().map((c) => c.key));
    expect(keys.has('cnr-m|n|Polako, polako. Prvo kafa.')).toBe(true);
    expect(keys.has('cnr-f|n|Ovo je Kotor. Ovdje ima mnogo mačaka.')).toBe(true);
    expect(keys.has('cnr-f|n|mačaka')).toBe(true);
    // The word decoder: kafa → kafu, mačka → mač(a)ka.
    const sea = stories.getStory('hladno-more')!;
    expect(stories.lookupWord(sea, 'kafu.')).toMatchObject({ base: 'kafa' });
    expect(stories.wordParts('kafa', 'kafu')).toEqual({ base: ['kaf', 'a', ''], form: ['kaf', 'u', ''] });
  });

  it('explains Montenegrin diacritic mistakes in writing', () => {
    const v = text.checkWriting('Čaša vode', 'Casa vode');
    expect(v.kind).toBe('diacritics');
    if (v.kind !== 'diacritics') return;
    expect(v.issues.map((i) => i.expected)).toEqual(['č', 'š']);
    expect(text.explainDiacritic(v.issues[0], 'en')).toContain('hard "ch"');
    expect(text.checkWriting('kuća', 'kuča').kind).toBe('diacritics');
  });

  it('records the course with its own voices', () => {
    const keys = new Set(catalog.buildClipCatalog().map((c) => c.key));
    expect(keys.has('cnr-f|s|Doviđenja')).toBe(true);
    expect(keys.has('cnr-m|n|Dobar dan! Izvolite?')).toBe(true);
    // The new units and dialogues.
    expect(keys.has('cnr-f|s|Mogu li platiti karticom?')).toBe(true);
    expect(keys.has('cnr-m|s|Oženjen sam')).toBe(true);
    expect(keys.has('cnr-f|n|Udata sam')).toBe(true);
    expect(keys.has('cnr-f|n|Pet eura. Brzo ozdravite!')).toBe(true);
    expect(keys.has('cnr-m|n|U osam. Peron tri.')).toBe(true);
    expect([...keys].some((k) => k.startsWith('pl-'))).toBe(false);
  });
});
