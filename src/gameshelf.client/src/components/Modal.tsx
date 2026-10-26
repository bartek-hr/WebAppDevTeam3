import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { XIcon } from './icons'

interface ModalProps {
  title: ReactNode
  onClose: () => void
  // Zet de inhoud in <div className="modal__body"> en de knoppen in <div className="modal__footer">
  children: ReactNode
}

/**
 * Dialoogvenster met het <dialog>-element van HTML. De browser regelt de donkere achtergrond,
 * houdt de focus in het venster en zet de rest van de pagina op slot.
 * Sluiten kan met het kruisje, met Escape en door naast het venster te klikken.
 *
 * Wil je de focus bij het openen in een bepaald veld? Geef dat veld data-autofocus
 * (autoFocus van React werkt niet, omdat het venster dan nog dicht is).
 */
export default function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Alleen sluiten als de klik ook náást het venster begon (niet bij tekst selecteren en loslaten)
  const pressedOutside = useRef(false)
  const titleId = useId()
  // Het element dat de focus had vóór het openen (meestal de knop die het venster opende)
  const [opener] = useState(() => document.activeElement)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) {
      // jsdom (de tests) kent showModal() niet; daar is het venster gewoon open
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    // Na het sluiten de focus teruggeven, zodat toetsenbordgebruikers verder kunnen waar ze waren
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [opener])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: React bepaalt of het venster dicht gaat (het verdwijnt via onClose)
        event.preventDefault()
        onClose()
      }}
      // Als de browser het venster toch zelf sluit (bijv. twee keer Escape), ook de state bijwerken
      onClose={onClose}
      onPointerDown={(event) => {
        pressedOutside.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (pressedOutside.current && event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal__content">
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button type="button" className="close-btn" aria-label="Sluiten" onClick={onClose}>
            <XIcon />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
