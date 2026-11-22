import { afterEach, describe, expect, it, vi } from 'vitest';
import { getItem } from '../../src/data';
import {
  courseItemByText,
  courseMatch,
  normalizeMeaning,
  pickMyMemory,
  toMontenegrin,
  translateFromCourse,
  translateToCourse,
  TranslateError,
} from '../../src/lib/translate';

/** "How do I say…?": course matches first, MyMemory machine translation, on-device fallback. */

const mt = (segment: string, translation: string) => ({ segment, translation, match: 0.85, 'created-by': 'MT!' });
const ok = (translation: string, matches: unknown[] = []) => ({ responseStatus: 200, responseData: { translatedText: translation, match: 0.85 }, matches });

function mockFetch(body: unknown, status = 200) {
  const fn = vi.fn(async (_url: string) => ({ ok: status === 200, status, json: async () => body }) as unknown as Response);
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('course matches', () => {
  it('normalizes meanings (niqqud, punctuation, parentheses, case)', () => {
    expect(normalizeMeaning('  תּוֹדָה!  ')).toBe('תודה');
    expect(normalizeMeaning('Good DAY, hello')).toBe('good day hello');
    expect(normalizeMeaning('Kasia (nickname)')).toBe('kasia');
  });

  it('finds a course item by its meaning, including one of several meanings', () => {
    expect(courseMatch('Thank you', 'en')?.polish).toBe('Dziękuję');
    expect(courseMatch('thank you!', 'en')?.polish).toBe('Dziękuję');
    expect(courseMatch(getItem('u2-06')!.hebrew, 'he')?.id).toBe('u2-06');
    expect(courseMatch('porridge', 'en')?.id).toBe('u1-05');
    expect(courseMatch('a sentence that is surely not in the course', 'en')).toBeUndefined();
    expect(courseItemByText('dzień dobry')?.polish).toBe('Dzień dobry');
  });

  it('answers from the course without going online', async () => {
    const fetch = mockFetch(ok('x'));
    const r = await translateToCourse('Thank you', 'en');
    expect(r).toEqual({ text: 'Dziękuję', source: 'course', itemId: 'u2-06' });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('MyMemory responses', () => {
  it('prefers the machine translation of the exact input over a fuzzy memory hit', () => {
    const data = ok('Chciałbym filiżankę kawy.', [
      { segment: 'I would like a cup of coffee.', translation: 'Chciałbym filiżankę kawy.', match: 0.89, 'created-by': 'Public_Corpora' },
      mt('I would like a cup of coffee with milk', 'Poproszę filiżankę kawy z mlekiem.'),
    ]);
    expect(pickMyMemory('I would like a cup of coffee with milk', data)).toBe('Poproszę filiżankę kawy z mlekiem.');
  });

  it('uses an exact human translation when there is one, and decodes entities', () => {
    const data = ok('x', [{ segment: 'dog', translation: 'pies', match: 1, 'created-by': 'Human' }, mt('dog', 'psa')]);
    expect(pickMyMemory('dog', data)).toBe('pies');
    expect(pickMyMemory('it is', ok('To jest &#39;ok&#39;', [mt('it is', 'To jest &#39;ok&#39;')]))).toBe("To jest 'ok'");
  });

  it('reports the daily quota and empty answers', () => {
    expect(() => pickMyMemory('a', { responseStatus: 429, responseData: { translatedText: '' } })).toThrow(TranslateError);
    try {
      pickMyMemory('a', ok('MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY'));
    } catch (e) {
      expect((e as TranslateError).reason).toBe('quota');
    }
    expect(() => pickMyMemory('a', ok('', []))).toThrow(TranslateError);
  });
});

describe('translating online and on the device', () => {
  it('translates Hebrew to Polish with MyMemory', async () => {
    const fetch = mockFetch(ok('Gdzie jest dworzec?', [mt('איפה התחנה?', 'Gdzie jest dworzec?')]));
    const r = await translateToCourse('איפה התחנה?', 'he');
    expect(r).toEqual({ text: 'Gdzie jest dworzec?', source: 'online' });
    expect(decodeURIComponent(String(fetch.mock.calls[0][0]))).toContain('langpair=he|pl');
  });

  it('translates to Montenegrin through Bosnian and applies Montenegrin forms', async () => {
    const fetch = mockFetch(ok('Sutra pijem kavu.', [mt('מחר אני שותה קפה', 'Sutra pijem kavu.')]));
    const r = await translateToCourse('מחר אני שותה קפה', 'he', 'cnr');
    expect(r.text).toBe('Sjutra pijem kafu.');
    expect(decodeURIComponent(String(fetch.mock.calls[0][0]))).toContain('langpair=he|bs');
  });

  it('falls back to the on-device translator, and fails clearly without one', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('network'))));
    await expect(translateToCourse('I am tired of waiting', 'en')).rejects.toMatchObject({ reason: 'failed' });

    const translate = vi.fn(async () => 'Jestem zmęczony czekaniem');
    vi.stubGlobal('Translator', { availability: async () => 'available', create: async () => ({ translate }) });
    const r = await translateToCourse('I am tired of waiting', 'en');
    expect(r).toEqual({ text: 'Jestem zmęczony czekaniem', source: 'device' });
  });

  it('gives the meaning of a phrase typed in the course language', async () => {
    expect((await translateFromCourse('Dziękuję', 'en')).text).toBe('Thank you');
    const fetch = mockFetch(ok('Where is the museum?', [mt('Gdzie jest muzeum?', 'Where is the museum?')]));
    expect((await translateFromCourse('Gdzie jest muzeum?', 'en')).text).toBe('Where is the museum?');
    expect(decodeURIComponent(String(fetch.mock.calls[0][0]))).toContain('langpair=pl|en');
  });

  it('rejects empty input', async () => {
    await expect(translateToCourse('   ', 'he')).rejects.toMatchObject({ reason: 'empty' });
  });
});

describe('Montenegrin forms', () => {
  it('replaces Croatian / Bosnian words and keeps capitals', () => {
    expect(toMontenegrin('Sutra pijem kavu i jedem kruh.')).toBe('Sjutra pijem kafu i jedem hljeb.');
    expect(toMontenegrin('SUTRA')).toBe('SJUTRA');
    expect(toMontenegrin('Tko je to?')).toBe('Ko je to?');
    expect(toMontenegrin('Gdje je plaža?')).toBe('Gdje je plaža?');
  });
});
