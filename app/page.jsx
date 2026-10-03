import Image from 'next/image';
import CursorTrail from '@/components/CursorTrail';
import Faq from '@/components/Faq';
import GoogleRating from '@/components/GoogleRating';
import GoogleReviews from '@/components/GoogleReviews';
import HeroBranches from '@/components/HeroBranches';
import HeroVideo from '@/components/HeroVideo';
import InkStroke from '@/components/InkStroke';
import PencilslineLogo from '@/components/PencilslineLogo';
import PortfolioCarousel from '@/components/PortfolioCarousel';
import ProcessSteps from '@/components/ProcessSteps';
import SealStamp from '@/components/SealStamp';
import VideoTrio from '@/components/VideoTrio';
import { BUCKET, STUDIO_ARTIST, STUDIO_NAME } from '@/lib/supabase/config';
import { createSupabasePublicClient } from '@/lib/supabase/server';
import { getVideos } from '@/lib/videos';

// Same strategy as /portfolio: static HTML rebuilt hourly, and the upload route
// revalidates on demand so a new photo shows up within seconds.
export const revalidate = 3600;

/** A few flecks thrown off the headline's final stroke. */
function Splatter() {
  return (
    <svg className="hero__splat" viewBox="0 0 54 40" aria-hidden="true" focusable="false">
      <circle cx="8" cy="26" r="2.1" fill="#171514" fillOpacity="0.72" />
      <circle cx="24" cy="12" r="1.1" fill="#171514" fillOpacity="0.55" />
      <circle cx="40" cy="31" r="0.8" fill="#171514" fillOpacity="0.5" />
    </svg>
  );
}

/**
 * Photos for the home carousel, managed by Alexandra from /admin — never
 * hardcoded here.
 *
 * The carousel is its own selection of the gallery's photos (show_on_home, up
 * to 12) in its own order (home_order), both set in /admin. A photo left out
 * of it still shows in the portfolio grid and in the polaroid deal.
 */
async function getPhotos() {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from('photos')
    .select('storage_path, alt_text')
    .eq('show_on_home', true)
    .order('home_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load réalisations:', error.message);
    return [];
  }

  return (data ?? []).map((photo) => ({
    src: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${photo.storage_path}`,
    alt: photo.alt_text,
  }));
}

export default async function Page() {
  const [photos, videos] = await Promise.all([getPhotos(), getVideos()]);

  return (
    <main>
      <section className="hero">
        <HeroBranches />

        {/* The photo and, on a phone, the play button laid over it. Without a
            box of its own above a phone (display: contents), so the photo
            still positions itself against the hero there. */}
        <div className="hero__figure">
          {/* Alexandra at work, standing on the hero's bottom edge, the client's
              arm running off the right. Beside the text on a landscape screen,
              under it on an upright tablet and on a phone (see .hero__photo). */}
          <Image
            className="hero__photo"
            src="/hero/tatoueuse-fineline-montpellier-alexandra-en-seance.webp"
            alt="Alexandra, tatoueuse fineline et brush à Montpellier, en train de tatouer l'avant-bras d'un client chez Pencilsline Tattoo"
            width={1243}
            height={1266}
            sizes="(max-width: 640px) 100vw, (max-aspect-ratio: 4/5) 80vw, (min-width: 960px) 60vw, 1vw"
            loading="eager"
            fetchPriority="high"
          />

          {/* Phone only: the video row is not shown there; this opens its
              first clip instead. */}
          {videos[0] ? <HeroVideo video={videos[0]} /> : null}
        </div>

        {/* The mark is a vertical hanko, so it reads as a hanging shop banner
            in the corner rather than as a bar-style logo. */}
        <div className="hero__mark">
          <PencilslineLogo />
        </div>

        <div className="hero__content">
          <p className="hero__kicker">
            {STUDIO_ARTIST} — {STUDIO_NAME}
          </p>

          <h1 className="hero__title">
            Tatoueuse à{' '}
            <span className="hero__word">
              Montpellier
              <span className="hero__underline" aria-hidden="true">
                <InkStroke length={430} thickness={7} seed={41} rough={2.6} />
              </span>
              <Splatter />
            </span>
          </h1>

          {/* An h2, not a <p>: it carries "tatouage" and "Montpellier" for search. */}
          <h2 className="hero__sub">
            Tatouage à Montpellier, fineline, graphique, brush et abstrait.
            L&apos;esprit de l&apos;encre de Chine, avec une influence japonaise.
          </h2>

          <div className="hero__actions">
            <SealStamp href="/contact" seed={5}>
              Prendre rendez-vous
            </SealStamp>
            <a className="brush-link" href="#realisations">
              Voir les réalisations
              <span className="brush-link__dash" aria-hidden="true">
                <InkStroke length={120} thickness={2.8} seed={44} color="#b31b1b" />
              </span>
            </a>
          </div>

          <GoogleRating variant="hero" faces />
        </div>
      </section>

      <VideoTrio videos={videos} />

      <PortfolioCarousel images={photos} />

      <GoogleReviews />

      <ProcessSteps />

      <Faq />

      <CursorTrail />
    </main>
  );
}
