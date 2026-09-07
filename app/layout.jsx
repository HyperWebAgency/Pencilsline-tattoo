import { Cormorant_Garamond, Inter, Roboto_Slab } from 'next/font/google';
import localFont from 'next/font/local';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import SmoothScroll from '@/components/SmoothScroll';
import TransitionProvider from '@/components/TransitionProvider';
import { getTransitionDeck } from '@/lib/photos';
import { getSiteUrl } from '@/lib/site-url';
import { STUDIO_NAME } from '@/lib/supabase/config';
import './globals.css';

// Fineline = the type: a light high-contrast serif for display, a quiet
// grotesque for the small tracked labels. The brush lives in the drawn strokes.
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// The seal letters in the official logo. A slab serif at 600 — measured against
// the artist's reference, which is lighter than a display slab like Alfa Slab
// One can reach even when eroded (see PencilslineLogo).
const sealFace = Roboto_Slab({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-seal',
  display: 'swap',
});

// DejaVu Sans — matplotlib's default face, requested for the contact intro
// card. Self-hosted from app/fonts (the DejaVu licence permits redistribution
// and web embedding; see DejaVu-LICENSE.txt).
const introFace = localFont({
  src: [
    { path: './fonts/DejaVuSans.ttf', weight: '400', style: 'normal' },
    { path: './fonts/DejaVuSans-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-intro',
  display: 'swap',
});

const TITLE = 'Pencilsline — Tatouage graphique à Montpellier';
const DESCRIPTION =
  "Tatouage graphique, brush, abstrait et fineline à Montpellier — l'esprit de l'encre de Chine, une influence japonaise.";

export const metadata = {
  // Required for the share card: og:image must be an absolute URL, and this is
  // what Next resolves the generated path against. It must be the host actually
  // serving this build, or the crawler fetches the image from the wrong site.
  metadataBase: new URL(getSiteUrl()),
  title: TITLE,
  description: DESCRIPTION,
  // title/description are deliberately omitted here: set explicitly, every page
  // would inherit the home page's, and sharing /contact would show the wrong
  // headline. Left out, Next derives them from each page's own metadata.
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: STUDIO_NAME,
    url: '/',
  },
  // No twitter-image file: X, Slack, Discord and WhatsApp all fall back to
  // og:image, so one file serves every platform.
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({ children }) {
  // Fetched here, not on the page, so the navbar's Réalisations link can deal
  // the same cards from any route.
  const deck = await getTransitionDeck();

  return (
    <html
      lang="fr"
      className={`${serif.variable} ${sans.variable} ${sealFace.variable} ${introFace.variable}`}
    >
      <body>
        <SmoothScroll />
        <TransitionProvider photos={deck}>
          <Navbar />
          {children}
          <Footer />
        </TransitionProvider>
      </body>
    </html>
  );
}
