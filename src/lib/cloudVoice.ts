/**
 * Live neural voice for every phrase that has no pre-recorded clip – above all the free text typed
 * into "How do I say…?", the learner's own name and their own words. Two sources:
 *   1. the learner's own Azure AI Speech key, if they added one (Settings → Teacher voice)
 *   2. otherwise the app's free voice server (voice-server/, a Vercel function using Edge's neural
 *      voices – the same voices as the recorded clips, no key or payment)
 *
 * The learner's Azure key is stored only on this device (localStorage) and sent only to Azure; it is
 * never part of the site, the git repository or a backup file. Azure allows browser calls (CORS), so
 * no server sits in between. Each phrase is synthesized once and kept in Cache Storage, so repeating
 * it is instant and also works offline.
 */

import { AZURE_OUTPUT_FORMAT, AZURE_VOICES, azureTtsUrl, buildSsml, prosodyRate } from './azureVoices';
import { clipText, naturalVoiceEnabled, primeAudioElement, type ClipSpeed, type ClipVoice } from './voiceClips';

export interface CloudVoiceConfig {
  key: string;
  region: string;
}

/** 'ready' after a successful request, 'bad-key' after 401/403, 'error' after a network or server failure. */
export type CloudStatus = 'unknown' | 'ready' | 'bad-key' | 'error';

/** Azure regions that offer the neural voices, closest to Israel / Europe first. */
export const AZURE_REGIONS = [
  'westeurope',
  'northeurope',
  'germanywestcentral',
  'swedencentral',
  'francecentral',
  'uksouth',
  'switzerlandnorth',
  'italynorth',
  'eastus',
  'eastus2',
  'westus2',
  'centralindia',
  'southeastasia',
  'japaneast',
  'australiaeast',
] as const;

/** The app's free voice server (voice-server/api/tts.py on Vercel). */
export const FREE_VOICE_URL = 'https://learn-voice-ten.vercel.app/api/tts';
/** After a failure the free server is left alone for a while (the device voice is used meanwhile). */
const FREE_RETRY_MS = 2 * 60 * 1000;

const CONFIG_KEY = 'polish-learn:cloud-voice';
const CACHE_NAME = 'cloud-voice';
const MEMORY_LIMIT = 80;

let status: CloudStatus = 'unknown';
let freeDownUntil = 0;
const listeners = new Set<() => void>();
/** Object URLs of phrases played this session (oldest first), so a replay needs no lookup at all. */
const memory = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function subscribeCloudVoice(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function cloudStatus(): CloudStatus {
  return status;
}

function setStatus(s: CloudStatus): void {
  if (status === s) return;
  status = s;
  emit();
}

/** Region names are lowercase letters and digits only (they become part of the request host). */
export function validRegion(region: string): boolean {
  return /^[a-z0-9]{3,40}$/.test(region);
}

export function getCloudConfig(): CloudVoiceConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Partial<CloudVoiceConfig>;
    if (typeof c.key !== 'string' || !c.key || typeof c.region !== 'string' || !validRegion(c.region)) return null;
    return { key: c.key, region: c.region };
  } catch {
    return null;
  }
}

export function setCloudConfig(config: CloudVoiceConfig | null): void {
  try {
    if (config) localStorage.setItem(CONFIG_KEY, JSON.stringify({ key: config.key.trim(), region: config.region.trim().toLowerCase() }));
    else localStorage.removeItem(CONFIG_KEY);
  } catch {
    // Storage disabled: nothing to keep.
  }
  memory.forEach((url) => URL.revokeObjectURL?.(url));
  memory.clear();
  status = config ? 'ready' : 'unknown';
  if (config) primeAudioElement();
  emit();
}

export function cloudConfigured(): boolean {
  return getCloudConfig() !== null;
}

/** True when speak() should try the learner's Azure key: one is set, it was not rejected and natural voice is on. */
export function cloudAvailable(): boolean {
  return status !== 'bad-key' && naturalVoiceEnabled() && cloudConfigured();
}

/** True when unrecorded phrases can be read by the free voice server right now. */
export function freeVoiceAvailable(): boolean {
  return Boolean(FREE_VOICE_URL) && naturalVoiceEnabled() && Date.now() >= freeDownUntil;
}

/** Last four characters of the key, to show which key is stored without revealing it. */
export function maskedKey(key: string): string {
  return `••••${key.slice(-4)}`;
}

async function hashHex(text: string): Promise<string> {
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].slice(0, 20).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return encodeURIComponent(text).slice(0, 300);
  }
}

