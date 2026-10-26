import type { ReactNode } from 'react'
import { XIcon } from './icons'

export type AlertVariant = 'danger' | 'warning' | 'info' | 'success' | 'neutral'

interface AlertProps {
  variant: AlertVariant
  children: ReactNode
  // Toont een kruisje om de melding te sluiten
  onClose?: () => void
  className?: string
}

// Melding in een gekleurd vak. Fouten en waarschuwingen leest een schermlezer meteen voor
// (role="alert"), de rest (bijv. "nog leeg") rustig (role="status").
export default function Alert({ variant, children, onClose, className }: AlertProps) {
  const urgent = variant === 'danger' || variant === 'warning'
  const classes = ['alert', `alert--${variant}`, onClose && 'alert--dismissible', className]
  return (
    <div role={urgent ? 'alert' : 'status'} className={classes.filter(Boolean).join(' ')}>
      {children}
      {onClose && (
        <button
          type="button"
          className="close-btn alert__close"
          aria-label="Sluiten"
          onClick={onClose}
        >
          <XIcon />
        </button>
      )}
    </div>
  )
}
