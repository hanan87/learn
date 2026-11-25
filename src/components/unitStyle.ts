import {
  AudioLines,
  BookA,
  BookOpen,
  Bus,
  Coffee,
  Compass,
  HeartPulse,
  MessageCircle,
  Plane,
  ShoppingBag,
  Smile,
  type LucideIcon,
} from 'lucide-react';
import type { UnitColor } from '../data/types';

/** Tile palette per unit color: tinted tile, icon, number, progress bar and the ring of an open tile. */
export const UNIT_COLOR: Record<UnitColor, { tile: string; icon: string; num: string; bar: string; open: string }> = {
  violet: { tile: 'bg-violet-50 ring-violet-200/70', icon: 'text-violet-600', num: 'text-violet-700', bar: 'bg-violet-500', open: 'ring-violet-500' },
  orange: { tile: 'bg-orange-50 ring-orange-200/70', icon: 'text-orange-600', num: 'text-orange-700', bar: 'bg-orange-500', open: 'ring-orange-500' },
  sky: { tile: 'bg-sky-50 ring-sky-200/70', icon: 'text-sky-600', num: 'text-sky-700', bar: 'bg-sky-500', open: 'ring-sky-500' },
  amber: { tile: 'bg-amber-50 ring-amber-200/70', icon: 'text-amber-600', num: 'text-amber-700', bar: 'bg-amber-500', open: 'ring-amber-500' },
  emerald: { tile: 'bg-emerald-50 ring-emerald-200/70', icon: 'text-emerald-600', num: 'text-emerald-700', bar: 'bg-emerald-500', open: 'ring-emerald-500' },
  // "rose" units use the pink scale so red stays reserved for mistakes.
  rose: { tile: 'bg-pink-50 ring-pink-200/70', icon: 'text-pink-600', num: 'text-pink-700', bar: 'bg-pink-500', open: 'ring-pink-500' },
  red: { tile: 'bg-red-50 ring-red-200/70', icon: 'text-red-600', num: 'text-red-700', bar: 'bg-red-500', open: 'ring-red-500' },
  teal: { tile: 'bg-teal-50 ring-teal-200/70', icon: 'text-teal-600', num: 'text-teal-700', bar: 'bg-teal-500', open: 'ring-teal-500' },
};

/** One icon per unit theme (both courses); unknown units fall back to a book. */
export const UNIT_ICON: Record<string, LucideIcon> = {
  u1: AudioLines,
  u2: Smile,
  u3: Compass,
  u4: Coffee,
  u5: ShoppingBag,
  u6: Bus,
  u7: HeartPulse,
  u8: MessageCircle,
  m1: AudioLines,
  m2: Smile,
  m3: Compass,
  m4: Coffee,
  m5: ShoppingBag,
  m6: Bus,
  m7: HeartPulse,
  m8: MessageCircle,
  e1: AudioLines,
  e2: Smile,
  e3: Coffee,
  e4: Compass,
  e5: ShoppingBag,
  e6: Plane,
  h0: BookA,
  h1: AudioLines,
  h2: Smile,
  h3: Coffee,
  h4: ShoppingBag,
  h5: Bus,
  h6: HeartPulse,
};
export const unitIcon = (id: string) => UNIT_ICON[id] ?? BookOpen;

/**
 * Fixed colors of a unit's certificate (a "paper" card, the same in light and dark mode and in the saved
 * picture): the light top band, a soft tint, its line, the medal, its core and ribbon, and the text.
 */
export interface CertColors {
  band: string;
  soft: string;
  line: string;
  medal: string;
  core: string;
  ribbon: string;
  text: string;
}

const cert = (band: string, soft: string, line: string, medal: string, core: string, ribbon: string, text: string): CertColors => ({ band, soft, line, medal, core, ribbon, text });

/** Tailwind's 50/100/200/500/700/800/900 shades of each unit color ("rose" units use pink, as on the map). */
export const CERT_COLOR: Record<UnitColor, CertColors> = {
  violet: cert('#f5f3ff', '#ede9fe', '#ddd6fe', '#8b5cf6', '#6d28d9', '#5b21b6', '#4c1d95'),
  orange: cert('#fff7ed', '#ffedd5', '#fed7aa', '#f97316', '#c2410c', '#9a3412', '#7c2d12'),
  sky: cert('#f0f9ff', '#e0f2fe', '#bae6fd', '#0ea5e9', '#0369a1', '#075985', '#0c4a6e'),
  amber: cert('#fffbeb', '#fef3c7', '#fde68a', '#f59e0b', '#b45309', '#92400e', '#78350f'),
  emerald: cert('#ecfdf5', '#d1fae5', '#a7f3d0', '#10b981', '#047857', '#065f46', '#064e3b'),
  rose: cert('#fdf2f8', '#fce7f3', '#fbcfe8', '#ec4899', '#be185d', '#9d174d', '#831843'),
  red: cert('#fef2f2', '#fee2e2', '#fecaca', '#ef4444', '#b91c1c', '#991b1b', '#7f1d1d'),
  teal: cert('#f0fdfa', '#ccfbf1', '#99f6e4', '#14b8a6', '#0f766e', '#115e59', '#134e4a'),
};
