import { ALL_ITEMS, applyProfile, getProfile } from '..';
import { ROLEPLAYS } from '../dialogues';
import { CONTRAST_GROUPS } from '../minimalPairs';
import { STORIES } from '../stories';
import { personalize, type LearnerProfile } from '../../lib/personalize';

/**
 * Every distinct word the English course says (items, back-chaining steps, roleplays, Sound Lab, stories),
 * lowercase, with both default names. Used to check that the lexicon covers the whole course.
 */
export function enCourseWords(): string[] {
  const words = new Set<string>();
  const add = (text: string) => {
    for (const raw of text.split(/[\s-]+/)) {
      const w = raw.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '').toLowerCase().replace(/’/g, "'");
      if (w) words.add(w);
    }
  };
  const saved = getProfile();
  const profiles: LearnerProfile[] = [
    { gender: 'm', name: '' },
    { gender: 'f', name: '' },
  ];
  try {
    for (const profile of profiles) {
      applyProfile(profile);
      for (const item of ALL_ITEMS) {
        add(item.polish);
        item.backchainingSteps.forEach(add);
      }
      for (const r of ROLEPLAYS) for (const t of r.turns) {
        add(personalize(t.line.polish, profile));
        for (const o of t.options) add(personalize(o.polish, profile));
      }
    }
  } finally {
    applyProfile(saved);
  }
  for (const g of CONTRAST_GROUPS) for (const p of g.pairs) {
    add(p.a.polish);
    add(p.b.polish);
  }
  for (const s of STORIES) {
    add(s.titlePl);
    s.lines.forEach((l) => add(l.polish));
    for (const q of s.questions) {
      add(q.q);
      q.options.forEach((o) => add(o.polish));
    }
  }
  return [...words].sort();
}
