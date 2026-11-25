import { useState, type ReactNode } from 'react';
import {
  BellRing,
  BookOpen,
  Brain,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Ear,
  Flame,
  Mic,
  PenLine,
  Snowflake,
  Sparkles,
  TreePalm,
  type LucideIcon,
} from 'lucide-react';
import { CAN_DO } from '../data/canDo';
import { UNITS } from '../data';
import { LESSONS, lessonsOfUnit } from '../data/lessons';
import { unitText } from '../data/types';
import { LOCALES, useLang, type Lang } from '../i18n/LangContext';
import { COURSE_INFO as C } from '../lib/course';
import { todayKey } from '../lib/date';
import { appUrl, downloadIcs, googleCalendarUrl, isTime, type Reminder } from '../lib/reminder';
import { currentVacation, MAX_FREEZES, onVacation, VACATION_LENGTHS, FREEZE_EVERY } from '../lib/streak';
import { masteryOf, SKILLS, useProgress, type Skill } from '../state/ProgressContext';

/**
 * My progress: the streak with its protection (freezes, vacation mode), a calendar of study days,
 * words and lessons, success per skill, what the learner can already do after each unit, and a daily
 * reminder through the calendar. Opened from the stats on the course map (#/<tab>/progress).
 */

const card = 'space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200';

function CardTitle({ icon: Icon, color, children }: { icon: LucideIcon; color: string; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
      <Icon className={`size-4 ${color}`} aria-hidden /> {children}
    </h3>
  );
}

const keyDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export function ProgressPage() {
  const { tr } = useLang();
  return (
    <div className="space-y-4 pt-2" data-testid="progress-page">
      <h2 className="text-xl font-black">{tr('ההתקדמות שלי', 'My progress')}</h2>
      <StreakCard />
      <CalendarCard />
      <WordsCard />
      <SkillsCard />
      <CanDoCard />
      <ReminderCard />
    </div>
  );
}

// ---------- Streak, freezes and vacation mode ----------

