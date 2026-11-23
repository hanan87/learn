import type { ClipSpeed, ClipVoice } from './voiceClips';

/**
 * Azure AI Speech neural voices – shared by the clip generator (scripts/gen-voice.ts) and the live
 * cloud voice (lib/cloudVoice), so a phrase sounds the same whether it was recorded or synthesized now.
 */
export const AZURE_VOICES: Record<ClipVoice, { locale: string; name: string }> = {
  'pl-f': { locale: 'pl-PL', name: 'pl-PL-ZofiaNeural' },
  'pl-m': { locale: 'pl-PL', name: 'pl-PL-MarekNeural' },
  // No Montenegrin voices exist; the Bosnian ones read Ijekavian Latin text with a close accent.
  'cnr-f': { locale: 'bs-BA', name: 'bs-BA-VesnaNeural' },
  'cnr-m': { locale: 'bs-BA', name: 'bs-BA-GoranNeural' },
  'en-f': { locale: 'en-US', name: 'en-US-JennyNeural' },
  'en-m': { locale: 'en-US', name: 'en-US-GuyNeural' },
  'he-f': { locale: 'he-IL', name: 'he-IL-HilaNeural' },
  'he-m': { locale: 'he-IL', name: 'he-IL-AvriNeural' },
  he: { locale: 'he-IL', name: 'he-IL-HilaNeural' },
  en: { locale: 'en-US', name: 'en-US-JennyNeural' },
};

export const AZURE_OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

export function azureTtsUrl(region: string): string {
  return `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

/**
 * Speaking rates. The course language is spoken a touch slower than conversational speed so learners can follow;
 * the slow variant is synthesized slowly (natural prosody) instead of stretching the normal clip.
 */
export function prosodyRate(voice: ClipVoice, speed: ClipSpeed): string {
  if (voice === 'he' || voice === 'en') return '-4%';
  return speed === 's' ? '-38%' : '-6%';
}

export function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function buildSsml(voice: ClipVoice, speed: ClipSpeed, text: string): string {
  const v = AZURE_VOICES[voice];
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${v.locale}">` +
    `<voice name="${v.name}"><prosody rate="${prosodyRate(voice, speed)}">${escapeXml(text)}</prosody></voice></speak>`
  );
}
