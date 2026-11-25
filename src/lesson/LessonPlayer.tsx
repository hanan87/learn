import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { getUnit, UNITS } from '../data';
import { getLesson } from '../data/lessons';
import { StandaloneDownload } from '../components/StandaloneDownload';
import { useLang } from '../i18n/LangContext';
import { stopSpeaking } from '../lib/tts';
import { useMic } from '../state/MicContext';
import { XP, useProgress } from '../state/ProgressContext';
import { LessonComplete, type LessonStart } from './LessonComplete';
import { STAGE_LABELS, buildLesson, buildReinforcementLesson, buildUnitTest, type LessonStep } from './buildLesson';
import { TestIntro, TestResult } from './UnitTestScreens';
import { LearnStep } from './steps/LearnStep';
import { HearWordStep, LetterLearnStep, LetterSoundStep, ReadWordStep } from './steps/LetterSteps';
import { ListenMeaningStep, ListenPairStep, ListenPictureStep } from './steps/ListenSteps';
import { AssembleStep, ChooseSpellingStep, FillBlankStep } from './steps/ReadingSteps';
import { RecallStep } from './steps/RecallStep';
import { WritingStep } from './steps/WritingStep';
import type { StepResult } from './types';
import { haptic } from '../lib/haptics';

export const PRACTICE_LESSON_ID = 'practice';

interface Props {
  /** A course lesson id (e.g. "u1-L1"), "practice" for the personalized reinforcement lesson, or "test-<unitId>" for a unit test. */
  lessonId: string;
  onClose: () => void;
  /** Opens a unit's test (offered at the end of a unit's last lesson). */
  onOpenTest?: (unitId: string) => void;
}

