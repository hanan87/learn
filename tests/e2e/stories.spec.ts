import { expect, test, type Page } from '@playwright/test';
import { HE_STORIES } from '../../src/data/he/stories';
import { expectNoErrors, openApp, progress } from './helpers';

/**
 * Mini stories in the English, Hebrew and Montenegrin courses: the story list on the Talk tab, the
 * tap-to-inspect word bubble with its decoder, the comprehension quiz and the saved result – each in
 * another interface language. (The Polish stories are covered in stage6.spec.)
 */

/** An answer of the comprehension quiz (story words can have the same text). */
const answer = (page: Page, name: RegExp) => page.locator('section').getByRole('button', { name });

async function revealAll(page: Page, next: string) {
  const button = page.getByRole('button', { name: new RegExp(`^${next}`) });
  for (let i = 1; i < 8; i++) await button.click();
  await expect(button).toBeHidden();
}

test('English course: a story explained in Polish, with the quiz saved', async ({ page }) => {
  const errors = await openApp(page, { lang: 'pl', course: 'en', hash: '#/talk' });
  await expect(page.getByRole('heading', { name: 'Mini historyjki' })).toBeVisible();
  await expect(page.getByTestId('stories').getByRole('button')).toHaveCount(4);
  await page.getByRole('button', { name: /Kawa dla Tima/ }).click();
  await expect(page.getByText('Dotknij dowolnego słowa', { exact: false })).toBeVisible();

  await revealAll(page, 'Następna kwestia');
  await page.getByRole('button', { name: "What's", exact: true }).click();
  const bubble = page.getByTestId('word-bubble');
  await expect(bubble).toContainText('co / jak (jest)');
  await expect(bubble).toContainText('What is');
  await page.getByRole('button', { name: 'Tim!', exact: true }).click();
  await expect(page.getByTestId('word-bubble')).toContainText('Tim (imię)');

  await page.getByRole('button', { name: 'Do pytań sprawdzających' }).click();
  await answer(page, /^A small coffee\./).click();
  await page.getByRole('button', { name: 'Następne pytanie' }).click();
  await answer(page, /^Tim\./).click();
  await page.getByRole('button', { name: 'Zakończ historyjkę' }).click();
  await expect(page.getByText('Historyjka ukończona!')).toBeVisible();
  await expect(page.getByText(/Poprawne odpowiedzi: 2 z 2/)).toBeVisible();
  expect((await progress(page, 'en')).stories['coffee-for-tim'].bestCorrect).toBe(2);
  expectNoErrors(errors);
});

test('Hebrew course: right-to-left lines and the prefix decoder, explained in Montenegrin', async ({ page }) => {
  const errors = await openApp(page, { lang: 'cnr', course: 'he', hash: '#/talk' });
  await expect(page.getByTestId('stories').getByRole('button')).toHaveCount(4);
  await page.getByRole('button', { name: /Danas nema autobusa/ }).click();
  await expect(page.locator('ol > li').first()).toHaveAttribute('dir', 'rtl');

  await revealAll(page, 'Sljedeća replika');
  // The two speakers sit on opposite sides, even when the text runs right to left.
  await expect(page.locator('ol > li').nth(0)).toHaveClass(/items-start/);
  await expect(page.locator('ol > li').nth(1)).toHaveClass(/items-end/);

  const story = HE_STORIES.find((s) => s.id === 'shabbat-bus')!;
  const morning = story.lines[3].polish.split(' ')[1];
  await page.getByRole('button', { name: morning, exact: true }).click();
  const bubble = page.getByTestId('word-bubble');
  await expect(bubble).toContainText('ujutru');
  const decoder = bubble.getByTestId('ending-decoder');
  await expect(decoder).toContainText('Dekoder riječi');
  await expect(decoder.locator('p').last()).toHaveAttribute('dir', 'rtl');
  // The transcription is exact (no "~" guess), in the learner's Latin letters.
  await expect(bubble).not.toContainText('~');

  await page.getByRole('button', { name: 'Na pitanja o razumijevanju' }).click();
  await answer(page, /Sjutra ujutru\./).click();
  await page.getByRole('button', { name: 'Sljedeće pitanje' }).click();
  await answer(page, /Na more\./).click();
  await page.getByRole('button', { name: 'Završi priču' }).click();
  await expect(page.getByText('Priča je završena!')).toBeVisible();
  expect((await progress(page, 'he')).stories['shabbat-bus'].bestCorrect).toBe(2);
  expectNoErrors(errors);
});

test('Montenegrin course: the ending decoder in Hebrew', async ({ page }) => {
  const errors = await openApp(page, { lang: 'he', course: 'cnr', hash: '#/talk' });
  await expect(page.getByTestId('stories').getByRole('button')).toHaveCount(4);
  await page.getByRole('button', { name: /ראקיה לארוחת בוקר/ }).click();
  await expect(page.locator('ol > li').first()).toHaveAttribute('dir', 'ltr');

  await revealAll(page, 'השורה הבאה');
  await page.getByRole('button', { name: 'Domaća', exact: true }).click();
  const bubble = page.getByTestId('word-bubble');
  await expect(bubble).toContainText('תוצרת בית');
  await expect(bubble.getByTestId('ending-decoder')).toContainText('domaći');

  await page.getByRole('button', { name: 'לשאלות ההבנה' }).click();
  await answer(page, /^Samo kafu\./).click();
  await page.getByRole('button', { name: 'לשאלה הבאה' }).click();
  await answer(page, /^Iz prodavnice\./).click();
  await page.getByRole('button', { name: 'סיום הסיפור' }).click();
  await expect(page.getByText('הסיפור הושלם!')).toBeVisible();
  expect((await progress(page, 'cnr')).stories['rakija-za-dorucak'].bestCorrect).toBe(1);
  expectNoErrors(errors);
});
