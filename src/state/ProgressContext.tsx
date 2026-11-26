import { COURSE_INFO, COURSES } from '../lib/course';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { applyProfile, getItem, registerCustomItems } from '../data';
import { SOUND_INFO, WEAK_SOUND_ERROR_RATE, WEAK_SOUND_MIN_ATTEMPTS, WEAK_SOUND_MIN_AVG, type SoundKey } from '../data/sounds';
import type { CourseUnitId, LearningItem } from '../data/types';
import { lessonsOfUnit } from '../data/lessons';
import { addDays, todayKey } from '../lib/date';
import { setHapticsEnabled } from '../lib/haptics';
import { DEFAULT_PROFILE, type LearnerProfile } from '../lib/personalize';
import { detectSounds, letterSound } from '../lib/phonetics';
import {
  activeStreak as streakToday,
  endVacation,
  HISTORY_DAYS,
  registerActivity,
  startVacation,
  streakCover,
  type Cover,
  type Vacation,
} from '../lib/streak';

/**
 * Learner progress persisted in LocalStorage (schema v2):
 *  - XP, daily goal, streak with freezes and vacation mode (lib/streak), XP per day (the calendar)
 *  - answers per skill (listening, reading, writing, speaking, recall)
 *  - per-item performance history: pronunciation scores + average, writing errors,
 *    mastery level 1–5 (Leitner box) and next review date
 *  - per-sound statistics to detect "challenging sounds" (e.g. sz, ą)
 *  - lesson / dialogue completion, and the learner's own dictionary items
 */

/** Each course keeps its own progress (lib/course). */
const STORAGE_KEY = COURSE_INFO.progressKey;

/** Leitner box intervals in days. Box 0 = new; boxes 1–5 equal the mastery level. */
export const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];
export const MAX_MASTERY = 5;
const PRON_HISTORY = 10;

export const XP = {
  learnItem: 10,
  reviewCorrect: 5,
  reviewWrong: 1,
  pronunciationGood: 5,
  earTraining: 2,
  lessonComplete: 30,
  dialogueComplete: 25,
  customWord: 5,
  storyQuestion: 10,
  storyComplete: 15,
  /** A unit test passed for the first time, and any other attempt. */
  testPass: 50,
  testAttempt: 10,
  /** Finishing the placement test. */
  placement: 20,
  /** A free conversation of at least two turns. */
  chat: 25,
} as const;

/** The score that passes a unit test (lesson/buildLesson builds its questions). */
export const TEST_PASS_SCORE = 80;

/** A unit's test: the best score, how many times it was taken, and the day it was first passed (its certificate). */
export interface UnitTestRecord {
  bestScore: number;
  attempts: number;
  passedAt: string | null;
  /** Score of the attempt that first passed, printed on the certificate. */
  passScore: number | null;
}

export interface ItemProgress {
  learned: boolean;
  /** Leitner box 0–5; mastery level = max(1, srsBox) once learned. */
  srsBox: number;
  dueDate: string;
  reviews: number;
  correct: number;
  wrong: number;
  pronScores: number[];
  pronAvg: number | null;
  bestPronunciation: number | null;
  writingAttempts: number;
  writingErrors: number;
  exerciseErrors: number;
  lastPracticed: string | null;
}

export interface SoundStat {
  attempts: number;
  errors: number;
  scoreSum: number;
  scoreCount: number;
}

/** Skills shown on the progress page; recall = the spaced-repetition reviews. */
export type Skill = 'listen' | 'read' | 'write' | 'speak' | 'recall';
export const SKILLS: Skill[] = ['listen', 'read', 'write', 'speak', 'recall'];
export interface SkillStat {
  tries: number;
  ok: number;
}
/** A pronunciation score from this value counts as a good answer. */
export const SPEAK_OK = 70;

