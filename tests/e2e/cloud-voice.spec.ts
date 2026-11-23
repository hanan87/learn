import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expectNoErrors, FREE_VOICE, openApp } from './helpers';

/**
 * Live cloud voice (Azure AI Speech, mocked): the learner's key is checked before it is saved,
 * stays out of the backup file, and every phrase without a recording – here a free-typed
 * "How do I say…?" phrase – is spoken by the neural voice instead of the device voice.
 */

const AZURE = 'https://*.tts.speech.microsoft.com/**';
const GOOD_KEY = 'e2e-good-key-7f3a';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST' };

/** 0.2 s of silence as a WAV file: plays in Chrome without any codec. */
function silentWav(): Buffer {
  const n = 1600;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + n, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(8000, 24);
  header.writeUInt32LE(8000, 28);
  header.writeUInt16LE(1, 32);
  header.writeUInt16LE(8, 34);
  header.write('data', 36);
  header.writeUInt32LE(n, 40);
  return Buffer.concat([header, Buffer.alloc(n, 128)]);
}

async function mockAzure(page: Page) {
  const bodies: string[] = [];
  await page.route(AZURE, async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    bodies.push(req.postData() ?? '');
    if (req.headers()['ocp-apim-subscription-key'] !== GOOD_KEY) return route.fulfill({ status: 401, headers: CORS, body: '' });
    return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'audio/wav' }, body: silentWav() });
  });
  return bodies;
}

/** Count device-voice utterances and media plays, so the test knows which voice spoke. */
async function spyOnSpeech(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __device: string[]; __played: string[] };
    w.__device = [];
    w.__played = [];
    const speak = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u: SpeechSynthesisUtterance) => {
      w.__device.push(u.text);
      speak(u);
    };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      if (this.src.startsWith('blob:')) w.__played.push(this.src);
      return play.call(this);
    };
  });
}

const spoken = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __device: string[]; __played: string[] };
    return { device: [...w.__device], played: [...w.__played] };
  });

test('cloud voice: a wrong key is refused, a good key connects, stays out of the backup and speaks typed phrases', async ({ page }) => {
  await spyOnSpeech(page);
  const bodies = await mockAzure(page);
  await page.route('https://api.mymemory.translated.net/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ responseStatus: 200, responseData: { translatedText: 'Gdje je stari most?', match: 0.85 }, matches: [] }),
    }),
  );
  const errors = await openApp(page, { lang: 'en', course: 'cnr', hash: '#/map/settings' });

  const cloud = page.getByTestId('cloud-voice');
  await expect(cloud).toContainText('Vesna and Goran');
  await cloud.getByRole('button', { name: /How do I get a free key/ }).click();
  await expect(cloud.getByRole('link', { name: 'portal.azure.com' })).toBeVisible();

  await cloud.getByTestId('cloud-key').fill('wrong-key');
  await cloud.getByRole('button', { name: 'Save and test' }).click();
  await expect(cloud.getByRole('alert')).toContainText('Azure rejected the key');
  await expect(cloud.getByTestId('cloud-connected')).toHaveCount(0);

  await cloud.getByTestId('cloud-region').selectOption('northeurope');
  await cloud.getByTestId('cloud-key').fill(GOOD_KEY);
  await cloud.getByRole('button', { name: 'Save and test' }).click();
  await expect(cloud.getByTestId('cloud-connected')).toContainText('northeurope');
  await expect(cloud.getByTestId('cloud-connected')).toContainText('••••7f3a');
  expect(bodies.at(-1)).toContain('bs-BA-VesnaNeural');
  expect(bodies.at(-1)).toContain('Dobar dan!');

  // The key never goes into the backup file.
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download backup' }).click()]);
  expect(readFileSync((await download.path())!, 'utf8')).not.toContain(GOOD_KEY);

  // A free-typed phrase has no recording: the cloud voice says it, not the device voice.
  await page.goto('/#/say');
  await page.getByTestId('say-input').fill('Where is the old bridge?');
  await page.getByTestId('say-submit').click();
  await expect(page.getByTestId('say-result')).toBeVisible();
  await expect.poll(() => bodies.some((b) => b.includes('Gdje je stari most?'))).toBe(true);
  await expect.poll(async () => (await spoken(page)).played.length).toBeGreaterThan(0);
  expect((await spoken(page)).device).not.toContain('Gdje je stari most?');

  // Remove: back to the device voice.
  await page.goto('/#/map/settings');
  await page.getByTestId('cloud-voice').getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByTestId('cloud-key')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('polish-learn:cloud-voice'))).toBeNull();
  // The wrong key's 401 is logged by the browser itself; it is the expected answer, not an app error.
  expectNoErrors(errors.filter((e) => !/status of 401/.test(e)));
});

test('without a key, a typed phrase is read by the free natural voice server', async ({ page }) => {
  await spyOnSpeech(page);
  const bodies: string[] = [];
  await page.route(FREE_VOICE, async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    bodies.push(req.postData() ?? '');
    return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'audio/wav' }, body: silentWav() });
  });
  await page.route('https://api.mymemory.translated.net/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ responseStatus: 200, responseData: { translatedText: 'Gdje je stari most?', match: 0.85 }, matches: [] }),
    }),
  );
  const errors = await openApp(page, { lang: 'en', course: 'cnr', hash: '#/say', freeVoice: true });

  await page.getByTestId('say-input').fill('Where is the old bridge?');
  await page.getByTestId('say-submit').click();
  await expect(page.getByTestId('say-result')).toBeVisible();
  await expect.poll(() => bodies.some((b) => b.includes('Gdje je stari most?') && b.includes('bs-BA-VesnaNeural'))).toBe(true);
  await expect.poll(async () => (await spoken(page)).played.length).toBeGreaterThan(0);
  expect((await spoken(page)).device).not.toContain('Gdje je stari most?');
  expectNoErrors(errors);
});
