import type { ReactNode } from 'react'
import './AuthCard.css'

interface AuthCardProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

// Gedeelde opmaak voor inloggen en registreren (zonder navbar)
export default function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="auth-card">
      <p className="auth-card__brand">GameShelf</p>
      <div className="card">
        <div className="card__body auth-card__body">
          <h1 className="auth-card__title">{title}</h1>
          {children}
        </div>
      </div>
      {footer && <p className="auth-card__footer">{footer}</p>}
    </div>
  )
}
