import { PL_UNITS, type LegendRow } from '../data';
import { CAN_DO } from '../data/canDo';
import { CNR_ROLEPLAYS } from '../data/cnr/dialogues';
import { CNR_CONTRAST_GROUPS } from '../data/cnr/pairs';
import { CNR_STORIES } from '../data/cnr/stories';
import { CNR_UNITS } from '../data/cnr/units';
import { PL_ROLEPLAYS, type Roleplay } from '../data/dialogues';
import { EN_ROLEPLAYS } from '../data/en/dialogues';
import { EN_CONTRAST_GROUPS } from '../data/en/pairs';
import { EN_COMMON, EN_STORIES } from '../data/en/stories';
import { EN_LEGEND, EN_SITUATIONS, EN_UNITS } from '../data/en/units';
import { HE_LETTERS } from '../data/he/alphabet';
import { HE_ROLEPLAYS } from '../data/he/dialogues';
import { HE_CONTRAST_GROUPS } from '../data/he/pairs';
import { HE_COMMON, HE_STORIES } from '../data/he/stories';
import { HE_LEGEND, HE_UNITS } from '../data/he/units';
import { PL_CONTRAST_GROUPS, type ContrastGroup } from '../data/minimalPairs';
import { PL_STORIES, type Story } from '../data/stories';
import type { Unit } from '../data/types';
import type { Loc } from '../i18n/lang';
import { UI_ROWS } from '../i18n/strings';
import { toSyllableNotation as cnrSyllables } from './cnrPhonetics';
import { COURSES } from './course';
import { toSyllableNotation as plSyllables } from './polishPhonetics';
import { notationToPlain } from './syllables';

/**
 * Native-speaker review of the Polish and Montenegrin texts (views/Review). A reviewer opens
 * #/review/pl or #/review/cnr, marks every text as correct or suggests a better version, and sends
 * the notes back as a plain-text report. Two kinds of text are listed:
 *   - phrases of the course in that language (what learners say), with their stressed syllables
 *   - texts written in that language for its speakers: the English and Hebrew courses' meanings,
 *     tips, dialogues and stories, and the interface strings (i18n/strings)
 * The lists are built from the course files, so new content shows up without extra work. Identical
 * pairs of original and translation are listed once; notes stay on the reviewer's device.
 */

export type ReviewLang = 'pl' | 'cnr';
export const REVIEW_LANGS: ReviewLang[] = ['cnr', 'pl'];

export function isReviewLang(v: unknown): v is ReviewLang {
  return v === 'pl' || v === 'cnr';
}

export interface ReviewEntry {
  /** Stable key in the report: course, place and field ("cnr:m5-03", "en:e2-04 tip"). */
  id: string;
  /** The text to check, in the reviewed language (the two gender forms joined with " / "). */
  text: string;
  /** Syllables with the stressed one in brackets, one per gender form (phrases only). */
  stress?: string[];
  /** The English original, or the meaning of a phrase. */
  source?: string;
  kind: 'phrase' | 'translation';
}

export type ReviewGroup = 'course' | 'english' | 'hebrew' | 'interface';
export const REVIEW_GROUPS: ReviewGroup[] = ['course', 'english', 'hebrew', 'interface'];

export interface ReviewSection {
  /** URL-safe id (#/review/cnr/<id>). */
  id: string;
  group: ReviewGroup;
  title: Loc<string>;
  /** Part n of N when a long list is split. */
  part?: [number, number];
  entries: ReviewEntry[];
}

const HEBREW = /[֐-׿]/;
const PAIR = /\{([^{}|]*)\|([^{}|]*)\}/g;
const PART_SIZE = 40;

/** The text of a template for a man and for a woman ("{Gladan|Gladna} sam"); one form when they match. */
export function genderForms(text: string, names: { m: string; f: string }): string[] {
  if (!text.includes('{')) return [text];
  const m = text.replace(PAIR, (_x, a: string) => a).replace(/\{name\}/g, names.m);
  const f = text.replace(PAIR, (_x, _a: string, b: string) => b).replace(/\{name\}/g, names.f);
  return m === f ? [m] : [m, f];
}

