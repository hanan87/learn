import { expect, test, type Locator } from '@playwright/test';
import { expectNoErrors, openApp } from './helpers';

/** Picture cards: the learn card's picture, the "hear it, tap the picture" question, list thumbnails and the credit. */

/** True once an image has actually loaded (not a broken file). */
const loaded = (img: Locator) => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0);

test('a lesson shows each phrase with its picture and asks one picture question', async ({ page }) => {
  const errors = await openApp(page, { lang: 'en', hash: '#/lesson/u4-L1', progress: { version: 2, profile: { gender: 'm', name: '' } } });

  // Learn cards: every phrase of this lesson can be drawn.
  const stage = page.locator('header p').first();
  let cards = 0;
  while (/Learn & shadow/.test((await stage.textContent()) ?? '')) {
    const picture = page.getByTestId('item-picture');
    await expect(picture).toBeVisible();
    await expect.poll(() => loaded(picture)).toBe(true);
    await page.getByRole('button', { name: 'Got it, continue' }).click();
    cards++;
    await expect(page.locator('div.animate-pop-in.mx-auto')).toHaveCount(1);
  }
  expect(cards).toBeGreaterThanOrEqual(4);

  // The listening stage asks one question with pictures; find it and answer it.
  for (let i = 0; i < 6 && !(await page.getByTestId('picture-options').isVisible()); i++) {
    await page.locator('div.animate-pop-in.mx-auto button:not([disabled]):not([aria-label])').first().click();
    await page.getByRole('button', { name: /^(Continue|Finish)/ }).click();
  }
  const options = page.getByTestId('picture-options').getByRole('button');
  await expect(options).toHaveCount(4);
  await expect(page.locator('header p').first()).toContainText('Listen and pick the picture');
  for (const img of await options.locator('img').all()) expect(await loaded(img)).toBe(true);
  await options.first().click();
  await expect(page.getByRole('button', { name: /^Continue/ })).toBeVisible();
  expectNoErrors(errors);
});

test('the unit list shows small pictures, and Settings credits the pictures', async ({ page }) => {
  const errors = await openApp(page, { lang: 'pl', course: 'en' });
  await page.getByTestId('unit-tile-e3').click();
  const thumbs = page.getByTestId('unit-detail').getByTestId('item-picture');
  expect(await thumbs.count()).toBeGreaterThan(8);
  await page.goto('/#/map/settings');
  const credit = page.getByTestId('picture-credit').getByRole('link');
  await expect(credit).toHaveText('Obrazki: Microsoft Fluent Emoji, licencja MIT');
  const licence = await page.request.get(await credit.getAttribute('href').then((h) => new URL(h!, page.url()).href));
  expect(licence.ok()).toBe(true);
  expect(await licence.text()).toContain('MIT');
  expectNoErrors(errors);
});
