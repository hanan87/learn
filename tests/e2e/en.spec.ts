import { expect, test, type Page } from '@playwright/test';
import { expectNoErrors, openApp, progress } from './helpers';

/**
 * The English course for Hebrew speakers: chosen on the welcome screen in Hebrew only, its own
 * units with Hebrew-letter transcriptions, Sound Lab, roleplays and American speech recognition –
 * with no interface-language switch and no special-letter keyboard.
 */

/** Mock recognizer that records the language it was started with and "hears" the given text. */
async function mockRecognition(page: Page, heard: string) {
  await page.addInitScript((text) => {
    type Handler = ((e?: unknown) => void) | null;
    const w = window as unknown as Record<string, unknown> & { __sttLang: string };
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
        w.__sttLang = this.lang;
        window.setTimeout(() => {
          this.onsoundstart?.();
          const alt = Object.assign([{ transcript: text, confidence: 0.9 }], { isFinal: true });
          this.onresult?.({ resultIndex: 0, results: [alt] });
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
  }, heard);
}

test.describe('English course', () => {
  test('welcome in Hebrew → English; offered only to Hebrew speakers', async ({ page }) => {
    const errors = await openApp(page);
    // An English-speaking learner is not offered English.
    await page.getByRole('button', { name: /For English speakers/ }).click();
    await expect(page.getByTestId('course-en')).toHaveCount(0);
    await page.getByRole('button', { name: 'Back to language choice' }).click();

    await page.getByRole('button', { name: /לדוברי עברית/ }).click();
    await page.getByTestId('course-en').click();
    await expect(page.getByText('Nice to meet you!')).toBeVisible();
    await page.getByRole('radio', { name: /^נקבה/ }).click();
    await page.getByRole('button', { name: 'בואו נתחיל' }).click();

    await expect(page.getByTestId('continue-lesson')).toContainText('הצלילים שאין בעברית');
    await expect(page).toHaveTitle('אנגלית מדוברת');
    expect(await page.evaluate(() => localStorage.getItem('polish-learn:course'))).toBe('en');
    expect((await progress(page, 'en')).profile.gender).toBe('f');
    // Taught in Hebrew only: no HE / EN switch.
    await expect(page.getByRole('button', { name: 'EN', exact: true })).toHaveCount(0);

    // An item: the English phrase, its Hebrew-letter transcription and the Hebrew meaning.
    await page.goto('/#/map/item/e1-02');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Thank').first()).toBeVisible();
    await expect(dialog.getByText('תודה!').first()).toBeVisible();
    await expect(dialog.locator('.phonetic').first()).toContainText('נְק');
    expectNoErrors(errors);
  });

  test('an English UI preference still opens the English course in Hebrew', async ({ page }) => {
    const errors = await openApp(page, { lang: 'en', course: 'en', hash: '#/map' });
    await expect(page.getByTestId('continue-lesson')).toContainText('הצלילים שאין בעברית');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    expectNoErrors(errors);
  });

  test('a lesson starts, with no special-letter keyboard', async ({ page }) => {
    const errors = await openApp(page, { lang: 'he', course: 'en', hash: '#/lesson/e1-L1' });
    await expect(page.getByText('think').first()).toBeVisible();
    await expect(page.getByLabel(/מקלדת עזר/)).toHaveCount(0);
    expectNoErrors(errors);
  });

  test('Sound Lab, roleplays and American speech recognition', async ({ page }) => {
    await mockRecognition(page, 'Thank you');
    const errors = await openApp(page, { lang: 'he', course: 'en', hash: '#/lab' });
    await expect(page.getByRole('button', { name: 'th / s · t' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ee / i' }).or(page.getByRole('button', { name: 'i / ee' }))).toBeVisible();
    await expect(page.getByText('sink').first()).toBeVisible();

    await page.goto('/#/talk');
    await expect(page.getByText('בית קפה בניו יורק', { exact: true })).toBeVisible();
    await expect(page.getByText('צ׳ק-אין במלון', { exact: true })).toBeVisible();

    await page.goto('/#/map/item/e1-02');
    await page.getByRole('button', { name: 'התחל הקלטה' }).click();
    await expect(page.getByTestId('heard-line')).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => (window as unknown as { __sttLang: string }).__sttLang)).toBe('en-US');
    await expect(page.getByTestId('unrecognized')).toHaveCount(0);
    expect(await progress(page, 'pl')).toBeNull();
    expectNoErrors(errors);
  });
});
