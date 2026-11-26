import type { Lang } from '../i18n/lang';
import type { Gender } from './personalize';
import { COURSE } from './course';
import { FREE_VOICE_URL } from './cloudVoice';

/**
 * Free conversation: one turn of a chat with a character who speaks the course language. The voice
 * server (voice-server/api/chat.py) asks Google Gemini's free tier, so the key never reaches the app.
 */

export const CHAT_URL = FREE_VOICE_URL.replace(/\/api\/tts$/, '/api/chat');

export const CHAT_TOPICS = ['cafe', 'meet', 'travel', 'holiday', 'pharmacy', 'free'] as const;
export type ChatTopic = (typeof CHAT_TOPICS)[number];
export const isChatTopic = (v: string | undefined): v is ChatTopic => !!v && (CHAT_TOPICS as readonly string[]).includes(v);

/** The partner of each course (the server uses the same names) and a picture per topic. */
export const PARTNER: Record<string, string> = { pl: 'Ola', cnr: 'Milica', en: 'Emma', he: 'Noa' };
export const TOPIC_PICTURE: Record<ChatTopic, string> = {
  cafe: 'Hot beverage',
  meet: 'Waving hand',
  travel: 'Train',
  holiday: 'Beach with umbrella',
  pharmacy: 'Pill',
  free: 'Speech balloon',
};

/**
 * Gemini's terms allow its API only for users aged 18 or older, so the chat asks once per device
 * (also on a direct #/chat link) and remembers the answer. A "no" is not stored: it simply leaves.
 */
const ADULT_KEY = 'polish-learn:chat-adult';
export function isChatAdult(): boolean {
  try {
    return localStorage.getItem(ADULT_KEY) === '1';
  } catch {
    return false;
  }
}
export function confirmChatAdult(): void {
  try {
    localStorage.setItem(ADULT_KEY, '1');
  } catch {
    // Storage is blocked: the question simply comes back next time.
  }
}

export interface ChatLine {
  role: 'partner' | 'learner';
  text: string;
}
export interface ChatPair {
  text: string;
  translation: string;
}
export interface ChatReply {
  reply: string;
  translation: string;
  correction?: { better: string; note: string };
  suggestions: ChatPair[];
  words: ChatPair[];
  end: boolean;
}

/** quota: today's free allowance is used up; not_configured: no key on the server yet; offline / failed: try again. */
export type ChatProblem = 'quota' | 'not_configured' | 'offline' | 'failed';
export class ChatError extends Error {
  constructor(readonly problem: ChatProblem) {
    super(problem);
  }
}

export interface ChatRequest {
  topic: ChatTopic;
  ui: Lang;
  gender: Gender | null;
  name: string;
  /** Phrases the learner already knows, so the partner keeps to familiar words. */
  known: string[];
  history: ChatLine[];
}

export async function chatTurn(req: ChatRequest, timeoutMs = 30_000): Promise<ChatReply> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new ChatError('offline');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: COURSE, ...req, history: req.history.slice(-30) }),
      signal: ctrl.signal,
    });
    if (res.status === 429) throw new ChatError('quota');
    if (res.status === 503) throw new ChatError('not_configured');
    if (!res.ok) throw new ChatError('failed');
    const data = (await res.json()) as ChatReply;
    if (!data?.reply) throw new ChatError('failed');
    return { ...data, suggestions: data.suggestions ?? [], words: data.words ?? [], end: !!data.end };
  } catch (e) {
    if (e instanceof ChatError) throw e;
    throw new ChatError(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'failed');
  } finally {
    clearTimeout(timer);
  }
}
