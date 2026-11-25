import { CourseSwitch } from '../components/CourseSwitch';
import { COURSE_INFO as C } from '../lib/course';
import { Fragment, useState, type ReactNode } from 'react';
import {
  AudioLines,
  BookA,
  BookOpen,
  Bus,
  Plane,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChartColumn,
  Coffee,
  Compass,
  Flame,
  Headphones,
  HeartPulse,
  Lock,
  MessageCircle,
  Play,
  RotateCcw,
  ShoppingBag,
  Smile,
  Snowflake,
  Star,
  Target,
  Trophy,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ProfileFields } from '../components/ProfileFields';
import { displayName } from '../lib/personalize';
import { UNITS, getItem } from '../data';
import { LESSONS, lessonsOfUnit } from '../data/lessons';
import { itemText, unitText, type UnitColor } from '../data/types';
import { PolishSyllables } from '../components/PolishSyllables';
import { AlefBetChart } from '../components/AlefBet';
import { ALEFBET_UNIT, getLetter } from '../data/he/alphabet';
import { LOCALES, useLang } from '../i18n/LangContext';
import { useProgress } from '../state/ProgressContext';

/** Tile palette per unit color: tinted tile, icon, number, progress bar and the ring of an open tile. */
const COLOR: Record<UnitColor, { tile: string; icon: string; num: string; bar: string; open: string }> = {
  violet: { tile: 'bg-violet-50 ring-violet-200/70', icon: 'text-violet-600', num: 'text-violet-700', bar: 'bg-violet-500', open: 'ring-violet-500' },
  orange: { tile: 'bg-orange-50 ring-orange-200/70', icon: 'text-orange-600', num: 'text-orange-700', bar: 'bg-orange-500', open: 'ring-orange-500' },
  sky: { tile: 'bg-sky-50 ring-sky-200/70', icon: 'text-sky-600', num: 'text-sky-700', bar: 'bg-sky-500', open: 'ring-sky-500' },
  amber: { tile: 'bg-amber-50 ring-amber-200/70', icon: 'text-amber-600', num: 'text-amber-700', bar: 'bg-amber-500', open: 'ring-amber-500' },
  emerald: { tile: 'bg-emerald-50 ring-emerald-200/70', icon: 'text-emerald-600', num: 'text-emerald-700', bar: 'bg-emerald-500', open: 'ring-emerald-500' },
  // "rose" units use the pink scale so red stays reserved for mistakes.
  rose: { tile: 'bg-pink-50 ring-pink-200/70', icon: 'text-pink-600', num: 'text-pink-700', bar: 'bg-pink-500', open: 'ring-pink-500' },
  red: { tile: 'bg-red-50 ring-red-200/70', icon: 'text-red-600', num: 'text-red-700', bar: 'bg-red-500', open: 'ring-red-500' },
  teal: { tile: 'bg-teal-50 ring-teal-200/70', icon: 'text-teal-600', num: 'text-teal-700', bar: 'bg-teal-500', open: 'ring-teal-500' },
};

/** One icon per unit theme (both courses); unknown units fall back to a book. */
const UNIT_ICON: Record<string, LucideIcon> = {
  u1: AudioLines,
  u2: Smile,
  u3: Compass,
  u4: Coffee,
  u5: ShoppingBag,
  u6: Bus,
  u7: HeartPulse,
  u8: MessageCircle,
  m1: AudioLines,
  m2: Smile,
  m3: Compass,
  m4: Coffee,
  m5: ShoppingBag,
  m6: Bus,
  m7: HeartPulse,
  m8: MessageCircle,
  e1: AudioLines,
  e2: Smile,
  e3: Coffee,
  e4: Compass,
  e5: ShoppingBag,
  e6: Plane,
  h0: BookA,
  h1: AudioLines,
  h2: Smile,
  h3: Coffee,
  h4: ShoppingBag,
  h5: Bus,
  h6: HeartPulse,
};
const unitIcon = (id: string) => UNIT_ICON[id] ?? BookOpen;

interface Props {
  onOpenLesson: (lessonId: string) => void;
  onOpenItem: (itemId: string) => void;
  onOpenHandsFree: () => void;
  onOpenProgress: () => void;
}

