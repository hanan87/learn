import { expect, test } from '@playwright/test';
import { expectNoErrors, openApp, progress } from './helpers';

/** Placement test in the English course: the offer on the map, the adaptive run, the result and the "known" marks. */

test('the English map offers the placement test, and "start from the beginning" dismisses it', async ({ page }) => {
  const errors = await openApp(page, { lang: 'he', course: 'en' });
  const offer = page.getByTestId('placement-offer');
  await expect(offer).toContainText('יודעים כבר קצת אנגלית?');
  await offer.getByRole('button', { name: 'להתחיל מההתחלה' }).click();
  await expect(offer).toHaveCount(0);
  expect((await progress(page, 'en')).placement.known).toEqual([]);
  expectNoErrors(errors);
});

test('other courses do not offer it', async ({ page }) => {
  const errors = await openApp(page, { lang: 'en', course: 'pl' });
  await expect(page.getByTestId('map-stats')).toBeVisible();
  await expect(page.getByTestId('placement-offer')).toHaveCount(0);
  expectNoErrors(errors);
});

test('not knowing the first unit ends the test after two questions and starts at unit 1', async ({ page }) => {
  const errors = await openApp(page, { lang: 'pl', course: 'en' });
  await page.getByTestId('placement-offer').getByRole('button', { name: 'Zrób test poziomujący' }).click();
  await expect(page).toHaveURL(/#\/placement$/);
  await expect(page.getByTestId('placement-intro')).toContainText('Test poziomujący');
  await page.getByRole('button', { name: 'Start', exact: true }).click();

  const units = page.getByTestId('placement-units');
  await expect(units.locator('[data-state=current]')).toHaveText('1');
  await expect(page.getByTestId('placement-dots').locator('span')).toHaveCount(4);
  for (let i = 0; i < 2; i++) {
    await page.getByTestId('placement-skip').click();
    await expect(page.getByText('Pominięte')).toBeVisible();
    await page.getByRole('button', { name: 'Dalej', exact: true }).click();
  }

  const resultScreen = page.getByTestId('placement-result');
  await expect(resultScreen.getByTestId('placement-start')).toHaveText('Zaczynasz od działu 1');
  await expect(resultScreen.getByTestId('placement-unit-e1')).toHaveAttribute('data-state', 'start');
  await expect(page.getByTestId('placement-decline')).toHaveCount(0);
  await page.getByTestId('placement-apply').click();
  await expect(page).toHaveURL(/#\/lesson\/e1-L1$/);
  const saved = await progress(page, 'en');
  expect(saved.placement.known).toEqual([]);
  expect(saved.xp).toBe(20);
  expectNoErrors(errors);
});

test('units placed as known show "Known" on their lessons, and Settings opens the test again', async ({ page }) => {
  const day = new Date().toISOString().slice(0, 10);
  const lessons = Object.fromEntries(['e1-L1', 'e1-L2', 'e1-L3'].map((id) => [id, { completedAt: day, bestAccuracy: 75, placed: true }]));
  const errors = await openApp(page, { lang: 'he', course: 'en', progress: { version: 2, lessons, placement: { at: day, known: ['e1'] }, profile: { gender: 'm', name: '' } } });
  await expect(page.getByTestId('placement-offer')).toHaveCount(0);
  await page.getByTestId('unit-tile-e1').click();
  await expect(page.getByTestId('unit-detail')).toContainText('שיעור 1 · ידעתם');
  await expect(page.getByTestId('test-row')).toHaveAttribute('data-state', 'open');

  await page.goto('/#/map/settings');
  await page.getByTestId('placement-settings').getByRole('link', { name: 'למבחן הרמה' }).click();
  await expect(page).toHaveURL(/#\/placement$/);
  await expect(page.getByTestId('placement-intro')).toBeVisible();
  expectNoErrors(errors);
});
