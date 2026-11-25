import { todayKey } from './date';

/**
 * Daily practice reminder through the learner's own calendar. A static site cannot send push
 * notifications on its own (that needs a server), but every phone calendar can: the app hands it a
 * daily repeating event with a link back to the app – as an .ics file (iPhone, Outlook, Samsung and
 * most calendars) or as a Google Calendar link. Nothing leaves the device until the learner adds it.
 */

/** Where the reminder's link points: this site, or the live site when the app runs from a downloaded file. */
export const LIVE_APP_URL = 'https://hanan87.github.io/learn/';

export function appUrl(): string {
  if (typeof location === 'undefined' || !location.protocol.startsWith('http')) return LIVE_APP_URL;
  return `${location.origin}${location.pathname}`;
}

export interface Reminder {
  /** Local time "HH:MM". */
  time: string;
  title: string;
  details: string;
  url: string;
  /** Length of the event in minutes. */
  minutes?: number;
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isTime(v: string): boolean {
  return TIME.test(v);
}

/** First start of the daily event: today if the time is still ahead, otherwise tomorrow (local time). */
export function firstStart(time: string, now: Date = new Date()): Date {
  const match = TIME.exec(time);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), match ? Number(match[1]) : 19, match ? Number(match[2]) : 0);
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
  return start;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Floating local date-time (no time zone): the event follows the phone's clock, also abroad. */
function localStamp(d: Date): string {
  return `${todayKey(d).replace(/-/g, '')}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** iCalendar text escaping (RFC 5545 §3.3.11). */
function esc(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Folds a content line to 75 octets, never splitting a UTF-8 character (Hebrew takes 2 bytes a letter). */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let cur = '';
  let size = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    const limit = parts.length ? 74 : 75;
    if (size + n > limit) {
      parts.push(cur);
      cur = '';
      size = 0;
    }
    cur += ch;
    size += n;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

/** A calendar file with one event that repeats every day, with an alert at its start. */
export function buildIcs(r: Reminder, now: Date = new Date()): string {
  const start = firstStart(r.time, now);
  const body = `${r.details}\n${r.url}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//learn//daily reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${utcStamp(now)}-${Math.random().toString(36).slice(2, 10)}@learn`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${localStamp(start)}`,
    `DURATION:PT${r.minutes ?? 10}M`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${esc(r.title)}`,
    `DESCRIPTION:${esc(body)}`,
    `URL:${r.url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(r.title)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

/** The same event as a Google Calendar "add event" link (opens the learner's calendar, nothing is sent before they save). */
export function googleCalendarUrl(r: Reminder, now: Date = new Date()): string {
  const start = firstStart(r.time, now);
  const end = new Date(start.getTime() + (r.minutes ?? 10) * 60_000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: r.title,
    details: `${r.details}\n${r.url}`,
    dates: `${localStamp(start)}/${localStamp(end)}`,
    recur: 'RRULE:FREQ=DAILY',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Saves the calendar file; phones offer to add the event to the calendar. */
export function downloadIcs(r: Reminder, fileName: string): void {
  const blob = new Blob([buildIcs(r)], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}
