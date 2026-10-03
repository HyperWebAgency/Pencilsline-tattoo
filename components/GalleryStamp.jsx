'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SealStamp from './SealStamp';
import { useGalleryTransition } from './TransitionProvider';

const GALLERY = '/portfolio';

/**
 * A seal-stamp link to the gallery that plays the polaroid deal on the way,
 * like the navbar's « Réalisations ». A modified click (new tab) or no
 * provider falls through to the plain link, so href stays the real target.
 */
export default function GalleryStamp({ children = 'Voir les réalisations', seed = 27 }) {
  const router = useRouter();
  const transition = useGalleryTransition();

  useEffect(() => {
    router.prefetch(GALLERY);
  }, [router]);

  const onClick = (event) => {
    if (!transition || transition.active) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    transition.start({ href: GALLERY });
  };

  return (
    <SealStamp href={GALLERY} seed={seed} onClick={onClick}>
      {children}
    </SealStamp>
  );
}
