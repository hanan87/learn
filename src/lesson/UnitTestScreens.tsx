import type { ReactNode } from 'react';
import { BookOpen, ClipboardCheck, Headphones, Mic, PenLine, RotateCcw, Volume2, X, type LucideIcon } from 'lucide-react';
import { Certificate } from '../components/Certificate';
import { UNIT_COLOR } from '../components/unitStyle';
import { getItem } from '../data';
import { getLetter } from '../data/he/alphabet';
import { itemText, unitText, type Unit } from '../data/types';
import { useLang } from '../i18n/LangContext';
import { speak } from '../lib/tts';
import { TEST_PASS_SCORE, useProgress } from '../state/ProgressContext';
import { STEP_SKILL, type LessonStep, type TestSkill } from './buildLesson';
import { Confetti } from './LessonComplete';

/**
 * The screens around a unit test: the intro (what it checks and its rules), and the result – the
 * certificate when the learner passed, or the score against the pass mark with the phrases to review.
 */

const SKILL_ICON: Record<TestSkill, LucideIcon> = { listen: Headphones, read: BookOpen, write: PenLine, speak: Mic };

function Screen({ label, children, testId }: { label: string; children: ReactNode; testId: string }) {
  return (
    <div className="pt-safe fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-50" role="dialog" aria-modal="true" aria-label={label} data-testid={testId}>
      <div className="relative mx-auto flex min-h-full max-w-md flex-col gap-4 px-4 pt-3">{children}</div>
    </div>
  );
}

function BottomActions({ children }: { children: ReactNode }) {
  return <div className="sticky bottom-0 mt-auto -mx-4 space-y-2 bg-linear-to-t from-slate-50 from-65% to-transparent px-4 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>;
}

export function TestIntro({ unit, steps, onStart, onClose }: { unit: Unit; steps: LessonStep[]; onStart: () => void; onClose: () => void }) {
  const { tr, lang } = useLang();
  const { state } = useProgress();
  const record = state.tests[unit.id];
  const counts = new Map<TestSkill, number>();
  for (const s of steps) {
    const skill = STEP_SKILL[s.kind];
    if (skill) counts.set(skill, (counts.get(skill) ?? 0) + 1);
  }
  const skillLabel: Record<TestSkill, string> = {
    listen: tr('שמיעה', 'Listening'),
    read: tr('קריאה', 'Reading'),
    write: tr('כתיבה', 'Writing'),
    speak: tr('דיבור', 'Speaking'),
  };
  const title = tr('מבחן סוף יחידה', 'Unit test');

  return (
    <Screen label={title} testId="test-intro">
      <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200/80 hover:text-slate-900" aria-label={tr('סגור', 'Close')}>
        <X className="size-5" />
      </button>
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <span className="grid size-20 place-items-center rounded-3xl bg-brand-600 text-white shadow-lg shadow-brand-600/25">
          <ClipboardCheck className="size-10" strokeWidth={1.8} aria-hidden />
        </span>
        <p className={`mt-2 text-sm font-semibold ${UNIT_COLOR[unit.color].num}`}>
          {tr('יחידה', 'Unit')} {unit.order} · {unitText(unit, lang).title}
        </p>
        <h2 className="text-[28px] leading-tight font-bold text-slate-900">{title}</h2>
        <p className="max-w-xs leading-relaxed text-slate-600">
          {tr(
            `${steps.length} שאלות מכל מה שלמדתם ביחידה. עוברים מ-${TEST_PASS_SCORE}% ומקבלים תעודה.`,
            `${steps.length} questions on everything in this unit. Score ${TEST_PASS_SCORE}% to pass and get a certificate.`,
          )}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2" data-testid="test-skills">
        {[...counts].map(([skill, n]) => {
          const Icon = SKILL_ICON[skill];
          return (
            <li key={skill} className="flex items-center gap-2.5 rounded-2xl bg-white p-3 ring-1 ring-slate-200/80">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-slate-900">
                <span className="tabular-nums">{n}</span> · {skillLabel[skill]}
              </span>
            </li>
          );
        })}
      </ul>

      <ul className="space-y-2.5 rounded-2xl bg-white p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200/80">
        <li className="flex gap-2">
          <span className="font-bold text-brand-600" aria-hidden>·</span>
          {tr('כל שאלה נספרת פעם אחת – טעות לא חוזרת בסוף.', 'Each question counts once – a mistake does not come back at the end.')}
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-brand-600" aria-hidden>·</span>
          {tr('אחרי כל תשובה תראו אם צדקתם ומה הנכון.', 'After each answer you see whether you were right.')}
        </li>
        {counts.has('speak') && (
          <li className="flex gap-2">
            <span className="font-bold text-brand-600" aria-hidden>·</span>
            {tr('אין מיקרופון? אפשר לדלג על שאלות הדיבור, והן לא נספרות.', 'No microphone? You can skip the speaking questions – they are not counted.')}
          </li>
        )}
        <li className="flex gap-2">
          <span className="font-bold text-brand-600" aria-hidden>·</span>
          {tr('לא עברתם? אפשר לנסות שוב מתי שתרצו.', "Didn't pass? Try again whenever you like.")}
        </li>
      </ul>

      <BottomActions>
        {record && (
          <p className="text-center text-sm text-slate-600" data-testid="test-best">
            {record.passedAt ? tr(`עברתם את המבחן. השיא שלכם: ${record.bestScore}%`, `You passed this test. Your best: ${record.bestScore}%`) : tr(`השיא שלכם עד עכשיו: ${record.bestScore}%`, `Your best so far: ${record.bestScore}%`)}
          </p>
        )}
        <button type="button" onClick={onStart} className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-md active:scale-[0.98]">
          {tr('להתחיל את המבחן', 'Start the test')}
        </button>
      </BottomActions>
    </Screen>
  );
}