export interface ProgressState {
  version: 2;
  xp: number;
  dailyGoal: number;
  daily: { date: string; xp: number };
  streak: { current: number; best: number; lastActiveDate: string | null };
  items: Record<string, ItemProgress>;
  sounds: Partial<Record<SoundKey, SoundStat>>;
  /** placed: completed by the placement test (the learner already knew the unit). */
  lessons: Record<string, { completedAt: string; bestAccuracy: number; placed?: boolean }>;
  dialogues: Record<string, { completedAt: string; bestScore: number }>;
  customItems: LearningItem[];
  /** Learner's grammatical gender and first name (personalizes gendered phrases). */
  profile: LearnerProfile;
  prefs: { haptics: boolean };
  /** Speed Blitz personal record. */
  blitz: { best: number; plays: number };
  stories: Record<string, { completedAt: string; bestCorrect: number }>;
  /** XP earned per day (YYYY-MM-DD); 0 = a day rebuilt from older data, active but amount unknown. */
  days: Record<string, number>;
  /** Streak freezes in stock, the days they covered and the vacations (lib/streak). */
  freezes: number;
  frozen: string[];
  vacations: Vacation[];
  /** Day a freeze was last earned (the progress page says so on that day). */
  freezeEarnedOn: string | null;
  skills: Partial<Record<Skill, SkillStat>>;
  /** Unit tests by unit id. */
  tests: Record<string, UnitTestRecord>;
  /** The placement test: when it was taken (or its offer dismissed) and the units it found the learner knew. */
  placement: { at: string; known: string[] } | null;
}

export const initialState = (): ProgressState => ({
  version: 2,
  xp: 0,
  dailyGoal: 50,
  daily: { date: todayKey(), xp: 0 },
  streak: { current: 0, best: 0, lastActiveDate: null },
  items: {},
  sounds: {},
  lessons: {},
  dialogues: {},
  customItems: [],
  profile: { ...DEFAULT_PROFILE },
  prefs: { haptics: true },
  blitz: { best: 0, plays: 0 },
  stories: {},
  days: {},
  // One freeze to start with, so the first missed day does not break a new streak.
  freezes: 1,
  frozen: [],
  vacations: [],
  freezeEarnedOn: null,
  skills: {},
  tests: {},
  placement: null,
});

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Study days of data saved before the day history existed: completions, practice dates and the streak's run. */
export function seedDays(data: Omit<Partial<ProgressState>, 'version'>): Record<string, number> {
  const days: Record<string, number> = {};
  const mark = (d: unknown) => {
    if (typeof d === 'string' && DAY.test(d)) days[d] = days[d] ?? 0;
  };
  for (const group of [data.lessons, data.dialogues, data.stories]) for (const e of Object.values(group ?? {})) mark(e?.completedAt);
  for (const p of Object.values(data.items ?? {})) mark(p?.lastPracticed);
  const s = data.streak;
  if (s?.lastActiveDate && DAY.test(s.lastActiveDate)) for (let i = 0; i < Math.min(s.current, HISTORY_DAYS); i++) mark(addDays(s.lastActiveDate, -i));
  if (data.daily && DAY.test(data.daily.date) && data.daily.xp > 0) days[data.daily.date] = data.daily.xp;
  return days;
}

/** Answers per skill of data saved before they were counted, from the per-item history. */
export function seedSkills(items: Record<string, ItemProgress>): Partial<Record<Skill, SkillStat>> {
  const out: Partial<Record<Skill, SkillStat>> = {};
  const add = (k: Skill, tries: number, ok: number) => {
    if (tries <= 0) return;
    const prev = out[k] ?? { tries: 0, ok: 0 };
    out[k] = { tries: prev.tries + tries, ok: prev.ok + Math.max(0, ok) };
  };
  for (const p of Object.values(items)) {
    add('write', p.writingAttempts, p.writingAttempts - p.writingErrors);
    add('recall', p.reviews, p.correct);
    add('speak', p.pronScores.length, p.pronScores.filter((s) => s >= SPEAK_OK).length);
  }
  return out;
}

function countSkill(state: ProgressState, skill: Skill, ok: boolean): ProgressState {
  const prev = state.skills[skill] ?? { tries: 0, ok: 0 };
  return { ...state, skills: { ...state.skills, [skill]: { tries: prev.tries + 1, ok: prev.ok + (ok ? 1 : 0) } } };
}

const emptyItem = (): ItemProgress => ({
  learned: false,
  srsBox: 0,
  dueDate: todayKey(),
  reviews: 0,
  correct: 0,
  wrong: 0,
  pronScores: [],
  pronAvg: null,
  bestPronunciation: null,
  writingAttempts: 0,
  writingErrors: 0,
  exerciseErrors: 0,
  lastPracticed: null,
});

