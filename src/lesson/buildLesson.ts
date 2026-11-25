import { ALL_ITEMS, getItem, getUnit, getUnitOfItem, UNITS } from '../data';
import { COURSE } from '../lib/course';
import { lessonsOfUnit, type LessonDef } from '../data/lessons';
import { pictureOf } from '../data/pictures';
import { getLetter, HE_LETTERS, type HeLetter } from '../data/he/alphabet';
import { CONTRAST_GROUPS, type ContrastGroup, type MinimalPair } from '../data/minimalPairs';
import { SOUND_INFO, type SoundKey } from '../data/sounds';
import type { CourseUnitId, LearningItem, SoundTag } from '../data/types';
import { detectSounds } from '../lib/phonetics';
import { pick, sample, shuffle } from '../lib/random';
import { mispronounce } from '../lib/simulate';
import { normalize, stripDiacritics } from '../lib/text';
import { respellHebrewLatin } from '../lib/latinRespell';
import { itemWeakness, summarizeSounds, type ProgressState } from '../state/ProgressContext';

/**
 * Lesson Engine step generation. A lesson walks the learner through five skill stages:
 *   1. learn         – Learn & Shadow card (listen, record, compare, feedback)
 *   2. listen-*      – Listening comprehension (meaning / minimal-pair sound)
 *   3. assemble/fill/choose – Reading & context (word bank, missing word, spelling recognition)
 *   4. write         – Writing with the Polish virtual keyboard
 *   5. recall        – Active-recall speaking from a situation
 *
 * Alef-Bet lessons (Hebrew course) teach letters first: a card per new letter or vowel sign, a sound
 * quiz, then the lesson's words – learn, read (pick the transcription), hear (pick the written word)
 * and write.
 */

export type LessonStep =
  | { kind: 'learn'; key: string; itemId: string }
  | { kind: 'listen-meaning'; key: string; itemId: string; optionIds: string[] }
  | { kind: 'listen-picture'; key: string; itemId: string; optionIds: string[] }
  | { kind: 'listen-pair'; key: string; group: ContrastGroup; pair: MinimalPair; side: 'a' | 'b' }
  | { kind: 'assemble'; key: string; itemId: string; bank: string[] }
  | { kind: 'fill-blank'; key: string; itemId: string; blankIndex: number; options: string[] }
  | { kind: 'choose-spelling'; key: string; itemId: string; options: string[] }
  | { kind: 'write'; key: string; itemId: string }
  | { kind: 'recall'; key: string; itemId: string }
  | { kind: 'letter-learn'; key: string; letterId: string }
  | { kind: 'letter-sound'; key: string; letterId: string; optionIds: string[] }
  | { kind: 'read-word'; key: string; itemId: string; options: string[] }
  | { kind: 'hear-word'; key: string; itemId: string; optionIds: string[] };

export const STAGE_LABELS: Record<LessonStep['kind'], { he: string; en: string }> = {
  learn: { he: 'לימוד והאזנה', en: 'Learn & shadow' },
  'listen-meaning': { he: 'הבנת הנשמע', en: 'Listening' },
  'listen-picture': { he: 'שמיעה ותמונה', en: 'Listen and pick the picture' },
  'listen-pair': { he: 'זוג מינימלי', en: 'Minimal pair' },
  assemble: { he: 'הרכבת משפט', en: 'Build the sentence' },
  'fill-blank': { he: 'השלמת מילה', en: 'Fill the gap' },
  'choose-spelling': { he: 'קריאה וזיהוי', en: 'Reading' },
  write: { he: 'כתיבה', en: 'Writing' },
  recall: { he: 'דיבור מהזיכרון', en: 'Speak from memory' },
  'letter-learn': { he: 'אות חדשה', en: 'New letter' },
  'letter-sound': { he: 'צליל האות', en: 'Letter sounds' },
  'read-word': { he: 'קריאת מילה', en: 'Read the word' },
  'hear-word': { he: 'שמיעה וקריאה', en: 'Listen and find' },
};

