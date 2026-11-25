import { expect, test } from '@playwright/test';
import { expectNoErrors, openApp, progress, runLesson } from './helpers';

/**
 * End-of-unit test and certificate: the test row on the map (locked, open, passed), the intro, twelve
 * questions without retries, the result with the phrases to review, the certificate (saved as a picture,
 * listed on the progress page) and the offer at the end of a unit's last lesson.
 */

/** A local yyyy-mm-dd date, offset in days from today (lessons run on the real clock). */
const day = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const done = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, { completedAt: day(-1), bestAccuracy: 90 }]));
const UNIT1 = ['u1-L1', 'u1-L2', 'u1-L3', 'u1-L4'];
const UNIT2 = ['u2-L1', 'u2-L2', 'u2-L3', 'u2-L4'];

test('the map keeps a unit test locked until its lessons are done, then opens it', async ({ page }) => {
  const errors = await openApp(page, { lang: 'en', progress: { version: 2, lessons: done(...UNIT1), profile: { gender: 'f', name: '' } } });
  await expect(page.getByTestId('unit-tile-u1')).toHaveAttribute('data-test', 'open');
  await expect(page.getByTestId('unit-tile-u1')).toContainText('Test');
  await expect(page.getByTestId('unit-tile-u2')).toHaveAttribute('data-test', 'locked');

  await page.getByTestId('unit-tile-u2').click();
  await expect(page.getByTestId('test-row')).toHaveAttribute('data-state', 'locked');
  await expect(page.getByTestId('test-row')).toContainText('Opens after all 4 lessons');

  await page.getByTestId('unit-tile-u1').click();
  await expect(page.getByTestId('test-row')).toHaveAttribute('data-state', 'open');
  await page.getByRole('button', { name: 'Start the test' }).click();
  await expect(page).toHaveURL(/#\/lesson\/test-u1$/);
  await expect(page.getByTestId('test-intro')).toContainText('12 questions on everything in this unit');
  expectNoErrors(errors);
});

test('a unit test asks twelve questions without retries and ends on its result', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = await openApp(page, { lang: 'en', hash: '#/lesson/test-u1', progress: { version: 2, lessons: done(...UNIT1), profile: { gender: 'm', name: '' } } });
  const intro = page.getByTestId('test-intro');
  await expect(intro.getByTestId('test-skills')).toContainText('Listening');
  await expect(intro.getByTestId('test-skills')).toContainText('Speaking');
  await page.getByRole('button', { name: 'Start the test' }).click();

  await expect(page.getByTestId('test-progress').locator('span')).toHaveCount(12);
  await expect(page.locator('header p').first()).toContainText('Unit test 1 ·');
  expect(await runLesson(page)).toBe(true);
  // No retry steps: the counter never went past twelve.
  const record = (await progress(page)).tests.u1;
  expect(record.attempts).toBe(1);
  expect(record.bestScore).toBeGreaterThanOrEqual(0);

  if (await page.getByTestId('test-failed').isVisible()) {
    await expect(page.getByTestId('test-failed')).toContainText(/Correct: \d+ of \d+\. To pass you need \d+\./);
    await expect(page.getByTestId('test-failed')).toContainText('+10 XP');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('header p').first()).toContainText('Unit test 1 ·');
    await expect(page.getByTestId('test-progress').locator('span.bg-slate-200')).toHaveCount(12);
  } else {
    await expect(page.getByTestId('certificate')).toBeVisible();
  }
  expectNoErrors(errors);
});

test('a passed test shows its certificate on the map and the progress page, and saves it as a picture', async ({ page }) => {
  const errors = await openApp(page, {
    lang: 'en',
    progress: { version: 2, lessons: done(...UNIT1, ...UNIT2), tests: { u2: { bestScore: 100, attempts: 2, passedAt: day(-2), passScore: 92 } }, profile: { gender: 'f', name: 'Kasia' } },
  });
  await expect(page.getByTestId('unit-tile-u2')).toHaveAttribute('data-test', 'passed');
  await page.getByTestId('unit-tile-u2').click();
  await expect(page.getByTestId('test-row')).toHaveAttribute('data-state', 'passed');
  await page.getByTestId('test-row').getByRole('button', { name: 'Certificate' }).click();
  await expect(page).toHaveURL(/#\/map\/certificate\/u2$/);

  const cert = page.getByTestId('certificate');
  await expect(cert).toContainText('Unit 2 completed');
  await expect(page.getByTestId('certificate-name')).toHaveText('Kasia');
  // The certificate keeps the score of the attempt that first passed.
  await expect(cert).toContainText('92%');
  await expect(cert).toContainText('Now you can');
  await expect(cert.locator('li')).toHaveCount(3);

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save as image' }).click();
  expect((await download).suggestedFilename()).toBe('certificate-pl-u2.png');
  await expect(page.getByRole('status')).toHaveText('The picture was saved to your downloads.');

  await page.goto('/#/map/progress');
  await expect(page.getByTestId('certificates')).toContainText('1/8');
  await page.getByTestId('certificate-u2').click();
  await expect(page.getByTestId('certificate')).toBeVisible();
  expectNoErrors(errors);
});

test('a certificate without a name asks for one', async ({ page }) => {
  const errors = await openApp(page, {
    lang: 'he',
    hash: '#/map/certificate/u1',
    progress: { version: 2, lessons: done(...UNIT1), tests: { u1: { bestScore: 83, attempts: 1, passedAt: day(), passScore: 83 } }, profile: { gender: 'm', name: '' } },
  });
  await expect(page.getByTestId('certificate')).toContainText('יחידה 1 הושלמה');
  await expect(page.getByTestId('certificate-name')).toHaveCount(0);
  await page.getByTestId('certificate-name-input').fill('אורי');
  await page.getByTestId('certificate-name-input').press('Enter');
  await expect(page.getByTestId('certificate-name')).toHaveText('אורי');
  expectNoErrors(errors);
});

test('the last lesson of a unit offers its test', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = await openApp(page, { lang: 'en', hash: '#/lesson/u1-L4', progress: { version: 2, lessons: done('u1-L1', 'u1-L2', 'u1-L3'), profile: { gender: 'f', name: '' } } });
  expect(await runLesson(page)).toBe(true);
  await expect(page.getByTestId('test-offer')).toContainText('The unit test is open');
  await page.getByRole('button', { name: 'Take it' }).click();
  await expect(page).toHaveURL(/#\/lesson\/test-u1$/);
  await expect(page.getByTestId('test-intro')).toBeVisible();
  expectNoErrors(errors);
});

test('the Alef-Bet test checks letters and words without speaking', async ({ page }) => {
  const lessons = done(...Array.from({ length: 8 }, (_, i) => `h0-L${i + 1}`));
  const errors = await openApp(page, { lang: 'en', course: 'he', hash: '#/lesson/test-h0', progress: { version: 2, lessons, profile: { gender: 'f', name: '' } } });
  const skills = page.getByTestId('test-skills');
  await expect(skills).toContainText('Listening');
  await expect(skills).toContainText('Reading');
  await expect(skills).toContainText('Writing');
  await expect(skills).not.toContainText('Speaking');
  await page.getByRole('button', { name: 'Start the test' }).click();
  await expect(page.getByTestId('test-progress').locator('span')).toHaveCount(12);
  await expect(page.locator('header p').first()).toContainText('Letter sounds');
  expectNoErrors(errors);
});
