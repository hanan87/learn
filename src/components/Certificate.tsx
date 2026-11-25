import { useRef, useState, type Ref } from 'react';
import { Check, Download, Share2 } from 'lucide-react';
import { CAN_DO } from '../data/canDo';
import { unitText, type Unit } from '../data/types';
import { LOCALES, useLang } from '../i18n/LangContext';
import { certificatePng, downloadBlob, shareBlob } from '../lib/certificateImage';
import { COURSE_INFO as C } from '../lib/course';
import { appUrl } from '../lib/reminder';
import { useProgress } from '../state/ProgressContext';
import { CERT_COLOR, unitIcon, type CertColors } from './unitStyle';

/** A yyyy-mm-dd day as a local date. */
const keyDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** The unit medal: a disc in the unit's color with its icon, on two ribbon tails. */
export function Medal({ unit, size = 132, label, svgRef }: { unit: Unit; size?: number; label?: string; svgRef?: Ref<SVGSVGElement> }) {
  const c = CERT_COLOR[unit.color];
  const Icon = unitIcon(unit.id);
  return (
    <svg ref={svgRef} viewBox="0 0 132 150" width={size} height={(size * 150) / 132} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d="M44 92 L30 146 L49 136 L60 150 L66 104 Z" fill={c.core} />
      <path d="M88 92 L102 146 L83 136 L72 150 L66 104 Z" fill={c.ribbon} />
      <circle cx="66" cy="62" r="58" fill={c.medal} />
      <circle cx="66" cy="62" r="50" fill="none" stroke={c.soft} strokeWidth="2" />
      <circle cx="66" cy="62" r="42" fill={c.core} />
      <Icon x={44} y={40} width={44} height={44} color="#ffffff" strokeWidth={2.2} />
    </svg>
  );
}

interface Props {
  unit: Unit;
  score: number;
  /** Day the test was first passed (yyyy-mm-dd). */
  date: string;
}

/**
 * The certificate of a passed unit test (design B, "medal"): the unit's medal, the learner's name, the
 * score and date, and what the learner can now do. The card keeps its fixed paper colors in dark mode,
 * like the picture it saves.
 */
export function Certificate({ unit, score, date }: Props) {
  const { state, setProfile } = useProgress();
  const { tr, loc, lang } = useLang();
  const medalRef = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState<'save' | 'share' | null>(null);
  const [saved, setSaved] = useState(false);
  const c: CertColors = CERT_COLOR[unit.color];
  const name = state.profile.name.trim();
  const title = unitText(unit, lang).title;
  const label = `${loc(C.titles)} · ${tr(`יחידה ${unit.order} הושלמה`, `Unit ${unit.order} completed`)}`;
  const day = keyDate(date).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'numeric', year: 'numeric' });
  const canDo = (CAN_DO[unit.id] ?? []).map((line) => loc(line));
  const canDoTitle = tr('עכשיו אתם יודעים', 'Now you can');
  const filename = `certificate-${C.id}-${unit.id}.png`;

  const picture = () =>
    certificatePng(medalRef.current!, c, {
      dir: lang === 'he' ? 'rtl' : 'ltr',
      label,
      name,
      unitTitle: title,
      score: `${score}%`,
      date: day,
      canDoTitle,
      canDo,
      footer: appUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),
    });

  const run = async (kind: 'save' | 'share') => {
    setBusy(kind);
    try {
      const blob = await picture();
      if (kind === 'save') {
        downloadBlob(blob, filename);
        setSaved(true);
      } else if ((await shareBlob(blob, filename, `${label} – ${title}`)) === 'saved') setSaved(true);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <article className="overflow-hidden rounded-[28px] bg-white shadow-md ring-1 ring-slate-200/80" style={{ backgroundColor: '#ffffff', color: '#141a26' }} data-testid="certificate">
        <div className="flex flex-col items-center gap-1 px-4 pt-5 pb-4 text-center" style={{ backgroundColor: c.band }}>
          <p className="text-xs font-bold tracking-wide" style={{ color: c.core }}>
            {label}
          </p>
          <div className="animate-celebrate mt-1.5">
            <Medal unit={unit} label={tr(`מדליית יחידה ${unit.order}`, `Unit ${unit.order} medal`)} svgRef={medalRef} />
          </div>
          {name && (
            <p className="mt-1 text-[26px] leading-tight font-bold" data-testid="certificate-name">
              {name}
            </p>
          )}
          <p className="text-sm" style={{ color: c.text }}>
            {title}
          </p>
          <div className="mt-2 flex gap-1.5">
            {[`${score}%`, day].map((chip) => (
              <span key={chip} className="rounded-full px-2.5 py-1 text-[13px] font-bold" style={{ backgroundColor: '#ffffff', color: c.ribbon, boxShadow: `inset 0 0 0 1px ${c.line}` }} dir="ltr">
                {chip}
              </span>
            ))}
          </div>
        </div>
        {canDo.length > 0 && (
          <div className="space-y-2 px-4 pt-3.5 pb-4 text-start">
            <h3 className="text-sm font-bold" style={{ color: '#333a4b' }}>
              {canDoTitle}
            </h3>
            <ul className="space-y-2 text-sm leading-snug">
              {canDo.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full" style={{ backgroundColor: c.soft, color: c.core }}>
                    <Check className="size-3" strokeWidth={3.5} aria-hidden />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {!name && (
        <label className="block space-y-1 text-start">
          <span className="text-sm font-semibold text-slate-700">{tr('השם שלכם על התעודה', 'Your name on the certificate')}</span>
          <input
            type="text"
            autoComplete="given-name"
            maxLength={30}
            onBlur={(e) => e.target.value.trim() && setProfile({ name: e.target.value.trim() })}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="w-full rounded-xl bg-white px-3 py-2.5 text-base ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            data-testid="certificate-name-input"
          />
        </label>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => run('save')} disabled={!!busy} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-3 font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-60">
          <Download className="size-[18px]" aria-hidden /> {tr('שמירה כתמונה', 'Save as image')}
        </button>
        <button type="button" onClick={() => run('share')} disabled={!!busy} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-3 font-bold text-brand-700 ring-1 ring-slate-300 active:scale-[0.98] disabled:opacity-60">
          <Share2 className="size-[18px]" aria-hidden /> {tr('שיתוף', 'Share')}
        </button>
      </div>
      {saved && (
        <p className="text-center text-sm text-emerald-700" role="status">
          {tr('התמונה נשמרה בהורדות.', 'The picture was saved to your downloads.')}
        </p>
      )}
    </div>
  );
}
