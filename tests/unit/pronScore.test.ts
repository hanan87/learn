import { describe, expect, it } from 'vitest';
import { scorePronunciation } from '../../src/lib/pronScore';

/** Sound-by-sound pronunciation score: real percentages and the exact sounds to fix. */

const marks = (target: string, heard: string, course: 'pl' | 'cnr' = 'pl') =>
  scorePronunciation(target, heard, course).words.map((w) => (w.sounds ?? []).map((m) => (m.ok ? m.text : `(${m.text}>${m.heard})`)).join(''));

describe('sound-by-sound scoring', () => {
  it('gives 100 for the phrase, ignoring case and punctuation', () => {
    expect(scorePronunciation('Dzień dobry', 'dzień dobry').score).toBe(100);
    expect(scorePronunciation('szkoła', 'Szkoła.').score).toBe(100);
    expect(scorePronunciation('Do widzenia', 'dowidzenia').score).toBeGreaterThanOrEqual(95);
  });

  it('pinpoints the wrong sound instead of a flat low score', () => {
    const r = scorePronunciation('szkoła', 'szkoda');
    expect(r.score).toBe(80);
    expect(r.words[0].matched).toBe(false);
    expect(marks('szkoła', 'szkoda')).toEqual(['szko(ł>d)a']);
    // A close sound is half a mistake: sz said as s.
    expect(scorePronunciation('szkoła', 'skoła').score).toBe(90);
    expect(marks('szkoła', 'skoła')).toEqual(['(sz>s)koła']);
  });

  it('gives different wrong words different scores, depending on what was right', () => {
    const scores = ['kot', 'bla', 'pies'].map((h) => scorePronunciation('szkoła', h).score);
    expect(new Set(scores).size).toBe(3);
    expect(Math.max(...scores)).toBeLessThan(50);
  });

  it('knows Polish spelling pairs that sound the same', () => {
    expect(scorePronunciation('rzeka', 'żeka').score).toBe(100);
    expect(scorePronunciation('góra', 'gura').score).toBe(100);
    expect(scorePronunciation('chleb', 'hleb').score).toBe(100);
  });

  it('reports missing words and tolerates a false start', () => {
    const half = scorePronunciation('Dzień dobry', 'dzień');
    expect(half.words.map((w) => [w.word, w.matched, w.heard ?? null])).toEqual([
      ['Dzień', true, 'dzień'],
      ['dobry', false, null],
    ]);
    expect(half.score).toBeLessThan(50);
    const start = scorePronunciation('Poproszę kawę z mlekiem', 'eee poproszę kawę z mlekiem');
    expect(start.score).toBeGreaterThanOrEqual(90);
    expect(start.extra).toEqual(['eee']);
  });

  it('marks an extra sound at the end of a word', () => {
    expect(marks('Jak się Pan ma?', 'jak się pani masz')).toEqual(['jak', 'się', 'pa(n>ni)', 'm(a>asz)']);
    expect(scorePronunciation('Jak się Pan ma?', 'jak się pani masz').score).toBeLessThan(85);
  });

  it('scores Montenegrin with its own sounds', () => {
    expect(scorePronunciation('Hvala lijepa', 'hvala lijepa', 'cnr').score).toBe(100);
    expect(marks('kuća', 'kuča', 'cnr')).toEqual(['ku(ć>č)a']);
    expect(scorePronunciation('kuća', 'kuča', 'cnr').score).toBe(88);
    expect(marks('ljubav', 'lubav', 'cnr')).toEqual(['(lj>l)ubav']);
  });

  it('scores an empty transcript 0 with every word not said', () => {
    const r = scorePronunciation('Dzień dobry', '');
    expect(r.score).toBe(0);
    expect(r.words.every((w) => !w.matched && !w.heard)).toBe(true);
  });
});
