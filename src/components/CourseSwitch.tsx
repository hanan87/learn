import { Check } from 'lucide-react';
import { COURSE, COURSE_ORDER, COURSES, setCourse, type CourseId } from '../lib/course';

/**
 * Choice of the language to learn. "cards" for the welcome screen and Settings, "pills" for the map.
 * Without onChange the switch takes effect at once (the page reloads into the chosen course).
 * Only courses taught in the interface language are offered (English is for Hebrew speakers).
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
  const ORDER = COURSE_ORDER.filter((id) => COURSES[id].uiLangs.includes(lang) || id === value);

  if (variant === 'pills') {
    return (
      <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold ring-1 ring-slate-200/80" dir="ltr" role="group" aria-label={lang === 'he' ? 'שפת לימוד' : 'Course language'}>
        {ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => id !== value && pick(id)}
            aria-pressed={id === value}
            data-testid={`course-pill-${id}`}
            className={`flex items-center gap-1.5 rounded-[0.625rem] px-2.5 py-1.5 transition ${id === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <span className="h-2.5 w-3.5 shrink-0 rounded-[3px] ring-1 ring-black/10" style={{ background: COURSES[id].flag }} aria-hidden />
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
            className={`flex items-center gap-3 rounded-2xl p-3.5 text-start text-slate-900 transition ${on ? 'bg-brand-50 ring-2 ring-brand-600' : 'bg-white ring-1 ring-slate-200 hover:ring-slate-400'}`}
          >
            <span className="h-6 w-8 shrink-0 rounded-md ring-1 ring-black/10" style={{ background: COURSES[id].flag }} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="polish block text-lg leading-tight font-semibold" dir="ltr" lang={c.htmlLang}>
                {c.name.native}
              </span>
              <span className="block text-xs text-slate-500">{lang === 'he' ? c.name.he : c.name.en}</span>
            </span>
            {on && (
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
