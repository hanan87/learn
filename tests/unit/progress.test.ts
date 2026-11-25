import { afterEach, describe, expect, it, vi } from 'vitest';
import { CAN_DO } from '../../src/data/canDo';
import { EN_UNITS } from '../../src/data/en/units';
import { HE_UNITS } from '../../src/data/he/units';
import { CNR_UNITS } from '../../src/data/cnr/units';
import { PL_UNITS } from '../../src/data';
import { reviewSections } from '../../src/lib/review';
import { buildIcs, firstStart, foldLine, googleCalendarUrl, isTime } from '../../src/lib/reminder';
import {
  activeStreak,
  endVacation,
  missedDays,
  registerActivity,
  startVacation,
  streakCover,
  type StreakData,
} from '../../src/lib/streak';
import { initialState, migrate, reducer, seedDays } from '../../src/state/ProgressContext';

/** Motivation pack: streak freezes and vacation mode, the day history, answers per skill, can-do lines and the calendar reminder. */

const HEBREW = /[֐-׿]/;

const data = (over: Partial<StreakData> & { last?: string; current?: number } = {}): StreakData => ({
  streak: { current: over.current ?? 5, best: 9, lastActiveDate: over.last ?? '2026-11-20' },
  freezes: over.freezes ?? 1,
  frozen: over.frozen ?? [],
  vacations: over.vacations ?? [],
});

describe('streak rules', () => {
  it('lists the days missed between two active days', () => {
    expect(missedDays('2026-11-20', '2026-11-21')).toEqual([]);
    expect(missedDays('2026-11-20', '2026-11-23')).toEqual(['2026-11-21', '2026-11-22']);
    expect(missedDays('2026-11-30', '2026-12-02')).toEqual(['2026-12-01']);
  });

  it('keeps the streak alive yesterday and today, and lets a freeze cover one missed day', () => {
    expect(streakCover(data(), '2026-11-21')).toEqual({ alive: true, frozen: [], vacation: [] });
    expect(streakCover(data(), '2026-11-22')).toEqual({ alive: true, frozen: ['2026-11-21'], vacation: [] });
    expect(streakCover(data(), '2026-11-23').alive).toBe(false);
    expect(streakCover(data({ freezes: 2 }), '2026-11-23').frozen).toEqual(['2026-11-21', '2026-11-22']);
    expect(activeStreak(data(), '2026-11-23')).toBe(0);
    expect(activeStreak(data(), '2026-11-22')).toBe(5);
    expect(streakCover(data({ current: 0 }), '2026-11-21').alive).toBe(false);
  });

  it('needs no freeze for vacation days', () => {
    const v = data({ freezes: 0, vacations: [{ from: '2026-11-21', to: '2026-11-27' }] });
    expect(streakCover(v, '2026-11-28')).toMatchObject({ alive: true, frozen: [] });
    expect(streakCover(v, '2026-11-28').vacation).toHaveLength(7);
    expect(streakCover(v, '2026-11-29').alive).toBe(false);
  });

  it('grows the streak, uses the freezes it needs and restarts after an uncovered gap', () => {
    const next = registerActivity(data(), '2026-11-22');
    expect(next.streak).toEqual({ current: 6, best: 9, lastActiveDate: '2026-11-22' });
    expect(next.freezes).toBe(0);
    expect(next.frozen).toEqual(['2026-11-21']);
    expect(registerActivity(next, '2026-11-22')).toMatchObject({ streak: next.streak, freezeEarned: false });

    const broken = registerActivity(data(), '2026-11-25');
    expect(broken.streak.current).toBe(1);
    expect(broken.freezes).toBe(1);
    expect(broken.frozen).toEqual([]);
    expect(registerActivity({ ...data(), streak: { current: 0, best: 0, lastActiveDate: null } }, '2026-11-25').streak).toEqual({ current: 1, best: 1, lastActiveDate: '2026-11-25' });
  });

  it('earns a freeze every 7 days of streak and keeps at most 2', () => {
    const six = data({ current: 6, freezes: 0 });
    const seven = registerActivity(six, '2026-11-21');
    expect(seven).toMatchObject({ freezes: 1, freezeEarned: true });
    expect(registerActivity({ ...six, freezes: 2 }, '2026-11-21')).toMatchObject({ freezes: 2, freezeEarned: false });
    expect(registerActivity(data({ current: 7, freezes: 0 }), '2026-11-21')).toMatchObject({ freezes: 0, freezeEarned: false });
  });

  it('starts and ends vacation mode without losing the days already covered', () => {
    const v = startVacation([], '2026-11-25', 7);
    expect(v).toEqual([{ from: '2026-11-25', to: '2026-12-01' }]);
    expect(startVacation(v, '2026-11-26', 3)).toEqual([{ from: '2026-11-26', to: '2026-11-28' }]);
    expect(endVacation(v, '2026-11-28')).toEqual([{ from: '2026-11-25', to: '2026-11-27' }]);
    expect(endVacation(v, '2026-11-25')).toEqual([]);
    const past = [{ from: '2026-10-01', to: '2026-10-03' }];
    expect(startVacation(past, '2026-11-25', 3)).toHaveLength(2);
  });
});

