import { COURSE_INFO as C } from '../lib/course';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isLang, localize, type Lang, type Loc } from './lang';

export { LANGS, LOCALES, isLang, localize, type Bi, type Lang, type LatinLang, type Loc } from './lang';

const STORAGE_KEY = 'polish-learn:lang';

interface LangApi {
  lang: Lang;
  /** True until the learner picked a language on the welcome screen. */
  unset: boolean;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Lang) => void;
  /**
   * Inline localized string: tr('שלום', 'Hello'), translated into Polish / Montenegrin by the
   * string table, or tr({ he, en, pl, cnr }) with all languages at the call site.
   */
  tr: {
    (he: string, en: string): string;
    (all: Loc<string>): string;
  };
  /** Pick a localized value; Polish and Montenegrin take the English one (strings go through the table). */
  pick: <T>(he: T, en: T) => T;
  /** Value of a per-language object for the active language. */
  loc: <T>(v: Loc<T>) => T;
}

const LangContext = createContext<LangApi | null>(null);

function readStored(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

/** Interface language suggested by the browser (Montenegrin also for Serbian, Bosnian and Croatian). */
function browserLang(): Lang {
  const nav = (navigator.language ?? '').toLowerCase();
  if (nav.startsWith('he') || nav.startsWith('iw')) return 'he';
  if (nav.startsWith('pl')) return 'pl';
  if (/^(cnr|sr|bs|hr)/.test(nav)) return 'cnr';
  return 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Lang | null>(readStored);
  const preferred: Lang = stored ?? browserLang();
  // Each course is taught in its own set of languages (English: Hebrew, Polish and Montenegrin speakers).
  const lang: Lang = C.uiLangs.includes(preferred) ? preferred : C.uiLangs[0];

  useEffect(() => {
    document.documentElement.lang = lang === 'cnr' ? 'sr-Latn-ME' : lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.title = localize(C.titles, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // Storage disabled: the choice lasts for this session only.
    }
    setStored(l);
  }, []);

  const api = useMemo<LangApi>(() => {
    const tr = ((a: string | Loc<string>, b?: string) => (typeof a === 'string' ? localize({ he: a, en: b ?? a }, lang) : localize(a, lang))) as LangApi['tr'];
    return {
      lang,
      unset: stored === null,
      dir: lang === 'he' ? 'rtl' : 'ltr',
      setLang,
      tr,
      pick: <T,>(he: T, en: T) => localize({ he, en }, lang),
      loc: <T,>(v: Loc<T>) => localize(v, lang),
    };
  }, [lang, stored, setLang]);

  return <LangContext.Provider value={api}>{children}</LangContext.Provider>;
}

export function useLang(): LangApi {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
