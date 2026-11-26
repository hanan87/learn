import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Keyboard, Lightbulb, Mic, MicOff, Send, Square, Volume2, X } from 'lucide-react';
import { getItem, UNITS } from '../data';
import { pictureUrl } from '../data/pictures';
import { Sheet } from '../components/Sheet';
import { useSpeechRecorder } from '../hooks/useSpeechRecorder';
import { useLang } from '../i18n/LangContext';
import type { Lang } from '../i18n/lang';
import { ChatError, PARTNER, TOPIC_PICTURE, chatTurn, type ChatPair, type ChatProblem, type ChatTopic } from '../lib/chat';
import { COURSE_INFO as C } from '../lib/course';
import { makeCustomItem } from '../lib/customItem';
import { speak, stopSpeaking } from '../lib/tts';
import { XP, useProgress } from '../state/ProgressContext';

/**
 * Free conversation: the learner talks with a character (a waitress, a pharmacist, a new
 * acquaintance…) in the course language, by voice or typing. Each partner line can be heard and
 * translated; mistakes get a gentle "you can also say", "What can I say?" offers three answers, and
 * the summary lists the new words (to keep in the personal dictionary) and the corrections.
 */

export const TOPIC_LABEL: Record<ChatTopic, { he: string; en: string }> = {
  cafe: { he: 'בבית קפה', en: 'At a café' },
  meet: { he: 'היכרות', en: 'Meeting someone' },
  travel: { he: 'בדרכים', en: 'Getting around' },
  holiday: { he: 'חופשה ומזג אוויר', en: 'Holiday and weather' },
  pharmacy: { he: 'בבית מרקחת', en: 'At the pharmacy' },
  free: { he: 'נושא חופשי', en: 'Free topic' },
};

/** The partner's name as written in the interface (Hebrew letters in the Hebrew interface). */
const PARTNER_HE: Record<string, string> = { pl: 'אולה', cnr: 'מיליצה', en: 'אמה', he: 'נועה' };
export const partnerName = (lang: Lang) => (lang === 'he' ? PARTNER_HE[C.id] : PARTNER[C.id]);

/** Text in the course language: its script direction and language for fonts and screen readers. */
const targetProps = { dir: C.dir, lang: C.id === 'cnr' ? 'sr-Latn' : C.id };

interface Msg {
  id: number;
  role: 'partner' | 'learner';
  text: string;
  translation?: string;
  correction?: { better: string; note: string };
  voice?: boolean;
}

interface Correction {
  said: string;
  better: string;
  note: string;
}

