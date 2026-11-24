import { afterEach, describe, expect, it, vi } from 'vitest';
import { UI_ROWS } from '../../src/i18n/strings';
import { buildReport, genderForms, loadReview, reviewSections, reviewStats, saveReview, type ReviewStore } from '../../src/lib/review';
import { notationToPlain } from '../../src/lib/syllables';

/** The native-speaker review: every Polish / Montenegrin text listed once, and the report it sends back. */

const HEBREW = /[֐-׿]/;

describe('native-speaker review', () => {
  for (const lang of ['cnr', 'pl'] as const) {
    describe(lang, () => {
      const sections = reviewSections(lang);
      const entries = sections.flatMap((s) => s.entries);

      it('lists the course phrases first, then the English and Hebrew courses and the interface', () => {
        const units = lang === 'cnr' ? ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'] : ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'];
        expect(sections.slice(0, 8).map((s) => s.id)).toEqual(units.map((u) => `course-${u}`));
        expect(sections.map((s) => s.group)).toEqual([...sections.map((s) => s.group)].sort((a, b) => ['course', 'english', 'hebrew', 'interface'].indexOf(a) - ['course', 'english', 'hebrew', 'interface'].indexOf(b)));
        for (const id of ['course-dialogues-1', 'course-stories-1', 'course-sounds', 'en-e1-1', 'en-dialogues-1', 'en-stories-1', 'he-letters', 'he-h1', 'he-stories-1', 'ui-1']) {
          expect(sections.some((s) => s.id === id), id).toBe(true);
        }
        expect(entries.length).toBeGreaterThan(1500);
      });

      it('gives every text a unique id, a short section and no unresolved template', () => {
        expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
        expect(new Set(sections.map((s) => s.id)).size).toBe(sections.length);
        for (const s of sections) {
          expect(s.entries.length, s.id).toBeGreaterThan(0);
          expect(s.entries.length, s.id).toBeLessThanOrEqual(40);
          expect(s.id).toMatch(/^[a-z0-9-]+$/);
        }
        for (const e of entries) {
          expect(e.text, e.id).not.toBe('');
          expect(e.text, e.id).not.toMatch(/\{[^}]*\|[^}]*\}|\{name\}/);
          // Legend notes name the Hebrew letters they describe; nothing else shows Hebrew to the reviewer.
          if (e.source && !e.id.startsWith('he:legend ')) expect(e.source, e.id).not.toMatch(HEBREW);
        }
      });

      it('shows course phrases with their stress, in both gender forms', () => {
        const phrases = entries.filter((e) => e.kind === 'phrase');
        for (const p of phrases) {
          expect(p.stress, p.id).toBeTruthy();
          expect(p.stress!.map(notationToPlain).join(' / '), p.id).toBe(p.text);
          expect(p.text, p.id).not.toMatch(HEBREW);
        }
        if (lang === 'cnr') {
          expect(entries.find((e) => e.id === 'cnr:m4-11')).toMatchObject({ text: 'Gladan sam / Gladna sam', stress: ['[Gla]·dan sam', '[Glad]·na sam'], source: 'I’m hungry' });
          expect(entries.find((e) => e.id === 'cnr:m2-14')?.text).toBe('Zovem se David / Zovem se Ana');
          expect(entries.find((e) => e.id === 'cnr:dialogue apoteka 2')).toMatchObject({ text: 'Šta Vas boli?', source: 'What hurts?' });
        }
      });

      it('lists the texts written for its speakers in the other courses and the interface', () => {
        const meaning = entries.find((e) => e.id === 'en:e1-01 meaning');
        expect(meaning?.source).toBe('think');
        expect(meaning?.text).toBe(lang === 'cnr' ? 'misliti' : 'myśleć');
        expect(entries.find((e) => e.id === 'en:dialogue/nyc-coffee/title')?.source).toBe('A coffee shop in New York');
        expect(entries.find((e) => e.id === 'he:letter/alef/tip')?.source).toBe('Alef is silent: it only carries a vowel sign.');
        const ui = entries.filter((e) => e.id.startsWith('ui:') && !e.id.startsWith('ui:course/'));
        expect(ui.length).toBeGreaterThan(UI_ROWS.length * 0.8);
        expect(entries.find((e) => e.id === 'ui:Settings')?.text).toBe(lang === 'cnr' ? 'Podešavanja' : 'Ustawienia');
      });

      it('builds a plain-text report of the suggestions', () => {
        const [a, b, c] = entries;
        const store: ReviewStore = { name: 'Marko', v: { [a.id]: { s: 'ok' }, [b.id]: { s: 'fix', fix: 'Bolje', note: 'stress on the second syllable' }, [c.id]: { s: 'fix', fix: c.text, note: 'fine, but old-fashioned' } } };
        expect(reviewStats(sections, store)).toEqual({ total: entries.length, checked: 3, fixes: 2 });
        const report = buildReport(lang, sections, store, 'v9.9.9');
        expect(report).toContain(`text review – Learn app v9.9.9`);
        expect(report).toContain('Reviewer: Marko');
        expect(report).toContain(`Checked 3 of ${entries.length} texts · 2 suggestions`);
        expect(report).toContain(`1. [${b.id}]`);
        expect(report).toContain('Suggestion: Bolje');
        expect(report).toContain('Comment:    stress on the second syllable');
        // A comment without a new version reports no suggestion line.
        const second = report.slice(report.indexOf(`2. [${c.id}]`));
        expect(second).toContain('Comment:    fine, but old-fashioned');
        expect(second).not.toContain('Suggestion:');
        expect(buildReport(lang, sections, { name: '', v: { [a.id]: { s: 'ok' } } }, 'v1')).toContain('No suggestions – every checked text is correct.');
      });
    });
  }

  it('expands gender templates and names', () => {
    expect(genderForms('{Htio|Htjela} bih kafu', { m: 'David', f: 'Ana' })).toEqual(['Htio bih kafu', 'Htjela bih kafu']);
    expect(genderForms('Zovem se {name}', { m: 'David', f: 'Ana' })).toEqual(['Zovem se David', 'Zovem se Ana']);
    expect(genderForms('Hvala', { m: 'David', f: 'Ana' })).toEqual(['Hvala']);
  });

  describe('saved notes', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('are kept per language and survive broken storage', () => {
      const data = new Map<string, string>();
      vi.stubGlobal('localStorage', { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) });
      saveReview('cnr', { name: 'Ana', v: { 'cnr:m1-01': { s: 'ok' } } });
      expect(loadReview('cnr')).toEqual({ name: 'Ana', v: { 'cnr:m1-01': { s: 'ok' } } });
      expect(loadReview('pl')).toEqual({ name: '', v: {} });
      data.set('polish-learn:review:pl', '{not json');
      expect(loadReview('pl')).toEqual({ name: '', v: {} });
    });
  });
});
