import { expect, test, type Page } from '@playwright/test';
import { expectNoErrors, openApp, progress } from './helpers';

/** Free conversation: topics in the Talk tab, the chat with corrections and hints, the summary, and the server's problems. */

const CHAT = 'https://learn-voice-ten.vercel.app/api/chat';

interface Body {
  course: string;
  ui: string;
  topic: string;
  known: string[];
  history: { role: string; text: string }[];
}

/** Gemini's answers, simulated: a greeting, a correction of "poproszę kawa", then a goodbye that ends the chat. */
async function mockChat(page: Page, bodies: Body[]) {
  await page.route(CHAT, async (route) => {
    const body = route.request().postDataJSON() as Body;
    bodies.push(body);
    const turn = body.history.filter((h) => h.role === 'learner').length;
    const replies = [
      { reply: 'Dzień dobry! Co podać?', translation: 'Good morning! What can I get you?', suggestions: [{ text: 'Poproszę kawę.', translation: 'A coffee, please.' }], words: [{ text: 'podać', translation: 'to serve' }], end: false },
      {
        reply: 'Oczywiście! Z mlekiem czy bez?',
        translation: 'Of course! With milk or without?',
        correction: { better: 'Poproszę kawę.', note: 'After poproszę: kawę.' },
        suggestions: [{ text: 'Z mlekiem, proszę.', translation: 'With milk, please.' }, { text: 'Bez mleka.', translation: 'Without milk.' }],
        words: [{ text: 'oczywiście', translation: 'of course' }],
        end: false,
      },
      { reply: 'Proszę bardzo. Do widzenia!', translation: 'Here you are. Goodbye!', suggestions: [], words: [], end: true },
    ];
    await route.fulfill({ json: replies[Math.min(turn, 2)] });
  });
}

test('a free conversation: topic, chat with a correction and hints, then the summary', async ({ page }) => {
  const bodies: Body[] = [];
  const errors = await openApp(page, { lang: 'en', course: 'pl', hash: '#/talk' });
  // After openApp, which blocks the real voice server: the later route wins.
  await mockChat(page, bodies);
  await page.getByTestId('chat-topic-cafe').click();
  await expect(page).toHaveURL(/#\/chat\/cafe$/);

  const partner = page.getByTestId('chat-partner');
  await expect(partner.first()).toContainText('Dzień dobry! Co podać?');
  expect(bodies[0]).toMatchObject({ course: 'pl', ui: 'en', topic: 'cafe', history: [] });
  expect(bodies[0].known.length).toBeGreaterThan(0);
  await partner.first().getByRole('button', { name: 'Translate' }).click();
  await expect(page.getByTestId('chat-translation')).toHaveText('Good morning! What can I get you?');

  await page.getByTestId('chat-hints').click();
  await expect(page.getByTestId('chat-suggestions')).toContainText('Poproszę kawę.');
  await page.keyboard.press('Escape');

  await page.getByTestId('chat-type').click();
  await page.getByTestId('chat-input').fill('poproszę kawa');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByTestId('chat-learner')).toContainText('poproszę kawa');
  await expect(page.getByTestId('chat-correction')).toContainText('You can also say: Poproszę kawę.');
  await expect(partner.nth(1)).toContainText('Z mlekiem czy bez?');
  expect(bodies[1].history).toEqual([
    { role: 'partner', text: 'Dzień dobry! Co podać?' },
    { role: 'learner', text: 'poproszę kawa' },
  ]);

  await page.getByTestId('chat-input').fill('Z mlekiem, proszę.');
  await page.keyboard.press('Enter');
  await expect(partner.nth(2)).toContainText('Do widzenia!');
  await page.getByTestId('chat-summary-open').click();

  const summary = page.getByTestId('chat-summary');
  await expect(summary).toContainText('Great conversation!');
  await expect(summary).toContainText('+25 XP');
  await expect(page.getByTestId('chat-corrections')).toContainText('Poproszę kawę.');
  const words = page.getByTestId('chat-words');
  await expect(words).toContainText('oczywiście');
  await words.getByRole('button', { name: 'To my words' }).first().click();
  await expect(words.getByText('Saved')).toHaveCount(1);
  const saved = await progress(page);
  expect(saved.customItems.map((i: { polish: string }) => i.polish)).toContain('podać');
  // 25 for the conversation, 5 for the saved word.
  expect(saved.xp).toBe(30);
  expectNoErrors(errors);
});

for (const [status, problem, text] of [
  [429, 'quota', "Today's free conversations are used up."],
  [503, 'not_configured', 'Free conversation is not switched on yet.'],
] as const) {
  test(`the chat explains when the server answers ${status}`, async ({ page }) => {
    const errors = await openApp(page, { lang: 'en', course: 'cnr' });
    await page.route(CHAT, (route) => route.fulfill({ status, json: { error: problem } }));
    await page.goto('/#/chat/meet');
    const card = page.getByTestId('chat-problem');
    await expect(card).toHaveAttribute('data-problem', problem);
    await expect(card).toContainText(text);
    await expect(card.getByRole('button', { name: 'Try again' })).toHaveCount(0);
    // A failed request is not an app error.
    expectNoErrors(errors.filter((e) => !/status of (429|503)/.test(e)));
  });
}

test('the Talk tab offers the topics in every course, in the interface language', async ({ page }) => {
  const errors = await openApp(page, { lang: 'cnr', course: 'he', hash: '#/talk' });
  const card = page.getByTestId('free-chat-card');
  await expect(card).toContainText('Slobodan razgovor');
  await expect(card.getByRole('button')).toHaveCount(6);
  await expect(card).toContainText('U apoteci');
  expectNoErrors(errors);
});
