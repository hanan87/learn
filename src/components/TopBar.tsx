import { Moon, Settings, Sun } from 'lucide-react';
import { COURSE_INFO as C } from '../lib/course';
import { useLang } from '../i18n/LangContext';
import { useTheme } from '../i18n/ThemeContext';
import { StandaloneDownload } from './StandaloneDownload';

/** HE | EN segmented switch for the interface + learning language. */
export function LangSwitch() {
  const { lang, setLang, tr } = useLang();
  // English is taught in Hebrew only: nothing to switch.
  if (C.uiLangs.length < 2) return null;
  return (
    <div className="flex shrink-0 rounded-xl bg-slate-100 p-0.5 text-xs font-bold ring-1 ring-slate-200/80" dir="ltr" role="group" aria-label={tr('שפת ממשק', 'Interface language')}>
      {(['he', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-[0.625rem] px-2.5 py-1.5 transition ${lang === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Flag mark of the active course. */
export function CourseMark({ className = 'h-5 w-7' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block shrink-0 rounded-[5px] ring-1 ring-black/10 ${className}`}
      style={{ background: C.flag }}
    />
  );
}

const iconBtn = 'grid size-10 shrink-0 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200/80 transition hover:text-slate-900 hover:ring-slate-300';

/** Sticky header: course mark and title, language switch, theme, download and settings. */
export function TopBar({ title, onOpenSettings }: { title: string; onOpenSettings: () => void }) {
  const { tr, lang } = useLang();
  const theme = useTheme();

  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5 sm:gap-2.5">
        <CourseMark />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[15px] font-bold text-slate-900">{lang === 'he' ? C.titleHe : C.titleEn}</p>
          <h1 className="truncate text-xs font-medium text-slate-500">{title}</h1>
        </div>
        <LangSwitch />
        <button
          type="button"
          onClick={theme.toggle}
          className={iconBtn}
          aria-label={theme.resolved === 'dark' ? tr('מצב בהיר', 'Light mode') : tr('מצב כהה', 'Dark mode')}
        >
          {theme.resolved === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>
        {/* On narrow phones the download shortcut lives in Settings only. */}
        <span className="hidden sm:contents">
          <StandaloneDownload variant="icon" />
        </span>
        <button type="button" onClick={onOpenSettings} className={iconBtn} aria-label={tr('הגדרות', 'Settings')}>
          <Settings className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}
