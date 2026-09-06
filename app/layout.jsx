import { Cormorant_Garamond, Inter, Roboto_Slab } from 'next/font/google';
import localFont from 'next/font/local';
import Navbar from '@/components/Navbar';
import SmoothScroll from '@/components/SmoothScroll';
import TransitionProvider from '@/components/TransitionProvider';
import { getTransitionDeck } from '@/lib/photos';
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

export const metadata = {
  title: 'Pencilsline — Tatouage graphique à Montpellier',
  description:
    "Tatouage graphique, brush, abstrait et fineline à Montpellier — l'esprit de l'encre de Chine, une influence japonaise.",
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
        </TransitionProvider>
      </body>
    </html>
  );
}
