import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cloudAvailable,
  cloudClipUrl,
  cloudStatus,
  FREE_VOICE_URL,
  freeVoiceAvailable,
  getCloudConfig,
  maskedKey,
  setCloudConfig,
  testCloudConfig,
  validRegion,
} from '../../src/lib/cloudVoice';
import { setNaturalVoiceEnabled } from '../../src/lib/voiceClips';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

const mp3 = () => new Response(new Uint8Array([0xff, 0xf3, 0x44, 0xc4]), { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });

let fetchMock: ReturnType<typeof vi.fn>;
let day = 0;

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  fetchMock = vi.fn(async () => mp3());
  vi.stubGlobal('fetch', fetchMock);
  // Each test starts a day later, so a free-server pause from an earlier test has run out.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2030, 0, 1 + day++));
});

afterEach(() => {
  setCloudConfig(null);
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('cloud voice settings', () => {
  it('stores the key only when given, trimmed, with a lowercase region', () => {
    expect(getCloudConfig()).toBeNull();
    setCloudConfig({ key: '  abc123xyz9  ', region: ' WestEurope ' });
    expect(getCloudConfig()).toEqual({ key: 'abc123xyz9', region: 'westeurope' });
    expect(maskedKey('abc123xyz9')).toBe('••••xyz9');
    setCloudConfig(null);
    expect(getCloudConfig()).toBeNull();
  });

  it('rejects a region that could change the request host', () => {
    expect(validRegion('westeurope')).toBe(true);
    expect(validRegion('evil.com/x')).toBe(false);
    localStorage.setItem('polish-learn:cloud-voice', JSON.stringify({ key: 'k', region: 'evil.com#' }));
    expect(getCloudConfig()).toBeNull();
  });
});

describe('live synthesis', () => {
  it('without a key, asks the free voice server – the phrase in the body, not the URL', async () => {
    const url = await cloudClipUrl('Gdje je stari most?', 'n', 'cnr-f');
    expect(url).toMatch(/^blob:/);
    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe(FREE_VOICE_URL);
    expect(endpoint).not.toContain('most');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ text: 'Gdje je stari most?', voice: 'bs-BA-VesnaNeural', rate: '-6%' });
    expect(init.credentials).toBe('omit');
    // Hebrew meanings are read by Hila, slowly typed phrases at the slow rate.
    await cloudClipUrl('איפה הגשר העתיק?', 'n', 'he');
    expect(JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string).voice).toBe('he-IL-HilaNeural');
    await cloudClipUrl('Gdje je stari most?', 's', 'cnr-f');
    expect(JSON.parse((fetchMock.mock.calls[2][1] as RequestInit).body as string).rate).toBe('-38%');
  });

  it('leaves the free server alone for a while after it fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response('down', { status: 502 }));
    expect(await cloudClipUrl('Hvala', 'n', 'cnr-f')).toBeNull();
    expect(freeVoiceAvailable()).toBe(false);
    expect(await cloudClipUrl('Molim', 'n', 'cnr-f')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.setSystemTime(Date.now() + 3 * 60 * 1000);
    expect(await cloudClipUrl('Molim', 'n', 'cnr-f')).toMatch(/^blob:/);
  });

  it('asks Azure for the course voice once and reuses the result', async () => {
    setCloudConfig({ key: 'secret-key', region: 'westeurope' });
    const url = await cloudClipUrl('Dobar dan!', 'n', 'cnr-f');
    expect(url).toMatch(/^blob:/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe('https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1');
    const headers = init.headers as Record<string, string>;
    expect(headers['Ocp-Apim-Subscription-Key']).toBe('secret-key');
    expect(headers['X-Microsoft-OutputFormat']).toBe('audio-24khz-48kbitrate-mono-mp3');
    expect(init.body).toContain('bs-BA-VesnaNeural');
    expect(init.body).toContain('Dobar dan!');
    expect(init.credentials).toBe('omit');

    expect(await cloudClipUrl('Dobar  dan!', 'n', 'cnr-f')).toBe(url);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cloudStatus()).toBe('ready');
  });

  it('sends one request for the same phrase asked twice at once, and slow speech separately', async () => {
    setCloudConfig({ key: 'k', region: 'northeurope' });
    const [a, b] = await Promise.all([cloudClipUrl('Hvala', 'n', 'cnr-m'), cloudClipUrl('Hvala', 'n', 'cnr-m')]);
    expect(a).toBe(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await cloudClipUrl('Hvala', 's', 'cnr-m');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((fetchMock.mock.calls[1][1] as RequestInit).body).toContain('rate="-38%"');
  });

  it('stops asking Azure after it rejects the key, and uses the free server instead', async () => {
    setCloudConfig({ key: 'wrong', region: 'westeurope' });
    fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));
    expect(await cloudClipUrl('Zdravo', 'n', 'cnr-f')).toBeNull();
    expect(cloudStatus()).toBe('bad-key');
    expect(cloudAvailable()).toBe(false);
    expect(await cloudClipUrl('Zdravo', 'n', 'cnr-f')).toMatch(/^blob:/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(FREE_VOICE_URL);
  });

  it('falls back quietly on a server error and respects the natural-voice switch', async () => {
    setCloudConfig({ key: 'k', region: 'westeurope' });
    fetchMock.mockResolvedValueOnce(new Response('busy', { status: 503 }));
    expect(await cloudClipUrl('Molim', 'n', 'cnr-f')).toBeNull();
    expect(cloudStatus()).toBe('error');
    setNaturalVoiceEnabled(false);
    expect(cloudAvailable()).toBe(false);
    expect(freeVoiceAvailable()).toBe(false);
    expect(await cloudClipUrl('Molim', 'n', 'cnr-f')).toBeNull();
    expect(await cloudClipUrl('Hvala', 'n', 'cnr-f')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    setNaturalVoiceEnabled(true);
  });

  it('testing a new key reports the reason and leaves the stored key working', async () => {
    setCloudConfig({ key: 'good', region: 'westeurope' });
    fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));
    expect(await testCloudConfig({ key: 'bad', region: 'westeurope' }, 'Dobar dan!', 'cnr-f')).toEqual({ ok: false, reason: 'bad-key' });
    expect(cloudStatus()).toBe('ready');
    expect(await testCloudConfig({ key: 'x', region: 'bad region' }, 'Dobar dan!', 'cnr-f')).toEqual({ ok: false, reason: 'bad-region' });
    const ok = await testCloudConfig({ key: 'good', region: 'westeurope' }, 'Dobar dan!', 'cnr-f');
    expect(ok.ok).toBe(true);
  });
});
