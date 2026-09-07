import CursorTrail from '@/components/CursorTrail';
import GoogleRating from '@/components/GoogleRating';
import HeroBranches from '@/components/HeroBranches';
import InkStroke from '@/components/InkStroke';
import PencilslineLogo from '@/components/PencilslineLogo';
import PortfolioCarousel from '@/components/PortfolioCarousel';
import SealStamp from '@/components/SealStamp';
import { BUCKET } from '@/lib/supabase/config';
import { createSupabasePublicClient } from '@/lib/supabase/server';

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

/** Portfolio photos, managed by Alexandra from /admin — never hardcoded here. */
async function getPhotos() {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from('photos')
    .select('storage_path, alt_text')
    .order('display_order', { ascending: true })
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
  const photos = await getPhotos();

  return (
    <main>
      <section className="hero">
        <HeroBranches />

        {/* The mark is a vertical hanko, so it reads as a hanging shop banner
            in the corner rather than as a bar-style logo. */}
        <div className="hero__mark">
          <PencilslineLogo />
        </div>

        <div className="hero__content">
          <GoogleRating variant="hero" />

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

          <p className="hero__sub">
            Tatouage graphique, brush, abstrait et fineline — l&apos;esprit de
            l&apos;encre de Chine, une influence japonaise.
          </p>

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
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-stroke">
            <InkStroke vertical length={46} thickness={2.6} seed={23} />
          </span>
          <span className="hero__scroll-label">défiler</span>
        </div>
      </section>

      <PortfolioCarousel images={photos} />

      <CursorTrail />
    </main>
  );
}
