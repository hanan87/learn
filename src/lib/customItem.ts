import type { LearningItem } from '../data/types';
import type { Lang } from '../i18n/lang';
import { autoBackchain, autoTip, toEnglishPhonetic, toHebrewPhonetic, toSyllableNotation } from './phonetics';

/**
 * A personal-dictionary item from a phrase and its meaning in the interface language, with the
 * syllables, transcriptions, tips and backchaining generated as in "Add my own word".
 */
export function makeCustomItem(text: string, meaning: string, lang: Lang): LearningItem {
  const latin = lang === 'pl' || lang === 'cnr';
  return {
    id: `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    polish: text,
    syllablesPolish: toSyllableNotation(text),
    hebrew: meaning,
    english: meaning,
    phoneticHebrew: toHebrewPhonetic(text),
    phoneticEnglish: toEnglishPhonetic(text),
    articulationTip: autoTip(text, 'he'),
    articulationTipEn: autoTip(text, 'en'),
    loc: latin ? { [lang]: { meaning, tip: autoTip(text, lang) } } : undefined,
    backchainingSteps: autoBackchain(text),
    formality: 'neutral',
    custom: true,
  };
}
