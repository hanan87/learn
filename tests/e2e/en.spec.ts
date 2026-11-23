import { expect, test, type Page } from '@playwright/test';
import { expectNoErrors, openApp, progress } from './helpers';

/**
 * The English course for Hebrew, Polish and Montenegrin speakers: chosen on the welcome screen, its
 * own units with Hebrew-letter (or Polish / Montenegrin Latin) transcriptions, Sound Lab, roleplays
 * and American speech recognition – with no special-letter keyboard.
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
  test('welcome in Hebrew → English; not offered to English speakers', async ({ page }) => {
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
    // No HE / EN switch: the English course switches between HE / PL / CNR in Settings only.
    await expect(page.getByRole('button', { name: 'EN', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('lang-pl')).toHaveCount(0);

    // An item: the English phrase, its Hebrew-letter transcription and the Hebrew meaning.
    await page.goto('/#/map/item/e1-02');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Thank').first()).toBeVisible();
    await expect(dialog.getByText('תודה!').first()).toBeVisible();
    await expect(dialog.locator('.phonetic').first()).toContainText('נְק');
    expectNoErrors(errors);
  });

  test('welcome in Polish → the English course taught in Polish', async ({ page }) => {
    const errors = await openApp(page);
    await page.getByTestId('welcome-pl').click();
    // Polish speakers learn English only.
    await expect(page.getByTestId('course-en')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('course-pl')).toHaveCount(0);
    await expect(page.getByText('Miło cię poznać!')).toBeVisible();
    await page.getByRole('radio', { name: /^Kobieta/ }).click();
    await page.getByRole('button', { name: 'Zaczynamy' }).click();

    await expect(page.getByTestId('continue-lesson')).toContainText('Dźwięki, których nie ma w polskim');
    await expect(page).toHaveTitle('Angielski na co dzień');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    expect(await page.evaluate(() => [localStorage.getItem('polish-learn:course'), localStorage.getItem('polish-learn:lang')])).toEqual(['en', 'pl']);
    expect((await progress(page, 'en')).profile.gender).toBe('f');
    await expect(page.getByRole('navigation').getByText('Słówka')).toBeVisible();

    // An item: the English phrase, the Polish meaning and tip, and a respelling in Polish letters.
    await page.goto('/#/map/item/e1-02');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Dziękuję!').first()).toBeVisible();
    await expect(dialog.getByText(/fenk ju/).first()).toBeVisible();
    await expect(dialog.locator('p[lang="pl"]').first()).toContainText('THÆNK');
    await expect(dialog.locator('.phonetic')).toHaveCount(0);

    // A gendered meaning follows the learner.
    await page.goto('/#/map/item/e4-11');
    await expect(page.getByRole('dialog').getByText('Zgubiłam się.').first()).toBeVisible();
    expectNoErrors(errors);
  });

  test('the Montenegrin interface: roleplays, Sound Lab and Settings', async ({ page }) => {
    const errors = await openApp(page, { lang: 'cnr', course: 'en', hash: '#/map/item/e1-02' });
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Hvala!').first()).toBeVisible();
    await expect(dialog.locator('p[lang="sr-Latn"]').first()).toContainText('THÆNK');
    await expect(page.locator('html')).toHaveAttribute('lang', 'sr-Latn-ME');

    await page.goto('/#/talk');
    await expect(page.getByText('Kafić u Njujorku', { exact: true })).toBeVisible();
    await page.getByText('Kafić u Njujorku', { exact: true }).click();
    await expect(page.getByText('Zdravo! Šta da vam spremim?')).toBeVisible();

    await page.goto('/#/lab');
    await expect(page.getByText('Obično s i t: jezik iza zuba.', { exact: false })).toBeVisible();
    await page.getByText('Legenda zapisa izgovora').click();
    await expect(page.getByText('zaokružene usne, zubi ne dodiruju usnu')).toBeVisible();

    await page.goto('/#/map/settings');
    await expect(page.getByRole('heading', { name: 'Podešavanja' })).toBeVisible();
    await page.getByTestId('lang-pl').click();
    await expect(page.getByRole('heading', { name: 'Ustawienia' })).toBeVisible();
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
