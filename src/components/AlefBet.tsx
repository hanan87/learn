import { Volume2 } from 'lucide-react';
import { ALL_ITEMS } from '../data';
import { clusters, clusterShows, HE_LETTERS, soundLabel, type HeLetter } from '../data/he/alphabet';
import { itemText, type LearningItem } from '../data/types';
import type { Lang } from '../i18n/lang';
import { useLang } from '../i18n/LangContext';
import { Phonetic } from './Phonetic';
import { toEnglishPhonetic } from '../lib/hePhonetics';
import { respellHebrewLatin } from '../lib/latinRespell';
import { speak } from '../lib/tts';

/**
 * Building blocks of the Alef-Bet unit (Hebrew course): a letter's name and sound in the learner's
 * letters, a vocalized word with one letter highlighted, and the chart of all letters.
 */

const latinFor = (latin: string, lang: Lang) => (lang === 'pl' || lang === 'cnr' ? respellHebrewLatin(latin, lang) : latin);

/** The letter's name in the learner's letters: "Shin" / "Szin" / "Šin". */
export function letterName(letter: HeLetter, lang: Lang): string {
  if (!letter.nameHe) return '';
  const plain = latinFor(toEnglishPhonetic(letter.nameHe).replace(/[·[\]]/g, ''), lang);
  return plain.charAt(0).toUpperCase() + plain.slice(1);
}

export function letterSound(letter: HeLetter, lang: Lang): string {
  return letter.display ?? soundLabel(letter.sound, lang, latinFor);
}

export function letterTip(letter: HeLetter, lang: Lang): string {
  return letter.tip[lang === 'pl' || lang === 'cnr' ? lang : 'en'];
}

/**
 * A tip with its Hebrew letters set larger, so small vowel dots stay readable. Each Hebrew phrase is
 * its own right-to-left island, so punctuation between two Hebrew words keeps the sentence's order
 * ("בַּ: בַּבּוֹקֶר" does not turn into "בַּבּוֹקֶר :בַּ").
 */
export function TipText({ text, hebrewClassName = 'text-slate-900' }: { text: string; hebrewClassName?: string }) {
  return (
    <>
      {text.split(/([\u0590-\u05FF]+(?:\s+[\u0590-\u05FF]+)*)/).map((part, i) =>
        i % 2 ? (
          <bdi key={i} dir="rtl" lang="he" className={`polish px-0.5 text-[1.35em] leading-none font-semibold ${hebrewClassName}`}>
            {part}
          </bdi>
        ) : (
          part
        ),
      )}
    </>
  );
}

const strip = (t: string) => t.replace(/[^\p{L}\p{M}]/gu, '');

/** The course item spelled like an example word (every example is one of the unit's words). */
export function exampleItem(word: string): LearningItem | undefined {
  return ALL_ITEMS.find((i) => strip(i.polish) === strip(word));
}

/** A vocalized word, right to left, with the letters that show `letter` in the accent color. */
export function HighlightedWord({ word, letter, className = '' }: { word: string; letter?: HeLetter; className?: string }) {
  return (
    <span lang="he" dir="rtl" className={`polish inline-block ${className}`}>
      {clusters(word).map((c, i) => (
        <span key={i} className={letter && clusterShows(letter, c) ? 'text-brand-600' : undefined}>
          {c.text}
        </span>
      ))}
    </span>
  );
}

/** An example word with its highlighted letter, transcription, meaning and a play button. */
export function LetterExample({ letter }: { letter: HeLetter }) {
  const { tr, lang } = useLang();
  const item = exampleItem(letter.example);
  const t = item ? itemText(item, lang) : undefined;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200/80" data-testid="letter-example">
      <button
        type="button"
        onClick={() => speak(letter.example)}
        className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-sm active:scale-95"
        aria-label={tr('השמע', 'Play')}
      >
        <Volume2 className="size-6" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{tr('דוגמה', 'Example')}</p>
        {item && <Phonetic he={item.phoneticHebrew} en={item.phoneticEnglish} size="sm" className="!leading-snug" />}
        {t && <p className="text-sm text-slate-600">{t.meaning}</p>}
      </div>
      <HighlightedWord word={letter.example} letter={letter} className="text-4xl leading-tight font-semibold text-slate-900" />
    </div>
  );
}

/** Every letter and vowel sign of the course, tap to hear it in a word (shown in the Alef-Bet unit). */
export function AlefBetChart() {
  const { tr, lang } = useLang();
  return (
    <div>
      <h4 className="mb-1 text-sm font-bold text-slate-700">{tr('האותיות', 'The letters')}</h4>
      <p className="mb-2 text-xs text-slate-500">{tr('הקישו על אות כדי לשמוע אותה במילה.', 'Tap a letter to hear it in a word.')}</p>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6" data-testid="alefbet-chart">
        {HE_LETTERS.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              onClick={() => speak(l.example)}
              className="flex w-full flex-col items-center gap-0.5 rounded-xl bg-slate-50 px-1 py-2 ring-1 ring-slate-200/70 transition hover:bg-white active:scale-95"
              aria-label={`${l.glyph} – ${letterSound(l, lang)}`}
            >
              <span lang="he" dir="rtl" className="polish text-2xl leading-tight font-semibold text-slate-900">
                {l.glyph}
              </span>
              <span className="font-mono text-xs text-brand-700">{letterSound(l, lang)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
