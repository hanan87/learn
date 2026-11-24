import { expect, test } from '@playwright/test';
import { expectNoErrors, openApp } from './helpers';

/**
 * Native-speaker review: a reviewer opens the shared link on a fresh device (no welcome screen),
 * checks texts in their own language, and gets a report to send back; the owner finds the links in
 * Settings.
 */

test('a Montenegrin reviewer checks phrases and sends the notes', async ({ page }) => {
  const errors = await openApp(page, { hash: '#/review/cnr' });
  await expect(page.getByRole('heading', { name: 'Provjera crnogorskih tekstova' })).toBeVisible();
  await expect(page.getByText('Nice to meet you!')).toHaveCount(0);
  await page.getByLabel('Vaše ime (nije obavezno)').fill('Marko');

  await page.getByTestId('review-section-course-m7').click();
  await expect(page.getByRole('heading', { name: 'Zdravlje i hitni slučajevi' })).toBeVisible();
  const cards = page.getByTestId('review-entry');
  await expect(cards).toHaveCount(12);
  await cards.nth(0).getByRole('button', { name: 'Tačno' }).click();
  await expect(cards.nth(0).getByRole('button', { name: 'Tačno' })).toHaveAttribute('aria-pressed', 'true');
  await cards.nth(1).getByRole('button', { name: 'Predložite ispravku' }).click();
  await cards.nth(1).getByLabel('Bolja verzija').fill('Treba mi ljekar');
  await cards.nth(1).getByLabel('Komentar (nije obavezno)').fill('ljekar is more common');
  await cards.nth(1).getByRole('button', { name: 'Sačuvaj' }).click();
  await expect(cards.nth(1)).toContainText('Treba mi ljekar');

  // Only unchecked: the two checked phrases leave the list.
  await page.getByLabel('Samo neprovjereno').check();
  await expect(cards).toHaveCount(10);

  await page.getByRole('button', { name: 'Sve cjeline' }).click();
  await expect(page.getByTestId('review-summary')).toContainText(/Provjereno 2 od \d+/);
  await page.getByRole('button', { name: 'Pošaljite napomene' }).click();
  const report = page.getByTestId('review-report');
  await expect(report).toHaveValue(/Montenegrin text review/);
  await expect(report).toHaveValue(/Reviewer: Marko/);
  await expect(report).toHaveValue(/\[cnr:m7-02\][\s\S]*Suggestion: Treba mi ljekar[\s\S]*Comment: {4}ljekar is more common/);

  // The notes stay on the device.
  await page.reload();
  await expect(page.getByTestId('review-summary')).toContainText(/Provjereno 2 od \d+/);
  await expect(page.getByTestId('review-section-course-m7')).toContainText('2/12');
  // The page also reads in English.
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Montenegrin text review' })).toBeVisible();
  expectNoErrors(errors);
});

test('Settings link the Polish review, which opens in Polish', async ({ page }) => {
  const errors = await openApp(page, { lang: 'he', hash: '#/map/settings' });
  const box = page.getByTestId('review-settings');
  await expect(box).toContainText('בדיקה על ידי דובר ילידי');
  await expect(box.getByTestId('review-link-pl').getByRole('textbox')).toHaveValue(/#\/review\/pl$/);
  await box.getByTestId('review-link-pl').getByRole('link', { name: 'פתיחה' }).click();
  await expect(page.getByRole('heading', { name: 'Korekta tekstów polskich' })).toBeVisible();
  await page.getByTestId('review-section-course-u1').click();
  await expect(page.getByTestId('review-entry').first()).toContainText('Znaczenie');
  // Back to the list and out to the app.
  await page.getByRole('button', { name: 'Wszystkie części' }).click();
  await page.getByRole('button', { name: 'Wstecz' }).click();
  await expect(page.getByTestId('review-summary')).toHaveCount(0);
  expectNoErrors(errors);
});
