import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ClipboardCheck, Dumbbell, Flame, Star, Target, Trophy, Volume2 } from 'lucide-react';
import { getItem } from '../data';
import { getLetter } from '../data/he/alphabet';
import { lessonsOfUnit, type LessonDef } from '../data/lessons';
import { useLang } from '../i18n/LangContext';
import { haptic } from '../lib/haptics';
import { playCue } from '../lib/sfx';
import { speak } from '../lib/tts';
import { TEST_PASS_SCORE, useProgress } from '../state/ProgressContext';

/** What the learner had when the lesson opened, so the end screen can show what this lesson added. */
export interface LessonStart {
  xp: number;
  todayXp: number;
  studiedToday: boolean;
  level: number;
}

interface Props {
  lesson?: LessonDef;
  subtitle: string;
  accuracy: number;
  start: LessonStart;
  onClose: () => void;
  /** Opens the unit test; offered once every lesson of the unit is done and the test is not passed yet. */
  onOpenTest?: () => void;
}

const RING_R = 42;
const RING_LEN = 2 * Math.PI * RING_R;

/**
 * End-of-lesson celebration: earned XP, accuracy and streak, the daily-goal ring filling up from where
 * the lesson started, a level-up line, and the lesson's phrases (or letters) to hear once more.
 */
