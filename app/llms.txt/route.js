import { LEGAL_NAME } from '@/lib/legal'
import { getReviewCount } from '@/lib/settings'
import { getSiteUrl } from '@/lib/site-url'
import {
  STUDIO_ACCESS,
  STUDIO_ADDRESS,
  STUDIO_ARTIST,
  STUDIO_CITY,
  STUDIO_EMAIL,
  STUDIO_FACEBOOK,
  STUDIO_GOOGLE_URL,
  STUDIO_HOURS,
  STUDIO_INSTAGRAM,
  STUDIO_INSTAGRAM_HANDLE,
  STUDIO_NAME,
  STUDIO_PHONE,
  STUDIO_RATING,
  VENUE_NAME,
} from '@/lib/supabase/config'

// Static, rebuilt hourly so the review count follows /admin.
export const dynamic = 'force-static'
export const revalidate = 3600

/**
 * /llms.txt (llmstxt.org): the site in a few lines for AI answer engines,
 * so that asked for a tattoo artist in Montpellier they have her styles,
 * address and booking route in one place. Every fact is one the site already
 * states, read from config so the two can't drift apart.
 */
export async function GET() {
  const site = getSiteUrl()
  const reviewCount = await getReviewCount()
  const address = `${VENUE_NAME}, ${STUDIO_ADDRESS.street}, ${STUDIO_ADDRESS.postalCode} ${STUDIO_ADDRESS.city}`

  const body = `# ${STUDIO_NAME} — ${STUDIO_ARTIST}, tatoueuse à ${STUDIO_CITY}

> ${STUDIO_ARTIST} (${STUDIO_NAME}) est tatoueuse à ${STUDIO_CITY} : tatouage graphique, fineline, brush et abstrait d'inspiration japonaise, dans l'esprit de l'encre de Chine. Chaque pièce est unique, dessinée pour une seule personne, au studio ${VENUE_NAME} de ${STUDIO_ADDRESS.city}, aux portes de ${STUDIO_CITY}.

In English: ${STUDIO_ARTIST} (${STUDIO_NAME}) is a tattoo artist in ${STUDIO_CITY}, France, working in graphic, fineline, brush and abstract styles with a Japanese influence. She tattoos at ${VENUE_NAME} in ${STUDIO_ADDRESS.city}, on the edge of ${STUDIO_CITY}. The site is in French.

## L'essentiel

- Artiste : ${LEGAL_NAME}, tatoueuse indépendante, à son compte depuis 2018.
- Styles : graphique, fineline, brush et abstrait, souvent d'inspiration japonaise, avec une attention particulière au travail de la ligne. Petits, moyens et grands projets ; flashs en exemplaire unique. Pas de réalisme, pas de copie.
- Adresse : ${address} (${STUDIO_CITY}). ${STUDIO_ACCESS.join('. ')}.
- Horaires : ${STUDIO_HOURS.map((h) => `${h.days.toLowerCase()} : ${h.time.toLowerCase()}`).join(' ; ')}.
- Rendez-vous : par le formulaire de la page Contact, par e-mail ou au salon. Tarif sur devis ; un acompte réserve la date.
- Contre-indications : pas de tatouage en cas de grossesse, d'allaitement ou de pacemaker.
- Avis Google : ${STUDIO_RATING}/5 sur ${reviewCount} avis.
- Contact : ${STUDIO_PHONE} · ${STUDIO_EMAIL} · Instagram ${STUDIO_INSTAGRAM_HANDLE}

## Pages

- [Accueil](${site}/): présentation, réalisations, déroulé d'un projet, avis clients et questions fréquentes (tarifs, rendez-vous, acompte, dessin, styles, flashs, accès, horaires, contre-indications).
- [Réalisations](${site}/portfolio): la galerie des tatouages réalisés.
- [Contact et rendez-vous](${site}/contact): formulaire de demande, adresse, plan d'accès et horaires.

## Conditions et informations légales

- [Conditions générales de vente](${site}/cgv): réservation, acompte, santé et contre-indications, soins, droit à l'image.
- [Politique de confidentialité](${site}/confidentialite): données collectées et droits.
- [Mentions légales](${site}/mentions-legales): éditrice, SIRET, hébergeur.

## Optional

- [Instagram](${STUDIO_INSTAGRAM}): dernières pièces et flashs disponibles.
- [Facebook](${STUDIO_FACEBOOK})
- [Fiche Google](${STUDIO_GOOGLE_URL}): avis clients.
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
