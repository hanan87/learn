import { COURSE_INFO as C } from '../lib/course';
import { parseSyllables } from '../lib/syllables';

const SIZES = {
  xl: 'font-serif font-medium text-4xl sm:text-5xl',
  lg: 'font-serif font-medium text-3xl sm:text-4xl',
  md: 'font-serif font-medium text-2xl',
  sm: 'font-semibold text-lg',
} as const;

interface Props {
  notation: string;
  size?: keyof typeof SIZES;
  /** Show the "·" separators between syllables. */
  showDots?: boolean;
  className?: string;
}

/** Polish text rendered LTR, with the stressed syllable painted in the accent color. */
export function PolishSyllables({ notation, size = 'lg', showDots = true, className = '' }: Props) {
  const words = parseSyllables(notation);
  return (
    <p dir="ltr" lang={C.htmlLang} className={`polish leading-snug text-slate-900 ${SIZES[size]} ${className}`}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.map((syl, si) => (
            <span key={si}>
              {si > 0 && showDots && <span className="mx-[0.06em] text-slate-300">·</span>}
              <span
                className={
                  syl.stressed ? 'text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-[0.22em]' : ''
                }
              >
                {syl.text}
              </span>
            </span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </p>
  );
}
