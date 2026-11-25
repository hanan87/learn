import { expect, test } from '@playwright/test';
import { expectNoErrors, openApp, runLesson } from './helpers';

/**
 * Design round: the lesson's main button stays on screen, the end-of-lesson celebration (daily-goal
 * ring, streak +1, the lesson's phrases), unit tiles with a progress ring and an "Up next" mark, and
 * bottom-bar labels that fit on one line.
 */

/** A local yyyy-mm-dd date, offset in days from today. Lessons run on the real clock: a frozen clock would stop the recorder's silence detection. */
const day = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

test('the main lesson button is on screen without scrolling', async ({ page }) => {
  const errors = await openApp(page, { lang: 'en', hash: '#/lesson/u1-L1' });
  const button = page.getByRole('button', { name: 'Got it, continue' });
  await expect(button).toBeInViewport();
  await button.click();
  await expect(page.getByRole('button', { name: 'Got it, continue' })).toBeInViewport();
  expectNoErrors(errors);
});

test('finishing a lesson celebrates the goal and the streak, then the map shows the unit rings', async ({ page }) => {
  const errors = await openApp(page, {
    lang: 'en',
    hash: '#/lesson/u2-L2',
    progress: {
      version: 2,
      xp: 380,
      dailyGoal: 50,
      daily: { date: day(), xp: 30 },
      streak: { current: 3, best: 5, lastActiveDate: day(-1) },
      lessons: Object.fromEntries(['u1-L1', 'u1-L2', 'u1-L3', 'u1-L4', 'u2-L1'].map((id) => [id, { completedAt: day(-1), bestAccuracy: 90 }])),
      profile: { gender: 'm', name: '' },
    },
  });
  expect(await runLesson(page)).toBe(true);

  const done = page.getByTestId('lesson-complete');
  await expect(done.getByText('Lesson complete!')).toBeVisible();
  await expect(page.getByTestId('goal-ring')).toHaveAttribute('data-reached', 'true');
  await expect(page.getByTestId('goal-ring')).toContainText('Daily goal reached!');
  await expect(page.getByTestId('streak-grew')).toHaveText('Day 4 of your streak!');
  await expect(page.getByTestId('complete-streak')).toContainText('+1');
  const phrases = page.getByTestId('lesson-phrases');
  await expect(phrases).toContainText('Phrases from this lesson');
  expect(await phrases.getByRole('button').count()).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByTestId('unit-tile-u1')).toHaveAttribute('data-state', 'done');
  await expect(page.getByTestId('unit-tile-u2')).toHaveAttribute('data-state', 'current');
  await expect(page.getByTestId('unit-tile-u2')).toContainText('Up next');
  await expect(page.getByTestId('unit-tile-u3')).toHaveAttribute('data-state', 'new');
  expectNoErrors(errors);
});

test('the end screen of the first lesson shows how much of the daily goal is left', async ({ page }) => {
  const errors = await openApp(page, { lang: 'en', hash: '#/lesson/u1-L1', progress: { version: 2, dailyGoal: 200, profile: { gender: 'f', name: '' } } });
  expect(await runLesson(page)).toBe(true);
  await expect(page.getByTestId('goal-ring')).toHaveAttribute('data-reached', 'false');
  await expect(page.getByTestId('goal-ring')).toContainText(/\d+ XP to today's goal/);
  await expect(page.getByTestId('streak-grew')).toHaveText('Day 1 of your streak!');
  expectNoErrors(errors);
});

const SAY_LABEL = { he: 'איך אומרים?', en: 'How to say', pl: 'Powiedz to', cnr: 'Kako reći' } as const;

for (const lang of ['he', 'en', 'pl', 'cnr'] as const) {
  test(`bottom bar labels fit on one line (${lang})`, async ({ page }) => {
    const errors = await openApp(page, { lang, course: lang === 'he' || lang === 'en' ? 'pl' : 'en' });
    const labels = page.locator('nav button span.text-center');
    await expect(labels).toHaveCount(5);
    await expect(page.locator('nav')).toContainText(SAY_LABEL[lang]);
    for (const height of await labels.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) {
      expect(height).toBeLessThan(20);
    }
    expectNoErrors(errors);
  });
}