/** Accepts v1 or v2 data (from storage or a backup file) and returns a valid v2 state. */
export function migrate(raw: unknown): ProgressState | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Omit<Partial<ProgressState>, 'version'> & { version?: number };
  if (data.version !== 1 && data.version !== 2) return null;
  const base = initialState();
  const items: Record<string, ItemProgress> = {};
  for (const [id, p] of Object.entries(data.items ?? {})) {
    const old = p as Partial<ItemProgress>;
    const scores = old.pronScores ?? (old.bestPronunciation != null ? [old.bestPronunciation] : []);
    items[id] = {
      ...emptyItem(),
      ...old,
      pronScores: scores,
      pronAvg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    };
  }
  return {
    ...base,
    ...data,
    version: 2,
    items,
    sounds: data.sounds ?? {},
    customItems: Array.isArray(data.customItems) ? data.customItems : [],
    profile: { ...base.profile, ...(data.profile ?? {}) },
    prefs: { ...base.prefs, ...(data.prefs ?? {}) },
    blitz: { ...base.blitz, ...(data.blitz ?? {}) },
    stories: data.stories ?? {},
    days: data.days && typeof data.days === 'object' ? data.days : seedDays(data),
    freezes: typeof data.freezes === 'number' ? data.freezes : base.freezes,
    frozen: Array.isArray(data.frozen) ? data.frozen : [],
    vacations: Array.isArray(data.vacations) ? data.vacations : [],
    freezeEarnedOn: data.freezeEarnedOn ?? null,
    skills: data.skills && typeof data.skills === 'object' ? data.skills : seedSkills(items),
    tests: data.tests && typeof data.tests === 'object' ? data.tests : {},
    placement: data.placement && typeof data.placement === 'object' ? data.placement : null,
  } as ProgressState;
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return (raw && migrate(JSON.parse(raw))) || seededState();
  } catch {
    return initialState();
  }
}

/** A course started for the first time keeps the learner's profile and settings from the other one. */
function seededState(): ProgressState {
  const fresh = initialState();
  const other = Object.values(COURSES).find((c) => c.progressKey !== STORAGE_KEY);
  const raw = other && localStorage.getItem(other.progressKey);
  const prev = raw ? migrate(JSON.parse(raw)) : null;
  return prev ? { ...fresh, profile: prev.profile, prefs: prev.prefs, dailyGoal: prev.dailyGoal } : fresh;
}

export type Action =
  | { type: 'award'; amount: number }
  | { type: 'learn'; id: string }
  | { type: 'review'; id: string; correct: boolean }
  | { type: 'pronunciation'; id?: string; text: string; score: number; failedWords: string[] }
  | { type: 'writing'; id: string; text: string; verdict: 'correct' | 'diacritics' | 'wrong'; letters: string[] }
  | { type: 'exercise'; id?: string; text: string; correct: boolean; skill: Skill; sounds?: SoundKey[] }
  | { type: 'vacation'; days: number }
  | { type: 'endVacation' }
  | { type: 'lesson'; id: string; accuracy: number }
  | { type: 'test'; unitId: string; score: number }
  | { type: 'placement'; known: { unitId: string; score: number }[]; finished: boolean }
  | { type: 'dialogue'; id: string; score: number }
  | { type: 'goal'; goal: number }
  | { type: 'addCustom'; item: LearningItem }
  | { type: 'removeCustom'; id: string }
  | { type: 'profile'; profile: Partial<LearnerProfile> }
  | { type: 'haptics'; on: boolean }
  | { type: 'blitz'; score: number }
  | { type: 'story'; id: string; correct: number; total: number }
  | { type: 'replace'; state: ProgressState }
  | { type: 'reset' };

/** Adds XP and updates the daily counter, the day history and the streak (freezes, vacations). */
function withXp(state: ProgressState, amount: number): ProgressState {
  if (amount <= 0) return state;
  const today = todayKey();
  const daily = state.daily.date === today ? { date: today, xp: state.daily.xp + amount } : { date: today, xp: amount };
  let days = { ...state.days, [today]: (state.days[today] ?? 0) + amount };
  if (!(today in state.days)) {
    const oldest = addDays(today, -HISTORY_DAYS);
    days = Object.fromEntries(Object.entries(days).filter(([d]) => d >= oldest));
  }
  const { freezeEarned, ...next } = registerActivity(state, today);
  return { ...next, xp: state.xp + amount, daily, days, freezeEarnedOn: freezeEarned ? today : state.freezeEarnedOn };
}

