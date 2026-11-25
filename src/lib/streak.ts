import { addDays, daysBetween } from './date';

/**
 * Streak protection, the way the big apps keep learners coming back – without punishing a missed day:
 *  - a streak freeze covers one missed day automatically; one is earned every FREEZE_EVERY days of
 *    streak, and at most MAX_FREEZES are kept;
 *  - vacation mode pauses the streak for a chosen period: those days need no freeze.
 * Missed days are settled when the learner comes back (registerActivity); until then streakCover
 * tells whether the streak is still alive and which days a freeze will cover.
 * Every function takes the day explicitly, so the rules are tested without a clock.
 */

export const MAX_FREEZES = 2;
export const FREEZE_EVERY = 7;
/** Day history older than this is dropped (the calendar shows about a year). */
export const HISTORY_DAYS = 400;
/** Vacation lengths offered in the app. */
export const VACATION_LENGTHS = [3, 7, 14] as const;

export interface Streak {
  current: number;
  best: number;
  lastActiveDate: string | null;
}

/** An inclusive range of YYYY-MM-DD days. */
export interface Vacation {
  from: string;
  to: string;
}

/** The streak-related part of the learner's progress. */
export interface StreakData {
  streak: Streak;
  freezes: number;
  /** Days a freeze covered. */
  frozen: string[];
  vacations: Vacation[];
}

export function onVacation(day: string, vacations: Vacation[]): boolean {
  return vacations.some((v) => v.from <= day && day <= v.to);
}

/** The vacation that covers `day` or starts after it, if any. */
export function currentVacation(vacations: Vacation[], day: string): Vacation | undefined {
  return vacations.filter((v) => v.to >= day).sort((a, b) => (a.from < b.from ? -1 : 1))[0];
}

/** Days strictly between the last active day and today. */
export function missedDays(last: string, today: string): string[] {
  const gap = daysBetween(last, today);
  return Array.from({ length: Math.max(0, gap - 1) }, (_, i) => addDays(last, i + 1));
}

export interface Cover {
  /** The streak still counts today (it may still grow if the learner studies today). */
  alive: boolean;
  /** Missed days a freeze covers (or will cover once the learner studies). */
  frozen: string[];
  /** Missed days covered by vacation mode. */
  vacation: string[];
}

/** Whether the streak survives until `today`, and what covers the days missed since the last activity. */
export function streakCover(data: StreakData, today: string): Cover {
  const last = data.streak.lastActiveDate;
  if (!last || data.streak.current <= 0) return { alive: false, frozen: [], vacation: [] };
  const missed = missedDays(last, today);
  const vacation = missed.filter((d) => onVacation(d, data.vacations));
  const rest = missed.filter((d) => !onVacation(d, data.vacations));
  const alive = rest.length <= data.freezes;
  return { alive, frozen: alive ? rest : [], vacation };
}

/** The streak shown today: still alive, or 0 once it is broken. */
export function activeStreak(data: StreakData, today: string): number {
  return streakCover(data, today).alive ? data.streak.current : 0;
}

/** Records a day with activity: settles the missed days, grows (or restarts) the streak and earns freezes. */
export function registerActivity<T extends StreakData>(data: T, today: string): T & { freezeEarned: boolean } {
  const { streak } = data;
  if (streak.lastActiveDate === today) return { ...data, freezeEarned: false };
  const cover = streakCover(data, today);
  const current = cover.alive ? streak.current + 1 : 1;
  const available = data.freezes - cover.frozen.length;
  const earned = current % FREEZE_EVERY === 0 && available < MAX_FREEZES;
  const freezes = available + (earned ? 1 : 0);
  const oldest = addDays(today, -HISTORY_DAYS);
  return {
    ...data,
    streak: { current, best: Math.max(streak.best, current), lastActiveDate: today },
    freezes,
    frozen: [...data.frozen, ...cover.frozen].filter((d) => d >= oldest),
    vacations: data.vacations.filter((v) => v.to >= oldest),
    freezeEarned: earned,
  };
}

/** Starts a vacation of `days` days from today (replacing one that has not ended yet). */
export function startVacation(vacations: Vacation[], today: string, days: number): Vacation[] {
  const kept = vacations.filter((v) => v.to < today);
  return [...kept, { from: today, to: addDays(today, Math.max(1, days) - 1) }];
}

/** Ends vacation mode today: past vacation days stay covered, today and later ones are dropped. */
export function endVacation(vacations: Vacation[], today: string): Vacation[] {
  const yesterday = addDays(today, -1);
  return vacations
    .filter((v) => v.from < today)
    .map((v) => (v.to >= today ? { ...v, to: yesterday } : v));
}
