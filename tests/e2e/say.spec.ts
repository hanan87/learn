import { expect, test, type Page } from '@playwright/test';
import { expectNoErrors, openApp, progress } from './helpers';

/**
 * "How do I say…?": type a phrase in your own language, hear it, see how it is written and
 * pronounced, repeat it and get an honest score; save it to the personal dictionary.
 * MyMemory is mocked (no network in tests); the recognizer "hears" window.__sttText.
 */

const MYMEMORY = 'https://api.mymemory.translated.net/**';

async function mockTranslation(page: Page, translations: Record<string, string>, status = 200) {
  const calls: string[] = [];
  await page.route(MYMEMORY, async (route) => {
    const q = new URL(route.request().url()).searchParams.get('q') ?? '';
    calls.push(q);
    const t = translations[q] ?? '';
    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        responseStatus: status,
        responseData: { translatedText: t, match: 0.85 },
        matches: t ? [{ segment: q, translation: t, match: 0.85, 'created-by': 'MT!' }] : [],
      }),
    });
  });
  return calls;
}

async function mockRecognition(page: Page) {
  await page.addInitScript(() => {
    type Handler = ((e?: unknown) => void) | null;
    const w = window as unknown as Record<string, unknown> & { __sttText: string };
    w.__sttText = '';
    class MockRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: Handler = null;
      onerror: Handler = null;
      onend: Handler = null;
      onsoundstart: Handler = null;
      onspeechstart: Handler = null;
      private live = false;
      start() {
        this.live = true;
        window.setTimeout(() => {
          this.onsoundstart?.();
          if (w.__sttText) this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: w.__sttText, confidence: 0.9 }], { isFinal: true })] });
          this.stop();
        }, 1000);
      }
      stop() {
        if (!this.live) return;
        this.live = false;
        window.setTimeout(() => this.onend?.(), 10);
      }
      abort() {
        this.stop();
      }
    }
    w.SpeechRecognition = MockRecognition;
    w.webkitSpeechRecognition = MockRecognition;
  });
}

const setHeard = (page: Page, text: string) => page.evaluate((t) => ((window as unknown as { __sttText: string }).__sttText = t), text);

test.describe('How do I say…?', () => {
  test('type in English → hear it, see it, repeat it (wrong, then right) and save it', async ({ page }) => {
    await mockRecognition(page);
    await mockTranslation(page, { 'I would like a coffee with milk': 'Poproszę kawę z mlekiem.' });
    const errors = await openApp(page, { lang: 'en', hash: '#/say' });
    await expect(page.getByRole('heading', { name: 'How do you say it in Polish?' })).toBeVisible();

    await page.getByTestId('say-input').fill('I would like a coffee with milk');
    await page.getByTestId('say-submit').click();
    const result = page.getByTestId('say-result');
    await expect(page.getByTestId('say-target')).toHaveText(/Po.?pro.?szę.*ka.?wę.*z.*mle.?kiem/);
    await expect(page.getByTestId('say-source')).toContainText('Machine translation');
    await expect(result).toContainText('I would like a coffee with milk');
    await expect(result.getByRole('button', { name: 'Play mlekiem' })).toBeVisible();
    await expect(result.getByText('How to pronounce it')).toBeVisible();

    // Wrong words are a miss, never praise.
    await setHeard(page, 'poproszę herbatę');
    await result.getByRole('button', { name: 'Start recording' }).click();
    await expect(result.getByText('Heard:')).toBeVisible({ timeout: 30_000 });
    await expect(result.getByText('Excellent! Clear pronunciation')).toHaveCount(0);

    // The right sentence passes.
    await setHeard(page, 'Poproszę kawę z mlekiem');
    await result.getByRole('button', { name: /Start recording|Try again/ }).first().click();
    await expect(result.getByText(/Excellent|Very good|Great/).first()).toBeVisible({ timeout: 30_000 });

    await page.getByTestId('say-save').click();
    await expect(page.getByTestId('say-saved')).toBeVisible();
    const saved = (await progress(page)).customItems;
    expect(saved).toHaveLength(1);
    expect(saved[0].polish).toBe('Poproszę kawę z mlekiem.');
    expect(saved[0].english).toBe('I would like a coffee with milk');

    // It stays in the recent list.
    await page.reload();
    await expect(page.getByTestId('say-history')).toContainText('Poproszę kawę z mlekiem.');
    expectNoErrors(errors);
  });

  test('a phrase from the course comes from the course, with no translation request', async ({ page }) => {
    const calls = await mockTranslation(page, {});
    const errors = await openApp(page, { lang: 'en', hash: '#/say' });
    await page.getByTestId('say-input').fill('Thank you');
    await page.getByTestId('say-submit').click();
    await expect(page.getByTestId('say-source')).toContainText('From the course');
    await expect(page.getByTestId('say-target')).toHaveText(/dzię.?ku.?ję/i);
    await page.getByRole('button', { name: /in the course – open its card/ }).click();
    await expect(page.getByRole('dialog')).toContainText('Thank you');
    expect(calls).toEqual([]);
    expectNoErrors(errors);
  });

  test('typing the Polish itself shows the keyboard and the meaning', async ({ page }) => {
    await mockTranslation(page, { 'Gdzie jest muzeum?': 'Where is the museum?' });
    const errors = await openApp(page, { lang: 'he', hash: '#/say' });
    await page.getByTestId('say-mode-target').click();
    await expect(page.getByLabel('מקלדת עזר פולנית')).toBeVisible();
    await page.getByTestId('say-input').fill('Gdzie jest muzeum?');
    await page.getByTestId('say-submit').click();
    await expect(page.getByTestId('say-source')).toContainText('הטקסט שהקלדתם');
    await expect(page.getByTestId('say-result')).toContainText('Where is the museum?');
    expectNoErrors(errors);
  });

  test('a used-up quota is explained, not hidden', async ({ page }) => {
    // No on-device translator either, so the quota message must show.
    await page.addInitScript(() => Object.defineProperty(window, 'Translator', { value: undefined, configurable: true }));
    await mockTranslation(page, {}, 429);
    const errors = await openApp(page, { lang: 'en', hash: '#/say' });
    await page.getByTestId('say-input').fill('The cat is sleeping on the sofa');
    await page.getByTestId('say-submit').click();
    await expect(page.getByTestId('say-error')).toContainText('free translation quota');
    await expect(page.getByTestId('say-result')).toHaveCount(0);
    expectNoErrors(errors.filter((e) => !/429/.test(e)));
  });

  test('Montenegrin: translated through Bosnian with Montenegrin forms', async ({ page }) => {
    await mockTranslation(page, { 'Tomorrow I fly home': 'Sutra letim kući.' });
    const errors = await openApp(page, { lang: 'en', course: 'cnr', hash: '#/say' });
    await expect(page.getByRole('heading', { name: 'How do you say it in Montenegrin?' })).toBeVisible();
    await page.getByTestId('say-input').fill('Tomorrow I fly home');
    await page.getByTestId('say-submit').click();
    await expect(page.getByTestId('say-target')).toHaveText(/Sju.?tra.*le.?tim.*ku.?ći/);
    expectNoErrors(errors);
  });
});