function updateItem(state: ProgressState, id: string, fn: (p: ItemProgress) => ItemProgress): ProgressState {
  const prev = state.items[id] ?? emptyItem();
  return { ...state, items: { ...state.items, [id]: { ...fn(prev), lastPracticed: todayKey() } } };
}

/** A failure in any skill lowers mastery by one level and brings the item back today. */
function demote(p: ItemProgress): ItemProgress {
  if (!p.learned) return p;
  return { ...p, srsBox: Math.max(1, p.srsBox - 1), dueDate: todayKey() };
}

function updateSounds(state: ProgressState, sounds: SoundKey[], errorSounds: Set<SoundKey>, score: number | null): ProgressState {
  if (!sounds.length) return state;
  const next = { ...state.sounds };
  for (const s of sounds) {
    const prev = next[s] ?? { attempts: 0, errors: 0, scoreSum: 0, scoreCount: 0 };
    next[s] = {
      attempts: prev.attempts + 1,
      errors: prev.errors + (errorSounds.has(s) ? 1 : 0),
      scoreSum: prev.scoreSum + (score ?? 0),
      scoreCount: prev.scoreCount + (score === null ? 0 : 1),
    };
  }
  return { ...state, sounds: next };
}

export function reducer(state: ProgressState, action: Action): ProgressState {
  switch (action.type) {
    case 'award':
      return withXp(state, action.amount);

    case 'learn': {
      const prev = state.items[action.id] ?? emptyItem();
      if (prev.learned) return state;
      const s = updateItem(state, action.id, (p) => ({ ...p, learned: true, srsBox: Math.max(p.srsBox, 1), dueDate: addDays(todayKey(), 1) }));
      return withXp(s, XP.learnItem);
    }

    case 'review': {
      const s = updateItem(state, action.id, (p) => {
        const box = action.correct ? Math.min(p.srsBox + 1, MAX_MASTERY) : 1;
        return {
          ...p,
          learned: true,
          srsBox: box,
          dueDate: addDays(todayKey(), action.correct ? SRS_INTERVALS[box] : 0),
          reviews: p.reviews + 1,
          correct: p.correct + (action.correct ? 1 : 0),
          wrong: p.wrong + (action.correct ? 0 : 1),
        };
      });
      return withXp(countSkill(s, 'recall', action.correct), action.correct ? XP.reviewCorrect : XP.reviewWrong);
    }

    case 'pronunciation': {
      let s = state;
      if (action.id) {
        s = updateItem(s, action.id, (p) => {
          const pronScores = [...p.pronScores, action.score].slice(-PRON_HISTORY);
          const updated = {
            ...p,
            pronScores,
            pronAvg: Math.round(pronScores.reduce((a, b) => a + b, 0) / pronScores.length),
            bestPronunciation: Math.max(p.bestPronunciation ?? 0, action.score),
          };
          return action.score < 60 ? demote(updated) : updated;
        });
      }
      const sounds = detectSounds(action.text);
      // Sounds inside the words that were not recognized are counted as errors.
      const errorSounds = new Set<SoundKey>(
        action.failedWords.length
          ? action.failedWords.flatMap((w) => detectSounds(w))
          : action.score < 70
            ? sounds
            : [],
      );
      s = countSkill(updateSounds(s, sounds, errorSounds, action.score), 'speak', action.score >= SPEAK_OK);
      return action.score >= 85 ? withXp(s, XP.pronunciationGood) : s;
    }

    case 'writing': {
      const s = updateItem(state, action.id, (p) => {
        const updated = {
          ...p,
          writingAttempts: p.writingAttempts + 1,
          writingErrors: p.writingErrors + (action.verdict === 'correct' ? 0 : 1),
        };
        return action.verdict === 'wrong' ? demote(updated) : updated;
      });
      const sounds = detectSounds(action.text);
      const errorSounds = new Set<SoundKey>(
        action.verdict === 'wrong' ? sounds : (action.letters.map(letterSound).filter(Boolean) as SoundKey[]),
      );
      const all = [...new Set([...sounds, ...errorSounds])];
      return countSkill(updateSounds(s, all, errorSounds, null), 'write', action.verdict === 'correct');
    }

    case 'exercise': {
      let s = state;
      if (action.id) {
        s = updateItem(s, action.id, (p) =>
          action.correct ? p : demote({ ...p, exerciseErrors: p.exerciseErrors + 1 }),
        );
      }
      const sounds = action.sounds ?? detectSounds(action.text);
      return countSkill(updateSounds(s, sounds, new Set(action.correct ? [] : sounds), null), action.skill, action.correct);
    }

    case 'vacation':
      return { ...state, vacations: startVacation(state.vacations, todayKey(), action.days) };

    case 'endVacation':
      return { ...state, vacations: endVacation(state.vacations, todayKey()) };

    case 'lesson': {
      const prev = state.lessons[action.id];
      const entry = { completedAt: todayKey(), bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, action.accuracy) };
      return withXp({ ...state, lessons: { ...state.lessons, [action.id]: entry } }, XP.lessonComplete);
    }

    case 'test': {
      const prev = state.tests[action.unitId];
      const firstPass = action.score >= TEST_PASS_SCORE && !prev?.passedAt;
      const entry: UnitTestRecord = {
        bestScore: Math.max(prev?.bestScore ?? 0, action.score),
        attempts: (prev?.attempts ?? 0) + 1,
        passedAt: firstPass ? todayKey() : (prev?.passedAt ?? null),
        passScore: firstPass ? action.score : (prev?.passScore ?? null),
      };
      return withXp({ ...state, tests: { ...state.tests, [action.unitId]: entry } }, firstPass ? XP.testPass : XP.testAttempt);
    }

    case 'placement': {
      // Units the learner already knew: their lessons count as done, and their phrases join the review
      // deck at level 2, spread over the coming week so they come back for a check without a pile-up.
      const today = todayKey();
      let s: ProgressState = { ...state, placement: { at: today, known: action.known.map((k) => k.unitId) } };
      const lessons = { ...s.lessons };
      let n = 0;
      for (const { unitId, score } of action.known) {
        for (const lesson of lessonsOfUnit(unitId as CourseUnitId)) {
          lessons[lesson.id] ??= { completedAt: today, bestAccuracy: score, placed: true };
          for (const id of lesson.itemIds) {
            s = updateItem(s, id, (p) => (p.learned ? p : { ...p, learned: true, srsBox: Math.max(p.srsBox, 2), dueDate: addDays(today, 1 + (n++ % 7)) }));
          }
        }
      }
      s = { ...s, lessons };
      return action.finished ? withXp(s, XP.placement) : s;
    }

    case 'dialogue': {
      const prev = state.dialogues[action.id];
      const entry = { completedAt: todayKey(), bestScore: Math.max(prev?.bestScore ?? 0, action.score) };
      return withXp({ ...state, dialogues: { ...state.dialogues, [action.id]: entry } }, XP.dialogueComplete);
    }

    case 'goal':
      return { ...state, dailyGoal: action.goal };

    case 'addCustom': {
      const s = { ...state, customItems: [...state.customItems.filter((i) => i.id !== action.item.id), action.item] };
      const learned = updateItem(s, action.item.id, (p) => ({ ...p, learned: true, srsBox: Math.max(p.srsBox, 1), dueDate: todayKey() }));
      return withXp(learned, XP.customWord);
    }

    case 'removeCustom': {
      const items = { ...state.items };
      delete items[action.id];
      return { ...state, items, customItems: state.customItems.filter((i) => i.id !== action.id) };
    }

    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.profile } };

    case 'haptics':
      return { ...state, prefs: { ...state.prefs, haptics: action.on } };

    case 'blitz': {
      const s = { ...state, blitz: { best: Math.max(state.blitz.best, action.score), plays: state.blitz.plays + 1 } };
      return withXp(s, action.score);
    }

    case 'story': {
      const prev = state.stories[action.id];
      const entry = { completedAt: todayKey(), bestCorrect: Math.max(prev?.bestCorrect ?? 0, action.correct) };
      return withXp({ ...state, stories: { ...state.stories, [action.id]: entry } }, XP.storyComplete + action.correct * XP.storyQuestion);
    }

    case 'replace':
      return action.state;

    case 'reset':
      return initialState();
  }
}

