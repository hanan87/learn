import { afterEach, describe, expect, it, vi } from 'vitest';
import { CHAT_TOPICS, CHAT_URL, PARTNER, TOPIC_PICTURE, confirmChatAdult, isChatAdult, isChatTopic } from '../../src/lib/chat';
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

  describe('age check', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('is asked until the learner confirms, then remembered', () => {
      const data = new Map<string, string>();
      vi.stubGlobal('localStorage', { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) });
      expect(isChatAdult()).toBe(false);
      confirmChatAdult();
      expect(isChatAdult()).toBe(true);
      expect(data.get('polish-learn:chat-adult')).toBe('1');
    });

    it('is asked again, without crashing, when storage is blocked', () => {
      const blocked = () => {
        throw new Error('blocked');
      };
      vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked });
      expect(() => confirmChatAdult()).not.toThrow();
      expect(isChatAdult()).toBe(false);
    });
  });

  it('speaks Polish and Montenegrin', () => {
    const lines: [string, string, string][] = [
      ['Free conversation is for ages 18 and up', 'Swobodna rozmowa jest dla osób od 18 lat', 'Slobodan razgovor je za osobe od 18 godina'],
      ["I'm 18 or older", 'Mam co najmniej 18 lat', 'Imam 18 ili više godina'],
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