const TAG_TO_GROUP: Partial<Record<SoundTag, string>> = {
  'hard-sibilant': 'sz-s',
  'soft-sibilant': 'cz-c',
  'l-vs-ł': 'l-l',
  w: 'w-l',
  'y-vowel': 'y-i',
  nasal: 'nasal',
};

/** Split a phrase into word tokens without trailing punctuation. */
export function tokens(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?]+$/, ''))
    .filter(Boolean);
}

/** Forms of address that make good "register" blanks, with the look-alikes offered next to them. */
const REGISTER_SWAPS: Record<string, string[]> = {
  pl: {
    Pan: ['Pani', 'ty'],
    Pani: ['Pan', 'ty'],
    Panu: ['Pani', 'ci'],
    masz: ['ma', 'mam'],
    ma: ['masz', 'mam'],
    ty: ['Pan', 'Pani'],
  },
  cnr: { ste: ['si', 'sam'], si: ['ste', 'sam'], Vi: ['ti', 'Vam'], ti: ['Vi', 'te'], Izvinite: ['Izvini', 'Izvoli'] },
  // English has no formal "you"; politeness lives in whole phrases (Could you…), not in one word.
  en: {},
  // Hebrew has no formal "you" either.
  he: {},
}[COURSE];
const REGISTER_WORDS = Object.keys(REGISTER_SWAPS);

/** Items used for distractors: the item's own unit, or the whole course for custom words. */
function poolFor(item: LearningItem): LearningItem[] {
  const unitId = getUnitOfItem(item.id);
  return unitId && unitId !== 'custom' ? getUnit(unitId).items : ALL_ITEMS;
}

function otherWords(item: LearningItem, pool: LearningItem[]): string[] {
  const own = new Set(tokens(item.polish).map((w) => normalize(w)));
  const words = pool.filter((i) => i.id !== item.id).flatMap((i) => tokens(i.polish));
  const unique = [...new Map(words.map((w) => [normalize(w), w])).values()];
  return unique.filter((w) => !own.has(normalize(w)));
}

function listenStep(item: LearningItem, keySuffix = ''): LessonStep {
  const distractors = sample(
    poolFor(item).filter((i) => i.id !== item.id && i.hebrew !== item.hebrew),
    3,
  ).map((i) => i.id);
  return { kind: 'listen-meaning', key: `listen-${item.id}${keySuffix}`, itemId: item.id, optionIds: shuffle([item.id, ...distractors]) };
}

/**
 * Hear the phrase, tap its picture among three others from the unit. Every option has a different
 * picture; without three such distractors there is no picture question (null).
 */
function pictureStep(item: LearningItem): LessonStep | null {
  const own = pictureOf(item.id);
  if (!own) return null;
  const seen = new Set([own]);
  const distractors: string[] = [];
  for (const other of shuffle(poolFor(item).filter((i) => i.id !== item.id && i.hebrew !== item.hebrew))) {
    const pic = pictureOf(other.id);
    if (pic && !seen.has(pic) && distractors.length < 3) {
      seen.add(pic);
      distractors.push(other.id);
    }
  }
  if (distractors.length < 3) return null;
  return { kind: 'listen-picture', key: `picture-${item.id}`, itemId: item.id, optionIds: shuffle([item.id, ...distractors]) };
}

/** Listening questions for a set of items: one of them, when it can, as a picture question. */
function listeningSteps(items: LearningItem[]): LessonStep[] {
  let picture: LessonStep | null = null;
  return items.map((item) => {
    if (!picture) {
      picture = pictureStep(item);
      if (picture) return picture;
    }
    return listenStep(item);
  });
}

