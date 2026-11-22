import { expect, test, type Page } from '@playwright/test';
import { expectNoErrors, openApp } from './helpers';

/**
 * Phones (Android Chrome, iPhone Safari) often show the words live as interim results and then end –
 * or never answer stop() – without ever sending a final result. The learner said the word right and
 * saw it on screen, so it must be scored, not reported as "I didn't recognize the word".
 */
async function mockInterimOnly(page: Page, heard: string, behaviour: 'end' | 'hang') {
  await page.addInitScript(
    ({ text, mode }) => {
      type Handler = ((e?: unknown) => void) | null;
      const w = window as unknown as Record<string, unknown>;
      class InterimOnlyRecognition {
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
            // Two growing interim results, never a final one.
            const half = text.slice(0, Math.ceil(text.length / 2));
            this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: half, confidence: 0 }], { isFinal: false })] });
            this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: text, confidence: 0 }], { isFinal: false })] });
            if (mode === 'end') this.finish();
          }, 900);
        }
        stop() {
          if (mode === 'end') this.finish();
          // 'hang': the recognizer never answers stop() – the app must give up and keep what it heard.
        }
        abort() {
          if (mode === 'end') this.finish();
        }
        private finish() {
          if (!this.live) return;
          this.live = false;
          window.setTimeout(() => this.onend?.(), 10);
        }
      }
      w.SpeechRecognition = InterimOnlyRecognition;
      w.webkitSpeechRecognition = InterimOnlyRecognition;
    },
    { text: heard, mode: behaviour },
  );
}

for (const behaviour of ['end', 'hang'] as const) {
  test(`a correct word seen only as interim text is scored as correct (${behaviour})`, async ({ page }) => {
    await mockInterimOnly(page, 'szkoła', behaviour);
    const errors = await openApp(page, { lang: 'en', hash: '#/map/item/u1-01' });
    await page.getByRole('button', { name: 'Start recording' }).click();
    if (behaviour === 'hang') {
      // Stop by hand so the test does not depend on the fake microphone's silence detection.
      await page.waitForTimeout(2500);
      const stop = page.getByRole('button', { name: 'Stop recording', exact: true });
      if (await stop.isVisible()) await stop.click();
    }
    await expect(page.getByTestId('heard-line')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('unrecognized')).toHaveCount(0);
    await expect(page.getByText('Excellent! Clear pronunciation')).toBeVisible();
    expectNoErrors(errors);
  });
}

test('"How do I say…?" scores interim-only speech too', async ({ page }) => {
  await mockInterimOnly(page, 'Dziękuję', 'end');
  const errors = await openApp(page, { lang: 'en', hash: '#/say' });
  await page.getByTestId('say-input').fill('Thank you');
  await page.getByTestId('say-submit').click();
  const result = page.getByTestId('say-result');
  await result.getByRole('button', { name: 'Start recording' }).click();
  await expect(result.getByTestId('heard-line')).toBeVisible({ timeout: 30_000 });
  await expect(result.getByTestId('unrecognized')).toHaveCount(0);
  await expect(result.getByText('Excellent! Clear pronunciation')).toBeVisible();
  expectNoErrors(errors);
});

test('hands-free mode passes a correct word heard only as interim text', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile-speech', 'Desktop run is enough for the timing-heavy loop.');
  test.setTimeout(180_000);
  await mockInterimOnly(page, 'szkoła', 'end');
  const errors = await openApp(page, { lang: 'en', hash: '#/handsfree/map' });
  await expect(page.getByTestId('hf-counter')).toContainText('Word 1/16');
  await expect(page.getByTestId('hf-phase')).toContainText(/Very good, you got it!|Excellent!/, { timeout: 90_000 });
  await expect(page.getByTestId('hf-attempt')).toHaveCount(0);
  await expect(page.getByTestId('hf-counter')).toContainText('Word 2/16', { timeout: 30_000 });
  expectNoErrors(errors);
});
