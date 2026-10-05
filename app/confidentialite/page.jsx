import Link from 'next/link'
import LegalPage from '@/components/LegalPage'
import { HOST, LEGAL_NAME, LEGAL_SEAT } from '@/lib/legal'
import { MAX_INSPIRATIONS, STUDIO_EMAIL, STUDIO_NAME } from '@/lib/supabase/config'

export const metadata = {
  title: `Politique de confidentialité — ${STUDIO_NAME}`,
  description: `Les données collectées par le site ${STUDIO_NAME}, leur usage, leur durée de conservation et vos droits.`,
  alternates: { canonical: '/confidentialite' },
}

const mail = <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>

const sections = [
  {
    id: 'responsable',
    title: 'Qui est responsable de vos données',
    body: (
      <p>
        {LEGAL_NAME}, entrepreneur individuel exerçant sous le nom {STUDIO_NAME}, {LEGAL_SEAT}.
        Pour toute question sur vos données&nbsp;: {mail}.
      </p>
    ),
  },
  {
    id: 'collecte',
    title: 'Ce que le site collecte',
    body: (
      <>
        <p>
          Le site ne collecte que ce que vous choisissez d’envoyer par le formulaire de la page{' '}
          <Link href="/contact">Contact</Link>&nbsp;:
        </p>
        <ul>
          <li>
            votre nom, votre adresse e-mail, votre téléphone et la description de votre projet
            (obligatoires)&nbsp;;
          </li>
          <li>l’emplacement et la taille souhaités (facultatifs)&nbsp;;</li>
          <li>
            jusqu’à {MAX_INSPIRATIONS} images d’inspiration (facultatives). Avant d’être
            enregistrées, elles sont converties et vidées de leurs métadonnées, position GPS
            comprise.
          </li>
        </ul>
        <p>
          Merci de ne pas y joindre d’informations sur votre santé&nbsp;: elles se partagent de
          vive voix, au salon (voir plus bas).
        </p>
        <p>
          Le site ne mesure pas votre navigation&nbsp;: pas d’outil de statistiques, pas de
          publicité, pas de pixel de réseau social.
        </p>
      </>
    ),
  },
  {
    id: 'finalites',
    title: 'À quoi elles servent',
    body: (
      <ul>
        <li>
          <strong>Répondre à votre demande, établir un devis et préparer votre rendez-vous</strong>{' '}
          — démarches préalables au contrat que vous sollicitez (article 6.1.b du RGPD).
        </li>
        <li>
          <strong>Gérer vos rendez-vous, l’acompte et le paiement</strong> — exécution du contrat,
          et obligations comptables (article 6.1.c).
        </li>
        <li>
          <strong>Faire fonctionner et protéger le site</strong> — intérêt légitime (article 6.1.f).
        </li>
      </ul>
    ),
  },
  {
    id: 'sante',
    title: 'Au salon\u00a0: santé et consentement',
    body: (
      <>
        <p>
          Avant une séance, Alexandra vous pose quelques questions sur votre santé
          (traitements, allergies, contre-indications&nbsp;: voir les{' '}
          <Link href="/cgv#sante">conditions générales</Link>), et peut vous faire remplir une
          fiche de renseignements et de consentement. Ces informations ne servent qu’à vérifier
          que le tatouage peut se faire sans risque pour vous. Vous les donnez avec votre accord
          exprès (article 9.2.a du RGPD).
        </p>
        <p>
          Elles restent au salon, ne sont consultées que par Alexandra et ne sont jamais
          transmises à qui que ce soit, sauf obligation légale.
        </p>
      </>
    ),
  },
  {
    id: 'destinataires',
    title: 'Qui les reçoit',
    body: (
      <>
        <p>
          Vos données ne sont ni vendues, ni louées, ni cédées. Seule Alexandra les lit. Pour
          les acheminer et les stocker, le site s’appuie sur quelques prestataires&nbsp;:
        </p>
        <ul>
          <li>
            <strong>Formspree, Inc.</strong> (États-Unis), qui transmet le formulaire par e-mail&nbsp;;
          </li>
          <li>
            <strong>Google</strong>, qui héberge la messagerie Gmail où arrivent les demandes&nbsp;;
          </li>
          <li>
            <strong>Supabase, Inc.</strong>, qui stocke les images d’inspiration sur des serveurs
            situés en Irlande&nbsp;;
          </li>
          <li>
            <strong>{HOST.name}</strong> (États-Unis), qui héberge le site.
          </li>
        </ul>
        <p>
          Certains de ces prestataires sont établis aux États-Unis. Ces transferts hors de
          l’Union européenne sont encadrés par les garanties prévues par le RGPD&nbsp;: le Data
          Privacy Framework UE–États-Unis pour les entreprises qui y adhèrent, ou les clauses
          contractuelles types de la Commission européenne.
        </p>
      </>
    ),
  },
  {
    id: 'conservation',
    title: 'Combien de temps',
    body: (
      <ul>
        <li>
          <strong>Demande restée sans suite</strong>&nbsp;: 3&nbsp;ans après notre dernier échange,
          images d’inspiration comprises.
        </li>
        <li>
          <strong>Client(e)</strong>&nbsp;: le temps de votre projet, puis 3&nbsp;ans après votre
          dernière séance.
        </li>
        <li>
          <strong>Fiche de santé et de consentement</strong>&nbsp;: 3&nbsp;ans après la dernière
          séance, la durée que la loi impose pour l’autorisation parentale d’un mineur (article
          R1311-11 du Code de la santé publique).
        </li>
        <li>
          <strong>Factures et pièces comptables</strong>&nbsp;: 10&nbsp;ans, comme l’exige le Code
          de commerce (article L123-22).
        </li>
        <li>
          <strong>Journaux techniques de l’hébergeur</strong> (adresse IP, navigateur, pages
          demandées)&nbsp;: une durée courte, fixée par l’hébergeur pour la sécurité du site.
        </li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies et stockage',
    body: (
      <>
        <p>
          Le site ne dépose aucun cookie de mesure d’audience ni de publicité, c’est pourquoi il
          ne vous demande pas votre accord.
        </p>
        <p>
          Sur un appareil qui peine à afficher les animations, il note dans votre navigateur
          (stockage local) la date à laquelle il est passé en version allégée, pour la garder
          deux semaines. Ce n’est qu’une date&nbsp;: rien qui vous identifie, et rien qui quitte
          votre appareil.
        </p>
        <p>
          La page Contact affiche une carte Google Maps. Quand elle se charge, Google reçoit
          votre adresse IP et peut déposer ses propres cookies, selon sa{' '}
          <a href="https://policies.google.com/privacy?hl=fr" target="_blank" rel="noreferrer">
            politique de confidentialité
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'images',
    title: 'Photos de tatouages et avis',
    body: (
      <>
        <p>
          Une photo de votre tatouage n’est publiée (sur ce site, Instagram ou Facebook)
          qu’avec votre accord, et sans votre visage sauf si vous le souhaitez. Vous pouvez
          retirer cet accord à tout moment&nbsp;: la photo est alors retirée.
        </p>
        <p>
          Les avis affichés sur la page d’accueil sont repris, avec le nom et la photo de
          profil de leur auteur, de la fiche Google où ils ont été publiés. Si l’un d’eux est
          le vôtre et que vous préférez qu’il n’apparaisse pas ici, écrivez à {mail}&nbsp;: il
          sera retiré.
        </p>
      </>
    ),
  },
  {
    id: 'securite',
    title: 'Sécurité',
    body: (
      <p>
        Le site est servi en HTTPS. Les images envoyées par le formulaire reçoivent un nom
        aléatoire et ne sont accessibles que par le lien transmis dans l’e-mail de demande.
        L’espace d’administration est réservé à Alexandra et protégé par mot de passe.
      </p>
    ),
  },
  {
    id: 'droits',
    title: 'Vos droits',
    body: (
      <>
        <p>
          Vous pouvez à tout moment accéder à vos données, les faire rectifier ou effacer,
          limiter leur usage, vous y opposer, les récupérer dans un format lisible (portabilité),
          retirer votre consentement, et donner des directives sur leur sort après votre décès.
        </p>
        <p>
          Il suffit d’écrire à {mail}. Une réponse vous est apportée sous un mois au plus.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL&nbsp;:{' '}
          <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer">
            cnil.fr
          </a>
          , 3&nbsp;place de Fontenoy, TSA&nbsp;80715, 75334&nbsp;Paris Cedex&nbsp;07.
        </p>
      </>
    ),
  },
  {
    id: 'modifications',
    title: 'Mises à jour',
    body: (
      <p>
        Cette politique peut évoluer avec le site. La date de sa dernière mise à jour figure en
        haut de cette page.
      </p>
    ),
  },
]

export default function ConfidentialitePage() {
  return (
    <LegalPage
      href="/confidentialite"
      title="Politique de"
      word="confidentialité"
      lead={'Le site collecte peu de choses\u00a0: ce que vous envoyez pour demander un rendez-vous. Voici lesquelles, pourquoi, et ce que vous pouvez en faire.'}
      sections={sections}
      seed={260}
    />
  )
}