function StreakCard() {
  const { tr, lang } = useLang();
  const { state, activeStreak, studiedToday, cover, freezesLeft, startVacation, endVacation } = useProgress();
  const today = todayKey();
  const vacation = currentVacation(state.vacations, today);
  const onBreak = vacation && vacation.from <= today;
  const longDate = (key: string) => keyDate(key).toLocaleDateString(LOCALES[lang], { weekday: 'long', day: 'numeric', month: 'long' });

  const status = studiedToday
    ? tr('היום כבר תרגלתם – הרצף נשמר.', 'You practised today – the streak is safe.')
    : activeStreak > 0
      ? onBreak
        ? tr('אתם בחופשה – הרצף מחכה לכם.', 'You are on vacation – your streak is waiting for you.')
        : tr('תרגלו היום כדי לשמור על הרצף.', 'Practise today to keep your streak.')
      : tr('שיעור אחד היום מתחיל רצף חדש.', 'One lesson today starts a new streak.');

  return (
    <section className={card} data-testid="streak-card">
      <div className="flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-orange-50 ring-1 ring-orange-200/70">
          <Flame className={`size-7 ${activeStreak > 0 ? 'fill-orange-500/25 text-orange-600' : 'text-slate-400'}`} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-2xl leading-tight font-black text-slate-900 tabular-nums" data-testid="streak-count">
            {activeStreak} <span className="text-base font-bold text-slate-600">{tr('ימי רצף', 'day streak')}</span>
          </p>
          <p className="text-sm text-slate-500">
            {tr('שיא', 'best')} {state.streak.best}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-700" aria-live="polite">
        {status}
      </p>
      {cover.frozen.length > 0 && (
        <p className="flex items-start gap-2 rounded-xl bg-sky-50 p-2.5 text-sm text-sky-900 ring-1 ring-sky-200">
          <Snowflake className="mt-0.5 size-4 shrink-0" aria-hidden />
          {tr('הקפאת רצף שומרת על הרצף ביום שפספסתם.', 'A streak freeze covers the day you missed.')}
        </p>
      )}
      {state.freezeEarnedOn === today && (
        <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-2.5 text-sm text-emerald-900 ring-1 ring-emerald-200">
          <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
          {tr('קיבלתם היום הקפאת רצף חדשה!', 'You earned a new streak freeze today!')}
        </p>
      )}

      <div className="space-y-2 border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-slate-900" data-testid="freezes">
            {tr(`הקפאות רצף: ${freezesLeft}/${MAX_FREEZES}`, `Streak freezes: ${freezesLeft}/${MAX_FREEZES}`)}
          </p>
          <span className="flex gap-1" aria-hidden>
            {Array.from({ length: MAX_FREEZES }, (_, i) => (
              <span key={i} className={`grid size-8 place-items-center rounded-lg ring-1 ${i < freezesLeft ? 'bg-sky-100 text-sky-700 ring-sky-300' : 'bg-slate-50 text-slate-300 ring-slate-200'}`}>
                <Snowflake className="size-4" />
              </span>
            ))}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          {tr(
            `יום שמפספסים נשמר אוטומטית בעזרת הקפאה. כל ${FREEZE_EVERY} ימי רצף מזכים בהקפאה חדשה, ואפשר לשמור עד ${MAX_FREEZES}.`,
            `A missed day is covered automatically by a freeze. Every ${FREEZE_EVERY} days of streak earn a new one, and you can keep up to ${MAX_FREEZES}.`,
          )}
        </p>
      </div>

      <div className="space-y-2 border-t border-slate-200 pt-3" data-testid="vacation">
        <p className="flex items-center gap-1.5 font-bold text-slate-900">
          <TreePalm className="size-4 text-amber-600" aria-hidden /> {tr('מצב חופשה', 'Vacation mode')}
        </p>
        {onBreak ? (
          <>
            <p className="text-sm text-slate-700" data-testid="vacation-until">
              {tr(`בחופשה עד ${longDate(vacation.to)}. הרצף לא ייפגע והקפאות לא ינוצלו.`, `On vacation until ${longDate(vacation.to)}. The streak is safe and no freezes are used.`)}
            </p>
            <button type="button" onClick={endVacation} className="w-full rounded-xl bg-slate-50 py-2.5 text-sm font-bold text-slate-800 ring-1 ring-slate-200 active:scale-[0.98]">
              {tr('חזרתי – סיום החופשה', 'I’m back – end the vacation')}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {tr('נוסעים? הרצף מחכה לכם בזמן החופשה, בלי לנצל הקפאות.', 'Going away? The streak waits for you during the vacation, without using freezes.')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {VACATION_LENGTHS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => startVacation(n)}
                  className="rounded-xl bg-amber-50 py-2.5 text-sm font-bold text-amber-900 ring-1 ring-amber-200 active:scale-[0.98]"
                >
                  {n === 3 ? tr('3 ימים', '3 days') : n === 7 ? tr('שבוע', '1 week') : tr('שבועיים', '2 weeks')}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ---------- Calendar of study days ----------

type DayState = 'goal' | 'studied' | 'freeze' | 'vacation' | 'none';

const DAY_STYLE: Record<DayState, string> = {
  goal: 'bg-brand-600 text-white font-bold',
  studied: 'bg-brand-100 text-brand-800 font-semibold',
  freeze: 'bg-sky-100 text-sky-800',
  vacation: 'bg-amber-100 text-amber-900',
  none: 'text-slate-600',
};

/** First day of the week: Sunday in Israel, Monday in Europe. */
const weekStart = (lang: Lang) => (lang === 'he' ? 0 : 1);

function CalendarCard() {
  const { tr, lang } = useLang();
  const { state, cover } = useProgress();
  const [offset, setOffset] = useState(0);
  const today = todayKey();
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() - weekStart(lang) + 7) % 7;
  const frozen = new Set([...state.frozen, ...cover.frozen]);
  const studiedKeys = Object.keys(state.days);
  const earliest = studiedKeys.length ? studiedKeys.reduce((a, b) => (a < b ? a : b)) : today;
  // Back to the first month with a study day, at most a year.
  const canGoBack = offset > -12 && todayKey(first) > `${earliest.slice(0, 8)}01`;

  const stateOf = (key: string): DayState => {
    if (key in state.days) return (state.days[key] ?? 0) >= state.dailyGoal ? 'goal' : 'studied';
    if (frozen.has(key)) return 'freeze';
    if (onVacation(key, state.vacations) && key <= today) return 'vacation';
    return 'none';
  };
  const label: Record<DayState, string> = {
    goal: tr('הגעתם ליעד היומי', 'Daily goal reached'),
    studied: tr('תרגלתם', 'Practised'),
    freeze: tr('הקפאת רצף', 'Streak freeze'),
    vacation: tr('חופשה', 'Vacation'),
    none: '',
  };

  const cells = Array.from({ length: daysInMonth }, (_, i) => todayKey(new Date(first.getFullYear(), first.getMonth(), i + 1)));
  const monthStudied = cells.filter((k) => k in state.days).length;
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    // 2024-09-01 was a Sunday.
    new Date(2024, 8, 1 + ((i + weekStart(lang)) % 7)).toLocaleDateString(LOCALES[lang], { weekday: 'narrow' }),
  );
  const Prev = lang === 'he' ? ChevronRight : ChevronLeft;
  const Next = lang === 'he' ? ChevronLeft : ChevronRight;

  return (
    <section className={card} data-testid="calendar">
      <div className="flex items-center justify-between gap-2">
        <CardTitle icon={CalendarDays} color="text-brand-600">
          {first.toLocaleDateString(LOCALES[lang], { month: 'long', year: 'numeric' })}
        </CardTitle>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setOffset((o) => o - 1)}
            disabled={!canGoBack}
            className="grid size-10 place-items-center rounded-xl text-slate-600 ring-1 ring-slate-200 disabled:opacity-40"
            aria-label={tr('החודש הקודם', 'Previous month')}
          >
            <Prev className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            disabled={offset >= 0}
            className="grid size-10 place-items-center rounded-xl text-slate-600 ring-1 ring-slate-200 disabled:opacity-40"
            aria-label={tr('החודש הבא', 'Next month')}
          >
            <Next className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500" aria-hidden>
        {weekdayNames.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1 text-center text-sm">
        {Array.from({ length: lead }, (_, i) => (
          <li key={`lead-${i}`} aria-hidden />
        ))}
        {cells.map((key, i) => {
          const s = stateOf(key);
          const future = key > today;
          const name = keyDate(key).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'long' });
          return (
            <li
              key={key}
              data-testid="cal-day"
              data-day={key}
              data-state={s}
              aria-label={label[s] ? `${name}: ${label[s]}` : name}
              title={label[s] || undefined}
              className={`relative grid aspect-square place-items-center rounded-lg tabular-nums ${DAY_STYLE[s]} ${future ? 'opacity-40' : ''} ${key === today ? 'ring-2 ring-brand-500' : ''}`}
            >
              {s === 'freeze' ? <Snowflake className="size-4" aria-hidden /> : s === 'vacation' ? <TreePalm className="size-4" aria-hidden /> : i + 1}
            </li>
          );
        })}
      </ol>

      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
        {(['goal', 'studied', 'freeze', 'vacation'] as const).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className={`inline-block size-3 rounded ${DAY_STYLE[s]}`} aria-hidden /> {label[s]}
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-700" data-testid="calendar-summary">
        {tr(`ימי תרגול בחודש הזה: ${monthStudied}`, `Days practised this month: ${monthStudied}`)} ·{' '}
        {tr(`בסך הכול: ${studiedKeys.length}`, `In total: ${studiedKeys.length}`)}
      </p>
    </section>
  );
}

// ---------- Words and lessons ----------

function Tile({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="text-xl leading-tight font-bold text-slate-900 tabular-nums" dir="ltr">
        {value}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function WordsCard() {
  const { tr } = useLang();
  const { state, dueItemIds } = useProgress();
  const items = UNITS.flatMap((u) => u.items);
  const learned = items.filter((i) => state.items[i.id]?.learned).length;
  const strong = items.filter((i) => masteryOf(state.items[i.id]) >= 4).length;
  const lessons = LESSONS.filter((l) => state.lessons[l.id]).length;
  return (
    <section className={card} data-testid="words-card">
      <CardTitle icon={BookOpen} color="text-emerald-600">
        {tr('מילים ושיעורים', 'Words & lessons')}
      </CardTitle>
      <div className="grid grid-cols-2 gap-2">
        <Tile value={`${learned}/${items.length}`} label={tr('ביטויים שנלמדו', 'phrases learned')} />
        <Tile value={strong} label={tr('ידועים היטב', 'known well')} />
        <Tile value={dueItemIds().length} label={tr('לחזרה היום', 'due for review today')} />
        <Tile value={`${lessons}/${LESSONS.length}`} label={tr('שיעורים שהושלמו', 'lessons completed')} />
      </div>
    </section>
  );
}

// ---------- Success per skill ----------

const SKILL_ICON: Record<Skill, LucideIcon> = { listen: Ear, read: BookOpen, write: PenLine, speak: Mic, recall: Brain };
/** Fewer answers than this are too few to call a skill the weakest. */
const MIN_TRIES = 10;

function SkillsCard() {
  const { tr } = useLang();
  const { state } = useProgress();
  const name: Record<Skill, string> = {
    listen: tr('שמיעה', 'Listening'),
    read: tr('קריאה', 'Reading'),
    write: tr('כתיבה', 'Writing'),
    speak: tr('דיבור', 'Speaking'),
    recall: tr('זיכרון (חזרות)', 'Recall (reviews)'),
  };
  const pct = (k: Skill) => {
    const s = state.skills[k];
    return s && s.tries ? Math.round((s.ok / s.tries) * 100) : null;
  };
  const rated = SKILLS.filter((k) => (state.skills[k]?.tries ?? 0) >= MIN_TRIES);
  const weakest = rated.length >= 2 ? rated.reduce((a, b) => ((pct(b) ?? 100) < (pct(a) ?? 100) ? b : a)) : null;

  return (
    <section className={card} data-testid="skills-card">
      <CardTitle icon={Sparkles} color="text-violet-600">
        {tr('הצלחה לפי מיומנות', 'Success by skill')}
      </CardTitle>
      <ul className="space-y-3">
        {SKILLS.map((k) => {
          const Icon = SKILL_ICON[k];
          const p = pct(k);
          const tries = state.skills[k]?.tries ?? 0;
          const bar = p === null ? '' : p >= 80 ? 'bg-emerald-500' : p >= 60 ? 'bg-amber-500' : 'bg-rose-500';
          return (
            <li key={k} data-testid={`skill-${k}`}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Icon className="size-4 text-slate-500" aria-hidden /> {name[k]}
                </span>
                <span className="text-slate-600 tabular-nums">
                  {p === null ? tr('עוד אין תשובות', 'No answers yet') : `${p}% · ${tr(`תשובות: ${tries}`, `Answers: ${tries}`)}`}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/70" aria-hidden>
                {p !== null && <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(p, 3)}%` }} />}
              </div>
            </li>
          );
        })}
      </ul>
      {weakest && (pct(weakest) ?? 100) < 90 && (
        <p className="rounded-xl bg-violet-50 p-2.5 text-sm text-violet-900 ring-1 ring-violet-200" data-testid="weakest-skill">
          {tr(`כדאי לחזק: ${name[weakest]}`, `Worth strengthening: ${name[weakest]}`)}
        </p>
      )}
    </section>
  );
}

// ---------- What you can already do ----------

function CanDoCard() {
  const { tr, lang, loc } = useLang();
  const { state } = useProgress();
  const done = (id: Parameters<typeof lessonsOfUnit>[0]) => lessonsOfUnit(id).every((l) => state.lessons[l.id]);
  const completed = UNITS.filter((u) => done(u.id)).length;
  return (
    <section className={card} data-testid="can-do">
      <div className="flex items-baseline justify-between gap-2">
        <CardTitle icon={CheckCircle2} color="text-emerald-600">
          {tr('מה כבר אפשר לעשות', 'What you can already do')}
        </CardTitle>
        <span className="text-sm text-slate-500 tabular-nums">{tr(`יחידות שהושלמו: ${completed}/${UNITS.length}`, `Units completed: ${completed}/${UNITS.length}`)}</span>
      </div>
      <p className="text-sm text-slate-600">
        {tr('כל יחידה שמסיימים פותחת מצבים אמיתיים שכבר תסתדרו בהם.', 'Every unit you finish opens real situations you can already handle.')}
      </p>
      <ol className="space-y-3">
        {UNITS.map((u) => {
          const lessons = lessonsOfUnit(u.id);
          const n = lessons.filter((l) => state.lessons[l.id]).length;
          const isDone = n === lessons.length;
          return (
            <li key={u.id} data-testid={`can-do-${u.id}`} data-done={isDone}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold text-slate-900">{unitText(u, lang).title}</p>
                {isDone ? (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">{tr('הושלמה', 'Completed')}</span>
                ) : (
                  <span className="shrink-0 text-xs text-slate-500 tabular-nums">{tr(`שיעורים: ${n}/${lessons.length}`, `Lessons: ${n}/${lessons.length}`)}</span>
                )}
              </div>
              <ul className="mt-1 space-y-1">
                {(CAN_DO[u.id] ?? []).map((line, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${isDone ? 'text-slate-800' : 'text-slate-500'}`}>
                    {isDone ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden /> : <Circle className="mt-0.5 size-4 shrink-0 text-slate-300" aria-hidden />}
                    <span>{loc(line)}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ---------- Daily reminder ----------

const TIME_KEY = 'polish-learn:reminder-time';

function loadTime(): string {
  try {
    const v = localStorage.getItem(TIME_KEY);
    return v && isTime(v) ? v : '19:00';
  } catch {
    return '19:00';
  }
}

/** A daily repeating event in the learner's own calendar (lib/reminder) – shared with Settings. */
export function ReminderCard() {
  const { tr } = useLang();
  const [time, setTime] = useState(loadTime);
  const [added, setAdded] = useState(false);
  const reminder: Reminder = {
    time,
    title: tr(`תרגול ${C.name.he} – 5 דקות`, `${C.name.en} practice – 5 minutes`),
    details: tr('פתחו את האפליקציה ועשו שיעור קצר.', 'Open the app and do a short lesson.'),
    url: appUrl(),
  };
  const change = (v: string) => {
    if (!isTime(v)) return;
    setTime(v);
    setAdded(false);
    try {
      localStorage.setItem(TIME_KEY, v);
    } catch {
      // The time is then only kept until the page closes.
    }
  };
  const btn = 'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ring-1 active:scale-[0.98]';

  return (
    <section className={card} data-testid="reminder">
      <CardTitle icon={BellRing} color="text-rose-600">
        {tr('תזכורת יומית', 'Daily reminder')}
      </CardTitle>
      <p className="text-sm text-slate-600">
        {tr(
          'האתר לא יכול לשלוח התראות בלי שרת, אז היומן שלכם יזכיר: אירוע קצר כל יום, עם קישור ישר לאפליקציה.',
          'The site cannot send notifications without a server, so your calendar reminds you instead: a short event every day, with a link straight to the app.',
        )}
      </p>
      <label className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
        {tr('שעת התזכורת', 'Reminder time')}
        <input
          type="time"
          value={time}
          onChange={(e) => change(e.target.value)}
          className="min-h-11 rounded-xl bg-slate-50 px-3 text-base ring-1 ring-slate-200"
          dir="ltr"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={googleCalendarUrl(reminder)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setAdded(true)}
          className={`${btn} bg-white text-slate-800 ring-slate-200`}
          data-testid="reminder-google"
        >
          <CalendarPlus className="size-4 text-brand-600" aria-hidden /> {tr('יומן Google', 'Google Calendar')}
        </a>
        <button
          type="button"
          onClick={() => {
            downloadIcs(reminder, `${C.name.en.toLowerCase()}-reminder.ics`);
            setAdded(true);
          }}
          className={`${btn} bg-white text-slate-800 ring-slate-200`}
          data-testid="reminder-ics"
        >
          <CalendarDays className="size-4 text-brand-600" aria-hidden /> {tr('קובץ ליומן', 'Calendar file')}
        </button>
      </div>
      <p className="text-xs text-slate-500">{tr('קובץ ליומן: ל-iPhone, ל-Outlook ולרוב היומנים האחרים.', 'Calendar file: for iPhone, Outlook and most other calendars.')}</p>
      {added && (
        <p className="rounded-xl bg-emerald-50 p-2.5 text-sm text-emerald-900 ring-1 ring-emerald-200" aria-live="polite">
          {tr(`בחרו "הוספה" ביומן, והתזכורת תגיע כל יום ב-${time}.`, `Choose "Add" in your calendar, and the reminder comes every day at ${time}.`)}
        </p>
      )}
    </section>
  );
}