/** An English source to show next to a text (Hebrew is no help to a Polish or Montenegrin reviewer). */
const english = (s: string | undefined) => (s && !HEBREW.test(s) ? s : undefined);

/** Collects entries, skipping a pair of original and text already listed anywhere in the review. */
class Collector {
  entries: ReviewEntry[] = [];
  constructor(private seen: Set<string>) {}

  add(e: ReviewEntry): void {
    const text = e.text.trim();
    if (!text) return;
    const key = `${e.kind}\n${e.source ?? ''}\n${text}`;
    if (this.seen.has(key)) return;
    this.seen.add(key);
    this.entries.push({ ...e, text });
  }
}

function split(section: ReviewSection): ReviewSection[] {
  const n = Math.ceil(section.entries.length / PART_SIZE);
  if (n <= 1) return section.entries.length ? [section] : [];
  return Array.from({ length: n }, (_, i) => ({
    ...section,
    id: `${section.id}-${i + 1}`,
    part: [i + 1, n] as [number, number],
    entries: section.entries.slice(i * PART_SIZE, (i + 1) * PART_SIZE),
  }));
}

const TITLES = {
  dialogues: { he: 'שיחות', en: 'Dialogues' },
  stories: { he: 'סיפורים קצרים', en: 'Mini stories' },
  sounds: { he: 'מעבדת הצלילים', en: 'Sound lab' },
  letters: { he: 'אלף-בית', en: 'Alef-Bet' },
  interface: { he: 'ממשק', en: 'Interface' },
  names: { he: 'שמות הקורסים', en: 'Course names' },
  canDo: { he: 'מה כבר אפשר לעשות', en: 'What you can already do' },
};

// ---------- Phrases of the reviewed language's own course ----------

/**
 * The hand-written syllables spelled exactly like the phrase: some are written in lower case
 * ("dzień dobry" for "Dzień dobry"), which a reviewer would rightly flag. Syllables that do not
 * match the phrase at all are rebuilt by the rules.
 */
function sameLetters(notation: string, text: string, rule: (t: string) => string): string {
  const plain = notationToPlain(notation);
  if (plain === text) return notation;
  if (plain.toLowerCase() !== text.toLowerCase() || plain.length !== text.length) return rule(text);
  let i = 0;
  return notation.replace(/[^[\]·]/g, () => text[i++]);
}

function courseSections(lang: ReviewLang, seen: Set<string>): ReviewSection[] {
  const names = COURSES[lang].defaultNames;
  const syllables = lang === 'pl' ? plSyllables : cnrSyllables;
  const units = lang === 'pl' ? PL_UNITS : CNR_UNITS;
  const roleplays: Roleplay[] = lang === 'pl' ? PL_ROLEPLAYS : CNR_ROLEPLAYS;
  const stories: Story[] = lang === 'pl' ? PL_STORIES : CNR_STORIES;
  const groups: ContrastGroup[] = lang === 'pl' ? PL_CONTRAST_GROUPS : CNR_CONTRAST_GROUPS;

  const phrase = (c: Collector, id: string, text: string, source: string | undefined, notation?: string) => {
    const forms = genderForms(text, names);
    const marks = notation ? genderForms(notation, names) : [];
    c.add({
      id,
      kind: 'phrase',
      text: forms.join(' / '),
      stress: forms.map((f, i) => (marks[i] ? sameLetters(marks[i], f, syllables) : syllables(f))),
      source: english(source),
    });
  };

  const out: ReviewSection[] = units.map((u) => {
    const c = new Collector(seen);
    for (const item of u.items) phrase(c, `${lang}:${item.id}`, item.polish, item.english, item.syllablesPolish);
    return { id: `course-${u.id}`, group: 'course', title: { he: u.title, en: u.titleEn }, entries: c.entries };
  });

  const talk = new Collector(seen);
  for (const r of roleplays) {
    r.turns.forEach((t, i) => {
      phrase(talk, `${lang}:dialogue ${r.id} ${i + 1}`, t.line.polish, t.line.t.en);
      t.options.forEach((o, j) => phrase(talk, `${lang}:dialogue ${r.id} ${i + 1}.${j + 1}`, o.polish, o.t.en));
    });
  }
  out.push(...split({ id: 'course-dialogues', group: 'course', title: TITLES.dialogues, entries: talk.entries }));

  const tales = new Collector(seen);
  for (const s of stories) {
    phrase(tales, `${lang}:story ${s.id} title`, s.titlePl, s.title.en);
    s.lines.forEach((l, i) => phrase(tales, `${lang}:story ${s.id} ${i + 1}`, l.polish, l.t.en));
    s.questions.forEach((q, i) => {
      phrase(tales, `${lang}:story ${s.id} q${i + 1}`, q.q, q.t.en);
      q.options.forEach((o, j) => phrase(tales, `${lang}:story ${s.id} q${i + 1}.${j + 1}`, o.polish, o.t.en));
    });
  }
  out.push(...split({ id: 'course-stories', group: 'course', title: TITLES.stories, entries: tales.entries }));

  const sounds = new Collector(seen);
  for (const g of groups) {
    for (const p of g.pairs) {
      for (const w of [p.a, p.b]) phrase(sounds, `${lang}:sound ${p.id} ${w.polish}`, w.polish, w.english, w.syllablesPolish);
    }
  }
  out.push(...split({ id: 'course-sounds', group: 'course', title: TITLES.sounds, entries: sounds.entries }));
  return out;
}

