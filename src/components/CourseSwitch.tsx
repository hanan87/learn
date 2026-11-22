import { Check } from 'lucide-react';
import { COURSE, COURSES, setCourse, type CourseId } from '../lib/course';

const ORDER: CourseId[] = ['pl', 'cnr'];

/** Flag-colour stripe for each course (Poland white/red, Montenegro red/gold). */
const STRIPE: Record<CourseId, string> = {
  pl: 'linear-gradient(180deg, #ffffff 50%, #dc143c 50%)',
  cnr: 'radial-gradient(circle, #d4af37 0 26%, #c40308 29%)',
};

/**
 * Choice of the language to learn. "cards" for the welcome screen and Settings, "pills" for the map.
 * Without onChange the switch takes effect at once (the page reloads into the chosen course).
 */
export function CourseSwitch({
  lang,
  value = COURSE,
  onChange,
  variant = 'cards',
}: {
  lang: 'he' | 'en';
  value?: CourseId;
  onChange?: (id: CourseId) => void;
  variant?: 'cards' | 'pills';
}) {
  const pick = (id: CourseId) => (onChange ? onChange(id) : setCourse(id));

  if (variant === 'pills') {
    return (
      <div className="inline-flex overflow-hidden rounded-full text-xs font-semibold ring-1 ring-slate-300" dir="ltr" role="group" aria-label={lang === 'he' ? 'שפת לימוד' : 'Course language'}>
        {ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => id !== value && pick(id)}
            aria-pressed={id === value}
            data-testid={`course-pill-${id}`}
            className={`px-3 py-1.5 transition ${id === value ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {COURSES[id].name.native}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={lang === 'he' ? 'מה תרצו ללמוד?' : 'What would you like to learn?'}>
      {ORDER.map((id) => {
        const c = COURSES[id];
        const on = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            data-testid={`course-${id}`}
            onClick={() => !on && pick(id)}
            className={`flex items-center gap-3 rounded-xl p-3 text-start ring-1 transition ${on ? 'bg-slate-900 text-slate-50 ring-slate-900' : 'bg-white text-slate-900 ring-slate-300 hover:ring-slate-500'}`}
          >
            <span className="h-7 w-5 shrink-0 rounded-sm ring-1 ring-black/10" style={{ background: STRIPE[id] }} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="polish block text-lg leading-tight font-semibold" dir="ltr" lang={c.htmlLang}>
                {c.name.native}
              </span>
              <span className={`block text-xs ${on ? 'text-slate-300' : 'text-slate-500'}`}>{lang === 'he' ? c.name.he : c.name.en}</span>
            </span>
            {on && <Check className="size-5 shrink-0" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
