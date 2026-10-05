import Link from 'next/link'
import LegalPage from '@/components/LegalPage'
import { LEGAL_MEDIATOR, LEGAL_NAME, LEGAL_SEAT, LEGAL_SIREN } from '@/lib/legal'
import { STUDIO_EMAIL, STUDIO_NAME } from '@/lib/supabase/config'

export const metadata = {
  title: `Conditions générales de vente — ${STUDIO_NAME}`,
  description: `Réservation, acompte, santé et contre-indications, soins : les conditions des tatouages réalisés par ${STUDIO_NAME} près de Montpellier.`,
}

const mail = <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>

/**
 * Her own rules come from her "Informations" and "Règlement des prestations"
 * sheets, as the FAQ does (components/Faq.jsx) — keep the two in step. The
 * acompte never carries an amount. The legal frame around them (minors,
 * hygiene, withdrawal, mediation) is the Code de la santé publique's and the
 * Code de la consommation's.
 */
const sections = [
  {
    id: 'objet',
    title: 'Objet',
    body: (
      <>
        <p>
          Ces conditions s’appliquent à tous les tatouages réalisés par {LEGAL_NAME},
          entrepreneur individuel (SIREN {LEGAL_SIREN}), sous le nom {STUDIO_NAME}, {LEGAL_SEAT}.
        </p>
        <p>
          Réserver un rendez-vous, en versant l’acompte, vaut acceptation de ces conditions. Les
          données que vous confiez sont traitées selon la{' '}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'age',
    title: 'Âge et identité',
    body: (
      <>
        <p>Une pièce d’identité peut vous être demandée avant toute séance.</p>
        <p>
          La loi interdit de tatouer une personne mineure sans le consentement écrit d’un
          titulaire de l’autorité parentale ou de son tuteur (article R1311-11 du Code de la
          santé publique). Cette autorisation, signée par le représentant légal, qui justifie de
          son identité et de son lien avec le mineur, est conservée trois ans. Alexandra reste
          libre de refuser un projet pour une personne mineure.
        </p>
      </>
    ),
  },
  {
    id: 'sante',
    title: 'Santé et contre-indications',
    body: (
      <>
        <p>
          Un tatouage fait pénétrer l’encre dans la peau&nbsp;: votre corps doit être en état de
          cicatriser. Pour votre sécurité, certaines situations l’excluent, d’autres demandent
          l’avis de votre médecin.
        </p>

        <h3 className="legal__h3">Alexandra ne tatoue pas</h3>
        <ul>
          <li>en cas de grossesse ou d’allaitement&nbsp;;</li>
          <li>les personnes porteuses d’un pacemaker&nbsp;;</li>
          <li>une personne sous l’emprise de l’alcool ou de drogues.</li>
        </ul>

        <h3 className="legal__h3">Avis médical avant de réserver</h3>
        <p>
          Les situations suivantes demandent l’accord de votre médecin. Alexandra peut vous
          demander une attestation, et reporter ou refuser la séance tant que le risque n’est
          pas écarté&nbsp;:
        </p>
        <ul>
          <li>diabète, surtout s’il est déséquilibré&nbsp;;</li>
          <li>
            trouble de la coagulation (hémophilie…) ou traitement qui fluidifie le sang
            (anticoagulant, antiagrégant)&nbsp;;
          </li>
          <li>maladie du cœur ou des valves cardiaques&nbsp;;</li>
          <li>
            immunité affaiblie&nbsp;: maladie ou traitement immunosuppresseur, chimiothérapie ou
            radiothérapie en cours&nbsp;;
          </li>
          <li>épilepsie&nbsp;;</li>
          <li>allergie connue (latex, métaux, pigments, désinfectants…)&nbsp;;</li>
          <li>maladie de peau (eczéma, psoriasis…) ou tendance aux cicatrices chéloïdes&nbsp;;</li>
          <li>traitement de l’acné par isotrétinoïne, en cours ou récent&nbsp;;</li>
          <li>opération récente, ou cicatrice de moins d’un an sur la zone.</li>
        </ul>

        <h3 className="legal__h3">La séance est reportée</h3>
        <p>
          si, le jour du rendez-vous, vous avez de la fièvre ou une infection, ou si la zone à
          tatouer présente une plaie, un coup de soleil, une irritation ou une poussée de maladie
          de peau.
        </p>

        <h3 className="legal__h3">Ce qui vous est demandé</h3>
        <p>
          Signalez toute maladie, tout traitement et toute allergie avant de réserver, et
          confirmez-le le jour de la séance. Ces informations restent confidentielles. Si une
          contre-indication apparaît après la réservation, le rendez-vous est reporté et l’acompte
          reste valable pour la nouvelle date. Une information de santé tue ou inexacte engage
          votre seule responsabilité.
        </p>
        <p className="legal__note">
          Ces règles ne remplacent pas l’avis d’un médecin&nbsp;: en cas de doute, consultez-le
          avant de réserver.
        </p>
      </>
    ),
  },
  {
    id: 'style',
    title: 'Ce qu’Alexandra réalise',
    body: (
      <>
        <p>
          Alexandra dessine dans son style&nbsp;: tatouage graphique, fineline, brush et abstrait,
          souvent d’inspiration japonaise, dans l’esprit de l’encre de Chine, avec une attention
          particulière au travail de la ligne. Elle réalise des petits, moyens et plus gros
          projets. Pour une demande simple (cœur, phrase, symbole…), elle peut réaliser ce que
          vous souhaitez.
        </p>
        <p>
          Ses flashs sont en exemplaire unique&nbsp;: une création, une personne. Un flash peut
          être adapté à votre idée.
        </p>
        <p>
          Avant de lui écrire, regardez bien ses{' '}
          <Link href="/portfolio">réalisations</Link>&nbsp;: c’est le meilleur moyen de savoir si
          votre projet lui correspond.
        </p>
      </>
    ),
  },
  {
    id: 'refus',
    title: 'Ce qu’elle peut refuser ou adapter',
    body: (
      <>
        <p>Alexandra ne réalise pas&nbsp;:</p>
        <ul>
          <li>de réalisme&nbsp;;</li>
          <li>
            de copie&nbsp;: le tatouage d’un autre artiste ou une image trouvée en ligne ne sont
            pas reproduits. Une inspiration reste une base de travail&nbsp;;
          </li>
          <li>de motif raciste, haineux, discriminatoire ou contraire à la loi.</li>
        </ul>
        <p>Elle peut aussi refuser ou adapter un projet pour un motif légitime, notamment&nbsp;:</p>
        <ul>
          <li>s’il ne correspond pas à son style&nbsp;;</li>
          <li>
            si le motif est trop petit ou trop chargé pour bien vieillir&nbsp;: avec les années,
            l’encre s’étale légèrement sous la peau, et des lignes trop serrées finissent par se
            rejoindre. Elle vous propose alors de l’agrandir, de le simplifier ou de le placer
            ailleurs&nbsp;;
          </li>
          <li>si la zone ou l’état de la peau ne s’y prête pas&nbsp;;</li>
          <li>
            s’il s’agit de recouvrir ou de reprendre un tatouage existant, ce qu’elle étudie sur
            photo, au cas par cas.
          </li>
        </ul>
        <p>
          Elle ne tatoue pas par-dessus un grain de beauté, qui doit rester visible pour la
          surveillance de votre peau&nbsp;: le dessin le contourne.
        </p>
      </>
    ),
  },
  {
    id: 'tarifs',
    title: 'Devis et tarifs',
    body: (
      <>
        <p>
          Chaque pièce est unique, son tarif aussi. Il dépend du temps de travail, du niveau de
          détail et de la symbolique du dessin&nbsp;; sur un projet plus travaillé, le travail
          artistique est pris en compte. La zone, la taille, la peau ou la complexité du motif
          peuvent le faire évoluer.
        </p>
        <p>
          Le prix vous est donné sur devis, à partir de votre demande, en euros. Sur un projet en
          plusieurs séances, le tarif est horaire, et la séance commence dès la pose du stencil.
          Un changement demandé après le devis (taille, détails, emplacement) peut en modifier le
          prix.
        </p>
      </>
    ),
  },
  {
    id: 'acompte',
    title: 'Réservation et acompte',
    body: (
      <>
        <p>
          Sans acompte, aucun rendez-vous n’est fixé. L’acompte bloque votre date&nbsp;; son
          montant vous est indiqué au moment de la réservation.
        </p>
        <p>
          Il est déduit du prix le jour du tatouage, ou à la fin de la dernière séance pour un
          projet en plusieurs fois. Il n’est pas remboursable, mais en cas d’empêchement, prévenez
          Alexandra à l’avance&nbsp;: elle décale votre rendez-vous (voir{' '}
          <a href="#report">Report, annulation et retard</a>).
        </p>
      </>
    ),
  },
  {
    id: 'dessin',
    title: 'Le dessin',
    body: (
      <p>
        Alexandra dessine votre pièce quelques jours avant le rendez-vous, et seulement une fois
        la date réservée&nbsp;: aucun dessin n’est réalisé sans réservation. Elle vous l’envoie
        dès qu’il est terminé&nbsp;; faites-lui votre retour pour qu’elle apporte les
        modifications nécessaires. Les modifications importantes ne se font pas le jour du
        rendez-vous.
      </p>
    ),
  },
  {
    id: 'report',
    title: 'Report, annulation et retard',
    body: (
      <ul>
        <li>
          <strong>Empêchement</strong>&nbsp;: prévenez Alexandra le plus tôt possible. Prévenue à
          l’avance, elle reste compréhensive et décale votre rendez-vous&nbsp;; l’acompte est
          reporté sur la nouvelle date.
        </li>
        <li>
          <strong>Annulation</strong>&nbsp;: si vous renoncez à votre projet, l’acompte n’est pas
          remboursé.
        </li>
        <li>
          <strong>Absence sans prévenir</strong>&nbsp;: le rendez-vous est perdu, et l’acompte
          avec lui.
        </li>
        <li>
          <strong>Retard</strong>&nbsp;: prévenez dès que possible. Selon le planning de la
          journée, la séance peut être raccourcie, le projet simplifié ou le rendez-vous décalé.
        </li>
        <li>
          <strong>Empêchement d’Alexandra</strong> (maladie, cas de force majeure)&nbsp;: elle vous
          prévient au plus vite et vous propose une nouvelle date. L’acompte est conservé pour
          celle-ci, ou remboursé si aucune date ne vous convient.
        </li>
      </ul>
    ),
  },
  {
    id: 'paiement',
    title: 'Paiement',
    body: (
      <p>
        Le prix est réglé à la fin de la séance, acompte déduit. Pour un projet en plusieurs
        séances, chaque séance est réglée à sa fin, et l’acompte est déduit à la dernière.
        Paiement par virement instantané ou en espèces. Alexandra ne fait pas de crédit.
      </p>
    ),
  },
  {
    id: 'seance',
    title: 'Le jour de la séance',
    body: (
      <>
        <p>Pour que tout se passe bien&nbsp;:</p>
        <ul>
          <li>venez reposé(e), après avoir mangé, sans avoir bu d’alcool la veille ni le jour même&nbsp;;</li>
          <li>
            n’exposez pas la zone au soleil les jours qui précèdent, et gardez votre peau
            hydratée&nbsp;;
          </li>
          <li>
            évitez l’aspirine et les anti-inflammatoires dans les 48&nbsp;heures avant, qui
            favorisent les saignements, sauf s’ils vous sont prescrits&nbsp;: n’arrêtez jamais un
            traitement sans l’avis de votre médecin&nbsp;;
          </li>
          <li>portez une tenue qui laisse la zone facilement accessible.</li>
        </ul>
        <p>
          Alexandra travaille dans le respect des règles d’hygiène et de salubrité du Code de la
          santé publique (articles R1311-1 et suivants)&nbsp;: aiguilles stériles à usage unique,
          encres conformes à la réglementation européenne. Avant la séance, vous êtes informé(e)
          des risques du tatouage&nbsp;; à la fin, vous recevez les consignes de soins à suivre
          (article R1311-12).
        </p>
      </>
    ),
  },
  {
    id: 'soins',
    title: 'Cicatrisation et soins',
    body: (
      <>
        <p>
          La cicatrisation prend en général trois à quatre semaines. Jusqu’à ce qu’elle soit
          complète&nbsp;:
        </p>
        <ul>
          <li>suivez les consignes de soins remises par Alexandra&nbsp;;</li>
          <li>pas de bain, de piscine, de mer, de sauna ni de hammam&nbsp;;</li>
          <li>pas de soleil, ni d’UV en cabine&nbsp;;</li>
          <li>ne grattez pas et n’arrachez pas les petites croûtes.</li>
        </ul>
        <p>
          Le rendu final dépend aussi de votre peau, de votre organisme et du respect de ces
          soins. Si une retouche est nécessaire après cicatrisation, contactez Alexandra, qui
          vous en indiquera les conditions. Rougeur qui s’étend, chaleur, douleur qui augmente ou
          fièvre&nbsp;: consultez un médecin sans attendre.
        </p>
        <p>
          Un tatouage est permanent. Le retirer au laser est long, coûteux et pas toujours
          complet&nbsp;: prenez le temps d’être sûr(e) de votre projet.
        </p>
      </>
    ),
  },
  {
    id: 'image',
    title: 'Droits sur le dessin et photos',
    body: (
      <>
        <p>
          Les dessins d’Alexandra, flashs compris, sont des œuvres protégées par le droit
          d’auteur. Le tatouage vous appartient, mais pas les droits sur le dessin&nbsp;: il ne
          peut être reproduit, par vous ou par un autre tatoueur, ni exploité commercialement sans
          son accord.
        </p>
        <p>
          Alexandra peut photographier ou filmer votre tatouage terminé. Ces images ne sont
          publiées (site, réseaux sociaux) qu’avec votre accord, et sans votre visage sauf si
          vous le souhaitez. Vous pouvez retirer cet accord à tout moment.
        </p>
      </>
    ),
  },
  {
    id: 'retractation',
    title: 'Droit de rétractation',
    body: (
      <>
        <p>
          Lorsque le rendez-vous est réservé à distance (par message ou par e-mail), vous disposez
          en principe de 14&nbsp;jours pour vous rétracter à compter de la réservation (article
          L221-18 du Code de la consommation).
        </p>
        <p>
          En demandant que votre dessin soit réalisé ou que votre séance ait lieu avant la fin de
          ce délai, vous demandez expressément que la prestation commence avant son terme. Si vous
          vous rétractez ensuite, vous restez redevable de la part déjà réalisée, comme le dessin
          (article L221-25)&nbsp;; une fois le tatouage réalisé, la rétractation n’est plus
          possible (article L221-28). Une réservation faite au salon n’ouvre pas de droit de
          rétractation.
        </p>
      </>
    ),
  },
  {
    id: 'responsabilite',
    title: 'Responsabilité',
    body: (
      <>
        <p>
          Alexandra met tout en œuvre pour réaliser votre tatouage dans les meilleures conditions
          de sécurité et de qualité. Le tatouage comporte toutefois des risques qui lui sont
          propres (réaction allergique, infection, cicatrisation irrégulière), dont vous êtes
          informé(e) avant la séance.
        </p>
        <p>
          Sa responsabilité ne peut être engagée pour une complication due à une information de
          santé omise ou inexacte, au non-respect des consignes de soins ou à une exposition au
          soleil pendant la cicatrisation.
        </p>
        <p>
          Elle peut interrompre une séance si votre santé l’exige (malaise, réaction de la
          peau…)&nbsp;: la suite est reportée. Elle peut aussi refuser ou interrompre une séance
          en cas de comportement irrespectueux ou agressif&nbsp;; l’acompte reste alors acquis.
        </p>
      </>
    ),
  },
  {
    id: 'litiges',
    title: 'Réclamations et litiges',
    body: (
      <>
        <p>
          Une question, une réclamation&nbsp;? Écrivez à {mail}&nbsp;: Alexandra cherchera avec
          vous une solution amiable.
        </p>
        <p>
          À défaut, vous pouvez recourir gratuitement à un médiateur de la consommation (articles
          L611-1 et suivants du Code de la consommation)
          {LEGAL_MEDIATOR ? (
            <>
              &nbsp;:{' '}
              <a href={LEGAL_MEDIATOR.url} target="_blank" rel="noreferrer">
                {LEGAL_MEDIATOR.name}
              </a>
              .
            </>
          ) : (
            '.'
          )}
        </p>
        <p>
          Ces conditions sont soumises au droit français. Faute d’accord amiable, le litige relève
          des tribunaux compétents selon les règles de droit commun.
        </p>
      </>
    ),
  },
]

export default function CgvPage() {
  return (
    <LegalPage
      href="/cgv"
      title="Conditions générales de"
      word="vente"
      lead={'Les règles de chaque tatouage, de la réservation aux soins\u00a0: ce que vous pouvez attendre d’Alexandra, et ce qu’elle attend de vous.'}
      sections={sections}
      seed={320}
    />
  )
}