// ---------- Texts written in the reviewed language for the English and Hebrew courses ----------

/**
 * Every { en, pl, cnr } text inside a structure (dialogues, stories, letter cards). The English
 * original is the "en" value, or – where that is Hebrew – the nearest phrase above it.
 */
function walk(node: unknown, path: string, lang: ReviewLang, c: Collector, names: { m: string; f: string }, context?: string): void {
  if (!node || typeof node !== 'object') return;
  const o = node as Record<string, unknown>;
  const own = o[lang];
  if (typeof o.en === 'string' && typeof own === 'string') {
    c.add({ id: path, kind: 'translation', text: genderForms(own, names).join(' / '), source: english(o.en) ?? context });
    return;
  }
  const phrase = typeof o.polish === 'string' ? o.polish : typeof o.q === 'string' ? o.q : undefined;
  const here = english(phrase) ?? context;
  if (Array.isArray(node)) {
    node.forEach((v, i) => {
      const id = v && typeof v === 'object' && typeof (v as { id?: unknown }).id === 'string' ? (v as { id: string }).id : String(i + 1);
      walk(v, `${path}/${id}`, lang, c, names, here);
    });
  } else {
    for (const [k, v] of Object.entries(o)) walk(v, `${path}/${k}`, lang, c, names, here);
  }
}

function translatedUnits(course: 'en' | 'he', units: Unit[], lang: ReviewLang, seen: Set<string>): ReviewSection[] {
  const names = COURSES[course].defaultNames;
  const forms = (t: string) => genderForms(t, names).join(' / ');
  return units.map((u) => {
    const c = new Collector(seen);
    const ul = u.loc?.[lang];
    if (ul) {
      c.add({ id: `${course}:${u.id} title`, kind: 'translation', text: ul.title, source: u.titleEn });
      c.add({ id: `${course}:${u.id} subtitle`, kind: 'translation', text: ul.subtitle, source: u.subtitleEn });
      c.add({ id: `${course}:${u.id} description`, kind: 'translation', text: ul.description, source: u.descriptionEn });
    }
    for (const item of u.items) {
      const own = item.loc?.[lang];
      // The English course's phrase is English; the Hebrew course's meaning is given in English.
      const original = course === 'en' ? forms(item.polish) : forms(item.english);
      if (own) {
        c.add({ id: `${course}:${item.id} meaning`, kind: 'translation', text: forms(own.meaning), source: original });
        c.add({ id: `${course}:${item.id} tip`, kind: 'translation', text: forms(own.tip), source: english(item.articulationTipEn) ?? original });
        if (own.note) c.add({ id: `${course}:${item.id} note`, kind: 'translation', text: forms(own.note), source: english(item.culturalNoteEn) ?? original });
      }
      const sit = course === 'en' ? EN_SITUATIONS[item.id]?.[lang] : undefined;
      if (sit) c.add({ id: `${course}:${item.id} situation`, kind: 'translation', text: forms(sit), source: original });
    }
    return { id: `${course}-${u.id}`, group: course === 'en' ? 'english' : 'hebrew', title: { he: u.title, en: u.titleEn, ...(u.loc?.pl ? { pl: u.loc.pl.title } : {}), ...(u.loc?.cnr ? { cnr: u.loc.cnr.title } : {}) }, entries: c.entries } satisfies ReviewSection;
  }).flatMap(split);
}

