'use client'

import { useEffect, useRef, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { MAX_GALLERY_PHOTOS, MAX_HOME_PHOTOS, MAX_REVIEWS, STUDIO_EMAIL } from '@/lib/supabase/config'

/** Kept on this device too, should saving it to the account fail. */
const SEEN_KEY = 'pencilsline-admin-guide'

/* Small drawings of the admin itself, so each step shows what to look for.
   Plain markup in the admin's own words, never screenshots that would age. */

function MockTabs() {
  return (
    <div className="guide-mock guide-mock--tabs" aria-hidden="true">
      {[
        ['Galerie', `25/${MAX_GALLERY_PHOTOS}`],
        ['Accueil', `12/${MAX_HOME_PHOTOS}`],
        ['Vidéos', '3'],
        ['Avis Google', `5/${MAX_REVIEWS}`],
      ].map(([label, count], i) => (
        <span key={label} className={`guide-mock__tab${i === 0 ? ' is-on' : ''}`}>
          {label} <small>{count}</small>
        </span>
      ))}
    </div>
  )
}

function MockUpload() {
  return (
    <div className="guide-mock" aria-hidden="true">
      <span className="guide-mock__drop">Touchez ici pour choisir une photo</span>
      <span className="guide-mock__label">Description (obligatoire)</span>
      <span className="guide-mock__field">Fleur au pinceau sur l’avant-bras</span>
      <span className="guide-mock__button">Publier la photo</span>
    </div>
  )
}

function MockRow({ actions }) {
  return (
    <div className="guide-mock guide-mock--row" aria-hidden="true">
      <span className="guide-mock__grip">
        1<i>⠿</i>
      </span>
      <span className="guide-mock__thumb" />
      <span className="guide-mock__text">Fleur au pinceau sur l’avant-bras</span>
      {actions}
    </div>
  )
}

function MockArrows() {
  return (
    <span className="guide-mock__arrows">
      <b>⤒</b>
      <b>↑</b>
      <b>↓</b>
      <b>⤓</b>
    </span>
  )
}

function MockCarousel() {
  return (
    <div className="guide-mock" aria-hidden="true">
      <span className="guide-mock__label">Dans le carrousel</span>
      <span className="guide-mock__line">
        <span className="guide-mock__thumb" /> Fleur au pinceau
        <span className="guide-mock__button guide-mock__button--light">Retirer</span>
      </span>
      <span className="guide-mock__label">Ajouter une photo de la galerie</span>
      <span className="guide-mock__line">
        <span className="guide-mock__thumb" /> Branche de cerisier
        <span className="guide-mock__button">Ajouter</span>
      </span>
    </div>
  )
}

function MockVideo() {
  return (
    <div className="guide-mock guide-mock--row" aria-hidden="true">
      <span className="guide-mock__grip">1</span>
      <span className="guide-mock__thumb guide-mock__thumb--video">▶</span>
      <span className="guide-mock__text">
        Tracé au pinceau
        <small className="guide-mock__badge">Affichée sur téléphone</small>
      </span>
    </div>
  )
}

function MockReview() {
  return (
    <div className="guide-mock" aria-hidden="true">
      <span className="guide-mock__line">
        <span className="guide-mock__avatar" />
        <span>
          Marine Vialle
          <em className="guide-mock__stars">★★★★★</em>
        </span>
      </span>
      <span className="guide-mock__field guide-mock__field--tall">
        Super expérience, Alexandra a su…
      </span>
      <span className="guide-mock__label">Nombre d’avis Google</span>
      <span className="guide-mock__field guide-mock__field--short">300</span>
    </div>
  )
}

function MockMail() {
  return (
    <div className="guide-mock guide-mock--mail" aria-hidden="true">
      <span className="guide-mock__subject">Demande de RDV — Marie</span>
      <span>
        <b>telephone</b> 06 12 34 56 78
      </span>
      <span>
        <b>projet</b> Un petit tatouage fin…
      </span>
      <span>
        <b>photos</b> <u>www.pencilsline-tattoo.fr/projet/…</u>
      </span>
    </div>
  )
}

const steps = (name) => [
  {
    title: name ? `Bienvenue, ${name} !` : 'Bienvenue !',
    body: (
      <>
        <p>
          Cet espace sert à changer votre site vous-même&nbsp;: vos photos, vos vidéos et vos
          avis Google.
        </p>
        <p>Chaque changement apparaît sur le site en quelques secondes.</p>
        <p>Ce petit guide vous montre tout en deux minutes.</p>
      </>
    ),
  },
  {
    title: 'Les quatre onglets',
    visual: <MockTabs />,
    body: (
      <>
        <p>En haut de la page, un onglet par partie du site. Touchez-en un pour l’ouvrir&nbsp;:</p>
        <ul>
          <li>
            <strong>Galerie</strong>&nbsp;: toutes vos photos, sur la page Réalisations.
          </li>
          <li>
            <strong>Accueil</strong>&nbsp;: les photos du carrousel de l’accueil.
          </li>
          <li>
            <strong>Vidéos</strong>&nbsp;: les vidéos de l’atelier.
          </li>
          <li>
            <strong>Avis Google</strong>&nbsp;: les avis affichés sur l’accueil.
          </li>
        </ul>
        <p>
          Le chiffre à côté dit combien vous en avez, et le maximum&nbsp;: 25/{MAX_GALLERY_PHOTOS},
          c’est 25 photos sur {MAX_GALLERY_PHOTOS} possibles.
        </p>
      </>
    ),
  },
  {
    title: 'Ajouter une photo',
    visual: <MockUpload />,
    body: (
      <ol>
        <li>
          Dans l’onglet <strong>Galerie</strong>, touchez le cadre pour choisir une photo.
        </li>
        <li>
          Écrivez une courte description&nbsp;: ce que montre le tatouage et où il est. Elle aide
          Google à trouver vos photos.
        </li>
        <li>
          Touchez <strong>« Publier la photo »</strong>. Elle s’ajoute à la fin de la galerie.
        </li>
      </ol>
    ),
  },
  {
    title: 'Changer l’ordre des photos',
    visual: <MockRow actions={<MockArrows />} />,
    body: (
      <>
        <p>La photo n°&nbsp;1 est la première que l’on voit sur le site.</p>
        <p>
          Pour déplacer une photo, <strong>appuyez sur son numéro</strong>, à gauche, et faites-la
          glisser vers le haut ou vers le bas.
        </p>
        <p>
          Ou utilisez les flèches&nbsp;: <strong>↑ ↓</strong> pour une place,{' '}
          <strong>⤒</strong> pour la mettre tout en haut, <strong>⤓</strong> tout en bas.
        </p>
      </>
    ),
  },
  {
    title: 'Modifier ou supprimer',
    visual: (
      <MockRow
        actions={
          <span className="guide-mock__arrows">
            <span className="guide-mock__button guide-mock__button--light">Modifier</span>
            <span className="guide-mock__button guide-mock__button--light">Supprimer</span>
          </span>
        }
      />
    ),
    body: (
      <>
        <p>
          <strong>« Modifier »</strong>, sous la description, la corrige.
        </p>
        <p>
          <strong>« Supprimer »</strong> retire la photo du site entier. Le site vous demande
          toujours de confirmer avant.
        </p>
      </>
    ),
  },
  {
    title: 'Le carrousel de l’accueil',
    visual: <MockCarousel />,
    body: (
      <>
        <p>
          En haut de l’accueil, un carrousel montre une sélection de vos photos,{' '}
          {MAX_HOME_PHOTOS} au maximum. Une nouvelle photo n’y va pas toute seule.
        </p>
        <p>
          Dans l’onglet <strong>Accueil</strong>&nbsp;: <strong>« Ajouter »</strong> met une photo
          de la galerie dans le carrousel, <strong>« Retirer »</strong> l’en sort. Elle reste
          quand même dans la galerie.
        </p>
      </>
    ),
  },
  {
    title: 'Les vidéos',
    visual: <MockVideo />,
    body: (
      <>
        <p>
          Dans l’onglet <strong>Vidéos</strong>, ajoutez une vidéo de l’atelier avec une courte
          description (MP4 de préférence, 50&nbsp;Mo au maximum).
        </p>
        <p>
          Sur téléphone, le site ne propose que <strong>la vidéo n°&nbsp;1</strong>&nbsp;: mettez
          la plus belle en premier avec les flèches.
        </p>
      </>
    ),
  },
  {
    title: 'Les avis Google',
    visual: <MockReview />,
    body: (
      <>
        <p>
          Dans l’onglet <strong>Avis Google</strong>, recopiez un avis reçu sur Google&nbsp;: le
          nom de la personne, son avis, et sa photo (touchez le rond pour la choisir).{' '}
          {MAX_REVIEWS} avis au maximum.
        </p>
        <p>
          Tout en bas, mettez à jour <strong>le nombre d’avis Google</strong>&nbsp;: il s’affiche
          à côté des étoiles, partout sur le site.
        </p>
      </>
    ),
  },
  {
    title: 'Les demandes de rendez-vous',
    visual: <MockMail />,
    body: (
      <>
        <p>
          Elles n’arrivent pas ici&nbsp;: elles arrivent <strong>par e-mail</strong>, sur{' '}
          {STUDIO_EMAIL}, avec le nom, le téléphone et le projet du client.
        </p>
        <p>
          S’il a joint des photos, touchez le lien <strong>« photos »</strong>&nbsp;: elles
          s’ouvrent toutes, en grand.
        </p>
        <p>Pensez à regarder vos spams de temps en temps.</p>
      </>
    ),
  },
  {
    title: 'C’est tout !',
    body: (
      <>
        <p>
          Prenez votre temps&nbsp;: seules les suppressions sont définitives, et le site demande
          toujours de confirmer avant.
        </p>
        <p>
          <strong>« Voir le site »</strong>, en haut, l’ouvre dans un nouvel onglet pour vérifier
          vos changements.
        </p>
        <p>
          Le bouton <strong>« Guide »</strong> rouvre ce tutoriel quand vous voulez.
        </p>
      </>
    ),
  },
]

/**
 * The admin's tutorial: opens by itself the first time an account signs in,
 * and again from the « Guide » button. Large type and large buttons, one
 * topic per step, each with a drawing of what to look for. Seen once, it is
 * remembered on the account (user_metadata.admin_guide_seen), so a second
 * device doesn't show it again, and on this device should that fail.
 *
 * A native modal <dialog>: focus stays inside, Escape closes it.
 */
export default function AdminGuide({ firstTime, name }) {
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)
  const pages = steps(name)
  const last = step === pages.length - 1

  useEffect(() => {
    let seenHere = false
    try {
      seenHere = Boolean(localStorage.getItem(SEEN_KEY))
    } catch {
      // Private mode or blocked storage: the account flag is enough.
    }
    if (firstTime && !seenHere) show()
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The page behind stays put while the guide is open.
  useEffect(() => {
    if (!open) return undefined
    const root = document.documentElement
    const before = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = before
    }
  }, [open])

  // Each step starts at its title, for the eye and for screen readers.
  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [step, open])

  function show() {
    setStep(0)
    setOpen(true)
    dialogRef.current?.showModal()
  }

  // Closing, by any way out, counts as seen.
  function onClose() {
    setOpen(false)
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      // See above.
    }
    if (firstTime) {
      createSupabaseBrowserClient()
        .auth.updateUser({ data: { admin_guide_seen: true } })
        .catch(() => {})
    }
  }

  const close = () => dialogRef.current?.close()

  return (
    <>
      <button type="button" className="guide-open" onClick={show}>
        <span aria-hidden="true">?</span>
        Guide
      </button>

      <dialog
        ref={dialogRef}
        className="guide"
        aria-labelledby="guide-title"
        onClose={onClose}
        // Lenis scrolls the page from JavaScript; let this scroll natively.
        data-lenis-prevent=""
      >
        <div className="guide__card">
          <div className="guide__top">
            <p className="guide__count">
              Étape {step + 1} sur {pages.length}
            </p>
            <button type="button" className="guide__close" onClick={close}>
              Fermer
              <span aria-hidden="true"> ✕</span>
            </button>
          </div>

          <div className="guide__step" key={step}>
            <h2 className="guide__title" id="guide-title" ref={titleRef} tabIndex={-1}>
              {pages[step].title}
            </h2>
            {pages[step].visual}
            <div className="guide__body">{pages[step].body}</div>
          </div>

          <div className="guide__dots" aria-hidden="true">
            {pages.map((page, i) => (
              <span key={page.title} className={i === step ? 'is-on' : undefined} />
            ))}
          </div>

          <div className="guide__nav">
            {step > 0 ? (
              <button
                type="button"
                className="guide__prev"
                onClick={() => setStep((s) => s - 1)}
              >
                ← Précédent
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="guide__next"
              onClick={() => (last ? close() : setStep((s) => s + 1))}
            >
              {last ? 'C’est parti !' : 'Suivant →'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