/** Full-screen lesson runner with a top progress bar and a feedback footer. */
export function LessonPlayer({ lessonId, onClose, onOpenTest }: Props) {
  const isPractice = lessonId === PRACTICE_LESSON_ID;
  const testUnit = lessonId.startsWith('test-') ? UNITS.find((u) => `test-${u.id}` === lessonId) : undefined;
  const isTest = lessonId.startsWith('test-');
  const lesson = isPractice || isTest ? undefined : getLesson(lessonId);
  const progress = useProgress();
  const { tr, loc } = useLang();
  const mic = useMic();
  // Steps are built once when the lesson opens, so new results do not reshuffle a running lesson.
  const build = () => (isPractice ? buildReinforcementLesson(progress.state) : testUnit ? buildUnitTest(testUnit.id) : lesson ? buildLesson(lesson) : []);
  const [queue, setQueue] = useState<LessonStep[]>(build);
  // A unit test opens on its intro screen; its score is kept for the result screen.
  const [started, setStarted] = useState(!isTest);
  const [testScore, setTestScore] = useState(0);
  const [baseLength] = useState(queue.length || 1);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<StepResult | null>(null);
  const [graded, setGraded] = useState<Record<string, boolean>>({});
  const [requeued, setRequeued] = useState<Set<string>>(new Set());
  const [confirmExit, setConfirmExit] = useState(false);
  const [done, setDone] = useState(false);
  const snapshot = (): LessonStart => ({ xp: progress.state.xp, todayXp: progress.todayXp, studiedToday: progress.studiedToday, level: progress.level });
  const start = useRef<LessonStart>(snapshot());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      stopSpeaking();
    };
  }, []);

  const step = queue[index];

  const accuracyOf = (g: Record<string, boolean>) => {
    const values = Object.values(g);
    return values.length ? Math.round((values.filter(Boolean).length / values.length) * 100) : 100;
  };

  const finish = () => {
    if (testUnit) {
      // A test scores graded answers only; skipped speaking questions do not count.
      const values = Object.values(graded);
      const score = values.length ? Math.round((values.filter(Boolean).length / values.length) * 100) : 0;
      setTestScore(score);
      progress.completeTest(testUnit.id, score);
    } else if (lesson) {
      lesson.itemIds.forEach((id) => progress.markLearned(id));
      progress.completeLesson(lesson.id, accuracyOf(graded));
    } else {
      progress.award(XP.lessonComplete);
    }
    setDone(true);
  };

  const next = () => {
    stopSpeaking();
    setResult(null);
    if (index + 1 >= queue.length) finish();
    else {
      setIndex((i) => i + 1);
      scrollRef.current?.scrollTo({ top: 0 });
    }
  };

  const advanceRef = useRef(next);
  advanceRef.current = next;

  const onAnswered = useCallback(
    (r: StepResult) => {
      if (!step) return;
      // Learn cards are ungraded: their own button already means "continue".
      if (step.kind === 'learn' || step.kind === 'letter-learn') {
        advanceRef.current();
        return;
      }
      setResult(r);
      if (r.correct !== null) haptic(r.correct ? 'success' : 'error');
      const isRetry = step.key.endsWith('-retry');
      // Accuracy counts first attempts only.
      if (r.correct !== null && !isRetry && !(step.key in graded)) {
        setGraded((g) => ({ ...g, [step.key]: r.correct as boolean }));
      }
      // A wrong answer comes back exactly once at the end of the lesson (never in a test).
      if (r.correct === false && !isTest && !isRetry && !requeued.has(step.key)) {
        setRequeued((s) => new Set(s).add(step.key));
        setQueue((q) => [...q, { ...step, key: step.key + '-retry' } as LessonStep]);
      }
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }));
    },
    [step, graded, requeued, isTest],
  );

  if ((!lesson && !isPractice && !testUnit) || queue.length === 0) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white p-6 text-center">
        <div className="space-y-3">
          <p>{isPractice ? tr('אין עדיין מספיק נתונים לאימון חיזוק.', 'Not enough history yet for a reinforcement session.') : tr('השיעור לא נמצא.', 'Lesson not found.')}</p>
          <button type="button" onClick={onClose} className="rounded-xl bg-brand-600 px-4 py-2 text-white">
            {tr('חזרה', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  const subtitle = testUnit
    ? `${tr('יחידה', 'Unit')} ${testUnit.order} · ${tr('מבחן סוף יחידה', 'Unit test')}`
    : lesson
      ? `${tr('יחידה', 'Unit')} ${getUnit(lesson.unitId).order} · ${tr('שיעור', 'Lesson')} ${lesson.number}`
      : tr('אימון חיזוק מותאם אישית', 'Personalized reinforcement');
  const pct = done ? 100 : Math.min(100, (index / Math.max(queue.length, baseLength)) * 100);

  const restartTest = () => {
    start.current = snapshot();
    setQueue(build());
    setIndex(0);
    setResult(null);
    setGraded({});
    setDone(false);
    setStarted(true);
  };

  if (testUnit && !started) {
    return <TestIntro unit={testUnit} steps={queue} onStart={() => setStarted(true)} onClose={onClose} />;
  }

  if (done && testUnit) {
    const values = Object.values(graded);
    return (
      <TestResult
        unit={testUnit}
        score={testScore}
        correct={values.filter(Boolean).length}
        total={values.length}
        earned={progress.state.xp - start.current.xp}
        missed={queue.filter((s) => graded[s.key] === false)}
        onRetry={restartTest}
        onClose={onClose}
      />
    );
  }

  if (done) {
    return (
      <LessonComplete
        lesson={lesson}
        subtitle={subtitle}
        accuracy={accuracyOf(graded)}
        start={start.current}
        onClose={onClose}
        onOpenTest={lesson && onOpenTest ? () => onOpenTest(lesson.unitId) : undefined}
      />
    );
  }

  const footerTone = result
    ? { success: 'bg-emerald-100 text-emerald-900', warning: 'bg-amber-100 text-amber-900', error: 'bg-rose-100 text-rose-900', neutral: 'bg-slate-100 text-slate-900' }[result.tone]
    : '';
  const FooterIcon = result ? { success: CheckCircle2, warning: AlertTriangle, error: XCircle, neutral: Info }[result.tone] : Info;

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-slate-50" role="dialog" aria-modal="true" aria-label={subtitle}>
      {mic.blocked && mic.status !== 'no-device' && <StandaloneDownload />}
      <header className="pt-safe border-b border-slate-200/70 bg-slate-50/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200/80 hover:text-slate-900"
            aria-label={tr('יציאה מהשיעור', 'Exit lesson')}
          >
            <X className="size-5" />
          </button>
          {testUnit ? (
            <div className="grid flex-1 gap-[3px]" style={{ gridTemplateColumns: `repeat(${queue.length}, minmax(0, 1fr))` }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} data-testid="test-progress">
              {queue.map((s) => (
                <span key={s.key} className={`h-2 rounded-full ${graded[s.key] === true ? 'bg-emerald-500' : graded[s.key] === false ? 'bg-rose-500' : s.key === step?.key && result ? 'bg-slate-400' : 'bg-slate-200'}`} />
              ))}
            </div>
          ) : (
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          )}
          <span className="text-xs font-semibold whitespace-nowrap text-slate-500 tabular-nums">
            {index + 1}/{queue.length}
          </span>
        </div>
        {step && (
          <p className="mx-auto max-w-2xl px-4 pb-2 text-xs font-bold tracking-wide text-brand-700">
            {isPractice && <span className="text-indigo-600">{tr('אימון חיזוק · ', 'Reinforcement · ')}</span>}
            {testUnit && <span>{`${tr('מבחן יחידה', 'Unit test')} ${testUnit.order} · `}</span>}
            {loc(STAGE_LABELS[step.kind])}
            {step.key.endsWith('-retry') && tr(' · חזרה על טעות', ' · retry')}
          </p>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div key={step?.key} className="animate-pop-in mx-auto max-w-2xl px-4 pt-4 pb-40">
          {step && renderStep(step, !!result, onAnswered)}
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
            <button
              type="button"
              onClick={next}
              autoFocus
              className={`w-full rounded-2xl py-4 text-base font-bold text-white shadow-md active:scale-[0.98] ${
                result.tone === 'error' ? 'bg-rose-600' : result.tone === 'warning' ? 'bg-amber-600' : 'bg-brand-600'
              }`}
            >
              {index + 1 >= queue.length
                ? testUnit
                  ? tr('לתוצאה', 'See your result')
                  : tr(`סיום (+${XP.lessonComplete} XP)`, `Finish (+${XP.lessonComplete} XP)`)
                : tr('המשך', 'Continue')}
            </button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/45 p-6">
          <div className="animate-pop-in w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 text-center shadow-xl">
            <p className="text-lg font-bold">{testUnit ? tr('לצאת מהמבחן?', 'Leave the test?') : tr('לצאת מהשיעור?', 'Leave the lesson?')}</p>
            <p className="text-sm text-slate-600">
              {testUnit ? tr('התשובות במבחן הזה לא יישמרו.', 'Your answers in this test will not be saved.') : tr('ההתקדמות בשיעור הנוכחי לא תישמר.', 'Progress in this lesson will not be saved.')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirmExit(false)} className="rounded-2xl bg-brand-600 py-3 font-bold text-white">
                {tr('להמשיך ללמוד', 'Keep learning')}
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

export function renderStep(step: LessonStep, answered: boolean, onAnswered: (r: StepResult) => void) {
  switch (step.kind) {
    case 'learn':
      return <LearnStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'listen-meaning':
      return <ListenMeaningStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'listen-pair':
      return <ListenPairStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'listen-picture':
      return <ListenPictureStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'assemble':
      return <AssembleStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'fill-blank':
      return <FillBlankStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'choose-spelling':
      return <ChooseSpellingStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'write':
      return <WritingStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'recall':
      return <RecallStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'letter-learn':
      return <LetterLearnStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'letter-sound':
      return <LetterSoundStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'read-word':
      return <ReadWordStep step={step} answered={answered} onAnswered={onAnswered} />;
    case 'hear-word':
      return <HearWordStep step={step} answered={answered} onAnswered={onAnswered} />;
  }
}
