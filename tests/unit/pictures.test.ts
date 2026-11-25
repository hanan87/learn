import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PICTURES, pictureSlug } from '../../src/data/pictures';
import { uiText } from '../../src/i18n/strings';

/** Picture cards: every phrase that can be drawn has a 3D picture, its file is in the app, and lessons ask one picture question. */

const PICTURE_DIR = resolve(__dirname, '../../public/pictures');

describe('picture files', () => {
  it('has a small WebP file for every picture name, and the licence next to them', () => {
    for (const name of new Set(Object.values(PICTURES))) {
      const file = resolve(PICTURE_DIR, `${pictureSlug(name)}.webp`);
      expect(existsSync(file), name).toBe(true);
      expect(statSync(file).size, name).toBeLessThan(20_000);
    }
    expect(existsSync(resolve(PICTURE_DIR, 'LICENSE'))).toBe(true);
  });

  it('names files the way the download script does', () => {
    expect(pictureSlug('Hot beverage')).toBe('hot-beverage');
    expect(pictureSlug('Globe showing europe-africa')).toBe('globe-showing-europe-africa');
    expect(pictureSlug('Keycap 10')).toBe('keycap-10');
    expect(pictureSlug('T-shirt')).toBe('t-shirt');
  });
});

type Builder = typeof import('../../src/lesson/buildLesson');
type Data = typeof import('../../src/data');
type Lessons = typeof import('../../src/data/lessons');

describe.each(['pl', 'cnr', 'en', 'he'] as const)('pictures in the %s course', (course) => {
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

  it('gives a picture to at least nine phrases in ten', () => {
    const items = data.UNITS.flatMap((u) => u.items);
    const drawn = items.filter((i) => PICTURES[i.id]);
    expect(drawn.length / items.length).toBeGreaterThanOrEqual(0.9);
  });

  it('asks at most one picture question per lesson, each option a different picture from the unit', () => {
    let asked = 0;
    for (const lesson of lessons.LESSONS) {
      const unitIds = new Set(data.getUnit(lesson.unitId).items.map((i) => i.id));
      for (let run = 0; run < 4; run++) {
        const steps = builder.buildLesson(lesson).filter((s) => s.kind === 'listen-picture');
        expect(steps.length, lesson.id).toBeLessThanOrEqual(1);
        for (const s of steps) {
          if (s.kind !== 'listen-picture') continue;
          asked++;
          expect(s.optionIds, lesson.id).toContain(s.itemId);
          expect(s.optionIds).toHaveLength(4);
          expect(new Set(s.optionIds.map((id) => PICTURES[id])).size, lesson.id).toBe(4);
          for (const id of s.optionIds) expect(unitIds.has(id), `${lesson.id} ${id}`).toBe(true);
        }
      }
    }
    expect(asked).toBeGreaterThan(0);
  });
});

describe('picture texts', () => {
  it('speak Polish and Montenegrin', () => {
    expect(uiText('Listen and pick the picture', 'pl')).toBe('Posłuchaj i wybierz obrazek');
    expect(uiText('What did you hear? Pick the picture', 'cnr')).toBe('Šta ste čuli? Izaberite sliku');
    expect(uiText('Pictures: Microsoft Fluent Emoji, MIT licence', 'pl')).toBe('Obrazki: Microsoft Fluent Emoji, licencja MIT');
  });
});
