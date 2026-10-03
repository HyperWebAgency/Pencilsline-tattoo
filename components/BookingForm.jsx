'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SealStamp from './SealStamp';
import { SEND_AS_IS_BYTES, shrinkPhoto } from '@/lib/shrinkPhoto';
import {
  ALLOWED_MIME,
  INSPIRATION_MAX_EDGE,
  MAX_INSPIRATIONS,
  MAX_ORIGINAL_BYTES,
} from '@/lib/supabase/config';

const EMPTY = { name: '', email: '', phone: '', project: '', placement: '', size_cm: '' };

const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

/** True for a drag that carries files, not a dragged link or bit of text. */
const carriesFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files');

/**
 * Booking request form. Submits straight to Formspree, which emails the artist —
 * no database, no inbox to maintain. Set NEXT_PUBLIC_FORMSPREE_ENDPOINT to the
 * form URL (https://formspree.io/f/xxxxxxxx).
 *
 * Inspiration images go first to /api/inspirations, one request each, and the
 * email carries their links: Formspree only takes attachments on paid plans.
 * They are shrunk here beforehand, as a phone photo is often past what a
 * Vercel function accepts.
 */
export default function BookingForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [state, setState] = useState({ status: 'idle', error: null });
  const [images, setImages] = useState([]); // { id, name, file, preview }
  const [preparing, setPreparing] = useState(0); // images still being shrunk
  const [step, setStep] = useState(''); // what the button says while sending
  const [dragging, setDragging] = useState(false); // files over the images field
  const inputRef = useRef(null);

  // An image dropped just beside the field would otherwise open in the tab and
  // throw away everything typed so far. The field's own drop still works.
  useEffect(() => {
    const ignore = (e) => carriesFiles(e) && e.preventDefault();
    window.addEventListener('dragover', ignore);
    window.addEventListener('drop', ignore);
    return () => {
      window.removeEventListener('dragover', ignore);
      window.removeEventListener('drop', ignore);
    };
  }, []);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const addImages = async (list) => {
    const picked = Array.from(list || []);
    if (inputRef.current) inputRef.current.value = '';
    if (!picked.length) return;

    let error = null;
    const usable = picked.filter((file) => {
      if (!ALLOWED_MIME.includes(file.type)) {
        error = `« ${file.name} » : format non supporté (JPG, PNG ou WebP).`;
        return false;
      }
      if (file.size > MAX_ORIGINAL_BYTES) {
        error = `« ${file.name} » : image trop lourde (30\u00a0Mo maximum).`;
        return false;
      }
      return true;
    });
    const room = MAX_INSPIRATIONS - images.length - preparing;
    if (usable.length > room) error = `${MAX_INSPIRATIONS} images maximum.`;
    const batch = usable.slice(0, Math.max(0, room));
    setState({ status: error ? 'error' : 'idle', error });
    if (!batch.length) return;

    setPreparing((n) => n + batch.length);
    const ready = await Promise.all(
      batch.map(async (file, i) => {
        const id = `${Date.now()}-${i}`;
        try {
          const small = await shrinkPhoto(file, INSPIRATION_MAX_EDGE);
          return { id, name: file.name, file: small.file, preview: URL.createObjectURL(small.file) };
        } catch {
          // This browser can't read it, but the server may.
          return file.size <= SEND_AS_IS_BYTES ? { id, name: file.name, file, preview: '' } : null;
        }
      })
    );
    setPreparing((n) => n - batch.length);

    if (ready.includes(null)) {
      setState({ status: 'error', error: "Une image n'a pas pu être lue. Essayez avec une autre." });
    }
    setImages((current) => [...current, ...ready.filter(Boolean)].slice(0, MAX_INSPIRATIONS));
  };

  const removeImage = (id) => {
    // A limit or reading message is about the images; it goes with them.
    setState((current) => (current.status === 'error' ? { status: 'idle', error: null } : current));
    setImages((current) =>
      current.filter((image) => {
        if (image.id === id && image.preview) URL.revokeObjectURL(image.preview);
        return image.id !== id;
      })
    );
  };

  /** Stores each image and returns its link, or null with the error shown. */
  const uploadImages = async () => {
    const urls = [];
    for (const [i, image] of images.entries()) {
      setStep(`Envoi des images (${i + 1}/${images.length})…`);
      const body = new FormData();
      body.append('photo', image.file);
      const res = await fetch('/api/inspirations', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setState({
          status: 'error',
          error:
            data.error ||
            "Envoi des images impossible. Réessayez, ou retirez-les pour envoyer votre demande sans.",
        });
        return null;
      }
      urls.push(data.url);
    }
    return urls;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!ENDPOINT) {
      setState({
        status: 'error',
        error: "Le formulaire n'est pas encore configuré. Écrivez-moi directement par e-mail.",
      });
      return;
    }

    // Validated here because Formspree accepts whatever it is given.
    if (!values.name.trim()) {
      setState({ status: 'error', error: 'Votre nom est requis.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setState({ status: 'error', error: 'Adresse e-mail invalide.' });
      return;
    }
    if (values.project.trim().length < 10) {
      setState({ status: 'error', error: 'Merci de décrire votre projet en quelques mots.' });
      return;
    }

    setState({ status: 'sending', error: null });

    // Uncontrolled honeypot, read straight off the form.
    const gotcha = e.target.elements._gotcha?.value || '';

    try {
      // A bot that filled the honeypot gets nothing stored.
      const urls = gotcha ? [] : await uploadImages();
      if (!urls) return;
      setStep('');

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          nom: values.name.trim(),
          email: values.email.trim(),
          telephone: values.phone.trim(),
          emplacement: values.placement.trim(),
          taille: values.size_cm.trim(),
          projet: values.project.trim(),
          // One link per line; each opens the image.
          images: urls.length ? urls.join('\n') : undefined,
          _gotcha: gotcha,
          // Shown as the email subject in the artist's inbox.
          _subject: `Demande de RDV — ${values.name.trim()}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = Array.isArray(data.errors) && data.errors[0]?.message;
        setState({ status: 'error', error: detail || 'Envoi impossible pour le moment.' });
        return;
      }
      images.forEach((image) => image.preview && URL.revokeObjectURL(image.preview));
      // Off to the thank-you page. The form stays disabled meanwhile, so a
      // second click can't send the request twice.
      setState({ status: 'sent', error: null });
      router.push('/merci');
    } catch {
      setState({ status: 'error', error: 'Vérifiez votre connexion et réessayez.' });
    } finally {
      setStep('');
    }
  };

  const busy = state.status === 'sending' || state.status === 'sent';

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {/* Formspree honeypot: bots fill it, humans never see it. */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <div className="form__row">
        <label className="field">
          <span className="field__label">Nom *</span>
          <input
            className="field__input"
            value={values.name}
            onChange={set('name')}
            required
            maxLength={120}
            autoComplete="name"
          />
        </label>

        <label className="field">
          <span className="field__label">E-mail *</span>
          <input
            className="field__input"
            type="email"
            value={values.email}
            onChange={set('email')}
            required
            maxLength={200}
            autoComplete="email"
          />
        </label>
      </div>

      <div className="form__row">
        <label className="field">
          <span className="field__label">Téléphone</span>
          <input
            className="field__input"
            type="tel"
            value={values.phone}
            onChange={set('phone')}
            maxLength={40}
            autoComplete="tel"
          />
        </label>

        <label className="field">
          <span className="field__label">Emplacement</span>
          <input
            className="field__input"
            value={values.placement}
            onChange={set('placement')}
            maxLength={120}
            placeholder="avant-bras, dos…"
          />
        </label>

        <label className="field">
          <span className="field__label">Taille</span>
          <input
            className="field__input"
            value={values.size_cm}
            onChange={set('size_cm')}
            maxLength={60}
            placeholder="15 cm"
          />
        </label>
      </div>

      <label className="field">
        <span className="field__label">Votre projet *</span>
        <textarea
          className="field__input field__input--area"
          value={values.project}
          onChange={set('project')}
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          placeholder="Décrivez votre idée, le style souhaité, vos disponibilités…"
        />
        <span className="field__hint">{values.project.length}/4000</span>
      </label>

      {/* Also takes images dragged in from the desktop or another window. */}
      <div
        className={`field form__drop${dragging ? ' is-dragging' : ''}`}
        onDragEnter={(e) => {
          if (!carriesFiles(e) || busy) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          if (!carriesFiles(e) || busy) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDragLeave={(e) => {
          // Moving between the tiles inside fires this too; only leaving counts.
          if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
        }}
        onDrop={(e) => {
          if (!carriesFiles(e)) return;
          e.preventDefault();
          setDragging(false);
          if (!busy) addImages(e.dataTransfer.files);
        }}
      >
        <span className="field__label" id="inspirations-label">
          Images d&apos;inspiration
        </span>
        <div className="form__files" role="group" aria-labelledby="inspirations-label">
          {images.map((image) => (
            <div className="form__file" key={image.id}>
              {image.preview ? (
                // A local preview: plain img is right here.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.preview} alt="" />
              ) : (
                <span className="form__file-name">{image.name}</span>
              )}
              <button
                type="button"
                className="form__file-remove"
                onClick={() => removeImage(image.id)}
                disabled={busy}
                aria-label={`Retirer l’image ${image.name}`}
              >
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: preparing }, (_, i) => (
            <div className="form__file form__file--loading" key={`loading-${i}`} aria-hidden="true">
              …
            </div>
          ))}
          {images.length + preparing < MAX_INSPIRATIONS && (
            <label className="form__file-add">
              <input
                ref={inputRef}
                className="form__file-input"
                type="file"
                accept={ALLOWED_MIME.join(',')}
                multiple
                disabled={busy}
                onChange={(e) => addImages(e.target.files)}
              />
              <span aria-hidden="true">+</span>
              Ajouter
            </label>
          )}
        </div>
        <span className="form__files-hint">
          {dragging ? (
            'Déposez vos images ici.'
          ) : preparing ? (
            'Préparation des images…'
          ) : (
            <>
              Une inspiration, un croquis, l’emplacement… Jusqu’à {MAX_INSPIRATIONS} images
              (JPG, PNG ou WebP), facultatif.
              <span className="form__drop-tip"> Glissez-les ici ou utilisez «&nbsp;Ajouter&nbsp;».</span>
            </>
          )}
        </span>
      </div>

      {state.error && (
        <p className="form__error" role="alert">
          {state.error}
        </p>
      )}

      <div className="form__actions">
        <SealStamp as="button" type="submit" seed={13} disabled={busy || preparing > 0}>
          {busy ? step || 'Envoi…' : 'Envoyer la demande'}
        </SealStamp>
        <span className="form__note">* champs obligatoires</span>
      </div>
    </form>
  );
}
