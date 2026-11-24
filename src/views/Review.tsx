import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ClipboardCopy, Download, Pencil, Send, Share2, Undo2 } from 'lucide-react';
import { localize, type Lang, type Loc } from '../i18n/lang';
import { useLang } from '../i18n/LangContext';
import { COURSES } from '../lib/course';
import { versionLabel } from '../lib/pwaUpdate';
import {
  buildReport,
  isReviewLang,
  loadReview,
  REVIEW_GROUPS,
  REVIEW_LANGS,
  reviewSections,
  reviewStats,
  saveReview,
  sectionLabel,
  type ReviewEntry,
  type ReviewGroup,
  type ReviewLang,
  type ReviewSection,
  type ReviewStore,
  type Verdict,
} from '../lib/review';
import { parseSyllables } from '../lib/syllables';

/**
 * Native-speaker review (#/review/<pl|cnr>[/<section>]): a Polish or Montenegrin speaker marks every
 * text in their language as correct or suggests a better version, then sends the notes as a message.
 * The page works without the welcome screen and without a course, and speaks the reviewer's language
 * (with English and Hebrew a tap away). See lib/review for what is listed.
 */

type T = (he: string, en: string) => string;

const UI_KEY = 'polish-learn:review-ui';

function readUi(): Lang | null {
  try {
    const v = localStorage.getItem(UI_KEY);
    return v === 'he' || v === 'en' || v === 'pl' || v === 'cnr' ? v : null;
  } catch {
    return null;
  }
}

interface Props {
  lang?: string;
  section?: string;
  navigate: (route: string, replace?: boolean) => void;
}