export interface WeakSound {
  key: SoundKey;
  attempts: number;
  errorRate: number;
  avgScore: number | null;
  weak: boolean;
}

/** Per-sound summary, weakest first. */
export function summarizeSounds(state: ProgressState): WeakSound[] {
  return (Object.keys(SOUND_INFO) as SoundKey[])
    .map((key) => {
      const s = state.sounds[key];
      if (!s || s.attempts === 0) return null;
      const errorRate = s.errors / s.attempts;
      const avgScore = s.scoreCount ? Math.round(s.scoreSum / s.scoreCount) : null;
      const weak =
        s.attempts >= WEAK_SOUND_MIN_ATTEMPTS && (errorRate >= WEAK_SOUND_ERROR_RATE || (avgScore !== null && avgScore < WEAK_SOUND_MIN_AVG));
      return { key, attempts: s.attempts, errorRate, avgScore, weak };
    })
    .filter((x): x is WeakSound => x !== null)
    .sort((a, b) => Number(b.weak) - Number(a.weak) || b.errorRate - a.errorRate);
}

export function masteryOf(p: ItemProgress | undefined): number {
  if (!p?.learned) return 0;
  return Math.max(1, Math.min(MAX_MASTERY, p.srsBox));
}

/** 0 = solid, higher = weaker. Combines pronunciation, writing, exercise and review history. */
export function itemWeakness(p: ItemProgress | undefined): number {
  if (!p) return 0;
  let w = 0;
  if (p.pronAvg !== null) w += ((100 - p.pronAvg) / 100) * 3;
  if (p.writingAttempts) w += (p.writingErrors / p.writingAttempts) * 2;
  if (p.reviews) w += (p.wrong / p.reviews) * 1.5;
  w += Math.min(p.exerciseErrors, 4) * 0.4;
  if (p.learned) w += (MAX_MASTERY - masteryOf(p)) * 0.25;
  return w;
}

