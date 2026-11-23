import { expect, test, type Page } from '@playwright/test';
import { expectNoErrors, openApp, progress } from './helpers';

/**
 * The Hebrew course for English, Polish and Montenegrin speakers: chosen on the welcome screen,
 * vocalized Hebrew shown right to left with a Latin transcription in the learner's own letters,
 * Sound Lab, roleplays, the Hebrew helper keyboard and Israeli speech recognition.
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

test.describe('Hebrew course', () => {
  test('welcome in English → Hebrew; not offered to Hebrew speakers', async ({ page }) => {
    const errors = await openApp(page);
    await page.getByRole('button', { name: /לדוברי עברית/ }).click();
    await expect(page.getByTestId('course-he')).toHaveCount(0);
    await page.getByRole('button', { name: 'חזרה לבחירת שפה' }).click();

    await page.getByRole('button', { name: /For English speakers/ }).click();
    await page.getByTestId('course-he').click();
    await expect(page.getByText('נָעִים מְאוֹד!')).toBeVisible();
    await page.getByRole('radio', { name: /^Male/ }).click();
    await page.getByRole('button', { name: "Let's start" }).click();

    await expect(page.getByTestId('continue-lesson')).toContainText('First Words');
    await expect(page).toHaveTitle('Hebrew from Zero');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('html')).toHaveAttribute('data-course', 'he');
    expect(await page.evaluate(() => localStorage.getItem('polish-learn:course'))).toBe('he');
    expect((await progress(page, 'he')).profile.gender).toBe('m');

    // An item: vocalized Hebrew read right to left, the English meaning and the Latin transcription.
    await page.goto('/#/map/item/h1-01');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Hello! / Goodbye!').first()).toBeVisible();
    const hebrew = dialog.locator('p[lang="he"]').first();
    await expect(hebrew).toContainText('לוֹם');
    expect(await hebrew.evaluate((el) => getComputedStyle(el).direction)).toBe('rtl');
    await expect(dialog.locator('p[lang="en"]').first()).toContainText('LOM');
    expectNoErrors(errors);
  });

  test('taught in Polish and Montenegrin, in their own letters', async ({ page }) => {
    const errors = await openApp(page, { lang: 'pl', course: 'he', hash: '#/map/item/h1-01' });
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Cześć! / Do widzenia!').first()).toBeVisible();
    await expect(dialog.locator('p[lang="pl"]').first()).toContainText('sza');
    await expect(page).toHaveTitle('Hebrajski od zera');

    await page.goto('/#/map/item/h3-12');
    await expect(page.getByRole('dialog').getByText('Jestem głodny.').first()).toBeVisible();

    await page.goto('/#/map/settings');
    await page.getByTestId('lang-cnr').click();
    await page.goto('/#/map/item/h1-01');
    await expect(page.getByRole('dialog').getByText('Zdravo! / Doviđenja!').first()).toBeVisible();
    await expect(page.getByRole('dialog').locator('p[lang="sr-Latn"]').first()).toContainText('ša');
    expectNoErrors(errors);
  });

  test('Sound Lab, roleplays and a lesson with the Hebrew keyboard', async ({ page }) => {
    const errors = await openApp(page, { lang: 'en', course: 'he', hash: '#/lab' });
    await expect(page.getByRole('button', { name: 'ח / ה' })).toBeVisible();
    await expect(page.getByText('holes').first()).toBeVisible();
    await page.getByText('Respelling legend').click();
    await expect(page.getByText('throaty, like ch in Bach')).toBeVisible();

    await page.goto('/#/talk');
    await page.getByText('A café in Tel Aviv', { exact: true }).click();
    await expect(page.getByText('Hi! What would you like?')).toBeVisible();

    await page.goto('/#/lesson/h1-L1');
    await expect(page.locator('[lang="he"]').first()).toBeVisible();
    expectNoErrors(errors);
  });

  test('Israeli speech recognition, scored without niqqud', async ({ page }) => {
    await mockRecognition(page, 'שלום');
    const errors = await openApp(page, { lang: 'en', course: 'he', hash: '#/map/item/h1-01' });
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByTestId('heard-line')).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => (window as unknown as { __sttLang: string }).__sttLang)).toBe('he-IL');
    await expect(page.getByTestId('unrecognized')).toHaveCount(0);
    await expect(page.getByText('100%').first()).toBeVisible();
    expect(await progress(page, 'pl')).toBeNull();
    expectNoErrors(errors);
  });
});