function readingStep(item: LearningItem, preferBlank: boolean): LessonStep {
  const pool = poolFor(item);
  const words = tokens(item.polish);
  if (words.length >= 2) {
    const registerIdx = words.findIndex((w) => REGISTER_WORDS.includes(w));
    if (preferBlank || registerIdx >= 0) {
      const blankIndex = registerIdx >= 0 ? registerIdx : words.reduce((best, w, i) => (w.length > words[best].length ? i : best), 0);
      const answer = words[blankIndex];
      const distractors = [...(REGISTER_SWAPS[answer] ?? []), ...sample(otherWords(item, pool), 4)]
        .filter((w, i, arr) => normalize(w) !== normalize(answer) && arr.findIndex((x) => normalize(x) === normalize(w)) === i)
        .slice(0, 3);
      return { kind: 'fill-blank', key: `fill-${item.id}`, itemId: item.id, blankIndex, options: shuffle([answer, ...distractors]) };
    }
    const extra = sample(otherWords(item, pool), Math.min(3, Math.max(2, 6 - words.length)));
    return { kind: 'assemble', key: `asm-${item.id}`, itemId: item.id, bank: shuffle([...words, ...extra]) };
  }

  // Single word: recognize the correct spelling among realistic look-alikes.
  const correct = words[0] ?? item.polish;
  const candidates = [stripDiacritics(correct.toLocaleLowerCase()), mispronounce(correct), ...sample(otherWords(item, pool), 3)];
  const options = [correct];
  for (const c of candidates) {
    if (options.length >= 4) break;
    if (!options.some((o) => normalize(o) === normalize(c))) options.push(c);
  }
  return { kind: 'choose-spelling', key: `spell-${item.id}`, itemId: item.id, options: shuffle(options) };
}

function pairStep(group: ContrastGroup, keySuffix = ''): LessonStep {
  const pair = pick(group.pairs);
  return { kind: 'listen-pair', key: `pair-${group.id}-${pair.id}${keySuffix}`, group, pair, side: Math.random() < 0.5 ? 'a' : 'b' };
}


/** A reading as each learner sees it: English, Polish and Montenegrin letters (Montenegrin writes kh and h alike). */
function readingForms(notation: string): string[] {
  const plain = notation.replace(/[·[\]\s]/g, '').toLowerCase();
  return [plain, respellHebrewLatin(plain, 'pl'), respellHebrewLatin(plain, 'cnr')];
}
const sameReading = (a: string, b: string) => {
  const fa = readingForms(a);
  return readingForms(b).some((f, i) => f === fa[i]);
};

/**
 * Letters and vowel signs share a sound with a look-alike (ט/ת, כּ/ק), and Montenegrin writes kh and h
 * alike: offer each sound once, as every learner sees it.
 */
function soundOptions(target: HeLetter, known: Set<string>): string[] {
  const sameKind = HE_LETTERS.filter((l) => l.kind === target.kind && l.quiz !== false && l.id !== target.id);
  const chosen: HeLetter[] = [target];
  // Letters the learner already knows come first; unknown ones only fill a short list (the first vowels).
  for (const l of [...shuffle(sameKind.filter((x) => known.has(x.id))), ...shuffle(sameKind.filter((x) => !known.has(x.id)))]) {
    if (chosen.length < 4 && !chosen.some((c) => sameReading(c.sound, l.sound))) chosen.push(l);
  }
  return shuffle(chosen.map((l) => l.id));
}

/** Readings that differ by one sound the learner could confuse (b/v, k/kh, p/f, sh/s, a/o, e/i…). */
const SWAP: Record<string, string[]> = {
  b: ['v'], v: ['b'], k: ['kh'], kh: ['k'], p: ['f'], f: ['p'], sh: ['s'], s: ['sh', 'ts'], ts: ['s'],
  t: ['d'], d: ['t', 'r'], r: ['d'], m: ['n'], n: ['m'], g: ['k'], z: ['s'], l: ['r'],
  a: ['o'], o: ['u', 'a'], u: ['o'], e: ['i'], i: ['e'],
};

export function misreadings(notation: string): string[] {
  const out = new Set<string>();
  for (const m of notation.matchAll(/kh|sh|ts|[a-z]/g)) {
    for (const alt of SWAP[m[0]] ?? []) out.add(notation.slice(0, m.index) + alt + notation.slice(m.index! + m[0].length));
  }
  out.delete(notation);
  return [...out];
}