describe('progress store: day history, freezes and skills', () => {
  afterEach(() => vi.useRealTimers());

  it('records XP per day and keeps the streak through a missed day with a freeze', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 10));
    let s = reducer(initialState(), { type: 'award', amount: 30 });
    s = reducer(s, { type: 'award', amount: 20 });
    expect(s.days).toEqual({ '2026-11-20': 50 });
    expect(s.streak.current).toBe(1);
    expect(s.freezes).toBe(1);

    vi.setSystemTime(new Date(2026, 10, 22, 10));
    s = reducer(s, { type: 'award', amount: 10 });
    expect(s.streak.current).toBe(2);
    expect(s.freezes).toBe(0);
    expect(s.frozen).toEqual(['2026-11-21']);
    expect(Object.keys(s.days)).toEqual(['2026-11-20', '2026-11-22']);
  });

  it('pauses the streak in vacation mode', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 10));
    let s = reducer({ ...initialState(), freezes: 0 }, { type: 'award', amount: 10 });
    vi.setSystemTime(new Date(2026, 10, 21, 9));
    s = reducer(s, { type: 'vacation', days: 3 });
    expect(s.vacations).toEqual([{ from: '2026-11-21', to: '2026-11-23' }]);
    vi.setSystemTime(new Date(2026, 10, 24, 9));
    s = reducer(s, { type: 'award', amount: 10 });
    expect(s.streak.current).toBe(2);
    s = reducer(s, { type: 'endVacation' });
    expect(s.vacations).toEqual([{ from: '2026-11-21', to: '2026-11-23' }]);
  });

  it('counts answers per skill', () => {
    let s = initialState();
    s = reducer(s, { type: 'exercise', id: 'u1-01', text: 'szkoła', correct: true, skill: 'listen' });
    s = reducer(s, { type: 'exercise', id: 'u1-01', text: 'szkoła', correct: false, skill: 'listen' });
    s = reducer(s, { type: 'exercise', text: 'szkoła', correct: true, skill: 'read' });
    s = reducer(s, { type: 'writing', id: 'u1-01', text: 'szkoła', verdict: 'diacritics', letters: ['ł'] });
    s = reducer(s, { type: 'pronunciation', id: 'u1-01', text: 'szkoła', score: 72, failedWords: [] });
    s = reducer(s, { type: 'review', id: 'u1-01', correct: true });
    expect(s.skills).toEqual({
      listen: { tries: 2, ok: 1 },
      read: { tries: 1, ok: 1 },
      write: { tries: 1, ok: 0 },
      speak: { tries: 1, ok: 1 },
      recall: { tries: 1, ok: 1 },
    });
  });

  it('rebuilds the study days and skills of data saved before they existed', () => {
    const old = {
      version: 2,
      xp: 300,
      daily: { date: '2026-11-24', xp: 40 },
      streak: { current: 3, best: 3, lastActiveDate: '2026-11-24' },
      lessons: { 'u1-l1': { completedAt: '2026-11-01', bestAccuracy: 90 } },
      stories: { s1: { completedAt: '2026-11-05', bestCorrect: 3 } },
      items: {
        'u1-01': { learned: true, srsBox: 2, dueDate: '2026-11-25', reviews: 4, correct: 3, wrong: 1, pronScores: [80, 50], writingAttempts: 2, writingErrors: 1, lastPracticed: '2026-11-10' },
      },
    };
    const m = migrate(old)!;
    expect(m.days).toEqual({ '2026-11-01': 0, '2026-11-05': 0, '2026-11-10': 0, '2026-11-22': 0, '2026-11-23': 0, '2026-11-24': 40 });
    expect(m.skills).toEqual({ write: { tries: 2, ok: 1 }, recall: { tries: 4, ok: 3 }, speak: { tries: 2, ok: 1 } });
    expect(m.freezes).toBe(1);
    expect(m.vacations).toEqual([]);
    // Once saved, the history is kept as it is.
    expect(migrate(JSON.parse(JSON.stringify(m)))).toEqual(m);
    expect(seedDays({})).toEqual({});
  });
});

