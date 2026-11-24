import { expect, test, type Page } from '@playwright/test';
import { expectNoErrors, openApp, progress, runLesson } from './helpers';

/**
 * The Montenegrin course: chosen on the welcome screen or in Settings, its own units, lessons,
 * keyboard, Sound Lab, roleplay and Croatian-language speech recognition – and Polish progress
 * stays untouched while switching back and forth.
 */

/** Mock recognizer that records the language it was started with and "hears" window.__sttText. */
async function mockRecognition(page: Page, heard: string) {
  await page.addInitScript((text) => {
    type Handler = ((e?: unknown) => void) | null;
    const w = window as unknown as Record<string, unknown> & { __sttText: string; __sttLang: string };
    w.__sttText = text;
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
          const alt = Object.assign([{ transcript: w.__sttText, confidence: 0.9 }], { isFinal: true });
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

test.describe('Montenegrin course', () => {
  test('welcome → Montenegrin + female; the map, profile and course persist', async ({ page }) => {
    const errors = await openApp(page);
    await page.getByRole('button', { name: /For English speakers/ }).click();
    await page.getByTestId('course-cnr').click();
    await expect(page.getByText('Drago mi je!')).toBeVisible();
    await expect(page.getByText('I speak Montenegrin as:')).toBeVisible();
    await page.getByRole('radio', { name: /^Female/ }).click();
    await page.getByRole('button', { name: "Let's start" }).click();

    await expect(page.getByTestId('continue-lesson')).toContainText('The Sounds of Montenegrin');
    await expect(page.getByTestId('course-pill-cnr')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('polish-learn:course'))).toBe('cnr');
    expect((await progress(page, 'cnr')).profile.gender).toBe('f');
    await expect(page).toHaveTitle('Montenegrin from Zero');

    // Her gendered form, with the man's form in the note.
    await page.goto('/#/map/item/m4-12');
    await expect(page.getByRole('dialog').getByText('Htjela').first()).toBeVisible();
    await expect(page.getByTestId('gender-note')).toContainText('Htio bih kafu');
    expectNoErrors(errors);
  });

  test('a full lesson runs, with the Montenegrin keyboard and writing check', async ({ page }) => {
    const errors = await openApp(page, { lang: 'en', course: 'cnr', hash: '#/lesson/m1-L1' });
    await expect(page.getByText('čaj').first()).toBeVisible();
    let keyboardChecked = false;
    const checkKeyboard = async () => {
      const kb = page.getByLabel('Montenegrin helper keyboard');
      for (const key of ['č', 'ć', 'đ', 'š', 'ž', 'dž']) await expect(kb.getByRole('button', { name: key, exact: true })).toBeVisible();
      await expect(kb.getByRole('button', { name: 'ł', exact: true })).toHaveCount(0);
      keyboardChecked = true;
    };
    expect(await runLesson(page, 60, checkKeyboard)).toBe(true);
    expect(keyboardChecked).toBe(true);
    expect((await progress(page, 'cnr')).lessons['m1-L1']).toBeTruthy();
    expect(await progress(page, 'pl')).toBeNull();
    expectNoErrors(errors);
  });

  test('Sound Lab, roleplay and speech recognition use the course', async ({ page }) => {
    await mockRecognition(page, 'čaj');
    const errors = await openApp(page, { lang: 'en', course: 'cnr', hash: '#/lab' });
    await expect(page.getByText('č · dž').first()).toBeVisible();
    await expect(page.getByText('šuma').first()).toBeVisible();

    await page.goto('/#/talk');
    await expect(page.getByText('A café in Kotor', { exact: true })).toBeVisible();
    await expect(page.getByTestId('stories').getByRole('button')).toHaveCount(4);

    // Recognition runs in Croatian (same Latin Ijekavian spelling) and a correct "čaj" passes.
    await page.goto('/#/map/item/m1-01');
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByTestId('heard-line')).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => (window as unknown as { __sttLang: string }).__sttLang)).toBe('hr-HR');
    await expect(page.getByTestId('unrecognized')).toHaveCount(0);
    expectNoErrors(errors);
  });

  test('the new units open and the pharmacy conversation runs to the end', async ({ page }) => {
    const errors = await openApp(page, { lang: 'en', course: 'cnr' });
    await expect(page.getByRole('button', { name: /^Unit \d+:/ })).toHaveCount(8);
    for (const [u, title] of [[5, 'At the Market & in Shops'], [6, 'On the Road: Bus, Boat & Beach'], [7, 'Health & Emergencies'], [8, 'Small Talk']] as const) {
      await page.getByRole('button', { name: new RegExp(`^Unit ${u}:`) }).click();
      const detail = page.getByTestId('unit-detail');
      await expect(detail).toContainText(title);
      await expect(detail.getByRole('button', { name: /^Lesson 1/ })).toBeEnabled();
    }

    await page.goto('/#/talk');
    for (const title of ['A café in Kotor', 'At the market in Podgorica', 'A ticket to Budva', 'At the pharmacy in Budva']) {
      await expect(page.getByText(title, { exact: true })).toBeVisible();
    }
    await page.getByRole('button', { name: /At the pharmacy in Budva/ }).click();
    await page.getByRole('button', { name: /One coffee, please/ }).click();
    await expect(page.getByText(/This is a pharmacy, not a café/)).toBeVisible();
    for (const reply of [/I don’t feel well/, /I have a headache/, /all day on the beach/, /How much is it/, /Thank you very much! Goodbye/]) {
      await page.getByRole('button', { name: reply }).click();
      await page.getByRole('button', { name: 'Skip speaking for this turn' }).click();
    }
    await expect(page.getByText('Conversation complete!')).toBeVisible();
    await expect(page.getByText('4 of 5 replies right on the first try')).toBeVisible();
    expect((await progress(page, 'cnr')).dialogues['apoteka']).toBeTruthy();
    expectNoErrors(errors);
  });

  test('switching courses keeps each course’s progress', async ({ page }) => {
    const errors = await openApp(page, { lang: 'en', progress: { version: 2, xp: 77, items: {}, lessons: {}, dialogues: {} } });
    await expect(page.getByTestId('continue-lesson')).toContainText('Secrets of Polish Pronunciation');
    await page.getByTestId('course-pill-cnr').click();
    await expect(page.getByTestId('continue-lesson')).toContainText('The Sounds of Montenegrin');
    expect((await progress(page, 'pl')).xp).toBe(77);

    await page.goto('/#/map/settings');
    await expect(page.getByTestId('course-settings')).toBeVisible();
    await page.getByTestId('course-pl').click();
    await expect(page.getByTestId('continue-lesson')).toContainText('Secrets of Polish Pronunciation');
    expect((await progress(page, 'pl')).xp).toBe(77);
    expectNoErrors(errors);
  });
});
