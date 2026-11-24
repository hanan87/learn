import { BookOpen, Bus, CarTaxiFront, Cat, Coffee, CookingPot, Flame, Hourglass, MapPin, MessageCircle, Phone, Soup, Ticket, Umbrella, Waves, Wine, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  // Polish
  'kawa-dla-kota': Coffee,
  'pierogi-babci': CookingPot,
  'gdzie-jest-bilet': Ticket,
  parasol: Umbrella,
  // English
  'coffee-for-tim': Coffee,
  'right-behind-you': MapPin,
  'a-little-spicy': Flame,
  'how-are-you': MessageCircle,
  // Hebrew
  'more-hummus': Soup,
  'shabbat-bus': Bus,
  'mom-calling': Phone,
  'tel-aviv-taxi': CarTaxiFront,
  // Montenegrin
  polako: Hourglass,
  'hladno-more': Waves,
  'rakija-za-dorucak': Wine,
  'macke-u-kotoru': Cat,
};

/** Line icon for a mini story (one icon family across the app – no emoji). */
export function StoryIcon({ id, className = 'size-5' }: { id: string; className?: string }) {
  const Icon = ICONS[id] ?? BookOpen;
  return <Icon className={className} aria-hidden />;
}
