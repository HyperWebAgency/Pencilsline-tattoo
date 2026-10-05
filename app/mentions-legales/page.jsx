import Link from 'next/link'
import LegalPage from '@/components/LegalPage'
import {
  HOST,
  LEGAL_APE,
  LEGAL_NAME,
  LEGAL_SEAT,
  LEGAL_SIREN,
  LEGAL_SIRET,
  LEGAL_STATUS,
} from '@/lib/legal'
import {
  STUDIO_EMAIL,
  STUDIO_FACEBOOK,
  STUDIO_INSTAGRAM,
  STUDIO_NAME,
  STUDIO_PHONE,
  STUDIO_PHONE_E164,
} from '@/lib/supabase/config'

export const metadata = {
  title: `Mentions légales — ${STUDIO_NAME}`,
  description: `Éditrice, hébergeur et propriété intellectuelle du site ${STUDIO_NAME}, tatoueuse à Montpellier.`,
  alternates: { canonical: '/mentions-legales' },
}

const sections = [
  {
    id: 'editrice',
    title: 'Éditrice du site',
    body: (
      <>
        <p>Ce site est édité par&nbsp;:</p>
        <dl className="legal__facts">
          <div>
            <dt>Nom</dt>
            <dd>{LEGAL_NAME}</dd>
          </div>
          <div>
            <dt>Statut</dt>
            <dd>{LEGAL_STATUS}</dd>
          </div>
          <div>
            <dt>Nom d’exercice</dt>
            <dd>{STUDIO_NAME}</dd>
          </div>
          <div>
            <dt>Adresse</dt>
            <dd>{LEGAL_SEAT}</dd>
          </div>
          <div>
            <dt>SIREN</dt>
            <dd>{LEGAL_SIREN}</dd>
          </div>
          <div>
            <dt>SIRET</dt>
            <dd>{LEGAL_SIRET}</dd>
          </div>
          <div>
            <dt>Code APE</dt>
            <dd>{LEGAL_APE}</dd>
          </div>
          <div>
            <dt>Téléphone</dt>
            <dd>
              <a href={`tel:${STUDIO_PHONE_E164}`}>{STUDIO_PHONE}</a>
            </dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>
              <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>
            </dd>
          </div>
        </dl>
        <p>Directrice de la publication&nbsp;: {LEGAL_NAME}.</p>
      </>
    ),
  },
  {
    id: 'hebergement',
    title: 'Hébergement',
    body: (
      <>
        <p>
          Le site est hébergé par {HOST.name}, {HOST.address}{' '}
          (<a href={HOST.url} target="_blank" rel="noreferrer">vercel.com</a>).
        </p>
        <p>
          Les photos, les vidéos et les images envoyées avec le formulaire de contact sont
          stockées par Supabase Inc. (
          <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>), sur
          des serveurs situés en Irlande, dans l’Union européenne.
        </p>
      </>
    ),
  },
  {
    id: 'propriete',
    title: 'Propriété intellectuelle',
    body: (
      <>
        <p>
          Les dessins, les photographies de tatouages, les vidéos, les textes, le logo et le
          sceau Pencilsline présentés sur ce site sont la propriété de {LEGAL_NAME}, sauf
          mention contraire. Ils sont protégés par le Code de la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, adaptation ou diffusion, totale ou partielle,
          sans son autorisation écrite préalable est interdite (article L122-4) et constitue
          une contrefaçon (articles L335-2 et suivants).
        </p>
        <p>
          C’est aussi vrai sur la peau&nbsp;: un dessin ou un flash publié ici est une œuvre
          originale. Le faire reproduire par un autre tatoueur, à l’identique ou presque, sans
          l’accord de son autrice, est une contrefaçon.
        </p>
      </>
    ),
  },
  {
    id: 'liens',
    title: 'Liens vers d’autres sites',
    body: (
      <p>
        Le site renvoie vers les pages <a href={STUDIO_INSTAGRAM} target="_blank" rel="noreferrer">Instagram</a>,{' '}
        <a href={STUDIO_FACEBOOK} target="_blank" rel="noreferrer">Facebook</a> et Google de{' '}
        {STUDIO_NAME}. Ces sites ont leurs propres conditions et leur propre politique de
        données, dont {LEGAL_NAME} n’est pas responsable.
      </p>
    ),
  },
  {
    id: 'informations',
    title: 'Informations du site',
    body: (
      <p>
        Les informations publiées ici (styles, horaires, conditions) sont tenues à jour avec
        soin, mais peuvent évoluer. Pour un projet, le devis et les{' '}
        <Link href="/cgv">conditions générales de vente</Link> font foi.
      </p>
    ),
  },
  {
    id: 'donnees',
    title: 'Données personnelles',
    body: (
      <p>
        Ce que le site collecte, pourquoi, et comment exercer vos droits&nbsp;: tout est
        détaillé dans la <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    ),
  },
  {
    id: 'droit',
    title: 'Droit applicable',
    body: <p>Ce site et ces mentions sont soumis au droit français.</p>,
  },
]

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      href="/mentions-legales"
      title="Mentions"
      word="légales"
      lead="Qui édite ce site, qui l’héberge, et à qui appartiennent les dessins qu’il montre."
      sections={sections}
      seed={200}
    />
  )
}
