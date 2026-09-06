'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGalleryTransition } from './TransitionProvider';

/**
 * « Voir toutes les réalisations » — délègue la pluie de polaroids et
 * l'ouverture en portes à TransitionProvider (dans le layout, pour survivre au
 * changement de route). Sans provider, le clic navigue simplement.
 */
export default function GalleryTransition({
  images = [],
  href = '/portfolio',
  label = 'Voir toutes les réalisations',
}) {
  const router = useRouter();
  const transition = useGalleryTransition();

  // Précharge la galerie pour que l'arrivée derrière les portes soit prête.
  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  const onClick = () => {
    if (transition) transition.start({ images, href });
    else router.push(href);
  };

  return (
    <button
      type="button"
      className="pf__all"
      onClick={onClick}
      disabled={Boolean(transition?.active)}
    >
      {label}
    </button>
  );
}