export function FreeChat({ topic, onExit }: { topic: ChatTopic; onExit: () => void }) {
  const { tr, loc, lang } = useLang();
  const progress = useProgress();
  const { state } = progress;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<ChatProblem | null>(null);
  const [suggestions, setSuggestions] = useState<ChatPair[]>([]);
  const [words, setWords] = useState<ChatPair[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [ended, setEnded] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [hintsOpen, setHintsOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [heardNothing, setHeardNothing] = useState(false);
  const [summary, setSummary] = useState(false);
  const messagesRef = useRef<Msg[]>([]);
  const idRef = useRef(0);
  const started = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const rec = useSpeechRecorder({ target: '', maxDurationMs: 12_000 });

  // Phrases the learner knows, so the partner keeps to familiar words; a new learner gets the first units.
  const known = useMemo(() => {
    const learned = Object.entries(state.items)
      .filter(([, p]) => p.learned)
      .map(([id]) => getItem(id)?.polish)
      .filter((t): t is string => !!t);
    const starter = UNITS.flatMap((u) => u.items.map((i) => i.polish)).slice(0, Math.max(0, 30 - learned.length));
    return [...new Set([...learned, ...starter])].slice(0, 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAll = (next: Msg[]) => {
    messagesRef.current = next;
    setMessages(next);
  };

  const ask = async (history: Msg[]) => {
    setLoading(true);
    setProblem(null);
    try {
      const r = await chatTurn({
        topic,
        ui: lang,
        gender: state.profile.gender,
        name: state.profile.name.trim(),
        known,
        history: history.map((m) => ({ role: m.role, text: m.text })),
      });
      const next = [...history];
      const last = next[next.length - 1];
      if (r.correction && last?.role === 'learner') {
        next[next.length - 1] = { ...last, correction: r.correction };
        setCorrections((c) => [...c, { said: last.text, ...r.correction! }]);
      }
      next.push({ id: ++idRef.current, role: 'partner', text: r.reply, translation: r.translation });
      setAll(next);
      setSuggestions(r.suggestions);
      setWords((w) => [...w, ...r.words.filter((x) => !w.some((y) => y.text.toLowerCase() === x.text.toLowerCase()))]);
      setEnded(r.end);
      speak(r.reply).catch(() => undefined);
    } catch (e) {
      setProblem(e instanceof ChatError ? e.problem : 'failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    ask([]);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, problem]);

  const send = (text: string, voice: boolean) => {
    const said = text.trim();
    if (!said || loading) return;
    stopSpeaking();
    setHeardNothing(false);
    setHintsOpen(false);
    setDraft('');
    const history = [...messagesRef.current, { id: ++idRef.current, role: 'learner' as const, text: said, voice }];
    setAll(history);
    ask(history);
  };

  // A finished recording is sent as the learner's turn.
  useEffect(() => {
    if (rec.status !== 'done' || !rec.result) return;
    const said = rec.result.transcript.trim();
    if (said) send(said, true);
    else setHeardNothing(true);
    rec.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.status, rec.result]);

  const learnerTurns = messages.filter((m) => m.role === 'learner').length;
  const finish = () => {
    stopSpeaking();
    if (rec.status === 'recording') rec.stop();
    if (learnerTurns >= 2) progress.award(XP.chat);
    setSummary(true);
  };

  const restart = () => {
    setAll([]);
    setSuggestions([]);
    setWords([]);
    setCorrections([]);
    setEnded(false);
    setShown(new Set());
    setSummary(false);
    ask([]);
  };

  if (summary) {
    return <ChatSummary turns={learnerTurns} earned={learnerTurns >= 2 ? XP.chat : 0} words={words} corrections={corrections} topic={topic} onAgain={restart} onExit={onExit} />;
  }

  const name = partnerName(lang);
  const recording = rec.status === 'recording' || rec.status === 'starting';
  const busy = loading || rec.status === 'processing';

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-slate-50" role="dialog" aria-modal="true" aria-label={tr('שיחה חופשית', 'Free conversation')} data-testid="free-chat">
      <header className="pt-safe border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-2.5 px-4 py-2.5">
          <button type="button" onClick={onExit} className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-200/80" aria-label={tr('יציאה מהשיחה', 'Leave the conversation')}>
            <X className="size-5" />
          </button>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-50">
            <img src={pictureUrl(TOPIC_PICTURE[topic])} alt="" className="size-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-slate-900">{name}</span>
            <span className="block truncate text-sm text-slate-500">
              {loc(TOPIC_LABEL[topic])}
              {learnerTurns > 0 && ` · ${tr(`תור ${learnerTurns}`, `Turn ${learnerTurns}`)}`}
            </span>
          </span>
          <button type="button" onClick={finish} disabled={learnerTurns === 0} className="min-h-11 rounded-xl bg-brand-50 px-3 text-sm font-semibold text-brand-700 disabled:opacity-40" data-testid="chat-finish">
            {tr('סיום', 'Finish')}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex max-w-2xl flex-col gap-2.5 px-4 py-4" data-testid="chat-messages">
          {messages.map((m) =>
            m.role === 'partner' ? (
              <div key={m.id} className="max-w-[85%] space-y-1 self-start rounded-[20px] rounded-es-md bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-200/80" data-testid="chat-partner">
                <p className="polish text-[17px] leading-snug font-medium text-slate-900" {...targetProps}>
                  {m.text}
                </p>
                {shown.has(m.id) && m.translation && <p className="border-t border-slate-100 pt-1 text-sm text-slate-600" data-testid="chat-translation">{m.translation}</p>}
                <div className="flex gap-1 text-sm font-semibold text-brand-700">
                  <button type="button" onClick={() => speak(m.text)} className="flex min-h-9 items-center gap-1 rounded-lg px-1.5 hover:bg-brand-50">
                    <Volume2 className="size-4" aria-hidden /> {tr('השמעה', 'Play')}
                  </button>
                  {m.translation && (
                    <button
                      type="button"
                      onClick={() => setShown((s) => (s.has(m.id) ? new Set([...s].filter((x) => x !== m.id)) : new Set(s).add(m.id)))}
                      className="min-h-9 rounded-lg px-1.5 hover:bg-brand-50"
                      aria-expanded={shown.has(m.id)}
                    >
                      {shown.has(m.id) ? tr('הסתרת התרגום', 'Hide translation') : tr('תרגום', 'Translate')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex max-w-[85%] flex-col items-end gap-1.5 self-end" data-testid="chat-learner">
                <p className="flex items-center gap-2 rounded-[20px] rounded-ee-md bg-brand-600 px-3 py-2.5 text-white">
                  {m.voice && <Mic className="size-3.5 shrink-0 opacity-80" aria-label={tr('אמרתם בקול', 'Said aloud')} />}
                  <span className="polish text-[17px] leading-snug" {...targetProps}>
                    {m.text}
                  </span>
                </p>
                {m.correction && (
                  <div className="rounded-2xl bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-200" data-testid="chat-correction">
                    <span className="font-semibold">{tr('אפשר גם לומר כך:', 'You can also say:')}</span>{' '}
                    <button type="button" onClick={() => speak(m.correction!.better)} className="polish font-semibold underline decoration-amber-400 underline-offset-2" {...targetProps}>
                      {m.correction.better}
                    </button>
                    {m.correction.note && <span className="block text-amber-900">{m.correction.note}</span>}
                  </div>
                )}
              </div>
            ),
          )}

          {loading && (
            <div className="flex gap-1 self-start rounded-[20px] rounded-es-md bg-white px-4 py-3.5 ring-1 ring-slate-200/80" role="status" aria-label={tr(`${name} כותבת…`, `${name} is typing…`)} data-testid="chat-typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}

          {problem && (
            <div className="space-y-2 rounded-2xl bg-white p-3.5 text-sm text-slate-700 ring-1 ring-rose-200" role="alert" data-testid="chat-problem" data-problem={problem}>
              <p>
                {
                  {
                    quota: tr('השיחות החינמיות של היום נגמרו. מחר אפשר להמשיך – והשיחות המוכנות עובדות גם עכשיו.', "Today's free conversations are used up. Come back tomorrow – the ready-made conversations still work now."),
                    not_configured: tr('השיחה החופשית עוד לא הופעלה.', 'Free conversation is not switched on yet.'),
                    offline: tr('אין חיבור לאינטרנט. התחברו ונסו שוב.', 'No internet connection. Connect and try again.'),
                    failed: tr('בן השיחה לא ענה. נסו שוב.', 'The conversation partner did not answer. Try again.'),
                  }[problem]
                }
              </p>
              {problem !== 'not_configured' && problem !== 'quota' && (
                <button type="button" onClick={() => ask(messagesRef.current)} className="min-h-10 rounded-xl bg-brand-600 px-3 font-semibold text-white">
                  {tr('לנסות שוב', 'Try again')}
                </button>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <footer className="pb-safe border-t border-slate-200/70 bg-white">
        <div className="mx-auto max-w-2xl space-y-2.5 px-4 pt-2.5 pb-4">
          {ended ? (
            <button type="button" onClick={finish} className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-md" data-testid="chat-summary-open">
              {tr('השיחה הסתיימה – לסיכום', 'The conversation is over – see the summary')}
            </button>
          ) : (
            <>
              {heardNothing && <p className="text-center text-sm text-slate-600">{tr('לא שמעתי – נסו שוב או הקלידו.', "I didn't catch that – try again or type.")}</p>}
              {recording && rec.interim && (
                <p className="polish text-center text-slate-500" {...targetProps}>
                  {rec.interim}
                </p>
              )}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setHintsOpen(true)}
                  disabled={!suggestions.length || busy}
                  className="flex min-h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 text-sm font-semibold text-brand-700 disabled:opacity-40"
                  data-testid="chat-hints"
                >
                  <Lightbulb className="size-4" aria-hidden /> {tr('מה אפשר לענות?', 'What can I say?')}
                </button>
              </div>
              {typing ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(draft, false);
                  }}
                >
                  <button type="button" onClick={() => setTyping(false)} className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-50 text-slate-600 ring-1 ring-slate-300" aria-label={tr('לדבר במקום להקליד', 'Speak instead')}>
                    <Mic className="size-5" />
                  </button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={tr('כתבו את התשובה שלכם…', 'Write your answer…')}
                    {...targetProps}
                    className="polish min-h-12 min-w-0 flex-1 rounded-2xl bg-slate-50 px-3 text-base ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand-500"
                    autoComplete="off"
                    data-testid="chat-input"
                  />
                  <button type="submit" disabled={!draft.trim() || busy} className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white disabled:opacity-40" aria-label={tr('שליחה', 'Send')}>
                    <Send className="size-5 rtl:-scale-x-100" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-5">
                  <button type="button" onClick={() => setTyping(true)} className="grid size-12 place-items-center rounded-full bg-slate-50 text-slate-600 ring-1 ring-slate-300" aria-label={tr('הקלדה במקום דיבור', 'Type instead')} data-testid="chat-type">
                    <Keyboard className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => (recording ? rec.stop() : rec.start())}
                    disabled={busy}
                    className={`grid size-[76px] place-items-center rounded-full text-white shadow-lg transition active:scale-95 disabled:opacity-50 ${recording ? 'bg-rose-600' : 'bg-brand-600'}`}
                    aria-label={recording ? tr('עצירה', 'Stop') : tr('לחצו ודברו', 'Tap and speak')}
                  >
                    {recording ? <Square className="size-7 fill-current" /> : rec.error ? <MicOff className="size-8" /> : <Mic className="size-8" />}
                  </button>
                  <span className="size-12" aria-hidden />
                </div>
              )}
            </>
          )}
        </div>
      </footer>

      <Sheet open={hintsOpen} onClose={() => setHintsOpen(false)} title={tr('מה אפשר לענות?', 'What can I say?')}>
        <div className="space-y-3 pt-2" data-testid="chat-suggestions">
          <h3 className="text-lg font-bold">{tr('מה אפשר לענות?', 'What can I say?')}</h3>
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li key={s.text} className="flex items-center gap-2.5 rounded-2xl bg-white p-2.5 ring-1 ring-slate-200/80">
                <button type="button" onClick={() => speak(s.text)} className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600" aria-label={tr('השמעה', 'Play')}>
                  <Volume2 className="size-5" />
                </button>
                <span className="min-w-0 flex-1">
                  <span className="polish block font-semibold text-slate-900" {...targetProps}>
                    {s.text}
                  </span>
                  <span className="block text-sm text-slate-500">{s.translation}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-center text-sm text-slate-500">{tr('בחרו אחת, הקשיבו, ואמרו אותה בעצמכם במיקרופון.', 'Pick one, listen, then say it yourself into the microphone.')}</p>
        </div>
      </Sheet>
    </div>
  );
}

function ChatSummary({
  turns,
  earned,
  words,
  corrections,
  topic,
  onAgain,
  onExit,
}: {
  turns: number;
  earned: number;
  words: ChatPair[];
  corrections: Correction[];
  topic: ChatTopic;
  onAgain: () => void;
  onExit: () => void;
}) {
  const { tr, lang } = useLang();
  const { addCustomItem, state } = useProgress();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const name = partnerName(lang);
  const inDictionary = (text: string) => added.has(text) || state.customItems.some((i) => i.polish.toLowerCase() === text.toLowerCase());

  return (
    <div className="pt-safe fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-50" role="dialog" aria-modal="true" aria-label={tr('סיכום השיחה', 'Conversation summary')} data-testid="chat-summary">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 px-4 pt-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-amber-50 ring-8 ring-amber-50/60">
            <img src={pictureUrl(TOPIC_PICTURE[topic])} alt="" className="size-12" />
          </span>
          <h2 className="mt-2 text-2xl font-black text-slate-900">{turns >= 2 ? tr('שיחה מצוינת!', 'Great conversation!') : tr('השיחה נגמרה', 'Conversation finished')}</h2>
          <p className="text-slate-600">
            {turns === 1 ? tr(`תור אחד עם ${name}`, `One turn with ${name}`) : tr(`${turns} תורות עם ${name}`, `${turns} turns with ${name}`)}
            {earned > 0 && (
              <>
                {' · '}
                <span dir="ltr">+{earned} XP</span>
              </>
            )}
          </p>
        </div>

        {words.length > 0 && (
          <section className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80" data-testid="chat-words">
            <h3 className="font-bold text-slate-900">{tr('מילים חדשות מהשיחה', 'New words from the conversation')}</h3>
            <ul className="space-y-1.5">
              {words.map((w) => (
                <li key={w.text} className="flex items-center gap-2">
                  <button type="button" onClick={() => speak(w.text)} className="grid size-9 shrink-0 place-items-center rounded-full text-brand-600 hover:bg-brand-50" aria-label={tr('השמעה', 'Play')}>
                    <Volume2 className="size-4" />
                  </button>
                  <span className="min-w-0 flex-1">
                    <span className="polish font-semibold text-slate-900" {...targetProps}>
                      {w.text}
                    </span>{' '}
                    <span className="text-sm text-slate-500">– {w.translation}</span>
                  </span>
                  {inDictionary(w.text) ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="size-4" aria-hidden /> {tr('במילון', 'Saved')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addCustomItem(makeCustomItem(w.text, w.translation, lang));
                        setAdded((a) => new Set(a).add(w.text));
                      }}
                      className="min-h-10 shrink-0 rounded-xl bg-brand-50 px-3 text-sm font-semibold text-brand-700"
                    >
                      {tr('למילון', 'To my words')}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80" data-testid="chat-corrections">
          <h3 className="font-bold text-slate-900">{tr('מה אפשר לומר אחרת', 'What you could say differently')}</h3>
          {corrections.length === 0 ? (
            <p className="text-sm text-emerald-700">{tr('כל המשפטים שלכם היו נכונים.', 'All your sentences were right.')}</p>
          ) : (
            <ul className="space-y-2">
              {corrections.map((c, i) => (
                <li key={i} className="rounded-xl bg-amber-50 p-2.5 text-sm leading-relaxed text-amber-950">
                  <span className="polish block" {...targetProps}>
                    <s className="opacity-70">{c.said}</s>
                  </span>
                  <span className="polish block font-semibold" {...targetProps}>
                    {c.better}
                  </span>
                  {c.note && <span className="block text-amber-900">{c.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="sticky bottom-0 mt-auto -mx-4 space-y-2 bg-linear-to-t from-slate-50 from-65% to-transparent px-4 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onAgain} className="w-full rounded-2xl bg-brand-600 py-4 font-bold text-white shadow-md">
            {tr('שיחה נוספת', 'Another conversation')}
          </button>
          <button type="button" onClick={onExit} className="min-h-12 w-full rounded-2xl font-semibold text-slate-600 hover:bg-white">
            {tr('סיום', 'Finish')}
          </button>
        </div>
      </div>
    </div>
  );
}
