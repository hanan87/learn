/**
 * Shape of the English course texts for Polish and Montenegrin speakers (data/en/pl and data/en/cnr).
 * Everything is keyed by the ids and texts of the Hebrew-first course files (units, items, roleplays,
 * Sound Lab pairs and the transcription legend), and tests/unit/en.test.ts checks that nothing is
 * missing. Meanings may use the learner templates of lib/personalize: {masculine|feminine}, {name}.
 */

export interface EnLocalItem {
  /** Meaning of the phrase. */
  m: string;
  /** Pronunciation tip written for this language's speakers, with respellings in its own letters. */
  tip: string;
  /** Situation for the speak-from-memory challenge. */
  sit: string;
  note?: string;
}

export interface EnLocalRoleplay {
  title: string;
  setting: string;
  partner: string;
  /** Per turn: the partner's line, then [meaning, feedback] for each option in the order of en/dialogues. */
  turns: { line: string; options: [string, string][] }[];
}

export interface EnLocal {
  units: Record<string, { title: string; subtitle: string; description: string }>;
  items: Record<string, EnLocalItem>;
  roleplays: Record<string, EnLocalRoleplay>;
  /** Sound Lab group descriptions (side a, side b). */
  pairs: Record<string, { a: string; b: string }>;
  /** Meaning of every Sound Lab word, keyed by the English word. */
  words: Record<string, string>;
  /** Transcription legend, keyed by the legend row's spelling column. */
  legend: Record<string, { sound: string; note: string }>;
}
