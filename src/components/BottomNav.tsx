import { AudioLines, BookOpenCheck, Languages, Map, MessagesSquare, type LucideIcon } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

export type TabId = 'map' | 'lab' | 'say' | 'vocab' | 'talk';

/** he/en name the screen (page title); the short labels fit under the icons in the bottom bar. */
export const TABS: { id: TabId; he: string; en: string; shortHe: string; shortEn: string; icon: LucideIcon }[] = [
  { id: 'map', he: 'מפת הקורס', en: 'Course map', shortHe: 'קורס', shortEn: 'Course', icon: Map },
  { id: 'lab', he: 'מעבדת צלילים', en: 'Sound lab', shortHe: 'צלילים', shortEn: 'Sounds', icon: AudioLines },
  { id: 'say', he: 'איך אומרים?', en: 'How to say', shortHe: 'איך אומרים?', shortEn: 'How to say', icon: Languages },
  { id: 'vocab', he: 'אוצר מילים וחזרה', en: 'Words & review', shortHe: 'מילים', shortEn: 'Words', icon: BookOpenCheck },
  { id: 'talk', he: 'סימולציית שיחה', en: 'Voice roleplay', shortHe: 'שיחות', shortEn: 'Talk', icon: MessagesSquare },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  dueCount: number;
}

/** Fixed bottom navigation, sized for thumb reach on phones and centered on desktop. */
export function BottomNav({ active, onChange, dueCount }: Props) {
  const { lang, tr } = useLang();
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-md" aria-label={tr('ניווט ראשי', 'Main navigation')}>
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {TABS.map(({ id, icon: Icon, ...labels }) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                title={labels[lang]}
                className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 text-xs leading-tight transition ${
                  isActive ? 'font-semibold text-brand-700' : 'font-medium text-slate-500 hover:text-slate-800'
                }`}
              >
                <span aria-hidden className={`absolute top-0 h-[3px] w-7 rounded-b-full transition ${isActive ? 'bg-brand-600' : 'bg-transparent'}`} />
                <Icon
                  className="size-[22px]"
                  aria-hidden
                  strokeWidth={isActive ? 2.1 : 1.7}
                  style={isActive ? { fill: 'currentColor', fillOpacity: 0.14 } : undefined}
                />
                <span className="text-center">
                  {lang === 'he' ? labels.shortHe : labels.shortEn}
                </span>
                {id === 'vocab' && dueCount > 0 && (
                  <span className="absolute top-1 left-1/2 ms-3 min-w-5 rounded-full bg-rose-600 px-1.5 text-[10px] leading-5 font-bold text-white ring-2 ring-white">{dueCount}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