describe('daily reminder', () => {
  it('starts today when the time is still ahead, otherwise tomorrow', () => {
    const now = new Date(2026, 10, 25, 18, 30);
    expect(firstStart('19:00', now)).toEqual(new Date(2026, 10, 25, 19, 0));
    expect(firstStart('08:15', now)).toEqual(new Date(2026, 10, 26, 8, 15));
    expect(isTime('07:05')).toBe(true);
    expect(isTime('24:00')).toBe(false);
  });

  it('builds a daily repeating calendar event with an alert and the app link', () => {
    const ics = buildIcs({ time: '19:00', title: 'תרגול פולנית – 5 דקות', details: 'Open the app, then do a lesson; thanks', url: 'https://hanan87.github.io/learn/' }, new Date(2026, 10, 25, 20, 0));
    expect(ics).toContain('\r\nRRULE:FREQ=DAILY\r\n');
    expect(ics).toContain('\r\nDTSTART:20261126T190000\r\n');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('SUMMARY:תרגול פולנית – 5 דקות');
    expect(ics.replace(/\r\n /g, '')).toContain('DESCRIPTION:Open the app\\, then do a lesson\\; thanks\\nhttps://hanan87.github.io/learn/');
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    const enc = new TextEncoder();
    for (const line of ics.split('\r\n')) expect(enc.encode(line).length).toBeLessThanOrEqual(75);
  });

  it('folds long lines without splitting a Hebrew letter', () => {
    const line = `SUMMARY:${'שלום '.repeat(30)}`;
    const folded = foldLine(line);
    expect(folded.replace(/\r\n /g, '')).toBe(line);
    for (const part of folded.split('\r\n')) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
  });

  it('builds the same event as a Google Calendar link', () => {
    const url = new URL(googleCalendarUrl({ time: '07:30', title: 'Polish practice – 5 minutes', details: 'Open the app', url: 'https://hanan87.github.io/learn/' }, new Date(2026, 10, 25, 9, 0)));
    expect(url.origin).toBe('https://calendar.google.com');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('dates')).toBe('20261126T073000/20261126T074000');
    expect(url.searchParams.get('recur')).toBe('RRULE:FREQ=DAILY');
    expect(url.searchParams.get('details')).toContain('https://hanan87.github.io/learn/');
  });
});

describe('can-do lines', () => {
  const courses = [
    { units: PL_UNITS, langs: ['he', 'en'] },
    { units: CNR_UNITS, langs: ['he', 'en'] },
    { units: EN_UNITS, langs: ['he', 'en', 'pl', 'cnr'] },
    { units: HE_UNITS, langs: ['he', 'en', 'pl', 'cnr'] },
  ] as const;

  it('gives every unit of every course three lines in each language it is taught in', () => {
    const ids = courses.flatMap((c) => c.units.map((u) => u.id));
    expect(Object.keys(CAN_DO).sort()).toEqual([...ids].sort());
    for (const c of courses) {
      for (const u of c.units) {
        const lines = CAN_DO[u.id];
        expect(lines, u.id).toHaveLength(3);
        for (const line of lines) {
          for (const l of c.langs) expect(line[l], `${u.id} ${l}`).toBeTruthy();
          expect(line.he, u.id).toMatch(HEBREW);
          for (const l of ['en', 'pl', 'cnr'] as const) if (line[l]) expect(line[l], `${u.id} ${l}`).not.toMatch(HEBREW);
        }
      }
    }
  });

  it('sends the Polish and Montenegrin lines to the native-speaker review', () => {
    for (const lang of ['pl', 'cnr'] as const) {
      const section = reviewSections(lang).find((s) => s.id === 'ui-can-do');
      expect(section?.entries).toHaveLength(39);
      expect(section?.entries.find((e) => e.id === 'ui:can-do/e3/2')).toMatchObject({ source: 'Order a dish with special requests ("no onions")' });
    }
  });
});
