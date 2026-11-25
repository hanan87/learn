import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { uiText } from '../../src/i18n/strings';

/** Placement test (English course): its questions per unit, and what placing a learner does to their progress. */

type Builder = typeof import('../../src/lesson/buildLesson');
type Data = typeof import('../../src/data');
type Lessons = typeof import('../../src/data/lessons');
type Progress = typeof import('../../src/state/ProgressContext');

describe('placement test in the English course', () => {
  let builder: Builder;
  let data: Data;
  let lessons: Lessons;
  let progress: Progress;

  beforeAll(async () => {
    vi.stubEnv('LEARN_COURSE', 'en');
    vi.resetModules();
    [builder, data, lessons, progress] = await Promise.all([
      import('../../src/lesson/buildLesson'),
      import('../../src/data'),
      import('../../src/data/lessons'),
      import('../../src/state/ProgressContext'),
    ]);
  });
  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('asks four listening and reading questions per unit on four different phrases – no speaking, no typing', () => {
    for (const unit of data.UNITS) {
      for (let run = 0; run < 5; run++) {
        const steps = builder.buildPlacementUnit(unit.id);
        expect(steps, unit.id).toHaveLength(builder.PLACEMENT_QUESTIONS);
        expect(new Set(steps.map((s) => ('itemId' in s ? s.itemId : s.key))).size, unit.id).toBe(4);
        expect(steps.map((s) => builder.STEP_SKILL[s.kind]), unit.id).toEqual(['listen', 'listen', 'read', 'read']);
      }
    }
  });

  it('decides a unit as soon as it is passed or can no longer be', () => {
    const v = builder.placementVerdict;
    expect(v([])).toBeNull();
    expect(v([true, true])).toBeNull();
    expect(v([true, true, true])).toBe('known');
    expect(v([false, true, true, true])).toBe('known');
    expect(v([false, false])).toBe('start');
    expect(v([true, false, false])).toBe('start');
    expect(v([true, false, true])).toBeNull();
  });

  it('marks the known units as done and puts their phrases into review over the coming week', () => {
    const { initialState, reducer, XP } = progress;
    const known = [
      { unitId: 'e1', score: 100 },
      { unitId: 'e2', score: 75 },
    ];
    const placed = reducer(initialState(), { type: 'placement', known, finished: true });
    expect(placed.placement?.known).toEqual(['e1', 'e2']);
    expect(placed.xp).toBe(XP.placement);
    for (const { unitId, score } of known) {
      for (const l of lessons.lessonsOfUnit(unitId as never)) {
        expect(placed.lessons[l.id]).toMatchObject({ bestAccuracy: score, placed: true });
        for (const id of l.itemIds) {
          expect(placed.items[id].learned, id).toBe(true);
          expect(placed.items[id].srsBox).toBe(2);
        }
      }
    }
    // Due dates are spread over seven days, not all tomorrow.
    const due = new Set(Object.values(placed.items).map((p) => p.dueDate));
    expect(due.size).toBe(7);
    // Unit 3 is untouched.
    expect(lessons.lessonsOfUnit('e3').some((l) => placed.lessons[l.id])).toBe(false);
  });

  it('keeps lessons already done and records a dismissed offer without XP', () => {
    const { initialState, reducer } = progress;
    const start = { ...initialState(), lessons: { 'e1-L1': { completedAt: '2026-11-01', bestAccuracy: 60 } } };
    const placed = reducer(start, { type: 'placement', known: [{ unitId: 'e1', score: 100 }], finished: true });
    expect(placed.lessons['e1-L1']).toEqual({ completedAt: '2026-11-01', bestAccuracy: 60 });

    const dismissed = reducer(initialState(), { type: 'placement', known: [], finished: false });
    expect(dismissed.placement?.known).toEqual([]);
    expect(dismissed.xp).toBe(0);
    expect(dismissed.lessons).toEqual({});
  });

  it('starts empty for progress saved before the placement test existed', () => {
    const { initialState, migrate } = progress;
    const old = { ...initialState() } as Partial<ReturnType<typeof initialState>>;
    delete old.placement;
    expect(migrate(old)?.placement).toBeNull();
  });
});

describe('placement test texts', () => {
  it('speak Polish and Montenegrin, numbers included', () => {
    const lines: [string, string, string][] = [
      ['Placement test', 'Test poziomujący', 'Test nivoa'],
      ['3 of 4 right in a unit = you already know it.', '3 z 4 poprawnych w dziale = już go znasz.', '3 od 4 tačnih u cjelini = već je znate.'],
      ['Up to 24 questions · about 3 minutes', 'Do 24 pytań · około 3 minut', 'Do 24 pitanja · oko 3 minuta'],
      ['Unit 3 of 6', 'Dział 3 z 6', 'Cjelina 3 od 6'],
      ['Question 2 of 4', 'Pytanie 2 z 4', 'Pitanje 2 od 4'],
      ['Start at unit 3', 'Zaczynasz od działu 3', 'Počinjete od cjeline 3'],
      ['Start unit 3', 'Zacznij dział 3', 'Započnite cjelinu 3'],
      ["Don't know? Skip", 'Nie wiesz? Pomiń', 'Ne znate? Preskočite'],
      ['Already know some English?', 'Znasz już trochę angielskiego?', 'Već znate malo engleskog?'],
    ];
    for (const [en, pl, cnr] of lines) {
      expect(uiText(en, 'pl')).toBe(pl);
      expect(uiText(en, 'cnr')).toBe(cnr);
    }
  });
});
