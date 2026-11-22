import { COURSE_INFO as C } from '../lib/course';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { AlertTriangle, Check, ChevronDown, Cloud, CloudDownload, KeyRound, Loader2, Play, Sparkles, Trash2 } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { ttsSupported } from '../lib/env';
import {
  AZURE_REGIONS,
  clearCloudCache,
  cloudStatus,
  getCloudConfig,
  maskedKey,
  setCloudConfig,
  subscribeCloudVoice,
  testCloudConfig,
} from '../lib/cloudVoice';
import { getPreferredVoiceURI, polishVoices, setPreferredVoiceURI, speak, stopSpeaking, voiceRank } from '../lib/tts';
import { cacheAllClips, clipCount, naturalVoiceEnabled, playClip, setNaturalVoiceEnabled, subscribeManifest, type ClipVoice } from '../lib/voiceClips';

const SAMPLE = C.voiceSample;
const TEACHER = `${C.clipPrefix}-f` as ClipVoice;

/** Snapshot of the stored cloud voice: "<region>|<masked key>|<status>", or "||<status>" when none. */
function cloudSnapshot(): string {
  const c = getCloudConfig();
  return `${c?.region ?? ''}|${c ? maskedKey(c.key) : ''}|${cloudStatus()}`;
}

/** Teacher voice: natural voice (recorded clips + live cloud voice) and the device voice used as fallback. */
export function VoiceSettings() {
  const { tr } = useLang();
  // Re-render when the clip manifest arrives or the preference changes.
  const snapshot = useSyncExternalStore(subscribeManifest, () => `${clipCount()}|${naturalVoiceEnabled()}`);
  const [count, natural] = [Number(snapshot.split('|')[0]), snapshot.endsWith('true')];
  const cloud = useSyncExternalStore(subscribeCloudVoice, cloudSnapshot);
  const cloudOn = !cloud.startsWith('|');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => polishVoices());
  const [chosen, setChosen] = useState<string | null>(() => getPreferredVoiceURI());
  const [offline, setOffline] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    if (!ttsSupported) return;
    const update = () => setVoices(polishVoices());
    window.speechSynthesis.addEventListener('voiceschanged', update);
    update();
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);

  const pickDevice = (uri: string | null) => {
    setPreferredVoiceURI(uri);
    setChosen(uri);
    // Preview through the device voice even when the natural voice is on.
    const prev = naturalVoiceEnabled();
    if (prev) setNaturalVoiceEnabled(false);
    speak(SAMPLE).finally(() => prev && setNaturalVoiceEnabled(true));
  };

  const saveOffline = async () => {
    setOffline({ done: 0, total: 1 });
    await cacheAllClips((done, total) => setOffline({ done, total }));
  };

  const quality = (v: SpeechSynthesisVoice) =>
    voiceRank(v) <= 1 ? tr('טבעי', 'Natural') : voiceRank(v) <= 3 ? tr('רשת', 'Online') : tr('בסיסי', 'Basic');

  const names = `${C.voiceNames.f} ${tr('ו-', 'and ')}${C.voiceNames.m}`;
  const naturalNote =
    count > 0
      ? cloudOn
        ? tr(`${count} הקלטות בקול נוירוני (${names}); כל השאר נקרא בזמן אמת בקול הענן.`, `${count} neural recordings (${names}); everything else is read live by the cloud voice.`)
        : tr(
            `${count} הקלטות בקול נוירוני איכותי (${names}). מה שלא הוקלט – למשל השם שלכם – נקרא בקול המכשיר.`,
            `${count} high-quality neural recordings (${names}). Anything not recorded – like your own name – uses the device voice.`,
          )
      : cloudOn
        ? tr(`קול הענן (${names}) מקריא הכול בזמן אמת.`, `The cloud voice (${names}) reads everything live.`)
        : tr('ההקלטות עדיין לא זמינות. אפשר לחבר קול ענן טבעי למטה; בינתיים משתמשים בקול המכשיר.', 'Recordings are not available yet. Connect a natural cloud voice below; meanwhile the device voice is used.');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="size-4 text-brand-600" /> {tr('קול טבעי', 'Natural voice')}
            </span>
            <span className="block text-xs text-slate-500">{naturalNote}</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={natural}
            disabled={count === 0 && !cloudOn}
            onChange={(e) => {
              stopSpeaking();
              setNaturalVoiceEnabled(e.target.checked);
            }}
            aria-label={tr('קול טבעי', 'Natural voice')}
            className="mt-1 size-6 shrink-0 accent-brand-600"
            data-testid="natural-voice"
          />
        </label>
        {(count > 0 || cloudOn) && natural && (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => speak(SAMPLE)} className="btn-secondary">
              <Play className="size-4" /> {tr('השמע דוגמה', 'Play a sample')}
            </button>
            {count > 0 && (
              <button type="button" onClick={saveOffline} disabled={!!offline && offline.done < offline.total} className="btn-secondary">
                <CloudDownload className="size-4" />
                {offline
                  ? offline.done >= offline.total
                    ? tr('נשמר לשימוש בלי אינטרנט', 'Saved for offline use')
                    : `${Math.round((offline.done / offline.total) * 100)}%`
                  : tr('שמור את הקול לשימוש בלי אינטרנט', 'Save the voice for offline use')}
              </button>
            )}
          </div>
        )}
      </div>

      <CloudVoiceSettings snapshot={cloud} />

      <div className="space-y-2 border-t border-slate-200 pt-3">
        <p className="font-semibold">{tr('קול המכשיר (גיבוי)', 'Device voice (fallback)')}</p>
        {voices.length === 0 ? (
          <p className="text-xs text-slate-500">
            {C.id === 'cnr'
              ? tr(
                  'לא נמצא במכשיר קול בוסני, קרואטי או סרבי. ב-Edge יש קולות "Natural" איכותיים בחינם; באנדרואיד: הגדרות ← המרת טקסט לדיבור ← קרואטית או סרבית; ב-iPhone: נגישות ← תוכן מוקרא ← קולות ← קרואטית.',
                  'No Bosnian, Croatian or Serbian device voice found. Edge offers free high-quality "Natural" voices; Android: Settings → Text-to-speech → Croatian or Serbian; iPhone: Accessibility → Spoken Content → Voices → Croatian.',
                )
              : tr(
                  'לא נמצא קול פולני במכשיר. ב-Edge יש קולות "Natural" איכותיים בחינם; באנדרואיד: הגדרות ← המרת טקסט לדיבור ← פולנית; ב-iPhone: נגישות ← תוכן מוקרא ← קולות ← פולנית ← Zosia (משופר).',
                  'No Polish device voice found. Edge offers free high-quality "Natural" voices; Android: Settings → Text-to-speech → Polish; iPhone: Accessibility → Spoken Content → Voices → Polish → Zosia (Enhanced).',
                )}
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200" role="radiogroup" aria-label={tr('קול המכשיר', 'Device voice')}>
            {[null, ...voices].map((v) => {
              const uri = v?.voiceURI ?? null;
              const active = chosen === uri || (!chosen && !uri);
              return (
                <li key={uri ?? 'auto'}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => pickDevice(uri)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-start text-sm ${active ? 'bg-slate-100' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>
                      {active && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{v ? v.name : tr('אוטומטי – הקול הטוב ביותר שנמצא', 'Automatic – best voice found')}</span>
                    {v && <span className="shrink-0 text-[11px] font-medium text-slate-500">{quality(v)}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

type CloudError = 'empty' | 'bad-key' | 'bad-region' | 'network';

/** An English label from the Azure portal, kept in one left-to-right piece inside Hebrew text. */
function Ui({ children }: { children: string }) {
  return (
    <bdi dir="ltr" className="font-semibold whitespace-nowrap text-slate-900">
      {children}
    </bdi>
  );
}

function PortalLink() {
  return (
    <a href="https://portal.azure.com" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline" dir="ltr">
      portal.azure.com
    </a>
  );
}

/**
 * Live cloud voice: the learner's own free Azure Speech key, kept only on this device.
 * Saving first synthesizes the sample phrase with the key, so a wrong key or region is caught at once.
 */
function CloudVoiceSettings({ snapshot }: { snapshot: string }) {
  const { tr, lang } = useLang();
  const [region, masked, status] = snapshot.split('|');
  const configured = region !== '';
  const [editing, setEditing] = useState(false);
  const [key, setKey] = useState('');
  const [reg, setReg] = useState<string>(region || 'westeurope');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CloudError | null>(null);
  const [help, setHelp] = useState(false);

  const save = async () => {
    if (!key.trim()) {
      setError('empty');
      return;
    }
    stopSpeaking();
    setBusy(true);
    setError(null);
    const res = await testCloudConfig({ key, region: reg }, SAMPLE, TEACHER);
    setBusy(false);
    if (!res.ok) {
      setError(res.reason);
      return;
    }
    setCloudConfig({ key, region: reg });
    setKey('');
    setEditing(false);
    const url = URL.createObjectURL(res.blob);
    void playClip(url).finally(() => setTimeout(() => URL.revokeObjectURL(url), 1000));
  };

  const remove = async () => {
    stopSpeaking();
    setCloudConfig(null);
    setEditing(false);
    setError(null);
    await clearCloudCache();
  };

  const errorText: Record<CloudError, string> = {
    empty: tr('הדביקו את המפתח (KEY 1) מ-Azure.', 'Paste the key (KEY 1) from Azure.'),
    'bad-key': tr('Azure דחה את המפתח. בדקו שהעתקתם את KEY 1 במלואו ושהאזור זהה לאזור של המשאב.', 'Azure rejected the key. Check that you copied all of KEY 1 and that the region matches the resource.'),
    'bad-region': tr('האזור לא תקין.', 'The region is not valid.'),
    network: tr('אין תשובה מ-Azure – בדקו את החיבור לאינטרנט ואת האזור, ונסו שוב.', 'No answer from Azure – check the internet connection and the region, then try again.'),
  };

  const showForm = !configured || editing;

  return (
    <div className="space-y-2 border-t border-slate-200 pt-3" data-testid="cloud-voice">
      <div>
        <p className="flex items-center gap-1.5 font-semibold">
          <Cloud className="size-4 text-brand-600" /> {tr('קול ענן טבעי (Azure)', 'Natural cloud voice (Azure)')}
        </p>
        <p className="text-xs text-slate-500">
          {tr(
            `קול נוירוני אנושי (${C.voiceNames.f} ו-${C.voiceNames.m}, ${C.voiceNames.he}) לכל משפט – גם מה שמקלידים ב"איך אומרים?". המפתח נשמר רק במכשיר הזה, נשלח רק ל-Microsoft ולא נכלל בקובץ הגיבוי.`,
            `A human-sounding neural voice (${C.voiceNames.f} and ${C.voiceNames.m}, ${C.voiceNames.en}) for every phrase – including what you type in "How do I say?". The key stays on this device, is sent only to Microsoft and is not part of the backup file.`,
          )}
        </p>
      </div>

      {configured && !editing && (
        <div className="space-y-2">
          {status === 'bad-key' ? (
            <p className="flex items-start gap-1.5 text-xs font-medium text-rose-700" role="alert">
              <AlertTriangle className="mt-px size-4 shrink-0" /> {tr('Azure דחה את המפתח השמור – הדביקו מפתח חדש.', 'Azure rejected the stored key – paste a new one.')}
            </p>
          ) : status === 'error' ? (
            <p className="flex items-start gap-1.5 text-xs font-medium text-amber-700">
              <AlertTriangle className="mt-px size-4 shrink-0" /> {tr('Azure לא ענה בפעם האחרונה (אין אינטרנט?) – בינתיים משתמשים בקול המכשיר.', 'Azure did not answer last time (offline?) – the device voice is used meanwhile.')}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700" data-testid="cloud-connected">
              <Check className="size-4 shrink-0" /> {tr('מחובר', 'Connected')} · <span dir="ltr">{region}</span> · <span dir="ltr" className="font-mono">{masked}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => speak(SAMPLE)} className="btn-secondary">
              <Play className="size-4" /> {tr('השמע דוגמה', 'Play a sample')}
            </button>
            <button
              type="button"
              onClick={() => {
                setReg(region);
                setEditing(true);
              }}
              className="btn-secondary"
            >
              <KeyRound className="size-4" /> {tr('החלף מפתח', 'Change key')}
            </button>
            <button type="button" onClick={remove} className="btn-secondary text-rose-700">
              <Trash2 className="size-4" /> {tr('הסר', 'Remove')}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-800">{tr('מפתח (KEY 1)', 'Key (KEY 1)')}</span>
            <input
              type="text"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError(null);
              }}
              dir="ltr"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              data-1p-ignore
              data-lpignore="true"
              placeholder={tr('הדביקו כאן את המפתח', 'Paste the key here')}
              className="w-full rounded-xl bg-white px-3 py-2.5 font-mono text-sm ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand-500"
              data-testid="cloud-key"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-800">{tr('אזור (Location / Region)', 'Region (Location / Region)')}</span>
            <select
              value={reg}
              onChange={(e) => setReg(e.target.value)}
              dir="ltr"
              className="w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand-500"
              data-testid="cloud-region"
            >
              {AZURE_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p className="flex items-start gap-1.5 text-xs font-medium text-rose-700" role="alert">
              <AlertTriangle className="mt-px size-4 shrink-0" /> {errorText[error]}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} {tr('שמור ובדוק', 'Save and test')}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                {tr('ביטול', 'Cancel')}
              </button>
            )}
          </div>
        </form>
      )}

      <button
        type="button"
        onClick={() => setHelp((h) => !h)}
        aria-expanded={help}
        className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
      >
        <ChevronDown className={`size-4 transition-transform ${help ? 'rotate-180' : ''}`} /> {tr('איך משיגים מפתח חינמי? (כ-5 דקות)', 'How do I get a free key? (about 5 minutes)')}
      </button>
      {help && (
        <ol className="list-decimal space-y-1.5 rounded-xl bg-slate-50 p-3 ps-7 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200">
          {lang === 'he' ? (
            <>
              <li>
                היכנסו ל-<PortalLink /> והתחברו או צרו חשבון Microsoft. ייתכן שתתבקשו כרטיס אשראי לאימות זהות; בדרגה החינמית <Ui>F0</Ui> אין חיוב.
              </li>
              <li>
                לחצו <Ui>Create a resource</Ui>, חפשו <Ui>Speech</Ui> ולחצו <Ui>Create</Ui>.
              </li>
              <li>
                מלאו: <Ui>Resource group</Ui> – חדש (למשל learn), <Ui>Region</Ui> – <Ui>West Europe</Ui>, <Ui>Name</Ui> – כל שם, <Ui>Pricing tier</Ui> – <Ui>Free F0</Ui>. ואז{' '}
                <Ui>Review + create</Ui> ואחריו <Ui>Create</Ui>.
              </li>
              <li>
                בסיום לחצו <Ui>Go to resource</Ui>, ואז <Ui>Keys and Endpoint</Ui>, והעתיקו את <Ui>KEY 1</Ui>.
              </li>
              <li>
                הדביקו כאן, בחרו את האזור שמופיע תחת <Ui>Location/Region</Ui> (עבור West Europe זה <Ui>westeurope</Ui>) ולחצו "שמור ובדוק".
              </li>
            </>
          ) : (
            <>
              <li>
                Go to <PortalLink /> and sign in or create a Microsoft account. You may be asked for a card to verify your identity; the free <Ui>F0</Ui> tier is never charged.
              </li>
              <li>
                Click <Ui>Create a resource</Ui>, search for <Ui>Speech</Ui> and click <Ui>Create</Ui>.
              </li>
              <li>
                Fill in: <Ui>Resource group</Ui> – a new one (e.g. learn), <Ui>Region</Ui> – <Ui>West Europe</Ui>, <Ui>Name</Ui> – any name, <Ui>Pricing tier</Ui> – <Ui>Free F0</Ui>. Then{' '}
                <Ui>Review + create</Ui> and <Ui>Create</Ui>.
              </li>
              <li>
                When it is done, click <Ui>Go to resource</Ui>, then <Ui>Keys and Endpoint</Ui>, and copy <Ui>KEY 1</Ui>.
              </li>
              <li>
                Paste it here, pick the region shown under <Ui>Location/Region</Ui> (West Europe is <Ui>westeurope</Ui>) and tap "Save and test".
              </li>
            </>
          )}
        </ol>
      )}
    </div>
  );
}
