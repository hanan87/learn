import { expect, type Page } from '@playwright/test';

/** Start the app with a chosen language/theme and fail the test on any uncaught error or console error. */
export async function openApp(page: Page, opts: { lang?: 'he' | 'en'; theme?: 'light' | 'dark'; hash?: string; progress?: unknown; course?: 'pl' | 'cnr' } = {}) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  await page.addInitScript(
    ({ lang, theme, progress, course }) => {
      if (sessionStorage.getItem('e2e-init')) return;
      sessionStorage.setItem('e2e-init', '1');
      localStorage.clear();
      if (lang) localStorage.setItem('polish-learn:lang', lang);
      if (theme) localStorage.setItem('polish-learn:theme', theme);
      if (course) localStorage.setItem('polish-learn:course', course);
      const key = course === 'cnr' ? 'polish-learn:progress:cnr:v1' : 'polish-learn:progress:v1';
      if (progress) localStorage.setItem(key, JSON.stringify(progress));
    },
    { lang: opts.lang, theme: opts.theme, progress: opts.progress, course: opts.course },
  );
  await page.goto(`/${opts.hash ?? '#/map'}`);
  return errors;
}

export function expectNoErrors(errors: string[]) {
  // Speech synthesis/recognition network chatter is not an app error.
  const real = errors.filter((e) => !/speech|net::ERR|favicon/i.test(e));
  expect(real, real.join('\n')).toEqual([]);
}

export async function progress(page: Page, course: 'pl' | 'cnr' = 'pl') {
  const key = course === 'cnr' ? 'polish-learn:progress:cnr:v1' : 'polish-learn:progress:v1';
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), key);
}

/**
 * Drive one lesson to the end. Answers are deliberately sometimes wrong so retry steps appear too.
 * Speaking steps use the real (fake-device) microphone.
 */
export async function runLesson(page: Page, maxSteps = 60, onWriting?: () => Promise<void>) {
  for (let i = 0; i < maxSteps; i++) {
    if (await page.getByText(/Lesson complete!|Session complete!/).isVisible()) return true;
    const stage = (await page.locator('header p').first().textContent()) ?? '';

    if (/Learn & shadow/.test(stage)) {
      await page.getByRole('button', { name: 'Got it, continue' }).click();
      continue;
    }
    if (/Speak from memory/.test(stage)) {
      const finish = page.getByRole('button', { name: /Record yourself to continue|^Finish \(best score/ });
      if (await finish.isDisabled()) {
        await page.getByRole('button', { name: 'Start recording' }).click();
        // Recording stops by itself (VAD) – wait for any outcome card.
        await expect(page.getByText(/Heard:|No sound was captured|rate yourself|Rate yourself|Sounds like the speaker/i).first()).toBeVisible({ timeout: 30_000 });
        const selfRate = page.getByRole('button', { name: 'Sounds like the speaker' });
        if (await selfRate.isVisible()) await selfRate.click();
      }
      if (await finish.isEnabled()) await finish.click();
      else await page.getByRole('button', { name: "Can't speak right now" }).click();
    } else if (/Writing/.test(stage)) {
      if (onWriting) await onWriting();
      await page.getByPlaceholder(/Napisz po polsku…|Napiši na crnogorskom…/).fill('abc');
      await page.getByRole('button', { name: 'Check' }).click();
    } else {
      const main = page.locator('div.animate-pop-in.mx-auto');
      const options = main.locator('button:not([disabled]):not([aria-label])');
      const n = await options.count();
      for (let k = 0; k < n; k++) {
        const txt = ((await options.nth(k).textContent()) ?? '').trim();
        if (txt && txt !== 'Check') {
          await options.nth(k).click();
          break;
        }
      }
      const check = page.getByRole('button', { name: 'Check' });
      if (await check.isVisible()) await check.click();
    }
    await page.getByRole('button', { name: /^(Continue|Finish \(\+)/ }).click();
  }
  return false;
}