export function needsPractice(p: ItemProgress | undefined, today = todayKey()): boolean {
  if (!p?.learned) return false;
  return (
    p.dueDate <= today ||
    masteryOf(p) <= 2 ||
    (p.pronAvg !== null && p.pronAvg < 75) ||
    (p.writingAttempts > 0 && p.writingErrors / p.writingAttempts >= 0.5)
  );
}

interface ProgressApi {
  state: ProgressState;
  level: number;
  levelProgress: number;
  todayXp: number;
  activeStreak: number;
  /** How the days missed since the last activity are covered (freezes, vacation). */
  cover: Cover;
  /** Freezes left once the pending missed days are covered. */
  freezesLeft: number;
  studiedToday: boolean;
  startVacation: (days: number) => void;
  endVacation: () => void;
  award: (amount: number) => void;
  markLearned: (id: string) => void;
  recordReview: (id: string, correct: boolean) => void;
  recordPronunciation: (id: string | undefined, text: string, score: number, failedWords?: string[]) => void;
  recordWriting: (id: string, text: string, verdict: 'correct' | 'diacritics' | 'wrong', letters?: string[]) => void;
  recordExercise: (id: string | undefined, text: string, correct: boolean, skill: Skill, sounds?: SoundKey[]) => void;
  completeLesson: (id: string, accuracy: number) => void;
  completeTest: (unitId: string, score: number) => void;
  /** Records the placement test (finished) or a dismissed offer (known empty, not finished). */
  completePlacement: (known: { unitId: string; score: number }[], finished: boolean) => void;
  completeDialogue: (id: string, score: number) => void;
  setDailyGoal: (goal: number) => void;
  setProfile: (profile: Partial<LearnerProfile>) => void;
  setHaptics: (on: boolean) => void;
  recordBlitz: (score: number) => void;
  completeStory: (id: string, correct: number, total: number) => void;
  addCustomItem: (item: LearningItem) => void;
  removeCustomItem: (id: string) => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
  resetAll: () => void;
  isLearned: (id: string) => boolean;
  dueItemIds: () => string[];
}

const ProgressContext = createContext<ProgressApi | null>(null);