const RING_R = 42;
const RING_LEN = 2 * Math.PI * RING_R;

interface ResultProps {
  unit: Unit;
  score: number;
  correct: number;
  total: number;
  earned: number;
  /** Questions answered wrong, for the review list. */
  missed: LessonStep[];
  onRetry: () => void;
  onClose: () => void;
}

export function TestResult(props: ResultProps) {
  return props.score >= TEST_PASS_SCORE ? <TestPassed {...props} /> : <TestFailed {...props} />;
}

function TestPassed({ unit, score, earned, onClose }: ResultProps) {
  const { tr } = useLang();
  const { state } = useProgress();
  const record = state.tests[unit.id];
  const title = tr('עברתם את המבחן!', 'You passed!');
  return (
    <Screen label={title} testId="test-passed">
      <Confetti big />
      <div className="pt-3 text-center">
        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
        <p className="text-slate-600">
          {tr('הציון שלכם', 'Your score')}: <span dir="ltr" className="font-bold text-emerald-700">{score}%</span>
        </p>
      </div>
      {record?.passedAt && <Certificate unit={unit} score={record.passScore ?? score} date={record.passedAt} />}
      <BottomActions>
        <button type="button" onClick={onClose} className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-md active:scale-[0.98]">
          {tr('המשך', 'Continue')} <span dir="ltr">(+{earned} XP)</span>
        </button>
      </BottomActions>
    </Screen>
  );
}

function TestFailed({ score, correct, total, earned, missed, onRetry, onClose }: ResultProps) {
  const { tr, lang } = useLang();
  const need = Math.ceil((TEST_PASS_SCORE / 100) * total);
  const items = [...new Map(missed.flatMap((s) => ('itemId' in s && getItem(s.itemId) ? [[s.itemId, getItem(s.itemId)!] as const] : []))).values()];
  const letters = [...new Set(missed.flatMap((s) => (s.kind === 'letter-sound' ? [s.letterId] : [])))].map((id) => getLetter(id)).filter((l) => !!l);
  const title = score >= 60 ? tr('כמעט!', 'Almost!') : tr('עוד קצת תרגול', 'A little more practice');

  return (
    <Screen label={title} testId="test-failed">
      <div className="flex flex-col items-center gap-1.5 pt-6 text-center">
        <div className="relative size-32">
          <svg viewBox="0 0 100 100" className="size-32" aria-hidden>
            <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth="9" className="stroke-slate-200" />
            <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(RING_LEN * score) / 100} ${RING_LEN}`} transform="rotate(-90 50 50)" className="stroke-brand-600" />
            {/* The pass mark. */}
            <line x1="50" y1="2" x2="50" y2="15" strokeWidth="2.2" className="stroke-slate-900" transform={`rotate(${(TEST_PASS_SCORE / 100) * 360} 50 50)`} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-3xl font-black text-slate-900 tabular-nums" dir="ltr" data-testid="test-score">
            {score}%
          </span>
        </div>
        <h2 className="mt-1 text-2xl font-black text-slate-900">{title}</h2>
        <p className="max-w-xs leading-relaxed text-slate-600">
          {tr(`נכונות: ${correct} מתוך ${total}. כדי לעבור צריך ${need}.`, `Correct: ${correct} of ${total}. To pass you need ${need}.`)}{' '}
          {tr(`הסימון על העיגול הוא ה-${TEST_PASS_SCORE}% הנדרשים.`, `The mark on the ring is the ${TEST_PASS_SCORE}% you need.`)}
        </p>
        <span className="mt-1 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700" dir="ltr">
          +{earned} XP
        </span>
      </div>

      {(items.length > 0 || letters.length > 0) && (
        <section className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80" data-testid="test-missed">
          <h3 className="text-sm font-bold text-slate-900">{tr('כדאי לחזור על אלה', 'Worth another look')}</h3>
          <ul className="space-y-1.5">
            {letters.map((l) => (
              <li key={l.id} className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-3">
                <span className="polish text-2xl font-bold text-slate-900" lang="he">
                  {l.glyph}
                </span>
                <span className="text-sm text-slate-600" dir="ltr">
                  {l.sound}
                </span>
              </li>
            ))}
            {items.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => speak(item.polish)} className="flex min-h-12 w-full items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-1.5 text-start hover:bg-slate-100">
                  <Volume2 className="size-[18px] shrink-0 text-brand-600" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="polish block font-semibold text-slate-900">{item.polish}</span>
                    <span className="block text-sm text-slate-500">{itemText(item, lang).meaning}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <BottomActions>
        <button type="button" onClick={onRetry} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-md active:scale-[0.98]">
          <RotateCcw className="size-[18px]" aria-hidden /> {tr('לנסות שוב', 'Try again')}
        </button>
        <button type="button" onClick={onClose} className="min-h-12 w-full rounded-2xl bg-white font-semibold text-brand-700 ring-1 ring-slate-300">
          {tr('חזרה למפה', 'Back to the map')}
        </button>
      </BottomActions>
    </Screen>
  );
}