function translatedSounds(course: 'en' | 'he', groups: ContrastGroup[], legend: LegendRow[], lang: ReviewLang, seen: Set<string>): ReviewSection[] {
  const c = new Collector(seen);
  for (const g of groups) {
    const own = g.loc?.[lang];
    if (own) {
      c.add({ id: `${course}:sound ${g.id} a`, kind: 'translation', text: own.descriptionA, source: english(g.descriptionAEn) });
      c.add({ id: `${course}:sound ${g.id} b`, kind: 'translation', text: own.descriptionB, source: english(g.descriptionBEn) });
    }
    for (const p of g.pairs) {
      for (const w of [p.a, p.b]) {
        const meaning = w.loc?.[lang];
        if (meaning) c.add({ id: `${course}:sound ${p.id} ${w.polish}`, kind: 'translation', text: meaning, source: english(w.english) ?? w.polish });
      }
    }
  }
  for (const row of legend) {
    const own = row.loc?.[lang];
    if (own) c.add({ id: `${course}:legend ${row.pl}`, kind: 'translation', text: `${own.sound} – ${own.note}`, source: `${row.pl}: ${row.en} – ${row.noteEn}` });
  }
  return split({ id: `${course}-sounds`, group: course === 'en' ? 'english' : 'hebrew', title: TITLES.sounds, entries: c.entries });
}

function walked(id: string, group: ReviewGroup, title: Loc<string>, root: unknown, prefix: string, lang: ReviewLang, seen: Set<string>, names: { m: string; f: string }): ReviewSection[] {
  const c = new Collector(seen);
  walk(root, prefix, lang, c, names);
  return split({ id, group, title, entries: c.entries });
}

// ---------- The whole review ----------

/** Every section of the review of one language, in the order a reviewer goes through them. */
export function reviewSections(lang: ReviewLang): ReviewSection[] {
  const seen = new Set<string>();
  const en = COURSES.en.defaultNames;
  const he = COURSES.he.defaultNames;
  const ui = new Collector(seen);
  for (const row of UI_ROWS) ui.add({ id: `ui:${row[0]}`, kind: 'translation', text: row[lang === 'pl' ? 1 : 2], source: row[0] });
  return [
    ...courseSections(lang, seen),
    ...translatedUnits('en', EN_UNITS, lang, seen),
    ...walked('en-dialogues', 'english', TITLES.dialogues, EN_ROLEPLAYS, 'en:dialogue', lang, seen, en),
    ...walked('en-stories', 'english', TITLES.stories, { stories: EN_STORIES, common: EN_COMMON }, 'en:story', lang, seen, en),
    ...translatedSounds('en', EN_CONTRAST_GROUPS, EN_LEGEND, lang, seen),
    ...walked('he-letters', 'hebrew', TITLES.letters, HE_LETTERS, 'he:letter', lang, seen, he),
    ...translatedUnits('he', HE_UNITS, lang, seen),
    ...walked('he-dialogues', 'hebrew', TITLES.dialogues, HE_ROLEPLAYS, 'he:dialogue', lang, seen, he),
    ...walked('he-stories', 'hebrew', TITLES.stories, { stories: HE_STORIES, common: HE_COMMON }, 'he:story', lang, seen, he),
    ...translatedSounds('he', HE_CONTRAST_GROUPS, HE_LEGEND, lang, seen),
    ...walked('ui-can-do', 'interface', TITLES.canDo, CAN_DO, 'ui:can-do', lang, seen, en),
    ...walked('ui-courses', 'interface', TITLES.names, COURSES, 'ui:course', lang, seen, en),
    ...split({ id: 'ui', group: 'interface', title: TITLES.interface, entries: ui.entries }),
  ];
}