function letterSoundStep(letter: HeLetter, known: Set<string>): LessonStep {
  return { kind: 'letter-sound', key: `sound-${letter.id}`, letterId: letter.id, optionIds: soundOptions(letter, known) };
}

/** Pick the transcription of a written word, among misreadings and other words the learner knows. */
function readWordStep(item: LearningItem, knownWords: LearningItem[]): LessonStep {
  const right = item.phoneticHebrew;
  const options = [right];
  const add = (o: string) => {
    if (options.length < 4 && !options.some((x) => sameReading(x, o))) options.push(o);
  };
  sample(misreadings(right), 2).forEach(add);
  shuffle(knownWords.filter((w) => w.id !== item.id)).forEach((w) => add(w.phoneticHebrew));
  misreadings(right).forEach(add);
  return { kind: 'read-word', key: `read-${item.id}`, itemId: item.id, options: shuffle(options) };
}

/** Hear a word and pick how it is written. */
function hearWordStep(heard: LearningItem, knownWords: LearningItem[]): LessonStep {
  const others = shuffle(knownWords.filter((w) => w.id !== heard.id && normalize(w.polish) !== normalize(heard.polish)));
  return { kind: 'hear-word', key: `hear-${heard.id}`, itemId: heard.id, optionIds: shuffle([heard.id, ...others.slice(0, 3).map((w) => w.id)]) };
}

/** An Alef-Bet lesson: new letters, their sounds, then reading, hearing and writing the lesson's words. */
function buildLetterLesson(lesson: LessonDef, letters: string[]): LessonStep[] {
  const earlier = lessonsOfUnit(lesson.unitId).filter((l) => l.number <= lesson.number);
  const known = new Set(earlier.flatMap((l) => l.letters ?? []));
  const knownWords = earlier.flatMap((l) => l.itemIds).map((id) => getItem(id)!).filter(Boolean);
  const words = lesson.itemIds.map((id) => getItem(id)!).filter(Boolean);
  const steps: LessonStep[] = [];

  for (const id of letters) steps.push({ kind: 'letter-learn', key: `letter-${id}`, letterId: id });
  for (const id of shuffle(letters)) {
    const letter = getLetter(id);
    if (letter && letter.quiz !== false) steps.push(letterSoundStep(letter, known));
  }

  for (const item of words) steps.push({ kind: 'learn', key: `learn-${item.id}`, itemId: item.id });
  for (const item of shuffle(words)) steps.push(readWordStep(item, knownWords));
  steps.push(hearWordStep(pick(words), knownWords));

  const writeItems = [...words].sort((a, b) => a.polish.length - b.polish.length).slice(0, 2);
  for (const item of writeItems) steps.push({ kind: 'write', key: `write-${item.id}`, itemId: item.id });
  return steps;
}

/** The minimal-pair group that fits a set of items: their sound tags first, then the sounds found in them. */
function pairGroupFor(items: LearningItem[], unitId: string): ContrastGroup | null {
  const tags = items.flatMap((i) => i.soundTags ?? []);
  const sounds = items.flatMap((i) => detectSounds(i.polish));
  const groupId =
    tags.map((t) => TAG_TO_GROUP[t]).find(Boolean) ?? sounds.map((s) => SOUND_INFO[s].groupId).find(Boolean) ?? (unitId === UNITS[0].id ? CONTRAST_GROUPS[0].id : null);
  return (groupId && CONTRAST_GROUPS.find((g) => g.id === groupId)) || null;
}

