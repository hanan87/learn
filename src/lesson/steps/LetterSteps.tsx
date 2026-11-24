import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { getItem } from '../../data';
import { getLetter } from '../../data/he/alphabet';
import { itemText } from '../../data/types';
import { HighlightedWord, LetterExample, letterName, letterSound, letterTip, TipText } from '../../components/AlefBet';
import { Phonetic } from '../../components/Phonetic';
import { PolishSyllables } from '../../components/PolishSyllables';
import { useLang } from '../../i18n/LangContext';
import { speak } from '../../lib/tts';
import { useProgress } from '../../state/ProgressContext';
import type { LessonStep } from '../buildLesson';
import type { StepProps } from '../types';
import { ListenButtons } from './ListenSteps';

/** Alef-Bet steps (Hebrew course): meet a letter, name its sound, read a word, find a word by ear. */

const optionClass = (right: boolean, picked: boolean) =>
  `rounded-2xl px-4 py-3.5 ring-2 transition active:scale-[0.99] ${right ? 'bg-emerald-50 ring-emerald-500' : picked ? 'animate-shake bg-rose-50 ring-rose-400' : 'bg-white ring-slate-200'}`;

type LearnLetter = Extract<LessonStep, { kind: 'letter-learn' }>;

/** A new letter or vowel sign: the shape, its name and sound, how to read it and a word that has it. */
export function LetterLearnStep({ step, answered, onAnswered }: StepProps<LearnLetter>) {
  const letter = getLetter(step.letterId)!;
  const { tr, lang } = useLang();
  const name = letterName(letter, lang);

  useEffect(() => {
    const t = setTimeout(() => speak(letter.example), 450);
    return () => clearTimeout(t);
  }, [letter.example]);

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200/80" data-testid="letter-card">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{letter.kind === 'vowel' ? tr('סימן ניקוד', 'Vowel sign') : tr('אות', 'Letter')}</p>
        <p lang="he" dir="rtl" className="polish text-7xl leading-tight font-semibold text-slate-900">
          {letter.glyph}
        </p>
        {name && (
          <button
            type="button"
            onClick={() => letter.nameHe && speak(letter.nameHe)}
            className="mx-auto flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
            aria-label={`${tr('השמע את שם האות', 'Play the name of the letter')}: ${name}`}
          >
            <Volume2 className="size-4" aria-hidden /> {tr('שם', 'Name')}: <strong>{name}</strong>
          </button>
        )}
        <p className="text-slate-600">
          {tr('צליל', 'Sound')}:{' '}
          <span className={`font-mono font-bold text-brand-700 ${letter.sound ? 'text-3xl' : 'text-xl'}`} data-testid="letter-sound">
            {letterSound(letter, lang)}
          </span>
        </p>
        <p className="text-start text-[15px] leading-relaxed text-slate-700">
          <TipText text={letterTip(letter, lang)} />
        </p>
      </div>
      <LetterExample letter={letter} />
      {!answered && (
        <button
          type="button"
          onClick={() => onAnswered({ correct: null, tone: 'neutral', title: '' })}
          className="w-full rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-md active:scale-[0.98]"
        >
          {tr('הבנתי, המשך', 'Got it, continue')}
        </button>
      )}
    </div>
  );
}

type SoundQuiz = Extract<LessonStep, { kind: 'letter-sound' }>;

