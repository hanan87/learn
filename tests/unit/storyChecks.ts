import { expect } from 'vitest';
import type { Lang, Loc } from '../../src/i18n/lang';

type StoriesModule = typeof import('../../src/data/stories');

/**
 * Checks shared by every course's mini stories (run with the course loaded): four complete stories,
 * every word of every line explained, everything translated into the course's interface languages,
 * and a voice for every character.
 */
export function checkStories(stories: StoriesModule, uiLangs: Lang[]): void {
  const { STORIES, SPEAKER_VOICE, lookupWord, wordKey } = stories;
  expect(STORIES).toHaveLength(4);
  expect(new Set(STORIES.map((s) => s.id)).size).toBe(4);

  const translated = (v: Loc<string> | undefined, where: string) => {
    expect(v, where).toBeTruthy();
    for (const l of uiLangs) expect(v![l], `${where} [${l}]`).toBeTruthy();
  };

  for (const s of STORIES) {
    expect(s.lines.length, s.id).toBeGreaterThanOrEqual(6);
    expect(s.lines.length, s.id).toBeLessThanOrEqual(8);
    expect(s.titlePl, s.id).toBeTruthy();
    translated(s.title, `${s.id} title`);
    translated(s.blurb, `${s.id} blurb`);

    // Two characters, each with a voice.
    const speakers = new Set(s.lines.map((l) => l.speaker));
    expect(speakers.size, s.id).toBe(2);
    for (const sp of speakers) expect(SPEAKER_VOICE[sp], `${s.id}: voice of ${sp}`).toMatch(/^[fm]$/);

    const used = new Set<string>();
    for (const line of s.lines) {
      translated(line.t, `${s.id}: ${line.polish}`);
      for (const token of line.polish.split(/\s+/)) {
        const key = wordKey(token);
        if (!key) continue;
        used.add(key);
        expect(lookupWord(s, token), `${s.id}: "${token}"`).toBeTruthy();
      }
    }
    // Every glossary entry belongs to a word of the story (catches misspelled keys).
    for (const [key, entry] of Object.entries(s.glossary)) {
      expect(used.has(key), `${s.id}: unused glossary key "${key}"`).toBe(true);
      translated(entry.t, `${s.id}: ${key}`);
      if (entry.note) translated(entry.note, `${s.id}: note of ${key}`);
      // A dictionary form always comes with the explanation of the change.
      if (entry.base) expect(entry.note, `${s.id}: ${key} has a base form but no note`).toBeTruthy();
    }

    expect(s.questions).toHaveLength(2);
    for (const q of s.questions) {
      translated(q.t, `${s.id}: ${q.q}`);
      expect(q.options.filter((o) => o.correct), q.q).toHaveLength(1);
      expect(new Set(q.options.map((o) => o.polish)).size, q.q).toBe(q.options.length);
      for (const o of q.options) translated(o.t, `${s.id}: ${o.polish}`);
    }
  }
}
