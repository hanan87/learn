import { COURSE_INFO as C } from './lib/course';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Info } from 'lucide-react';
import { clipCount, subscribeManifest } from './lib/voiceClips';
import { cloudConfigured, subscribeCloudVoice } from './lib/cloudVoice';
import { getItem, UNITS } from './data';
import { Certificate } from './components/Certificate';
import { BottomNav, TABS, type TabId } from './components/BottomNav';
import { ItemDetail } from './components/ItemDetail';
import { Sheet } from './components/Sheet';
import { StandaloneDownload } from './components/StandaloneDownload';
import { TopBar } from './components/TopBar';
import { useHashRoute } from './hooks/useHashRoute';
import { useLang } from './i18n/LangContext';
import { LessonPlayer } from './lesson/LessonPlayer';
import { PlacementTest } from './lesson/PlacementTest';
import { ttsSupported } from './lib/env';
import { hasPolishVoice, loadVoices } from './lib/tts';
import { useMic } from './state/MicContext';
import { useProgress } from './state/ProgressContext';
import { CourseMap } from './views/CourseMap';
import { Roleplay } from './views/Roleplay';
import { Settings } from './views/Settings';
import { SoundLab } from './views/SoundLab';
import { VocabReview } from './views/VocabReview';
import { Welcome } from './views/Welcome';
import { HandsFree } from './views/HandsFree';
import { SpeedBlitz } from './views/SpeedBlitz';
import { SayIt } from './views/SayIt';
import { StoryPlayer } from './views/StoryPlayer';
import { getStory } from './data/stories';
import { Review } from './views/Review';
import { ProgressPage } from './views/Progress';

const TAB_IDS = TABS.map((t) => t.id);

/**
 * Routes:
 *   #/map | #/lab | #/say | #/vocab | #/talk  – tabs (say: "How do I say…?" translate, listen, repeat)
 *   #/<tab>/item/<itemId>                      – item sheet on top of a tab
 *   #/<tab>/settings                           – settings sheet
 *   #/<tab>/progress                           – my progress (streak, calendar, skills, can-do, certificates, reminder)
 *   #/<tab>/certificate/<unitId>               – the certificate of a passed unit test
 *   #/lab/group/<groupId>                      – Sound Lab opened on a contrast group
 *   #/lesson/<lessonId>                        – full-screen lesson
 *   #/lesson/practice                          – personalized reinforcement lesson
 *   #/lesson/test-<unitId>                     – end-of-unit test (intro, questions, result and certificate)
 *   #/handsfree/<map|vocab>                    – audio-only trainer
 *   #/story/<storyId>                          – mini story
 *   #/blitz                                    – 60-second Speed Blitz
 *   #/placement                                – placement test (English course): where to start
 *   #/review[/<pl|cnr>[/<sectionId>]]          – native-speaker review of the Polish / Montenegrin texts
 */