/** Big entry button for the audio-only (driving / walking) trainer – shared by the map and the review tab. */
export function HandsFreeButton({ onClick, subtitle }: { onClick: () => void; subtitle: string }) {
  const { tr, lang } = useLang();
  const Chevron = lang === 'he' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-2xl bg-white p-3.5 text-start shadow-sm ring-1 ring-slate-200/80 transition hover:ring-slate-300 active:scale-[0.99]"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Headphones className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900">{tr('מצב נהיגה והליכה (שמע בלבד)', 'Driving & walking mode (audio only)')}</span>
        <span className="block text-sm text-slate-500">{subtitle}</span>
      </span>
      <Chevron className="size-5 shrink-0 text-slate-400 transition group-hover:text-slate-700" />
    </button>
  );
}

function Stat({ icon, value, label, bar, corner, onClick }: { icon: ReactNode; value: ReactNode; label: string; bar?: number; corner?: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-2xl bg-white p-3 text-start shadow-sm ring-1 ring-slate-200/80 transition hover:ring-slate-300 active:scale-[0.98]"
    >
      {corner && <span className="absolute end-2.5 top-2.5">{corner}</span>}
      {icon}
      <span className="mt-1 block text-xl leading-tight font-bold text-slate-900 tabular-nums">{value}</span>
      <span className="block text-xs text-slate-500">{label}</span>
      {bar !== undefined && (
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-slate-200/70" aria-hidden>
          <span className="block h-full rounded-full bg-brand-600 transition-all" style={{ width: `${bar}%` }} />
        </span>
      )}
    </button>
  );
}

/** A unit's icon inside a ring that fills with its completed lessons; a finished unit gets a solid badge. */
function UnitRing({ done, total, color, Icon }: { done: number; total: number; color: (typeof COLOR)[UnitColor]; Icon: LucideIcon }) {
  const r = 21;
  const len = 2 * Math.PI * r;
  const complete = done >= total;
  return (
    <span className={`relative grid size-12 shrink-0 place-items-center ${color.icon}`} aria-hidden>
      <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="3.5" className="stroke-slate-200/80" />
        {done > 0 && (
          <circle cx="24" cy="24" r={r} fill="none" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" strokeDasharray={len} strokeDashoffset={len * (1 - Math.min(1, done / total))} />
        )}
      </svg>
      <span className={`grid size-9 place-items-center rounded-full shadow-xs ${complete ? `${color.bar} text-white` : 'bg-white'}`}>
        <Icon className="size-[18px]" />
      </span>
    </span>
  );
}

