import { useState } from 'react';
import logoUrl from '../assets/logo.svg';
import { CourseSwitch } from '../components/CourseSwitch';
import { ProfileFields } from '../components/ProfileFields';
import { localize, useLang, type Lang } from '../i18n/LangContext';
import { COURSE, COURSE_ORDER, COURSES, setCourse, type CourseId } from '../lib/course';
import { useProgress } from '../state/ProgressContext';

/**
 * First-run screen.
 * Step 1: choose the interface and learning language: Hebrew, English, Polish or Montenegrin.
 * Step 2: the language to learn (Polish or Montenegrin for Hebrew / English speakers, English for
 *         Hebrew, Polish and Montenegrin speakers), then speaker gender and (optional) first name, so
 *         gendered phrases match the learner.
 * Everything is saved only at the end, because saving the language closes the welcome screen; a
 * course other than the loaded one reloads the page into it (the profile carries over).
 */
export function Welcome() {
  const { setLang } = useLang();
  const { state, setProfile } = useProgress();
  const [chosen, setChosen] = useState<Lang | null>(null);
  const [course, setCourseChoice] = useState<CourseId>(COURSE);

  const options: { lang: Lang; title: string; sub: string; word: [string, string, string]; sample: string; dir: 'rtl' | 'ltr' }[] = [
    { lang: 'he', title: 'לדוברי עברית', sub: 'פולנית, מונטנגרית או אנגלית – ממשק, תרגומים, תעתיק מנוקד וטיפים בעברית', word: ['Dzię', 'ku', 'ję'], sample: 'גֶ׳נְ·[קוּ]·יֶה', dir: 'rtl' },
    { lang: 'en', title: 'For English speakers', sub: 'English interface, translations, respelling and tips', word: ['Dzię', 'ku', 'ję'], sample: 'jen·KOO·yeh', dir: 'ltr' },
    { lang: 'pl', title: 'Dla mówiących po polsku', sub: 'Angielski na co dzień – interfejs, tłumaczenia, zapis wymowy i wskazówki po polsku', word: ['', 'Thank', ' you'], sample: 'THÆNK ju', dir: 'ltr' },
    { lang: 'cnr', title: 'Za govornike crnogorskog', sub: 'Engleski za svaki dan – interfejs, prevodi, zapis izgovora i savjeti na crnogorskom', word: ['', 'Thank', ' you'], sample: 'THÆNK ju', dir: 'ltr' },
  ];

  /** Polish and Montenegrin speakers learn English: a course not taught in the chosen language is swapped for one that is. */
  const choose = (l: Lang) => {
    setChosen(l);
    if (!COURSES[course].uiLangs.includes(l)) setCourseChoice(COURSE_ORDER.find((id) => COURSES[id].uiLangs.includes(l)) ?? course);
  };

  const start = (l: Lang) => {
    setCourse(course, false);
    setLang(l);
    if (course !== COURSE) location.reload();
  };

  if (chosen) {
    const t = (he: string, en: string) => localize({ he, en }, chosen);
    return (
      <div dir={chosen === 'he' ? 'rtl' : 'ltr'} className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-slate-50 px-6 py-10">
        <img src={logoUrl} alt="" className="size-16 rounded-2xl shadow" />
        <div className="text-center">
          <p className="font-serif text-3xl font-semibold text-slate-900">{t('נעים להכיר!', 'Nice to meet you!')}</p>
          <p className="polish text-slate-500" dir="ltr">
            {COURSES[course].niceToMeet}
          </p>
        </div>
        <div className="w-full max-w-md space-y-2">
          <p className="text-sm font-bold text-slate-800">{t('מה תרצו ללמוד?', 'What would you like to learn?')}</p>
          <CourseSwitch lang={chosen} value={course} onChange={setCourseChoice} />
        </div>
        <div className="w-full max-w-md rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <ProfileFields lang={chosen} profile={state.profile} onChange={setProfile} course={COURSES[course]} />
        </div>
        <div className="grid w-full max-w-md gap-2">
          <button
            type="button"
            onClick={() => start(chosen)}
            className="btn-primary py-4 text-base"
          >
            {t('בואו נתחיל', "Let's start")}
          </button>
          <button type="button" onClick={() => setChosen(null)} className="text-sm text-slate-500 underline">
            {t('חזרה לבחירת שפה', 'Back to language choice')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-slate-50 px-6 py-10 text-center">
      <img src={logoUrl} alt="" className="size-24 rounded-3xl shadow-lg" />
      <div>
        <p className="polish font-serif text-4xl leading-tight font-semibold tracking-tight text-slate-900" dir="ltr">
          Polski<span className="text-slate-300"> · </span>Crnogorski<span className="text-slate-300"> · </span>English
        </p>
        <p className="mt-1 text-slate-500">פולנית, מונטנגרית ואנגלית מדוברת · Polish and Montenegrin from zero</p>
      </div>
      <div className="grid w-full max-w-md gap-3">
        {options.map((o) => (
          <button
            key={o.lang}
            type="button"
            dir={o.dir}
            onClick={() => choose(o.lang)}
            data-testid={`welcome-${o.lang}`}
            className="rounded-2xl bg-white p-5 text-start ring-1 ring-slate-200 transition hover:ring-slate-900 active:scale-[0.99]"
          >
            <span className="block font-serif text-2xl font-semibold text-slate-900">{o.title}</span>
            <span className="mt-1 block text-sm text-slate-500">{o.sub}</span>
            <span className="mt-3 flex items-center gap-2 text-sm">
              <span dir="ltr" className="polish font-bold text-slate-800" lang={o.word[0] ? 'pl' : 'en'}>
                {o.word[0]}
                <span className="text-brand-700 underline decoration-4">{o.word[1]}</span>
                {o.word[2]}
              </span>
              <span className="text-slate-400">→</span>
              <span className={o.lang === 'he' ? 'phonetic text-base' : 'font-mono'}>{o.sample.replace(/[[\]]/g, '')}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