/** See a letter, pick its sound. */
export function LetterSoundStep({ step, answered, onAnswered }: StepProps<SoundQuiz>) {
  const letter = getLetter(step.letterId)!;
  const { tr, lang } = useLang();
  const { recordExercise } = useProgress();
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (id: string) => {
    if (answered) return;
    setPicked(id);
    const ok = getLetter(id)?.sound === letter.sound;
    recordExercise(undefined, letter.example, ok);
    speak(letter.example);
    onAnswered({
      correct: ok,
      tone: ok ? 'success' : 'error',
      title: ok ? tr('נכון!', 'Correct!') : tr('לא בדיוק', 'Not quite'),
      detail: (
        <div className="space-y-2">
          <p className="text-base">
            <span lang="he" dir="rtl" className="polish text-2xl font-semibold">
              {letter.glyph}
            </span>{' '}
            = <strong className="font-mono">{letterSound(letter, lang)}</strong>
          </p>
          <p>
            <TipText text={letterTip(letter, lang)} />
          </p>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{letter.kind === 'vowel' ? tr('איזה צליל עושה הסימן הזה?', 'What sound does this sign make?') : tr('איזה צליל עושה האות הזאת?', 'What sound does this letter make?')}</h2>
      <p lang="he" dir="rtl" className="polish py-2 text-center text-8xl leading-tight font-semibold text-slate-900" data-testid="quiz-glyph">
        {letter.glyph}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {step.optionIds.map((id) => {
          const opt = getLetter(id);
          if (!opt) return null;
          return (
            <button
              key={id}
              type="button"
              disabled={answered}
              onClick={() => choose(id)}
              data-correct={opt.sound === letter.sound || undefined}
              className={`${optionClass(answered && opt.sound === letter.sound, picked === id)} font-mono text-2xl font-bold`}
            >
              {letterSound(opt, lang)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ReadQuiz = Extract<LessonStep, { kind: 'read-word' }>;

/** See a vocalized word with no help, pick how it is read. */
export function ReadWordStep({ step, answered, onAnswered }: StepProps<ReadQuiz>) {
  const item = getItem(step.itemId)!;
  const { tr, lang } = useLang();
  const { recordExercise } = useProgress();
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (opt: string) => {
    if (answered) return;
    setPicked(opt);
    const ok = opt === item.phoneticHebrew;
    recordExercise(item.id, item.polish, ok);
    speak(item.polish);
    onAnswered({
      correct: ok,
      tone: ok ? 'success' : 'error',
      title: ok ? tr('קריאה מדויקת!', 'Accurate reading!') : tr('לא בדיוק', 'Not quite'),
      detail: (
        <div className="space-y-1">
          <PolishSyllables notation={item.syllablesPolish} size="sm" />
          <Phonetic he={item.phoneticHebrew} en={item.phoneticEnglish} size="sm" />
          <p>{itemText(item, lang).meaning}</p>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{tr('איך קוראים את המילה הזאת?', 'How do you read this word?')}</h2>
      <p className="py-3 text-center" data-testid="read-word">
        <HighlightedWord word={item.polish} className="text-6xl leading-tight font-semibold text-slate-900" />
      </p>
      <div className="grid gap-2">
        {step.options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={answered}
            onClick={() => choose(opt)}
            data-correct={opt === item.phoneticHebrew || undefined}
            className={`${optionClass(answered && opt === item.phoneticHebrew, picked === opt)} text-start`}
          >
            <Phonetic he={opt} en={opt} size="md" className="!leading-snug" />
          </button>
        ))}
      </div>
    </div>
  );
}

type HearQuiz = Extract<LessonStep, { kind: 'hear-word' }>;

/** Hear a word, find it among written words. */
export function HearWordStep({ step, answered, onAnswered }: StepProps<HearQuiz>) {
  const item = getItem(step.itemId)!;
  const { tr, lang } = useLang();
  const { recordExercise } = useProgress();
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (id: string) => {
    if (answered) return;
    setPicked(id);
    const ok = id === item.id;
    recordExercise(item.id, item.polish, ok);
    onAnswered({
      correct: ok,
      tone: ok ? 'success' : 'error',
      title: ok ? tr('נכון!', 'Correct!') : tr('לא בדיוק', 'Not quite'),
      detail: (
        <div className="space-y-1">
          <PolishSyllables notation={item.syllablesPolish} size="sm" />
          <Phonetic he={item.phoneticHebrew} en={item.phoneticEnglish} size="sm" />
          <p>{itemText(item, lang).meaning}</p>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{tr('איזו מילה שמעתם?', 'Which word did you hear?')}</h2>
      <ListenButtons text={item.polish} />
      <div className="grid grid-cols-2 gap-3">
        {step.optionIds.map((id) => {
          const opt = getItem(id);
          if (!opt) return null;
          return (
            <button
              key={id}
              type="button"
              disabled={answered}
              onClick={() => choose(id)}
              data-correct={id === item.id || undefined}
              className={`${optionClass(answered && id === item.id, picked === id)} text-center`}
            >
              <HighlightedWord word={opt.polish} className="text-4xl leading-tight font-semibold text-slate-900" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
