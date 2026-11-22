/** Prints the clip catalog of the course in LEARN_COURSE as JSON (used by gen-voice.ts). */
import { buildClipCatalog } from '../src/lib/clipCatalog';

process.stdout.write(JSON.stringify(buildClipCatalog()));