export function LessonComplete({ lesson, subtitle, accuracy, start, onClose, onOpenTest }: Props) {
  const { state, todayXp, activeStreak, studiedToday, level } = useProgress();
  const { tr } = useLang();
  const goal = state.dailyGoal;
  const earned = state.xp - start.xp;
  const goalReached = todayXp >= goal;
  const goalJustReached = goalReached && start.todayXp < goal;
  const streakGrew = studiedToday && !start.studiedToday;
  const levelUp = level > start.level;
  const fromPct = Math.min(1, start.todayXp / goal);
  const toPct = Math.min(1, todayXp / goal);
  // The ring starts where the day stood before the lesson and fills up once the screen is shown.
  const [ringPct, setRingPct] = useState(fromPct);

  useEffect(() => {
    const t = setTimeout(() => setRingPct(toPct), 250);
    playCue('success').catch(() => undefined);
    haptic('success');
    return () => clearTimeout(t);
  }, [toPct]);

  const phrases = lesson && !lesson.letters ? lesson.itemIds.map((id) => getItem(id)).filter((i) => !!i) : [];
  const letters = lesson?.letters?.map((id) => getLetter(id)?.glyph).filter((g): g is string => !!g) ?? [];
  const isPractice = !lesson;
  const testOpen = !!lesson && !!onOpenTest && lessonsOfUnit(lesson.unitId).every((l) => state.lessons[l.id]) && !state.tests[lesson.unitId]?.passedAt;

  return (
    <div className="pt-safe fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-50" role="dialog" aria-modal="true" aria-label={subtitle} data-testid="lesson-complete">
      <Confetti big={goalJustReached || levelUp} />
      <div className="relative mx-auto flex min-h-full max-w-md flex-col gap-5 px-4 pt-8 text-center">
        <div className="animate-celebrate mx-auto grid size-24 place-items-center rounded-full bg-amber-100 ring-8 ring-amber-50">
          {isPractice ? <Dumbbell className="size-12 text-indigo-600" aria-hidden /> : <Trophy className="size-12 text-amber-600" aria-hidden />}
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900">{isPractice ? tr('האימון הושלם!', 'Session complete!') : tr('השיעור הושלם!', 'Lesson complete!')}</p>
          <p className="mt-1 text-slate-600">{subtitle}</p>
          {levelUp && (
            <p className="animate-pop-in mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800" data-testid="level-up">
              <Star className="size-4 fill-amber-400 text-amber-600" aria-hidden />
              {tr(`עליתם לרמה ${level}!`, `You reached level ${level}!`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Tile icon={<Star className="size-5 fill-amber-400 text-amber-600" aria-hidden />} value={`+${earned}`} label="XP" tone="ring-amber-300" />
          <Tile icon={<Target className="size-5 text-emerald-600" aria-hidden />} value={`${accuracy}%`} label={tr('דיוק', 'Accuracy')} tone="ring-emerald-300" />
          <Tile
            icon={<Flame className={`size-5 ${activeStreak > 0 ? 'fill-orange-500/25 text-orange-600' : 'text-slate-400'}`} aria-hidden />}
            value={String(activeStreak)}
            label={tr('ימי רצף', 'day streak')}
            tone="ring-orange-300"
            badge={streakGrew ? '+1' : undefined}
            testId="complete-streak"
          />
        </div>

        <section className="flex items-center gap-4 rounded-2xl bg-white p-4 text-start shadow-sm ring-1 ring-slate-200/80" data-testid="goal-ring" data-reached={goalReached}>
          <svg viewBox="0 0 100 100" className="size-24 shrink-0 -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth="10" className="stroke-slate-200" />
            <circle
              cx="50"
              cy="50"
              r={RING_R}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_LEN}
              strokeDashoffset={RING_LEN * (1 - ringPct)}
              className={`transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none ${goalReached ? 'stroke-emerald-500' : 'stroke-brand-600'}`}
            />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-500">{tr('יעד יומי', 'Daily goal')}</p>
            <p className="text-2xl font-black text-slate-900 tabular-nums" dir="ltr">
              <span className="sr-only">{tr('יעד יומי', 'Daily goal')}: </span>
              {todayXp}/{goal} XP
            </p>
            <p className={`text-sm font-semibold ${goalReached ? 'text-emerald-700' : 'text-slate-600'}`}>
              {goalReached ? tr('היעד היומי הושג!', 'Daily goal reached!') : tr(`עוד ${goal - todayXp} XP ליעד היומי`, `${goal - todayXp} XP to today's goal`)}
            </p>
            {streakGrew && (
              <p className="mt-0.5 text-sm font-semibold text-orange-700" data-testid="streak-grew">
                {tr(`יום ${activeStreak} ברצף!`, `Day ${activeStreak} of your streak!`)}
              </p>
            )}
          </div>
        </section>

        {(phrases.length > 0 || letters.length > 0) && (
          <section className="space-y-2 text-start" data-testid="lesson-phrases">
            <h3 className="text-sm font-bold text-slate-700">{letters.length ? tr('האותיות בשיעור הזה', 'Letters from this lesson') : tr('הביטויים בשיעור הזה', 'Phrases from this lesson')}</h3>
            <ul className="flex flex-wrap gap-2">
              {letters.map((glyph) => (
                <li key={glyph} className="polish grid min-h-11 min-w-11 place-items-center rounded-xl bg-white px-3 text-2xl font-bold text-slate-900 ring-1 ring-slate-200/80" lang="he">
                  {glyph}
                </li>
              ))}
              {phrases.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => speak(item.polish)}
                    className="flex min-h-11 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-start ring-1 ring-slate-200/80 transition hover:ring-slate-300 active:scale-[0.98]"
                  >
                    <Volume2 className="size-4 shrink-0 text-brand-600" aria-hidden />
                    <span className="polish font-semibold text-slate-900">{item.polish}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {testOpen && (
          <section className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3 text-start ring-1 ring-brand-200" data-testid="test-offer">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <ClipboardCheck className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-slate-900">{tr('מבחן היחידה נפתח', 'The unit test is open')}</span>
              <span className="block text-sm text-slate-600">{tr(`עוברים מ-${TEST_PASS_SCORE}% ומקבלים תעודה.`, `Pass with ${TEST_PASS_SCORE}% and get a certificate.`)}</span>
            </span>
            <button type="button" onClick={onOpenTest} className="min-h-11 shrink-0 rounded-xl bg-brand-600 px-3 text-sm font-bold text-white">
              {tr('למבחן', 'Take it')}
            </button>
          </section>
        )}

        <p className="text-sm text-slate-600">
          {isPractice
            ? tr('התוצאות עודכנו בהיסטוריה האישית שלכם – המילים והצלילים החלשים יחזרו שוב בקרוב.', 'Your results updated your personal history – weak words and sounds will come back soon.')
            : tr('כל המילים מהשיעור נוספו למאגר החזרה המרווחת ויחזרו אליכם מחר.', 'All words from this lesson were added to your spaced-repetition deck and will return tomorrow.')}
        </p>

        <div className="sticky bottom-0 mt-auto -mx-4 bg-linear-to-t from-slate-50 from-65% to-transparent px-4 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onClose} className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-md active:scale-[0.98]">
            {tr('המשך', 'Continue')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon, value, label, tone, badge, testId }: { icon: ReactNode; value: string; label: string; tone: string; badge?: string; testId?: string }) {
  return (
    <div className={`relative rounded-2xl bg-white px-2 py-3 ring-2 ${tone}`} data-testid={testId}>
      {badge && <span className="animate-celebrate absolute -top-2 end-2 rounded-full bg-orange-500 px-1.5 text-xs leading-5 font-bold text-white" dir="ltr">{badge}</span>}
      <span className="mx-auto block w-fit">{icon}</span>
      <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums" dir="ltr">
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

const CONFETTI_COLORS = ['bg-amber-400', 'bg-emerald-500', 'bg-sky-500', 'bg-pink-500', 'bg-violet-500', 'bg-orange-500'];

/** A one-off burst of falling paper bits; hidden when the learner prefers reduced motion. */
export function Confetti({ big }: { big: boolean }) {
  const count = big ? 36 : 18;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-0 overflow-visible" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        // Spread pieces evenly with a fixed jitter, so every run looks the same and needs no randomness.
        const left = ((i * 37) % 100) + ((i * 7) % 5);
        const style = {
          left: `${left}%`,
          '--drift': `${((i * 53) % 90) - 45}px`,
          '--spin': `${((i * 97) % 540) + 180}deg`,
          '--dur': `${1.6 + ((i * 13) % 10) / 10}s`,
          '--delay': `${((i * 29) % 6) / 10}s`,
        } as CSSProperties;
        return <span key={i} className={`confetti-piece ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}`} style={style} />;
      })}
    </div>
  );
}
