import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { CERT_COLOR, UNIT_COLOR } from '../../src/components/unitStyle';
import { uiText } from '../../src/i18n/strings';
import { initialState, migrate, reducer, TEST_PASS_SCORE, XP } from '../../src/state/ProgressContext';

/** End-of-unit tests and their certificates: the questions in every course, the record kept per unit, and the texts. */

type Builder = typeof import('../../src/lesson/buildLesson');
type Data = typeof import('../../src/data');
type Lessons = typeof import('../../src/data/lessons');

describe.each(['pl', 'cnr', 'en', 'he'] as const)('unit tests in the %s course', (course) => {
  let builder: Builder;
  let data: Data;
  let lessons: Lessons;

  beforeAll(async () => {
    vi.stubEnv('LEARN_COURSE', course);
    vi.resetModules();
    [builder, data, lessons] = await Promise.all([import('../../src/lesson/buildLesson'), import('../../src/data'), import('../../src/data/lessons')]);
  });
  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('asks twelve graded questions on the unit’s own phrases, each once', () => {
    for (const unit of data.UNITS) {
      const own = new Set(lessons.lessonsOfUnit(unit.id).flatMap((l) => l.itemIds));
      // The questions are drawn at random: check several draws.
      for (let run = 0; run < 6; run++) {
        const steps = builder.buildUnitTest(unit.id);
        expect(steps, unit.id).toHaveLength(builder.TEST_SIZE);
        expect(new Set(steps.map((s) => s.key)).size, unit.id).toBe(steps.length);
        for (const s of steps) {
          expect(builder.STEP_SKILL[s.kind], `${unit.id} ${s.kind}`).not.toBeNull();
          if ('itemId' in s) expect(own.has(s.itemId), `${unit.id} ${s.key}`).toBe(true);
        }
      }
    }
  });

  it('checks listening, reading and writing in every unit, and speaking outside the Alef-Bet', () => {
    for (const unit of data.UNITS) {
      const skills = new Set(builder.buildUnitTest(unit.id).map((s) => builder.STEP_SKILL[s.kind]));
      const letters = lessons.lessonsOfUnit(unit.id).some((l) => l.letters);
      expect([...skills].sort(), unit.id).toEqual(letters ? ['listen', 'read', 'write'] : ['listen', 'read', 'speak', 'write']);
    }
  });

  it('has a certificate color and a can-do list for every unit', async () => {
    const { CAN_DO } = await import('../../src/data/canDo');
    for (const unit of data.UNITS) {
      expect(CERT_COLOR[unit.color], unit.id).toBeDefined();
      expect(UNIT_COLOR[unit.color], unit.id).toBeDefined();
      expect(CAN_DO[unit.id]?.length, unit.id).toBeGreaterThan(0);
    }
  });
});

describe('the unit test record', () => {
  const take = (score: number, state = initialState()) => reducer(state, { type: 'test', unitId: 'u2', score });

  it('keeps the day and score of the first pass for the certificate, with a bonus once', () => {
    const failed = take(67);
    expect(failed.tests.u2).toEqual({ bestScore: 67, attempts: 1, passedAt: null, passScore: null });
    expect(failed.xp).toBe(XP.testAttempt);

    const passed = take(92, failed);
    expect(passed.tests.u2.passedAt).toBe(passed.daily.date);
    expect(passed.tests.u2.passScore).toBe(92);
    expect(passed.xp - failed.xp).toBe(XP.testPass);

    const again = take(100, { ...passed, tests: { u2: { ...passed.tests.u2, passedAt: '2026-11-01' } } });
    expect(again.tests.u2).toEqual({ bestScore: 100, attempts: 3, passedAt: '2026-11-01', passScore: 92 });
    expect(again.xp - passed.xp).toBe(XP.testAttempt);
  });

  it('passes from exactly the pass mark', () => {
    expect(take(TEST_PASS_SCORE).tests.u2.passedAt).not.toBeNull();
    expect(take(TEST_PASS_SCORE - 1).tests.u2.passedAt).toBeNull();
  });

  it('starts empty for progress saved before the tests existed', () => {
    const old = { ...initialState() } as Partial<ReturnType<typeof initialState>>;
    delete old.tests;
    expect(migrate(old)?.tests).toEqual({});
  });
});

describe('unit test texts', () => {
  it('speak Polish and Montenegrin, numbers included', () => {
    const lines: [string, string, string][] = [
      ['Unit test', 'Test działu', 'Test cjeline'],
      ['12 questions on everything in this unit. Score 80% to pass and get a certificate.', '12 pytań z całego działu. Zdobądź 80%, aby zaliczyć i otrzymać certyfikat.', '12 pitanja iz cijele cjeline. Osvojite 80% da položite i dobijete sertifikat.'],
      ['Correct: 8 of 12. To pass you need 10.', 'Poprawne: 8 z 12. Aby zaliczyć, potrzeba 10.', 'Tačno: 8 od 12. Za prolaz treba 10.'],
      ['Your best so far: 67%', 'Twój najlepszy wynik do tej pory: 67%', 'Vaš najbolji rezultat do sada: 67%'],
      ['Opens after all 4 lessons', 'Otworzy się po ukończeniu wszystkich lekcji (4)', 'Otvara se kad završite sve lekcije (4)'],
      ['12 questions · pass with 80% · certificate', '12 pytań · zaliczenie od 80% · certyfikat', '12 pitanja · prolaz od 80% · sertifikat'],
      ['Unit 2 completed', 'Dział 2 ukończony', 'Cjelina 2 završena'],
      ['The mark on the ring is the 80% you need.', 'Znacznik na kole to wymagane 80%.', 'Oznaka na krugu je potrebnih 80%.'],
      ['Now you can', 'Teraz potrafisz', 'Sada znate'],
      ['See your result', 'Zobacz wynik', 'Pogledajte rezultat'],
    ];
    for (const [en, pl, cnr] of lines) {
      expect(uiText(en, 'pl')).toBe(pl);
      expect(uiText(en, 'cnr')).toBe(cnr);
    }
  });
});