export const XP_PER_LEVEL = 150;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  // Register custom items synchronously so getItem() resolves them during this render.
  useMemo(() => registerCustomItems(state.customItems), [state.customItems]);
  // Resolve gendered / named phrases for this learner before any child renders an item.
  useMemo(() => applyProfile(state.profile), [state.profile]);
  useMemo(() => setHapticsEnabled(state.prefs.haptics), [state.prefs.haptics]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be full or disabled (private mode); progress then lives for this session only.
    }
  }, [state]);

  const award = useCallback((amount: number) => dispatch({ type: 'award', amount }), []);
  const markLearned = useCallback((id: string) => dispatch({ type: 'learn', id }), []);
  const recordReview = useCallback((id: string, correct: boolean) => dispatch({ type: 'review', id, correct }), []);
  const recordPronunciation = useCallback(
    (id: string | undefined, text: string, score: number, failedWords: string[] = []) =>
      dispatch({ type: 'pronunciation', id, text, score, failedWords }),
    [],
  );
  const recordWriting = useCallback(
    (id: string, text: string, verdict: 'correct' | 'diacritics' | 'wrong', letters: string[] = []) =>
      dispatch({ type: 'writing', id, text, verdict, letters }),
    [],
  );
  const recordExercise = useCallback(
    (id: string | undefined, text: string, correct: boolean, skill: Skill, sounds?: SoundKey[]) =>
      dispatch({ type: 'exercise', id, text, correct, skill, sounds }),
    [],
  );
  const beginVacation = useCallback((days: number) => dispatch({ type: 'vacation', days }), []);
  const stopVacation = useCallback(() => dispatch({ type: 'endVacation' }), []);
  const completeLesson = useCallback((id: string, accuracy: number) => dispatch({ type: 'lesson', id, accuracy }), []);
  const completeTest = useCallback((unitId: string, score: number) => dispatch({ type: 'test', unitId, score }), []);
  const completePlacement = useCallback((known: { unitId: string; score: number }[], finished: boolean) => dispatch({ type: 'placement', known, finished }), []);
  const completeDialogue = useCallback((id: string, score: number) => dispatch({ type: 'dialogue', id, score }), []);
  const setDailyGoal = useCallback((goal: number) => dispatch({ type: 'goal', goal }), []);
  const setProfile = useCallback((profile: Partial<LearnerProfile>) => dispatch({ type: 'profile', profile }), []);
  const setHaptics = useCallback((on: boolean) => dispatch({ type: 'haptics', on }), []);
  const recordBlitz = useCallback((score: number) => dispatch({ type: 'blitz', score }), []);
  const completeStory = useCallback((id: string, correct: number, total: number) => dispatch({ type: 'story', id, correct, total }), []);
  const addCustomItem = useCallback((item: LearningItem) => dispatch({ type: 'addCustom', item }), []);
  const removeCustomItem = useCallback((id: string) => dispatch({ type: 'removeCustom', id }), []);
  const resetAll = useCallback(() => dispatch({ type: 'reset' }), []);
  const importJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      // Accept both a raw state and the wrapped backup format { app, exportedAt, progress }.
      const next = migrate(parsed?.progress ?? parsed);
      if (!next) return false;
      dispatch({ type: 'replace', state: next });
      return true;
    } catch {
      return false;
    }
  }, []);

  const api = useMemo<ProgressApi>(() => {
    const today = todayKey();
    const cover = streakCover(state, today);
    return {
      state,
      level: Math.floor(state.xp / XP_PER_LEVEL) + 1,
      levelProgress: (state.xp % XP_PER_LEVEL) / XP_PER_LEVEL,
      todayXp: state.daily.date === today ? state.daily.xp : 0,
      activeStreak: streakToday(state, today),
      cover,
      freezesLeft: Math.max(0, state.freezes - cover.frozen.length),
      studiedToday: state.streak.lastActiveDate === today,
      startVacation: beginVacation,
      endVacation: stopVacation,
      award,
      markLearned,
      recordReview,
      recordPronunciation,
      recordWriting,
      recordExercise,
      completeLesson,
      completeTest,
      completePlacement,
      completeDialogue,
      setDailyGoal,
      setProfile,
      setHaptics,
      recordBlitz,
      completeStory,
      addCustomItem,
      removeCustomItem,
      exportJson: () => JSON.stringify({ app: 'polish-learn', exportedAt: new Date().toISOString(), progress: state }, null, 2),
      importJson,
      resetAll,
      isLearned: (id) => !!state.items[id]?.learned,
      dueItemIds: () =>
        Object.entries(state.items)
          .filter(([id, p]) => p.learned && p.dueDate <= today && !!getItem(id))
          .sort((a, b) => a[1].srsBox - b[1].srsBox)
          .map(([id]) => id),
    };
  }, [
    state,
    award,
    markLearned,
    recordReview,
    recordPronunciation,
    recordWriting,
    recordExercise,
    completeLesson,
    completeTest,
    completePlacement,
    completeDialogue,
    setDailyGoal,
    setProfile,
    setHaptics,
    recordBlitz,
    completeStory,
    addCustomItem,
    removeCustomItem,
    importJson,
    resetAll,
    beginVacation,
    stopVacation,
  ]);

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
