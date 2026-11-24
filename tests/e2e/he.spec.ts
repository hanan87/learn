import { expect, test, type Page } from '@playwright/test';
import { expectNoErrors, NAKDAN, openApp, progress } from './helpers';

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

    await expect(page.getByTestId('continue-lesson')).toContainText('Alef-Bet');
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

  test('Alef-Bet: letters first, then reading, hearing and writing real words', async ({ page }) => {
    const errors = await openApp(page, { lang: 'en', course: 'he', hash: '#/map' });
    await expect(page.getByTestId('continue-lesson')).toContainText('Alef-Bet');
    await page.getByTestId('continue-lesson').click();
    await expect(page).toHaveURL(/#\/lesson\/h0-L1$/);

    // The first card: alef, silent, shown in a word with the letter highlighted.
    const card = page.getByTestId('letter-card');
    await expect(card.locator('p[lang="he"]')).toHaveText('א');
    await expect(card).toContainText('Alef');
    await expect(page.getByTestId('letter-sound')).toHaveText('silent');
    await expect(page.getByTestId('letter-example')).toContainText('Dad');

    const words: Record<string, string> = { Fish: 'דג', Roof: 'גג', '(he) comes': 'בא', Dad: 'אבא' };
    const seen = new Set<string>();
    let wrongOnce = false;
    for (let i = 0; i < 40; i++) {
      if (await page.getByText('Lesson complete!').isVisible()) break;
      const stage = (await page.locator('header p').first().textContent()) ?? '';
      seen.add(stage.replace(' · retry', ''));
      if (/New letter|Learn & shadow/.test(stage)) {
        await page.getByRole('button', { name: 'Got it, continue' }).click();
        continue;
      }
      if (/Writing/.test(stage)) {
        const meaning = (await page.locator('p.text-xl').first().textContent()) ?? '';
        // Typed on the on-screen Hebrew keyboard, without vowel signs.
        for (const ch of words[meaning]) await page.getByRole('button', { name: ch, exact: true }).click();
        await page.getByRole('button', { name: 'Check' }).click();
        await expect(page.getByText('Perfect spelling!')).toBeVisible();
      } else if (!wrongOnce && /Letter sounds/.test(stage)) {
        // One wrong answer: it is explained and comes back at the end.
        wrongOnce = true;
        await page.locator('button:not([data-correct]):not([aria-label])').filter({ hasNotText: /Continue/ }).first().click();
        await expect(page.getByText('Not quite')).toBeVisible();
      } else {
        await page.locator('[data-correct]').first().click();
      }
      await page.getByRole('button', { name: /^(Continue|Finish \(\+)/ }).click();
    }
    await expect(page.getByText('Lesson complete!')).toBeVisible();
    expect([...seen]).toEqual(expect.arrayContaining(['New letter', 'Letter sounds', 'Learn & shadow', 'Read the word', 'Listen and find', 'Writing']));
    const p = await progress(page, 'he');
    expect(p.lessons['h0-L1']).toBeTruthy();
    expect(p.items['h0-02'].learned).toBe(true);

    // The map: lesson 2 is open, its letters previewed; the chart lists every letter in Polish letters too.
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: /Unit 1:/ }).click();
    const detail = page.getByTestId('unit-detail');
    await expect(detail.getByRole('button', { name: 'Lesson 2' })).toBeEnabled();
    await expect(detail).toContainText('ה · ל · מ ם');
    await expect(page.getByTestId('alefbet-chart').locator('button')).toHaveCount(32);
    await expect(page.getByRole('button', { name: 'שׁ – sh' })).toBeVisible();
    await page.goto('/#/map/settings');
    await page.getByTestId('lang-pl').click();
    await page.goto('/#/lesson/h0-L3');
    await page.getByRole('button', { name: 'Jasne, dalej' }).click();
    await page.getByRole('button', { name: 'Jasne, dalej' }).click();
    await expect(page.getByTestId('letter-card')).toContainText('Szin');
    await expect(page.getByTestId('letter-sound')).toHaveText('sz');
    expectNoErrors(errors);
  });

  test('How do I say…?: words the course does not know get Dicta’s niqqud', async ({ page }) => {
    await page.route('https://api.mymemory.translated.net/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({
          responseStatus: 200,
          responseData: { translatedText: 'הכלב אוכל גלידה', match: 0.85 },
          matches: [{ segment: 'The dog eats ice cream', translation: 'הכלב אוכל גלידה', match: 0.85, 'created-by': 'MT!' }],
        }),
      }),
    );
    const asked: string[] = [];
    await page.route(NAKDAN, async (route) => {
      asked.push(JSON.parse(route.request().postData() ?? '{}').data);
      const word = (w: string, v: string) => ({ word: w, sep: false, options: [[v, []]] });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify([word('הכלב', 'הַ|כֶּלֶב'), { word: ' ', sep: true, options: [] }, word('אוכל', 'אוֹכֵל'), { word: ' ', sep: true, options: [] }, word('גלידה', 'גְּלִידָה')]),
      });
    });
    const errors = await openApp(page, { lang: 'en', course: 'he', hash: '#/say', nakdan: true });
    await page.getByTestId('say-input').fill('The dog eats ice cream');
    await page.getByTestId('say-submit').click();
    const result = page.getByTestId('say-result');
    await expect(page.getByTestId('say-target')).toContainText('כֶּ');
    await expect(page.getByTestId('say-vowels')).toContainText('Dicta');
    await expect(page.getByTestId('say-approx')).toHaveCount(0);
    await expect(result.locator('p[lang="en"]').first()).toHaveText(/ha-KE-lev\s+o-KHEL\s+gli-DA/);
    expect(asked).toEqual(['הכלב אוכל גלידה']);

    // Saved with its vowel signs.
    await page.getByTestId('say-save').click();
    expect((await progress(page, 'he')).customItems[0].polish).toBe('הַכֶּלֶב אוֹכֵל גְּלִידָה'.normalize('NFC'));
    expectNoErrors(errors);
  });

  test('How do I say…?: without Dicta, unknown words are marked approximate', async ({ page }) => {
    const errors = await openApp(page, { lang: 'pl', course: 'he', hash: '#/say' });
    await page.getByTestId('say-mode-target').click();
    await page.getByTestId('say-input').fill('מזלג');
    await page.getByTestId('say-submit').click();
    await expect(page.getByTestId('say-approx')).toContainText('przybliżona');
    await expect(page.getByTestId('say-vowels')).toHaveCount(0);
    await expect(page.getByTestId('say-result').locator('p[lang="pl"]').first()).toContainText('~');
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