export function buildLesson(lesson: LessonDef): LessonStep[] {
  if (lesson.letters) return buildLetterLesson(lesson, lesson.letters);
  const items = lesson.itemIds.map((id) => getItem(id)!).filter(Boolean);
  const steps: LessonStep[] = [];

  // 1. Learn & Shadow
  for (const item of items) steps.push({ kind: 'learn', key: `learn-${item.id}`, itemId: item.id });

  // 2. Listening comprehension (one question with pictures) + one minimal pair from the lesson's sound features
  steps.push(...listeningSteps(shuffle(items)));
  const group = pairGroupFor(items, lesson.unitId);
  if (group) steps.push(pairStep(group));

  // 3. Reading & context
  shuffle(items)
    .slice(0, 3)
    .forEach((item, i) => steps.push(readingStep(item, i % 2 === 1)));

  // 4. Writing – prefer shorter items so typing on a phone stays reasonable.
  const writeItems = [...items].sort((a, b) => a.polish.length - b.polish.length).slice(0, 2);
  for (const item of writeItems) steps.push({ kind: 'write', key: `write-${item.id}`, itemId: item.id });

  // 5. Active recall speaking – prefer items not used in writing.
  const recallPool = items.filter((i) => !writeItems.includes(i));
  for (const item of recallPool.length >= 2 ? sample(recallPool, 2) : sample(items, 2)) steps.push({ kind: 'recall', key: `recall-${item.id}`, itemId: item.id });

  return steps;
}

/** Questions in a unit test (the passing score is TEST_PASS_SCORE in state/ProgressContext). */
export const TEST_SIZE = 12;

/** Route id of a unit's test, opened in the lesson player ("test-u2"). */
export const testLessonId = (unitId: string) => `test-${unitId}`;

/**
 * End-of-unit test: twelve questions over every phrase of the unit, without the learn cards.
 * Five listening (one a minimal pair when the unit has a sound contrast), three reading, two writing
 * and two speaking from memory, each item used once per skill. The Alef-Bet unit asks four letter
 * sounds, four written words to read, two heard words to find and two words to write.
 */
export function buildUnitTest(unitId: CourseUnitId): LessonStep[] {
  const lessons = lessonsOfUnit(unitId);
  const items = shuffle(lessons.flatMap((l) => l.itemIds).map((id) => getItem(id)!).filter(Boolean));
  if (!items.length) return [];

  if (lessons.some((l) => l.letters)) {
    const letterIds = lessons.flatMap((l) => l.letters ?? []);
    const known = new Set(letterIds);
    const quizLetters = sample(letterIds.map((id) => getLetter(id)).filter((l): l is HeLetter => !!l && l.quiz !== false), 4);
    // Words for reading and hearing are different ones; writing takes two short words from the rest.
    const read = items.slice(0, 4);
    const heard = items.slice(4, 6);
    const write = [...items.slice(6)].sort((a, b) => a.polish.length - b.polish.length).slice(0, 2);
    return [
      ...quizLetters.map((l) => letterSoundStep(l, known)),
      ...read.map((item) => readWordStep(item, items)),
      ...heard.map((item) => hearWordStep(item, items)),
      ...write.map((item): LessonStep => ({ kind: 'write', key: `write-${item.id}`, itemId: item.id })),
    ];
  }

  const group = pairGroupFor(items, unitId);
  const listen = listeningSteps(items.slice(0, group ? 4 : 5));
  if (group) listen.push(pairStep(group));
  // Reading starts after the listening items, so the same phrase is not met twice in a row.
  const reading = [...items.slice(5), ...items].slice(0, 3).map((item, i) => readingStep(item, i % 2 === 1));
  const readIds = new Set(reading.map((s) => ('itemId' in s ? s.itemId : '')));
  // Writing takes short phrases (typing on a phone), speaking the ones not written.
  const writeItems = [...items].filter((i) => !readIds.has(i.id)).sort((a, b) => a.polish.length - b.polish.length).slice(0, 2);
  const speakPool = items.filter((i) => !writeItems.includes(i) && !readIds.has(i.id));
  const speak = (speakPool.length >= 2 ? speakPool : items.filter((i) => !writeItems.includes(i))).slice(0, 2);
  return [
    ...listen,
    ...reading,
    ...writeItems.map((item): LessonStep => ({ kind: 'write', key: `write-${item.id}`, itemId: item.id })),
    ...speak.map((item): LessonStep => ({ kind: 'recall', key: `recall-${item.id}`, itemId: item.id })),
  ];
}

