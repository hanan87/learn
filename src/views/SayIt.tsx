import { useEffect, useRef, useState } from 'react';
import { BookPlus, CheckCircle2, ExternalLink, Lightbulb, Loader2, Mic, PencilLine, Volume2, X } from 'lucide-react';
import { getItem } from '../data';
import { itemText, type LearningItem } from '../data/types';
import { Phonetic } from '../components/Phonetic';
import { PolishKeyboard } from '../components/PolishKeyboard';
import { PolishSyllables } from '../components/PolishSyllables';
import { PronunciationPractice } from '../components/PronunciationPractice';
import { SpeakControls } from '../components/SpeakControls';
import { useLang } from '../i18n/LangContext';
import { COURSE, COURSE_INFO as C } from '../lib/course';
import { autoBackchain, autoTip, toEnglishPhonetic, toHebrewPhonetic, toSyllableNotation } from '../lib/phonetics';
import { courseItemByText, translateFromCourse, translateToCourse, TranslateError, type TranslateFailure, type TranslateSource } from '../lib/translate';
import { speak, stopSpeaking } from '../lib/tts';
import { useProgress } from '../state/ProgressContext';

/**
 * "How do I say…?": the learner types a word or sentence in their own language (or in the course
 * language), hears it, sees how it is written, split into syllables with the stress and transcribed,
 * then repeats it and gets an honest pronunciation score. The phrase can be saved to the personal
 * dictionary so it joins spaced repetition.
 */

interface Result {
  target: string;
  meaning: string;
  source: TranslateSource | 'typed' | 'edited';
  itemId?: string;
}

type Mode = 'native' | 'target';

const HISTORY_KEY = `polish-learn:say-history:${COURSE}`;
const HISTORY_SIZE = 8;

function loadHistory(): Result[] {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    return Array.isArray(list) ? list.filter((r) => r && typeof r.target === 'string').slice(0, HISTORY_SIZE) : [];
  } catch {
    return [];
  }
}

function saveHistory(list: Result[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_SIZE)));
  } catch {
    // Storage disabled: history lasts for this session only.
  }
}

/** Personal-dictionary item for a phrase from this screen (same shape as the add-word form). */
function customItem(target: string, meaning: string): LearningItem {
  return {
    id: `c-${Date.now().toString(36)}`,
    polish: target,
    syllablesPolish: toSyllableNotation(target),
    // Only the learner's own language is known; it fills both meaning fields like the add-word form.
    hebrew: meaning,
    english: meaning,
    phoneticHebrew: toHebrewPhonetic(target),
    phoneticEnglish: toEnglishPhonetic(target),
    articulationTip: autoTip(target, 'he'),
    articulationTipEn: autoTip(target, 'en'),
    backchainingSteps: autoBackchain(target),
    formality: 'neutral',
    custom: true,
  };
}

