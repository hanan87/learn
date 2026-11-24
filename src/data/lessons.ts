import { ALEFBET_PLAN, ALEFBET_UNIT } from './he/alphabet';
import { UNITS } from './index';
import type { CourseUnitId } from './types';

export interface LessonDef {
  id: string;
  unitId: CourseUnitId;
  /** 1-based position inside the unit. */
  number: number;
  itemIds: string[];
  /** Alef-Bet lessons (Hebrew course): the letter and vowel cards this lesson introduces. */
  letters?: string[];
}

/** Split a list into `parts` chunks whose sizes differ by at most one. */
function balancedChunks<T>(list: T[], parts: number): T[][] {
  const out: T[][] = [];
  const base = Math.floor(list.length / parts);
  let extra = list.length % parts;
  let i = 0;
  for (let p = 0; p < parts; p++) {
    const size = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    out.push(list.slice(i, i + size));
    i += size;
  }
  return out;
}

/**
 * Each unit is split into lessons of roughly four items. The Alef-Bet unit has one lesson per group
 * of letters, its four words in item order.
 */
export const LESSONS: LessonDef[] = UNITS.flatMap((unit) => {
  const letters = unit.id === ALEFBET_UNIT ? ALEFBET_PLAN : undefined;
  const parts = letters ? letters.length : Math.max(1, Math.round(unit.items.length / 4));
  return balancedChunks(unit.items, parts).map((items, idx) => ({
    id: `${unit.id}-L${idx + 1}`,
    unitId: unit.id,
    number: idx + 1,
    itemIds: items.map((i) => i.id),
    ...(letters ? { letters: letters[idx] } : {}),
  }));
});

export function getLesson(id: string): LessonDef | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function lessonsOfUnit(unitId: CourseUnitId): LessonDef[] {
  return LESSONS.filter((l) => l.unitId === unitId);
}