export function Review({ lang, section, navigate }: Props) {
  const app = useLang();
  const [ui, setUiState] = useState<Lang>(() => readUi() ?? (isReviewLang(lang) ? lang : app.unset ? 'en' : app.lang));
  const setUi = (l: Lang) => {
    setUiState(l);
    try {
      localStorage.setItem(UI_KEY, l);
    } catch {
      // Storage disabled: the choice lasts for this visit.
    }
  };
  const t: T = (he, en) => localize({ he, en }, ui);
  const exit = app.unset ? undefined : () => navigate('map', true);

  return (
    <div dir={ui === 'he' ? 'rtl' : 'ltr'} lang={ui === 'cnr' ? 'sr-Latn-ME' : ui} className="mx-auto min-h-dvh w-full max-w-3xl px-4 pt-4 pb-16">
      {isReviewLang(lang) ? (
        <ReviewPage key={lang} lang={lang} sectionId={section} ui={ui} setUi={setUi} t={t} navigate={navigate} onExit={exit} />
      ) : (
        <>
          <Header title={t('בדיקה על ידי דובר ילידי', 'Native-speaker review')} ui={ui} uiLangs={['en', 'pl', 'cnr', 'he']} setUi={setUi} t={t} onBack={exit} />
          <p className="mb-4 text-sm text-slate-600">{t('איזו שפה אתם בודקים?', 'Which language are you checking?')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {REVIEW_LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => navigate(`review/${l}`)}
                className="rounded-2xl bg-white p-4 text-start shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300 active:scale-[0.99]"
              >
                <span className="block text-lg font-black">{COURSES[l].name.native}</span>
                <span className="block text-sm text-slate-500">{localize(COURSES[l].name, ui)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Header({ title, subtitle, ui, uiLangs, setUi, t, onBack }: { title: string; subtitle?: string; ui: Lang; uiLangs: Lang[]; setUi: (l: Lang) => void; t: T; onBack?: () => void }) {
  const Back = ui === 'he' ? ArrowRight : ArrowLeft;
  return (
    <header className="mb-4 flex items-start gap-2">
      {onBack && (
        <button type="button" onClick={onBack} aria-label={t('חזרה', 'Back')} className="grid size-10 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-slate-200 active:scale-95">
          <Back className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl leading-tight font-black">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 rounded-xl bg-slate-100 p-0.5 text-xs font-bold" role="group" aria-label={t('שפת הדף', 'Page language')}>
        {uiLangs.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setUi(l)}
            aria-pressed={ui === l}
            className={`rounded-lg px-2 py-1.5 ${ui === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}

interface PageProps {
  lang: ReviewLang;
  sectionId?: string;
  ui: Lang;
  setUi: (l: Lang) => void;
  t: T;
  navigate: (route: string, replace?: boolean) => void;
  onExit?: () => void;
}

function ReviewPage({ lang, sectionId, ui, setUi, t, navigate, onExit }: PageProps) {
  const sections = useMemo(() => reviewSections(lang), [lang]);
  const [store, setStore] = useState<ReviewStore>(() => loadReview(lang));
  useEffect(() => {
    saveReview(lang, store);
  }, [lang, store]);

  const course = COURSES[lang];
  const name = ui === lang ? course.name.native : localize(course.name, ui);
  const title = t(`בדיקת הטקסטים ב${course.name.he}`, `${course.name.en} text review`);
  const uiLangs: Lang[] = [lang, 'en', 'he'];
  const setVerdict = (id: string, v: Verdict | undefined) =>
    setStore((s) => {
      const next = { ...s.v };
      if (v) next[id] = v;
      else delete next[id];
      return { ...s, v: next };
    });

  const index = sections.findIndex((s) => s.id === sectionId);
  const section = index >= 0 ? sections[index] : undefined;
  const label = (s: ReviewSection) => sectionLabel(s, localize(s.title, ui));

  // A new section opens at its top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sectionId]);

  if (section) {
    const next = sections[index + 1];
    return (
      <>
        <Header title={label(section)} subtitle={`${title} · ${groupTitle(section.group, lang, ui, t)}`} ui={ui} uiLangs={uiLangs} setUi={setUi} t={t} onBack={() => navigate(`review/${lang}`)} />
        <SectionView key={section.id} section={section} store={store} setVerdict={setVerdict} lang={lang} t={t} />
        <div className="mt-6 grid gap-2">
          {next && (
            <button type="button" onClick={() => navigate(`review/${lang}/${next.id}`)} className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 font-bold text-white shadow-sm active:scale-[0.98]">
              {t('לחלק הבא', 'Next section')}: {label(next)}
              {ui === 'he' ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
            </button>
          )}
          <button type="button" onClick={() => navigate(`review/${lang}`)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold active:scale-[0.98]">
            {t('לכל החלקים', 'All sections')}
          </button>
        </div>
      </>
    );
  }

  const stats = reviewStats(sections, store);
  return (
    <>
      <Header title={title} subtitle={name} ui={ui} uiLangs={uiLangs} setUi={setUi} t={t} onBack={onExit} />
      <section className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-sm leading-relaxed text-slate-700">
          {t(
            `תודה שאתם עוזרים! כאן כל הטקסטים שהאפליקציה מציגה ב${course.name.he}: מה שהלומדים אומרים, וההסברים שנכתבו לדוברי ${course.name.he} שלומדים אנגלית ועברית. בדקו כתיב, דקדוק והאם זה נשמע טבעי. סמנו כל טקסט כנכון, או הציעו נוסח טוב יותר.`,
            `Thank you for helping! Here is every text the app shows in ${course.name.en}: what learners say, and the explanations written for ${course.name.en} speakers who learn English and Hebrew. Check the spelling, the grammar and whether it sounds natural. Mark each text as correct, or suggest a better version.`,
          )}
        </p>
        <p className="text-xs text-slate-500">
          {t('ההערות נשמרות במכשיר הזה. כשתסיימו – גם באמצע – שלחו אותן בכפתור למטה.', 'Your notes are saved on this device. When you are done – or halfway – send them with the button below.')}
        </p>
        <label className="block text-sm font-semibold">
          {t('השם שלכם (לא חובה)', 'Your name (optional)')}
          <input
            type="text"
            value={store.name}
            onChange={(e) => setStore((s) => ({ ...s, name: e.target.value }))}
            autoComplete="name"
            className="mt-1 block w-full rounded-xl bg-slate-50 px-3 py-2.5 text-base font-normal ring-1 ring-slate-200"
          />
        </label>
      </section>

      <section className="mt-4 space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200" data-testid="review-summary">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-bold">{t(`נבדקו ${stats.checked} מתוך ${stats.total}`, `${stats.checked} of ${stats.total} checked`)}</p>
          <p className="text-sm text-slate-500">{t(`הצעות תיקון: ${stats.fixes}`, `Suggestions: ${stats.fixes}`)}</p>
        </div>
        <Bar done={stats.checked} total={stats.total} />
        <SendPanel report={() => buildReport(lang, sections, store, versionLabel('en-GB'))} fileName={`${lang}-review.txt`} disabled={stats.checked === 0} t={t} />
      </section>

      {REVIEW_GROUPS.map((g) => {
        const list = sections.filter((s) => s.group === g);
        if (!list.length) return null;
        return (
          <section key={g} className="mt-6 space-y-2">
            <h2 className="text-lg font-black">{groupTitle(g, lang, ui, t)}</h2>
            <p className="text-sm text-slate-500">{groupHint(g, lang, t)}</p>
            <ul className="space-y-2">
              {list.map((s) => {
                const done = s.entries.filter((e) => store.v[e.id]).length;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      data-testid={`review-section-${s.id}`}
                      onClick={() => navigate(`review/${lang}/${s.id}`)}
                      className="block w-full space-y-2 rounded-2xl bg-white p-3.5 text-start shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300 active:scale-[0.99]"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{label(s)}</span>
                        <span className={`shrink-0 text-sm tabular-nums ${done === s.entries.length ? 'font-bold text-emerald-700' : 'text-slate-500'}`} dir="ltr">
                          {done}/{s.entries.length}
                        </span>
                      </span>
                      <Bar done={done} total={s.entries.length} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function groupTitle(g: ReviewGroup, lang: ReviewLang, ui: Lang, t: T): string {
  if (g === 'course') return ui === 'he' ? COURSES[lang].titleHe : ui === 'en' ? COURSES[lang].titleEn : COURSES[lang].title;
  if (g === 'english') return localize(COURSES.en.titles, ui);
  if (g === 'hebrew') return localize(COURSES.he.titles, ui);
  return t('ממשק האפליקציה', 'The app interface');
}

function groupHint(g: ReviewGroup, lang: ReviewLang, t: T): string {
  const c = COURSES[lang].name;
  if (g === 'course')
    return t(
      `מה שהלומדים לומדים לומר ב${c.he}. ההברה המודגשת היא ההברה המוטעמת – אם היא שגויה, כתבו זאת בהערה.`,
      `What learners learn to say in ${c.en}. The highlighted syllable is the stressed one – if it is wrong, say so in a comment.`,
    );
  if (g === 'english') return t(`הסברים ותרגומים ב${c.he} ללומדי אנגלית.`, `Explanations and translations in ${c.en} for learners of English.`);
  if (g === 'hebrew') return t(`הסברים ותרגומים ב${c.he} ללומדי עברית.`, `Explanations and translations in ${c.en} for learners of Hebrew.`);
  return t('כפתורים, כותרות והודעות.', 'Buttons, headings and messages.');
}

function Bar({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <span className="block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
      <span className="block h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${pct}%` }} />
    </span>
  );
}

function SectionView({ section, store, setVerdict, lang, t }: { section: ReviewSection; store: ReviewStore; setVerdict: (id: string, v: Verdict | undefined) => void; lang: ReviewLang; t: T }) {
  const [onlyOpen, setOnlyOpen] = useState(false);
  // Entries checked while the filter is on stay until the filter changes, so the list does not jump.
  const [shown, setShown] = useState<Set<string>>(() => new Set(section.entries.map((e) => e.id)));
  useEffect(() => {
    setShown(new Set(section.entries.filter((e) => !onlyOpen || !store.v[e.id]).map((e) => e.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyOpen, section]);
  const entries = section.entries.filter((e) => shown.has(e.id));
  const done = section.entries.filter((e) => store.v[e.id]).length;
  const markAll = () => {
    for (const e of entries) if (!store.v[e.id]) setVerdict(e.id, { s: 'ok' });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="size-5 accent-brand-600" />
          {t('רק מה שעוד לא נבדק', 'Only unchecked')}
        </label>
        <span className="text-sm text-slate-500 tabular-nums" dir="ltr">
          {done}/{section.entries.length}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-2xl bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-800">{t('הכל בחלק הזה נבדק. תודה!', 'Everything in this section is checked. Thank you!')}</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} verdict={store.v[e.id]} onChange={(v) => setVerdict(e.id, v)} lang={lang} t={t} />
          ))}
        </ul>
      )}
      {entries.some((e) => !store.v[e.id]) && (
        <button type="button" onClick={markAll} className="w-full rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200 active:scale-[0.98]">
          {t('לסמן את כל השאר כנכונים', 'Mark all the rest as correct')}
        </button>
      )}
    </div>
  );
}

function Stressed({ notation }: { notation: string }) {
  const words = parseSyllables(notation);
  return (
    <p className="text-xl leading-snug font-semibold text-slate-900">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.map((syl, si) => (
            <span key={si}>
              {si > 0 && <span className="mx-[0.05em] text-slate-300">·</span>}
              <span className={syl.stressed ? 'text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-[0.22em]' : ''}>{syl.text}</span>
            </span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </p>
  );
}

function EntryCard({ entry, verdict, onChange, lang, t }: { entry: ReviewEntry; verdict?: Verdict; onChange: (v: Verdict | undefined) => void; lang: ReviewLang; t: T }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const textLang = lang === 'cnr' ? 'sr-Latn-ME' : 'pl';

  const startEdit = () => {
    setDraft(verdict?.fix ?? entry.text);
    setNote(verdict?.note ?? '');
    setEditing(true);
  };
  const save = () => {
    const fix = draft.trim();
    const comment = note.trim();
    setEditing(false);
    if ((!fix || fix === entry.text) && !comment) return;
    onChange({ s: 'fix', fix: fix || entry.text, note: comment || undefined });
  };

  const ring = verdict?.s === 'ok' ? 'ring-emerald-300' : verdict?.s === 'fix' ? 'ring-amber-300' : 'ring-slate-200';
  const btn = 'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold active:scale-[0.98]';

  return (
    <li data-testid="review-entry" className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ${ring}`}>
      {entry.source && (
        <p className="text-xs text-slate-500">
          <span className="font-semibold">{entry.kind === 'phrase' ? t('משמעות', 'Meaning') : t('מקור באנגלית', 'English original')}:</span>{' '}
          <bdi dir="ltr">{entry.source}</bdi>
        </p>
      )}
      <div dir="ltr" lang={textLang} className="mt-1 text-start">
        {entry.stress ? entry.stress.map((n, i) => <Stressed key={i} notation={n} />) : <p className="text-base leading-relaxed font-medium whitespace-pre-line text-slate-900">{entry.text}</p>}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <label className="block text-xs font-semibold text-slate-600">
            {t('הנוסח הנכון', 'Better version')}
            <textarea
              dir="ltr"
              lang={textLang}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.min(6, Math.ceil(draft.length / 38) + 1)}
              className="mt-1 block w-full rounded-xl bg-slate-50 p-2.5 text-base font-normal text-slate-900 ring-1 ring-slate-200"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {t('הערה (לא חובה)', 'Comment (optional)')}
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 block w-full rounded-xl bg-slate-50 px-2.5 py-2 text-base font-normal text-slate-900 ring-1 ring-slate-200" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={save} className={`${btn} bg-brand-600 text-white`}>
              {t('שמירה', 'Save')}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={`${btn} bg-slate-100`}>
              {t('ביטול', 'Cancel')}
            </button>
          </div>
        </div>
      ) : verdict?.s === 'fix' ? (
        <div className="mt-3 space-y-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          {verdict.fix && verdict.fix !== entry.text && (
            <p>
              <span className="font-semibold">{t('הצעה', 'Suggestion')}:</span> <bdi dir="ltr">{verdict.fix}</bdi>
            </p>
          )}
          {verdict.note && (
            <p>
              <span className="font-semibold">{t('הערה', 'Comment')}:</span> {verdict.note}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={startEdit} className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold ring-1 ring-amber-200">
              <Pencil className="size-3.5" /> {t('עריכה', 'Edit')}
            </button>
            <button type="button" onClick={() => onChange(undefined)} className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold ring-1 ring-amber-200">
              <Undo2 className="size-3.5" /> {t('ביטול ההצעה', 'Remove suggestion')}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={verdict?.s === 'ok'}
            onClick={() => onChange(verdict?.s === 'ok' ? undefined : { s: 'ok' })}
            className={`${btn} ${verdict?.s === 'ok' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'}`}
          >
            <Check className="size-4" /> {t('נכון', 'Correct')}
          </button>
          <button type="button" onClick={startEdit} className={`${btn} bg-amber-50 text-amber-900 ring-1 ring-amber-200`}>
            <Pencil className="size-4" /> {t('להציע תיקון', 'Suggest a fix')}
          </button>
        </div>
      )}
    </li>
  );
}

function SendPanel({ report, fileName, disabled, t }: { report: () => string; fileName: string; disabled: boolean; t: T }) {
  const [text, setText] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const btn = 'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold active:scale-[0.98]';

  if (text === null) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setText(report())}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-45"
      >
        <Send className="size-5" /> {t('שליחת ההערות', 'Send my notes')}
      </button>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(t('ההערות הועתקו – הדביקו אותן בהודעה.', 'Notes copied – paste them into a message.'));
    } catch {
      setStatus(t('ההעתקה נחסמה – סמנו את הטקסט והעתיקו אותו ידנית.', 'Copying was blocked – select the text and copy it by hand.'));
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">{t('שלחו את ההערות למי שביקש מכם לבדוק – בווטסאפ, במייל או בכל דרך אחרת.', 'Send your notes to the person who asked you to check – by WhatsApp, e-mail or any other way.')}</p>
      <textarea readOnly value={text} rows={8} dir="ltr" data-testid="review-report" onFocus={(e) => e.target.select()} className="block w-full rounded-xl bg-slate-50 p-2.5 font-mono text-xs text-slate-800 ring-1 ring-slate-200" />
      <div className={`grid gap-2 ${canShare ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {canShare && (
          <button type="button" onClick={() => navigator.share({ title: fileName, text }).catch(() => undefined)} className={`${btn} bg-brand-600 text-white`}>
            <Share2 className="size-4" /> {t('שיתוף', 'Share')}
          </button>
        )}
        <button type="button" onClick={copy} className={`${btn} ${canShare ? 'bg-slate-100' : 'bg-brand-600 text-white'}`}>
          <ClipboardCopy className="size-4" /> {t('העתקה', 'Copy')}
        </button>
        <button type="button" onClick={download} className={`${btn} bg-slate-100`}>
          <Download className="size-4" /> {t('הורדה', 'Download')}
        </button>
      </div>
      {status && <p className="rounded-xl bg-emerald-50 p-2.5 text-sm text-emerald-800">{status}</p>}
      <button type="button" onClick={() => setText(report())} className="text-xs text-slate-500 underline">
        {t('לרענן את הדוח', 'Refresh the report')}
      </button>
    </div>
  );
}

/** Settings row: open a language's review or share its link with a native speaker. */
export function ReviewLink({ lang, t }: { lang: ReviewLang; t: (all: Loc<string>) => string }) {
  const [status, setStatus] = useState<string | null>(null);
  const url = `${location.origin}${location.pathname}#/review/${lang}`;
  const checked = Object.keys(loadReview(lang).v).length;
  const name = COURSES[lang].name;
  const share = async () => {
    const title = t({ he: `בדיקת הטקסטים ב${name.he}`, en: `${name.en} text review` });
    if (typeof navigator.share === 'function') {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus(t({ he: 'הקישור הועתק.', en: 'Link copied.' }));
    } catch {
      setStatus(t({ he: 'ההעתקה נחסמה – העתיקו את הקישור ידנית.', en: 'Copying was blocked – copy the link by hand.' }));
    }
  };
  const btn = 'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold active:scale-[0.98]';
  return (
    <div className="space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200" data-testid={`review-link-${lang}`}>
      <p className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{t({ he: name.he, en: name.en, pl: name.pl, cnr: name.cnr })}</span>
        {checked > 0 && <span className="text-xs text-slate-500">{t({ he: `${checked} נבדקו במכשיר הזה`, en: `${checked} checked on this device` })}</span>}
      </p>
      <input readOnly value={url} dir="ltr" onFocus={(e) => e.target.select()} aria-label={t({ he: 'קישור לבדיקה', en: 'Review link' })} className="block w-full rounded-lg bg-white px-2.5 py-2 text-xs text-slate-600 ring-1 ring-slate-200" />
      <div className="grid grid-cols-2 gap-2">
        <a href={`#/review/${lang}`} className={`${btn} bg-white ring-1 ring-slate-200`}>
          {t({ he: 'פתיחה', en: 'Open' })}
        </a>
        <button type="button" onClick={share} className={`${btn} bg-brand-600 text-white`}>
          <Share2 className="size-4" /> {t({ he: 'שליחת הקישור', en: 'Send the link' })}
        </button>
      </div>
      {status && <p className="text-xs text-emerald-700">{status}</p>}
    </div>
  );
}
