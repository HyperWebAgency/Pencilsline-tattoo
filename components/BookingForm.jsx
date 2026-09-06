'use client';

import { useState } from 'react';
import SealStamp from './SealStamp';

const EMPTY = { name: '', email: '', phone: '', project: '', placement: '', size_cm: '' };

const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

/**
 * Booking request form. Submits straight to Formspree, which emails the artist —
 * no database, no inbox to maintain. Set NEXT_PUBLIC_FORMSPREE_ENDPOINT to the
 * form URL (https://formspree.io/f/xxxxxxxx).
 */
export default function BookingForm() {
  const [values, setValues] = useState(EMPTY);
  const [state, setState] = useState({ status: 'idle', error: null });

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

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

    try {
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
          // Uncontrolled honeypot, read straight off the form.
          _gotcha: e.target.elements._gotcha?.value || '',
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
      setValues(EMPTY);
      setState({ status: 'sent', error: null });
    } catch {
      setState({ status: 'error', error: 'Vérifiez votre connexion et réessayez.' });
    }
  };

  if (state.status === 'sent') {
    return (
      <div className="form__done" role="status">
        <p className="form__done-title">Demande envoyée.</p>
        <p className="form__done-text">
          Merci — je reviens vers vous par e-mail, généralement sous quelques jours.
        </p>
        <button type="button" className="form__again" onClick={() => setState({ status: 'idle', error: null })}>
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  const busy = state.status === 'sending';

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

      {state.error && (
        <p className="form__error" role="alert">
          {state.error}
        </p>
      )}

      <div className="form__actions">
        <SealStamp as="button" type="submit" seed={13} disabled={busy}>
          {busy ? 'Envoi…' : 'Envoyer la demande'}
        </SealStamp>
        <span className="form__note">* champs obligatoires</span>
      </div>
    </form>
  );
}