export function CourseMap({ onOpenLesson, onOpenItem, onOpenHandsFree, onOpenProgress }: Props) {
  const { state, todayXp, activeStreak, level, levelProgress, setProfile, freezesLeft } = useProgress();
  const { tr, lang } = useLang();
  // Shown once to learners who have not picked a gender yet; stays open while they type their name.
  const [profileOpen, setProfileOpen] = useState(() => state.profile.gender === null);
  const [openUnit, setOpenUnit] = useState<string | null>(null);

  const goalPct = Math.min(100, (todayXp / state.dailyGoal) * 100);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? tr('בוקר טוב', 'Good morning') : hour < 18 ? tr('צהריים טובים', 'Good afternoon') : tr('ערב טוב', 'Good evening');
  const firstName = state.profile.name.trim() ? displayName(state.profile, lang) : '';

  // The first lesson not yet completed; every unit's first lesson is open, so this one is always unlocked.
  const next = LESSONS.find((l) => !state.lessons[l.id]);
  const nextUnit = next ? UNITS.find((u) => u.id === next.unitId) : undefined;
  const started = Object.keys(state.lessons).length > 0;

  const openIdx = UNITS.findIndex((u) => u.id === openUnit);
  // Two tiles per row: the open unit's lessons appear under the row that holds its tile.
  const detailAfter = openIdx < 0 ? -1 : Math.min(UNITS.length - 1, openIdx | 1);

  return (
    <div className="space-y-5">
      <section className="pt-1" data-testid="map-greeting">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString(LOCALES[lang], { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h2 className="mt-0.5 text-[1.75rem] leading-tight">
              {greeting}
              {firstName && <span className="text-brand-700">, {firstName}</span>}
            </h2>
          </div>
          <CourseSwitch lang={lang} variant="pills" />
        </div>
      </section>

      <section className="space-y-2" aria-label={tr('ההתקדמות שלי', 'My progress')} data-testid="map-stats">
        <div className="grid grid-cols-3 gap-2.5">
          <Stat
            onClick={onOpenProgress}
            icon={<Flame className={`size-[18px] ${activeStreak > 0 ? 'fill-orange-500/25 text-orange-600' : 'text-slate-400'}`} aria-hidden />}
            value={activeStreak}
            label={`${tr('ימי רצף', 'day streak')} · ${tr('שיא', 'best')} ${state.streak.best}`}
            corner={
              freezesLeft > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-bold text-sky-700" title={tr(`הקפאות רצף: ${freezesLeft}`, `Streak freezes: ${freezesLeft}`)}>
                  <Snowflake className="size-3.5" aria-hidden />
                  <span className="sr-only">{tr(`הקפאות רצף: ${freezesLeft}`, `Streak freezes: ${freezesLeft}`)}</span>
                  <span aria-hidden>{freezesLeft}</span>
                </span>
              )
            }
          />
          <Stat
            onClick={onOpenProgress}
            icon={<Target className="size-[18px] text-brand-600" aria-hidden />}
            value={
              <span dir="ltr">
                {todayXp}/{state.dailyGoal}
              </span>
            }
            label={tr('XP היום', 'XP today')}
            bar={goalPct}
          />
          <Stat
            onClick={onOpenProgress}
            icon={<Star className="size-[18px] fill-amber-400/30 text-amber-600" aria-hidden />}
            value={level}
            label={`${tr('רמה', 'level')} · ${state.xp} XP`}
            bar={levelProgress * 100}
          />
        </div>
        <button
          type="button"
          onClick={onOpenProgress}
          className="flex min-h-11 w-full items-center gap-2 rounded-xl px-1 text-start text-sm font-semibold text-brand-700 hover:text-brand-800"
          data-testid="open-progress"
        >
          <ChartColumn className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">{tr('ההתקדמות שלי: לוח שנה, מיומנויות ועוד', 'My progress: calendar, skills and more')}</span>
          {lang === 'he' ? <ChevronLeft className="size-4 shrink-0" aria-hidden /> : <ChevronRight className="size-4 shrink-0" aria-hidden />}
        </button>
      </section>

      {next && nextUnit && (
        <ContinueCard
          lessonNumber={next.number}
          lessonCount={lessonsOfUnit(nextUnit.id).length}
          doneInUnit={lessonsOfUnit(nextUnit.id).filter((l) => state.lessons[l.id]).length}
          unitTitle={unitText(nextUnit, lang).title}
          color={nextUnit.color}
          Icon={unitIcon(nextUnit.id)}
          started={started}
          onClick={() => onOpenLesson(next.id)}
        />
      )}

      {profileOpen && (
        <section className="relative space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80" data-testid="profile-prompt">
          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            className="absolute end-1.5 top-1.5 grid size-11 place-items-center rounded-xl text-slate-400 hover:bg-slate-100"
            aria-label={tr('סגור', 'Close')}
          >
            <X className="size-4" />
          </button>
          <p className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <UserRound className="size-4" />
            </span>
            {tr('חדש: משפטים מותאמים אישית', 'New: personalized phrases')}
          </p>
          <ProfileFields lang={lang} profile={state.profile} onChange={setProfile} />
          {state.profile.gender && (
            <button type="button" onClick={() => setProfileOpen(false)} className="btn-primary w-full">
              {tr('שמור', 'Save')}
            </button>
          )}
        </section>
      )}

      <HandsFreeButton
        onClick={onOpenHandsFree}
        subtitle={tr(`המשמעות, ה${C.name.he} לאט ומהר, ואז אתם חוזרים – בלי לגעת במסך.`, `Meaning, slow and normal ${C.name.en}, then you repeat – no screen taps needed.`)}
      />

      <section aria-labelledby="units-heading">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h3 id="units-heading" className="text-[17px] font-bold text-slate-900">
            {tr('יחידות הקורס', 'Course units')}
          </h3>
          <span className="text-sm text-slate-500">
            {UNITS.length} {tr('יחידות', 'units')}
          </span>
        </div>
        <ol className="grid grid-cols-2 gap-2.5">
          {UNITS.map((unit, idx) => {
            const c = COLOR[unit.color];
            const Icon = unitIcon(unit.id);
            const ut = unitText(unit, lang);
            const lessons = lessonsOfUnit(unit.id);
            const doneLessons = lessons.filter((l) => state.lessons[l.id]).length;
            const expanded = openUnit === unit.id;
            const allDone = doneLessons === lessons.length;
            const isCurrent = !allDone && nextUnit?.id === unit.id;

            return (
              <Fragment key={unit.id}>
                <li>
                  <button
                    type="button"
                    onClick={() => setOpenUnit(expanded ? null : unit.id)}
                    aria-expanded={expanded}
                    data-testid={`unit-tile-${unit.id}`}
                    data-state={allDone ? 'done' : isCurrent ? 'current' : doneLessons > 0 ? 'started' : 'new'}
                    className={`flex h-full min-h-32 w-full flex-col justify-between gap-3 rounded-2xl p-3.5 text-start ring-1 transition active:scale-[0.98] ${c.tile} ${expanded ? `ring-2 ${c.open}` : ''} ${isCurrent ? 'shadow-md' : ''}`}
                  >
                    <span className="flex w-full items-start justify-between gap-2">
                      <UnitRing done={doneLessons} total={lessons.length} color={c} Icon={Icon} />
                      {isCurrent ? (
                        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white" aria-hidden>
                          {tr('עכשיו', 'Up next')}
                        </span>
                      ) : (
                        <span className={`text-[13px] font-semibold tabular-nums ${c.num}`} aria-hidden>
                          {allDone ? <Trophy className="size-4" /> : String(unit.order).padStart(2, '0')}
                        </span>
                      )}
                    </span>
                    <span className="block w-full">
                      <span className="sr-only">
                        {tr('יחידה', 'Unit')} {unit.order}:{' '}
                      </span>
                      <span className="line-clamp-2 block text-[15px] leading-snug font-bold text-slate-900">{ut.title}</span>
                      {isCurrent && <span className="sr-only"> · {tr('עכשיו', 'Up next')}</span>}
                      <span className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-600">
                        <span className={`tabular-nums ${allDone ? `font-semibold ${c.num}` : ''}`}>
                          {doneLessons}/{lessons.length} {tr('שיעורים', 'lessons')}
                        </span>
                        <ChevronDown className={`size-4 shrink-0 text-slate-400 transition ${expanded ? 'rotate-180' : ''}`} aria-hidden />
                      </span>
                    </span>
                  </button>
                </li>

                {idx === detailAfter && openIdx >= 0 && (
                  <UnitDetail
                    key={`detail-${UNITS[openIdx].id}`}
                    unitIdx={openIdx}
                    onOpenLesson={onOpenLesson}
                    onOpenItem={onOpenItem}
                    onClose={() => setOpenUnit(null)}
                  />
                )}
              </Fragment>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function ContinueCard({
  lessonNumber,
  lessonCount,
  doneInUnit,
  unitTitle,
  color,
  Icon,
  started,
  onClick,
}: {
  lessonNumber: number;
  lessonCount: number;
  doneInUnit: number;
  unitTitle: string;
  color: UnitColor;
  Icon: LucideIcon;
  started: boolean;
  onClick: () => void;
}) {
  const { tr } = useLang();
  const c = COLOR[color];
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="continue-lesson"
      className="flex w-full items-center gap-3.5 rounded-3xl bg-white p-3.5 text-start shadow-md ring-1 ring-slate-200/80 transition hover:ring-slate-300 active:scale-[0.99]"
    >
      <span className={`grid size-15 shrink-0 place-items-center rounded-2xl ring-1 ${c.tile} ${c.icon}`}>
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-slate-500">{started ? tr('המשך מאיפה שעצרת', 'Pick up where you left off') : tr('מתחילים כאן', 'Start here')}</span>
        <span className="block truncate font-bold text-slate-900">{unitTitle}</span>
        <span className="mt-1.5 flex items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70" aria-hidden>
            <span className="block h-full rounded-full bg-brand-600" style={{ width: `${(doneInUnit / lessonCount) * 100}%` }} />
          </span>
          <span className="shrink-0 text-xs text-slate-500 tabular-nums">
            {tr(`שיעור ${lessonNumber} מתוך ${lessonCount}`, `Lesson ${lessonNumber} of ${lessonCount}`)}
          </span>
        </span>
      </span>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-sm" aria-hidden>
        <Play className="size-5 fill-current" />
      </span>
    </button>
  );
}

function UnitDetail({
  unitIdx,
  onOpenLesson,
  onOpenItem,
  onClose,
}: {
  unitIdx: number;
  onOpenLesson: (lessonId: string) => void;
  onOpenItem: (itemId: string) => void;
  onClose: () => void;
}) {
  const { state, isLearned } = useProgress();
  const { tr, lang } = useLang();
  const unit = UNITS[unitIdx];
  const c = COLOR[unit.color];
  const ut = unitText(unit, lang);
  const lessons = lessonsOfUnit(unit.id);
  const nextLesson = lessons.find((l) => !state.lessons[l.id]);

  return (
    <li className="animate-pop-in col-span-2 space-y-4 rounded-3xl bg-white p-4 shadow-md ring-1 ring-slate-200/80" data-testid="unit-detail">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-semibold ${c.num}`}>
            {tr('יחידה', 'Unit')} {unit.order}
          </p>
          <h3 className="text-lg leading-snug font-bold text-slate-900">{ut.title}</h3>
          <p className="text-sm text-slate-500">{ut.subtitle}</p>
        </div>
        <button type="button" onClick={onClose} className="-me-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label={tr('סגור', 'Close')}>
          <X className="size-4" />
        </button>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{ut.description}</p>

      <ol className="space-y-2">
        {lessons.map((lesson, idx) => {
          const done = !!state.lessons[lesson.id];
          const unlocked = idx === 0 || !!state.lessons[lessons[idx - 1].id];
          const isNext = nextLesson?.id === lesson.id;
          // Alef-Bet lessons preview their new letters; the others their first phrases.
          const preview = lesson.letters
            ? lesson.letters.map((id) => getLetter(id)?.glyph).join(' · ')
            : lesson.itemIds
                .slice(0, 3)
                .map((id) => getItem(id)?.polish)
                .filter(Boolean)
                .join(' · ');
          return (
            <li key={lesson.id} className={`flex items-center gap-3 rounded-2xl p-2.5 ring-1 ${isNext ? 'bg-brand-50 ring-brand-200' : 'bg-slate-50 ring-slate-200/70'}`}>
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onOpenLesson(lesson.id)}
                className={`grid size-11 shrink-0 place-items-center rounded-full text-white transition active:scale-95 disabled:cursor-not-allowed ${
                  done ? 'bg-emerald-500' : unlocked ? 'bg-brand-600 shadow-sm' : 'bg-slate-200 text-slate-400'
                }`}
                aria-label={`${tr('שיעור', 'Lesson')} ${lesson.number}${done ? tr(' (הושלם)', ' (completed)') : ''}`}
              >
                {done ? <Check className="size-5" strokeWidth={3} /> : unlocked ? <Play className="size-5 fill-current" /> : <Lock className="size-4" />}
              </button>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {tr('שיעור', 'Lesson')} {lesson.number}
                  {done && <span className="font-medium text-emerald-700"> · {state.lessons[lesson.id].bestAccuracy}%</span>}
                </span>
                <span className={`polish block truncate text-slate-500 ${lesson.letters ? 'text-base' : 'text-xs'}`} dir="ltr">
                  {preview}
                </span>
              </span>
              {done && (
                <button type="button" onClick={() => onOpenLesson(lesson.id)} className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs text-slate-500 hover:bg-white hover:text-slate-800">
                  <RotateCcw className="size-3.5" /> {tr('חזרה', 'Replay')}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {unit.id === ALEFBET_UNIT && <AlefBetChart />}

      <div>
        <h4 className="mb-2 text-sm font-bold text-slate-700">{tr('כל הפריטים ביחידה', 'All items in this unit')}</h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {unit.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpenItem(item.id)}
                className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-start ring-1 ring-slate-200/70 transition hover:bg-white"
              >
                <span className="min-w-0 flex-1">
                  <PolishSyllables notation={item.syllablesPolish} size="sm" showDots={false} className="truncate" />
                  <span className="block truncate text-xs text-slate-500">{itemText(item, lang).meaning}</span>
                </span>
                {isLearned(item.id) && <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-label={tr('נלמד', 'Learned')} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
