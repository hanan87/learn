import type { CertColors } from '../components/unitStyle';

/**
 * Draws a unit certificate as a 1080×1350 picture (the 4:5 shape that phone galleries and chat apps show
 * whole), so it can be saved or shared. The medal comes from the certificate on screen as an SVG; the
 * text is drawn in the app's own font, right to left for the Hebrew interface.
 */
export interface CertificateText {
  dir: 'rtl' | 'ltr';
  label: string;
  name: string;
  unitTitle: string;
  score: string;
  date: string;
  canDoTitle: string;
  canDo: string[];
  footer: string;
}

const W = 1080;
const H = 1350;
const BAND = 840;
const FONT = "'IBM Plex Sans Hebrew', system-ui, 'Segoe UI', Arial, sans-serif";
const INK = '#141a26';
const MUTED = '#5f6779';

/** Splits text into lines that fit `max` pixels at the current font. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

async function svgImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const text = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  await img.decode();
  return img;
}

export async function certificatePng(medal: SVGSVGElement, colors: CertColors, t: CertificateText): Promise<Blob> {
  await Promise.all(['400', '600', '700'].map((w) => document.fonts?.load(`${w} 40px 'IBM Plex Sans Hebrew'`).catch(() => undefined)));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas');
  ctx.direction = t.dir;
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = colors.band;
  ctx.fillRect(0, 0, W, BAND);

  const center = (text: string, y: number, font: string, color: string) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, W / 2, y);
  };

  center(t.label, 110, `700 34px ${FONT}`, colors.core);
  const img = await svgImage(medal);
  ctx.drawImage(img, (W - 330) / 2, 150, 330, 375);
  if (t.name) center(t.name, 620, `700 72px ${FONT}`, INK);
  center(t.unitTitle, t.name ? 690 : 620, `400 40px ${FONT}`, colors.text);

  // Score and date chips, side by side under the unit title.
  ctx.font = `700 34px ${FONT}`;
  // Drawn left to right: in a right-to-left interface the score still comes first, on the right.
  const chips = t.dir === 'rtl' ? [t.date, t.score] : [t.score, t.date];
  const widths = chips.map((c) => ctx.measureText(c).width + 56);
  const gap = 20;
  let x = (W - widths.reduce((a, b) => a + b, 0) - gap) / 2;
  const chipY = t.name ? 730 : 660;
  chips.forEach((c, i) => {
    roundRect(ctx, x, chipY, widths[i], 64, 32);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.line;
    ctx.stroke();
    ctx.fillStyle = colors.ribbon;
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillText(c, x + widths[i] / 2, chipY + 44);
    ctx.direction = t.dir;
    x += widths[i] + gap;
  });

  // What the learner can do now, with a check mark at the start of each line.
  const rtl = t.dir === 'rtl';
  const edge = rtl ? W - 90 : 90;
  const textX = rtl ? edge - 64 : edge + 64;
  ctx.textAlign = rtl ? 'right' : 'left';
  ctx.font = `700 36px ${FONT}`;
  ctx.fillStyle = '#333a4b';
  ctx.fillText(t.canDoTitle, edge, BAND + 80);
  ctx.font = `400 34px ${FONT}`;
  let y = BAND + 150;
  for (const line of t.canDo) {
    const cx = rtl ? edge - 20 : edge + 20;
    ctx.beginPath();
    ctx.arc(cx, y - 12, 20, 0, Math.PI * 2);
    ctx.fillStyle = colors.soft;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 9, y - 12);
    ctx.lineTo(cx - 3, y - 5);
    ctx.lineTo(cx + 9, y - 19);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colors.core;
    ctx.stroke();
    ctx.fillStyle = INK;
    for (const part of wrap(ctx, line, W - 180 - 64)) {
      ctx.fillText(part, textX, y);
      y += 48;
    }
    y += 18;
  }

  ctx.font = `400 26px ${FONT}`;
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'center';
  ctx.direction = 'ltr';
  ctx.fillText(t.footer, W / 2, H - 50);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No image'))), 'image/png'));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Shares the picture through the phone's share sheet; where files cannot be shared, it is saved instead. */
export async function shareBlob(blob: Blob, filename: string, title: string): Promise<'shared' | 'saved' | 'cancelled'> {
  const file = new File([blob], filename, { type: blob.type });
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
    }
  }
  downloadBlob(blob, filename);
  return 'saved';
}