export function SayIt({ onOpenItem }: { onOpenItem: (id: string) => void }) {
  const { tr, lang } = useLang();
  const [mode, setMode] = useState<Mode>('native');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<TranslateFailure | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>(loadHistory);
  const [autoPlay, setAutoPlay] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const remember = (r: Result) => {
    const next = [r, ...history.filter((h) => h.target !== r.target)].slice(0, HISTORY_SIZE);
    setHistory(next);
    saveHistory(next);
  };

  const show = (r: Result) => {
    setResult(r);
    setAutoPlay((n) => n + 1);
    remember(r);
  };

  const submit = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    stopSpeaking();
    try {
      if (mode === 'native') {
        const t = await translateToCourse(text, lang);
        show({ target: t.text, meaning: text, source: t.source, itemId: t.itemId });
      } else {
        // The learner typed the phrase itself: no translation needed to teach it; the meaning is a bonus.
        const known = courseItemByText(text);
        let meaning = '';
        try {
          meaning = (await translateFromCourse(text, lang)).text;
        } catch {
          meaning = '';
        }
        show({ target: known?.polish ?? text, meaning, source: known ? 'course' : 'typed', itemId: known?.id });
      }
    } catch (e) {
      setError(e instanceof TranslateError ? e.reason : 'failed');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setInput('');
    setError(null);
  };

  const errorText: Record<TranslateFailure, string> = {
    empty: tr('כתבו מילה או משפט.', 'Type a word or a sentence.'),
    offline: tr(
      `אין חיבור לאינטרנט, ולכן אי אפשר לתרגם כרגע. אם אתם יודעים איך כותבים את זה ${C.inLang.he}, עברו ל"יש לי את הטקסט" – ההשמעה והתרגול עובדים גם בלי רשת.`,
      `You are offline, so translation is not available right now. If you know how it is written ${C.inLang.en}, switch to "I have the text" – listening and practice work offline too.`,
    ),
    quota: tr(
      'נגמרה מכסת התרגום החינמית להיום. אפשר להמשיך מחר, או להקליד את הטקסט ישירות.',
      'Today’s free translation quota is used up. Try again tomorrow, or type the text yourself.',
    ),
    failed: tr('התרגום לא הצליח. נסו שוב בעוד רגע או נסחו אחרת.', 'Translation did not work. Try again in a moment or rephrase it.'),
  };

  return (
    <div className="space-y-5" data-testid="say-it">
      <section className="space-y-1 pt-1">
        <p className="eyebrow">{tr('המילון המדבר שלכם', 'Your talking dictionary')}</p>
        <h2 className="text-2xl leading-tight font-semibold">{tr(`איך אומרים ${C.inLang.he}?`, `How do you say it ${C.inLang.en}?`)}</h2>
        <p className="text-sm text-slate-600">
          {tr(
            'כתבו מילה או משפט – תשמעו איך זה נשמע, תראו איך כותבים ומבטאים, ואז תחזרו אחריי ואגיד לכם אם זה נכון.',
            'Type a word or sentence – hear how it sounds, see how it is written and pronounced, then repeat it and I will tell you whether it is right.',
          )}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="flex overflow-hidden rounded-full text-xs font-semibold ring-1 ring-slate-300" role="group" aria-label={tr('מה אתם מקלידים', 'What you type')}>
          {(
            [
              ['native', tr('אני כותב/ת בעברית', 'I type in English')],
              ['target', tr(`יש לי את הטקסט ${C.inLang.he}`, `I have the ${C.name.en} text`)],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              data-testid={`say-mode-${m}`}
              className={`flex-1 px-3 py-2 transition ${mode === m ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            dir={mode === 'target' ? 'ltr' : 'auto'}
            lang={mode === 'target' ? C.htmlLang : lang}
            enterKeyHint="go"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={300}
            placeholder={mode === 'target' ? { pl: 'np. Gdzie jest dworzec?', cnr: 'npr. Gdje je autobuska stanica?', en: 'e.g. Where is the bus station?' }[C.id] : tr('למשל: איפה תחנת האוטובוס?', 'e.g. Where is the bus station?')}
            aria-label={mode === 'target' ? tr(`טקסט ${C.inLang.he}`, `Text ${C.inLang.en}`) : tr('מילה או משפט בעברית', 'Word or sentence in English')}
            data-testid="say-input"
            className={`min-w-0 flex-1 rounded-xl bg-white px-3 py-3 text-base ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand-500 ${mode === 'target' ? 'polish' : ''}`}
          />
          <button type="submit" disabled={!input.trim() || busy} className="btn-primary shrink-0 px-4" data-testid="say-submit">
            {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Volume2 className="size-5" aria-hidden />}
            <span className="hidden sm:inline">{mode === 'native' ? tr('תרגם והשמע', 'Translate & play') : tr('השמע', 'Play')}</span>
            <span className="sr-only sm:hidden">{mode === 'native' ? tr('תרגם והשמע', 'Translate & play') : tr('השמע', 'Play')}</span>
          </button>
        </form>
        {mode === 'target' && <PolishKeyboard inputRef={inputRef} value={input} onChange={setInput} />}
        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-900 ring-1 ring-rose-200" role="alert" data-testid="say-error">
            {errorText[error]}
          </p>
        )}
      </section>

      {result && (
        <SayResult
          key={result.target}
          result={result}
          autoPlay={autoPlay}
          onOpenItem={onOpenItem}
          onEdit={(target) => show({ ...result, target, source: 'edited', itemId: undefined })}
        />
      )}

      {history.length > 0 && (
        <section className="space-y-2" data-testid="say-history">
          <h3 className="text-sm font-bold text-slate-700">{tr('חיפושים אחרונים', 'Recent')}</h3>
          <ul className="flex flex-wrap gap-2">
            {history.map((h) => (
              <li key={h.target}>
                <button
                  type="button"
                  onClick={() => show(h)}
                  className="rounded-full bg-white px-3 py-1.5 text-start text-sm ring-1 ring-slate-200 hover:ring-slate-400"
                >
                  <span dir="ltr" lang={C.htmlLang} className="polish font-semibold text-slate-900">
                    {h.target}
                  </span>
                  {h.meaning && <span className="ms-1.5 text-xs text-slate-500">{h.meaning}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SayResult({
  result,
  autoPlay,
  onOpenItem,
  onEdit,
}: {
  result: Result;
  autoPlay: number;
  onOpenItem: (id: string) => void;
  onEdit: (target: string) => void;
}) {
  const { tr, lang } = useLang();
  const { addCustomItem } = useProgress();
  const item = result.itemId ? getItem(result.itemId) : undefined;
  const target = result.target;
  const notation = item?.syllablesPolish ?? toSyllableNotation(target);
  const phoneticHe = item?.phoneticHebrew ?? toHebrewPhonetic(target);
  const phoneticEn = item?.phoneticEnglish ?? toEnglishPhonetic(target);
  const tip = item ? itemText(item, lang).tip : autoTip(target, lang);
  const steps = item?.backchainingSteps ?? autoBackchain(target);
  const meaning = item ? itemText(item, lang).meaning : result.meaning;
  const words = target
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''))
    .filter(Boolean);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(target);
  const [saved, setSaved] = useState(false);
  const draftRef = useRef<HTMLInputElement>(null);

  // Say it once as soon as it appears (the learner just asked for it).
  useEffect(() => {
    if (autoPlay > 0) void speak(target);
    return () => stopSpeaking();
  }, [autoPlay, target]);

  const sourceNote: Record<Result['source'], string> = {
    course: tr('מהקורס – נבדק ידנית', 'From the course – hand-checked'),
    online: tr('תרגום מכונה (MyMemory) – עלולות להיות טעויות; לביטוי חשוב כדאי לבדוק עם דובר', 'Machine translation (MyMemory) – it can be wrong; check important phrases with a native speaker'),
    device: tr('תרגום מכונה במכשיר (Chrome) – עלולות להיות טעויות', 'On-device machine translation (Chrome) – it can be wrong'),
    typed: tr('הטקסט שהקלדתם', 'The text you typed'),
    edited: tr('התרגום שתיקנתם', 'Your corrected translation'),
  };
  const existing = item ?? courseItemByText(target);

  const save = () => {
    const m = result.meaning.trim() || target;
    addCustomItem(customItem(target, m));
    setSaved(true);
  };

  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200" data-testid="say-result">
      <div className="space-y-2 text-center">
        <p className={`text-xs font-semibold ${result.source === 'course' ? 'text-emerald-700' : 'text-slate-500'}`} data-testid="say-source">
          {sourceNote[result.source]}
        </p>
        {editing ? (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              const t = draft.trim();
              if (t) onEdit(t);
            }}
          >
            <div className="flex gap-2">
              <input
                ref={draftRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                dir="ltr"
                lang={C.htmlLang}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label={tr('התרגום המתוקן', 'Corrected translation')}
                className="polish min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 text-lg ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="submit" className="btn-primary shrink-0 px-4">
                {tr('עדכון', 'Update')}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label={tr('ביטול', 'Cancel')}>
                <X className="size-5" />
              </button>
            </div>
            <PolishKeyboard inputRef={draftRef} value={draft} onChange={setDraft} />
          </form>
        ) : (
          <div data-testid="say-target">
            <PolishSyllables notation={notation} size={target.length > 18 ? 'lg' : 'xl'} />
          </div>
        )}
        <Phonetic he={phoneticHe} en={phoneticEn} size="lg" />
        {meaning && <p className="text-lg font-medium text-slate-600">{meaning}</p>}
        {!editing && result.source !== 'course' && (
          <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 underline-offset-2 hover:underline">
            <PencilLine className="size-3.5" aria-hidden /> {tr('לתקן את הטקסט', 'Correct the text')}
          </button>
        )}
      </div>

      <SpeakControls text={target} backchainingSteps={steps} />

      {words.length > 1 && (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-slate-700">{tr('מילה אחר מילה', 'Word by word')}</p>
          <ul className="flex flex-wrap gap-2" dir="ltr">
            {words.map((w, i) => (
              <li key={`${w}-${i}`}>
                <button type="button" onClick={() => void speak(w)} className="flex flex-col items-center rounded-xl bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200 hover:ring-slate-400" aria-label={`${tr('השמע', 'Play')} ${w}`}>
                  <span lang={C.htmlLang} className="polish font-semibold text-slate-900">
                    {w}
                  </span>
                  <span className={`text-xs text-slate-500 ${lang === 'he' ? 'phonetic' : ''}`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
                    {(lang === 'he' ? toHebrewPhonetic(w) : toEnglishPhonetic(w)).replace(/[[\]]/g, '')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-amber-800">
          <Lightbulb className="size-4" aria-hidden />
          {tr('איך מבטאים', 'How to pronounce it')}
        </p>
        <p className="text-sm leading-relaxed text-amber-950">{tip}</p>
      </div>

      <section className="space-y-3">
        <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-800">
          <Mic className="size-4" aria-hidden /> {tr('עכשיו אתם – חזרו אחריי', 'Your turn – repeat after me')}
        </h3>
        <PronunciationPractice target={target} itemId={item?.id} articulationTip={tip} backchainingSteps={steps} />
      </section>

      {saved ? (
        <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200" data-testid="say-saved">
          <CheckCircle2 className="size-5" aria-hidden /> {tr('נשמר במילון האישי – יופיע בחזרות', 'Saved to your dictionary – it will come up in review')}
        </p>
      ) : existing ? (
        <button type="button" onClick={() => onOpenItem(existing.id)} className="btn-secondary w-full py-3">
          <ExternalLink className="size-4" aria-hidden />
          {existing.custom ? tr('כבר במילון האישי – פתחו את הכרטיס', 'Already in your dictionary – open its card') : tr('הביטוי נמצא בקורס – פתחו את הכרטיס', 'This phrase is in the course – open its card')}
        </button>
      ) : (
        <button type="button" onClick={save} className="btn-secondary w-full py-3" data-testid="say-save">
          <BookPlus className="size-4" aria-hidden /> {tr('שמירה למילון האישי', 'Save to my dictionary')}
        </button>
      )}
    </section>
  );
}
