import { describe, expect, it } from 'vitest';
import { TABS } from '../../src/components/BottomNav';
import { localize, type Lang } from '../../src/i18n/lang';
import { uiText } from '../../src/i18n/strings';

/** Design round: the end-of-lesson screen and unit tiles speak every interface language, and the bottom bar labels stay short. */

describe('lesson end screen and unit tiles', () => {
  it('has Polish and Montenegrin text for every new line, numbers included', () => {
    const lines: [string, string, string][] = [
      ['Daily goal reached!', 'Cel dzienny osiągnięty!', 'Dnevni cilj ostvaren!'],
      ["35 XP to today's goal", 'Jeszcze 35 XP do dzisiejszego celu', 'Još 35 XP do današnjeg cilja'],
      ['Day 4 of your streak!', 'Dzień 4 serii!', '4. dan niza!'],
      ['You reached level 3!', 'Awans na poziom 3!', 'Prešli ste na nivo 3!'],
      ['Phrases from this lesson', 'Zwroty z tej lekcji', 'Izrazi iz ove lekcije'],
      ['Letters from this lesson', 'Litery z tej lekcji', 'Slova iz ove lekcije'],
      ['Up next', 'Teraz', 'Sada'],
    ];
    for (const [en, pl, cnr] of lines) {
      expect(uiText(en, 'pl')).toBe(pl);
      expect(uiText(en, 'cnr')).toBe(cnr);
    }
  });
});

describe('bottom bar', () => {
  const short = (tab: (typeof TABS)[number], lang: Lang) =>
    localize({ he: tab.shortHe, en: tab.shortEn, ...(tab.shortPl && { pl: tab.shortPl }), ...(tab.shortCnr && { cnr: tab.shortCnr }) }, lang);

  it('keeps every label short enough for one line under its icon on a phone', () => {
    for (const lang of ['he', 'en', 'pl', 'cnr'] as const) {
      for (const tab of TABS) expect(short(tab, lang).length, `${tab.id} in ${lang}`).toBeLessThanOrEqual(11);
    }
  });

  it('uses the short Polish and Montenegrin label for "How to say"', () => {
    const say = TABS.find((t) => t.id === 'say')!;
    expect(short(say, 'pl')).toBe('Powiedz to');
    expect(short(say, 'cnr')).toBe('Kako reći');
    expect(short(say, 'en')).toBe('How to say');
    // The screen title keeps the full name.
    expect(localize(say, 'pl')).toBe('Jak powiedzieć');
  });
});
