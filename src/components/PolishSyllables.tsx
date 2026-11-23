import { COURSE_INFO as C } from '../lib/course';
import { parseSyllables } from '../lib/syllables';

const SIZES = {
  xl: 'font-serif font-medium text-4xl sm:text-5xl',
  lg: 'font-serif font-medium text-3xl sm:text-4xl',
  md: 'font-serif font-medium text-2xl',
  sm: 'font-semibold text-lg',
} as const;

const STRESS_UNDERLINE = 'text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-[0.22em]';

interface Props {
  notation: string;
  size?: keyof typeof SIZES;
  /** Show the "·" separators between syllables. */
  showDots?: boolean;
  className?: string;
}

/**
 * Course-language text in its own direction, with the stressed syllable painted in the accent color
 * (underlined too, except in vocalized Hebrew, where the line would cut through the niqqud).
 */
export function PolishSyllables({ notation, size = 'lg', showDots = true, className = '' }: Props) {
  const words = parseSyllables(notation);
  return (
    <p dir={C.dir} lang={C.htmlLang} className={`polish leading-snug text-slate-900 ${SIZES[size]} ${className}`}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.map((syl, si) => (
            <span key={si}>
              {si > 0 && showDots && <span className="mx-[0.06em] text-slate-300">·</span>}
              <span
                className={syl.stressed ? (C.dir === 'rtl' ? 'text-brand-700' : STRESS_UNDERLINE) : ''}
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
