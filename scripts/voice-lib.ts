import { createHash } from 'node:crypto';

// The voices and SSML live in the app (lib/azureVoices) so recorded and live speech match.
export { AZURE_OUTPUT_FORMAT, AZURE_VOICES, azureTtsUrl, buildSsml, escapeXml, prosodyRate } from '../src/lib/azureVoices';

/** Stable, content-addressed file name: regenerating unchanged phrases is free. */
export function clipFileName(key: string): string {
  return createHash('sha1').update(key).digest('hex').slice(0, 16) + '.mp3';
}