// ---------- The reviewer's notes ----------

export interface Verdict {
  /** ok = correct as it is; fix = a better version and/or a comment. */
  s: 'ok' | 'fix';
  fix?: string;
  note?: string;
}

export interface ReviewStore {
  name: string;
  v: Record<string, Verdict>;
}

const storeKey = (lang: ReviewLang) => `polish-learn:review:${lang}`;

export function loadReview(lang: ReviewLang): ReviewStore {
  try {
    const raw = localStorage.getItem(storeKey(lang));
    const parsed = raw ? (JSON.parse(raw) as Partial<ReviewStore>) : null;
    if (parsed && typeof parsed === 'object' && parsed.v && typeof parsed.v === 'object') return { name: typeof parsed.name === 'string' ? parsed.name : '', v: parsed.v };
  } catch {
    // Unreadable or blocked storage: start a fresh review.
  }
  return { name: '', v: {} };
}

export function saveReview(lang: ReviewLang, store: ReviewStore): void {
  try {
    localStorage.setItem(storeKey(lang), JSON.stringify(store));
  } catch {
    // Storage disabled: the notes last until the page is closed.
  }
}

export function reviewStats(sections: ReviewSection[], store: ReviewStore) {
  let total = 0;
  let checked = 0;
  let fixes = 0;
  for (const s of sections) {
    for (const e of s.entries) {
      total++;
      const v = store.v[e.id];
      if (!v) continue;
      checked++;
      if (v.s === 'fix') fixes++;
    }
  }
  return { total, checked, fixes };
}

export function sectionLabel(s: ReviewSection, title: string): string {
  return s.part ? `${title} (${s.part[0]}/${s.part[1]})` : title;
}

const GROUP_NAMES: Record<ReviewGroup, string> = {
  course: 'Course phrases',
  english: 'Everyday English',
  hebrew: 'Hebrew from Zero',
  interface: 'Interface',
};

/** The notes as plain text, to send back by message or e-mail (written in English for the course author). */
export function buildReport(lang: ReviewLang, sections: ReviewSection[], store: ReviewStore, version: string): string {
  const { total, checked, fixes } = reviewStats(sections, store);
  const lines = [
    `${COURSES[lang].name.en} text review – Learn app ${version}`,
    `Reviewer: ${store.name.trim() || '(no name)'}`,
    `Checked ${checked} of ${total} texts · ${fixes} suggestion${fixes === 1 ? '' : 's'}`,
  ];
  const progress = sections
    .map((s) => ({ s, done: s.entries.filter((e) => store.v[e.id]).length }))
    .filter(({ done }) => done > 0)
    .map(({ s, done }) => `${GROUP_NAMES[s.group]} › ${sectionLabel(s, s.title.en)}: ${done}/${s.entries.length}`);
  if (progress.length) lines.push('', 'Checked so far:', ...progress.map((p) => `  ${p}`));

  let n = 0;
  const notes: string[] = [];
  for (const s of sections) {
    for (const e of s.entries) {
      const v = store.v[e.id];
      if (v?.s !== 'fix') continue;
      n++;
      notes.push('', `${n}. [${e.id}] ${GROUP_NAMES[s.group]} › ${sectionLabel(s, s.title.en)}`);
      if (e.source) notes.push(`   English:    ${e.source}`);
      notes.push(`   Text:       ${e.text}`);
      if (v.fix && v.fix !== e.text) notes.push(`   Suggestion: ${v.fix}`);
      if (v.note) notes.push(`   Comment:    ${v.note}`);
    }
  }
  lines.push('', n ? 'Suggestions:' : 'No suggestions – every checked text is correct.', ...notes);
  return lines.join('\n');
}
