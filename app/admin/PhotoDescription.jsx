'use client'

import { useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { descriptionOf, validateDescription } from '@/lib/photoDescription'

/**
 * A gallery photo's description, editable in place after upload. Shows the
 * text with « Modifier »; that opens a field with « Enregistrer » and
 * « Annuler » (Entrée and Échap do the same from a keyboard).
 *
 * Saving sends PATCH /api/photos, which rewrites the alt text from the new
 * description. The file keeps its name, so the image URL never changes.
 *
 * - `onSaved(photo)` gets the updated row (id, storage_path, alt_text,
 *   description, display_order, show_on_home, home_order) to merge into the
 *   list.
 * - `onEditingChange(editing)`, optional: lets the list pause dragging while
 *   the field is open.
 * - `disabled`, optional: greys out « Modifier » while the row is busy.
 */
export default function PhotoDescription({ photo, onSaved, onEditingChange, disabled = false }) {
  const id = useId()
  const fieldRef = useRef(null)
  const editRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const current = descriptionOf(photo)

  function open() {
    // flushSync renders the field now, so focus() lands within the tap
    // itself: iOS only raises the keyboard for focus given during a gesture.
    flushSync(() => {
      setDraft(current)
      setError('')
      setEditing(true)
    })
    const field = fieldRef.current
    if (field) {
      field.focus()
      field.setSelectionRange(field.value.length, field.value.length)
    }
    onEditingChange?.(true)
  }

  function close() {
    flushSync(() => {
      setEditing(false)
      setError('')
    })
    editRef.current?.focus()
    onEditingChange?.(false)
  }

  async function save(event) {
    event?.preventDefault()
    if (pending) return

    const { description, error: invalid } = validateDescription(draft)
    if (invalid) {
      setError(invalid)
      fieldRef.current?.focus()
      return
    }
    // Nothing changed: no request, no revalidation.
    if (description === current) {
      close()
      return
    }

    setPending(true)
    setError('')

    let payload
    try {
      const res = await fetch('/api/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id, description }),
      })
      payload = await res.json().catch(() => ({}))
      if (!res.ok || !payload.photo) {
        setError(
          res.status === 401
            ? 'Session expirée. Rechargez la page pour vous reconnecter.'
            : payload.error || "Échec de l'enregistrement."
        )
        fieldRef.current?.focus()
        return
      }
    } catch {
      setError('Connexion interrompue. Réessayez.')
      fieldRef.current?.focus()
      return
    } finally {
      setPending(false)
    }

    onSaved?.(payload.photo)
    close()
  }

  function onFieldKeyDown(event) {
    // Not mid-composition (accents, predictive text): that Enter picks a word.
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      save()
    }
  }

  function onFormKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (!pending) close()
    }
    // Typing here is not for the list (keyboard reordering and the like).
    event.stopPropagation()
  }

  if (!editing) {
    return (
      <div className="photo-desc">
        <p id={`${id}-text`} className="photo-desc__text">
          {current || <span className="photo-desc__empty">Aucune description</span>}
        </p>
        <button
          ref={editRef}
          type="button"
          className="photo-desc__edit"
          onClick={open}
          disabled={disabled}
          aria-label="Modifier la description"
          aria-describedby={`${id}-text`}
        >
          Modifier
        </button>
      </div>
    )
  }

  return (
    <form
      className="photo-desc photo-desc--editing"
      onSubmit={save}
      onKeyDown={onFormKeyDown}
      // A press in the field must not start dragging the row.
      onPointerDown={(event) => event.stopPropagation()}
      aria-label="Modifier la description"
      aria-busy={pending}
      noValidate
    >
      <label htmlFor={`${id}-field`} className="photo-desc__label">
        Description
      </label>
      <textarea
        ref={fieldRef}
        id={`${id}-field`}
        value={draft}
        // Alt text is one line: a pasted line break becomes a space.
        onChange={(event) => setDraft(event.target.value.replace(/[\r\n]+/g, ' '))}
        onKeyDown={onFieldKeyDown}
        readOnly={pending}
        rows={3}
        enterKeyHint="done"
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-hint ${id}-error` : `${id}-hint`}
      />
      <p id={`${id}-hint`} className="photo-desc__hint">
        Le nom du studio et la ville sont ajoutés automatiquement.
      </p>

      {error ? (
        <p id={`${id}-error`} className="upload__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="photo-desc__actions">
        <button type="submit" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button type="button" className="photo-desc__cancel" onClick={close} disabled={pending}>
          Annuler
        </button>
      </div>
    </form>
  )
}
