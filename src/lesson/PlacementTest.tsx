import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, CheckCircle2, Flag, Info, Signal, X, XCircle } from 'lucide-react';
import { getItem, UNITS } from '../data';
import { LESSONS } from '../data/lessons';
import { itemText, unitText, type Unit } from '../data/types';
import { useLang } from '../i18n/LangContext';
import { COURSE_INFO as C } from '../lib/course';
import { haptic } from '../lib/haptics';
import { stopSpeaking } from '../lib/tts';
import { useProgress } from '../state/ProgressContext';
import { PLACEMENT_PASS, PLACEMENT_QUESTIONS, STAGE_LABELS, buildPlacementUnit, placementVerdict, type LessonStep } from './buildLesson';
import { renderStep } from './LessonPlayer';
import { PolishSyllables } from '../components/PolishSyllables';
import type { StepResult } from './types';

/**
 * Placement test: unit after unit from the first, a few listening and reading questions each (no
 * microphone, no typing). Three right answers out of four mean the learner already knows the unit; the
 * first unit they do not know is where they start. Known units can then be marked as done.
 */

interface UnitScore {
  unit: Unit;
  correct: number;
  asked: number;
  passed: boolean;
}

interface Props {
  onClose: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export function PlacementTest({ onClose, onOpenLesson }: Props) {
  const { tr, loc, lang } = useLang();
  const [phase, setPhase] = useState<'intro' | 'run' | 'result'>('intro');
  const [unitIdx, setUnitIdx] = useState(0);
  const [steps, setSteps] = useState<LessonStep[]>(() => buildPlacementUnit(UNITS[0].id));
  const [q, setQ] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [result, setResult] = useState<StepResult | null>(null);
  const [scores, setScores] = useState<UnitScore[]>([]);
  const [confirmExit, setConfirmExit] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      stopSpeaking();
    };
  }, []);

  const unit = UNITS[unitIdx];
  const step = steps[q];

  const answer = (r: StepResult) => {
    if (result) return;
    setResult(r);
    setAnswers((a) => [...a, r.correct === true]);
    if (r.correct !== null) haptic(r.correct ? 'success' : 'error');
  };

  // Not knowing is an answer too: it counts as wrong, without marking the phrase as a mistake.
  const skip = () => {
    if (!step || !('itemId' in step)) return answer({ correct: false, tone: 'neutral', title: tr('דילגתם', 'Skipped') });
    const item = getItem(step.itemId);
    answer({
      correct: false,
      tone: 'neutral',
      title: tr('דילגתם', 'Skipped'),
      detail: item && (
        <div className="space-y-1">
          <PolishSyllables notation={item.syllablesPolish} size="sm" />
          <p>{itemText(item, lang).meaning}</p>
        </div>
      ),
    });
  };

  const next = () => {
    stopSpeaking();
    const verdict = placementVerdict(answers, steps.length);
    setResult(null);
    if (!verdict) {
      setQ((i) => i + 1);
      return;
    }
    const ok = answers.filter(Boolean).length;
    const passed = verdict === 'known';
    setScores((s) => [...s, { unit, correct: ok, asked: answers.length, passed }]);
    if (passed && unitIdx + 1 < UNITS.length) {
      setUnitIdx(unitIdx + 1);
      setSteps(buildPlacementUnit(UNITS[unitIdx + 1].id));
      setQ(0);
      setAnswers([]);
    } else setPhase('result');
  };

  if (phase === 'intro') {
    return (
      <Screen label={tr('מבחן רמה', 'Placement test')} testId="placement-intro">
        <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200/80" aria-label={tr('סגור', 'Close')}>
          <X className="size-5" />
        </button>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="grid size-20 place-items-center rounded-3xl bg-brand-600 text-white shadow-lg shadow-brand-600/25">
            <Signal className="size-10" strokeWidth={1.9} aria-hidden />
          </span>
          <p className="mt-1.5 text-sm font-semibold text-brand-700">{loc(C.titles)}</p>
          <h2 className="text-[28px] leading-tight font-bold text-slate-900">{tr('מבחן רמה', 'Placement test')}</h2>
          <p className="max-w-xs leading-relaxed text-slate-600">
            {tr(
              'עוברים יחידה אחרי יחידה, ארבע שאלות קצרות בכל אחת, ועוצרים כשמגיעים למה שעוד לא יודעים.',
              "Unit after unit, four short questions each – it stops where you reach what you don't know yet.",
            )}
          </p>
        </div>
        <ol className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80">
          {UNITS.map((u) => (
            <li key={u.id} className="flex items-center gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-[13px] font-bold text-brand-700 tabular-nums">{u.order}</span>
              <span className="text-sm font-medium text-slate-900">{unitText(u, lang).title}</span>
            </li>
          ))}
        </ol>
        <ul className="space-y-1.5 text-sm leading-relaxed text-slate-700">
          <li>· {tr('שמיעה וקריאה בלבד – בלי מיקרופון ובלי הקלדה.', 'Listening and reading only – no microphone, no typing.')}</li>
          <li>· {tr(`${PLACEMENT_PASS} מתוך ${PLACEMENT_QUESTIONS} נכונות ביחידה = אתם כבר יודעים אותה.`, `${PLACEMENT_PASS} of ${PLACEMENT_QUESTIONS} right in a unit = you already know it.`)}</li>
          <li>· {tr('אין כאן הצלחה או כישלון, רק נקודת התחלה.', 'There is no pass or fail here, only a starting point.')}</li>
        </ul>
        <Bottom>
          <p className="text-center text-sm text-slate-500">{tr(`עד ${UNITS.length * PLACEMENT_QUESTIONS} שאלות · בערך 3 דקות`, `Up to ${UNITS.length * PLACEMENT_QUESTIONS} questions · about 3 minutes`)}</p>
          <button type="button" onClick={() => setPhase('run')} className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-md active:scale-[0.98]">
            {tr('להתחיל', 'Start')}
          </button>
        </Bottom>
      </Screen>
    );
  }

  if (phase === 'result') return <PlacementResult scores={scores} onClose={onClose} onOpenLesson={onOpenLesson} />;

  const footerTone = result
    ? { success: 'bg-emerald-100 text-emerald-900', warning: 'bg-amber-100 text-amber-900', error: 'bg-rose-100 text-rose-900', neutral: 'bg-slate-100 text-slate-900' }[result.tone]
    : '';
  const FooterIcon = result ? { success: CheckCircle2, warning: AlertTriangle, error: XCircle, neutral: Info }[result.tone] : Info;
  const label = `${tr('מבחן רמה', 'Placement test')} · ${tr('יחידה', 'Unit')} ${unit.order}: ${unitText(unit, lang).title}`;

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-slate-50" role="dialog" aria-modal="true" aria-label={tr('מבחן רמה', 'Placement test')} data-testid="placement-run">
      <header className="pt-safe border-b border-slate-200/70 bg-slate-50/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-2.5 px-4 py-3">
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200/80"
            aria-label={tr('יציאה ממבחן הרמה', 'Leave the placement test')}
          >
            <X className="size-5" />
          </button>
          <ol className="flex flex-1 items-center" aria-label={tr(`יחידה ${unit.order} מתוך ${UNITS.length}`, `Unit ${unit.order} of ${UNITS.length}`)} data-testid="placement-units">
            {UNITS.map((u, i) => (
              <li key={u.id} className={`flex items-center ${i < UNITS.length - 1 ? 'flex-1' : ''}`} aria-hidden>
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular-nums ${
                    i < unitIdx ? 'bg-emerald-500 text-white' : i === unitIdx ? 'bg-white text-brand-700 ring-[2.5px] ring-brand-600' : 'bg-slate-200 text-slate-500'
                  }`}
                  data-state={i < unitIdx ? 'known' : i === unitIdx ? 'current' : 'next'}
                >
                  {i < unitIdx ? <Check className="size-4" strokeWidth={3} /> : u.order}
                </span>
                {i < UNITS.length - 1 && <span className={`mx-0.5 h-[3px] flex-1 rounded-full ${i < unitIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
              </li>
            ))}
          </ol>
        </div>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 pb-2">
          <p className="min-w-0 truncate text-xs font-bold tracking-wide text-brand-700">{label}</p>
          <span className="flex shrink-0 gap-1" aria-label={tr(`שאלה ${q + 1} מתוך ${steps.length}`, `Question ${q + 1} of ${steps.length}`)} data-testid="placement-dots">
            {steps.map((s, i) => (
              <span key={s.key} className={`size-2 rounded-full ${i < answers.length ? (answers[i] ? 'bg-emerald-500' : 'bg-rose-500') : i === q ? 'bg-brand-600' : 'bg-slate-300'}`} />
            ))}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div key={`${unit.id}-${step?.key}`} className="animate-pop-in mx-auto max-w-2xl px-4 pt-4 pb-44">
          {step && (
            <>
              <p className="mb-2 text-xs font-semibold text-slate-500">{loc(STAGE_LABELS[step.kind])}</p>
              {renderStep(step, !!result, answer)}
              {!result && (
                <button type="button" onClick={skip} className="mt-4 min-h-11 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-white" data-testid="placement-skip">
                  {tr('לא יודעים? דלגו', "Don't know? Skip")}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {result && (
        <div className={`animate-pop-in pb-safe fixed inset-x-0 bottom-0 z-10 ${footerTone} shadow-[0_-8px_24px_rgba(15,23,42,0.12)]`}>
          <div className="mx-auto max-w-2xl space-y-3 px-4 py-4">
            <div className="flex items-start gap-2">
              <FooterIcon className="mt-0.5 size-6 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1 text-sm">
                <p className="text-lg font-black">{result.title}</p>
                {result.detail}
              </div>
            </div>
            <button type="button" onClick={next} autoFocus className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-md active:scale-[0.98]">
              {tr('המשך', 'Continue')}
            </button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/45 p-6">
          <div className="animate-pop-in w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 text-center shadow-xl">
            <p className="text-lg font-bold">{tr('לצאת ממבחן הרמה?', 'Leave the placement test?')}</p>
            <p className="text-sm text-slate-600">{tr('שום דבר בקורס לא ישתנה.', 'Nothing in your course will change.')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirmExit(false)} className="rounded-2xl bg-brand-600 py-3 font-bold text-white">
                {tr('להמשיך', 'Keep going')}
              </button>
              <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 py-3 font-medium text-rose-600">
                {tr('יציאה', 'Leave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlacementResult({ scores, onClose, onOpenLesson }: { scores: UnitScore[]; onClose: () => void; onOpenLesson: (lessonId: string) => void }) {
  const { tr, lang } = useLang();
  const { state, completePlacement } = useProgress();
  const known = scores.filter((s) => s.passed);
  const start = UNITS.find((u) => !known.some((k) => k.unit.id === u.id));
  const firstLesson = (unitId: string) => LESSONS.find((l) => l.unitId === unitId && !state.lessons[l.id]) ?? LESSONS.find((l) => l.unitId === unitId);

  const apply = (keep: boolean) => {
    completePlacement(keep ? known.map((k) => ({ unitId: k.unit.id, score: Math.round((k.correct / k.asked) * 100) })) : [], true);
    const lesson = keep && start ? firstLesson(start.id) : !keep ? firstLesson(UNITS[0].id) : undefined;
    if (lesson) onOpenLesson(lesson.id);
    else onClose();
  };

  const title = start
    ? tr(`מתחילים ביחידה ${start.order}`, `Start at unit ${start.order}`)
    : tr('אתם כבר יודעים את כל היחידות!', 'You already know every unit!');

  return (
    <Screen label={title} testId="placement-result">
      <div className="flex flex-col items-center gap-1.5 pt-4 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-amber-100 text-amber-700 ring-8 ring-amber-50">
          <Flag className="size-9" aria-hidden />
        </span>
        {known.length > 0 && <p className="mt-2 text-sm font-semibold text-emerald-700">{tr('כל הכבוד – אתם כבר יודעים לא מעט', 'Well done – you already know quite a bit')}</p>}
        <h2 className="text-[26px] leading-tight font-bold text-slate-900" data-testid="placement-start">
          {title}
        </h2>
        {start && <p className="text-slate-600">{unitText(start, lang).title}</p>}
      </div>

      <ol className="space-y-1.5">
        {UNITS.map((u) => {
          const score = scores.find((s) => s.unit.id === u.id);
          const isKnown = !!score?.passed;
          const isStart = start?.id === u.id;
          return (
            <li
              key={u.id}
              className={`flex items-center gap-2.5 rounded-xl p-2.5 ${isStart ? 'bg-brand-50 ring-2 ring-brand-600' : isKnown ? 'bg-emerald-50' : 'bg-white ring-1 ring-slate-200/80'}`}
              data-testid={`placement-unit-${u.id}`}
              data-state={isKnown ? 'known' : isStart ? 'start' : 'next'}
            >
              <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular-nums ${isKnown ? 'bg-emerald-500 text-white' : isStart ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {isKnown ? <Check className="size-4" strokeWidth={3} aria-hidden /> : u.order}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{unitText(u, lang).title}</span>
              {isKnown && (
                <span className="shrink-0 text-xs font-bold text-emerald-700">
                  {tr('ידעתם', 'Known')} · <span dir="ltr">{score.correct}/{score.asked}</span>
                </span>
              )}
              {isStart && <span className="shrink-0 text-xs font-bold text-brand-700">{tr('מתחילים כאן', 'Start here')}</span>}
            </li>
          );
        })}
      </ol>

      {known.length > 0 && (
        <p className="rounded-2xl bg-white p-3 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200/80">
          {tr(
            'היחידות שידעתם יסומנו כגמורות. הביטויים שלהן ייכנסו לחזרה המרווחת כדי שיחזרו מדי פעם לרענון, ומבחן היחידה שלהן ייפתח – אפשר להרוויח תעודה.',
            'The units you knew will be marked as done. Their phrases join your spaced reviews so they come back now and then, and their unit tests open – you can earn certificates.',
          )}
        </p>
      )}

      <Bottom>
        <button type="button" onClick={() => apply(true)} className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-md active:scale-[0.98]" data-testid="placement-apply">
          {start ? tr(`להתחיל ביחידה ${start.order}`, `Start unit ${start.order}`) : tr('למפה', 'To the map')}
        </button>
        {known.length > 0 && (
          <button type="button" onClick={() => apply(false)} className="min-h-12 w-full rounded-2xl font-semibold text-slate-600 hover:bg-white" data-testid="placement-decline">
            {tr('בעצם, להתחיל מההתחלה', 'Actually, start from the beginning')}
          </button>
        )}
      </Bottom>
    </Screen>
  );
}

function Screen({ label, children, testId }: { label: string; children: ReactNode; testId: string }) {
  return (
    <div className="pt-safe fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-50" role="dialog" aria-modal="true" aria-label={label} data-testid={testId}>
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 px-4 pt-3">{children}</div>
    </div>
  );
}

function Bottom({ children }: { children: ReactNode }) {
  return <div className="sticky bottom-0 mt-auto -mx-4 space-y-2 bg-linear-to-t from-slate-50 from-65% to-transparent px-4 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>;
}
