import { COURSE } from './course';
import * as cnr from './cnrPhonetics';
import * as pl from './polishPhonetics';

/**
 * Phonetics of the active course (lib/polishPhonetics or lib/cnrPhonetics, same API).
 * Views and data builders import from here; tests of one language import its module directly.
 */
const impl = COURSE === 'cnr' ? cnr : pl;

export const toSyllableNotation = impl.toSyllableNotation;
export const toHebrewPhonetic = impl.toHebrewPhonetic;
export const toEnglishPhonetic = impl.toEnglishPhonetic;
export const autoBackchain = impl.autoBackchain;
export const autoTip = impl.autoTip;
export const detectSounds = impl.detectSounds;
export const letterSound = impl.letterSound;