async function openCache(): Promise<Cache | null> {
  try {
    return typeof caches === 'undefined' ? null : await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

function remember(id: string, url: string): void {
  memory.set(id, url);
  while (memory.size > MEMORY_LIMIT) {
    const [oldId, oldUrl] = memory.entries().next().value as [string, string];
    memory.delete(oldId);
    URL.revokeObjectURL?.(oldUrl);
  }
}

/** Azure request for one phrase; resolves the mp3 or null. Updates the status on failure. */
async function request(config: CloudVoiceConfig, ssml: string, timeoutMs: number): Promise<Blob | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(azureTtsUrl(config.region), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': AZURE_OUTPUT_FORMAT,
      },
      body: ssml,
      signal: ctrl.signal,
      // The key must not travel with cookies or be cached by intermediaries.
      credentials: 'omit',
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) {
      setStatus('bad-key');
      return null;
    }
    if (!res.ok) {
      setStatus('error');
      return null;
    }
    const blob = await res.blob();
    if (!blob.size) {
      setStatus('error');
      return null;
    }
    setStatus('ready');
    return blob.type ? blob : new Blob([blob], { type: 'audio/mpeg' });
  } catch {
    setStatus('error');
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** The free voice server: resolves the mp3 or null (then it is not asked again for a while). */
async function requestFree(voice: ClipVoice, speed: ClipSpeed, text: string, timeoutMs: number): Promise<Blob | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(FREE_VOICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // The phrase goes in the body, so it never appears in a URL or an access log.
      body: JSON.stringify({ text, voice: AZURE_VOICES[voice].name, rate: prosodyRate(voice, speed) }),
      signal: ctrl.signal,
      credentials: 'omit',
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`free voice ${res.status}`);
    const blob = await res.blob();
    if (!blob.size) throw new Error('empty audio');
    return blob.type.startsWith('audio/') ? blob : new Blob([blob], { type: 'audio/mpeg' });
  } catch {
    freeDownUntil = Date.now() + FREE_RETRY_MS;
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * URL of the live neural voice saying `text` (an object URL), or null when no live voice is usable,
 * offline without a cached copy, or the request failed – the caller then uses the device voice.
 * The learner's own Azure key wins; without one the free voice server is used.
 */
export function cloudClipUrl(text: string, speed: ClipSpeed, voice: ClipVoice, timeoutMs = 6000): Promise<string | null> {
  const t = clipText(text);
  if (!t || !naturalVoiceEnabled()) return Promise.resolve(null);
  const config = cloudAvailable() ? getCloudConfig() : null;
  if (!config && !freeVoiceAvailable()) return Promise.resolve(null);
  // One id per source and phrase: memory, in-flight requests and the cache are keyed by it.
  const id = config ? buildSsml(voice, speed, t) : `free|${AZURE_VOICES[voice].name}|${prosodyRate(voice, speed)}|${t}`;
  const hit = memory.get(id);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(id);
  if (pending) return pending;

  const job = (async () => {
    const cache = await openCache();
    const cacheUrl = `${typeof location !== 'undefined' ? location.origin : 'https://app.invalid'}/__cloud-voice__/${await hashHex(id)}.mp3`;
    let blob: Blob | null = null;
    try {
      const cached = await cache?.match(cacheUrl);
      if (cached) blob = await cached.blob();
    } catch {
      blob = null;
    }
    if (!blob) {
      // A cold server needs a little longer than Azure.
      blob = config ? await request(config, id, timeoutMs) : await requestFree(voice, speed, t, timeoutMs + 4000);
      if (!blob) return null;
      try {
        await cache?.put(cacheUrl, new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/mpeg' } }));
      } catch {
        // Quota or private mode: the phrase is still played, just not kept.
      }
    }
    const url = URL.createObjectURL(blob);
    remember(id, url);
    return url;
  })().finally(() => inflight.delete(id));
  inflight.set(id, job);
  return job;
}

/**
 * Check a key before saving it: synthesizes `sample` with it. Resolves the clip URL on success
 * (the caller plays it), or the reason it failed.
 */
export async function testCloudConfig(config: CloudVoiceConfig, sample: string, voice: ClipVoice): Promise<{ ok: true; blob: Blob } | { ok: false; reason: 'bad-key' | 'bad-region' | 'network' }> {
  const region = config.region.trim().toLowerCase();
  if (!validRegion(region)) return { ok: false, reason: 'bad-region' };
  const before = status;
  const blob = await request({ key: config.key.trim(), region }, buildSsml(voice, 'n', clipText(sample)), 12000);
  if (blob) return { ok: true, blob };
  const reason = status === 'bad-key' ? 'bad-key' : 'network';
  // A failed test of a new key must not mark the stored (working) key as broken.
  status = before;
  emit();
  return { ok: false, reason };
}

/** Forget every phrase synthesized so far (Settings → remove key). */
export async function clearCloudCache(): Promise<void> {
  try {
    if (typeof caches !== 'undefined') await caches.delete(CACHE_NAME);
  } catch {
    // Nothing cached.
  }
}

// A stored key means speech may start after an async request: unlock the audio element on the first tap.
if (typeof window !== 'undefined' && cloudConfigured()) primeAudioElement();
