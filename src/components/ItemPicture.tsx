import { useState } from 'react';
import { pictureOf, pictureUrl } from '../data/pictures';

interface Props {
  itemId: string;
  /** Size classes of the image (it keeps its square shape). */
  className?: string;
  /** Empty when the meaning is written next to the picture; the meaning when the picture stands alone. */
  alt?: string;
}

/**
 * An item's 3D picture (data/pictures), or nothing when the item has none or the file cannot load
 * (offline before it was ever shown).
 */
export function ItemPicture({ itemId, className = 'size-24', alt = '' }: Props) {
  const name = pictureOf(itemId);
  const [failed, setFailed] = useState(false);
  if (!name || failed) return null;
  return (
    <img
      src={pictureUrl(name)}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={256}
      height={256}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-contain select-none ${className}`}
      data-testid="item-picture"
    />
  );
}
