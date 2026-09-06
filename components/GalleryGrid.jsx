'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import Lightbox from './Lightbox';

/**
 * Masonry gallery (CSS columns) with a shared lightbox.
 *
 * Aspect ratios come from the stored width/height, so the columns lay out
 * without shift before the images arrive.
 */
export default function GalleryGrid({ photos = [] }) {
  const [open, setOpen] = useState(null); // index or null
  const openerRef = useRef(null);

  const close = () => {
    setOpen(null);
    openerRef.current?.focus();
  };

  return (
    <>
      <ul className="gal">
        {photos.map((photo, i) => (
          <li key={photo.id} className="gal__item">
            <button
              type="button"
              className="gal__open"
              aria-label={`Agrandir : ${photo.alt}`}
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setOpen(i);
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width ?? 1200}
                height={photo.height ?? 1600}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 30vw"
                priority={i < 3}
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <Lightbox photos={photos} index={open} onClose={close} onIndexChange={setOpen} />
      )}
    </>
  );
}
