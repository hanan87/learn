import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { expectNoErrors, openApp, progress } from './helpers';

/**
 * My progress: the streak with a freeze covering a missed day, vacation mode, the calendar of study
 * days, success per skill, the can-do lines of finished units and the daily calendar reminder.
 * The clock is fixed so the calendar and the missed day are always the same.
 */

const TODAY = new Date(2026, 10, 25, 10, 0);

const seeded = {
  version: 2,
  xp: 400,
  dailyGoal: 50,
  daily: { date: '2026-11-23', xp: 60 },
  streak: { current: 6, best: 6, lastActiveDate: '2026-11-23' },
  // 24 November was missed: the one freeze covers it.
  freezes: 1,
  frozen: [],
  vacations: [],
  days: { '2026-11-18': 20, '2026-11-19': 55, '2026-11-20': 30, '2026-11-21': 50, '2026-11-22': 20, '2026-11-23': 60 },
  lessons: Object.fromEntries([1, 2, 3, 4].map((n) => [`u1-L${n}`, { completedAt: '2026-11-20', bestAccuracy: 90 }])),
  skills: { listen: { tries: 20, ok: 18 }, read: { tries: 12, ok: 6 } },
  profile: { gender: 'm', name: '' },
};

test('the progress page shows the protected streak, the calendar, skills and can-do lines', async ({ page }) => {
  await page.clock.setFixedTime(TODAY);
  const errors = await openApp(page, { lang: 'en', progress: seeded });

  const stats = page.getByTestId('map-stats');
  await expect(stats).toContainText('6');
  await page.getByTestId('open-progress').click();
  const sheet = page.getByTestId('progress-page');
  await expect(sheet.getByRole('heading', { name: 'My progress' })).toBeVisible();

  // The streak survives the missed day thanks to the freeze.
  await expect(page.getByTestId('streak-count')).toContainText('6 day streak');
  await expect(sheet).toContainText('A streak freeze covers the day you missed.');
  await expect(page.getByTestId('freezes')).toHaveText('Streak freezes: 0/2');

  // Calendar: goal days, practice days and the frozen day.
  const day = (d: string) => page.locator(`[data-testid="cal-day"][data-day="${d}"]`);
  await expect(day('2026-11-23')).toHaveAttribute('data-state', 'goal');
  await expect(day('2026-11-22')).toHaveAttribute('data-state', 'studied');
  await expect(day('2026-11-24')).toHaveAttribute('data-state', 'freeze');
  await expect(day('2026-11-25')).toHaveAttribute('data-state', 'none');
  await expect(page.getByTestId('calendar-summary')).toContainText('Days practised this month: 6');
  // Nothing was studied before November, so there is no earlier month to show.
  await expect(page.getByRole('button', { name: 'Previous month' })).toBeDisabled();

  // Skills and the weakest one.
  await expect(page.getByTestId('skill-listen')).toContainText('90%');
  await expect(page.getByTestId('skill-read')).toContainText('50%');
  await expect(page.getByTestId('skill-write')).toContainText('No answers yet');
  await expect(page.getByTestId('weakest-skill')).toHaveText('Worth strengthening: Reading');

  // Can-do: the finished unit is ticked, the others wait.
  const canDo = page.getByTestId('can-do');
  await expect(canDo).toContainText('Units completed: 1/8');
  await expect(page.getByTestId('can-do-u1')).toHaveAttribute('data-done', 'true');
  await expect(page.getByTestId('can-do-u1')).toContainText('Tell the hard sz, cz from the soft ś, ć');
  await expect(page.getByTestId('can-do-u4')).toContainText('Lessons: 0/3');

  // Vacation mode: start a week, then end it.
  const vacation = page.getByTestId('vacation');
  await vacation.getByRole('button', { name: '1 week' }).click();
  await expect(page.getByTestId('vacation-until')).toContainText(/On vacation until .*1 December/);
  expect((await progress(page)).vacations).toEqual([{ from: '2026-11-25', to: '2026-12-01' }]);
  await vacation.getByRole('button', { name: 'I’m back – end the vacation' }).click();
  await expect(vacation.getByRole('button', { name: '2 weeks' })).toBeVisible();
  expect((await progress(page)).vacations).toEqual([]);

  // Reminder: a daily event at the chosen time, as a Google Calendar link and as a file.
  const reminder = page.getByTestId('reminder');
  await reminder.getByLabel('Reminder time').fill('07:30');
  const href = await reminder.getByTestId('reminder-google').getAttribute('href');
  const link = new URL(href!);
  expect(link.searchParams.get('recur')).toBe('RRULE:FREQ=DAILY');
  expect(link.searchParams.get('dates')).toBe('20261126T073000/20261126T074000');
  expect(link.searchParams.get('text')).toBe('Polish practice – 5 minutes');
  const [download] = await Promise.all([page.waitForEvent('download'), reminder.getByTestId('reminder-ics').click()]);
  expect(download.suggestedFilename()).toBe('polish-reminder.ics');
  const ics = await readFile((await download.path())!, 'utf8');
  expect(ics).toContain('RRULE:FREQ=DAILY');
  expect(ics).toContain('DTSTART:20261126T073000');
  await expect(reminder).toContainText('Choose "Add" in your calendar, and the reminder comes every day at 07:30.');

  // The sheet closes back to the map.
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('progress-page')).toHaveCount(0);
  await expect(page.getByTestId('map-stats')).toBeVisible();
  expectNoErrors(errors);
});

test('a Polish speaker sees the Hebrew course progress in Polish, and the reminder in Settings', async ({ page }) => {
  await page.clock.setFixedTime(TODAY);
  const errors = await openApp(page, { lang: 'pl', course: 'he', hash: '#/map/progress' });
  const sheet = page.getByTestId('progress-page');
  await expect(sheet.getByRole('heading', { name: 'Moje postępy' })).toBeVisible();
  await expect(sheet).toContainText('Jedna lekcja dzisiaj rozpoczyna nową serię.');
  await expect(page.getByTestId('freezes')).toHaveText('Zamrożenia serii: 1/2');
  await expect(page.getByTestId('can-do')).toContainText('Co już potrafisz');
  await expect(page.getByTestId('can-do-h0')).toContainText('Czytać wszystkie 22 litery i ich formy końcowe');
  await expect(page.getByTestId('skill-speak')).toContainText('Brak odpowiedzi');
  await expect(page.getByTestId('calendar')).toContainText('listopad 2026');
  const link = new URL((await page.getByTestId('reminder-google').getAttribute('href'))!);
  expect(link.searchParams.get('text')).toBe('Hebrajski – 5 minut ćwiczeń');

  await page.evaluate(() => (location.hash = '#/map/settings'));
  await expect(page.getByTestId('reminder')).toContainText('Codzienne przypomnienie');
  expectNoErrors(errors);
});
