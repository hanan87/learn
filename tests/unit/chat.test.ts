import { describe, expect, it } from 'vitest';
import { CHAT_TOPICS, CHAT_URL, PARTNER, TOPIC_PICTURE, isChatTopic } from '../../src/lib/chat';
import { PICTURES } from '../../src/data/pictures';
import { makeCustomItem } from '../../src/lib/customItem';
import { uiText } from '../../src/i18n/strings';
import { TOPIC_LABEL } from '../../src/views/FreeChat';

/** Free conversation: the server address, the topics, saving a word from the chat, and the texts. */

describe('free conversation', () => {
  it('talks to the chat endpoint next to the voice', () => {
    expect(CHAT_URL).toBe('https://learn-voice-ten.vercel.app/api/chat');
  });

  it('has a label and a picture for each topic, and a partner for each course', () => {
    const pictures = new Set(Object.values(PICTURES));
    for (const t of CHAT_TOPICS) {
      expect(TOPIC_LABEL[t].en).toBeTruthy();
      expect(pictures.has(TOPIC_PICTURE[t]), t).toBe(true);
    }
    expect(Object.keys(PARTNER).sort()).toEqual(['cnr', 'en', 'he', 'pl']);
    expect(isChatTopic('cafe')).toBe(true);
    expect(isChatTopic('admin')).toBe(false);
    expect(isChatTopic(undefined)).toBe(false);
  });

  it('saves a word from the chat as a personal dictionary item, meaning in the interface language', () => {
    const pl = makeCustomItem('oczywiście', 'oczywiście = of course', 'en');
    expect(pl).toMatchObject({ polish: 'oczywiście', english: 'oczywiście = of course', custom: true });
    expect(pl.id).toMatch(/^c-/);
    expect(pl.syllablesPolish.length).toBeGreaterThan(0);
    const cnr = makeCustomItem('naravno', 'oczywiście', 'pl');
    expect(cnr.loc?.pl?.meaning).toBe('oczywiście');
  });

  it('speaks Polish and Montenegrin', () => {
    const lines: [string, string, string][] = [
      ['Free conversation', 'Swobodna rozmowa', 'Slobodan razgovor'],
      ['At the pharmacy', 'W aptece', 'U apoteci'],
      ['Turn 3', 'Tura 3', 'Red 3'],
      ['Ola is typing…', 'Ola pisze…', 'Ola piše…'],
      ['4 turns with Milica', 'Liczba tur: 4 · rozmówca: Milica', 'Broj redova: 4 · sagovornik: Milica'],
      ['You can also say:', 'Można też powiedzieć:', 'Može se reći i ovako:'],
    ];
    for (const [en, pl, cnr] of lines) {
      expect(uiText(en, 'pl')).toBe(pl);
      expect(uiText(en, 'cnr')).toBe(cnr);
    }
  });
});