/** Which skill a question checks, for the test intro and its summary. */
export type TestSkill = 'listen' | 'read' | 'write' | 'speak';
export const STEP_SKILL: Record<LessonStep['kind'], TestSkill | null> = {
  learn: null,
  'letter-learn': null,
  'listen-meaning': 'listen',
  'listen-picture': 'listen',
  'listen-pair': 'listen',
  'hear-word': 'listen',
  assemble: 'read',
  'fill-blank': 'read',
  'choose-spelling': 'read',
  'letter-sound': 'read',
  'read-word': 'read',
  write: 'write',
  recall: 'speak',
};

export const REINFORCEMENT_SIZE = 8;

/**
 * Personalized reinforcement lesson: exactly 8 exercises built from the learner's weakest
 * items (low pronunciation averages, writing errors, failed reviews, low mastery) and
 * weakest sounds. Each weak item gets the exercise type that targets its weakness.
 */
export function buildReinforcementLesson(state: ProgressState): LessonStep[] {
  const weakSounds = summarizeSounds(state).filter((s) => s.weak);
  const weakSet = new Set<SoundKey>(weakSounds.map((s) => s.key));

  const ranked = Object.entries(state.items)
    .map(([id, p]) => ({ item: getItem(id), p }))
    .filter((x): x is { item: LearningItem; p: (typeof state.items)[string] } => !!x.item && x.p.learned)
    .map(({ item, p }) => {
      const soundHits = detectSounds(item.polish).filter((s) => weakSet.has(s)).length;
      return { item, p, score: itemWeakness(p) + soundHits * 0.8 };
    })
    .sort((a, b) => b.score - a.score);

  const steps: LessonStep[] = [];
  const used = new Set<string>();
  const add = (s: LessonStep) => {
    if (steps.length < REINFORCEMENT_SIZE && !used.has(s.key)) {
      used.add(s.key);
      steps.push(s);
    }
  };

  // Up to two minimal-pair drills for the weakest sounds.
  const groups = [...new Set(weakSounds.map((s) => SOUND_INFO[s.key].groupId).filter(Boolean) as string[])];
  groups.slice(0, 2).forEach((g) => {
    const group = CONTRAST_GROUPS.find((c) => c.id === g);
    if (group) add(pairStep(group));
  });

  // One targeted exercise per weak item, matched to what it is weak in.
  for (const { item, p } of ranked.slice(0, 6)) {
    const pronWeak = p.pronAvg === null || p.pronAvg < 75;
    const writeWeak = p.writingAttempts > 0 && p.writingErrors / p.writingAttempts >= 0.34;
    if (writeWeak) add({ kind: 'write', key: `write-${item.id}`, itemId: item.id });
    else if (pronWeak) add({ kind: 'recall', key: `recall-${item.id}`, itemId: item.id });
    else add(listenStep(item));
  }

  // Fill the remaining slots with a different skill for the weakest items, then reading/listening.
  for (const { item } of ranked) {
    if (steps.length >= REINFORCEMENT_SIZE) break;
    add({ kind: 'write', key: `write-${item.id}`, itemId: item.id });
    add(readingStep(item, true));
    add(listenStep(item));
  }
  // Very little history: pad with minimal pairs from the most common Polish contrasts
  // (a second round uses a key suffix, since there are fewer groups than exercise slots).
  for (const round of ['', '-2']) {
    for (const g of CONTRAST_GROUPS) {
      if (steps.length >= REINFORCEMENT_SIZE) break;
      add(pairStep(g, round));
    }
  }

  // Keep the five-skill order: listening first, then reading, writing, speaking.
  const order: LessonStep['kind'][] = ['listen-pair', 'listen-meaning', 'assemble', 'fill-blank', 'choose-spelling', 'write', 'recall', 'learn'];
  return steps.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}
