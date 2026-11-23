import { COURSE } from './course';
import * as cnr from './cnrPhonetics';
import * as en from './enPhonetics';
import * as he from './hePhonetics';
import * as pl from './polishPhonetics';

/**
 * Phonetics of the active course (lib/polishPhonetics, cnrPhonetics, enPhonetics or hePhonetics, same API).
 * Views and data builders import from here; tests of one language import its module directly.
 */
const impl = { pl, cnr, en, he }[COURSE];

export const toSyllableNotation = impl.toSyllableNotation;
export const toHebrewPhonetic = impl.toHebrewPhonetic;
export const toEnglishPhonetic = impl.toEnglishPhonetic;
export const autoBackchain = impl.autoBackchain;
export const autoTip = impl.autoTip;
export const detectSounds = impl.detectSounds;
export const letterSound = impl.letterSound;