export function App() {
  const { segments, navigate } = useHashRoute('map');
  const {
    dueItemIds,
    state: { tests },
  } = useProgress();
  const { unset, tr, loc } = useLang();
  const mic = useMic();
  const [voiceMissing, setVoiceMissing] = useState(false);
  const clips = useSyncExternalStore(subscribeManifest, () => clipCount(C.clipPrefix));
  const cloud = useSyncExternalStore(subscribeCloudVoice, cloudConfigured);

  useEffect(() => {
    if (!ttsSupported) return;
    loadVoices(2500).then(() => setVoiceMissing(!hasPolishVoice()));
  }, []);

  // The native-speaker review is opened from a shared link, before (or without) choosing a course.
  if (segments[0] === 'review') return <Review lang={segments[1]} section={segments[2]} navigate={navigate} />;
  if (unset) return <Welcome />;

  const isLesson = segments[0] === 'lesson' && segments[1];
  const tab: TabId = (TAB_IDS as string[]).includes(segments[0]) ? (segments[0] as TabId) : 'map';
  const itemId = segments[1] === 'item' ? segments[2] : undefined;
  const item = itemId ? getItem(itemId) : undefined;
  const settingsOpen = segments[1] === 'settings';
  const progressOpen = segments[1] === 'progress';
  const certUnit = segments[1] === 'certificate' ? UNITS.find((u) => u.id === segments[2]) : undefined;
  const certRecord = certUnit ? tests[certUnit.id] : undefined;

  const openItem = (id: string) => navigate(`${tab}/item/${id}`);
  const closeSheet = () => navigate(tab, true);
  const tabInfo = TABS.find((t) => t.id === tab)!;

  if (segments[0] === 'handsfree') {
    const source = segments[1] === 'vocab' ? 'vocab' : 'map';
    return <HandsFree key={source} source={source} onExit={() => navigate(source, true)} />;
  }
  if (segments[0] === 'blitz') return <SpeedBlitz onExit={() => navigate('vocab', true)} />;
  if (segments[0] === 'placement') return <PlacementTest onClose={() => navigate('map', true)} onOpenLesson={(id) => navigate(`lesson/${id}`, true)} />;
  const story = segments[0] === 'story' ? getStory(segments[1] ?? '') : undefined;
  if (story) return <StoryPlayer key={story.id} story={story} onExit={() => navigate('talk', true)} />;

  if (isLesson) {
    return (
      <LessonPlayer
        key={segments[1]}
        lessonId={segments[1]}
        onClose={() => navigate(segments[1] === 'practice' ? 'vocab' : 'map', true)}
        onOpenTest={(unitId) => navigate(`lesson/test-${unitId}`, true)}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {mic.blocked && mic.status !== 'no-device' && <StandaloneDownload />}
      <TopBar title={loc(tabInfo)} onOpenSettings={() => navigate(`${tab}/settings`)} />
      {voiceMissing && clips === 0 && !cloud && (
        <div className="mx-auto mt-3 w-full max-w-3xl px-4">
          <p className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
            <Info className="mt-px size-4 shrink-0" aria-hidden />
            <span>
          {C.id === 'cnr'
            ? tr(
                'לא נמצא במכשיר קול בוסני, קרואטי או סרבי – ההקראה עשויה להישמע במבטא זר. לקול טבעי: הגדרות ← קול המורה ← קול ענן טבעי. או התקינו קול: באנדרואיד: הגדרות ← שפה ← המרת טקסט לדיבור ← קרואטית או סרבית; ב-iPhone: הגדרות ← נגישות ← תוכן מוקרא ← קולות ← קרואטית.',
                'No Bosnian, Croatian or Serbian voice was found on this device – playback may sound foreign. For a natural voice: Settings → Teacher voice → Natural cloud voice. Or install a voice: Android: Settings → Language → Text-to-speech → Croatian or Serbian; iPhone: Settings → Accessibility → Spoken Content → Voices → Croatian.',
              )
            : tr(
                `לא נמצא קול ${C.inLang.he} במכשיר – ההקראה עשויה להישמע במבטא זר. באנדרואיד: הגדרות ← שפה ← המרת טקסט לדיבור ← התקינו ${C.name.he}. ב-iPhone: הגדרות ← נגישות ← תוכן מוקרא ← קולות ← ${C.name.he}.`,
                `No ${C.name.en} voice was found on this device – playback may sound foreign. Android: Settings → Language → Text-to-speech → install ${C.name.en}. iPhone: Settings → Accessibility → Spoken Content → Voices → ${C.name.en}.`,
              )}
            </span>
          </p>
        </div>
      )}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-28">
        {tab === 'map' && <CourseMap onOpenLesson={(id) => navigate(`lesson/${id}`)} onOpenItem={openItem} onOpenHandsFree={() => navigate('handsfree/map')} onOpenProgress={() => navigate('map/progress')} onOpenCertificate={(id) => navigate(`map/certificate/${id}`)} onOpenPlacement={() => navigate('placement')} />}
        {tab === 'lab' && <SoundLab key={segments[2] ?? 'lab'} onOpenItem={openItem} initialGroup={segments[1] === 'group' ? segments[2] : undefined} />}
        {tab === 'vocab' && <VocabReview
            onOpenItem={openItem}
            onStartPractice={() => navigate('lesson/practice')}
            onOpenSoundGroup={(g) => navigate(`lab/group/${g}`)}
            onOpenHandsFree={() => navigate('handsfree/vocab')}
            onOpenBlitz={() => navigate('blitz')}
          />}
        {tab === 'say' && <SayIt onOpenItem={openItem} />}
        {tab === 'talk' && <Roleplay onOpenStory={(id) => navigate(`story/${id}`)} />}
      </main>
      <BottomNav active={tab} onChange={(t) => navigate(t)} dueCount={dueItemIds().length} />
      <Sheet open={!!item} onClose={closeSheet} title={item?.polish}>
        {item && <ItemDetail key={item.id} item={item} />}
      </Sheet>
      <Sheet open={settingsOpen} onClose={closeSheet} title={tr('הגדרות', 'Settings')}>
        <Settings />
      </Sheet>
      <Sheet open={progressOpen} onClose={closeSheet} title={tr('ההתקדמות שלי', 'My progress')}>
        <ProgressPage onOpenCertificate={(id) => navigate(`${tab}/certificate/${id}`)} />
      </Sheet>
      <Sheet open={!!certRecord?.passedAt} onClose={closeSheet} title={tr('תעודה', 'Certificate')}>
        {certUnit && certRecord?.passedAt && (
          <div className="mx-auto max-w-md pt-2">
            <Certificate unit={certUnit} score={certRecord.passScore ?? certRecord.bestScore} date={certRecord.passedAt} />
          </div>
        )}
      </Sheet>
    </div>
  );
}
